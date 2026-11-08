import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeDown, FaVolumeMute } from 'react-icons/fa';
import { MdReplay10, MdForward10 } from 'react-icons/md';

const TIMING_CONSTANTS = {
  SYNC_DELAY: 800, // ZWIĘKSZONE: Opóźnienie (Debounce) dla ochrony przed błędem 429
  EARLY_POSITION_THRESHOLD: 2000,
  PROGRESS_UPDATE_INTERVAL: 500,
  SEEK_JUMP_MS: 10000,
  VOLUME_SYNC_DELAY: 300,
  MUTE_TOGGLE_DELAY: 50,
  PLAYER_INIT_DELAY: 100,
  SYNC_INTERVAL: 1000,
  RETRY_DELAY: 2500 // NOWE: Czas do ponowienia po błędzie API
};

const VOLUME_CONSTANTS = {
  DEFAULT: 50,
  MIN: 0,
  MAX: 100,
  STORAGE_KEY: 'spotify-matcher-volume'
};

const DEVICE_STORAGE_KEY = 'spotify_device_id';

const ERROR_MESSAGES = {
  NO_PREMIUM: 'Spotify Premium account is required for playback.',
  AUTH_FAILED: 'Authentication failed. Please refresh the page and try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  PLAYBACK_ERROR: 'Playback error occurred. Please try again.',
  DEVICE_ERROR: 'Could not connect to Spotify device.',
  INITIALIZATION_ERROR: 'Failed to initialize Spotify player.'
};

