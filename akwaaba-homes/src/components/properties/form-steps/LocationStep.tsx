'use client'

import React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { CreatePropertyForm } from '@/lib/schemas/property'

export function LocationStep() {
  const { control, formState: { errors } } = useFormContext<CreatePropertyForm>()

  return (
    <div className="space-y-6">
      {/* Address */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Street Address <span className="text-red-500">*</span>
        </label>
        <Controller
          control={control}
          name="address"
          render={({ field }) => (
            <input
              {...field}
              type="text"
              placeholder="Enter the full street address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        />
        {errors.address?.message && (
          <p className="text-sm text-red-500">{errors.address.message}</p>
        )}
        <p className="text-sm text-gray-500">Include street number, street name, and any additional details</p>
      </div>

      {/* City and Region */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            City <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="city"
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Enter city name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          />
          {errors.city?.message && (
            <p className="text-sm text-red-500">{errors.city.message}</p>
          )}
          <p className="text-sm text-gray-500">The city where the property is located</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Region/State <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="region"
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Enter region or state"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          />
          {errors.region?.message && (
            <p className="text-sm text-red-500">{errors.region.message}</p>
          )}
          <p className="text-sm text-gray-500">The region, state, or province</p>
        </div>
      </div>

      {/* Postal Code */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Postal Code
        </label>
        <Controller
          control={control}
          name="postal_code"
          render={({ field }) => (
            <input
              {...field}
              type="text"
              placeholder="Enter postal code (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        />
        {errors.postal_code?.message && (
          <p className="text-sm text-red-500">{errors.postal_code.message}</p>
        )}
        <p className="text-sm text-gray-500">Postal or ZIP code for the property location</p>
      </div>

      {/* Location Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Location Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Be as specific as possible with the address</li>
          <li>• Include landmarks or nearby intersections if helpful</li>
          <li>• Accurate location helps with property searches and viewings</li>
        </ul>
      </div>
    </div>
  )
}
