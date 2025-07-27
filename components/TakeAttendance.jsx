// components/TakeAttendance.js
'use client';

import React, { useState, useEffect } from 'react';

export default function TakeAttendance({ onClose }) {
  /* ------------------------ basic form state ------------------------ */
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  /* ---------------------- image / api handling ---------------------- */
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  /* ----------------------- student list state ----------------------- */
  const [students, setStudents] = useState([]); // will be filled from API

  /* ------------------------------------------------------------------ */
  /* helper: clean object-url                                           */
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /* --------------------------- handlers ----------------------------- */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
    setStudents([]); // reset previous result if any
    setError(null);
  };

  const processAttendance = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!imageFile) {
      setError('Please select an image first');
      return;
    }
    
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('targetimage', imageFile);

      const res = await fetch('http://localhost:8000/attendance', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}: ${res.statusText}`);
      }

      /* expected shape: { "John Doe":"present", "Jane":"absent", ... } */
      const data = await res.json();
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
      }

      const incoming = Object.entries(data).map(([name, status], idx) => ({
        id: idx + 1,
        name,
        rollNo: String(idx + 1).padStart(3, '0'),
        status: status.toLowerCase() === 'present' ? 'present' : 'absent',
      }));
      
      setStudents(incoming);
    } catch (err) {
      console.error('Attendance processing error:', err);
      setError(err.message || 'Unable to process image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAttendanceChange = (id, status) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const handleSaveAttendance = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!selectedClass) {
      setError('Please select a class');
      return;
    }
    
    if (students.length === 0) {
      setError('No attendance data to save');
      return;
    }
    
    console.log('Saving attendance:', {
      selectedClass,
      selectedDate,
      students,
      totalStudents: students.length,
      presentCount: students.filter(s => s.status === 'present').length,
      absentCount: students.filter(s => s.status === 'absent').length,
    });
    
    // Here you would typically send the data to your backend
    // await saveAttendanceToDatabase({ selectedClass, selectedDate, students });
    
    onClose();
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  // Generate class options from 1st to 10th
  const generateClassOptions = () => {
    const classes = [];
    for (let i = 1; i <= 10; i++) {
      classes.push(
        <option key={`class-${i}`} value={`class-${i}`}>
          Class {i}
        </option>
      );
    }
    return classes;
  };

  /* ------------------------------------------------------------------ */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex w-full max-w-4xl max-h-[90vh] flex-col overflow-hidden rounded-lg bg-white">
        {/* ------------ header ------------ */}
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Take Attendance
          </h2>
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* ------------ content ------------ */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* class + date */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Select Class <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              >
                <option value="">Choose a class...</option>
                {generateClassOptions()}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min="2020-01-01"
                max={new Date().toISOString().split('T')[0]}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>
          </div>

          {/* image upload */}
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <h3 className="mb-3 text-lg font-medium text-gray-900">
              Upload Group Photo
            </h3>

            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full cursor-pointer rounded-md border border-gray-300 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-teal-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />

              {imageFile && (
                <button
                  type="button"
                  onClick={processAttendance}
                  disabled={isUploading}
                  className="mt-2 inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-400 disabled:opacity-50 transition-colors md:mt-0 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                  {isUploading && (
                    <svg
                      className="h-4 w-4 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                  )}
                  {isUploading ? 'Processing...' : 'Process Attendance'}
                </button>
              )}
            </div>

            {/* preview */}
            {previewUrl && (
              <div className="mt-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-64 rounded-md object-contain shadow-md border"
                />
              </div>
            )}

            {/* error */}
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  <span className="font-medium">Error:</span> {error}
                </p>
              </div>
            )}
          </div>

          {/* student list – only show when we have data */}
          {students.length > 0 && (
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detected Students ({students.length})
                </h3>
                <div className="text-sm text-gray-600">
                  Present: {students.filter(s => s.status === 'present').length} | 
                  Absent: {students.filter(s => s.status === 'absent').length}
                </div>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between rounded-md bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-600">
                        #{student.rollNo}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {student.name}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAttendanceChange(student.id, 'present');
                        }}
                        className={`rounded px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 ${
                          student.status === 'present'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-green-50 border border-gray-200'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAttendanceChange(student.id, 'absent');
                        }}
                        className={`rounded px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 ${
                          student.status === 'absent'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-red-50 border border-gray-200'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ------------ footer ------------ */}
        <div className="flex justify-end space-x-3 border-t bg-gray-50 p-6">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAttendance}
            disabled={students.length === 0 || !selectedClass}
            className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-400 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            Save Attendance
          </button>
        </div>
      </div>
    </div>
  );
}
