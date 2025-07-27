// app/teacher/page.js
'use client';

import React, { useState } from 'react';
import UploadTextbook from '../../components/UploadTextbook';
import ChatWithTextbook from '../../components/ChatWithTextbook'; 
import CreateQuestionPaper from '../../components/CreateQuestionPaper';
import PPTGeneration from '../../components/PPTGeneration';
import AssessmentAnalysis from '../../components/AssessmentAnalysis';
import TakeAttendance from '../../components/TakeAttendance';
import Leaderboard from '../../components/Leaderboard'; // New import
import ChatWithLeaderboard from '../../components/ChatWithLeaderboard';


import { useRouter } from 'next/navigation';

export default function TeacherPage() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false); 
  const [showQuestionPaperModal, setShowQuestionPaperModal] = useState(false);
  const [showPPTModal, setShowPPTModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false); // New state
  const [showChatLeaderboardModal, setShowChatLeaderboardModal] = useState(false);

  const router = useRouter();

  const handleButtonClick = (action) => {
    if (action === 'Upload Textbook') {
      setShowUploadModal(true);
    } else if (action === 'Chat with Textbook') {
      setShowChatModal(true);
    } else if (action === 'Create Question Paper') {
      setShowQuestionPaperModal(true);
    } else if (action === 'Generate PPT') {
      setShowPPTModal(true);
    } else if (action === 'Assessment Analysis') {
      setShowAnalysisModal(true);
    } else if (action === 'Take Attendance') {
      setShowAttendanceModal(true);
    } else if (action === 'View Leaderboard') { // New action
      setShowLeaderboardModal(true);
    } else {
      console.log(`Navigating to ${action}`);
    }
  };

  const handleLogout = () => {
     router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-gray-900">Teacher Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your educational content and resources</p>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Upload Textbook Card */}
          <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Textbook</h3>
              <p className="text-sm text-gray-600 mb-4">Upload and manage educational textbooks for your courses</p>
              <button
                onClick={() => handleButtonClick('Upload Textbook')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Chat with Textbook Card */}
          <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
            <div className="p-6">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chat with Textbook</h3>
              <p className="text-sm text-gray-600 mb-4">Interactive AI-powered discussions with textbook content</p>
              <button
                onClick={() => handleButtonClick('Chat with Textbook')}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 transition-colors duration-200"
              >
                Start Chat
              </button>
            </div>
          </div>

          {/* Generate PPT Card */}
          <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
            <div className="p-6">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 4H5m14-8H5m12 8V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2h8a2 2 0 002-2v-4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generate PPT</h3>
              <p className="text-sm text-gray-600 mb-4">Instantly generate a presentation on a given topic</p>
              <button
                onClick={() => handleButtonClick('Generate PPT')}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
              >
                Create PPT
              </button>
            </div>
          </div>

          {/* Create Question Paper Card */}
          <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
            <div className="p-6">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Create Question Paper</h3>
              <p className="text-sm text-gray-600 mb-4">Generate customized question papers and assessments</p>
              <button
                onClick={() => handleButtonClick('Create Question Paper')}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors duration-200"
              >
                Create Now
              </button>
            </div>
          </div>

          {/* Take Attendance Card */}
          <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
            <div className="p-6">
              <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Take Attendance</h3>
              <p className="text-sm text-gray-600 mb-4">Mark student attendance using group photos</p>
              <button
                onClick={() => handleButtonClick('Take Attendance')}
                className="w-full bg-teal-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-teal-700 transition-colors duration-200"
              >
                Mark Attendance
              </button>
            </div>
          </div>

          {/* NEW LEADERBOARD Card */}
          <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
            <div className="p-6">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Student Leaderboard</h3>
              <p className="text-sm text-gray-600 mb-4">View academic performance rankings and analytics</p>
              <button
                onClick={() => handleButtonClick('View Leaderboard')}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors duration-200"
              >
                View Rankings
              </button>
            </div>
          </div>
                 {/* Chat with Leaderboard Card */}
            <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
              <div className="p-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M17 16v-1a4 4 0 00-3-3.87m5 6.87l-1.5-1.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chat with Leaderboard</h3>
                <p className="text-sm text-gray-600 mb-4">Ask about top ranks, scores, subject toppers and more</p>
                <button
                  onClick={() => setShowChatLeaderboardModal(true)}
                  className="w-full bg-yellow-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-yellow-600 transition-colors duration-200"
                >
                  Start Chat
                </button>
              </div>
            </div>
          {/* Assessment Analysis Card */}
          <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
            <div className="p-6">
              <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Assessment Analysis</h3>
              <p className="text-sm text-gray-600 mb-4">Analyze student performance and generate insights</p>
              <button
                onClick={() => handleButtonClick('Assessment Analysis')}
                className="w-full bg-pink-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-pink-700 transition-colors duration-200"
              >
                Analyze Results
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="mt-12">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Quick Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Textbooks</p>
                  <p className="text-2xl font-semibold text-gray-900">12</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Question Papers</p>
                  <p className="text-2xl font-semibold text-gray-900">8</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Chats</p>
                  <p className="text-2xl font-semibold text-gray-900">24</p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Attendance Stats Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Attendance</p>
                  <p className="text-2xl font-semibold text-gray-900">87%</p>
                </div>
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* NEW Leaderboard Stats Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Top Performer</p>
                  <p className="text-2xl font-semibold text-gray-900">91.8%</p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>

     
          </div>
        </div>
      </div>

      {/* All Modal Components */}
      {showUploadModal && (
        <UploadTextbook onClose={() => setShowUploadModal(false)} />
      )}
      
      {showChatModal && (
        <ChatWithTextbook onClose={() => setShowChatModal(false)} />
      )}

      {showQuestionPaperModal && (
        <CreateQuestionPaper onClose={() => setShowQuestionPaperModal(false)} />
      )}

      {showPPTModal && (
        <PPTGeneration onClose={() => setShowPPTModal(false)} />
      )}

      {showAnalysisModal && (
        <AssessmentAnalysis onClose={() => setShowAnalysisModal(false)} />
      )}

      {showAttendanceModal && (
        <TakeAttendance onClose={() => setShowAttendanceModal(false)} />
      )}

      {/* NEW Leaderboard Modal */}
      {showLeaderboardModal && (
        <Leaderboard onClose={() => setShowLeaderboardModal(false)} />
      )}

      {showChatLeaderboardModal && (
        <ChatWithLeaderboard onClose={() => setShowChatLeaderboardModal(false)} />
      )}

    </div>
  );
}
