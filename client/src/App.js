import React, { useState, useEffect } from "react";
import axios from 'axios';
import PlaylistView from "./PlaylistView";
import Stats from "./Stats";
import Playlists from "./Playlists";
import AlertModal from './AlertModal';
import AnimatedBackgroundWrapper from './AnimatedBackgroundWrapper';
import { motion, AnimatePresence } from "framer-motion";
import { FaUndo } from 'react-icons/fa';
import { mockApi } from './mock/mockApi';
import Login from './Login';
import './App.css'; // Import CSS file with styles

/**
 * Bulletproof tap handler for mobile (especially iOS Safari) + mouse click fallback
 * Directly handles touches with 0ms delay without waiting for synthetic click
 */
export const createTapHandler = (callback) => {
  let touchStartPos = null;
  return {
    onTouchStart: (e) => {
      if (e.touches && e.touches[0]) {
        touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    },
    onTouchEnd: (e) => {
      if (!touchStartPos) return;
      const touch = e.changedTouches ? e.changedTouches[0] : null;
      if (touch) {
        const dx = Math.abs(touch.clientX - touchStartPos.x);
        const dy = Math.abs(touch.clientY - touchStartPos.y);
        touchStartPos = null;
        if (dx < 12 && dy < 12) {
          e.preventDefault();
          callback();
        }
      }
    },
    onClick: () => {
      callback();
    }
  };
};

/**
 * Navigation bar component
 * @param {Object} userData - User profile data
 * @param {Function} handleLogout - Logout handler
 * @param {Function} handleTabChange - Tab change handler  
 * @param {string} activeTab - Currently active tab
 */
function Navbar({ userData, handleLogout, handleTabChange, activeTab, handleResetData }) {
  return (
    <div 
      className="navbar text-white p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-center relative z-10 backdrop-blur-xl border-b border-white/20 select-none"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo section */}
      <div className="flex items-center gap-2 mb-3 sm:mb-0 sm:flex-1"> 
        <h1 className="text-2xl sm:text-4xl font-bold text-white drop-shadow-lg ml-2" 
            style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
          Slidefy
        </h1> 
      </div>
      
      {/* Navigation tabs - perfectly aligned and centered */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-0 bg-black/25 p-1 rounded-2xl border border-white/15 backdrop-blur-lg shadow-inner">
        <button
          type="button"
          {...createTapHandler(() => handleTabChange("playlists"))}
          className={`w-36 sm:w-44 h-9 sm:h-11 flex items-center justify-center text-sm sm:text-base font-semibold rounded-xl transition-colors duration-200 cursor-pointer touch-manipulation select-none active:opacity-80 sm:active:scale-95 ${
            activeTab === "playlists" 
              ? "bg-green-500 text-white shadow-md font-bold" 
              : "text-gray-300 sm:hover:text-white sm:hover:bg-white/10"
          }`}
        >
          Swipe Playlists
        </button>
        <button
          type="button"
          {...createTapHandler(() => handleTabChange("stats"))}
          className={`w-36 sm:w-44 h-9 sm:h-11 flex items-center justify-center text-sm sm:text-base font-semibold rounded-xl transition-colors duration-200 cursor-pointer touch-manipulation select-none active:opacity-80 sm:active:scale-95 ${
            activeTab === "stats" 
              ? "bg-green-500 text-white shadow-md font-bold" 
              : "text-gray-300 sm:hover:text-white sm:hover:bg-white/10"
          }`}
        >
          Spoti Stats
        </button>
      </div>
      
      {/* User profile, Reset Mock Data and logout */}
      <div className="flex items-center gap-2 sm:gap-3 sm:flex-1 sm:justify-end">
        <div className="flex items-center">
          <img
            src={userData.photo}
            alt="User Profile"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300";
            }}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-2.5 border-2 border-white/30 object-cover"
          />
          <h2 className="text-sm sm:text-base font-medium whitespace-nowrap">{userData.displayName}</h2>
        </div>

        {/* Reset Mock Data button */}
        <button
          type="button"
          {...createTapHandler(handleResetData)}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full shadow-md transition-all duration-300 sm:hover:scale-105 active:opacity-80 sm:active:scale-95 border border-yellow-500/40 bg-yellow-600/80 sm:hover:bg-yellow-500/90 text-white cursor-pointer touch-manipulation select-none"
          title="Reset all playlists and demo tracks to default"
        >
          <FaUndo className="text-xs" />
          <span className="font-medium text-xs sm:text-sm whitespace-nowrap">Reset Data</span>
        </button>

        <button
          type="button"
          {...createTapHandler(handleLogout)}
          className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg transition-all duration-300 sm:hover:scale-105 active:opacity-80 sm:active:scale-95 sm:hover:shadow-xl border border-red-500/30 cursor-pointer touch-manipulation select-none bg-red-600 sm:bg-red-600/90"
        >
          <img
            src="img/logout.svg"
            alt="Logout"
            className="w-4 h-4 sm:w-5 sm:h-5 invert"
          />
          <span className="font-medium text-xs sm:text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}

function App() {
  // State management
  const [userData, setUserData] = useState(null);
  const [playlists, setPlaylists] = useState(null);
  const [error, setError] = useState(null); //eslint-disable-line no-unused-vars
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0); // eslint-disable-line no-unused-vars
  const [savedSongsCount, setSavedSongsCount] = useState(0);
  const [removedSongsCount, setRemovedSongsCount] = useState(0);
  const [activeTab, setActiveTab] = useState("playlists");
  const [accessToken, setAccessToken] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  /**
   * Show alert modal with custom configuration
   * @param {string} title - Alert title
   * @param {string} message - Alert message
   * @param {string} type - Alert type (success, error, warning)
   */
  const showAlertModal = (title, message, type = 'success') => {
    setAlertConfig({ title, message, type });
    setShowAlert(true);
  };

  /**
   * Fetch access token from backend
   * @returns {Promise<string|null>} Access token or null if failed
   */
  // eslint-disable-next-line no-unused-vars
  const fetchAccessToken = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/token', {
        withCredentials: true
      });
      
      if (response.data.accessToken) {
        setAccessToken(response.data.accessToken);
        return response.data.accessToken;
      } else {
        console.error("No access token found in response");
        return null;
      }
    } catch (error) {
      console.error("Error fetching access token:", error);
      return null;
    }
  };

  /**
   * Refresh playlist data from backend
   * @returns {Promise<Array>} Updated playlists array
   */
  const refreshPlaylists = async () => {
    if (userData && accessToken) {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/playlists", {
          withCredentials: true
        });
        
        if (response.data && Array.isArray(response.data)) {
          setPlaylists(response.data);
          return response.data;
        } else {
          console.warn("Invalid playlists response format");
          setPlaylists([]);
          return [];
        }
      } catch (error) {
        console.error("Error refreshing playlists:", error);
        setPlaylists([]);
        return [];
      }
    }
    return [];
  };

  /**
   * Handle playlist deletion
   * @param {string} playlistId - ID of playlist to delete
   */
  const handleDeletePlaylist = async (playlistId) => {
    try {
      const response = await axios.delete(`http://127.0.0.1:5000/api/playlist/${playlistId}`, {
        withCredentials: true
      });
      
      // Remove playlist from local state
      setPlaylists(prevPlaylists => {
        const updatedPlaylists = prevPlaylists.filter(playlist => playlist.id !== playlistId);
        return updatedPlaylists;
      });
      
      // Clear active playlist if it was deleted
      if (activePlaylist && activePlaylist.id === playlistId) {
        setActivePlaylist(null);
      }
      
      showAlertModal(
        'Success!', 
        `Playlist "${response.data.playlistName || 'Unknown'}" deleted successfully!`,
        'success'
      );
      
      // Refresh playlists after short delay
      setTimeout(() => {
        refreshPlaylists();
      }, 500);
      
    } catch (error) {
      console.error("Error deleting playlist:", error);
      
      // Handle different error types
      if (error.response?.status === 403) {
        showAlertModal(
          'Permission Denied',
          'You can only delete your own playlists',
          'error'
        );
      } else if (error.response?.status === 404) {
        showAlertModal(
          'Playlist Not Found',
          'Playlist not found',
          'error'
        );
        // Remove from local state if not found
        setPlaylists(prevPlaylists => 
          prevPlaylists.filter(playlist => playlist.id !== playlistId)
        );
        if (activePlaylist && activePlaylist.id === playlistId) {
          setActivePlaylist(null);
        }
      } else {
        showAlertModal(
          'Error',
          'Failed to delete playlist. Please try again.',
          'error'
        );
      }
    }
  };

  // Do not auto-login on component mount so landing/login page is always displayed upon reload
  useEffect(() => {
    // Intentionally no-op on initial mount
  }, []);

  /**
   * Handle interactive demo login
   * @param {boolean} triggerWelcome - Whether to show the welcome splash animation
   */
  const handleDemoLogin = (triggerWelcome = true) => {
    localStorage.setItem("slidefy_demo_logged_in", "true");
    setShowWelcome(triggerWelcome);

    const demoToken = "demo-slidefy-token-xyz";
    setAccessToken(demoToken);
    setUserData({
      displayName: "Jakub Budzich",
      photo: process.env.PUBLIC_URL + "/img/avatar.jpg",
      isPremium: true
    });

    // Instantly load mock playlists so there is zero transition lag on mobile
    mockApi.getPlaylists().then(initialPlaylists => {
      setPlaylists(initialPlaylists);
    });
  };

  /**
   * Handle resetting all mock data to initial defaults
   */
  const handleResetData = async () => {
    mockApi.resetDemoData();
    await refreshPlaylists();
    showAlertModal('Data Reset', 'All playlists and demo tracks have been restored to initial state!', 'success');
  };

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    localStorage.setItem("hasSeenWelcome", "false");
    localStorage.removeItem("slidefy_demo_logged_in");
    setUserData(null);
    setAccessToken(null);
  };

  // Listen to smooth playlist updates without reloading page
  useEffect(() => {
    const onPlaylistsUpdated = () => {
      refreshPlaylists();
    };
    window.addEventListener('playlistsUpdated', onPlaylistsUpdated);
    return () => window.removeEventListener('playlistsUpdated', onPlaylistsUpdated);
  }, [userData, accessToken]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Fetch user data when access token is available
  useEffect(() => {
    if (accessToken) {
      axios.get("http://127.0.0.1:5000/dashboard", {
        withCredentials: true
      })
        .then(response => {
          setUserData(response.data);
        })
        .catch(error => {
          console.error("Error fetching user data:", error);
          setError(error.message);
        });
    }
  }, [accessToken]);
  
  // Auto-hide welcome screen smoothly after 1.8 seconds
  useEffect(() => {
    if (userData && showWelcome) {
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 1800);
  
      return () => clearTimeout(timer);
    }
  }, [userData, showWelcome]);
  
  // Refresh playlists when user data and token are available
  useEffect(() => {
    if (userData && accessToken) {
      refreshPlaylists();
    }
  }, [userData, accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Handle tab change in navigation
   * @param {string} tab - Tab name to switch to
   */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  /**
   * Handle playlist selection
   * @param {string} playlistId - ID of selected playlist
   */
  const handlePlaylistSelect = (playlistId) => {
    axios.get(`http://127.0.0.1:5000/api/playlist/${playlistId}`, {
      withCredentials: true
    })
      .then(response => {
        setActivePlaylist(response.data);
        setCurrentSongIndex(0);
      })
      .catch(err => console.error("Error fetching playlist details:", err));
  };

  /**
   * Handle playlist completion (all songs processed)
   */
  const handlePlaylistComplete = () => {
    // Stop any ongoing playback
    const stopEvent = new CustomEvent('stopPlayback');
    window.dispatchEvent(stopEvent);
    
    const forceStopEvent = new CustomEvent('forceStop');
    window.dispatchEvent(forceStopEvent);
    
    // Set transitioning state and clear active playlist
    setIsTransitioning(true);
    setActivePlaylist(null);
    
    // Reset transitioning state after minimum loading time
    setTimeout(async () => {
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 300));
      await minLoadingTime;
      setIsTransitioning(false);
    }, 500);
  };

  /**
   * Handle song removal from playlist
   * @param {string} playlistId - ID of playlist containing the song
   */
  const handleSongRemoved = (playlistId) => {
    // Update local playlist data
    setPlaylists(prevPlaylists => 
      prevPlaylists.map(playlist => 
        playlist.id === playlistId 
          ? { ...playlist, tracks: { ...playlist.tracks, total: Math.max(0, playlist.tracks.total - 1) } }
          : playlist
      )
    );
    
    // Refresh playlists after delay
    setTimeout(() => {
      refreshPlaylists();
    }, 1000);
  };

  // Stop playback when returning to playlist view
  useEffect(() => {
    if (activePlaylist === null) {
      const stopEvent = new CustomEvent('stopPlayback');
      window.dispatchEvent(stopEvent);
      
      const forceStopEvent = new CustomEvent('forceStop');
      window.dispatchEvent(forceStopEvent);
      
      // Backup API call to ensure playback stops
      if (accessToken) {
        setTimeout(() => {
          fetch(`https://api.spotify.com/v1/me/player/pause`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }).catch(err => console.log('App cleanup pause error:', err));
        }, 100);
      }
    }
  }, [activePlaylist, accessToken]);

  // Show playlist view when a playlist is selected
  if (activePlaylist) {
    return (
      <>
        <PlaylistView
          playlist={activePlaylist}
          accessToken={accessToken}
          onRemoveSong={(songIndex) => {
            setRemovedSongsCount(prev => prev + 1);
            handleSongRemoved(activePlaylist.id);
          }}
          onKeepSong={(songIndex) => {
            setSavedSongsCount(prev => prev + 1);
          }}
          onPlaylistComplete={handlePlaylistComplete}
          onDeletePlaylist={handleDeletePlaylist}
        />
        
        <AlertModal
          isOpen={showAlert}
          onClose={() => setShowAlert(false)}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
        />
      </>
    );
  }

  // Main app view
  return (
    <AnimatedBackgroundWrapper>
      <div className="flex flex-col min-h-screen min-h-[100dvh] text-white relative z-10" style={{ background: 'transparent' }}>
        {/* Show login screen if user not authenticated */}
        {!userData ? (
          <Login handleDemoLogin={() => handleDemoLogin(true)} />
        ) : (
          <>
            {/* Welcome screen animation */}
            <AnimatePresence>
              {showWelcome && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.35 } }}
                  transition={{ duration: 0.35 }}
                  onClick={() => setShowWelcome(false)}
                  className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
                >
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: -40, transition: { duration: 0.3 } }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="text-center flex flex-col items-center select-none"
                  >
                    <motion.img
                      src={userData.photo}
                      alt="User Profile"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300";
                      }}
                      className="w-28 h-28 sm:w-44 sm:h-44 rounded-full mb-6 border-4 border-emerald-400/50 shadow-2xl object-cover"
                    />
                    <motion.h1
                      className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg"
                    >
                      Welcome, {userData.displayName}!
                    </motion.h1>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Main navigation */}
            <Navbar 
              userData={userData} 
              handleLogout={handleLogout} 
              handleTabChange={handleTabChange} 
              activeTab={activeTab} 
              handleResetData={handleResetData}
            />
            
            {/* Main content area */}
            <div className="flex flex-col items-center flex-grow relative z-10 w-full">
              {activeTab === "playlists" && (
                <Playlists 
                  playlists={playlists} 
                  onPlaylistSelect={handlePlaylistSelect} 
                  onDeletePlaylist={handleDeletePlaylist}
                  accessToken={accessToken} 
                  refreshPlaylists={refreshPlaylists}
                  isLoading={isTransitioning}
                />
              )}
              {activeTab === "stats" && (
                <Stats 
                  savedSongsCount={savedSongsCount} 
                  removedSongsCount={removedSongsCount} 
                  accessToken={accessToken} 
                />
              )}
            </div>
          </>
        )}
        
        {/* Global alert modal */}
        <AlertModal
          isOpen={showAlert}
          onClose={() => setShowAlert(false)}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
        />
      </div>
    </AnimatedBackgroundWrapper>
  );
}

export default App;
