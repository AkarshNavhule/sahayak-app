'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatWithTextbook from '../../components/ChatWithTextbook';
import UploadAnswerSheet from '../../components/UploadAnswerSheet';
import LeaderboardChat from '../../components/LeaderboardChat';
import OverallPerformanceReport from '../../components/OverallPerformanceReport';
import Leaderboard from '../../components/Leaderboard'; // New import
import ChatWithLeaderboard from '../../components/ChatWithLeaderboard';

export default function StudentPage() {
  const [showChatModal, setShowChatModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLeaderboardChatModal, setShowLeaderboardChatModal] = useState(false);
  const [showOverallReportModal, setShowOverallReportModal] = useState(false);
  const [username, setUsername] = useState('');
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showChatWithLeaderboardModal, setShowChatWithLeaderboardModal] = useState(false);

  
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem('sahayak_username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sahayak_logged_in');
    localStorage.removeItem('sahayak_user_role');
    localStorage.removeItem('sahayak_username');
    router.push('/');
  };

  // const handleButtonClick = (action) => {
  //   if (action === 'Chat with Textbook') {
  //     setShowChatModal(true);
  //   } else if (action === 'Upload Answer Sheet') {
  //     setShowUploadModal(true);
  //   } else {
  //     console.log(`Navigating to ${action}`);
  //   }
  // };

  const handleButtonClick = (action) => {
    if (action === 'Chat with Textbook') {
      setShowChatModal(true);
    } else if (action === 'Upload Answer Sheet') {
      setShowUploadModal(true);
    } else if (action === 'Leaderboard Chat') {
      setShowLeaderboardChatModal(true);
    } else if (action === 'Overall Performance') {
      setShowOverallReportModal(true);
    } else {
      console.log(`Navigating to ${action}`);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logout */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-gray-900">Student Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Welcome back, {username}! Access your learning materials and track your progress
            </p>
          </div>
          
          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{username}</p>
              <p className="text-xs text-gray-500">Student</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl">
          
          {/* Upload Answer Sheet Card */}
          <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
            <div className="p-6">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Answer Sheet</h3>
              <p className="text-sm text-gray-600 mb-4">Submit your completed assignments and test papers</p>
              <button
                onClick={() => handleButtonClick('Upload Answer Sheet')}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 transition-colors duration-200"
              >
                Upload Now
              </button>
            </div>
          </div>

          {/* Chat with Textbook Card */}
          <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
            <div className="p-6">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chat with Textbook</h3>
              <p className="text-sm text-gray-600 mb-4">Get instant help and explanations from your textbooks</p>
              <button
                onClick={() => handleButtonClick('Chat with Textbook')}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors duration-200"
              >
                Start Chat
              </button>
            </div>
          </div>
          {/* View Leaderboard (full screen) */}
          <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
            <div className="p-6">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">View Leaderboard</h3>
              <p className="text-sm text-gray-600 mb-4">See all student rankings and performance analytics.</p>
              <button
                onClick={() => setShowLeaderboardModal(true)}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors duration-200"
              >
                View Leaderboard
              </button>
            </div>
          </div>

          {/* Chat with Leaderboard */}
          <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
            <div className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-1M5 8a2 2 0 002-2V4a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 002 2H5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chat with Leaderboard</h3>
              <p className="text-sm text-gray-600 mb-4">Ask AI about your marks, ranks, and performance!</p>
              <button
                onClick={() => setShowChatWithLeaderboardModal(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                Start Chat
              </button>
            </div>
          </div>


          {/* Overall Performance Report Card */}
          {/* <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
            <div className="p-6">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h4a2 2 0 012 2v1"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Overall Performance</h3>
              <p className="text-sm text-gray-600 mb-4">See your detailed report and ranking.</p>
              <button
                onClick={() => handleButtonClick('Overall Performance')}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
              >
                View Report
              </button>
            </div>
          </div> */}

          {/* View Report Card */}
          {/* <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">View Report</h3>
              <p className="text-sm text-gray-600 mb-4">Access your detailed performance reports and analytics</p>
              <button
                onClick={() => handleButtonClick('View Report')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                View Details
              </button>
            </div>
          </div> */}

        </div>

        {/* Quick Stats Section */}
        <div className="mt-12">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Your Progress Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Assignments Submitted</p>
                  <p className="text-2xl font-semibold text-gray-900">8</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Rank</p>
                  <p className="text-2xl font-semibold text-gray-900">#5</p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-semibold text-gray-900">85%</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chat Sessions</p>
                  <p className="text-2xl font-semibold text-gray-900">12</p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-12">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Recent Activity</h2>
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="divide-y divide-gray-200">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Math Assignment Submitted</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Completed</span>
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Chatted with Physics Textbook</p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Learning</span>
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Science Quiz Result Available</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">New</span>
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Moved up 2 ranks in Leaderboard</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Achievement</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {showChatModal && (
        <ChatWithTextbook onClose={() => setShowChatModal(false)} />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadAnswerSheet onClose={() => setShowUploadModal(false)} />
      )}

      {showLeaderboardChatModal && (
        <LeaderboardChat
          username={username}
          onClose={() => setShowLeaderboardChatModal(false)}
        />
      )}

      {showOverallReportModal && (
        <OverallPerformanceReport
          username={username}
          onClose={() => setShowOverallReportModal(false)}
        />
      )}

      {showLeaderboardModal && (
        <Leaderboard onClose={() => setShowLeaderboardModal(false)} />
      )}

      {showChatWithLeaderboardModal && (
        <ChatWithLeaderboard onClose={() => setShowChatWithLeaderboardModal(false)} />
      )}
    </div>
  );
}
