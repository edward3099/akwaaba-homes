'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth/authContext';
import { imageService, ImageUpload, ImageGallery } from '@/lib/services/imageService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, Image, Trash2, Eye, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TestImageSystemPage() {
  const { user, isAgent, isAdmin } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<ImageUpload[]>([]);
  const [imageGallery, setImageGallery] = useState<ImageGallery | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Sample property IDs for testing
  const samplePropertyIds = [
    '660e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440002',
    '660e8400-e29b-41d4-a716-446655440003'
  ];

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    handleImageUpload(fileArray);
  };

  const handleImageUpload = async (files: File[]) => {
    if (!isAgent && !isAdmin) {
      toast({
        title: "Permission Denied",
        description: "Only sellers and agents can upload images",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      const uploads: ImageUpload[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isPrimary = i === 0; // First image is primary
        
        const upload = await imageService.uploadImage(
          file,
          selectedPropertyId || undefined,
          isPrimary,
          {
            alt: file.name,
            width: 0, // Would be extracted from actual image
            height: 0
          }
        );
        
        uploads.push(upload);
      }

      setUploadedImages(prev => [...prev, ...uploads]);
      
      toast({
        title: "Upload Successful",
        description: `Successfully uploaded ${uploads.length} image(s)`,
      });

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setErrors(prev => [...prev, errorMessage]);
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const loadImageGallery = async (propertyId: string) => {
    setIsLoading(true);
    setErrors([]);

    try {
      const gallery = await imageService.getPropertyImageGallery(propertyId, true);
      setImageGallery(gallery);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load gallery';
      setErrors(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteImage = async (uploadId: string) => {
    try {
      await imageService.deleteImage(uploadId);
      setUploadedImages(prev => prev.filter(img => img.id !== uploadId));
      
      toast({
        title: "Image Deleted",
        description: "Image has been successfully deleted",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete image';
      toast({
        title: "Delete Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const updateImageMetadata = async (uploadId: string, updates: Record<string, string | number | boolean | null>) => {
    try {
      const updated = await imageService.updateImageMetadata(uploadId, updates);
      setUploadedImages(prev => 
        prev.map(img => img.id === uploadId ? updated : img)
      );
      
      toast({
        title: "Metadata Updated",
        description: "Image metadata has been updated",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update metadata';
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Image Management System Test</h1>
          <p className="text-gray-600">Test the comprehensive image management system</p>
        </div>

        {/* Authentication Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Authentication Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>User Type</Label>
                <Input value={isAgent ? 'Agent' : isAdmin ? 'Admin' : 'Unknown'} readOnly />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={user?.email || 'Not authenticated'} readOnly />
              </div>
              <div>
                <Label>Can Upload Images</Label>
                <Input 
                  value={isAgent || isAdmin ? 'Yes' : 'No'} 
                  readOnly 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Property Selection</CardTitle>
            <CardDescription>Select a property to associate with image uploads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label>Property ID</Label>
                <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">No Property (General Upload)</SelectItem>
                    {samplePropertyIds.map(id => (
                      <SelectItem key={id} value={id}>
                        Property {id.slice(-8)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => selectedPropertyId && loadImageGallery(selectedPropertyId)}
                disabled={!selectedPropertyId || isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                Load Gallery
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-green-600" />
              Image Upload
            </CardTitle>
            <CardDescription>Upload images with drag &amp; drop or file selection</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop images here or click to select
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supports JPG, PNG, WebP, GIF up to 10MB each
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="btn-ghana"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Select Images
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Images */}
        {uploadedImages.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5 text-blue-600" />
                Recently Uploaded Images
              </CardTitle>
              <CardDescription>Manage your uploaded images</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedImages.map((image) => (
                  <div key={image.id} className="border rounded-lg p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      <Image className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-sm truncate">{image.original_filename}</p>
                      <p className="text-xs text-gray-500">
                        {(image.file_size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateImageMetadata(image.id, { is_primary: !image.is_primary })}
                        >
                          {image.is_primary ? 'Primary' : 'Set Primary'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteImage(image.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Image Gallery */}
        {imageGallery && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5 text-purple-600" />
                Property Image Gallery
              </CardTitle>
              <CardDescription>
                Gallery for Property {imageGallery.property_id.slice(-8)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Primary Image */}
                {imageGallery.primary_image && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Primary Image</h3>
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <Image className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {imageGallery.primary_image.alt}
                    </p>
                  </div>
                )}

                {/* Gallery Images */}
                {imageGallery.gallery_images.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Gallery Images ({imageGallery.gallery_images.length})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {imageGallery.gallery_images.map((img) => (
                        <div key={img.id} className="border rounded-lg p-3">
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <Image className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-600 mt-2 truncate">
                            {img.alt}
                          </p>
                          {img.is_primary && (
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <Alert className="border-red-500">
            <AlertDescription className="text-red-700">
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
