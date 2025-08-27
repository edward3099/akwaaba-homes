'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X,
  Camera,
  Play,
  RotateCcw
} from 'lucide-react';

interface PropertyImageGalleryProps {
  images: string[];
  title: string;
  videos?: string[];
  virtualTour?: string;
}

export function PropertyImageGallery({ images, title, videos, virtualTour }: PropertyImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const allMedia = [
    ...images.map(img => ({ type: 'image' as const, url: img })),
    ...(videos || []).map(video => ({ type: 'video' as const, url: video })),
    ...(virtualTour ? [{ type: 'tour' as const, url: virtualTour }] : [])
  ];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % allMedia.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const renderMedia = (media: typeof allMedia[0], index: number) => {
    if (media.type === 'image') {
      return (
        <Image
          src={media.url}
          alt={`${title} - Image ${index + 1}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, 80vw"
          className="object-cover"
          priority={index === 0}
        />
      );
    } else if (media.type === 'video') {
      return (
        <video
          src={media.url}
          className="w-full h-full object-cover"
          controls
          poster={images[0]} // Use first image as poster
        />
      );
    } else {
      return (
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <div className="text-center">
            <RotateCcw className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">360° Virtual Tour</h3>
            <p className="text-muted-foreground mb-4">Experience this property in virtual reality</p>
            <Button onClick={() => window.open(media.url, '_blank')}>
              Start Virtual Tour
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-[16/10] bg-gray-100 rounded-2xl overflow-hidden group">
          {renderMedia(allMedia[currentIndex], currentIndex)}
          
          {/* Navigation Arrows */}
          {allMedia.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}

          {/* Media Type Indicators */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="secondary" className="bg-black/50 text-white border-0">
              <Camera className="w-3 h-3 mr-1" />
              {currentIndex + 1} of {allMedia.length}
            </Badge>
            
            {allMedia[currentIndex].type === 'video' && (
              <Badge variant="secondary" className="bg-black/50 text-white border-0">
                <Play className="w-3 h-3 mr-1" />
                Video
              </Badge>
            )}
            
            {allMedia[currentIndex].type === 'tour' && (
              <Badge variant="secondary" className="bg-black/50 text-white border-0">
                <RotateCcw className="w-3 h-3 mr-1" />
                360° Tour
              </Badge>
            )}
          </div>

          {/* Fullscreen Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={openFullscreen}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>

          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {allMedia.length}
          </div>
        </div>

        {/* Thumbnail Grid */}
        {allMedia.length > 1 && (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {allMedia.slice(0, 8).map((media, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                {media.type === 'image' ? (
                  <Image
                    src={media.url}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                ) : media.type === 'video' ? (
                  <div className="relative w-full h-full bg-gray-200">
                    <Image
                      src={images[0]} // Use first image as thumbnail for video
                      alt={`Video thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <RotateCcw className="w-6 h-6 text-primary" />
                  </div>
                )}
                
                {/* Overlay for non-image media */}
                {media.type !== 'image' && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    {media.type === 'video' && <Play className="w-4 h-4 text-white" />}
                    {media.type === 'tour' && <RotateCcw className="w-4 h-4 text-white" />}
                  </div>
                )}
              </button>
            ))}
            
            {/* Show More Button */}
            {allMedia.length > 8 && (
              <button
                onClick={openFullscreen}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary transition-colors flex items-center justify-center bg-gray-50 hover:bg-gray-100"
              >
                <div className="text-center">
                  <Camera className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                  <span className="text-xs text-gray-500">+{allMedia.length - 8}</span>
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <div className="relative w-full h-full max-w-7xl max-h-full p-4">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Main Image in Fullscreen */}
            <div className="relative w-full h-full">
              {renderMedia(allMedia[currentIndex], currentIndex)}
            </div>

            {/* Navigation in Fullscreen */}
            {allMedia.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Thumbnail Strip in Fullscreen */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg max-w-full overflow-x-auto">
              {allMedia.map((media, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={`relative w-16 h-16 rounded-md overflow-hidden border-2 flex-shrink-0 ${
                    index === currentIndex ? 'border-white' : 'border-transparent'
                  }`}
                >
                  {media.type === 'image' ? (
                    <Image
                      src={media.url}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  ) : media.type === 'video' ? (
                    <div className="relative w-full h-full bg-gray-800">
                      <Image
                        src={images[0]}
                        alt={`Video thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <RotateCcw className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
