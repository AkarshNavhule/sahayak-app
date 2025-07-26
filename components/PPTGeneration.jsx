'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export default function ChatWithTextbook({ onClose }) {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [error, setError] = useState('');
  const [showPPTViewer, setShowPPTViewer] = useState(false);
  const [pptSlides, setPptSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch collections on component mount
  useEffect(() => {
    fetchCollections();
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showPPTViewer) {
        switch (e.key) {
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            goToPreviousSlide();
            break;
          case 'ArrowRight':
          case 'ArrowDown':
          case ' ':
            e.preventDefault();
            goToNextSlide();
            break;
          case 'Escape':
            e.preventDefault();
            setShowPPTViewer(false);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showPPTViewer, currentSlide, pptSlides.length]);

  const fetchCollections = async () => {
    try {
      setIsLoadingCollections(true);
      const response = await fetch('http://localhost:8000/list_chromadb_collections');
      
      if (response.ok) {
        const data = await response.json();
        setCollections(data.collections || []);
      } else {
        setError('Failed to fetch collections');
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      setError('Failed to connect to server');
    } finally {
      setIsLoadingCollections(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const parsePPTContent = (content) => {
    // Parse the response content to extract slides
    const slides = [];
    const lines = content.split('\n');
    let currentSlide = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect slide headers (like "Slide 1:", "**Slide 1**", etc.) but clean the title
      if (line.match(/^(slide\s*\d+|#\s*slide\s*\d+|\*\*slide\s*\d+\*\*)/i) || 
          line.match(/^#+\s*.+/) || 
          (line.startsWith('**') && line.endsWith('**') && line.length < 100)) {
        
        if (currentSlide) {
          slides.push(currentSlide);
        }
        
        // Clean the title by removing slide numbering and markers
        let cleanTitle = line
          .replace(/^#+\s*|^\*\*|\*\*$|^slide\s*\d+:?\s*/i, '')
          .replace(/^slide\s*\d+\s*[-:]\s*/i, '')
          .trim();
        
        // If title is empty after cleaning, use a generic title
        if (!cleanTitle) {
          cleanTitle = 'Key Points';
        }
        
        currentSlide = {
          title: cleanTitle,
          content: ''
        };
      } else if (currentSlide && line) {
        currentSlide.content += line + '\n';
      } else if (!currentSlide && line && slides.length === 0) {
        // If no slide structure is detected, treat each major section as a slide
        currentSlide = {
          title: 'Introduction',
          content: line + '\n'
        };
      }
    }
    
    if (currentSlide) {
      slides.push(currentSlide);
    }

    // If no slides were parsed, create slides from paragraphs
    if (slides.length === 0) {
      const paragraphs = content.split('\n\n').filter(p => p.trim());
      paragraphs.forEach((paragraph, index) => {
        slides.push({
          title: index === 0 ? 'Overview' : 'Key Points',
          content: paragraph.trim()
        });
      });
    }

    return slides;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedCollection || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/chat_with_textbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userMessage.content,
          collection_name: selectedCollection
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.answer,
          timestamp: new Date().toLocaleTimeString(),
          context: data.context_with_pages || []
        };

        setMessages(prev => [...prev, botMessage]);

        // Check if the response looks like a PPT request and parse it
        if (userMessage.content.toLowerCase().includes('ppt') || 
            userMessage.content.toLowerCase().includes('slide') ||
            userMessage.content.toLowerCase().includes('presentation')) {
          const slides = parsePPTContent(data.answer);
          if (slides.length > 0) {
            setPptSlides(slides);
            setCurrentSlide(0);
            // Auto-open PPT viewer for PPT requests
            setTimeout(() => setShowPPTViewer(true), 1000);
          }
        }
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (selectedCollection) {
        sendMessage();
      }
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
    setPptSlides([]);
    setShowPPTViewer(false);
  };

  const goToNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % pptSlides.length);
  };

  const goToPreviousSlide = () => {
    setCurrentSlide(prev => (prev - 1 + pptSlides.length) % pptSlides.length);
  };

  const openPPTViewer = (messageContent) => {
    const slides = parsePPTContent(messageContent);
    if (slides.length > 0) {
      setPptSlides(slides);
      setCurrentSlide(0);
      setShowPPTViewer(true);
    }
  };

  // Clean text content by removing markdown formatting
  const cleanTextContent = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic markdown
      .replace(/`(.*?)`/g, '$1')       // Remove code markdown
      .replace(/#+\s*/g, '')           // Remove header markdown
      .replace(/[-*+]\s+/g, '• ')      // Convert list items to bullet points
      .replace(/\n+/g, '\n')           // Clean multiple newlines
      .trim();
  };

  // Download functions
  const downloadAsPPTX = async () => {
    setIsDownloading(true);
    try {
      // Dynamically import PptxGenJS to avoid SSR issues
      const PptxGenJS = (await import('pptxgenjs')).default;
      
      const pres = new PptxGenJS();
      
      // Set presentation properties
      pres.author = 'PPT Generator';
      pres.company = 'Generated from Textbook';
      pres.title = 'Generated Presentation';
      
      pptSlides.forEach((slide, index) => {
        const pptSlide = pres.addSlide();
        
        // Add title
        pptSlide.addText(slide.title, {
          x: 0.5,
          y: 0.5,
          w: 9,
          h: 1,
          fontSize: 24,
          bold: true,
          color: 'FFFFFF',
          fill: { color: 'F97316' }, // Orange background
          align: 'center'
        });
        
        // Clean and add content
        const cleanContent = cleanTextContent(slide.content);
        const contentLines = cleanContent.split('\n').filter(line => line.trim());
        
        // Add content as bullet points or paragraphs
        if (contentLines.length > 0) {
          const bulletPoints = contentLines.map(line => ({
            text: line,
            options: { bullet: true, fontSize: 16, color: '333333' }
          }));
          
          pptSlide.addText(bulletPoints, {
            x: 0.5,
            y: 2,
            w: 9,
            h: 5,
            fontSize: 16,
            color: '333333',
            valign: 'top'
          });
        }
      });
      
      // Generate and download the PPTX file
      const fileName = `presentation-${new Date().toISOString().split('T')[0]}.pptx`;
      await pres.writeFile({ fileName });
      
    } catch (error) {
      console.error('Error generating PPTX:', error);
      alert('Error generating PowerPoint file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadAsPDF = async () => {
    setIsDownloading(true);
    try {
      // Dynamically import jsPDF to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      pptSlides.forEach((slide, index) => {
        if (index > 0) {
          pdf.addPage();
        }
        
        // Add slide title with orange background
        pdf.setFillColor(249, 115, 22); // Orange color
        pdf.rect(0, 0, pageWidth, 30, 'F');
        
        pdf.setTextColor(255, 255, 255); // White text
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text(slide.title, pageWidth / 2, 20, { align: 'center' });
        
        // Add content
        pdf.setTextColor(51, 51, 51); // Dark gray text
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        
        const cleanContent = cleanTextContent(slide.content);
        const lines = pdf.splitTextToSize(cleanContent, contentWidth);
        
        let yPosition = 50;
        lines.forEach((line) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 30;
          }
          pdf.text(line, margin, yPosition);
          yPosition += 7;
        });
      });
      
      // Save the PDF
      const fileName = `presentation-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Custom markdown components for better styling
  const markdownComponents = {
    h1: ({ children }) => (
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 mt-6 first:mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 mt-5 first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 mt-4 first:mt-0">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-gray-800 text-sm sm:text-base leading-relaxed mb-3 last:mb-0">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-1 mb-3 ml-4 text-gray-800 text-sm sm:text-base">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-1 mb-3 ml-4 text-gray-800 text-sm sm:text-base">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed">
        {children}
      </li>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-gray-900">
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic text-gray-700">
        {children}
      </em>
    ),
    code: ({ children, inline }) => 
      inline ? (
        <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
          {children}
        </code>
      ) : (
        <pre className="bg-gray-100 text-gray-800 p-3 rounded-lg text-sm font-mono overflow-x-auto mb-3">
          <code>{children}</code>
        </pre>
      ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 mb-3 italic text-gray-700">
        {children}
      </blockquote>
    ),
  };

  // PPT Viewer Component
  const PPTViewer = () => (
    <div className="fixed inset-0 bg-black z-[60] flex flex-col">
      {/* PPT Header */}
      <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium">Presentation Viewer</h2>
          <span className="text-sm text-gray-300">
            Slide {currentSlide + 1} of {pptSlides.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Download Buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={downloadAsPPTX}
              disabled={isDownloading}
              className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-1 disabled:opacity-50"
              title="Download as PowerPoint (.pptx)"
            >
              {isDownloading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              )}
              <span>PPTX</span>
            </button>

            <button
              onClick={downloadAsPDF}
              disabled={isDownloading}
              className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center space-x-1 disabled:opacity-50"
              title="Download as PDF (.pdf)"
            >
              {isDownloading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              )}
              <span>PDF</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setShowPPTViewer(false)}
            className="p-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
            title="Close Presentation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Previous Button */}
        <button
          onClick={goToPreviousSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all z-10"
          disabled={pptSlides.length <= 1}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        {/* Slide */}
        <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full h-full max-h-[80vh] overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Slide Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-center">
                {pptSlides[currentSlide]?.title || 'Content'}
              </h1>
            </div>

            {/* Slide Content */}
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown components={markdownComponents}>
                  {pptSlides[currentSlide]?.content || ''}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={goToNextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all z-10"
          disabled={pptSlides.length <= 1}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="bg-gray-900 px-4 py-3">
        <div className="flex items-center justify-center space-x-2">
          {pptSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide 
                  ? 'bg-orange-500' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
        
        {/* Keyboard Instructions */}
        <div className="text-center text-gray-400 text-xs mt-2">
          Use ← → arrow keys, Space, or click buttons to navigate • ESC to exit
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-medium text-gray-900">Generate PPT from Textbook</h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Create presentations from your content</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Textbook Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">Textbook:</span>
            {isLoadingCollections ? (
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">Loading...</span>
              </div>
            ) : collections.length > 0 ? (
              <select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent min-w-[120px] sm:min-w-[140px]"
              >
                <option value="">Select Textbook</option>
                {collections.map((collection) => (
                  <option key={collection} value={collection} className="text-gray-900">
                    {collection}
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-3 py-2 bg-gray-100 rounded-lg">
                <span className="text-xs sm:text-sm text-gray-500">No textbooks</span>
              </div>
            )}
          </div>

          {/* PPT Viewer Button */}
          {pptSlides.length > 0 && (
            <button
              onClick={() => setShowPPTViewer(true)}
              className="px-3 py-2 text-xs sm:text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              <span className="hidden sm:inline">View PPT</span>
              <span className="sm:hidden">PPT</span>
            </button>
          )}

          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            >
              <span className="hidden sm:inline">New PPT</span>
              <span className="sm:hidden">New</span>
            </button>
          )}
          
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-3 sm:px-6 py-2 sm:py-3 bg-red-50 border-b border-red-200">
          <div className="flex items-center text-xs sm:text-sm text-red-700">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="h-full flex items-center justify-center p-4 sm:p-6">
              <div className="max-w-2xl mx-auto text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl font-medium text-gray-900 mb-3 sm:mb-4">
                  Generate PPT from Textbook
                </h2>
                
                {!selectedCollection ? (
                  <div className="mb-6 sm:mb-8">
                    <p className="text-base sm:text-lg text-gray-600 mb-4">
                      Please select a textbook from the dropdown above to start generating presentations.
                    </p>
                    <div className="flex items-center justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                      </svg>
                      <span className="text-sm sm:text-base font-medium text-yellow-800">
                        Select a textbook to get started
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 sm:mb-8">
                    <p className="text-base sm:text-lg text-gray-600 mb-4">
                      Great! You've selected <span className="font-semibold text-orange-600">{selectedCollection}</span>.
                    </p>
                    <p className="text-base sm:text-lg text-gray-600 mb-6">
                      I can help you create engaging PowerPoint presentations from your textbook content. Specify the topic and number of slides you need.
                    </p>
                    
                    <div className="max-w-md mx-auto">
                      <button 
                        onClick={() => setInputMessage("Create a 6 slide PPT on this topic")}
                        className="w-full p-4 sm:p-6 text-left border-2 border-orange-200 rounded-2xl hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
                      >
                        <div className="text-sm sm:text-base font-medium text-gray-900 mb-2 flex items-center">
                          📊 Sample Request
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mb-2">
                          "Create a 6 slide PPT on this topic"
                        </div>
                        <div className="text-xs text-orange-600 font-medium">
                          Click to use this prompt →
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Messages Display with Markdown Support */
            <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
              <div className="space-y-6 sm:space-y-8">
                {messages.map((message) => (
                  <div key={message.id} className="group">
                    {message.type === 'user' ? (
                      /* User Message */
                      <div className="flex items-start space-x-2 sm:space-x-4">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 mb-1">You</div>
                          <div className="text-gray-800 text-sm sm:text-base leading-relaxed break-words">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Bot Message with Markdown Rendering */
                      <div className="flex items-start space-x-2 sm:space-x-4">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs sm:text-sm font-medium text-gray-900">PPT Generator</div>
                            {/* View as PPT Button */}
                            {message.type === 'bot' && (
                              <button
                                onClick={() => openPPTViewer(message.content)}
                                className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full hover:bg-orange-200 transition-colors flex items-center space-x-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                </svg>
                                <span>View as PPT</span>
                              </button>
                            )}
                          </div>
                          <div className={`prose prose-sm sm:prose max-w-none ${
                            message.type === 'error' ? 'text-red-700' : ''
                          }`}>
                            {message.type === 'error' ? (
                              <p className="text-red-700 text-sm sm:text-base">{message.content}</p>
                            ) : (
                              <ReactMarkdown components={markdownComponents}>
                                {message.content}
                              </ReactMarkdown>
                            )}
                          </div>
                          
                          {/* Context Sources */}
                          {message.context && message.context.length > 0 && (
                            <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                              <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 flex items-center">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                Sources from textbook:
                              </div>
                              <div className="space-y-2">
                                {message.context.slice(0, 3).map((ctx, idx) => (
                                  <div key={idx} className="text-xs sm:text-sm bg-white rounded-lg p-2 sm:p-3 border border-gray-200">
                                    <div className="font-medium text-orange-700 mb-1">Page {ctx.page_no}</div>
                                    <div className="text-gray-700 text-xs sm:text-sm leading-relaxed break-words">
                                      {ctx.text.substring(0, 150)}...
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Loading Message */}
                {isLoading && (
                  <div className="flex items-start space-x-2 sm:space-x-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 mb-2">PPT Generator</div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-xs sm:text-sm">Creating presentation...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
            <div className="relative">
              <div className="flex items-end space-x-2 sm:space-x-4">
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      !selectedCollection 
                        ? "Please select a textbook first..." 
                        : "Describe your PPT requirements..."
                    }
                    disabled={!selectedCollection || isLoading}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 pr-14 sm:pr-16 text-sm sm:text-base border border-gray-300 rounded-2xl sm:rounded-3xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 shadow-sm text-gray-900"
                    rows="1"
                    style={{ minHeight: '48px', maxHeight: '150px' }}
                  />
                  
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || !selectedCollection || isLoading}
                    className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 w-8 h-8 sm:w-10 sm:h-10 bg-orange-600 text-white rounded-full hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isLoading ? (
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="mt-2 sm:mt-3 flex items-center justify-between text-xs text-gray-500">
                <span className="hidden sm:inline">
                  {!selectedCollection 
                    ? "Select a textbook to start creating presentations" 
                    : "Specify topic, number of slides, and any special requirements."
                  }
                </span>
                <span className="sm:hidden">
                  {!selectedCollection ? "Select textbook first" : "Describe PPT needs"}
                </span>
                <span>{inputMessage.length}/1000</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PPT Viewer Modal */}
      {showPPTViewer && pptSlides.length > 0 && <PPTViewer />}
    </div>
  );
}
