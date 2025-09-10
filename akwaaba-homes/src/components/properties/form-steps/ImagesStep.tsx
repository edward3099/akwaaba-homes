'use client'

import React, { useState } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { MultiImageUploader, UploadedImage } from '@/components/ui/MultiImageUploader'
import { CreatePropertyForm } from '@/lib/schemas/property'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Image, Upload, AlertCircle } from 'lucide-react'

export function ImagesStep() {
  const { control, formState: { errors }, setValue, watch } = useFormContext<CreatePropertyForm>()
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])

  // Watch the current images value
  const currentImages = watch('images')

  const handleImagesUploaded = (images: UploadedImage[]) => {
    setUploadedImages(images)
    
    // Transform UploadedImage to the format expected by our schema
    const transformedImages = images.map((image, index) => ({
      url: image.url,
      image_type: (index === 0 ? 'primary' : 'gallery') as 'primary' | 'gallery',
      is_primary: index === 0,
      alt_text: image.name,
      order_index: index
    }))
    
    setValue('images', transformedImages)
  }

  const handleImageRemoved = (imageId: string) => {
    const updatedImages = uploadedImages.filter(img => img.id !== imageId)
    setUploadedImages(updatedImages)
    
    // Update form value
    const transformedImages = updatedImages.map((image, index) => ({
      url: image.url,
      image_type: (index === 0 ? 'primary' : 'gallery') as 'primary' | 'gallery',
      is_primary: index === 0,
      alt_text: image.name,
      order_index: index
    }))
    
    setValue('images', transformedImages)
  }

  return (
    <div className="space-y-6">
      {/* Image Upload Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Property Images</h3>
          <p className="text-sm text-gray-600">
            Upload high-quality photos of your property. The first image will be the primary photo.
          </p>
        </div>

        <Controller
          control={control}
          name="images"
          rules={{ required: 'At least one image is required' }}
          render={({ field }) => (
            <MultiImageUploader
              bucketName="property-images"
              path="properties"
              maxFiles={10}
              maxFileSize={5 * 1024 * 1024} // 5MB
              acceptedFileTypes={['image/jpeg', 'image/png', 'image/webp', 'image/avif']}
              onImagesUploaded={handleImagesUploaded}
              onImageRemoved={handleImageRemoved}
              className="min-h-[300px]"
            />
          )}
        />
        
        {errors.images && (
          <div className="flex items-center space-x-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.images.message}</span>
          </div>
        )}
      </div>

      {/* Image Guidelines */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-900 text-base flex items-center space-x-2">
            <Image className="h-4 w-4" />
            <span>Image Guidelines</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Recommended Photos:</h4>
              <ul className="space-y-1">
                <li>• Exterior front view</li>
                <li>• Living room</li>
                <li>• Kitchen</li>
                <li>• Master bedroom</li>
                <li>• Bathroom</li>
                <li>• Garden/outdoor space</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Photo Tips:</h4>
              <ul className="space-y-1">
                <li>• Use good lighting</li>
                <li>• Show rooms from multiple angles</li>
                <li>• Include unique features</li>
                <li>• Keep photos clear and focused</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Images Preview */}
      {currentImages && currentImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Images ({currentImages.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {currentImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={image.alt_text || `Property image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                />
                {image.is_primary && (
                  <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-white text-xs font-medium">
                      {image.image_type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">Final Steps</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Review all information before submitting</li>
          <li>• Ensure images are high quality and representative</li>
          <li>• Your property will be reviewed before going live</li>
        </ul>
      </div>
    </div>
  )
}
