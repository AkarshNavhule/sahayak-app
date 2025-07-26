'use client';

import React, { useState } from 'react';

export default function AssessmentAnalysis({ onClose }) {
  const [collection, setCollection] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Simulate "collections" just like ChatWithTextbook, or fetch if needed!
  const collections = ['Class 8 A', 'Class 8 B'];

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('http://localhost:8000/assessment_analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.analysis);
      } else {
        setError(data?.detail || 'Failed to fetch analysis');
      }
    } catch (e) {
      setError("Server error");
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-lg font-bold">Student Assessment Analysis</h1>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <select
            className="w-full p-3 border rounded mb-4"
            value={collection}
            onChange={e => setCollection(e.target.value)}
          >
            <option value="">Select Class/Collection</option>
            {collections.map(col => <option key={col} value={col}>{col}</option>)}
          </select>
          <button
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
            onClick={handleAnalyze}
            disabled={!collection || isLoading}
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
          {result && (
            <div className="mt-4 bg-gray-50 border p-4 rounded">
              {/* Render your result here—for demo, just JSON. */}
              <pre className="whitespace-pre-wrap text-xs text-gray-900">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
          {error && (
            <div className="mt-2 text-red-600">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}
