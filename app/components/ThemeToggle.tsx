"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ThemeToggleProps {
  isDark?: boolean;
  onChange?: (isDark: boolean) => void;
  className?: string;
}

export function ThemeToggle({ isDark = false, onChange, className = "" }: ThemeToggleProps) {
  const [internalIsDark, setInternalIsDark] = React.useState(false);
  const actualIsDark = isDark !== undefined ? isDark : internalIsDark;
  const handleChange = onChange || setInternalIsDark;

  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={actualIsDark}
      onClick={() => handleChange(!actualIsDark)}
      className={`relative inline-flex h-12 w-24 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 overflow-hidden ${className}`}
      whileTap={{ scale: 0.95 }}
      animate={{
        backgroundColor: actualIsDark ? '#1E1B4B' : '#60A5FA', // Bleu nuit / Bleu ciel
      }}
      transition={{ 
        type: "spring", 
        stiffness: 700, 
        damping: 30 
      }}
    >
      {/* Étoiles (Nuit) */}
      <AnimatePresence>
        {actualIsDark && (
          <>
            {/* Étoile 1 */}
            <motion.div
              initial={{ y: -20, scale: 0, opacity: 0 }}
              animate={{ y: 8, scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 700, 
                damping: 30,
                delay: 0.1
              }}
              className="absolute left-4 top-3"
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path
                  d="M4 0L4.5 2.5L7 3L4.5 3.5L4 6L3.5 3.5L1 3L3.5 2.5L4 0Z"
                  fill="white"
                />
              </svg>
            </motion.div>
            {/* Étoile 2 */}
            <motion.div
              initial={{ y: -20, scale: 0, opacity: 0 }}
              animate={{ y: 10, scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 700, 
                damping: 30,
                delay: 0.2
              }}
              className="absolute left-12 top-2"
            >
              <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                <path
                  d="M3 0L3.3 1.8L5 2L3.3 2.2L3 4L2.7 2.2L1 2L2.7 1.8L3 0Z"
                  fill="white"
                />
              </svg>
            </motion.div>
            {/* Étoile 3 */}
            <motion.div
              initial={{ y: -20, scale: 0, opacity: 0 }}
              animate={{ y: 6, scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 700, 
                damping: 30,
                delay: 0.15
              }}
              className="absolute left-16 top-4"
            >
              <svg width="5" height="5" viewBox="0 0 5 5" fill="none">
                <path
                  d="M2.5 0L2.75 1.5L4 1.75L2.75 2L2.5 3.5L2.25 2L1 1.75L2.25 1.5L2.5 0Z"
                  fill="white"
                />
              </svg>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Nuages (Jour) */}
      <AnimatePresence>
        {!actualIsDark && (
          <>
            {/* Nuage 1 */}
            <motion.div
              initial={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.5 }}
              transition={{ 
                type: "spring", 
                stiffness: 700, 
                damping: 30
              }}
              className="absolute left-8 bottom-2"
            >
              <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                <path
                  d="M6 12C4.5 12 3 10.5 3 9C3 7.5 4.5 6 6 6C6.5 4.5 8 3.5 9.5 3.5C11 3.5 12.5 4.5 13 6C14.5 6 16 7.5 16 9C16 10.5 14.5 12 13 12H6Z"
                  fill="white"
                  opacity="0.9"
                />
              </svg>
            </motion.div>
            {/* Nuage 2 */}
            <motion.div
              initial={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.5 }}
              transition={{ 
                type: "spring", 
                stiffness: 700, 
                damping: 30,
                delay: 0.1
              }}
              className="absolute left-14 bottom-1"
            >
              <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                <path
                  d="M5 10C3.5 10 2 8.5 2 7C2 5.5 3.5 4 5 4C5.5 2.5 7 1.5 8.5 1.5C10 1.5 11.5 2.5 12 4C13.5 4 15 5.5 15 7C15 8.5 13.5 10 12 10H5Z"
                  fill="white"
                  opacity="0.8"
                />
              </svg>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Astre (Soleil/Lune) */}
      <motion.div
        className="absolute h-10 w-10 rounded-full"
        animate={{
          x: actualIsDark ? 56 : 4, // Se déplace de gauche à droite
        }}
        transition={{ 
          type: "spring", 
          stiffness: 700, 
          damping: 30 
        }}
      >
        {/* Soleil (Jour) */}
        {!actualIsDark && (
          <motion.div
            className="absolute inset-0 rounded-full bg-yellow-400 shadow-lg"
            style={{
              boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(251, 191, 36, 0.3)',
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 700, 
              damping: 30 
            }}
          />
        )}

        {/* Lune (Nuit) */}
        {actualIsDark && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gray-200 shadow-lg"
            style={{
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 700, 
              damping: 30 
            }}
          >
            {/* Cratères sur la lune */}
            <AnimatePresence>
              {actualIsDark && (
                <>
                  {/* Cratère 1 */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.6 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 700, 
                      damping: 30,
                      delay: 0.2
                    }}
                    className="absolute top-3 left-3 h-2 w-2 rounded-full bg-gray-400"
                  />
                  {/* Cratère 2 */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.5 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 700, 
                      damping: 30,
                      delay: 0.3
                    }}
                    className="absolute bottom-4 right-4 h-1.5 w-1.5 rounded-full bg-gray-400"
                  />
                  {/* Cratère 3 */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.4 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 700, 
                      damping: 30,
                      delay: 0.25
                    }}
                    className="absolute top-6 right-2 h-1 w-1 rounded-full bg-gray-400"
                  />
                </>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </motion.button>
  );
}

