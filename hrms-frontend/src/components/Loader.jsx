// src/components/Loader.jsx
import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-blue-500"></div>
      <p className="ml-4 text-white text-lg">Loading...</p>
    </div>
  );
};

export default Loader;