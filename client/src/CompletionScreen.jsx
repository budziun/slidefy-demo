import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaMusic, FaHeart, FaList, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import ConfirmModal from './ConfirmModal';

const CompletionScreen = ({ 
  playlist, 
  keptCount, 
  removedCount, 
  backgroundColors, 
  onBackToPlaylists,
  onDeletePlaylist,
  isEmpty = false
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    onDeletePlaylist(playlist.id);
  };

  return (
    <>
      <div
        className="w-full h-screen flex flex-col overflow-hidden justify-center items-center"
        style={{
          background: `linear-gradient(135deg, 
            rgba(${backgroundColors.primary}, 0.5) 0%, 
            rgba(${backgroundColors.secondary}, 0.4) 50%, 
            rgba(${backgroundColors.tertiary}, 0.5) 100%), 
            linear-gradient(45deg, rgba(20,20,20,0.7) 0%, rgba(40,40,40,0.5) 100%)`
        }}
      >
        <div className="mx-auto px-4">
          <motion.div
            className="relative bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
            style={{
              width: 'min(90vw, 600px)',
              height: 'min(calc(100vh - 100px), 650px)',
            }}
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(${backgroundColors.primary}, 0.1) 0%, 
                  rgba(${backgroundColors.secondary}, 0.05) 50%, 
                  rgba(${backgroundColors.tertiary}, 0.1) 100%)`
              }}
            />
            
            <div className="relative flex-1 flex flex-col items-center justify-center p-8 text-center">
              
              <motion.div
                className="mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6, type: "spring", stiffness: 200 }}
              >
                <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl ${
                  isEmpty 
                    ? 'bg-gradient-to-br from-orange-500 to-red-500' 
                    : 'bg-gradient-to-br from-purple-500 to-pink-500'
                }`}>
                  {isEmpty ? (
                    <FaExclamationTriangle className="text-white text-4xl" />
                  ) : (
                    <FaMusic className="text-white text-4xl" />
                  )}
                </div>
              </motion.div>

              <motion.h2
                className="text-2xl lg:text-3xl font-semibold mb-2 text-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                "{playlist.name}"
              </motion.h2>

              <motion.h1
                className={`text-4xl lg:text-5xl font-bold mb-4 pb-2 bg-clip-text text-transparent ${
                  isEmpty 
                    ? 'bg-gradient-to-r from-orange-600 to-red-600' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                {isEmpty ? 'Empty Playlist!' : 'Playlist Complete!'}
              </motion.h1>

              <motion.p
                className="text-lg text-gray-600 mb-8 max-w-md leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                {isEmpty 
                  ? 'This playlist has no tracks to review. You can delete it or go back to choose another playlist.'
                  : 'You\'ve reached the end of your musical journey through this playlist. Time to discover new sounds!'
                }
              </motion.p>

              {!isEmpty && (
                <motion.div
                  className="flex justify-center space-x-8 mb-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500 mb-1">{keptCount}</div>
                    <div className="text-sm text-gray-500 font-medium">Songs Kept</div>
                  </div>
                  <div className="w-px h-16 bg-gray-200"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-500 mb-1">{removedCount}</div>
                    <div className="text-sm text-gray-500 font-medium">Songs Removed</div>
                  </div>
                </motion.div>
              )}

              <motion.div
                className="flex gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.6 }}
              >
                <button
                  onClick={onBackToPlaylists}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-2xl hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 hover:shadow-3xl"
                >
                  <FaList className="text-lg" />
                  Back to Playlists
                </button>

                {isEmpty && onDeletePlaylist && (
                  <button
                    onClick={handleDeleteClick}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-2xl hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 hover:shadow-3xl"
                  >
                    <FaTrash className="text-lg" />
                    Delete Empty Playlist
                  </button>
                )}
              </motion.div>

              <motion.div
                className={`absolute top-4 right-4 ${isEmpty ? 'text-orange-200' : 'text-purple-200'}`}
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 1.3, duration: 1 }}
              >
                {isEmpty ? (
                  <FaExclamationTriangle className="text-2xl" />
                ) : (
                  <FaHeart className="text-2xl" />
                )}
              </motion.div>
              
              <motion.div
                className={`absolute bottom-4 left-4 ${isEmpty ? 'text-red-200' : 'text-pink-200'}`}
                initial={{ opacity: 0, rotate: 180 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 1.5, duration: 1 }}
              >
                <FaMusic className="text-xl" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Empty Playlist"
        message={`Are you sure you want to delete the empty playlist "${playlist.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default CompletionScreen;
