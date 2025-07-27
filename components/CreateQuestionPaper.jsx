'use client';

import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

export default function CreateQuestionPaper({ onClose }) {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [paperType, setPaperType] = useState('easy');
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questionPaper, setQuestionPaper] = useState(null);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Fetch collections on component mount
  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setIsLoadingCollections(true);
      const response = await fetch('http://0.0.0.0:8000/list_chromadb_collections');
      
      if (response.ok) {
        const data = await response.json();
        setCollections(data.collections || []);
        if (data.collections && data.collections.length > 0) {
          setSelectedCollection(data.collections[0]);
        }
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

  const generateQuestionPaper = async () => {
    if (!userPrompt.trim() || !selectedCollection) return;

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('http://0.0.0.0:8000/generate_question_paper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collection_name: selectedCollection,
          user_prompt: userPrompt.trim(),
          paper_type: paperType
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setQuestionPaper(data.question_paper);
        setShowPreview(true);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to generate question paper');
      }
    } catch (error) {
      console.error('Error generating question paper:', error);
      setError('Failed to generate question paper. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (!questionPaper) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 30;

    const addWrappedText = (text, x, y, maxWidth, fontSize = 12) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * fontSize * 0.4);
    };

    // Header
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(questionPaper.title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Subtitle
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Collection: ${questionPaper.collection_name}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    doc.text(`Total Marks: ${questionPaper.total_marks} | Difficulty: ${questionPaper.difficulty}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Instructions
    doc.setFont(undefined, 'bold');
    doc.text('Instructions:', margin, yPosition);
    yPosition += 8;
    doc.setFont(undefined, 'normal');
    yPosition = addWrappedText(questionPaper.instructions, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 15;

    // Questions
    doc.setFont(undefined, 'bold');
    doc.text('Questions:', margin, yPosition);
    yPosition += 15;

    questionPaper.questions.forEach((question) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }

      doc.setFont(undefined, 'bold');
      doc.text(`${question.question_no}. (${question.marks} marks)`, margin, yPosition);
      yPosition += 8;

      doc.setFont(undefined, 'normal');
      yPosition = addWrappedText(question.question, margin + 5, yPosition, pageWidth - 2 * margin - 5);
      yPosition += 5;

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Topic: ${question.topic} | Difficulty: ${question.difficulty}`, margin + 5, yPosition);
      doc.setTextColor(0);
      doc.setFontSize(12);
      yPosition += 15;
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
    }

    doc.save(`${questionPaper.title.replace(/\s+/g, '_')}.pdf`);
  };

  const clearForm = () => {
    setUserPrompt('');
    setQuestionPaper(null);
    setError('');
    setShowPreview(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      {/* Updated container with better height management */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[98vh] sm:h-[95vh] lg:h-[90vh] flex flex-col lg:flex-row overflow-hidden">
        
        {/* Mobile Toggle Buttons */}
        <div className="lg:hidden flex border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setShowPreview(false)}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              !showPreview ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-600' : 'text-gray-600'
            }`}
          >
            Create Paper
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              showPreview ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-600' : 'text-gray-600'
            }`}
            disabled={!questionPaper}
          >
            Preview {questionPaper && '✓'}
          </button>
        </div>
        
        {/* Left Panel - Form */}
        <div className={`${showPreview ? 'hidden lg:flex' : 'flex'} w-full lg:w-1/3 border-r border-gray-200 flex-col min-h-0`}>
          {/* Header - Fixed */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-medium text-gray-900">Create Question Paper</h2>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Generate AI-powered question papers</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors lg:block hidden"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form - Scrollable */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto min-h-0">
            {/* Collection Selector */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Textbook Collection
              </label>
              {isLoadingCollections ? (
                <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg">
                  <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-600">Loading...</span>
                </div>
              ) : collections.length > 0 ? (
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {collections.map((collection) => (
                    <option key={collection} value={collection}>
                      {collection}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <span className="text-sm text-yellow-800">No textbooks available. Please upload a textbook first.</span>
                </div>
              )}
            </div>

            {/* Paper Type */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={paperType}
                onChange={(e) => setPaperType(e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* User Prompt */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Paper Requirements
              </label>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="e.g., create a 10 marks paper covering all topics, create 5 questions on chapter 1, etc."
                className="w-full px-3 py-3 text-sm sm:text-base border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                rows="3"
              />
              <div className="mt-2 text-xs text-gray-500">
                Be specific about marks, topics, or chapters you want to include
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 sm:mb-6 flex items-center p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                <span className="text-xs sm:text-sm">{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={generateQuestionPaper}
                disabled={!userPrompt.trim() || !selectedCollection || isGenerating}
                className="w-full bg-orange-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium text-sm sm:text-base hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Paper
                  </>
                )}
              </button>

              {questionPaper && (
                <button
                  onClick={downloadPDF}
                  className="w-full bg-blue-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium text-sm sm:text-base hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </button>
              )}

              {questionPaper && (
                <button
                  onClick={clearForm}
                  className="w-full bg-gray-200 text-gray-700 py-2 sm:py-2.5 px-4 rounded-lg font-medium text-sm sm:text-base hover:bg-gray-300 transition-colors"
                >
                  Create New Paper
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Preview with Fixed Scrolling */}
        <div className={`${!showPreview ? 'hidden lg:flex' : 'flex'} flex-1 flex-col min-h-0`}>
          {/* Preview Header - Fixed */}
          <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Preview</h3>
              <p className="text-sm text-gray-600">Generated question paper will appear here</p>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Preview Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
            {questionPaper ? (
              <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8 shadow-sm">
                {/* Paper Header */}
                <div className="text-center mb-6 sm:mb-8">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{questionPaper.title}</h1>
                  <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                    <p>Collection: {questionPaper.collection_name}</p>
                    <p>Total Marks: {questionPaper.total_marks} | Difficulty: {questionPaper.difficulty}</p>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-6 sm:mb-8">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Instructions:</h3>
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{questionPaper.instructions}</p>
                </div>

                {/* Questions */}
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Questions:</h3>
                  {questionPaper.questions.map((question) => (
                    <div key={question.question_no} className="border-l-4 border-orange-500 pl-3 sm:pl-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                          {question.question_no}. ({question.marks} marks)
                        </h4>
                        <div className="text-xs text-gray-500">
                          <div>Topic: {question.topic}</div>
                          <div>Difficulty: {question.difficulty}</div>
                        </div>
                      </div>
                      <p className="text-gray-800 leading-relaxed text-sm sm:text-base break-words">{question.question}</p>
                    </div>
                  ))}
                </div>
                
                {/* Add some bottom padding for better mobile scrolling */}
                <div className="h-4 sm:h-6"></div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-base sm:text-lg font-medium mb-2">No Question Paper Generated</p>
                  <p className="text-xs sm:text-sm px-4">Fill in the form and click "Generate Question Paper" to see the preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
