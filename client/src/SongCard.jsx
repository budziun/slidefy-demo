import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useIsPresent } from 'framer-motion';
import { FaHeart, FaTimes, FaApple, FaPlay, FaPause, FaVolumeUp, FaVolumeDown, FaVolumeMute } from 'react-icons/fa';
import { MdReplay10, MdForward10 } from 'react-icons/md';

/**
 * Top interactive card in the swipe stack.
 * Uses GPU-accelerated Framer Motion motion values for 1:1 fluid tracking with zero lag.
 */
const TopCardItem = ({
  item,
  song,
  trackImage,
  artistNames,
  onKeep,
  onRemove,
  onCoverClick,
  showPlayPause,
  animationAction,
  volumeAnimation,
  seekAnimation,
  userToken,
  handleOpenInItunes,
  exitDirection
}) => {
  const isPresent = useIsPresent();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 260], [-18, 18]);
  const deleteOpacity = useTransform(x, [-25, -90], [0, 1]);
  const deleteScale = useTransform(x, [-25, -90], [0.85, 1.1]);
  const keepOpacity = useTransform(x, [25, 90], [0, 1]);
  const keepScale = useTransform(x, [25, 90], [0.85, 1.1]);

  // Clean shadow with a neutral deadzone between -30px and 30px so next song never has leftover glow
  const dynamicBoxShadow = useTransform(
    x,
    [-140, -30, 0, 30, 140],
    [
      '0 0 35px rgba(239, 68, 68, 0.75)',
      '0 20px 40px rgba(0, 0, 0, 0.25)',
      '0 20px 40px rgba(0, 0, 0, 0.25)',
      '0 20px 40px rgba(0, 0, 0, 0.25)',
      '0 0 35px rgba(34, 197, 94, 0.75)'
    ]
  );

  const [localExit, setLocalExit] = useState(null);
  const exitDirRef = useRef(null);
  const hasDraggedRef = useRef(false);

  const handleDragStart = () => {
    hasDraggedRef.current = false;
  };

  const handleDrag = (_, info) => {
    if (Math.abs(info.offset.x) > 8) {
      hasDraggedRef.current = true;
    }
  };

  const handleDragEnd = (_, info) => {
    const threshold = 85;
    const velocity = Math.abs(info.velocity.x);
    const offset = info.offset.x;
    if (offset > threshold || (offset > 35 && velocity > 400)) {
      exitDirRef.current = 'right';
      setLocalExit('right');
      onKeep();
    } else if (offset < -threshold || (offset < -35 && velocity > 400)) {
      exitDirRef.current = 'left';
      setLocalExit('left');
      onRemove();
    }
  };

  const handleKeepClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    exitDirRef.current = 'right';
    setLocalExit('right');
    onKeep();
  };

  const handleRemoveClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    exitDirRef.current = 'left';
    setLocalExit('left');
    onRemove();
  };

  const resolvedExit = exitDirRef.current || exitDirection || localExit || (x.get() >= 0 ? 'right' : 'left');
  // On desktop keep 850px for cinematic exit; on mobile fly out across the full screen width
  const exitX =
    typeof window !== 'undefined' && window.innerWidth < 640
      ? window.innerWidth + 100
      : 850;

  return (
    <motion.div
      key={`top-card-${item.index}`}
      className="absolute inset-0 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden will-change-transform select-none top-card touch-none"
      style={{
        touchAction: 'none',
        x,
        rotate,
        boxShadow: dynamicBoxShadow,
        zIndex: isPresent ? 10 : 30,
        cursor: 'grab',
        transformOrigin: 'center bottom'
      }}
      initial={{ scale: 1, y: 0, opacity: 1 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{
        x: resolvedExit === 'right' ? exitX : -exitX,
        rotate: resolvedExit === 'right' ? 22 : -22,
        opacity: 0,
        transition: {
          x: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
          rotate: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.2, delay: 0.2 }
        }
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02, cursor: 'grabbing', zIndex: 20 }}
    >
      {/* Artwork Section */}
      <div
        className="relative flex-1 min-h-0 cursor-pointer overflow-hidden bg-gray-900"
        style={{ touchAction: 'none' }}
        onClick={() => {
          if (!hasDraggedRef.current) {
            onCoverClick();
          }
        }}
      >
        {trackImage ? (
          <img
            src={trackImage}
            alt={song.name}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600';
            }}
            className="w-full h-full object-cover select-none pointer-events-none"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-gray-500 text-4xl">🎵</span>
          </div>
        )}

        {/* Play / Pause Animated Overlay */}
        <AnimatePresence>
          {showPlayPause && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <motion.div
                initial={{ scale: 0.3, opacity: 0.8 }}
                animate={{ scale: 1.4, opacity: 0.95 }}
                exit={{ scale: 1.8, opacity: 0 }}
                transition={{
                  duration: 0.7,
                  ease: 'easeOut',
                  scale: { type: 'spring', stiffness: 160, damping: 14 }
                }}
              >
                {animationAction === 'pause' ? (
                  <FaPause
                    className="text-white text-7xl sm:text-8xl drop-shadow-2xl"
                    style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.6))' }}
                  />
                ) : (
                  <FaPlay
                    className="text-white text-7xl sm:text-8xl drop-shadow-2xl ml-2"
                    style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.6))' }}
                  />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Volume Animation Overlay */}
        <AnimatePresence>
          {volumeAnimation && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <motion.div
                initial={{ scale: 0.3, opacity: 0.8 }}
                animate={{ scale: 1.2, opacity: 0.95 }}
                exit={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 1.0, ease: 'easeOut' }}
                className="flex flex-col items-center"
              >
                {volumeAnimation.type === 'up' && (
                  <>
                    <FaVolumeUp className="text-white text-5xl sm:text-6xl drop-shadow-2xl mb-1.5" />
                    <div className="text-white text-xl sm:text-2xl font-bold drop-shadow-lg">{volumeAnimation.value}%</div>
                  </>
                )}
                {volumeAnimation.type === 'down' && (
                  <>
                    <FaVolumeDown className="text-white text-5xl sm:text-6xl drop-shadow-2xl mb-1.5" />
                    <div className="text-white text-xl sm:text-2xl font-bold drop-shadow-lg">{volumeAnimation.value}%</div>
                  </>
                )}
                {volumeAnimation.type === 'mute' && (
                  <FaVolumeMute className="text-white text-5xl sm:text-6xl drop-shadow-2xl" />
                )}
                {volumeAnimation.type === 'unmute' && (
                  <>
                    <FaVolumeUp className="text-white text-5xl sm:text-6xl drop-shadow-2xl mb-1.5" />
                    <div className="text-white text-lg sm:text-xl font-bold drop-shadow-lg">UNMUTED</div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Seek Feedback Overlay */}
        <AnimatePresence>
          {seekAnimation && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <motion.div
                initial={{ scale: 0.3, opacity: 0.8 }}
                animate={{ scale: 1.25, opacity: 0.95 }}
                exit={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="flex flex-col items-center"
              >
                {seekAnimation === 'backward' ? (
                  <>
                    <MdReplay10 className="text-white text-6xl sm:text-7xl drop-shadow-2xl mb-1" />
                    <div className="text-white text-base sm:text-lg font-bold drop-shadow-lg">-10s</div>
                  </>
                ) : (
                  <>
                    <MdForward10 className="text-white text-6xl sm:text-7xl drop-shadow-2xl mb-1" />
                    <div className="text-white text-base sm:text-lg font-bold drop-shadow-lg">+10s</div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Track Title & Artist Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-4 md:p-5 pointer-events-none">
          <h3 className="text-white text-sm sm:text-lg md:text-xl font-bold drop-shadow line-clamp-1">{song.name}</h3>
          <p className="text-gray-200 text-xs sm:text-sm md:text-base drop-shadow line-clamp-1 mt-0.5">{artistNames}</p>
        </div>

        {/* DELETE Stamp Badge */}
        <motion.div
          className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 bg-red-500 text-white font-extrabold text-xs sm:text-base px-3.5 sm:px-5 py-1 sm:py-1.5 rounded-full shadow-lg border-2 border-white pointer-events-none transform -rotate-12"
          style={{ opacity: deleteOpacity, scale: deleteScale }}
        >
          DELETE
        </motion.div>

        {/* KEEP Stamp Badge */}
        <motion.div
          className="absolute top-2.5 sm:top-4 right-2.5 sm:right-4 bg-green-500 text-white font-extrabold text-xs sm:text-base px-3.5 sm:px-5 py-1 sm:py-1.5 rounded-full shadow-lg border-2 border-white pointer-events-none transform rotate-12"
          style={{ opacity: keepOpacity, scale: keepScale }}
        >
          KEEP
        </motion.div>
      </div>

      {/* Bottom Button Controls */}
      <div className="flex justify-around items-center py-2 sm:py-3.5 px-3 sm:px-6 bg-white border-t border-gray-100">
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleRemoveClick}
          className="card-action-btn w-9 h-9 sm:w-12 sm:h-12 rounded-full shadow-md flex items-center justify-center text-red-500 bg-white hover:bg-red-50 active:scale-95 transition-transform border border-gray-200 cursor-pointer touch-manipulation"
          title="Remove from playlist"
        >
          <FaTimes size={18} />
        </button>

        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleOpenInItunes}
          title="Listen on Apple Music"
          className="card-action-btn w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black shadow-md flex items-center justify-center text-white border border-gray-700 hover:scale-105 active:scale-95 transition-transform cursor-pointer touch-manipulation"
        >
          <FaApple size={16} />
        </button>

        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleKeepClick}
          className="card-action-btn w-9 h-9 sm:w-12 sm:h-12 rounded-full shadow-md flex items-center justify-center text-green-500 bg-white hover:bg-green-50 active:scale-95 transition-transform border border-gray-200 cursor-pointer touch-manipulation"
          title="Keep in playlist"
        >
          <FaHeart size={18} />
        </button>
      </div>
    </motion.div>
  );
};

