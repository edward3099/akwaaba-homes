'use client'

import React, { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { X, Upload, Image as ImageIcon, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface UploadedImage {
  id: string
  url: string
  path: string
  name: string
  size: number
  type: string
}

export interface MultiImageUploaderProps {
  bucketName: string
  path?: string
  maxFiles?: number
  maxFileSize?: number
  acceptedFileTypes?: string[]
  onImagesUploaded?: (images: UploadedImage[]) => void
  onImageRemoved?: (imageId: string) => void
  className?: string
}

export function MultiImageUploader({
  bucketName,
  path = '',
  maxFiles = 10,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  onImagesUploaded,
  onImageRemoved,
  className
}: MultiImageUploaderProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [errors, setErrors] = useState<string[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setUploading(true)
    setErrors([])
    const newImages: UploadedImage[] = []

    for (const file of acceptedFiles) {
      try {
        // Validate file size
        if (file.size > maxFileSize) {
          setErrors(prev => [...prev, `${file.name} is too large. Maximum size is ${formatFileSize(maxFileSize)}`])
          continue
        }

        // Validate file type
        if (!acceptedFileTypes.includes(file.type)) {
          setErrors(prev => [...prev, `${file.name} is not a supported image type`])
          continue
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = path ? `${path}/${fileName}` : fileName

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          setErrors(prev => [...prev, `Failed to upload ${file.name}: ${error.message}`])
          continue
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath)

        const uploadedImage: UploadedImage = {
          id: fileName,
          url: publicUrl,
          path: filePath,
          name: file.name,
          size: file.size,
          type: file.type
        }

        newImages.push(uploadedImage)
        setUploadProgress(prev => ({ ...prev, [fileName]: 100 }))

      } catch (error) {
        setErrors(prev => [...prev, `Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`])
      }
    }

    if (newImages.length > 0) {
      const updatedImages = [...uploadedImages, ...newImages]
      setUploadedImages(updatedImages)
      onImagesUploaded?.(updatedImages)
    }

    setUploading(false)
  }, [bucketName, path, maxFileSize, acceptedFileTypes, uploadedImages, onImagesUploaded, supabase])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    disabled: uploading
  })

  const removeImage = (imageId: string) => {
    const updatedImages = uploadedImages.filter(img => img.id !== imageId)
    setUploadedImages(updatedImages)
    onImageRemoved?.(imageId)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
          uploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            {uploading ? (
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {uploading ? 'Uploading...' : 'Drop images here or click to browse'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports {acceptedFileTypes.join(', ')} up to {formatFileSize(maxFileSize)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Maximum {maxFiles} images
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{fileName}</span>
                <span className="text-gray-500">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ))}
        </div>
      )}

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-800 mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Upload Errors</span>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Uploaded Images Grid */}
      {uploadedImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Uploaded Images ({uploadedImages.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {uploadedImages.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {formatFileSize(image.size)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
