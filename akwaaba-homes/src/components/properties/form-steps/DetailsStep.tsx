'use client'

import React from 'react'
import { useFormContext, Controller } from 'react-hook-form'

import { Checkbox } from '@/components/ui/checkbox'
import { CreatePropertyForm, PROPERTY_FEATURES, PROPERTY_AMENITIES } from '@/lib/schemas/property'

export function DetailsStep() {
  const { control, formState: { errors } } = useFormContext<CreatePropertyForm>()

  return (
    <div className="space-y-6">
      {/* Basic Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Bedrooms <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="bedrooms"
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min={0}
                max={20}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          />
          {errors.bedrooms?.message && (
            <p className="text-sm text-red-500">{errors.bedrooms.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Bathrooms <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="bathrooms"
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min={0}
                max={20}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          />
          {errors.bathrooms?.message && (
            <p className="text-sm text-red-500">{errors.bathrooms.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Square Feet
          </label>
          <Controller
            control={control}
            name="square_feet"
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min={0}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          />
          {errors.square_feet?.message && (
            <p className="text-sm text-red-500">{errors.square_feet.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Land Size (sq ft)
          </label>
          <Controller
            control={control}
            name="land_size"
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min={0}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          />
          {errors.land_size?.message && (
            <p className="text-sm text-red-500">{errors.land_size.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Year Built
        </label>
        <Controller
          control={control}
          name="year_built"
          render={({ field }) => (
            <input
              {...field}
              type="number"
              min={1800}
              max={new Date().getFullYear()}
              placeholder="Year the property was built"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        />
        {errors.year_built?.message && (
          <p className="text-sm text-red-500">{errors.year_built.message}</p>
        )}
      </div>

      {/* Features */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">
          Property Features <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500">Select all features that apply to your property</p>
        
        <Controller
          control={control}
          name="features"
          rules={{ required: 'At least one feature must be selected' }}
          render={({ field }) => (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PROPERTY_FEATURES.map((feature) => (
                <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                                  <Checkbox
                  checked={field.value?.includes(feature) || false}
                  onChange={(e) => {
                    if (e.target.checked) {
                      field.onChange([...field.value, feature])
                    } else {
                      field.onChange(field.value?.filter(f => f !== feature))
                    }
                  }}
                />
                  <span className="text-sm text-gray-700">{feature}</span>
                </label>
              ))}
            </div>
          )}
        />
        {errors.features && (
          <p className="text-sm text-red-600">{errors.features.message}</p>
        )}
      </div>

      {/* Amenities */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">
          Nearby Amenities <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500">Select amenities available near your property</p>
        
        <Controller
          control={control}
          name="amenities"
          rules={{ required: 'At least one amenity must be selected' }}
          render={({ field }) => (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PROPERTY_AMENITIES.map((amenity) => (
                <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={field.value?.includes(amenity) || false}
                    onChange={(e) => {
                      if (e.target.checked) {
                        field.onChange([...field.value, amenity])
                      } else {
                        field.onChange(field.value?.filter(a => a !== amenity))
                      }
                    }}
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          )}
        />
        {errors.amenities && (
          <p className="text-sm text-red-600">{errors.amenities.message}</p>
        )}
      </div>

      {/* Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">Property Details Tips</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Be accurate with measurements and counts</li>
          <li>• Select all relevant features and amenities</li>
          <li>• Detailed information helps with property valuation</li>
        </ul>
      </div>
    </div>
  )
}
