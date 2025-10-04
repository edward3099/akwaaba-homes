'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Hide splash screen after a short delay
          setTimeout(() => {
            setIsVisible(false);
            onComplete();
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-600 via-yellow-500 to-red-600"
        >
          <div className="text-center">
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-8"
            >
              <div className="w-24 h-24 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-4xl">🏠</span>
              </div>
            </motion.div>

            {/* App Name */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              AkwaabaHomes
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-white/90 text-lg mb-8"
            >
              Your Gateway to Premium Real Estate
            </motion.p>

            {/* Loading Progress */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="w-64 mx-auto"
            >
              <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-white h-full rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-white/80 text-sm mt-2"
              >
                {Math.round(progress)}%
              </motion.p>
            </motion.div>

            {/* Ghana Flag Colors Animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex justify-center gap-2 mt-8"
            >
              <motion.div
                className="w-3 h-3 bg-red-600 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="w-3 h-3 bg-yellow-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="w-3 h-3 bg-green-600 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// PWA Loading Component for app startup
export function PWALoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if app is fully loaded
    const checkAppLoaded = () => {
      if (document.readyState === 'complete') {
        setTimeout(() => {
          setIsLoading(false);
        }, 1000); // Show loading for at least 1 second
      }
    };

    if (document.readyState === 'complete') {
      checkAppLoaded();
    } else {
      window.addEventListener('load', checkAppLoaded);
    }

    return () => {
      window.removeEventListener('load', checkAppLoaded);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-600 via-yellow-500 to-red-600">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-4"
        >
          <div className="w-full h-full border-4 border-white/30 border-t-white rounded-full" />
        </motion.div>
        
        <h2 className="text-xl font-semibold text-white mb-2">
          Loading AkwaabaHomes...
        </h2>
        
        <p className="text-white/80 text-sm">
          Finding the perfect properties for you
        </p>
      </div>
    </div>
  );
}







