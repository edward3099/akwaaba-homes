'use client';

import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadingAnimationProps {
  isUploading: boolean;
  progress?: number;
  status?: 'uploading' | 'success' | 'error';
  message?: string;
}

export function UploadingAnimation({ 
  isUploading, 
  progress = 0, 
  status = 'uploading',
  message 
}: UploadingAnimationProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  // Animate progress counter from 1% to target progress
  useEffect(() => {
    if (status === 'uploading' && progress > 0) {
      const startProgress = Math.max(1, animatedProgress);
      const targetProgress = progress;
      
      if (startProgress < targetProgress) {
        const duration = 500; // Animation duration in ms
        const steps = targetProgress - startProgress;
        const stepDuration = duration / steps;
        
        const timer = setInterval(() => {
          setAnimatedProgress(prev => {
            if (prev >= targetProgress) {
              clearInterval(timer);
              return targetProgress;
            }
            return prev + 1;
          });
        }, stepDuration);
        
        return () => clearInterval(timer);
      }
    } else if (status === 'success') {
      setAnimatedProgress(100);
    } else if (status === 'error') {
      setAnimatedProgress(0);
    }
  }, [progress, status, animatedProgress]);
  
  // Reset animated progress when upload starts
  useEffect(() => {
    if (isUploading && status === 'uploading' && progress === 0) {
      setAnimatedProgress(0);
    }
  }, [isUploading, status, progress]);
  
  if (!isUploading && status === 'uploading') return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-500 animate-pulse" />;
      default:
        return <Upload className="w-8 h-8 text-blue-500 animate-bounce" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'success':
        return 'Upload Complete!';
      case 'error':
        return 'Upload Failed';
      default:
        return 'Uploading...';
    }
  };

  return (
    <div className={`w-full p-6 rounded-lg border-2 shadow-lg transition-all duration-300 ${getStatusColor()}`}>
      <div className="flex items-center space-x-4">
        {getStatusIcon()}
        <div className="flex-1">
          <p className="font-bold text-lg text-gray-800 mb-2">
            {getStatusText()}
          </p>
          {message && (
            <p className="text-sm text-gray-600 mb-3">
              {message}
            </p>
          )}
          {status === 'uploading' && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                  style={{ width: `${animatedProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">{message || 'Uploading your property...'}</p>
                <p className="text-sm font-medium text-blue-600 animate-pulse">{animatedProgress}% complete</p>
              </div>
            </div>
          )}
          {status === 'success' && (
            <p className="text-sm text-green-700">
              Your property has been successfully listed and is now live!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Spinner component for inline use
export function UploadSpinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin`}>
      <svg
        className="w-full h-full text-blue-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
}

// Progress bar component
export function UploadProgress({ progress, message }: { progress: number; message?: string }) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          {message || 'Uploading...'}
        </span>
        <span className="text-sm text-gray-500">
          {progress}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
