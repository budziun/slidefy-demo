import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuestion, FaTimes } from 'react-icons/fa';

const AnimationsAndModal = ({ 
  showShortcutsModal, 
  setShowShortcutsModal,
  onKeyboardAction 
}) => {
  const [flyingQuestions, setFlyingQuestions] = useState([]);

  const createFlyingQuestion = useCallback(() => {
    const newQuestion = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      delay: Math.random() * 0.2,
      rotation: Math.random() * 360,
      scale: 0.8 + Math.random() * 0.4
    };
    
    setFlyingQuestions(prev => {
      if (prev.length >= 8) {
        return [...prev.slice(1), newQuestion];
      }
      return [...prev, newQuestion];
    });
  }, []);

  // Parent component should handle the volume animation
  //eslint-disable-next-line
  const showVolumeAnimation = useCallback((type, value, isMuted = false) => {
    if (onKeyboardAction) {
      onKeyboardAction('volume', { type, value, isMuted });
    }
  }, [onKeyboardAction]);

  // Parent component should handle the play/pause animation
  //eslint-disable-next-line
  const showSeekAnimation = useCallback((direction) => {
    if (onKeyboardAction) {
      onKeyboardAction('seek', { direction });
    }
  }, [onKeyboardAction]);

  useEffect(() => {
    let questionInterval;
    
    if (showShortcutsModal) {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => createFlyingQuestion(), i * 200);
      }
      
      questionInterval = setInterval(createFlyingQuestion, 1500);
    } else {
      setFlyingQuestions([]);
    }
    
    return () => {
      if (questionInterval) clearInterval(questionInterval);
    };
  }, [showShortcutsModal, createFlyingQuestion]);

  return (
    <>
      {/* Flying Questions */}
      <AnimatePresence>
        {flyingQuestions.map((question) => (
          <motion.div
            key={question.id}
            className="fixed pointer-events-none z-40 text-white/40"
            style={{
              left: `${question.x}%`,
              top: `${question.y}%`,
            }}
            initial={{ 
              opacity: 0, 
              scale: question.scale,
              rotate: question.rotation
            }}
            animate={{ 
              opacity: [0, 0.6, 0.4], 
              scale: [question.scale, question.scale * 1.2, question.scale],
              rotate: question.rotation + 90,
              x: (Math.random() - 0.5) * 100,
              y: (Math.random() - 0.5) * 100
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              duration: 3, 
              delay: question.delay,
              ease: "easeOut"
            }}
            onAnimationComplete={() => {
              setFlyingQuestions(prev => prev.filter(q => q.id !== question.id));
            }}
          >
            <FaQuestion className="text-3xl drop-shadow-lg" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Shortcuts Modal */}
      {showShortcutsModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setShowShortcutsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-black/80 rounded-2xl p-6 max-w-md w-full border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all"
              >
                <FaTimes size={14} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-white">
                <span className="text-sm">Remove track</span>
                <kbd className="px-2 py-1 bg-white/20 rounded text-xs font-mono">←</kbd>
              </div>
              <div className="flex justify-between items-center text-white">
                <span className="text-sm">Keep track</span>
                <kbd className="px-2 py-1 bg-white/20 rounded text-xs font-mono">→</kbd>
              </div>
              <div className="flex justify-between items-center text-white">
                <span className="text-sm">Volume up</span>
                <kbd className="px-2 py-1 bg-white/20 rounded text-xs font-mono">↑</kbd>
              </div>
              <div className="flex justify-between items-center text-white">
                <span className="text-sm">Volume down</span>
                <kbd className="px-2 py-1 bg-white/20 rounded text-xs font-mono">↓</kbd>
              </div>
              <div className="flex justify-between items-center text-white">
                <span className="text-sm">Play/Pause</span>
                <kbd className="px-2 py-1 bg-white/20 rounded text-xs font-mono">Space</kbd>
              </div>
              <div className="flex justify-between items-center text-white">
                <span className="text-sm">Mute/Unmute</span>
                <kbd className="px-2 py-1 bg-white/20 rounded text-xs font-mono">M</kbd>
              </div>
              <div className="flex justify-between items-center text-white">
                <span className="text-sm">Seek backward 10s</span>
                <kbd className="px-2 py-1 bg-white/20 rounded text-xs font-mono">A</kbd>
              </div>
              <div className="flex justify-between items-center text-white">
                <span className="text-sm">Seek forward 10s</span>
                <kbd className="px-2 py-1 bg-white/20 rounded text-xs font-mono">D</kbd>
              </div>
              <div className="flex justify-between items-center text-white">
                <span className="text-sm">Exit playlist</span>
                <kbd className="px-2 py-1 bg-white/20 rounded text-xs font-mono">Esc</kbd>
              </div>
              <div className="flex justify-between items-center text-white">
                <span className="text-sm">Back to playlists</span>
                <kbd className="px-2 py-1 bg-white/20 rounded text-xs font-mono">Enter</kbd>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/10 text-center text-[11px] text-white/50">
              <p>Demo Mode • 30s audio previews & artwork sourced via Apple iTunes API for non-commercial portfolio demonstration.</p>
            </div>
            
            <div className="mt-4 pt-2">
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg transition-all font-medium"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default AnimationsAndModal;
