import React, { useState, useEffect, useRef } from 'react';
import { FaTrash, FaMusic, FaUndo } from 'react-icons/fa';
import ConfirmModal from './ConfirmModal';
import { mockApi } from './mock/mockApi';


const Playlists = ({ playlists, onPlaylistSelect, onDeletePlaylist, isLoading, refreshPlaylists }) => {
  const [deletingPlaylist, setDeletingPlaylist] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);
  const [holdingPlaylistId, setHoldingPlaylistId] = useState(null);

  const longPressTimerRef = useRef(null);
  const isLongPressRef = useRef(false);
  const touchStartPosRef = useRef({ x: 0, y: 0 });

  // Clear deleting state whenever playlists list is updated or reset
  useEffect(() => {
    setDeletingPlaylist(null);
  }, [playlists]);

  // Clean up any active long press timers on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const handleTouchStart = (playlist, e) => {
    isLongPressRef.current = false;
    touchStartPosRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    setHoldingPlaylistId(playlist.id);

    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setHoldingPlaylistId(null);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(50);
        } catch (_) {}
      }
      setPlaylistToDelete({ id: playlist.id, name: playlist.name });
      setShowDeleteModal(true);
    }, 550);
  };

  const handleTouchMove = (e) => {
    if (!longPressTimerRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);
    // If movement is greater than 10px, the user is scrolling the page
    if (dx > 10 || dy > 10) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
      setHoldingPlaylistId(null);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setHoldingPlaylistId(null);
  };

  const handleCardClick = (playlistId) => {
    // If a long press was triggered, ignore the subsequent click event
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }
    onPlaylistSelect(playlistId);
  };

  const handleDeleteClick = (e, playlistId, playlistName) => {
    e.stopPropagation();
    setPlaylistToDelete({ id: playlistId, name: playlistName });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (playlistToDelete) {
      const idToDelete = playlistToDelete.id;
      setDeletingPlaylist(idToDelete);
      setShowDeleteModal(false);
      try {
        if (onDeletePlaylist) {
          await onDeletePlaylist(idToDelete);
        }
      } catch (err) {
        console.error('Error during playlist deletion:', err);
      } finally {
        setDeletingPlaylist(null);
        setPlaylistToDelete(null);
      }
    }
  };

  

  if (!playlists || playlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-start pt-16 sm:pt-24 pb-20 p-4 sm:p-6 w-full">
        <div className="text-center p-6 sm:p-8 rounded-2xl bg-gray-800 shadow-2xl max-w-md w-full mx-4">
          <FaMusic className="text-4xl sm:text-6xl text-white/70 mb-4 mx-auto" />
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">No Playlists Found</h2>
          <p className="text-white/70 mb-6 text-sm sm:text-base">You don't have any playlists yet or they couldn't be loaded.</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button 
              onClick={() => {
                mockApi.resetDemoData();
                if (refreshPlaylists) refreshPlaylists();
              }}
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-300 text-sm sm:text-base font-semibold cursor-pointer shadow-lg hover:scale-105"
            >
              <FaUndo size={14} />
              <span>Restore Sample Playlists</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 mb-20 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
        {/* Mobile touch tip */}
        <div className="sm:hidden text-center text-xs text-white/50 mb-3 select-none">
          Tap a playlist to open • Hold to delete
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => handleCardClick(playlist.id)}
              onTouchStart={(e) => handleTouchStart(playlist, e)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              className={`playlist-card relative cursor-pointer flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-gray-800 shadow-2xl transition-all duration-200 ${
                holdingPlaylistId === playlist.id ? 'scale-95 ring-2 ring-red-500/80 bg-red-950/40' : ''
              } sm:hover:scale-105 sm:hover:bg-gray-700 active:opacity-85 sm:active:scale-95 group touch-manipulation select-none`}
              style={{
                minHeight: 'fit-content',
              }}
            >
              {/* Desktop Delete button (visible on hover) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(e, playlist.id, playlist.name);
                }}
                disabled={deletingPlaylist === playlist.id}
                className="absolute top-2 right-2 z-10 p-1.5 sm:p-2 rounded-full hidden sm:block opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50 bg-red-500 hover:bg-red-600 border border-red-500/30"
                title="Delete playlist"
              >
                <FaTrash size={10} className="sm:text-xs text-red-300" />
              </button>

              <div className="w-full flex flex-col items-center pointer-events-none">
                {playlist.images && playlist.images.length > 0 && (
                  <img
                    src={playlist.images[0].url}
                    alt={playlist.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500";
                    }}
                    className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-xl object-cover shadow-lg"
                  />
                )}
                {(!playlist.images || playlist.images.length === 0) && (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-xl flex items-center justify-center bg-gray-700 border border-gray-600">
                    <span className="text-green-400/70 text-2xl sm:text-3xl lg:text-4xl">🎵</span>
                  </div>
                )}
                <p className="text-center text-xs sm:text-sm font-semibold mt-2 text-white/90 line-clamp-2 leading-tight">
                  {playlist.name || 'Unnamed Playlist'}
                </p>
              </div>

              {deletingPlaylist === playlist.id && (
                <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-gray-900/80">
                  <div className="text-white text-xs sm:text-sm">Deleting...</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Subtle portfolio disclaimer */}
        <div className="mt-12 text-center text-xs text-white/40" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 3rem)' }}>
          <p>Demo Mode • 30s audio previews & artwork sourced via Apple iTunes API for non-commercial portfolio demonstration.</p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPlaylistToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Playlist"
        message={`Are you sure you want to delete "${playlistToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default Playlists;
