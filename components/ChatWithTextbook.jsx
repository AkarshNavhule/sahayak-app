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
  const messagesEndRef = useRef(null);

  // Fetch collections on component mount
  useEffect(() => {
    fetchCollections();
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchCollections = async () => {
    try {
      setIsLoadingCollections(true);
      const response = await fetch('http://0.0.0.0:8000/list_chromadb_collections');
      
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
      const response = await fetch('http://0.0.0.0:8000/chat_with_textbook', {
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

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-medium text-gray-900">Sahayak</h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Chat with Textbook</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Textbook Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">Textbook:</span>
            {isLoadingCollections ? (
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">Loading...</span>
              </div>
            ) : collections.length > 0 ? (
              <select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px] sm:min-w-[140px]"
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

          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            >
              <span className="hidden sm:inline">New chat</span>
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
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl font-medium text-gray-900 mb-3 sm:mb-4">
                  Hello, I'm Sahayak
                </h2>
                
                {!selectedCollection ? (
                  <div className="mb-6 sm:mb-8">
                    <p className="text-base sm:text-lg text-gray-600 mb-4">
                      Please select a textbook from the dropdown above to start chatting.
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
                      Great! You've selected <span className="font-semibold text-blue-600">{selectedCollection}</span>.
                    </p>
                    <p className="text-base sm:text-lg text-gray-600 mb-6">
                      Ask me anything about your textbook content. I can help explain concepts, summarize content, and answer your questions.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
                      <button 
                        onClick={() => setInputMessage("Explain the main concepts in chapter 1")}
                        className="p-3 sm:p-4 text-left border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-xs sm:text-sm font-medium text-gray-900 mb-1">📚 Explain concepts</div>
                        <div className="text-xs text-gray-600">Get detailed explanations of key topics</div>
                      </button>
                      <button 
                        onClick={() => setInputMessage("Summarize the important points from the textbook")}
                        className="p-3 sm:p-4 text-left border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-xs sm:text-sm font-medium text-gray-900 mb-1">📝 Summarize content</div>
                        <div className="text-xs text-gray-600">Get quick summaries of chapters</div>
                      </button>
                      <button 
                        onClick={() => setInputMessage("Give me practice questions on this topic")}
                        className="p-3 sm:p-4 text-left border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors sm:col-span-2 lg:col-span-1"
                      >
                        <div className="text-xs sm:text-sm font-medium text-gray-900 mb-1">❓ Practice questions</div>
                        <div className="text-xs text-gray-600">Generate questions to test understanding</div>
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
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 mb-2">Sahayak</div>
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
                                    <div className="font-medium text-blue-700 mb-1">Page {ctx.page_no}</div>
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
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 mb-2">Sahayak</div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-xs sm:text-sm">Thinking...</span>
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
                        : "Message Sahayak..."
                    }
                    disabled={!selectedCollection || isLoading}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 pr-14 sm:pr-16 text-sm sm:text-base border border-gray-300 rounded-2xl sm:rounded-3xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 shadow-sm text-gray-900"
                    rows="1"
                    style={{ minHeight: '48px', maxHeight: '150px' }}
                  />
                  
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || !selectedCollection || isLoading}
                    className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
                    ? "Select a textbook to start chatting" 
                    : "Sahayak may make mistakes. Check important info with your textbook."
                  }
                </span>
                <span className="sm:hidden">
                  {!selectedCollection ? "Select textbook first" : "Check with textbook"}
                </span>
                <span>{inputMessage.length}/1000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
