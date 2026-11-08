import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Default colors for fallback when image color extraction fails
const DEFAULT_COLORS = {
  primary: '60,60,60',
  secondary: '40,40,40',
  tertiary: '80,80,80'
};

export const usePlaylistData = (playlist, onRemoveSong, onKeepSong, onAnimationTrigger, onPlaylistComplete) => {
  // State management
  const [currentIndex, setCurrentIndex] = useState(0);
  const [keptCount, setKeptCount] = useState(0);
  const [removedCount, setRemovedCount] = useState(0);
  const [userToken, setUserToken] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [shuffledTracks, setShuffledTracks] = useState([]);
  const [backgroundColors, setBackgroundColors] = useState(DEFAULT_COLORS);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Centralized function to stop Spotify playback
   * Used across multiple components to ensure consistent behavior
   */
  const stopPlayback = useCallback(() => {
    // Dispatch custom events for components listening to playback events
    const stopEvent = new CustomEvent('stopPlayback');
    window.dispatchEvent(stopEvent);
    
    const forceStopEvent = new CustomEvent('forceStop');
    window.dispatchEvent(forceStopEvent);
    
    // Backup API call to Spotify Web API to ensure playback stops
    if (userToken) {
      fetch(`https://api.spotify.com/v1/me/player/pause`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${userToken}` },
      }).catch(err => console.log('Pause error:', err));
    }
  }, [userToken]);

  /**
   * Fisher-Yates shuffle algorithm for randomizing track order
   * @param {Array} array - Array of tracks to shuffle
   * @returns {Array} Shuffled array
   */
  const shuffleArray = useCallback((array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  /**
   * Extract colors from album artwork to create dynamic background
   * Uses hybrid approach combining edge detection and color frequency analysis
   * @param {string} imageUrl - URL of the album artwork
   * @returns {Promise<Object>} Promise resolving to color object
   */
  const extractHybridAmbilightColors = useCallback((imageUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      let isResolved = false;
      
      // Cleanup function to prevent memory leaks
      const cleanup = () => {
        if (!isResolved) {
          img.onload = null;
          img.onerror = null;
          isResolved = true;
        }
      };
      
      img.onload = () => {
        cleanup();
        
        // Create canvas for image processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 200;
        ctx.drawImage(img, 0, 0, 200, 200);
        
        try {
          const imageData = ctx.getImageData(0, 0, 200, 200);
          const data = imageData.data;
          const width = 200;
          const height = 200;
          
          // Extract colors from image edges (Ambilight effect)
          const edgeColors = [];
          const borderWidth = 15;
          
          for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
              const index = (y * width + x) * 4;
              if (data[index + 3] < 128) continue; // Skip transparent pixels
              
              // Check if pixel is on the border
              if (y < borderWidth || y > height - borderWidth || 
                  x < borderWidth || x > width - borderWidth) {
                edgeColors.push({
                  r: data[index],
                  g: data[index + 1],
                  b: data[index + 2]
                });
              }
            }
          }
          
          // Calculate average edge color
          let edgeColor = '60,60,60';
          if (edgeColors.length > 0) {
            const avgEdge = edgeColors.reduce((acc, color) => ({
              r: acc.r + color.r,
              g: acc.g + color.g,
              b: acc.b + color.b
            }), { r: 0, g: 0, b: 0 });
            
            edgeColor = `${Math.round(avgEdge.r / edgeColors.length)},${Math.round(avgEdge.g / edgeColors.length)},${Math.round(avgEdge.b / edgeColors.length)}`;
          }
          
          // Find most frequent colors in the image
          const colorMap = {};
          const tolerance = 25;
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const alpha = data[i + 3];
            
            if (alpha < 128) continue; // Skip transparent pixels
            
            // Group similar colors together
            const rGroup = Math.round(r / tolerance) * tolerance;
            const gGroup = Math.round(g / tolerance) * tolerance;
            const bGroup = Math.round(b / tolerance) * tolerance;
            const colorKey = `${rGroup},${gGroup},${bGroup}`;
            
            colorMap[colorKey] = (colorMap[colorKey] || 0) + 1;
          }
          
          // Sort colors by frequency
          const sortedColors = Object.entries(colorMap)
            .sort(([,a], [,b]) => b - a)
            .map(([color]) => color);
          
          const mostFrequent = sortedColors[0] || '40,40,40';
          const secondMostFrequent = sortedColors[1] || '80,80,80';
          
          // Calculate color difference for better contrast
          const getColorDifference = (color1, color2) => {
            const [r1, g1, b1] = color1.split(',').map(Number);
            const [r2, g2, b2] = color2.split(',').map(Number);
            return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
          };
          
          let finalSecondary = mostFrequent;
          let finalTertiary = secondMostFrequent;
          
          // Adjust colors if they're too similar to edge color
          if (getColorDifference(edgeColor, mostFrequent) < 60) {
            const [r, g, b] = mostFrequent.split(',').map(Number);
            finalSecondary = `${Math.max(0, r - 30)},${Math.max(0, g - 30)},${Math.max(0, b - 30)}`;
          }
          
          // Adjust tertiary color if too similar to secondary
          if (getColorDifference(finalSecondary, secondMostFrequent) < 60) {
            const [r, g, b] = finalSecondary.split(',').map(Number);
            finalTertiary = `${Math.min(255, r + 40)},${Math.min(255, g + 40)},${Math.min(255, b + 40)}`;
          }
          
          resolve({
            primary: edgeColor,
            secondary: finalSecondary,
            tertiary: finalTertiary
          });
          
        } catch (error) {
          console.error('Error processing image for color extraction:', error);
          resolve(DEFAULT_COLORS);
        }
      };
      
      // Handle image load error
      img.onerror = () => {
        cleanup();
        resolve(DEFAULT_COLORS);
      };
      
      img.src = imageUrl;
    });
  }, []);

  /**
   * Fetch access token from backend
   * Handles authentication and token expiry
   */
  const fetchToken = useCallback(async () => {
    try {
      const response = await fetch('/api/token', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setUserToken(data.accessToken);
      setTokenExpiry(Date.now() + (data.expires_in || 3600) * 1000);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching token:', error);
      setError('Failed to fetch authentication token. Please try logging in again.');
    }
  }, []);

  /**
   * Refresh token if it's about to expire (5 minutes before expiry)
   */
  // eslint-disable-next-line no-unused-vars
  const refreshTokenIfNeeded = useCallback(async () => {
    if (!tokenExpiry || Date.now() > tokenExpiry - 300000) {
      await fetchToken();
    }
  }, [tokenExpiry, fetchToken]);

  /**
   * Handle keeping a song (swipe right)
   * Updates counters and triggers animations immediately and smoothly
   */
  const handleKeep = useCallback(() => {
    // Trigger animation before logic
    if (onAnimationTrigger) {
      onAnimationTrigger('keep');
    }
    
    setKeptCount(prev => prev + 1);
    setCurrentIndex(prev => prev + 1);
    setIsLoading(false);
    
    if (onKeepSong) {
      onKeepSong(currentIndex);
    }
    setError(null);
  }, [onKeepSong, currentIndex, onAnimationTrigger]);

  /**
   * Handle removing a song (swipe left)
   * Removes from Spotify playlist and updates local state
   */
  const handleRemove = useCallback(async () => {
    // Trigger animation before logic
    if (onAnimationTrigger) {
      onAnimationTrigger('remove');
    }
    
    // Update local UI immediately so animation is 100% instant and lag-free (optimistic update)
    setRemovedCount(prev => prev + 1);
    setCurrentIndex(prev => prev + 1);
    setIsLoading(false);
    if (onRemoveSong) {
      onRemoveSong(currentIndex);
    }
    setError(null);

    // Execute backend deletion in background without blocking the card slide animation
    try {
      const trackUri = shuffledTracks[currentIndex]?.track?.uri;
      const playlistId = playlist?.id;
      
      if (trackUri && playlistId) {
        await axios.delete(`/api/playlist/${playlistId}/remove-track`, {
          data: { trackUri: trackUri },
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        });
      }
    } catch (error) {
      console.error("Error removing track:", error);
    }
  }, [shuffledTracks, currentIndex, playlist?.id, onRemoveSong, onAnimationTrigger]);

  /**
   * Handle returning to playlists view
   * Stops playback and navigates back
   */
  const handleBackToPlaylists = useCallback(() => {
    
    // Stop playback before navigating
    stopPlayback();
    
    // Delay navigation to ensure playback stops
    setTimeout(() => {
      if (onPlaylistComplete) {
        onPlaylistComplete();
      } else {
        // Fallback to page reload if callback not available
        window.location.reload();
      }
    }, 200);
  }, [onPlaylistComplete, stopPlayback]);

  // Effect: Initialize shuffled tracks when playlist changes
  useEffect(() => {
    if (playlist?.tracks?.items) {
      const shuffled = shuffleArray(playlist.tracks.items);
      setShuffledTracks(shuffled);
      setCurrentIndex(0); // Reset index when playlist changes
    }
  }, [playlist, shuffleArray]);

  // Effect: Fetch initial token
  useEffect(() => { 
    fetchToken(); 
  }, [fetchToken]);
  
  // Effect: Update background colors when current song changes
  useEffect(() => {
    const currentSong = shuffledTracks[currentIndex]?.track;
    const trackImage = currentSong?.album?.images?.[0]?.url;
    
    if (trackImage) {
      extractHybridAmbilightColors(trackImage).then(setBackgroundColors);
    } else {
      setBackgroundColors(DEFAULT_COLORS);
    }
  }, [currentIndex, shuffledTracks, extractHybridAmbilightColors]);

  // Effect: Handle playlist completion
  useEffect(() => {
    if (currentIndex >= shuffledTracks.length && shuffledTracks.length > 0) {
      stopPlayback();
    }
  }, [currentIndex, shuffledTracks, stopPlayback]);

  // Effect: Cleanup on component unmount
  useEffect(() => {
    // Capture current token to avoid stale closure
    const currentToken = userToken;
    
    // Cleanup function called when component unmounts
    return () => {
      
      // Stop playback on unmount
      const stopEvent = new CustomEvent('stopPlayback');
      window.dispatchEvent(stopEvent);
      
      const forceStopEvent = new CustomEvent('forceStop');
      window.dispatchEvent(forceStopEvent);
      
      // Backup API call with captured token
      if (currentToken) {
        fetch(`https://api.spotify.com/v1/me/player/pause`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${currentToken}` },
        }).catch(err => console.log('Cleanup pause error:', err));
      }
    };
  }, [userToken]);

  // Return hook state and functions
  return {
    // State
    currentIndex,
    setCurrentIndex,
    keptCount,
    removedCount,
    userToken,
    shuffledTracks,
    backgroundColors,
    showShortcutsModal,
    setShowShortcutsModal,
    error,
    setError,
    isLoading,
    
    // Functions
    handleKeep,
    handleRemove,
    handleBackToPlaylists,
    
    // Utilities
    stopPlayback
  };
};
