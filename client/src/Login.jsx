import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  FaGithub,
  FaLinkedin,
  FaCode,
  FaExternalLinkAlt,
  FaMusic,
  FaLayerGroup,
  FaChartBar,
  FaTimes,
  FaHeart,
  FaApple
} from 'react-icons/fa';
import polishTracks from './mock/polishTracks.json';

/**
 * Top interactive showcase card on login page using GPU-accelerated Framer Motion.
 */
const LoginTopCardItem = ({
  item,
  track,
  onSwipe,
  isIntroRunning
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 260], [-18, 18]);
  const deleteOpacity = useTransform(x, [-15, -70], [0, 1]);
  const deleteScale = useTransform(x, [-15, -70], [0.85, 1.1]);
  const keepOpacity = useTransform(x, [15, 70], [0, 1]);
  const keepScale = useTransform(x, [15, 70], [0.85, 1.1]);

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
  const hasDraggedRef = useRef(false);

  // Run intro demo tilt only once on mount of the initial card
  useEffect(() => {
    if (!isIntroRunning) return;
    let cancelled = false;

    const runDemo = async () => {
      await new Promise(r => setTimeout(r, 600));
      if (cancelled) return;
      await animate(x, -60, { duration: 0.5, ease: 'easeOut' });
      await new Promise(r => setTimeout(r, 450));
      if (cancelled) return;
      await animate(x, 60, { duration: 0.6, ease: 'easeInOut' });
      await new Promise(r => setTimeout(r, 450));
      if (cancelled) return;
      await animate(x, 0, { duration: 0.45, ease: 'easeOut' });
    };

    runDemo();

    return () => {
      cancelled = true;
    };
  }, [isIntroRunning, x]);

  const handleDragStart = () => {
    hasDraggedRef.current = false;
  };

  const handleDrag = (_, info) => {
    if (Math.abs(info.offset.x) > 6) {
      hasDraggedRef.current = true;
    }
  };

  const handleDragEnd = (_, info) => {
    const threshold = 80;
    const velocity = Math.abs(info.velocity.x);
    if (info.offset.x > threshold || (info.offset.x > 30 && velocity > 400)) {
      setLocalExit('right');
      onSwipe('right');
    } else if (info.offset.x < -threshold || (info.offset.x < -30 && velocity > 400)) {
      setLocalExit('left');
      onSwipe('left');
    }
  };

  const handleKeepClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setLocalExit('right');
    onSwipe('right');
  };

  const handleRemoveClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setLocalExit('left');
    onSwipe('left');
  };

  const albumImage = track?.album?.images?.[0]?.url;
  const trackName = track?.name || 'Tarcho Terror';
  const artistName = track?.artists?.map(a => a.name).join(', ') || 'Otsochodzi';
  const exitX = typeof window !== 'undefined' && window.innerWidth < 640 ? 420 : 800;

  return (
    <motion.div
      key={`login-card-${item.index}`}
      className="absolute inset-0 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden will-change-transform select-none top-card touch-none"
      style={{
        touchAction: 'none',
        x,
        rotate,
        boxShadow: dynamicBoxShadow,
        zIndex: 10,
        cursor: 'grab',
        transformOrigin: 'center bottom'
      }}
      initial={{ scale: 1, y: 0, opacity: 1 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{
        x: localExit === 'right' ? exitX : localExit === 'left' ? -exitX : 0,
        rotate: localExit === 'right' ? 24 : localExit === 'left' ? -24 : 0,
        opacity: 0,
        transition: { duration: 0.32, ease: 'easeOut' }
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
      <div className="relative flex-1 min-h-0 overflow-hidden bg-gray-900">
        <img
          src={albumImage}
          alt={trackName}
          draggable={false}
          className="w-full h-full object-cover select-none pointer-events-none"
        />

        {/* Track Title & Artist Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-4 text-left pointer-events-none">
          <h3 className="text-white font-bold text-sm sm:text-base leading-tight drop-shadow truncate">{trackName}</h3>
          <p className="text-gray-200 text-xs sm:text-sm drop-shadow truncate mt-0.5">{artistName}</p>
        </div>

        {/* DELETE Stamp Badge */}
        <motion.div
          className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 bg-red-500 text-white font-extrabold text-xs sm:text-sm px-3.5 py-1 rounded-full shadow-lg border-2 border-white pointer-events-none transform -rotate-12"
          style={{ opacity: deleteOpacity, scale: deleteScale }}
        >
          DELETE
        </motion.div>

        {/* KEEP Stamp Badge */}
        <motion.div
          className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 bg-green-500 text-white font-extrabold text-xs sm:text-sm px-3.5 py-1 rounded-full shadow-lg border-2 border-white pointer-events-none transform rotate-12"
          style={{ opacity: keepOpacity, scale: keepScale }}
        >
          KEEP
        </motion.div>
      </div>

      {/* Bottom Button Controls */}
      <div className="flex justify-around items-center py-2.5 sm:py-3 px-3 bg-white border-t border-gray-100">
        <button
          type="button"
          onClick={handleRemoveClick}
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-full shadow-md flex items-center justify-center text-red-500 bg-white hover:bg-red-50 active:scale-95 transition-transform border border-gray-200 cursor-pointer touch-manipulation"
          title="Remove from playlist"
        >
          <FaTimes size={16} />
        </button>

        <a
          href={track?.external_urls?.apple || track?.external_urls?.spotify || "https://music.apple.com"}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black shadow-md flex items-center justify-center text-white border border-gray-700 hover:scale-105 active:scale-95 transition-transform cursor-pointer touch-manipulation"
          title="Listen on Apple Music"
        >
          <FaApple size={14} />
        </a>

        <button
          type="button"
          onClick={handleKeepClick}
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-full shadow-md flex items-center justify-center text-green-500 bg-white hover:bg-green-50 active:scale-95 transition-transform border border-gray-200 cursor-pointer touch-manipulation"
          title="Keep in playlist"
        >
          <FaHeart size={16} />
        </button>
      </div>
    </motion.div>
  );
};

/**
 * Underlying cards in the showcase deck.
 */
const LoginStackCardItem = ({ item, track, stackIndex }) => {
  const albumImage = track?.album?.images?.[0]?.url;
  const trackName = track?.name || 'Tarcho Terror';
  const artistName = track?.artists?.map(a => a.name).join(', ') || 'Otsochodzi';

  return (
    <motion.div
      key={`login-card-${item.index}`}
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
        <img
          src={albumImage}
          alt={trackName}
          draggable={false}
          className="w-full h-full object-cover select-none"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-4 text-left">
          <h3 className="text-white font-bold text-sm sm:text-base leading-tight drop-shadow truncate">{trackName}</h3>
          <p className="text-gray-200 text-xs sm:text-sm drop-shadow truncate mt-0.5">{artistName}</p>
        </div>
      </div>
      <div className="flex justify-around items-center py-2.5 sm:py-3 px-3 bg-white border-t border-gray-100 opacity-60">
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-gray-200 flex items-center justify-center text-red-300">
          <FaTimes size={16} />
        </div>
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 flex items-center justify-center text-white/50">
          <FaApple size={14} />
        </div>
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-gray-200 flex items-center justify-center text-green-300">
          <FaHeart size={16} />
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Interactive Swipe Showcase Card with authentic multi-card stack:
 * - Renders stacked deck with real next cards beneath (eliminates white flashing)
 * - Full-bleed artwork with dark gradient metadata
 * - Integrated bottom action bar (Red X, Apple Music, Green Heart)
 * - Fluid GPU-accelerated drag physics matching main player
 */
function SwipeableShowcaseCard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasRunIntro, setHasRunIntro] = useState(false);

  // Curated showcase tracks starting with Otsochodzi - Tarcho Terror
  const demoTracks = useMemo(() => {
    const tarcho = polishTracks.find(t => t.name?.toLowerCase().includes('tarcho terror')) || polishTracks[6];
    return [
      tarcho,
      polishTracks[0], // RIOTT - Nienawidzę Warszawy
      polishTracks[1], // Cock.0z - Dorex
      polishTracks[2], // EX UMBRA - Na śmierć i życie
      polishTracks[4], // A Nie Mówiłem? - Turkus
      polishTracks[5]  // Radio Gruz - Chaczapuri
    ].filter(Boolean);
  }, []);

  // Preload all showcase artwork so there is never any loading delay
  useEffect(() => {
    demoTracks.forEach(t => {
      const url = t?.album?.images?.[0]?.url;
      if (url) {
        const img = new Image();
        img.src = url;
      }
    });
  }, [demoTracks]);

  const handleSwipe = useCallback(() => {
    setCurrentIndex(prev => prev + 1);
    setHasRunIntro(true);
  }, []);

  // Multi-card stack: render current top card + 2 cards underneath
  const visibleCards = [0, 1, 2].map(offset => {
    const absoluteIndex = currentIndex + offset;
    const track = demoTracks[absoluteIndex % demoTracks.length];
    return {
      track,
      index: absoluteIndex,
      stackIndex: offset
    };
  });

  return (
    <div className="relative py-2 w-full flex flex-col items-center justify-center select-none">
      {/* Perspective wrapper holding the card stack */}
      <div
        className="relative mx-auto w-[84vw] max-w-[320px] h-[380px] sm:w-[350px] sm:max-w-[350px] sm:h-[420px]"
        style={{
          perspective: '1000px'
        }}
      >
        <AnimatePresence mode="popLayout">
          {visibleCards.map((item) => {
            const isTopCard = item.stackIndex === 0;

            if (isTopCard) {
              return (
                <LoginTopCardItem
                  key={`login-card-${item.index}`}
                  item={item}
                  track={item.track}
                  onSwipe={handleSwipe}
                  isIntroRunning={!hasRunIntro && currentIndex === 0}
                />
              );
            }

            return (
              <LoginStackCardItem
                key={`login-card-${item.index}`}
                item={item}
                track={item.track}
                stackIndex={item.stackIndex}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Subtle user hint */}
      <p className="text-[11px] text-gray-300 font-medium mt-3 text-center">
        Swipe card or click buttons to test
      </p>
    </div>
  );
}

function Login({ handleLogin, handleDemoLogin }) {
  // Clear any residual demo login on landing page mount
  useEffect(() => {
    localStorage.removeItem("slidefy_demo_logged_in");
  }, []);

  return (
    <div className="flex flex-col justify-center flex-grow relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

      {/* Mobile Title & Subtitle: Displayed at top on mobile only */}
      <div className="block lg:hidden mb-6 text-left">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-xl flex items-center gap-3">
          <span>Slidefy</span>
          <span className="text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 uppercase tracking-widest">
            Demo
          </span>
        </h1>

        <p className="text-sm sm:text-base text-gray-200 mt-2 font-medium leading-relaxed"
          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
          Tinder-style swipe interface to clean and curate Spotify playlists and view listening stats.
        </p>
      </div>

      {/* Main Grid: On mobile Login Card is first (order-1), Showcase is second (order-2). On desktop Showcase is left, Login is right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-grow my-auto">

        {/* LAUNCH CARD: order-1 on mobile (directly below mobile title), order-2 on desktop */}
        <div className="order-1 lg:order-2 lg:col-span-5 flex flex-col justify-center items-center lg:items-end space-y-4">
          <div
            className="w-full max-w-md p-6 sm:p-8 rounded-3xl backdrop-blur-2xl border border-white/20 shadow-2xl relative overflow-hidden"
            style={{
              background: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(25px)',
            }}
          >
            {/* Ambient background glow inside card */}
            <div className="absolute -top-16 -right-16 w-44 h-44 bg-green-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-6">

              {/* Card Header */}
              <div className="text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  Experience Slidefy
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 mt-1">
                  1-Click demo with Polish rap samples, 30s audio previews, and live stats.
                </p>
              </div>

              {/* Feature Points with glowing icons */}
              <div className="space-y-3 py-1">
                <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="p-2 rounded-xl bg-green-500/20 text-green-400 mt-0.5">
                    <FaLayerGroup size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white">Tinder-Style Swiping</h4>
                    <p className="text-[11px] sm:text-xs text-gray-300">Swipe right to keep, swipe left to delete from playlist.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <FaMusic size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white">30s Audio Previews</h4>
                    <p className="text-[11px] sm:text-xs text-gray-300">Authentic high-quality audio previews streamed via Apple CDN.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 mt-0.5">
                    <FaChartBar size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white">Spoti Stats & Creator</h4>
                    <p className="text-[11px] sm:text-xs text-gray-300">Explore top tracks/artists and generate instant custom playlists.</p>
                  </div>
                </div>
              </div>

              {/* Main Launch Button */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleDemoLogin || handleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-400 hover:to-emerald-400 text-white font-bold text-base sm:text-lg px-6 py-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-102 hover:shadow-green-500/30 group cursor-pointer border border-green-300/40"
                >
                  <span>Try Interactive Demo</span>
                </button>
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] sm:text-[11px] text-center text-gray-400 leading-snug">
                Client-side portfolio showcase. No Spotify credentials required.
              </p>
            </div>
          </div>

          {/* Buttons: Repositories & Tests + Developer Social Links */}
          <div className="w-full max-w-md space-y-2.5 pt-1">
            {/* Top row: Code Repos & Unit Tests */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <a
                href="https://github.com/budziun/slidefy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-md border border-white/20 shadow-md transition-all duration-300 hover:scale-105"
              >
                <FaGithub className="text-base" />
                <span>Original Spotify Repo</span>
                <FaExternalLinkAlt className="text-[10px] text-gray-400" />
              </a>

              <a
                href="https://github.com/budziun/slidefy-demo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-md border border-white/20 shadow-md transition-all duration-300 hover:scale-105"
              >
                <FaGithub className="text-base text-emerald-400" />
                <span>Demo Showcase Repo</span>
                <FaExternalLinkAlt className="text-[10px] text-gray-400" />
              </a>
            </div>

            {/* Bottom row: Developer & Portfolio Links */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <a
                href="https://budziun.pl"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-md border border-white/20 shadow-md transition-all duration-300 hover:scale-105"
                title="Portfolio & Personal Website"
              >
                <FaCode className="text-emerald-400 text-xs" />
                <span>www.budziun.pl</span>
              </a>

              <a
                href="https://github.com/budziun"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-md border border-white/20 shadow-md transition-all duration-300 hover:scale-105"
                title="GitHub Profile"
              >
                <FaGithub className="text-sm" />
                <span>GitHub</span>
              </a>

              <a
                href="https://www.linkedin.com/in/jakub-budzich/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0077b5]/30 hover:bg-[#0077b5]/50 text-white text-xs sm:text-sm font-semibold backdrop-blur-md border border-[#0077b5]/50 shadow-md transition-all duration-300 hover:scale-105"
                title="LinkedIn Profile"
              >
                <FaLinkedin className="text-sm text-blue-300" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>

        {/* SHOWCASE & STORY: order-2 on mobile, order-1 on desktop */}
        <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col justify-center space-y-6">

          {/* Desktop Title & Subtitle (hidden on mobile, visible on desktop) */}
          <div className="hidden lg:block">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white drop-shadow-xl flex items-center gap-3">
              <span>Slidefy</span>
              <span className="text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 uppercase tracking-widest">
                Demo
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-200 mt-2 font-medium max-w-xl leading-relaxed"
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
              Tinder-style swipe interface to clean and curate Spotify playlists and view listening stats.
            </p>
          </div>

          {/* Authentic In-App UI Swipe Showcase Card */}
          <SwipeableShowcaseCard />

          {/* Project Story / Description Card */}
          <div
            className="p-5 sm:p-6 rounded-3xl backdrop-blur-xl border border-white/20 shadow-xl space-y-3"
            style={{
              background: 'rgba(255, 255, 255, 0.07)',
            }}
          >
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                About The Project & Concept
              </h3>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                A music curation web application combining card-swiping mechanics (Tinder-style) with playlist management. It enables rapid listening, previewing, and curation — swipe right to keep a track, swipe left to remove it from the playlist.
              </p>
            </div>

            <div className="pt-2 border-t border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                Why Interactive Mock Demo?
              </h3>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                Following Spotify API policy restrictions (deprecation of the Web Playback SDK for dev/free accounts and a strict 25-user quota), the project was revamped into a <strong>fully autonomous portfolio showcase</strong>. It features a virtual client-side backend, emulated Spotify player, and <strong>authentic 30-second audio previews</strong> streamed from the Apple Music / iTunes API.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