/**
 * Underlying cards in the stack.
 */
const StackCardItem = ({ item, song, trackImage, artistNames, stackIndex }) => {
  return (
    <motion.div
      key={`stack-card-${item.index}`}
      className="absolute inset-0 bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden will-change-transform pointer-events-none select-none"
      style={{
        zIndex: 10 - stackIndex,
        transformOrigin: 'center bottom'
      }}
      initial={{
        scale: 1 - stackIndex * 0.045,
        y: stackIndex * 7,
        opacity: 1
      }}
      animate={{
        scale: 1 - stackIndex * 0.045,
        y: stackIndex * 7,
        opacity: 1
      }}
      transition={{
        duration: 0.25,
        ease: 'easeOut'
      }}
    >
      <div className="relative flex-1 min-h-0 overflow-hidden bg-gray-900">
        {trackImage ? (
          <img
            src={trackImage}
            alt={song.name}
            className="w-full h-full object-cover select-none"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-gray-500 text-4xl">🎵</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-4 md:p-5">
          <h3 className="text-white text-sm sm:text-lg md:text-xl font-bold drop-shadow line-clamp-1">{song.name}</h3>
          <p className="text-gray-200 text-xs sm:text-sm md:text-base drop-shadow line-clamp-1 mt-0.5">{artistNames}</p>
        </div>
      </div>
      <div className="flex justify-around items-center py-2 sm:py-3.5 px-3 sm:px-6 bg-white border-t border-gray-100 opacity-60">
        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border border-gray-200 flex items-center justify-center text-red-300">
          <FaTimes size={18} />
        </div>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 flex items-center justify-center text-white/50">
          <FaApple size={16} />
        </div>
        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border border-gray-200 flex items-center justify-center text-green-300">
          <FaHeart size={18} />
        </div>
      </div>
    </motion.div>
  );
};

const SongCard = ({ 
  shuffledTracks, 
  currentIndex, 
  onKeep, 
  onRemove, 
  backgroundColors,
  userToken,
  onCoverClick,
  showPlayPause,
  animationAction,
  volumeAnimation,
  seekAnimation,
  exitDirection,
  triggerButtonAnimation
}) => {
  const handleOpenInItunes = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const currentSong = shuffledTracks[currentIndex]?.track;
    if (currentSong) {
      const query = encodeURIComponent(`${currentSong.name} ${currentSong.artists?.[0]?.name || ''}`);
      const appleUrl = `https://music.apple.com/pl/search?term=${query}`;
      window.open(appleUrl, '_blank');
    }
  }, [shuffledTracks, currentIndex]);

  const visibleCards = [];
  for (let i = 0; i < 3 && currentIndex + i < shuffledTracks.length; i++) {
    visibleCards.push({
      ...shuffledTracks[currentIndex + i],
      index: currentIndex + i
    });
  }

  return (
    <div className="mx-auto my-auto flex flex-col items-center justify-center select-none py-0 sm:py-1">
      {/* 
        Card viewport dimensions:
        On mobile: slightly smaller & more square (aspect ~1:1.1) so album art is square and player below fits effortlessly.
        On desktop: comfortably scaled up.
      */}
      <div
        className="relative w-[82vw] max-w-[325px] h-[86vw] max-h-[355px] sm:w-[480px] sm:max-w-[480px] sm:h-[560px] sm:max-h-[calc(100vh-230px)] md:w-[520px] md:max-w-[520px] md:h-[600px] md:max-h-[calc(100vh-230px)] lg:w-[560px] lg:max-w-[560px] lg:h-[650px] lg:max-h-[calc(100vh-220px)] xl:w-[600px] xl:max-w-[600px] xl:h-[700px] xl:max-h-[calc(100vh-210px)]"
        style={{
          perspective: '1000px'
        }}
      >
        <AnimatePresence mode="popLayout">
          {visibleCards.map((item, stackIndex) => {
            const song = item.track;
            const trackImage = song?.album?.images?.[0]?.url ?? '';
            const artistNames = song?.artists ? song.artists.map(a => a.name).join(', ') : '';
            const isTopCard = stackIndex === 0;

            if (isTopCard) {
              return (
                <TopCardItem
                  key={`top-card-${item.index}`}
                  item={item}
                  song={song}
                  trackImage={trackImage}
                  artistNames={artistNames}
                  onKeep={onKeep}
                  onRemove={onRemove}
                  onCoverClick={onCoverClick}
                  showPlayPause={showPlayPause}
                  animationAction={animationAction}
                  volumeAnimation={volumeAnimation}
                  seekAnimation={seekAnimation}
                  userToken={userToken}
                  handleOpenInItunes={handleOpenInItunes}
                  exitDirection={exitDirection}
                />
              );
            }

            return (
              <StackCardItem
                key={`stack-card-${item.index}`}
                item={item}
                song={song}
                trackImage={trackImage}
                artistNames={artistNames}
                stackIndex={stackIndex}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SongCard;
