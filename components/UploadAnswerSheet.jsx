'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function UploadAnswerSheet({ onClose }) {
  const [collections, setCollections] = useState([]);
  const [questionPapers, setQuestionPapers] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [selectedQuestionPaper, setSelectedQuestionPaper] = useState('');
  const [correctionType, setCorrectionType] = useState('easy');
  const [studentId, setStudentId] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [isLoadingQuestionPapers, setIsLoadingQuestionPapers] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Fetch collections and question papers on mount
  useEffect(() => {
    fetchCollections();
    fetchQuestionPapers();
  }, []);

  // Auto-generate student ID from localStorage
  useEffect(() => {
    const username = localStorage.getItem('sahayak_username');
    if (username) {
      setStudentId(username);
    }
  }, []);

  const fetchCollections = async () => {
    try {
      setIsLoadingCollections(true);
      const response = await fetch('http://0.0.0.0:8000/list_chromadb_collections');
      
      if (response.ok) {
        const data = await response.json();
        setCollections(data.collections || []);
      } else {
        setError('Failed to fetch textbook collections');
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      setError('Failed to connect to server');
    } finally {
      setIsLoadingCollections(false);
    }
  };

  const fetchQuestionPapers = async () => {
    try {
      setIsLoadingQuestionPapers(true);
      const response = await fetch('http://0.0.0.0:8000/list_questionpapers');
      
      if (response.ok) {
        const data = await response.json();
        setQuestionPapers(data.questionpapers || []);
      } else {
        setError('Failed to fetch question papers');
      }
    } catch (error) {
      console.error('Error fetching question papers:', error);
      setError('Failed to connect to server');
    } finally {
      setIsLoadingQuestionPapers(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      setError('Please select only image files (JPG, PNG, etc.)');
      return;
    }
    
    setSelectedFiles(imageFiles);
    setError('');
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedFiles.length || !selectedCollection || !selectedQuestionPaper || !studentId || !subject) {
      setError('Please fill all fields and select at least one image');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      
      // Add files
      selectedFiles.forEach((file, index) => {
        formData.append('images', file);
      });
      
      // Add other form data
      formData.append('studentid', studentId);
      formData.append('questionpaperdocfromfiretore', selectedQuestionPaper);
      formData.append('subject', subject);
      formData.append('chromadbcollectionname', selectedCollection);
      formData.append('correctiontype', correctionType);

      const response = await fetch('http://0.0.0.0:8000/correct_answersheet', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadResult(result);
        setShowResults(true);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to correct answer sheet');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload answer sheet. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setUploadResult(null);
    setError('');
    setShowResults(false);
    setSubject('');
    setSelectedCollection('');
    setSelectedQuestionPaper('');
  };

  // Custom markdown components for styling
  const markdownComponents = {
    p: ({ children }) => (
      <p className="text-gray-800 text-sm leading-relaxed mb-2">
        {children}
      </p>
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
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[98vh] sm:h-[95vh] lg:h-[90vh] flex flex-col lg:flex-row overflow-hidden">
        
        {/* Mobile Toggle Buttons */}
        <div className="lg:hidden flex border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setShowResults(false)}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              !showResults ? 'bg-green-50 text-green-600 border-b-2 border-green-600' : 'text-gray-600'
            }`}
          >
            Upload Sheet
          </button>
          <button
            onClick={() => setShowResults(true)}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              showResults ? 'bg-green-50 text-green-600 border-b-2 border-green-600' : 'text-gray-600'
            }`}
            disabled={!uploadResult}
          >
            Results {uploadResult && '✓'}
          </button>
        </div>
        
        {/* Left Panel - Upload Form */}
        <div className={`${showResults ? 'hidden lg:flex' : 'flex'} w-full lg:w-1/3 border-r border-gray-200 flex-col min-h-0`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-medium text-gray-900">Upload Answer Sheet</h2>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Submit your answers for evaluation</p>
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

          {/* Form */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto min-h-0">
            
            {/* Student ID */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student ID
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your student ID"
              />
            </div>

            {/* Subject */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Mathematics, Science, Social Studies"
              />
            </div>

            {/* Textbook Collection */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Textbook Collection
              </label>
              {isLoadingCollections ? (
                <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg">
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-600">Loading...</span>
                </div>
              ) : collections.length > 0 ? (
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Textbook Collection</option>
                  {collections.map((collection) => (
                    <option key={collection} value={collection}>
                      {collection}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <span className="text-sm text-yellow-800">No textbook collections available</span>
                </div>
              )}
            </div>

            {/* Question Paper */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Paper
              </label>
              {isLoadingQuestionPapers ? (
                <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg">
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-600">Loading...</span>
                </div>
              ) : questionPapers.length > 0 ? (
                <select
                  value={selectedQuestionPaper}
                  onChange={(e) => setSelectedQuestionPaper(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Question Paper</option>
                  {questionPapers.map((paper) => (
                    <option key={paper} value={paper}>
                      {paper}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <span className="text-sm text-yellow-800">No question papers available</span>
                </div>
              )}
            </div>

            {/* Correction Type */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correction Type
              </label>
              <select
                value={correctionType}
                onChange={(e) => setCorrectionType(e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* File Upload */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Answer Sheet Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-600 mb-2">Select multiple images of your answer sheet</p>
                <label className="cursor-pointer">
                  <span className="text-sm text-green-600 hover:text-green-700 font-medium">
                    Browse files
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG, JPEG up to 10MB each</p>
              </div>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                onClick={handleUpload}
                disabled={!selectedFiles.length || !selectedCollection || !selectedQuestionPaper || !studentId || !subject || isUploading}
                className="w-full bg-green-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium text-sm sm:text-base hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Submit Answer Sheet
                  </>
                )}
              </button>

              {uploadResult && (
                <button
                  onClick={resetForm}
                  className="w-full bg-gray-200 text-gray-700 py-2 sm:py-2.5 px-4 rounded-lg font-medium text-sm sm:text-base hover:bg-gray-300 transition-colors"
                >
                  Submit Another
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className={`${!showResults ? 'hidden lg:flex' : 'flex'} flex-1 flex-col min-h-0`}>
          {/* Results Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Evaluation Results</h3>
              <p className="text-sm text-gray-600">Your answer sheet has been evaluated</p>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Results Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
            {uploadResult ? (
              <div className="space-y-6">
                {/* Score Summary */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                  <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      {uploadResult.totalmarks}
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">Total Score</p>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{uploadResult.studentid}</p>
                        <p className="text-xs text-gray-500">Student ID</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{uploadResult.subject}</p>
                        <p className="text-xs text-gray-500">Subject</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question-wise Results */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Question-wise Evaluation</h3>
                  
                  {uploadResult.eachquestion_marks.map((item, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                      {/* Question Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
                        <h4 className="font-semibold text-gray-900">
                          Question {item.question_no}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.marks === parseInt(item.question.match(/\[Max: (\d+) marks\]/)?.[1] || '0')
                              ? 'bg-green-100 text-green-800'
                              : item.marks > 0
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.marks} marks
                          </span>
                          <span className="text-xs text-gray-500">{item.chromadbsource}</span>
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Question:</p>
                        <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-md">
                          {item.question}
                        </p>
                      </div>

                      {/* Student Answer */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Your Answer:</p>
                        <div className="text-sm text-gray-800 bg-blue-50 p-3 rounded-md">
                          <ReactMarkdown components={markdownComponents}>
                            {item.studentanswer}
                          </ReactMarkdown>
                        </div>
                      </div>

                      {/* Remarks */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Feedback:</p>
                        <div className="text-sm text-gray-800 bg-yellow-50 p-3 rounded-md">
                          <ReactMarkdown components={markdownComponents}>
                            {item.remarks}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Spacing */}
                <div className="h-4"></div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-base sm:text-lg font-medium mb-2">No Results Yet</p>
                  <p className="text-xs sm:text-sm px-4">Submit your answer sheet to see evaluation results</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
