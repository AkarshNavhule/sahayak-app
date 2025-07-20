import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { randomUUID } from 'crypto';
import { geminiClient } from '../../../lib/gemini';
import { qdrantClient } from '../../../lib/qdrant';

function chunkText(text, maxChars = 5000) {
  const chunks = [];
  for (let start = 0; start < text.length; start += maxChars) {
    chunks.push(text.slice(start, Math.min(start + maxChars, text.length)));
  }
  return chunks;
}

export async function POST(request) {
  try {
    // 1. Parse form data and extract file
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const name = file.name.toLowerCase().replace(/\.[^.]+$/, '');
    const type = file.type;

    console.log(`Processing file: ${file.name}, type: ${type}`);

    // 2. Extract text based on file type
    let text;
    if (type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (
      type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    ) {
      const { value } = await mammoth.extractRawText({ buffer });
      text = value;
    } else if (type.startsWith('text/') || file.name.endsWith('.txt')) {
      text = buffer.toString('utf-8');
    } else {
      return NextResponse.json({ error: 'Unsupported file type.' }, { status: 415 });
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'No text could be extracted from file.' }, { status: 400 });
    }

    console.log(`Extracted text length: ${text.length} characters`);

    // 3. Split text into chunks first
    const chunks = chunkText(text);
    console.log(`Created ${chunks.length} chunks`);

    // 4. Generate embeddings using the Gemini GenAI SDK
    const points = [];
    for (let i = 0; i < chunks.length; i++) {
      try {
        console.log(`Processing chunk ${i + 1}/${chunks.length}`);
        
        // Try different possible method signatures for Gemini embedding
        let embedRes;
        if (typeof geminiClient.embedContent === 'function') {
          embedRes = await geminiClient.embedContent({
            model: 'models/embedding-001',
            content: chunks[i],
          });
        } else if (typeof geminiClient.getGenerativeModel === 'function') {
          // Using the @google/generative-ai SDK approach
          const model = geminiClient.getGenerativeModel({ model: 'embedding-001' });
          embedRes = await model.embedContent(chunks[i]);
        } else if (geminiClient.models && typeof geminiClient.models.embedContent === 'function') {
          // Alternative structure
          embedRes = await geminiClient.models.embedContent({
            model: 'models/embedding-001',
            content: chunks[i],
          });
        } else {
          // Debug what methods are available
          console.log('Available geminiClient methods:', Object.getOwnPropertyNames(geminiClient));
          if (geminiClient.models) {
            console.log('Available geminiClient.models methods:', Object.getOwnPropertyNames(geminiClient.models));
          }
          throw new Error('Could not find appropriate embedding method on geminiClient');
        }
        
        // Handle different response structures
        let vector;
        if (embedRes.embedding && embedRes.embedding.values) {
          vector = embedRes.embedding.values;
        } else if (embedRes.embeddings && embedRes.embeddings[0] && embedRes.embeddings[0].values) {
          vector = embedRes.embeddings[0].values;
        } else if (Array.isArray(embedRes)) {
          vector = embedRes;
        } else {
          console.error('Unexpected embedding response structure:', embedRes);
          throw new Error('Could not extract embedding vector from response');
        }

        if (!vector || !Array.isArray(vector)) {
          throw new Error('Invalid embedding vector received');
        }

        // Validate vector contains only numbers
        const validVector = vector.every(v => typeof v === 'number' && !isNaN(v));
        if (!validVector) {
          throw new Error('Vector contains invalid values (non-numeric or NaN)');
        }

        points.push({
          id: randomUUID(), // Generate a proper UUID for Qdrant
          vector: vector,
          payload: {
            text: chunks[i], // Store the full chunk text
          },
        });
      } catch (embedError) {
        console.error(`Error generating embedding for chunk ${i}:`, embedError);
        throw new Error(`Failed to generate embedding for chunk ${i}: ${embedError.message}`);
      }
    }

    console.log(`Generated ${points.length} embeddings`);

    // 5. Ensure Qdrant collection exists (after we know vector dimension)
    const vectorSize = points[0]?.vector?.length || 768; // Default to 768 if not determined
    
    try {
      await qdrantClient.createCollection(name, {
        vectors: { 
          size: vectorSize, 
          distance: 'Cosine' 
        },
      });
      console.log(`Created collection: ${name}`);
    } catch (collectionError) {
      if (collectionError.message && collectionError.message.includes('already exists')) {
        console.log(`Collection ${name} already exists`);
        
        // Verify the existing collection has the right vector size
        try {
          const collectionInfo = await qdrantClient.getCollection(name);
          console.log(`Existing collection vector size: ${collectionInfo.config.params.vectors.size}`);
          
          if (collectionInfo.config.params.vectors.size !== vectorSize) {
            console.error(`Vector size mismatch! Expected ${vectorSize}, got ${collectionInfo.config.params.vectors.size}`);
            return NextResponse.json({ 
              error: `Vector dimension mismatch. Collection expects ${collectionInfo.config.params.vectors.size} dimensions, but embeddings have ${vectorSize} dimensions.`,
              details: 'Delete the existing collection or use a different collection name.'
            }, { status: 400 });
          }
        } catch (getCollectionError) {
          console.error('Error getting collection info:', getCollectionError);
        }
      } else {
        console.error('Error creating collection:', collectionError);
        throw collectionError;
      }
    }

    console.log(`Preparing to upsert ${points.length} points with vector dimension ${vectorSize}`);

    // 6. Upsert embedding vectors into Qdrant
    try {
      // Validate points structure before upserting
      const firstPoint = points[0];
      console.log('Sample point structure:', {
        id: firstPoint.id,
        vectorLength: firstPoint.vector.length,
        vectorType: typeof firstPoint.vector[0],
        payloadKeys: Object.keys(firstPoint.payload)
      });

      // Use the correct method name for Qdrant client
      if (typeof qdrantClient.upsert === 'function') {
        const result = await qdrantClient.upsert(name, {
          wait: true,
          points: points,
        });
        console.log('Upsert result:', result);
      } else if (typeof qdrantClient.upsertPoints === 'function') {
        const result = await qdrantClient.upsertPoints({
          collection_name: name,
          wait: true,
          points: points,
        });
        console.log('Upsert result:', result);
      } else if (typeof qdrantClient.putPoints === 'function') {
        const result = await qdrantClient.putPoints({
          collection_name: name,
          wait: true,
          points: points,
        });
        console.log('Put points result:', result);
      } else {
        // Fallback - check what methods are available
        console.log('Available qdrantClient methods:', Object.getOwnPropertyNames(qdrantClient));
        console.log('qdrantClient prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(qdrantClient)));
        throw new Error('Could not find appropriate upsert method on qdrantClient');
      }
      
      console.log(`Successfully stored ${points.length} vectors in collection ${name}`);
    } catch (upsertError) {
      console.error('Error upserting points:', upsertError);
      console.error('Error details:', {
        message: upsertError.message,
        status: upsertError.status,
        data: upsertError.data,
        headers: upsertError.headers
      });
      
      // If we have error data, log it for debugging
      if (upsertError.data) {
        console.error('Qdrant error response data:', upsertError.data);
      }
      
      throw new Error(`Failed to store vectors: ${upsertError.message}`);
    }

    // 7. Return success response
    return NextResponse.json({
      success: true,
      message: `Successfully processed '${file.name}' and stored ${points.length} embeddings in Qdrant collection '${name}'.`,
      details: {
        filename: file.name,
        collection_name: name,
        chunks_processed: points.length,
        text_length: text.length,
        vector_size: vectorSize,
      }
    });

  } catch (error) {
    console.error('Processing error:', error);
    
    // Return more detailed error information
    return NextResponse.json({ 
      error: 'Internal server error.',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}