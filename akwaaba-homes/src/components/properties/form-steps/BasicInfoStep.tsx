'use client'

import React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { FormField, SelectField } from '@/components/ui/FormField'
import type { CreatePropertyForm } from '@/lib/schemas/property'

export function BasicInfoStep() {
  const { control, formState: { errors } } = useFormContext<CreatePropertyForm>()

  return (
    <div className="space-y-6">
      {/* Title */}
      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <FormField
            {...field}
            label="Property Title"
            placeholder="Enter a descriptive title for your property"
            helperText="Make it attractive and descriptive to catch potential buyers' attention"
            error={errors.title?.message}
            required
          />
        )}
      />

      {/* Description */}
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <FormField
            {...field}
            label="Description"
            placeholder="Describe your property in detail..."
            helperText="Include key features, unique selling points, and any special characteristics"
            error={errors.description?.message}
            required
          />
        )}
      />

      {/* Property Type and Listing Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          control={control}
          name="property_type"
          render={({ field }) => (
            <SelectField
              {...field}
              label="Property Type"
              placeholder="Select property type"
              error={errors.property_type?.message}
              required
              options={[
                { value: 'house', label: 'House' },
                { value: 'apartment', label: 'Apartment' },
                { value: 'land', label: 'Land' },
                { value: 'commercial', label: 'Commercial' },
                { value: 'office', label: 'Office' }
              ]}
            />
          )}
        />

        <Controller
          control={control}
          name="listing_type"
          render={({ field }) => (
            <SelectField
              {...field}
              label="Listing Type"
              placeholder="Select listing type"
              error={errors.listing_type?.message}
              required
              options={[
                { value: 'sale', label: 'For Sale' },
                { value: 'rent', label: 'For Rent' },
                { value: 'lease', label: 'For Lease' }
              ]}
            />
          )}
        />
      </div>

      {/* Price and Currency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          control={control}
          name="price"
          render={({ field }) => (
            <FormField
              {...field}
              label="Price"
              placeholder="0"
              helperText="Enter the price in the selected currency"
              error={errors.price?.message}
              type="number"
              min={0}
              step={0.01}
              required
            />
          )}
        />

        <Controller
          control={control}
          name="currency"
          render={({ field }) => (
            <SelectField
              {...field}
              label="Currency"
              placeholder="Select currency"
              error={errors.currency?.message}
              required
              options={[
                { value: 'GHS', label: 'Ghanaian Cedi (GHS)' },
                { value: 'USD', label: 'US Dollar (USD)' },
                { value: 'EUR', label: 'Euro (EUR)' },
                { value: 'GBP', label: 'British Pound (GBP)' }
              ]}
            />
          )}
        />
      </div>
    </div>
  )
}
