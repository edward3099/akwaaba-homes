'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadDropzoneProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  currentImageUrl?: string;
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
  title: string;
  description: string;
  uploadButtonText?: string;
  removeButtonText?: string;
}

export function FileUploadDropzone({
  onFileSelect,
  onFileRemove,
  currentImageUrl,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
  },
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 1,
  disabled = false,
  className,
  title,
  description,
  uploadButtonText = "Choose File",
  removeButtonText = "Remove"
}: FileUploadDropzoneProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      
      // Call the parent component's onFileSelect
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    disabled,
    noClick: true, // Disable click on the dropzone area
    noKeyboard: true, // Disable keyboard events
  });

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setUploadedFile(null);
    onFileRemove?.();
  };

  const handleUpload = async () => {
    if (uploadedFile) {
      setIsUploading(true);
      try {
        // The actual upload logic will be handled by the parent component
        // This is just for UI feedback
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const displayImage = preview || currentImageUrl;

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          </div>
          
          <p className="text-sm text-slate-600">{description}</p>

          {/* Dropzone Area */}
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
              isDragActive && !isDragReject && "border-blue-400 bg-blue-50",
              isDragReject && "border-red-400 bg-red-50",
              !isDragActive && "border-slate-300 hover:border-slate-400",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            
            {displayImage ? (
              <div className="space-y-4">
                {/* Image Preview */}
                <div className="relative inline-block">
                  <img
                    src={displayImage}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border border-slate-200"
                  />
                  {uploadedFile && (
                    <div className="absolute -top-2 -right-2">
                      <CheckCircle className="w-6 h-6 text-green-500 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                
                {/* File Info */}
                {uploadedFile && (
                  <div className="text-sm text-slate-600">
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    type="button"
                    onClick={open}
                    disabled={disabled}
                    variant="outline"
                    size="sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadButtonText}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={handleRemove}
                    disabled={disabled}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    {removeButtonText}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-slate-400" />
                </div>
                
                <div>
                  <p className="text-lg font-medium text-slate-900">
                    {isDragActive ? (
                      isDragReject ? "File type not supported" : "Drop the file here"
                    ) : (
                      "Drag and drop your image here"
                    )}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    or click the button below to select a file
                  </p>
                </div>
                
                <Button
                  type="button"
                  onClick={open}
                  disabled={disabled}
                  variant="outline"
                  size="sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadButtonText}
                </Button>
              </div>
            )}
          </div>

          {/* File Requirements */}
          <div className="text-xs text-slate-500 space-y-1">
            <p>Supported formats: JPEG, PNG, GIF, WebP</p>
            <p>Maximum file size: {(maxSize / 1024 / 1024).toFixed(0)}MB</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
