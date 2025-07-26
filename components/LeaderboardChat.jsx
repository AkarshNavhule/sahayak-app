'use client';

import React, { useState, useRef } from 'react';

export default function LeaderboardChat({ onClose, username }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Optionally, useEffect to scroll to last message
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/leaderboard_chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, prompt: userMessage.content })
      });
      const data = await res.json();
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.answer || "No response",
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'error',
        content: "Server error. Try again.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-medium text-gray-900">Leaderboard Chat</h1>
        <button onClick={onClose} className="p-2 hover:bg-black-100 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentC            olor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">Ask about your marks, remarks, ranking, progress...</div>
        )}
        <div className="space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={msg.type === 'user' ? "text-right" : ""}>
              <div className={`inline-block p-2 rounded-lg 
                ${msg.type === 'user' ? 'bg-blue-50 text-blue-800' : 
                  msg.type === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-grey-50 text-gray-900'
                }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && <div className="italic text-gray-400">Thinking...</div>}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="border-t px-4 py-3 bg-gray-50">
        <div className="flex items-end space-x-2">
          <input
            className="flex-1 border rounded-lg px-4 py-2"
            placeholder="Ask about your results, rank, progress..."
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
          >Send</button>
        </div>
      </div>
    </div>
  );
}
