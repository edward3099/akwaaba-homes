'use client'

import React, { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
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
  onImagesChange?: (images: UploadedImage[]) => void
  initialImages?: UploadedImage[]
  className?: string
  disabled?: boolean
}

interface FileWithPreview extends File {
  preview?: string
  uploadProgress?: number
  uploadError?: string
  uploadSuccess?: boolean
}

export function MultiImageUploader({
  bucketName,
  path = '',
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  onImagesChange,
  initialImages = [],
  className,
  disabled = false
}: MultiImageUploaderProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(initialImages)
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const supabase = createClient()

  // Update parent component when images change
  React.useEffect(() => {
    onImagesChange?.(uploadedImages)
  }, [uploadedImages, onImagesChange])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (disabled) return

    const newFiles = acceptedFiles.map(file => ({
      ...file,
      preview: URL.createObjectURL(file),
      uploadProgress: 0,
      uploadError: undefined,
      uploadSuccess: false
    }))

    setFiles(prev => {
      const combined = [...prev, ...newFiles]
      // Limit to maxFiles
      return combined.slice(0, maxFiles)
    })
    setUploadErrors([])
  }, [maxFiles, disabled])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles: maxFiles - uploadedImages.length,
    maxSize: maxFileSize,
    disabled: disabled || isUploading
  })

  const removeFile = useCallback((index: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      const removedFile = newFiles.splice(index, 1)[0]
      if (removedFile.preview) {
        URL.revokeObjectURL(removedFile.preview)
      }
      return newFiles
    })
  }, [])

  const removeUploadedImage = useCallback((imageId: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId))
  }, [])

  const uploadFiles = useCallback(async () => {
    if (files.length === 0) return

    setIsUploading(true)
    setUploadErrors([])

    const uploadPromises = files.map(async (file, index) => {
      try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
        const filePath = path ? `${path}/${fileName}` : fileName

        // Update progress
        setFiles(prev => prev.map((f, i) => 
          i === index ? { ...f, uploadProgress: 10 } : f
        ))

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) throw error

        // Update progress
        setFiles(prev => prev.map((f, i) => 
          i === index ? { ...f, uploadProgress: 100, uploadSuccess: true } : f
        ))

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath)

        // Create uploaded image object
        const uploadedImage: UploadedImage = {
          id: data.path,
          url: publicUrl,
          path: data.path,
          name: file.name,
          size: file.size,
          type: file.type
        }

        return uploadedImage
      } catch (error) {
        console.error('Upload error:', error)
        
        // Update file with error
        setFiles(prev => prev.map((f, i) => 
          i === index ? { 
            ...f, 
            uploadError: error instanceof Error ? error.message : 'Upload failed',
            uploadProgress: 0
          } : f
        ))

        setUploadErrors(prev => [...prev, `${file.name}: ${error instanceof Error ? error.message : 'Upload failed'}`])
        return null
      }
    })

    try {
      const results = await Promise.all(uploadPromises)
      const successfulUploads = results.filter(Boolean) as UploadedImage[]
      
      if (successfulUploads.length > 0) {
        setUploadedImages(prev => [...prev, ...successfulUploads])
      }

      // Clear successful uploads from files
      setFiles(prev => prev.filter(f => !f.uploadSuccess))
    } catch (error) {
      console.error('Batch upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }, [files, bucketName, path, supabase.storage])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const canUpload = files.length > 0 && !isUploading && !disabled
  const totalImages = uploadedImages.length + files.length

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 cursor-pointer',
          isDragActive && 'border-primary bg-primary/5',
          isDragReject && 'border-destructive bg-destructive/5',
          disabled && 'opacity-50 cursor-not-allowed',
          'hover:border-primary/50 hover:bg-muted/50'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className={cn(
            'h-8 w-8',
            isDragActive ? 'text-primary' : 'text-muted-foreground'
          )} />
          <div className="text-sm">
            {isDragActive ? (
              <p className="text-primary font-medium">Drop images here...</p>
            ) : (
              <div>
                <p className="font-medium">
                  Drag & drop images here, or <span className="text-primary underline">click to select</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {acceptedFileTypes.join(', ')} • Max {maxFiles} files • Max {formatFileSize(maxFileSize)} per file
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Uploading {files.length} file{files.length > 1 ? 's' : ''}</h4>
                {canUpload && (
                  <Button onClick={uploadFiles} size="sm">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Start Upload'
                    )}
                  </Button>
                )}
              </div>
              
              {files.map((file, index) => (
                <div key={`${file.name}-${index}`} className="space-y-2">
                  <div className="flex items-center gap-3">
                    {file.preview ? (
                      <img 
                        src={file.preview} 
                        alt={file.name}
                        className="h-12 w-12 object-cover rounded border"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-muted rounded border flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {file.uploadError && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                      {file.uploadSuccess && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      {!file.uploadSuccess && !file.uploadError && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {file.uploadError && (
                    <p className="text-xs text-destructive">{file.uploadError}</p>
                  )}

                  {file.uploadProgress !== undefined && file.uploadProgress > 0 && (
                    <Progress value={file.uploadProgress} className="h-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <h4 className="font-medium">Uploaded Images ({uploadedImages.length})</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {uploadedImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="h-24 w-full object-cover rounded border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeUploadedImage(image.id)}
                      disabled={disabled}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Summary */}
      {uploadErrors.length > 0 && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <h4 className="font-medium">Upload Errors</h4>
            </div>
            <ul className="mt-2 space-y-1">
              {uploadErrors.map((error, index) => (
                <li key={index} className="text-sm text-destructive">{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="text-xs text-muted-foreground text-center">
        {totalImages > 0 && (
          <p>
            {uploadedImages.length} uploaded • {files.length} pending • {maxFiles - totalImages} remaining
          </p>
        )}
      </div>
    </div>
  )
}
