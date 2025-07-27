// components/ChatWithLeaderboard.jsx
'use client';
import React, { useState, useRef, useEffect } from 'react';

export default function ChatWithLeaderboard({ onClose }) {
  const [messages, setMessages] = useState([
    {
      type: 'system',
      text: 'Hi! I can answer questions about your leaderboard. For example: "Who is 1st rank?", "Top 3 students?", "Average marks in Science?"',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    const question = input.trim();
    if (!question) return;
    setMessages((msgs) => [...msgs, { type: 'user', text: question }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/chat_with_leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt:question }),
      });
      const data = await res.json();
      setMessages((msgs) => [
        ...msgs,
        {
          type: 'bot',
          text: data.answer || 'Sorry, I could not find an answer.',
        },
      ]);
    } catch (error) {
      setMessages((msgs) => [
        ...msgs,
        { type: 'bot', text: 'Network error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-60 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg flex flex-col h-[90vh] relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full flex items-center justify-center bg-yellow-400 text-xl">🏆</span>
            <div>
              <h2 className="text-xl font-semibold text-white">Chat with Leaderboard</h2>
              <div className="text-sm text-blue-100">Ask about rankings, scores, toppers...</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 p-1 transition"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        {/* Chat messages */}
        <div
          ref={chatRef}
          className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={
                msg.type === 'user'
                  ? 'flex justify-end'
                  : msg.type === 'bot'
                  ? 'flex justify-start'
                  : 'flex justify-center'
              }
            >
              <div
                className={
                  msg.type === 'system'
                    ? 'bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm max-w-2xl'
                    : msg.type === 'user'
                    ? 'px-4 py-2 bg-green-100 text-green-900 rounded-2xl shadow max-w-xs text-right'
                    : 'px-4 py-2 bg-white border border-purple-200 text-purple-700 rounded-2xl shadow max-w-xs'
                }
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-2 bg-white border border-purple-200 text-purple-700 rounded-2xl shadow max-w-xs flex items-center">
                <svg className="h-5 w-5 animate-spin mr-2 text-purple-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={4}/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Thinking...
              </div>
            </div>
          )}
        </div>
        {/* Input area */}
        <form
          onSubmit={sendMessage}
          className="flex items-center gap-3 border-t px-4 py-3 bg-white rounded-b-xl"
        >
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 text-base"
            placeholder="Ask something about the leaderboard..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            className="px-5 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 transition disabled:bg-blue-300"
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
