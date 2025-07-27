// components/Leaderboard.jsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';

export default function Leaderboard({ onClose }) {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sorting, setSorting] = useState([]);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8000/leaderboard');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setLeaderboardData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching leaderboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: 'Rank',
        accessorKey: 'rank',
        cell: ({ getValue }) => {
          const value = getValue();
          return (
            <div className="flex items-center justify-center">
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                value === 1 ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                value === 2 ? 'bg-gray-100 text-gray-700 border border-gray-300' :
                value === 3 ? 'bg-orange-100 text-orange-700 border border-orange-300' :
                'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {value}
              </span>
            </div>
          );
        },
        size: 80,
      },
      {
        header: 'Student Details',
        accessorKey: 'student_name',
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate">{row.original.student_name}</div>
            <div className="text-sm text-gray-500 truncate">
              <span className="hidden sm:inline">ID: {row.original.student_id} | </span>
              <span>Class: {row.original.class}-{row.original.section}</span>
            </div>
          </div>
        ),
        size: 200,
      },
      {
        header: 'Math',
        accessorKey: 'maths_marks',
        cell: ({ getValue }) => {
          const value = getValue();
          return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md whitespace-nowrap ${
              value >= 90 ? 'bg-green-50 text-green-700 border border-green-200' :
              value >= 75 ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
              value >= 60 ? 'bg-orange-50 text-orange-700 border border-orange-200' :
              'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {value}
            </span>
          );
        },
        size: 80,
      },
      {
        header: 'Science',
        accessorKey: 'science_marks',
        cell: ({ getValue }) => {
          const value = getValue();
          return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md whitespace-nowrap ${
              value >= 90 ? 'bg-green-50 text-green-700 border border-green-200' :
              value >= 75 ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
              value >= 60 ? 'bg-orange-50 text-orange-700 border border-orange-200' :
              'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {value}
            </span>
          );
        },
        size: 80,
      },
      {
        header: 'English',
        accessorKey: 'english_marks',
        cell: ({ getValue }) => {
          const value = getValue();
          return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md whitespace-nowrap ${
              value >= 90 ? 'bg-green-50 text-green-700 border border-green-200' :
              value >= 75 ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
              value >= 60 ? 'bg-orange-50 text-orange-700 border border-orange-200' :
              'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {value}
            </span>
          );
        },
        size: 80,
      },
      {
        header: 'Social',
        accessorKey: 'social_marks',
        cell: ({ getValue }) => {
          const value = getValue();
          return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md whitespace-nowrap ${
              value >= 90 ? 'bg-green-50 text-green-700 border border-green-200' :
              value >= 75 ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
              value >= 60 ? 'bg-orange-50 text-orange-700 border border-orange-200' :
              'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {value}
            </span>
          );
        },
        size: 80,
      },
      {
        header: 'Kannada',
        accessorKey: 'kannada_marks',
        cell: ({ getValue }) => {
          const value = getValue();
          return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md whitespace-nowrap ${
              value >= 90 ? 'bg-green-50 text-green-700 border border-green-200' :
              value >= 75 ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
              value >= 60 ? 'bg-orange-50 text-orange-700 border border-orange-200' :
              'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {value}
            </span>
          );
        },
        size: 80,
      },
      {
        header: 'Total',
        accessorKey: 'all_subject_marks',
        cell: ({ getValue }) => (
          <div className="font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded-md text-center whitespace-nowrap">{getValue()}</div>
        ),
        size: 80,
      },
      {
        header: 'Percentage',
        accessorKey: 'percentage',
        cell: ({ getValue }) => {
          const value = getValue();
          return (
            <div className={`font-bold text-sm px-2 py-1 rounded-md text-center whitespace-nowrap ${
              value >= 90 ? 'bg-green-50 text-green-700 border border-green-200' :
              value >= 75 ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
              value >= 60 ? 'bg-orange-50 text-orange-700 border border-orange-200' :
              'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {value}%
            </div>
          );
        },
        size: 100,
      },
      {
        header: 'Exam Date',
        accessorKey: 'exam_date',
        cell: ({ getValue }) => (
          <div className="text-sm text-gray-600 whitespace-nowrap">
            {new Date(getValue()).toLocaleDateString()}
          </div>
        ),
        size: 100,
      },
    ],
    []
  );

  const table = useReactTable({
    data: leaderboardData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white rounded-lg p-8 shadow-2xl">
          <div className="flex items-center space-x-3">
            <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-lg font-medium text-gray-900">Loading leaderboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-75 p-2 sm:p-4 overflow-y-auto">
      <div className="min-h-full ">
        <div className="bg-white rounded-lg w-full max-w-7xl shadow-2xl border border-gray-200 flex flex-col max-h-[95vh]">
          {/* Header - Fixed */}
          <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b bg-white rounded-t-lg">
            <div className="mb-2 sm:mb-0">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-medium text-gray-900">Student Leaderboard</h2>
              </div>
              <p className="text-sm sm:text-base text-gray-600">Academic Performance Rankings & Analytics</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 mt-2 sm:mt-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="flex-shrink-0 p-4 sm:p-6 bg-red-50 border-l-4 border-red-400 mx-4 sm:mx-6 mt-4 rounded-r-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading leaderboard</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <button
                    onClick={fetchLeaderboardData}
                    className="mt-2 text-sm font-medium text-red-800 hover:text-red-900 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Scrollable Content */}
          <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
            {leaderboardData.length > 0 ? (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{leaderboardData.length}</div>
                        <div className="text-sm text-gray-600">Total Students</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {leaderboardData.filter(s => s.percentage >= 90).length}
                        </div>
                        <div className="text-sm text-gray-600">Above 90%</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {(leaderboardData.reduce((sum, s) => sum + s.percentage, 0) / leaderboardData.length).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Average Score</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {Math.max(...leaderboardData.map(s => s.percentage))}%
                        </div>
                        <div className="text-sm text-gray-600">Highest Score</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Mobile View - Card Layout */}
                  <div className="block lg:hidden">
                    <div className="max-h-96 overflow-y-auto">
                      {table.getRowModel().rows.map(row => (
                        <div key={row.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                                row.original.rank === 1 ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                                row.original.rank === 2 ? 'bg-gray-100 text-gray-700 border border-gray-300' :
                                row.original.rank === 3 ? 'bg-orange-100 text-orange-700 border border-orange-300' :
                                'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}>
                                {row.original.rank}
                              </span>
                              <div>
                                <div className="font-medium text-gray-900">{row.original.student_name}</div>
                                <div className="text-sm text-gray-500">Class: {row.original.class}-{row.original.section}</div>
                              </div>
                            </div>
                            <div className={`font-bold text-lg px-3 py-1 rounded-md ${
                              row.original.percentage >= 90 ? 'bg-green-50 text-green-700 border border-green-200' :
                              row.original.percentage >= 75 ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                              row.original.percentage >= 60 ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                              'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {row.original.percentage}%
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <div className="text-gray-600">Math</div>
                              <div className="font-semibold">{row.original.maths_marks}</div>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <div className="text-gray-600">Science</div>
                              <div className="font-semibold">{row.original.science_marks}</div>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <div className="text-gray-600">English</div>
                              <div className="font-semibold">{row.original.english_marks}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <div className="text-gray-600">Social</div>
                              <div className="font-semibold">{row.original.social_marks}</div>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <div className="text-gray-600">Kannada</div>
                              <div className="font-semibold">{row.original.kannada_marks}</div>
                            </div>
                          </div>
                          <div className="text-center mt-2 p-2 bg-blue-50 rounded text-sm">
                            <span className="text-gray-600">Total: </span>
                            <span className="font-bold text-gray-900">{row.original.all_subject_marks}/500</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desktop/Tablet View - Table Layout */}
                  <div className="hidden lg:block">
                    <div className="overflow-x-auto max-h-96">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                              {headerGroup.headers.map(header => (
                                <th
                                  key={header.id}
                                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                  onClick={header.column.getToggleSortingHandler()}
                                >
                                  <div className="flex items-center space-x-1">
                                    <span>
                                      {flexRender(header.column.columnDef.header, header.getContext())}
                                    </span>
                                    <span className="text-gray-400">
                                      {{
                                        asc: '↑',
                                        desc: '↓',
                                      }[header.column.getIsSorted()] ?? '↕'}
                                    </span>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          ))}
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                              {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className="px-3 sm:px-6 py-4 text-sm text-gray-900">
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  <div className="bg-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200">
                    {/* Mobile Pagination */}
                    <div className="flex justify-between items-center w-full sm:hidden mb-3">
                      <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-700 px-4 py-2">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                      </span>
                      <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>

                    {/* Desktop Pagination */}
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to{' '}
                          <span className="font-medium">
                            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, leaderboardData.length)}
                          </span>{' '}
                          of <span className="font-medium">{leaderboardData.length}</span> results
                        </p>
                        <select
                          value={table.getState().pagination.pageSize}
                          onChange={e => table.setPageSize(Number(e.target.value))}
                          className="border border-gray-300 rounded-md text-sm px-2 py-1 bg-white"
                        >
                          {[5, 10, 20, 50].map(pageSize => (
                            <option key={pageSize} value={pageSize}>
                              Show {pageSize}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => table.setPageIndex(0)}
                          disabled={!table.getCanPreviousPage()}
                          className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                        >
                          First
                        </button>
                        <button
                          onClick={() => table.previousPage()}
                          disabled={!table.getCanPreviousPage()}
                          className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                        >
                          Previous
                        </button>
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 rounded-md">
                          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                        </span>
                        <button
                          onClick={() => table.nextPage()}
                          disabled={!table.getCanNextPage()}
                          className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                        >
                          Next
                        </button>
                        <button
                          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                          disabled={!table.getCanNextPage()}
                          className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                        >
                          Last
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
                <p className="text-gray-500">No student performance data found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
