import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import CreatePlaylistModal from './CreatePlaylistModal';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaApple } from 'react-icons/fa';
import { createTapHandler } from './App';

// Constants for track limits
const TRACK_LIMITS = {
  SHORT: 20,
  MEDIUM: 50,
  LONG: 100
};

// Constants for artist limits
const ARTIST_LIMITS = {
  SHORT: 3,
  MEDIUM: 20,
  LONG: 36
};

const Stats = () => {
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tracks');
  const [timeRange, setTimeRange] = useState('short_term');
  const [trackLimitType, setTrackLimitType] = useState('MEDIUM');
  const [artistLimitType, setArtistLimitType] = useState('MEDIUM');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  
  // Separate loading states for tracks and artists
  const [tracksLoading, setTracksLoading] = useState(true);
  const [artistsLoading, setArtistsLoading] = useState(true);

  const fetchAccessToken = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/token', { withCredentials: true });
      
      if (response.data.accessToken) {
        setAccessToken(response.data.accessToken);
      } else {
        const cookies = document.cookie.split(';');
        let token = null;
        cookies.forEach(cookie => {
          if (cookie.trim().startsWith('accessToken=')) {
            token = cookie.split('=')[1];
          }
        });
        
        if (token) {
          console.log('Found token in cookie:', token);
          setAccessToken(token);
        } else {
          console.log('No token found anywhere');
        }
      }
    } catch (error) {
      console.error('Error fetching access token:', error);
      setError('Failed to get access token');
    }
  };
  
  useEffect(() => {
    fetchAccessToken();
  }, []);

  const handleOpenModal = () => {
    if (!accessToken) {
      console.warn("No access token available, cannot open modal.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const fetchTopTracks = useCallback(async () => {
    try {
      setTracksLoading(true);
      
      const response = await axios.get(
        `http://127.0.0.1:5000/api/stats/top-tracks?limit=${trackLimitType}&time_range=${timeRange}`,
        { withCredentials: true }
      );
      
      setTopTracks(response.data || []);
    } catch (error) {
      console.error("Error fetching top tracks:", error);
      setError(error.message);
      setTopTracks([]);
    } finally {
      setTracksLoading(false);
    }
  }, [timeRange, trackLimitType]);

  const fetchTopArtists = useCallback(async () => {
    try {
      setArtistsLoading(true);
      
      const response = await axios.get(
        `http://127.0.0.1:5000/api/stats/top-artists?limit=${artistLimitType}&time_range=${timeRange}`,
        { withCredentials: true }
      );
      
      setTopArtists(response.data || []);
    } catch (error) {
      console.error("Error fetching top artists:", error);
      setError(error.message);
      setTopArtists([]);
    } finally {
      setArtistsLoading(false);
    }
  }, [timeRange, artistLimitType]);

  useEffect(() => {
    if (activeTab === 'tracks') {
      fetchTopTracks();
    } else {
      fetchTopArtists();
    }
  }, [activeTab, timeRange, trackLimitType, artistLimitType, fetchTopTracks, fetchTopArtists]);

  const SimpleLoading = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-green-400/30 border-t-green-400 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Loading your music data...</h3>
      <p className="text-white-400 text-center max-w-md">
        We're fetching your top tracks from Spotify. This might take a moment.
      </p>
    </motion.div>
  );

  // Empty state component
  const EmptyState = ({ type }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center p-8 text-white"
    >
      <div className="mb-4">
        <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9 12a1 1 0 102 0V8a1 1 0 10-2 0v4zm1-7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd"/>
        </svg>
      </div>
      <p className="text-xl mb-2">No {type} found</p>
      <p className="text-gray-400">Try changing the time range or refresh the page</p>
    </motion.div>
  );

  const renderTopTracks = () => {
    // Show simple loading when fetching data
    if (tracksLoading) {
      return <SimpleLoading />;
    }

    // Show empty state if no data after loading
    if (topTracks.length === 0) {
      return <EmptyState type="tracks" />;
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div 
          key={`tracks-${trackLimitType}-${timeRange}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 mobile-stats-container"
        >
          {topTracks.slice(0, TRACK_LIMITS[trackLimitType]).map((track, index) => {
            const artistsToShow = track.artists.slice(0, 3);
            const remainingArtists = track.artists.length - 3;
            return (
              <motion.div 
                key={`track-${track.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.05,
                  ease: 'easeOut' 
                }}
                className="track-card-track bg-gray-800 p-3 rounded-lg shadow-lg transition transform sm:hover:scale-105 sm:hover:bg-gray-700 mobile-track-card"
              >
                <div className="flex items-start space-x-2 mobile-track-content">
                  <div className="text-xl font-bold text-white mobile-track-number">
                    {index + 1}.
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mobile-track-inner">
                      <div className="mobile-track-image">
                        <img 
                          src={track.album.images[0]?.url} 
                          alt={track.name}
                          className="w-16 h-16 object-cover mobile-track-img"
                        />
                      </div>
                      <div className="flex-1 mobile-track-info">
                        <h3 className="font-semibold text-white mobile-track-title">{track.name}</h3>
                        <p className="text-gray-300 mobile-track-artist">
                          {artistsToShow.map(artist => artist.name).join(', ')}
                          {remainingArtists > 0 && `, and ${remainingArtists} more`}
                        </p>
                        <div className="mt-2">
                          <a 
                            href={`https://music.apple.com/pl/search?term=${encodeURIComponent(track.name + ' ' + (track.artists?.[0]?.name || ''))}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-white text-sm mobile-track-link inline-flex items-center gap-1.5 transition-colors"
                          >
                            <FaApple className="text-xs" />
                            <span>Apple Music</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    );
  };

  // TopArtistsPodium - Desktop version
  const TopArtistsPodium = ({ artists }) => {
    const topThree = artists?.slice(0, 3) || [];
  
    if (topThree.length < 3) {
      console.warn("topThree must have exactly 3 elements!");
      return null;
    }
  
    const positions = {
      1: { order: 2, height: 'h-64' },
      2: { order: 1, height: 'h-52' },
      3: { order: 3, height: 'h-44' }
    };
  
    return (
      <div className="container desktop-podium-container">
        <div className="flex items-end justify-center gap-4 h-96 desktop-podium-wrapper">
          <AnimatePresence>
            {topThree.map((artist, index) => {
              const position = index + 1;
              const delay = (4 - position) * 0.5;
              
              return (
                <motion.div
                  key={`podium-${artist.id}-${index}`}
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay }}
                  style={{ order: positions[position].order }}
                  className={`relative flex flex-col items-center w-1/4 
                    ${positions[position].height} bg-gray-800 rounded-t-lg desktop-podium-item`}
                >
                  <div className="absolute -top-20 w-32 h-32 desktop-podium-avatar">
                    <div className="w-full h-full rounded-full bg-gray-800 p-2 mb-5 desktop-podium-avatar-inner">
                      <img
                        src={artist.images[0]?.url || '/api/placeholder/128/128'}
                        alt={artist.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>
  
                  <div className="absolute w-full bottom-1/2 desktop-podium-name">
                    <div className="text-white p-1 rounded text-center mx-2 mt-9 text-xl mb-2 desktop-podium-name-text">
                      {artist.name}
                    </div>
                  </div>
  
                  <div className="mt-auto mb-2 text-4xl font-bold font-mono text-white desktop-podium-position">
                    #{position}
                  </div>
      
                  <div className="mb-4 desktop-podium-spotify">
                    <a 
                      href={`https://music.apple.com/pl/search?term=${encodeURIComponent(artist.name)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      title="Listen on Apple Music"
                    >
                      <FaApple className="w-7 h-7 text-white/70 hover:text-white transition-colors desktop-podium-icon" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  const renderTopArtists = () => {
    if (artistLimitType === 'SHORT') {
      
      if (artistsLoading) {
        return <SimpleLoading />;
      }
    
      if (topArtists.length === 0) {
        return <EmptyState type="artists" />;
      }
      return (
        <>
          {/* Desktop podium */}
          <div className="desktop-podium-container hide-on-mobile">
            <TopArtistsPodium artists={topArtists} />
          </div>
          
          {/* Mobile list */}
          <div className="mobile-podium-alternative hidden">
            <div className="mobile-stats-container">
              <AnimatePresence>
                {topArtists.slice(0, 3).map((artist, index) => (
                  <motion.div 
                    key={`mobile-top3-${artist.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="mobile-artist-card bg-gray-800 rounded-lg shadow-lg transition transform sm:hover:scale-105 sm:hover:bg-gray-700"
                  >
                    <div className="mobile-artist-content">
                      <div className="mobile-artist-number text-2xl font-bold text-green-500">
                        #{index + 1}
                      </div>
                      <div className="mobile-artist-inner">
                        <div className="mobile-artist-image">
                          <img 
                            src={artist.images[0]?.url} 
                            alt={artist.name}
                            className="mobile-artist-img"
                          />
                        </div>
                        <div className="mobile-artist-info">
                          <h3 className="mobile-artist-title">{artist.name}</h3>
                          <a 
                            href={`https://music.apple.com/pl/search?term=${encodeURIComponent(artist.name)}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mobile-artist-link text-xs text-gray-300 hover:text-white flex items-center gap-1"
                          >
                            <FaApple className="text-xs" />
                            <span>Apple Music</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </>
      );
    } else {
      // Show simple loading when fetching data
      if (artistsLoading) {
        return <SimpleLoading />;
      }

      // Show empty state if no data after loading
      if (topArtists.length === 0) {
        return <EmptyState type="artists" />;
      }

      return (
        <AnimatePresence mode="wait">
          <motion.div 
            key={`artists-${artistLimitType}-${timeRange}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="container grid grid-cols-1 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-4 mobile-stats-container"
          >
            {topArtists.slice(0, ARTIST_LIMITS[artistLimitType]).map((artist, index) => (
              <motion.div 
                key={`artist-${artist.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4,
                  delay: index * 0.05,
                  ease: 'easeOut',
                }}
                layout
                className="track-card-artist bg-gray-800 p-3 rounded-lg shadow-lg transition transform sm:hover:scale-105 sm:hover:bg-gray-700 mobile-artist-card"
              >
                <div className="flex items-start space-x-2 mobile-artist-content">
                  <div className="text-xl font-bold text-white mobile-artist-number">
                    {index + 1}.
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mobile-artist-inner">
                      <div className="mobile-artist-image">
                        <img 
                          src={artist.images[0]?.url} 
                          alt={artist.name}
                          className="w-16 h-16 object-cover mobile-artist-img"
                        />
                      </div>
                      <div className="flex-1 mobile-artist-info">
                        <h3 className="font-semibold text-white mobile-artist-title">{artist.name}</h3>
                        <div className="mt-2">
                          <a 
                            href={`https://music.apple.com/pl/search?term=${encodeURIComponent(artist.name)}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-white text-sm mobile-artist-link inline-flex items-center gap-1"
                          >
                            <FaApple className="text-xs" />
                            <span>Apple Music</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      );
    }  
  };  

  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 mobile-stats-main w-full max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-white mobile-stats-title">Your Stats</h2>
      
      <div className="flex mb-4 mobile-tabs select-none">
        <button
          type="button"
          {...createTapHandler(() => setActiveTab('tracks'))}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'tracks' ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'
          } rounded-l-lg mobile-tab cursor-pointer touch-manipulation select-none active:opacity-80 sm:active:scale-95 transition-colors`}
        >
          Top Tracks
        </button>
        <button
          type="button"
          {...createTapHandler(() => setActiveTab('artists'))}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'artists' ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'
          } rounded-r-lg mobile-tab cursor-pointer touch-manipulation select-none active:opacity-80 sm:active:scale-95 transition-colors`}
        >
          Top Artists
        </button>
      </div>

      <div className="flex justify-between items-center mb-4 mobile-controls select-none">
        <div className="flex mobile-controls-left">
          {/* Time range buttons group - wrapped in div so they stay in 1 row on mobile */}
          <div className="flex mobile-time-group">
            <button
              type="button"
              {...createTapHandler(() => setTimeRange('short_term'))}
              className={`px-3 sm:px-4 py-2 font-semibold ${
                timeRange === 'short_term' ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'
              } rounded-l-lg mobile-btn cursor-pointer touch-manipulation select-none active:opacity-80 sm:active:scale-95 transition-colors`}
            >
              4 Weeks
            </button>
            <button
              type="button"
              {...createTapHandler(() => setTimeRange('medium_term'))}
              className={`px-3 sm:px-4 py-2 font-semibold ${
                timeRange === 'medium_term' ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'
              } mobile-btn cursor-pointer touch-manipulation select-none active:opacity-80 sm:active:scale-95 transition-colors`}
            >
              6 Months
            </button>
            <button
              type="button"
              {...createTapHandler(() => setTimeRange('long_term'))}
              className={`px-3 sm:px-4 py-2 font-semibold ${
                timeRange === 'long_term' ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'
              } rounded-r-lg mobile-btn cursor-pointer touch-manipulation select-none active:opacity-80 sm:active:scale-95 transition-colors`}
            >
              All Time
            </button>
          </div>

          {activeTab === 'tracks' && (
            <div className="flex sm:ml-4 mobile-limit-group">
              <button
                type="button"
                {...createTapHandler(() => setTrackLimitType('SHORT'))}
                className={`px-3 sm:px-4 py-2 font-semibold ${
                  trackLimitType === 'SHORT' ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'
                } rounded-l-lg mobile-btn cursor-pointer touch-manipulation select-none active:opacity-80 sm:active:scale-95 transition-colors`}
              >
                20
              </button>
              <button
                type="button"
                {...createTapHandler(() => setTrackLimitType('MEDIUM'))}
                className={`px-3 sm:px-4 py-2 font-semibold ${
                  trackLimitType === 'MEDIUM' ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'
                } mobile-btn cursor-pointer touch-manipulation select-none active:opacity-80 sm:active:scale-95 transition-colors`}
              >
                50
              </button>
              <button
                type="button"
                {...createTapHandler(() => setTrackLimitType('LONG'))}
                className={`px-3 sm:px-4 py-2 font-semibold ${
                  trackLimitType === 'LONG' ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'
                } rounded-r-lg mobile-btn cursor-pointer touch-manipulation select-none active:opacity-80 sm:active:scale-95 transition-colors`}
              >
                100
              </button>
            </div>
          )}

          {activeTab === 'artists' && (
            <div className="flex sm:ml-4 mobile-limit-group">
              <button
                type="button"
                {...createTapHandler(() => setArtistLimitType('SHORT'))}
                className={`px-3 sm:px-4 py-2 font-semibold ${
                  artistLimitType === 'SHORT' ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'
                } rounded-l-lg mobile-btn cursor-pointer touch-manipulation select-none active:opacity-80 sm:active:scale-95 transition-colors`}
              >
                3
              </button>
              <button
                type="button"
                {...createTapHandler(() => setArtistLimitType('MEDIUM'))}
                className={`px-3 sm:px-4 py-2 font-semibold ${
                  artistLimitType === 'MEDIUM' ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'
                } mobile-btn cursor-pointer touch-manipulation select-none active:opacity-80 sm:active:scale-95 transition-colors`}
              >
                20
              </button>
              <button
                type="button"
                {...createTapHandler(() => setArtistLimitType('LONG'))}
                className={`px-3 sm:px-4 py-2 font-semibold ${
                  artistLimitType === 'LONG' ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'
                } rounded-r-lg mobile-btn cursor-pointer touch-manipulation select-none active:opacity-80 sm:active:scale-95 transition-colors`}
              >
                36
              </button>
            </div>
          )}
        </div>

        {activeTab === 'tracks' && (
          <button
            type="button"
            {...createTapHandler(handleOpenModal)}
            className="flex items-center justify-center gap-2.5 bg-green-500 text-white px-5 py-3 rounded-full shadow-lg transition-all duration-300 sm:hover:bg-green-600 sm:hover:scale-105 active:opacity-80 sm:active:scale-95 sm:hover:shadow-xl mobile-create-btn cursor-pointer touch-manipulation select-none"
          >
            <FaPlus className="text-sm mobile-create-icon" />
            <span className="font-medium text-base sm:text-lg mobile-create-text">Create playlist with top tracks</span>
          </button>
        )}
      </div>

      {/* TRANSITIONS BETWEEN TABS */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'tracks' ? renderTopTracks() : renderTopArtists()}
        </motion.div>
      </AnimatePresence>
      
      <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        accessToken={accessToken}
      />

      {/* Subtle portfolio disclaimer */}
      <div className="mt-16 text-center text-xs text-white/40" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 3rem)' }}>
        <p>Demo Mode • 30s audio previews & artwork sourced via Apple iTunes API for non-commercial portfolio demonstration.</p>
      </div>
    </div>
  );
};

export default Stats;
