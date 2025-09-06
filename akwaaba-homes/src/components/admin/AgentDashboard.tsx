'use client';

import { useState, useEffect } from 'react';
import { 
  BuildingOfficeIcon, 
  EyeIcon, 
  HomeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth/authContext';
import PropertyListingForm from './PropertyListingForm';
import EmptyState from '../dashboard/EmptyState';
import { toast } from 'sonner';

const tabs = [
  { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
  { id: 'properties', name: 'My Properties', icon: BuildingOfficeIcon },
  { id: 'add-property', name: 'Add Property', icon: BuildingOfficeIcon },
  { id: 'profile', name: 'Profile', icon: EyeIcon },
];

export default function AgentDashboard() {
  const { user, session, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [properties, setProperties] = useState([]);
  const [editingProperty, setEditingProperty] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    professionalTitle: '',
    yearsOfExperience: 0,
    company: '',
    bio: '',
    specializations: [],
    languages: ['English'],
    phone: '',
    email: user?.email || '',
    whatsapp: '',
    officeAddress: '',
    weekdays: '8:00 AM - 6:00 PM',
    weekends: '9:00 AM - 3:00 PM'
  });

  // Edit property form state
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    price: 0,
    status: 'active',
    property_type: 'house',
    bedrooms: 0,
    bathrooms: 0,
    square_feet: 0,
    address: '',
    city: '',
    region: ''
  });
  
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Auto-save and validation state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedData, setLastSavedData] = useState(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({});
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Upload progress state
  const [uploadProgress, setUploadProgress] = useState({
    profile: 0,
    cover: 0
  });
  const [isUploading, setIsUploading] = useState({
    profile: false,
    cover: false
  });
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      whatsapp: true
    },
    privacy: {
      profileVisible: true,
      contactVisible: true,
      analyticsSharing: false
    },
    professional: {
      autoResponder: true,
      leadNotifications: true,
      marketUpdates: true
    }
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
  }, [isAuthenticated]);

  // Fetch real properties data
  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/properties/my-properties', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setProperties(data.properties || []);
          } else {
            console.error('API returned error:', data.error);
            toast.error(data.error || 'Failed to fetch properties');
            setProperties([]);
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to fetch properties:', response.status, errorData);
          
          if (response.status === 401) {
            toast.error('Please log in to view your properties');
          } else if (response.status === 403) {
            toast.error('Access denied. Please verify your account.');
          } else {
            toast.error(errorData.error || 'Failed to fetch properties');
          }
          setProperties([]);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast.error('Network error. Please check your connection.');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [user]);

  // Filter properties based on search and filters
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    const matchesType = statusFilter === 'all' || property.property_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate dynamic stats based on real properties
  const userStats = [
    { 
      name: 'Total Listings', 
      value: properties.length.toString(), 
      change: '0', 
      changeType: 'neutral' 
    },
    { 
      name: 'Active Listings', 
      value: properties.filter(p => p.status === 'active').length.toString(), 
      change: '0', 
      changeType: 'neutral' 
    },
  ];

  const recentActivity = properties.slice(0, 4).map(property => ({
    id: property.id,
    type: 'listing',
    message: `Property: ${property.title}`,
    time: new Date(property.created_at).toLocaleDateString(),
    status: property.status
  }));

  // Handle property deletion
  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.message) {
          setProperties(properties.filter(p => p.id !== propertyId));
          toast.success('Property deleted successfully');
        } else {
          toast.error(data.error || 'Failed to delete property');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to delete property:', response.status, errorData);
        
        if (response.status === 401) {
          toast.error('Please log in to delete properties');
        } else if (response.status === 403) {
          toast.error('Access denied. You can only delete your own properties.');
        } else if (response.status === 404) {
          toast.error('Property not found');
        } else {
          toast.error(errorData.error || 'Failed to delete property');
        }
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Network error. Please check your connection.');
    }
  };

  // Handle property edit
  const handleEditProperty = async () => {
    if (!editingProperty) return;
    
    try {
      const response = await fetch(`/api/properties/${editingProperty.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.message) {
          // Update the property in the list
          setProperties(properties.map(p => 
            p.id === editingProperty.id 
              ? { ...p, ...editFormData }
              : p
          ));
          setShowEditModal(false);
          setEditingProperty(null);
          toast.success('Property updated successfully');
        } else {
          toast.error(data.error || 'Failed to update property');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update property:', response.status, errorData);
        toast.error(errorData.error || 'Failed to update property');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      toast.error('Network error. Please check your connection.');
    }
  };

  // Initialize edit form when property is selected for editing
  useEffect(() => {
    if (editingProperty) {
      setEditFormData({
        title: editingProperty.title || '',
        description: editingProperty.description || '',
        price: editingProperty.price || 0,
        status: editingProperty.status || 'active',
        property_type: editingProperty.property_type || 'house',
        bedrooms: editingProperty.bedrooms || 0,
        bathrooms: editingProperty.bathrooms || 0,
        square_feet: editingProperty.square_feet || 0,
        address: editingProperty.location?.address || '',
        city: editingProperty.location?.city || '',
        region: editingProperty.location?.region || ''
      });
    }
  }, [editingProperty]);

  // Render dashboard content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userStats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <BuildingOfficeIcon className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                        <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            activity.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'properties':
        return (
          <div className="space-y-6">
            {/* Properties Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Properties</h2>
              <button
                onClick={() => setActiveTab('add-property')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Property
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Properties List */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading properties...</p>
              </div>
            ) : filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <div key={property.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.title}</h3>
                      <p className="text-gray-600 mb-2">{property.location.address}</p>
                      <p className="text-xl font-bold text-blue-600 mb-4">GHS {property.price.toLocaleString()}</p>
                      <div className="flex justify-between items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          property.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {property.status}
                          </span>
                          <div className="flex space-x-2">
                            <button
                            onClick={() => {
                              setEditingProperty(property);
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                            onClick={() => handleDeleteProperty(property.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                      </div>
                    </div>
                  </div>
                    ))}
              </div>
            ) : (
              <EmptyState userType="user" />
            )}
          </div>
        );

      case 'add-property':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Add New Property</h2>
              <button
                onClick={() => setActiveTab('properties')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Back to Properties
              </button>
            </div>
            <PropertyListingForm />
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Profile Management</h2>
              <a
                href="/agent/profile"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Full Profile
              </a>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Management</h3>
                <p className="text-gray-600 mb-4">
                  Manage your profile, update personal information, and maintain your professional credentials.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Update personal information</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Manage professional credentials</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Track verification status</span>
                  </div>
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.user_metadata?.full_name || 'User'}! Manage your properties and grow your business.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
                <tab.icon className="w-5 h-5 inline mr-2" />
                {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
      </div>

      {/* Edit Property Modal */}
      {showEditModal && editingProperty && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Edit Property</h3>
              
              <form onSubmit={(e) => { e.preventDefault(); handleEditProperty(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Title *</label>
                    <input
                      type="text"
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (GHS) *</label>
                    <input
                      type="number"
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({...editFormData, price: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                    <select
                      value={editFormData.property_type}
                      onChange={(e) => setEditFormData({...editFormData, property_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="house">House</option>
                      <option value="apartment">Apartment</option>
                      <option value="land">Land</option>
                      <option value="commercial">Commercial</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="condo">Condo</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                    <input
                      type="number"
                      value={editFormData.bedrooms}
                      onChange={(e) => setEditFormData({...editFormData, bedrooms: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                    <input
                      type="number"
                      value={editFormData.bathrooms}
                      onChange={(e) => setEditFormData({...editFormData, bathrooms: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Size (sqft)</label>
                    <input
                      type="number"
                      value={editFormData.square_feet}
                      onChange={(e) => setEditFormData({...editFormData, square_feet: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={editFormData.city}
                      onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                    <input
                      type="text"
                      value={editFormData.region}
                      onChange={(e) => setEditFormData({...editFormData, region: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
