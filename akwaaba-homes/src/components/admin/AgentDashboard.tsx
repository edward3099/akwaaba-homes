'use client';

import { useState } from 'react';
import { 
  BuildingOfficeIcon, 
  EyeIcon, 
  HomeIcon,
  CogIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth/authContext';
import PropertyListingForm from './PropertyListingForm';

// Simple mock data for agent dashboard
const mockAgentStats = [
  { name: 'Total Listings', value: '12', change: '+2', changeType: 'increase' },
  { name: 'Premium Listings', value: '5', change: '+1', changeType: 'increase' },
];

const mockRecentActivity = [
  { id: 1, type: 'listing', message: 'New property listed: 4-Bedroom Villa in East Legon', time: '2 hours ago', status: 'active' },
  { id: 2, type: 'inquiry', message: 'Inquiry received for 3-Bedroom Apartment in Cantonments', time: '4 hours ago', status: 'new' },
  { id: 3, type: 'listing', message: 'Property updated: 2-Bedroom Apartment in Airport Residential', time: '1 day ago', status: 'updated' },
  { id: 4, type: 'inquiry', message: 'Inquiry received for 5-Bedroom House in Trasacco Valley', time: '2 days ago', status: 'new' },
];

const mockProperties = [
  {
    id: 1,
    title: 'Luxury 4-Bedroom Villa',
    location: 'East Legon, Accra',
    price: 'GHS 2,500,000',
    type: 'Villa',
    status: 'active',
    tier: 'premium',
    views: 156,
    inquiries: 8,
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop'],
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    title: 'Modern 3-Bedroom Apartment',
    location: 'Cantonments, Accra',
    price: 'GHS 1,800,000',
    type: 'Apartment',
    status: 'active',
    tier: 'premium',
    views: 89,
    inquiries: 5,
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop'],
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    title: 'Cozy 2-Bedroom Apartment',
    location: 'Airport Residential, Accra',
    price: 'GHS 850,000',
    type: 'Apartment',
    status: 'active',
    tier: 'normal',
    views: 67,
    inquiries: 3,
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'],
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    title: 'Spacious 5-Bedroom House',
    location: 'Trasacco Valley, Accra',
    price: 'GHS 3,200,000',
    type: 'House',
    status: 'active',
    tier: 'premium',
    views: 234,
    inquiries: 12,
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop'],
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop'
  },
  {
    id: 5,
    title: 'Studio Apartment',
    location: 'Osu, Accra',
    price: 'GHS 450,000',
    type: 'Studio',
    status: 'inactive',
    tier: 'normal',
    views: 34,
    inquiries: 1,
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop'],
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop'
  }
];

const tabs = [
  { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
  { id: 'properties', name: 'My Properties', icon: BuildingOfficeIcon },
  { id: 'add-property', name: 'Add Property', icon: BuildingOfficeIcon },
  { id: 'profile', name: 'Profile', icon: EyeIcon },
  { id: 'settings', name: 'Settings', icon: CogIcon },
];

export default function AgentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleListNewProperty = () => {
    console.log('List New Property button clicked');
    console.log('Switching to Add Property tab');
    setActiveTab('add-property');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Page header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.user_metadata?.full_name || user?.email}!</h1>
              <p className="mt-2 text-gray-600">Here&apos;s what&apos;s happening with your properties and clients today</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockAgentStats.map((stat) => (
                <div key={stat.name} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {stat.name.includes('Listings') && <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />}
                      {stat.name.includes('Views') && <EyeIcon className="h-8 w-8 text-gray-400" />}
                      {stat.name.includes('Leads') && <HomeIcon className="h-8 w-8 text-gray-400" />}
                      {stat.name.includes('Premium') && <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />}
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <p className="text-sm font-medium text-gray-500 truncate">{stat.name}</p>
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium ${
                      stat.changeType === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">from last week</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {mockRecentActivity.map((activity) => (
                  <div key={activity.id} className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <HomeIcon className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                      <div className="ml-auto">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          activity.status === 'new' ? 'bg-blue-100 text-blue-800' : 
                          activity.status === 'active' ? 'bg-green-100 text-green-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'properties':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
                <p className="mt-2 text-gray-600">Manage your property listings and view performance</p>
              </div>
              <button
                onClick={() => setActiveTab('add-property')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                List New Property
              </button>
            </div>

            {/* Property Management Tools */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <BuildingOfficeIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Active Listings</h3>
                    <p className="text-sm text-gray-500">{mockProperties.filter(p => p.status === 'active').length} properties</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('properties')}
                  className="mt-4 w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  View All
                </button>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <StarIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Premium Listings</h3>
                    <p className="text-sm text-gray-500">{mockProperties.filter(p => p.tier === 'premium').length} properties</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('add-property')}
                  className="mt-4 w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Upgrade to Premium
                </button>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <CogIcon className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                    <p className="text-sm text-gray-500">Manage your listings</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => setActiveTab('add-property')}
                    className="w-full px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    + Add Property
                  </button>
                  <button
                    onClick={() => setActiveTab('properties')}
                    className="w-full px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Edit Listings
                  </button>
                </div>
              </div>
            </div>

            {/* Property Listings Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Properties</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockProperties.slice(0, 5).map((property) => (
                      <tr key={property.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-16">
                              <img
                                className="h-12 w-16 rounded-lg object-cover"
                                src={property.image}
                                alt={property.title}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {property.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {property.location}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {property.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            property.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {property.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            property.tier === 'premium' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {property.tier}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {Math.floor(Math.random() * 100) + 10}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => alert(`Edit property: ${property.title}`)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${property.title}"?`)) {
                                  alert(`Property "${property.title}" deleted successfully!`);
                                }
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setActiveTab('properties')}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View All Properties →
                </button>
              </div>
            </div>
          </div>
        );

      case 'add-property':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Property</h1>
              <p className="mt-2 text-gray-600">Fill out the form below to add your property to the platform</p>
            </div>
            <PropertyListingForm />
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agent Profile</h1>
              <p className="mt-2 text-gray-600">Manage your profile information that appears on your public agent page</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-6">
                {/* Profile Photo & Cover Image */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Photos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Photo
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                          Upload Photo
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cover Image
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                          Upload Cover
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        defaultValue="Kwame Asante"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Professional Title
                      </label>
                      <input
                        type="text"
                        defaultValue="Real Estate Agent"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Real Estate Agent, Property Consultant"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        defaultValue="8"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Number of years"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company/Organization
                      </label>
                      <input
                        type="text"
                        defaultValue="AkwaabaHomes"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your company name"
                      />
                    </div>
                  </div>
                </div>

                {/* About Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">About You</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio/Description *
                    </label>
                    <textarea
                      rows={4}
                      defaultValue="Kwame Asante is a seasoned real estate professional with over 8 years of experience in the Ghanaian property market. Specializing in residential and commercial properties, Kwame has helped hundreds of families find their dream homes and investors secure profitable real estate opportunities."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell potential clients about your experience, expertise, and what makes you unique..."
                    />
                  </div>
                </div>

                {/* Specializations */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Specializations</h3>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {['Residential', 'Commercial', 'Luxury Properties', 'Land', 'Investment Properties', 'Rental Properties'].map((spec) => (
                        <label key={spec} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            defaultChecked={['Residential', 'Commercial', 'Luxury Properties'].includes(spec)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{spec}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Languages Spoken</h3>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {['English', 'Twi', 'Ga', 'Ewe', 'Dagbani', 'Hausa'].map((lang) => (
                        <label key={lang} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            defaultChecked={['English', 'Twi', 'Ga'].includes(lang)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{lang}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        defaultValue="+233 24 123 4567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+233 XX XXX XXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        defaultValue="kwame@akwaabahomes.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        defaultValue="+233 24 123 4567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+233 XX XXX XXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Office Address
                      </label>
                      <input
                        type="text"
                        defaultValue="East Legon, Accra"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your office location"
                      />
                    </div>
                  </div>
                </div>

                {/* Working Hours */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Working Hours</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weekdays
                      </label>
                      <input
                        type="text"
                        defaultValue="8:00 AM - 6:00 PM"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 8:00 AM - 6:00 PM"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weekends
                      </label>
                      <input
                        type="text"
                        defaultValue="9:00 AM - 3:00 PM"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 9:00 AM - 3:00 PM"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4">
                  <button className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Save Profile Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="mt-2 text-gray-600">Manage your account and preferences</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
                  <p className="text-sm text-gray-500">Update your profile and contact details</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
                  <p className="text-sm text-gray-500">Configure how you receive updates</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Privacy Settings</h3>
                  <p className="text-sm text-gray-500">Control your data and privacy</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Professional Settings</h3>
                  <p className="text-sm text-gray-500">Manage your agent profile and credentials</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}
