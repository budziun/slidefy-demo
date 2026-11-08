import React from 'react';
import { FaMusic } from 'react-icons/fa';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6">
      <div className="text-center p-6 sm:p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm shadow-2xl max-w-md w-full mx-4">
        
        <div className="relative mb-6 flex items-center justify-center">
          <FaMusic className="text-5xl sm:text-7xl text-green-400 z-10 relative animate-pulse" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-2 border-green-400/30 rounded-full animate-ping"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 border-2 border-blue-400/20 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-purple-400/10 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>

        {/* Equalizer-style loading */}
        <div className="flex justify-center items-end space-x-1 mb-4 h-8">
          <div className="w-1 bg-green-400 rounded-full animate-pulse" style={{ height: '20%', animationDelay: '0s' }}></div>
          <div className="w-1 bg-green-400 rounded-full animate-pulse" style={{ height: '60%', animationDelay: '0.1s' }}></div>
          <div className="w-1 bg-green-400 rounded-full animate-pulse" style={{ height: '100%', animationDelay: '0.2s' }}></div>
          <div className="w-1 bg-green-400 rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0.3s' }}></div>
          <div className="w-1 bg-green-400 rounded-full animate-pulse" style={{ height: '80%', animationDelay: '0.4s' }}></div>
          <div className="w-1 bg-green-400 rounded-full animate-pulse" style={{ height: '30%', animationDelay: '0.5s' }}></div>
          <div className="w-1 bg-green-400 rounded-full animate-pulse" style={{ height: '70%', animationDelay: '0.6s' }}></div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Loading Playlists...
        </h2>
        <p className="text-white/70 text-sm sm:text-base">
          Please wait while we fetch your music
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
