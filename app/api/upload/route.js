// app/api/upload/route.js
import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Convert browser File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const name = file.name.toLowerCase();
    const type = file.type;

    let text;
    
    if (type === 'application/pdf' || name.endsWith('.pdf')) {
      try {
        // Use pdf-parse with buffer
        const data = await pdfParse(buffer);
        text = data.text;
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        return NextResponse.json({ error: 'Failed to parse PDF file.' }, { status: 500 });
      }
    } else if (
      type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      name.endsWith('.docx')
    ) {
      try {
        const { value } = await mammoth.extractRawText({ buffer });
        text = value;
      } catch (docxError) {
        console.error('DOCX parsing error:', docxError);
        return NextResponse.json({ error: 'Failed to parse DOCX file.' }, { status: 500 });
      }
    } else if (type.startsWith('text/') || name.endsWith('.txt')) {
      text = buffer.toString('utf-8');
    } else {
      return NextResponse.json({ error: 'Unsupported file type.' }, { status: 415 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('File processing error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

