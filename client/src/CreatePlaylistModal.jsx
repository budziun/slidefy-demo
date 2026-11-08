import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaTimes, FaMusic } from 'react-icons/fa';
import Modal from 'react-modal';
import axios from 'axios';

Modal.setAppElement('#root');

const CreatePlaylistModal = ({ isOpen, onClose, accessToken }) => {
  const [playlistName, setPlaylistName] = useState('');
  const [trackLimit, setTrackLimit] = useState(20);
  const [timeRange, setTimeRange] = useState('short_term');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) {
      showNotification('error', 'Please enter a playlist name');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Creating playlist via backend...');
      
      const response = await axios.post('http://127.0.0.1:5000/api/create-playlist', {
        playlistName: playlistName.trim(),
        timeRange,
        trackLimit
      }, {
        withCredentials: true // Important for session management
      });
      
      console.log('Playlist created successfully:', response.data);
      
      showNotification('success', `Playlist "${response.data.playlistName}" created with ${response.data.trackCount} tracks!`);
      setPlaylistName('');
      
      setTimeout(() => {
        hideNotification();
        onClose();
        // Notify app to smoothly refresh playlists without reloading page
        window.dispatchEvent(new CustomEvent('playlistsUpdated'));
      }, 1500);
      
    } catch (error) {
      console.error('Error creating playlist:', error);
      
      let errorMessage = 'Failed to create playlist. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Please log in again to create playlists.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'Invalid playlist parameters.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      showNotification('error', errorMessage);
    }
    setLoading(false);
  };

  const NotificationOverlay = () => {
    if (!notification) return null;

    const getIcon = () => {
      switch (notification.type) {
        case 'success':
          return <FaCheckCircle className="text-green-500 text-4xl" />;
        case 'error':
          return <FaExclamationCircle className="text-red-500 text-4xl" />;
        default:
          return <FaCheckCircle className="text-green-500 text-4xl" />;
      }
    };

    const getBorderColor = () => {
      switch (notification.type) {
        case 'success':
          return 'border-green-200';
        case 'error':
          return 'border-red-200';
        default:
          return 'border-green-200';
      }
    };

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center p-4"
          onClick={hideNotification}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border-2 ${getBorderColor()} relative`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={hideNotification}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all"
            >
              <FaTimes size={14} />
            </button>

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                {getIcon()}
              </div>
            </div>

            <p className="text-gray-600 text-center mb-6 leading-relaxed font-medium">
              {notification.message}
            </p>

            <button
              onClick={hideNotification}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 px-4 rounded-lg font-medium transition-all"
            >
              OK
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onRequestClose={() => {}} 
      shouldCloseOnOverlayClick={false}
      contentLabel="Create Playlist" 
      className="bg-white text-gray-800 p-8 rounded-2xl max-w-lg mx-auto shadow-2xl border-2 border-green-200 relative"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        disabled={loading}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all disabled:opacity-50"
      >
        <FaTimes size={14} />
      </button>

      {/* Music logo header */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center shadow-inner">
          <FaMusic className="text-green-500 text-2xl" />
        </div>
      </div>

      {/* Modal title */}
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Create New Playlist</h2>
      
      {/* Playlist name input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2 text-gray-700">Playlist Name</label>
        <input 
          type="text" 
          placeholder="Enter playlist name..." 
          value={playlistName} 
          onChange={(e) => setPlaylistName(e.target.value)}
          className="w-full p-3 bg-gray-50 text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          disabled={loading}
          maxLength={100}
        />
      </div>
      
      {/* Track limit selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-3 text-gray-700">Track Limit</label>
        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          <button
            onClick={() => setTrackLimit(20)}
            disabled={loading}
            className={`flex-1 px-4 py-3 font-semibold transition-all ${
              trackLimit === 20 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            } disabled:opacity-50`}
          >
            20
          </button>
          <button
            onClick={() => setTrackLimit(50)}
            disabled={loading}
            className={`flex-1 px-4 py-3 font-semibold transition-all border-l border-r border-gray-200 ${
              trackLimit === 50 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            } disabled:opacity-50`}
          >
            50
          </button>
          <button
            onClick={() => setTrackLimit(100)}
            disabled={loading}
            className={`flex-1 px-4 py-3 font-semibold transition-all ${
              trackLimit === 100 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            } disabled:opacity-50`}
          >
            100
          </button>
        </div>
      </div>
      
      {/* Time range selection */}
      <div className="mb-8">
        <label className="block text-sm font-semibold mb-3 text-gray-700">Time Range</label>
        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          <button
            onClick={() => setTimeRange('short_term')}
            disabled={loading}
            className={`flex-1 px-3 py-3 font-semibold text-sm transition-all ${
              timeRange === 'short_term' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            } disabled:opacity-50`}
          >
            Last 4 Weeks
          </button>
          <button
            onClick={() => setTimeRange('medium_term')}
            disabled={loading}
            className={`flex-1 px-3 py-3 font-semibold text-sm transition-all border-l border-r border-gray-200 ${
              timeRange === 'medium_term' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            } disabled:opacity-50`}
          >
            Last 6 Months
          </button>
          <button
            onClick={() => setTimeRange('long_term')}
            disabled={loading}
            className={`flex-1 px-3 py-3 font-semibold text-sm transition-all ${
              timeRange === 'long_term' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            } disabled:opacity-50`}
          >
            All Time
          </button>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-3">
        <button 
          onClick={handleCreatePlaylist} 
          disabled={loading || !playlistName.trim()}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {loading ? 'Creating...' : 'Create Playlist'}
        </button>
        <button 
          onClick={onClose}
          disabled={loading}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
        >
          Cancel
        </button>
      </div>

      {/* Notification overlay */}
      <NotificationOverlay />
    </Modal>
  );
};

export default CreatePlaylistModal;
