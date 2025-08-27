'use client'

import React, { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Check, Home, MapPin, Image, Settings } from 'lucide-react'
import type { CreatePropertyForm } from '@/lib/schemas/property'
import { PropertySchema } from '@/lib/schemas/property'
import { BasicInfoStep } from './form-steps/BasicInfoStep'
import { LocationStep } from './form-steps/LocationStep'
import { DetailsStep } from './form-steps/DetailsStep'
import { ImagesStep } from './form-steps/ImagesStep'
import { cn } from '@/lib/utils'

type FormStep = 'basic' | 'location' | 'details' | 'images'

const STEPS: { id: FormStep; title: string; description: string; icon: React.ReactNode }[] = [
  { id: 'basic', title: 'Basic Information', description: 'Property title, type, and pricing', icon: <Home className="h-4 w-4" /> },
  { id: 'location', title: 'Location', description: 'Address and location details', icon: <MapPin className="h-4 w-4" /> },
  { id: 'details', title: 'Property Details', description: 'Features, amenities, and specifications', icon: <Settings className="h-4 w-4" /> },
  { id: 'images', title: 'Images', description: 'Upload property photos', icon: <Image className="h-4 w-4" /> }
]

interface CreatePropertyFormProps {
  onSuccess?: () => void;
}

export function CreatePropertyForm({ onSuccess }: CreatePropertyFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // TEMPORARILY DISABLED DUE TO TYPE MISMATCH
  // TODO: Fix type conflict between form and schema
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
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create property')
      }

      const result = await response.json()
      console.log('Property created successfully:', result)
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('Error creating property:', error)
      // TODO: Show error message to user
      // You can use a toast notification library or display inline
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Create New Property</h1>
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
                      {isSubmitting ? 'Creating Property...' : 'Create Property'}
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
