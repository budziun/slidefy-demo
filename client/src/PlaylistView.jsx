import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuestion, FaHeart, FaTimes } from 'react-icons/fa';
import SpotifyPlayer from './SpotifyPlayer';
import SongCard from './SongCard';
import CompletionScreen from './CompletionScreen';
import AnimationsAndModal from './AnimationsAndModal';
import { usePlaylistData } from './hooks/usePlaylistData';

const PlaylistView = ({ playlist, accessToken, onRemoveSong, onKeepSong, onDeletePlaylist, onPlaylistComplete }) => {
  const [playerKey, setPlayerKey] = useState(0);
  const [showPlayPause, setShowPlayPause] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);  //eslint-disable-line no-unused-vars
  const [isDragging, setIsDragging] = useState(false); //eslint-disable-line no-unused-vars
  const [animationAction, setAnimationAction] = useState(null);
  const [volumeAnimation, setVolumeAnimation] = useState(null);
  const [seekAnimation, setSeekAnimation] = useState(null);
  const [flyingHearts, setFlyingHearts] = useState([]);
  const [flyingX, setFlyingX] = useState([]);
  const [exitDirection, setExitDirection] = useState(null);
  const [buttonAnimationTrigger, setButtonAnimationTrigger] = useState(null);

  // Animation functions
  const createFlyingHeart = useCallback(() => {
    const newHeart = {
      id: Date.now() + Math.random(),
      x: Math.random() * 100,
      delay: Math.random() * 0.3
    };
    setFlyingHearts(prev => [...prev, newHeart]);
    
    setTimeout(() => {
      setFlyingHearts(prev => prev.filter(heart => heart.id !== newHeart.id));
    }, 2000);
  }, []);

  const createFlyingX = useCallback(() => {
    const newX = {
      id: Date.now() + Math.random(),
      x: Math.random() * 100,
      delay: Math.random() * 0.3
    };
    setFlyingX(prev => [...prev, newX]);
    
    setTimeout(() => {
      setFlyingX(prev => prev.filter(x => x.id !== newX.id));
    }, 2000);
  }, []);

  // Animation trigger callback
  const handleAnimationTrigger = useCallback((type) => {
    if (type === 'keep') {
      setExitDirection('right');
      setButtonAnimationTrigger('keep');
      createFlyingHeart();
      createFlyingHeart();
      createFlyingHeart();
    } else if (type === 'remove') {
      setExitDirection('left');
      setButtonAnimationTrigger('remove'); 
      createFlyingX();
      createFlyingX();
      createFlyingX();
    }
    
    // Reset triggers
    setTimeout(() => {
      setExitDirection(null);
      setButtonAnimationTrigger(null);
    }, 600);
  }, [createFlyingHeart, createFlyingX]);

  const {
    currentIndex,
    keptCount,
    removedCount,
    userToken,
    shuffledTracks,
    backgroundColors,
    showShortcutsModal,
    setShowShortcutsModal,
    handleKeep,
    handleRemove,
    handleBackToPlaylists
  } = usePlaylistData(playlist, onRemoveSong, onKeepSong, handleAnimationTrigger, onPlaylistComplete);

  const showVolumeAnimation = useCallback((type, value, isMuted = false) => {
    setVolumeAnimation({ type, value, isMuted });
    setTimeout(() => {
      setVolumeAnimation(null);
    }, 1500);
  }, []);

  const showSeekAnimation = useCallback((direction) => {
    setSeekAnimation(direction);
    setTimeout(() => {
      setSeekAnimation(null);
    }, 1200);
  }, []);

  const handleCoverClick = useCallback(async () => {
    if (isDragging) return;
    
    const currentState = await new Promise((resolve) => {
      const checkStateEvent = new CustomEvent('getPlaybackState');
      window.addEventListener('playbackStateResponse', (e) => {
        resolve(e.detail.isPlaying);
      }, { once: true });
      window.dispatchEvent(checkStateEvent);
    });
    
    setAnimationAction(currentState ? 'pause' : 'play');
    setShowPlayPause(true);
    
    const event = new CustomEvent('togglePlayback', {
      detail: { shouldPlay: !currentState }
    });
    window.dispatchEvent(event);
    
    setIsPlaying(!currentState);
    
    setTimeout(() => {
      setShowPlayPause(false);
      setAnimationAction(null);
    }, 800);
  }, [isDragging]);

  useEffect(() => { 
    setPlayerKey(prev => prev + 1); 
  }, [currentIndex]);

  // CLEANUP EFFECT dla PlaylistView
  useEffect(() => {
    
    return () => {
      
      // Force stop przy unmount PlaylistView
      const stopEvent = new CustomEvent('stopPlayback');
      window.dispatchEvent(stopEvent);
      
      const forceStopEvent = new CustomEvent('forceStop');
      window.dispatchEvent(forceStopEvent);
      
      // Backup pause
      if (userToken) {
        fetch(`https://api.spotify.com/v1/me/player/pause`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${userToken}`,
          },
        }).catch(err => console.log('PlaylistView cleanup error:', err));
      }
    };
  }, [userToken]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      if (showShortcutsModal) {
        if (event.key === 'Escape') {
          event.preventDefault();
          setShowShortcutsModal(false);
        }
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          if (!isDragging && currentIndex < shuffledTracks.length) {
            handleRemove();
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (!isDragging && currentIndex < shuffledTracks.length) {
            handleKeep();
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          const increaseVolumeEvent = new CustomEvent('adjustVolume', {
            detail: { change: 5 }
          });
          window.dispatchEvent(increaseVolumeEvent);
          
          window.addEventListener('volumeChanged', (e) => {
            showVolumeAnimation('up', e.detail.volume, e.detail.isMuted);
          }, { once: true });
          break;
        case 'ArrowDown':
          event.preventDefault();
          const decreaseVolumeEvent = new CustomEvent('adjustVolume', {
            detail: { change: -5 }
          });
          window.dispatchEvent(decreaseVolumeEvent);
          
          window.addEventListener('volumeChanged', (e) => {
            showVolumeAnimation('down', e.detail.volume, e.detail.isMuted);
          }, { once: true });
          break;
        case 'm':
        case 'M':
          event.preventDefault();
          const muteEvent = new CustomEvent('toggleMute');
          window.dispatchEvent(muteEvent);
          
          window.addEventListener('muteChanged', (e) => {
            showVolumeAnimation(e.detail.isMuted ? 'mute' : 'unmute', e.detail.volume, e.detail.isMuted);
          }, { once: true });
          break;
        case 'a':
        case 'A':
          event.preventDefault();
          const seekBackwardEvent = new CustomEvent('seekBackward');
          window.dispatchEvent(seekBackwardEvent);
          showSeekAnimation('backward');
          break;
        case 'd':
        case 'D':
          event.preventDefault();
          const seekForwardEvent = new CustomEvent('seekForward');
          window.dispatchEvent(seekForwardEvent);
          showSeekAnimation('forward');
          break;
        case ' ':
          event.preventDefault();
          handleCoverClick();
          break;
        case 'Escape':
          event.preventDefault();
          handleBackToPlaylists();
          break;
        case 'Enter':
          event.preventDefault();
          if (currentIndex >= shuffledTracks.length) {
            handleBackToPlaylists();
          }
          break;
        case '?':
          event.preventDefault();
          setShowShortcutsModal(true);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, //eslint-disable-next-line 
  [isDragging, currentIndex, shuffledTracks.length, showShortcutsModal, handleKeep, handleRemove, showVolumeAnimation, showSeekAnimation, handleCoverClick, handleBackToPlaylists]);

  // Check if playlist is empty at the start
  if (!shuffledTracks || shuffledTracks.length === 0) {
    return (
      <CompletionScreen
        playlist={playlist}
        keptCount={0}
        removedCount={0}
        backgroundColors={backgroundColors}
        onBackToPlaylists={handleBackToPlaylists}
        onDeletePlaylist={onDeletePlaylist}
        isEmpty={true}
      />
    );
  }

  if (currentIndex >= shuffledTracks.length) {
    return (
      <>
        <AnimationsAndModal 
          showShortcutsModal={showShortcutsModal}
          setShowShortcutsModal={setShowShortcutsModal}
        />
        <CompletionScreen
          playlist={playlist}
          keptCount={keptCount}
          removedCount={removedCount}
          backgroundColors={backgroundColors}
          onBackToPlaylists={handleBackToPlaylists}
        />
      </>
    );
  }

  const currentSong = shuffledTracks[currentIndex]?.track;

  return (
    <div
      className="w-full h-screen flex flex-col overflow-hidden"
      style={{
        background: `linear-gradient(135deg, 
          rgba(${backgroundColors.primary}, 0.5) 0%, 
          rgba(${backgroundColors.secondary}, 0.4) 50%, 
          rgba(${backgroundColors.tertiary}, 0.5) 100%), 
          linear-gradient(45deg, rgba(20,20,20,0.7) 0%, rgba(40,40,40,0.5) 100%)`
      }}
    >
      <AnimationsAndModal 
        showShortcutsModal={showShortcutsModal}
        setShowShortcutsModal={setShowShortcutsModal}
      />
      
      {/* Flying Hearts */}
      <AnimatePresence>
        {flyingHearts.map((heart) => (
          <motion.div
            key={heart.id}
            className="fixed pointer-events-none z-50"
            style={{ left: `${heart.x}%`, top: '50%' }}
            initial={{ opacity: 0, scale: 0.5, y: 0 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              scale: [0.5, 1.2, 1, 0.8], 
              y: -200,
              x: Math.random() * 40 - 20
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, delay: heart.delay, ease: "easeOut" }}
          >
            <FaHeart className="text-green-500 text-2xl drop-shadow-lg" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Flying X's */}
      <AnimatePresence>
        {flyingX.map((x) => (
          <motion.div
            key={x.id}
            className="fixed pointer-events-none z-50"
            style={{ left: `${x.x}%`, top: '50%' }}
            initial={{ opacity: 0, scale: 0.5, y: 0 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              scale: [0.5, 1.2, 1, 0.8], 
              y: -200,
              x: Math.random() * 40 - 20
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, delay: x.delay, ease: "easeOut" }}
          >
            <FaTimes className="text-red-500 text-2xl drop-shadow-lg" />
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Header */}
      <div className="flex-shrink-0 flex justify-center px-2 py-0.5 sm:px-4 sm:py-2">
        <div className="w-full max-w-4xl px-2 sm:px-4">
          <div className="flex items-center justify-between bg-black/20 backdrop-blur-sm rounded-lg px-2 sm:px-4 py-1.5 sm:py-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBackToPlaylists}
                className="flex items-center gap-2 bg-white text-gray-800 px-4 py-2 rounded-full shadow hover:bg-gray-100 transition-all border border-gray-300 cursor-pointer touch-manipulation select-none active:opacity-80"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.707 14.707a1 1 0 01-1.414 0L2.586 11l3.707-3.707a1 1 0 011.414 1.414L5.414 10H14a4 4 0 110 8h-1a1 1 0 110-2h1a2 2 0 100-4H5.414l2.293 2.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Back
              </button>
              
              <button
                onClick={() => setShowShortcutsModal(true)}
                className="hidden sm:flex w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full items-center justify-center transition-all border border-white/30 hover:scale-110"
                title="Keyboard shortcuts"
              >
                <FaQuestion size={14} />
              </button>
            </div>
            
            <div className="text-center">
              <h1 className="text-sm sm:text-base lg:text-lg font-bold text-white">{playlist.name}</h1>
              <p className="text-xs text-gray-300">{`${currentIndex + 1} / ${playlist.tracks.total}`}</p>
            </div>
            <div className="flex space-x-1">
              <span className="bg-green-500/20 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs text-green-400 font-semibold">
                {keptCount}
              </span>
              <span className="bg-red-500/20 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs text-red-400 font-semibold">
                {removedCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-2 sm:px-4 min-h-0">
        <div className="w-full max-w-4xl flex flex-col h-full">
          
        <SongCard
          shuffledTracks={shuffledTracks}
          currentIndex={currentIndex}
          onKeep={handleKeep}
          onRemove={handleRemove}
          backgroundColors={backgroundColors}
          userToken={userToken}
          onCoverClick={handleCoverClick}
          showPlayPause={showPlayPause}
          animationAction={animationAction}
          volumeAnimation={volumeAnimation}
          seekAnimation={seekAnimation}
          exitDirection={exitDirection}
          triggerButtonAnimation={buttonAnimationTrigger}
        />
          
          <div className="flex-shrink-0 w-full px-1 sm:px-2">
            {currentSong && (
              <SpotifyPlayer
                key={`spotify-player-${playerKey}`}
                token={userToken}
                trackUri={currentSong.uri}
                onPlayStateChange={setIsPlaying}
              />
            )}
            <div className="text-center text-[11px] sm:text-[10px] text-white/75 sm:text-white/40 pt-1 pb-5 sm:pb-1 px-2 font-medium">
              Demo Mode • 30s audio previews & artwork sourced via Apple iTunes API for non-commercial portfolio demonstration.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistView;
