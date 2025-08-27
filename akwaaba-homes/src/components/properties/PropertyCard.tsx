'use client'

import { Property } from '@/lib/types/index';
import { formatPrice } from '@/lib/utils/formatPrice';
import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const {
    id,
    title,
    description,
    price,
    location,
    type,
    specifications,
    images,
    status,
  } = property;

  const mainImage = images?.[0] || '/placeholder-property.svg';
  const statusColor = {
    'for-sale': 'bg-green-100 text-green-800',
    'sold': 'bg-red-100 text-red-800',
    'rented': 'bg-blue-100 text-blue-800',
    'for-rent': 'bg-blue-100 text-blue-800',
    'short-let': 'bg-purple-100 text-purple-800',
  }[status] || 'bg-gray-100 text-gray-800';

  const displayStatus = {
    'for-sale': 'For Sale',
    'sold': 'Sold',
    'rented': 'Rented',
    'for-rent': 'For Rent',
    'short-let': 'Short Let',
  }[status] || 'Unknown';

  return (
    <Link href={`/properties/${id}`}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <OptimizedImage
            src={mainImage}
            alt={title}
            width={400}
            height={192}
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
              {displayStatus}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-2">
            <h3 className="font-semibold text-gray-900 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <p className="text-gray-500 text-sm flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location.city}, {location.region}
            </p>
          </div>

          <div className="mb-3">
            <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
          </div>

          {/* Property Details */}
          <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2z" />
                </svg>
                {specifications.bedrooms || 0} bed
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-8 0h8m-8 0a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2" />
                </svg>
                {specifications.bathrooms || 0} bath
              </span>
            </div>
            <span className="text-xs uppercase font-medium text-gray-400">
              {type}
            </span>
          </div>

          {/* Price and Area */}
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-blue-600">
              {formatPrice(price)}
            </div>
            {specifications.size > 0 && (
              <div className="text-sm text-gray-500">
                {specifications.size} {specifications.sizeUnit}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
