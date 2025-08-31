'use client'

import React, { useState, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Check, Home, MapPin, Image, Settings, Loader2 } from 'lucide-react'
import type { CreatePropertyForm } from '@/lib/schemas/property'
import { PropertySchema } from '@/lib/schemas/property'
import { BasicInfoStep } from './form-steps/BasicInfoStep'
import { LocationStep } from './form-steps/LocationStep'
import { DetailsStep } from './form-steps/DetailsStep'
import { ImagesStep } from './form-steps/ImagesStep'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type FormStep = 'basic' | 'location' | 'details' | 'images'

const STEPS: { id: FormStep; title: string; description: string; icon: React.ReactNode }[] = [
  { id: 'basic', title: 'Basic Information', description: 'Property title, type, and pricing', icon: <Home className="h-4 w-4" /> },
  { id: 'location', title: 'Location', description: 'Address and location details', icon: <MapPin className="h-4 w-4" /> },
  { id: 'details', title: 'Property Details', description: 'Features, amenities, and specifications', icon: <Settings className="h-4 w-4" /> },
  { id: 'images', title: 'Images', description: 'Upload property photos', icon: <Image className="h-4 w-4" /> }
]

interface EditPropertyFormProps {
  propertyId: string;
  onSuccess?: () => void;
}

interface Property {
  id: string
  title: string
  description: string
  property_type: string
  listing_type: string
  price: number
  currency: string
  address: string
  city: string
  region: string
  postal_code?: string
  latitude?: number
  longitude?: number
  bedrooms?: number
  bathrooms?: number
  square_feet?: number
  land_size?: number
  year_built?: number
  features?: string[]
  amenities?: string[]
  status: string
  is_featured: boolean
  images?: Array<{
    url: string
    image_type: string
    is_primary: boolean
    alt_text?: string
    order_index: number
  }>
}

export function EditPropertyForm({ propertyId, onSuccess }: EditPropertyFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<FormStep>('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [property, setProperty] = useState<Property | null>(null)

  const methods = useForm<any>({
    resolver: zodResolver(PropertySchema),
    defaultValues: {
      title: '',
      description: '',
      property_type: 'house',
      listing_type: 'sale',
      price: 0,
      currency: 'GHS',
      address: '',
      city: '',
      region: '',
      postal_code: '',
      latitude: undefined,
      longitude: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      square_feet: undefined,
      land_size: undefined,
      year_built: undefined,
      features: [],
      amenities: [],
      status: 'pending',
      is_featured: false,
      images: [{
        url: '',
        image_type: 'primary',
        is_primary: true,
        alt_text: '',
        order_index: 0
      }]
    },
    mode: 'onChange'
  })

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/admin/properties/${propertyId}`, {
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch property')
        }
        
        const data = await response.json()
        setProperty(data.property)
        
        // Update form with fetched data
        methods.reset({
          title: data.property.title || '',
          description: data.property.description || '',
          property_type: data.property.property_type || 'house',
          listing_type: data.property.listing_type || 'sale',
          price: data.property.price || 0,
          currency: data.property.currency || 'GHS',
          address: data.property.address || '',
          city: data.property.city || '',
          region: data.property.region || '',
          postal_code: data.property.postal_code || '',
          latitude: data.property.latitude || undefined,
          longitude: data.property.longitude || undefined,
          bedrooms: data.property.bedrooms || undefined,
          bathrooms: data.property.bathrooms || undefined,
          square_feet: data.property.square_feet || undefined,
          land_size: data.property.land_size || undefined,
          year_built: data.property.year_built || undefined,
          features: data.property.features || [],
          amenities: data.property.amenities || [],
          status: data.property.status || 'pending',
          is_featured: data.property.is_featured || false,
          images: data.property.images && data.property.images.length > 0 
            ? data.property.images.map((img: any, index: number) => ({
                url: img.url || '',
                image_type: img.image_type || 'primary',
                is_primary: img.is_primary || index === 0,
                alt_text: img.alt_text || '',
                order_index: img.order_index || index
              }))
            : [{
                url: '',
                image_type: 'primary',
                is_primary: true,
                alt_text: '',
                order_index: 0
              }]
        })
      } catch (error) {
        console.error('Error fetching property:', error)
        toast.error('Failed to load property data')
        router.push('/admin/properties')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperty()
  }, [propertyId, methods, router])

  const currentStepIndex = STEPS.findIndex(step => step.id === currentStep)
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id)
    }
  }

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id)
    }
  }

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update property')
      }

      const result = await response.json()
      console.log('Property updated successfully:', result)
      
      toast.success('Property updated successfully')
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Navigate back to properties list
        router.push('/admin/properties')
      }
      
    } catch (error) {
      console.error('Error updating property:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update property. Please try again.');
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'basic':
        return <BasicInfoStep />
      case 'location':
        return <LocationStep />
      case 'details':
        return <DetailsStep />
      case 'images':
        return <ImagesStep />
      default:
        return <BasicInfoStep />
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading property data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Property Not Found</h3>
            <p className="text-gray-600 mb-4">The property you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push('/admin/properties')}>
              Back to Properties
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
          <div className="text-sm text-gray-500">
            Step {currentStepIndex + 1} of {STEPS.length}
          </div>
        </div>
        
        {/* Progress Bar */}
        <Progress value={progress} className="h-2" />
        
        {/* Step Indicators */}
        <div className="flex justify-between mt-4">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                'flex flex-col items-center space-y-2',
                index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  index < currentStepIndex
                    ? 'bg-green-100 text-green-600'
                    : index === currentStepIndex
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400'
                )}
              >
                {index < currentStepIndex ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.icon
                )}
              </div>
              <div className="text-xs text-center max-w-20">
                <div className="font-medium">{step.title}</div>
                <div className="text-gray-500">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {STEPS[currentStepIndex].icon}
                <span>{STEPS[currentStepIndex].title}</span>
              </CardTitle>
              <CardDescription>{STEPS[currentStepIndex].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderStep()}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex space-x-2">
                  {currentStepIndex < STEPS.length - 1 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center space-x-2"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center space-x-2"
                    >
                      {isSubmitting ? 'Updating Property...' : 'Update Property'}
                      {!isSubmitting && <Check className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </FormProvider>
    </div>
  )
}