const SpotifyPlayer = ({ token, trackUri, onPlayStateChange }) => {
  // Helper Functions
  const formatTime = (milliseconds) => {
    if (!milliseconds) return '0:00';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  const shouldIgnoreEarlyPosition = (timeSinceStart, position) => {
    return timeSinceStart < TIMING_CONSTANTS.EARLY_POSITION_THRESHOLD && 
           position > 0 && 
           position < TIMING_CONSTANTS.EARLY_POSITION_THRESHOLD;
  };

  const getResponsiveIconSize = () => window.innerWidth > 768 ? 16 : 14;

  const createVolumeEvent = (eventType, volume, isMuted) => {
    return new CustomEvent(eventType, {
      detail: { volume, isMuted }
    });
  };

  const validatePlayerState = (state) => {
    return state && 
           state.track_window && 
           state.track_window.current_track && 
           mountedRef.current;
  };

  const validateTrackUri = (uri) => {
    return uri && uri.startsWith('spotify:track:');
  };

  const handlePlayerError = (error, context) => {
    console.error(`Spotify Player Error in ${context}:`, error);
    
    if (error.message?.includes('authentication')) {
      setError(ERROR_MESSAGES.AUTH_FAILED);
    } else if (error.message?.includes('Premium')) {
      setError(ERROR_MESSAGES.NO_PREMIUM);
    } else if (error.message?.includes('network')) {
      setError(ERROR_MESSAGES.NETWORK_ERROR);
    } else {
      setError(`${ERROR_MESSAGES.PLAYBACK_ERROR} ${error.message || 'Unknown error'}`);
    }
  };

  const [player, setPlayer] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(30000);
  const [currentTrackUri, setCurrentTrackUri] = useState(null); // eslint-disable-line no-unused-vars

  const getNormalizedDuration = (dur) => {
    // In demo / mock mode with 30s previews, duration is always fixed to 30000 (0:30)
    if (window.Spotify?.isMock) return 30000;
    return (dur && dur > 0) ? dur : 30000;
  };
  
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem(VOLUME_CONSTANTS.STORAGE_KEY);
    return savedVolume ? parseInt(savedVolume) : VOLUME_CONSTANTS.DEFAULT;
  });
  
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(VOLUME_CONSTANTS.DEFAULT);
  
  const progressInterval = useRef(null);
  const lastUpdateTimeRef = useRef(Date.now());
  const isInitializedRef = useRef(false);
  const mountedRef = useRef(true);
  const trackStartTimeRef = useRef(Date.now());
  
  // === NOWE REFY DO NAPRAWY BŁĘDÓW ===
  const playTimeoutRef = useRef(null); // Do debouncingu (naprawa 429)
  const isSwitchingTrackRef = useRef(false); // Do race condition (naprawa UI glitch)

  // Reset state when track changes
  useEffect(() => {
    if (trackUri) {
      // Immediate state reset for smooth UI transitions
      setCurrentPosition(0);
      setDuration(30000);
      setIsPlaying(false);
      setCurrentTrackUri(trackUri);
      trackStartTimeRef.current = Date.now();
      lastUpdateTimeRef.current = Date.now();
    }
  }, [trackUri]);

  /**
   * Synchronize component state with Spotify player
   */
  const syncWithPlayer = useCallback(async () => {
    if (player && mountedRef.current) {
      try {
        const state = await player.getCurrentState();
        if (validatePlayerState(state)) {
          const newUri = state.track_window.current_track.uri;
          
          // Ignore event if it comes from previous track
          if (newUri !== trackUri) {
            return;
          }
          
          // === FIX: IGNORUJ PAUZĘ PODCZAS PRZEŁĄCZANIA UTWORU ===
          if (isSwitchingTrackRef.current && state.paused) {
            return;
          }

          // Ignore early positions in the first 2 seconds
          const timeSinceStart = Date.now() - trackStartTimeRef.current;
          if (shouldIgnoreEarlyPosition(timeSinceStart, state.position)) {
            return;
          }
          
          setCurrentTrackUri(newUri);
          setCurrentPosition(state.position);
          setDuration(getNormalizedDuration(state.duration));
          setIsPlaying(!state.paused);
          lastUpdateTimeRef.current = Date.now();
          
          if (onPlayStateChange) {
            onPlayStateChange(!state.paused);
          }
        }
      } catch (error) {
        handlePlayerError(error, 'sync');
        setTimeout(() => {
          if (mountedRef.current) {
            syncWithPlayer();
          }
        }, TIMING_CONSTANTS.SYNC_INTERVAL);
      }
    }
  }, [player, onPlayStateChange, trackUri]);

  /**
   * Handle volume change
   * @param {number} newVolume - New volume value (0-100)
   */
  const handleVolumeChange = useCallback((newVolume) => {
    setVolume(newVolume);
    localStorage.setItem(VOLUME_CONSTANTS.STORAGE_KEY, newVolume.toString());
    
    if (player) {
      player.setVolume(newVolume / 100).then(() => {
        setTimeout(syncWithPlayer, TIMING_CONSTANTS.SYNC_DELAY);
      }).catch(error => {
        handlePlayerError(error, 'volume change');
      });
    }
    
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [player, isMuted, syncWithPlayer]);

  /**
   * Toggle mute state
   */
  const toggleMute = useCallback(() => {
    if (isMuted) {
      setVolume(previousVolume);
      localStorage.setItem(VOLUME_CONSTANTS.STORAGE_KEY, previousVolume.toString());
      setIsMuted(false);
      if (player) {
        player.setVolume(previousVolume / 100).then(() => {
          setTimeout(syncWithPlayer, TIMING_CONSTANTS.SYNC_DELAY);
        }).catch(error => {
          handlePlayerError(error, 'unmute');
        });
      }
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      localStorage.setItem(VOLUME_CONSTANTS.STORAGE_KEY, '0');
      setIsMuted(true);
      if (player) {
        player.setVolume(0).then(() => {
          setTimeout(syncWithPlayer, TIMING_CONSTANTS.SYNC_DELAY);
        }).catch(error => {
          handlePlayerError(error, 'mute');
        });
      }
    }
  }, [isMuted, previousVolume, volume, player, syncWithPlayer]);

  /**
   * Get appropriate volume icon based on current volume
   */
  const getVolumeIcon = () => {
    const iconSize = getResponsiveIconSize();
    if (isMuted || volume === 0) return <FaVolumeMute className="text-white" size={iconSize} />;
    if (volume < 50) return <FaVolumeDown className="text-white" size={iconSize} />;
    return <FaVolumeUp className="text-white" size={iconSize} />;
  };

  /**
   * Skip backward 10 seconds
   */
  const skipBackward = useCallback(async () => {
    if (player && currentPosition > TIMING_CONSTANTS.SEEK_JUMP_MS) {
      const newPosition = Math.max(0, currentPosition - TIMING_CONSTANTS.SEEK_JUMP_MS);
      try {
        await player.seek(newPosition);
        setCurrentPosition(newPosition);
        lastUpdateTimeRef.current = Date.now();
      } catch (error) {
        handlePlayerError(error, 'skip backward');
      }
    }
  }, [player, currentPosition]);

  /**
   * Skip forward 10 seconds
   */
  const skipForward = useCallback(async () => {
    if (player && duration > 0) {
      const newPosition = Math.min(duration, currentPosition + TIMING_CONSTANTS.SEEK_JUMP_MS);
      try {
        await player.seek(newPosition);
        setCurrentPosition(newPosition);
        lastUpdateTimeRef.current = Date.now();
      } catch (error) {
        handlePlayerError(error, 'skip forward');
      }
    }
  }, [player, duration, currentPosition]);

  /**
   * Toggle play/pause state
   */
  const togglePlayback = async () => {
    if (player) {
      try {
        await player.togglePlay();
        setTimeout(syncWithPlayer, TIMING_CONSTANTS.SYNC_DELAY);
      } catch (error) {
        handlePlayerError(error, 'toggle playback');
      }
    }
  };

  /**
   * Seek to specific position by clicking on progress bar
   */
  const seekToPosition = (event) => {
    if (!player || !duration) return;
    
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentageClicked = clickX / rect.width;
    const positionMs = Math.floor(duration * percentageClicked);
    
    player.seek(positionMs).then(() => {
      if (mountedRef.current) {
        setCurrentPosition(positionMs);
        lastUpdateTimeRef.current = Date.now();
      }
    }).catch(error => {
      handlePlayerError(error, 'seek to position');
    });
  };

  /**
   * Reset player state to initial values
   */
  const resetPlayerState = () => {
    if (!mountedRef.current) return;
    
    setCurrentPosition(0);
    setDuration(30000);
    setIsPlaying(false);
    lastUpdateTimeRef.current = Date.now();
    
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    
  };

  /**
   * Reset and start progress timer
   */
  const resetAndStartTimer = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    lastUpdateTimeRef.current = Date.now();

    const updateTimer = () => {
      if (isPlaying && mountedRef.current && duration > 0) {
        const now = Date.now();
        const elapsed = now - lastUpdateTimeRef.current;
        lastUpdateTimeRef.current = now;

        setCurrentPosition(prevPosition => {
          const newPosition = prevPosition + elapsed;
          return newPosition < duration ? newPosition : prevPosition;
        });
      }
    };

    progressInterval.current = setInterval(updateTimer, TIMING_CONSTANTS.PROGRESS_UPDATE_INTERVAL);
  }, [isPlaying, duration]);

  /**
   * Play a specific song - ZMODYFIKOWANA WERSJA
   * @param {string} device_id - Spotify device ID
   * @param {string} uri - Spotify track URI
   */
  const playSong = useCallback(async (device_id, uri, isRetry = false) => {
    if (!validateTrackUri(uri) || !token || !mountedRef.current) return;
    // Zapobiegaj puszczaniu starych piosenek, jeśli użytkownik już zmienił kartę
    if (uri !== trackUri && !isRetry) return;
    
    try {
      // === FIX: Race condition (flaga) ===
      isSwitchingTrackRef.current = true;

      // Immediate UI reset tylko przy pierwszym podejściu
      if (!isRetry) {
        setCurrentPosition(0);
        setDuration(30000);
        setIsPlaying(false);
        setCurrentTrackUri(uri);
        trackStartTimeRef.current = Date.now();
      }

      // If running with mock player, play directly through player
      if (player && typeof player.playTrack === 'function') {
        player.playTrack(uri);
        if (mountedRef.current) {
          setError(null);
        }
        return;
      }
      
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
        method: 'PUT',
        body: JSON.stringify({ uris: [uri] }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // === FIX: Auto Retry przy 429 lub 5xx ===
        if ((response.status === 429 || response.status >= 500) && !isRetry) {
           console.warn(`Spotify API Limit (429). Retrying in ${TIMING_CONSTANTS.RETRY_DELAY}ms...`);
           setTimeout(() => {
             if (mountedRef.current && trackUri === uri) {
               playSong(device_id, uri, true);
             }
           }, TIMING_CONSTANTS.RETRY_DELAY);
           return;
        }

        if (mountedRef.current) {
          setError(`${ERROR_MESSAGES.PLAYBACK_ERROR} ${response.statusText}`);
        }
      } else {
        if (mountedRef.current) {
          setError(null);
        }
      }
    } catch (error) {
      if (mountedRef.current) {
        setError(`${ERROR_MESSAGES.NETWORK_ERROR} ${error.message}`);
      }
    } finally {
      // Zdejmij flagę po chwili
      setTimeout(() => {
        isSwitchingTrackRef.current = false;
      }, 1500);
    }
  }, [player, token, trackUri]);

  // Handle external volume controls
  useEffect(() => {
    const handleAdjustVolume = (event) => {
      const change = event.detail.change;
      const newVolume = Math.max(VOLUME_CONSTANTS.MIN, Math.min(VOLUME_CONSTANTS.MAX, volume + change));
      handleVolumeChange(newVolume);
      
      window.dispatchEvent(createVolumeEvent('volumeChanged', newVolume, isMuted));
    };

    const handleToggleMute = (event) => {
      const wasMuted = isMuted;
      toggleMute();
      
      setTimeout(() => {
        const muteChangedEvent = createVolumeEvent('muteChanged', wasMuted ? previousVolume : 0, !wasMuted);
        window.dispatchEvent(muteChangedEvent);
        
        setTimeout(syncWithPlayer, TIMING_CONSTANTS.VOLUME_SYNC_DELAY);
      }, TIMING_CONSTANTS.MUTE_TOGGLE_DELAY);
    };

    const handleSeekBackward = async () => {
      await skipBackward();
      setTimeout(syncWithPlayer, TIMING_CONSTANTS.PLAYER_INIT_DELAY);
    };

    const handleSeekForward = async () => {
      await skipForward();
      setTimeout(syncWithPlayer, TIMING_CONSTANTS.PLAYER_INIT_DELAY);
    };

    window.addEventListener('adjustVolume', handleAdjustVolume);
    window.addEventListener('toggleMute', handleToggleMute);
    window.addEventListener('seekBackward', handleSeekBackward);
    window.addEventListener('seekForward', handleSeekForward);

    return () => {
      window.removeEventListener('adjustVolume', handleAdjustVolume);
      window.removeEventListener('toggleMute', handleToggleMute);
      window.removeEventListener('seekBackward', handleSeekBackward);
      window.removeEventListener('seekForward', handleSeekForward);
    };
  }, [volume, isMuted, previousVolume, player, currentPosition, duration, handleVolumeChange, skipBackward, skipForward, syncWithPlayer, toggleMute]);

  // Player state change listener with filtering for old events and early positions
  useEffect(() => {
    if (player) {
      const handleStateChange = (state) => {
        if (validatePlayerState(state)) {
          const newUri = state.track_window.current_track.uri;
          
          // Ignore event if it comes from previous track
          if (newUri !== trackUri) {
            return;
          }
          
          // === FIX: IGNORUJ PAUZĘ PODCZAS PRZEŁĄCZANIA ===
          if (isSwitchingTrackRef.current && state.paused) {
             return;
          }

          // Ignore early positions in the first 2 seconds
          const timeSinceStart = Date.now() - trackStartTimeRef.current;
          if (shouldIgnoreEarlyPosition(timeSinceStart, state.position)) {
            // Update only duration and isPlaying, but not position
            setCurrentTrackUri(newUri);
            setDuration(getNormalizedDuration(state.duration));
            setIsPlaying(!state.paused);
            lastUpdateTimeRef.current = Date.now();
            
            if (onPlayStateChange) {
              onPlayStateChange(!state.paused);
            }
            return;
          }
          
          setCurrentTrackUri(newUri);
          setCurrentPosition(state.position);
          setDuration(getNormalizedDuration(state.duration));
          setIsPlaying(!state.paused);
          lastUpdateTimeRef.current = Date.now();
          
          if (onPlayStateChange) {
            onPlayStateChange(!state.paused);
          }
        }
      };

      player.addListener('player_state_changed', handleStateChange);
      
      return () => {
        player.removeListener('player_state_changed', handleStateChange);
      };
    }
  }, [player, onPlayStateChange, trackUri]);

  // External playback controls
  useEffect(() => {
    const handleTogglePlayback = async () => {
      if (player) {
        try {
          await player.togglePlay();
          
          setTimeout(async () => {
            const state = await player.getCurrentState();
            if (state) {
              const newIsPlaying = !state.paused;
              setIsPlaying(newIsPlaying);
              
              if (onPlayStateChange) {
                onPlayStateChange(newIsPlaying);
              }
            }
          }, TIMING_CONSTANTS.SYNC_DELAY);
          
        } catch (error) {
          handlePlayerError(error, 'external toggle playback');
        }
      }
    };

    const handleGetPlaybackState = async () => {
      if (player) {
        try {
          const state = await player.getCurrentState();
          const responseEvent = new CustomEvent('playbackStateResponse', {
            detail: { isPlaying: state ? !state.paused : false }
          });
          window.dispatchEvent(responseEvent);
        } catch (error) {
          console.error('Error getting playback state:', error);
          const responseEvent = new CustomEvent('playbackStateResponse', {
            detail: { isPlaying: false }
          });
          window.dispatchEvent(responseEvent);
        }
      }
    };

    const handleStopPlayback = async () => {
      if (player) {
        try {
          await player.pause();
          setIsPlaying(false);
          if (onPlayStateChange) {
            onPlayStateChange(false);
          }
        } catch (error) {
          handlePlayerError(error, 'stop playback');
        }
      }
    };

    window.addEventListener('togglePlayback', handleTogglePlayback);
    window.addEventListener('getPlaybackState', handleGetPlaybackState);
    window.addEventListener('stopPlayback', handleStopPlayback);
    
    return () => {
      window.removeEventListener('togglePlayback', handleTogglePlayback);
      window.removeEventListener('getPlaybackState', handleGetPlaybackState);
      window.removeEventListener('stopPlayback', handleStopPlayback);
    };
  }, [player, onPlayStateChange]);

  // Progress timer management
  useEffect(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    if (isPlaying && duration > 0) {
      resetAndStartTimer();
      const syncInterval = setInterval(syncWithPlayer, TIMING_CONSTANTS.SYNC_INTERVAL);
      
      return () => {
        clearInterval(syncInterval);
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
        }
      };
    }
  }, [isPlaying, resetAndStartTimer, syncWithPlayer, duration]);

  // Spotify Player initialization
  useEffect(() => {
    if (!token) return;
    
    if (window.spotifyPlayerInstance && window.spotifyPlayerInstance.isConnected) {
      setPlayer(window.spotifyPlayerInstance.player);
      setIsConnected(true);
      if (window.spotifyPlayerInstance.player) {
        window.spotifyPlayerInstance.player.setVolume(volume / 100);
      }
      return;
    }

    if (isInitializedRef.current) return;
    
    // In mock demo mode, do NOT inject real Spotify SDK script to avoid WebSocket connection errors
    if (!window.Spotify?.isMock && !document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }

    const initSpotifyPlayer = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'Slidefy Matcher Player',
        getOAuthToken: cb => cb(token),
        volume: volume / 100,
      });

      setPlayer(spotifyPlayer);
      
      window.spotifyPlayerInstance = {
        player: spotifyPlayer,
        isConnected: false
      };

      spotifyPlayer.addListener('ready', ({ device_id }) => {
        if (mountedRef.current) {
          setIsConnected(true);
          setError(null);
          localStorage.setItem(DEVICE_STORAGE_KEY, device_id);
          window.spotifyPlayerInstance.isConnected = true;
          isInitializedRef.current = true;
          
          spotifyPlayer.setVolume(volume / 100);
        }
      });

      // Listener with filtering for old events and early positions
      spotifyPlayer.addListener('player_state_changed', state => {
        if (validatePlayerState(state)) {
          const newUri = state.track_window.current_track.uri;
          
          // Ignore event if it comes from previous track
          if (newUri && trackUri && newUri !== trackUri) {
            return;
          }
          
          // === FIX: Race condition check ===
          if (isSwitchingTrackRef.current && state.paused) {
             return;
          }

          // Ignore early positions in the first 2 seconds
          const timeSinceStart = Date.now() - trackStartTimeRef.current;
          if (shouldIgnoreEarlyPosition(timeSinceStart, state.position)) {
            // Update only duration and isPlaying, but not position
            setCurrentTrackUri(newUri);
            setIsPlaying(!state.paused);
            setDuration(getNormalizedDuration(state.duration));
            lastUpdateTimeRef.current = Date.now();
            
            if (onPlayStateChange) {
              onPlayStateChange(!state.paused);
            }
            return;
          }
          
          setCurrentTrackUri(newUri);
          setIsPlaying(!state.paused);
          setCurrentPosition(state.position);
          setDuration(getNormalizedDuration(state.duration));
          lastUpdateTimeRef.current = Date.now();
          
          if (onPlayStateChange) {
            onPlayStateChange(!state.paused);
          }
        }
      });

      spotifyPlayer.addListener('not_ready', () => {
        if (mountedRef.current) {
          setIsConnected(false);
          if (window.spotifyPlayerInstance) {
            window.spotifyPlayerInstance.isConnected = false;
          }
          console.log('Spotify player not ready');
        }
      });
      
      spotifyPlayer.addListener('initialization_error', ({ message }) => {
        if (mountedRef.current) {
          setError(`${ERROR_MESSAGES.INITIALIZATION_ERROR} ${message}`);
          console.error('Spotify player initialization error:', message);
        }
      });
      
      spotifyPlayer.addListener('authentication_error', ({ message }) => {
        if (mountedRef.current) {
          setError(`${ERROR_MESSAGES.AUTH_FAILED} ${message}`);
          console.error('Spotify player authentication error:', message);
        }
      });
      
      spotifyPlayer.addListener('account_error', ({ message }) => {
        if (mountedRef.current) {
          setError(`${ERROR_MESSAGES.NO_PREMIUM} ${message}`);
          console.error('Spotify player account error:', message);
        }
      });

      spotifyPlayer.connect();
    };

    if (window.Spotify?.isMock || window.Spotify?.Player) {
      initSpotifyPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = initSpotifyPlayer;
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, [token, volume, onPlayStateChange, trackUri]);

  // Effect 7: Track change handler - === GŁÓWNA NAPRAWA (DEBOUNCE) ===
  useEffect(() => {
    if (isConnected && trackUri && mountedRef.current) {
      
      // 1. Czyścimy poprzednie zapytanie
      if (playTimeoutRef.current) {
         clearTimeout(playTimeoutRef.current);
         playTimeoutRef.current = null;
      }
      
      resetPlayerState();
      
      const deviceId = localStorage.getItem(DEVICE_STORAGE_KEY);
      if (deviceId) {
        // In mock/demo mode play immediately without Spotify 429 rate-limiting delay
        const isMockMode = Boolean(window.Spotify?.isMock);
        const debounceDelay = isMockMode ? 60 : TIMING_CONSTANTS.SYNC_DELAY;

        // 2. Ustawiamy timeout (Debounce)
        playTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            playSong(deviceId, trackUri);
          }
        }, debounceDelay);
      }
    }

    // 3. Cleanup przy zmianie karty
    return () => {
       if (playTimeoutRef.current) {
         clearTimeout(playTimeoutRef.current);
       }
    }
  }, [trackUri, isConnected, playSong]);

  // Effect 8: Component mount/unmount cleanup
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      
      // Clear all intervals
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
    };
  }, []);

  // Unified loading state with identical dimensions
  const renderLoadingState = () => (
    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 border border-white/30 w-full mx-auto">
      <div className="mb-1.5 sm:mb-2">
        <div className="flex justify-between text-xs text-white font-medium mb-1">
          <span>0:00</span>
          <span>0:30</span>
        </div>
        <div className="w-full h-1 sm:h-1.5 rounded-full bg-white/30 relative cursor-pointer">
          <div className="absolute left-0 top-0 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white rounded-full transform -translate-y-0.5 shadow-lg"></div>
          <div className="h-full rounded-full bg-white/60" style={{ width: '0%' }}/>
        </div>
      </div>
      
      <div className="flex items-center justify-center space-x-6 sm:space-x-6 my-1 sm:mb-2">
        <button disabled className="p-2 sm:p-1 rounded-full opacity-50 cursor-not-allowed">
          <MdReplay10 className="text-2xl sm:text-lg text-white" />
        </button>
        
        {/* Spinner w miejscu Play */}
        <button disabled className="bg-white/30 w-12 h-12 sm:w-10 sm:h-10 rounded-full opacity-50 cursor-not-allowed flex items-center justify-center">
           <div className="w-4 h-4 sm:w-3 sm:h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </button>
        
        <button disabled className="p-2 sm:p-1 rounded-full opacity-50 cursor-not-allowed">
          <MdForward10 className="text-2xl sm:text-lg text-white" />
        </button>
      </div>
      
      <div className="hidden sm:flex items-center justify-center space-x-2 sm:space-x-3">
        <button className="text-white p-1">
          <FaVolumeUp size={getResponsiveIconSize()} />
        </button>
        <div className="relative w-20 sm:w-32">
          <div className="w-full h-1 sm:h-1.5 bg-white/30 rounded-full"></div>
          <div 
            className="absolute top-0 left-0 h-1 sm:h-1.5 bg-white rounded-full" 
            style={{ width: `${volume}%` }}
          ></div>
          <input
            type="range"
            min={VOLUME_CONSTANTS.MIN}
            max={VOLUME_CONSTANTS.MAX}
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="absolute top-0 left-0 w-full h-1 sm:h-1.5 opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );

  // Error state
  if (error) {
  return (
    <div className="bg-red-500/30 backdrop-blur-sm rounded-lg px-3 sm:px-5 py-3 sm:py-4 border-2 border-red-400 w-full mx-auto">
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0">⚠️</span>
        <div>
          <p className="text-red-100 text-sm sm:text-base font-semibold">Error</p>
          <p className="text-red-50 text-xs sm:text-sm mt-1">{error}</p>
        </div>
      </div>
    </div>
  );
}

  // Loading state (Zmienione: pokazuj tylko gdy faktycznie nie ma połączenia)
  if (!isConnected) {
    return renderLoadingState();
  }

  // Main player UI
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 border border-white/30 w-full mx-auto transition-all">
      <div className="mb-1.5 sm:mb-2">
        <div className="flex justify-between text-xs text-white font-medium mb-1">
          <span>{formatTime(currentPosition)}</span>
          <span>{formatTime(getNormalizedDuration(duration))}</span>
        </div>
        {/* Progress bar with identical dimensions as loading state */}
        <div className="w-full h-1 sm:h-1.5 rounded-full bg-white/30 relative cursor-pointer"
             onClick={seekToPosition}>
          <div 
            className="absolute top-0 left-0 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white rounded-full transform -translate-y-0.5 shadow-lg" 
            style={{ left: `${duration > 0 ? (currentPosition / duration) * 100 : 0}%`, marginLeft: '-4px' }}
          ></div>
          <div 
            className="h-full rounded-full bg-white/60" 
            style={{ width: `${duration > 0 ? (currentPosition / duration) * 100 : 0}%` }}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-center space-x-6 sm:space-x-6 my-1 sm:mb-2">
        <button
          type="button"
          onClick={skipBackward}
          className="p-2 sm:p-1 rounded-full text-white hover:bg-white/20 transition-all active:opacity-80 sm:active:scale-95 touch-manipulation cursor-pointer"
          title="Skip backward 10 seconds"
        >
          <MdReplay10 className="text-2xl sm:text-lg" />
        </button>
        
        {/* Play/pause button with responsive touch-friendly dimensions */}
        <button
          type="button"
          onClick={togglePlayback}
          className="bg-white/30 hover:bg-white/40 w-12 h-12 sm:w-10 sm:h-10 rounded-full text-white transition-all active:opacity-80 sm:active:scale-95 shadow-md flex items-center justify-center touch-manipulation cursor-pointer"
        >
          {isPlaying ? (
            <FaPause className="text-base sm:text-xs" />
          ) : (
            <FaPlay className="text-base sm:text-xs ml-0.5" />
          )}
        </button>
        
        <button
          type="button"
          onClick={skipForward}
          className="p-2 sm:p-1 rounded-full text-white hover:bg-white/20 transition-all active:opacity-80 sm:active:scale-95 touch-manipulation cursor-pointer"
          title="Skip forward 10 seconds"
        >
          <MdForward10 className="text-2xl sm:text-lg" />
        </button>
      </div>
      
      {/* Volume control: hidden on mobile, visible on sm and up */}
      <div className="hidden sm:flex items-center justify-center space-x-2 sm:space-x-3">
        <button onClick={toggleMute} className="text-white hover:bg-white/20 p-1 rounded transition-all">
          {getVolumeIcon()}
        </button>
        <div className="relative w-20 sm:w-32">
          {/* Volume slider with identical dimensions */}
          <div className="w-full h-1 sm:h-1.5 bg-white/30 rounded-full"></div>
          <div 
            className="absolute top-0 left-0 h-1 sm:h-1.5 bg-white rounded-full" 
            style={{ width: `${volume}%` }}
          ></div>
          <input
            type="range"
            min={VOLUME_CONSTANTS.MIN}
            max={VOLUME_CONSTANTS.MAX}
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="absolute top-0 left-0 w-full h-1 sm:h-1.5 opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default SpotifyPlayer;