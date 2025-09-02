'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Save, Loader2 } from 'lucide-react'
import { PropertySchema, type Property } from '@/lib/schemas/property'
import { BasicInfoStep } from './form-steps/BasicInfoStep'
import { LocationStep } from './form-steps/LocationStep'
import { DetailsStep } from './form-steps/DetailsStep'
import { ImagesStep } from './form-steps/ImagesStep'

interface UpdatePropertyFormProps {
  propertyId: string
}

type FormData = Property

const STEPS = [
  { id: 1, title: 'Basic Information', component: BasicInfoStep },
  { id: 2, title: 'Location', component: LocationStep },
  { id: 3, title: 'Details', component: DetailsStep },
  { id: 4, title: 'Images', component: ImagesStep }
]

export function UpdatePropertyForm({ propertyId }: UpdatePropertyFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [fetchingProperty, setFetchingProperty] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormData>({
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
      bedrooms: 0,
      bathrooms: 0,
      square_feet: 0,
      land_size: 0,
      year_built: 0,
      features: [],
      amenities: [],
      status: 'active',
      is_featured: false,
      images: []
    }
  })

  // Fetch existing property data
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setFetchingProperty(true)
        setError(null)
        
        const response = await fetch(`/api/properties/${propertyId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch property')
        }
        
        const data = await response.json()
        const property = data.property
        
        // Pre-populate form with existing data
        form.reset({
          ...property,
          // Ensure images are in the correct format
          images: property.property_images?.map((img: any) => ({
            url: img.url,
            is_primary: img.is_primary
          })) || []
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch property')
      } finally {
        setFetchingProperty(false)
      }
    }

    if (propertyId) {
      fetchProperty()
    }
  }, [propertyId, form])

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update property')
      }

      // Redirect to properties list
      router.push('/admin/properties')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update property')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = (currentStep / STEPS.length) * 100

  if (fetchingProperty) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/admin/properties')}>
            Back to Properties
          </Button>
        </div>
      </div>
    )
  }

  const CurrentStepComponent = STEPS[currentStep - 1].component

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/properties')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            Edit Property
          </CardTitle>
          <CardDescription>
            Update the property information. You can navigate between steps using the buttons below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep} of {STEPS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Title */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {STEPS[currentStep - 1].title}
            </h3>
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CurrentStepComponent form={form} />

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-2">
                {currentStep < STEPS.length ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!form.formState.isValid}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading || !form.formState.isValid}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Property
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
