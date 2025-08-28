'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Save, 
  Globe, 
  Shield, 
  Users, 
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { useApiMutation } from '@/lib/hooks/useApiMutation'
import { toast } from 'sonner'

interface PlatformSettings {
  platform: {
    name: string
    description: string
    version: string
    contact_email: string
    support_phone: string
    address: string
    business_hours: string
  }
  features: {
    user_registration: boolean
    property_listings: boolean
    agent_verification: boolean
    payment_processing: boolean
    analytics_dashboard: boolean
    mobile_app: boolean
  }
  security: {
    two_factor_auth: boolean
    session_timeout: number
    max_login_attempts: number
    password_min_length: number
    require_verification: boolean
  }
  notifications: {
    email_notifications: boolean
    sms_notifications: boolean
    push_notifications: boolean
    admin_alerts: boolean
  }
  limits: {
    max_properties_per_user: number
    max_images_per_property: number
    max_file_size_mb: number
    max_users_per_plan: number
  }
}

const defaultSettings: PlatformSettings = {
  platform: {
    name: 'AkwaabaHomes',
    description: 'Ghana\'s premier real estate marketplace for diaspora buyers',
    version: '1.0.0',
    contact_email: 'admin@akwaabahomes.com',
    support_phone: '+233 20 123 4567',
    address: 'Accra, Ghana',
    business_hours: 'Monday - Friday: 8:00 AM - 6:00 PM GMT'
  },
  features: {
    user_registration: true,
    property_listings: true,
    agent_verification: true,
    payment_processing: false,
    analytics_dashboard: true,
    mobile_app: false
  },
  security: {
    two_factor_auth: false,
    session_timeout: 30,
    max_login_attempts: 5,
    password_min_length: 8,
    require_verification: true
  },
  notifications: {
    email_notifications: true,
    sms_notifications: false,
    push_notifications: false,
    admin_alerts: true
  },
  limits: {
    max_properties_per_user: 10,
    max_images_per_property: 10,
    max_file_size_mb: 5,
    max_users_per_plan: 1000
  }
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings)
  const [hasChanges, setHasChanges] = useState(false)

  // API mutation hook for saving settings
  const saveSettingsMutation = useApiMutation({
    successMessage: 'Settings saved successfully',
    errorMessage: 'Failed to save settings',
    loadingMessage: 'Saving settings...',
    onSuccess: () => {
      setHasChanges(false)
    }
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings || defaultSettings)
      } else {
        console.error('Failed to fetch settings')
        toast.error('Failed to load settings', {
          description: 'Using default settings. Please try refreshing the page.'
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings', {
        description: 'Using default settings. Please try refreshing the page.'
      })
    }
  }

  const handleSettingChange = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev }
      const keys = path.split('.')
      let current: any = newSettings
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      setHasChanges(true)
      return newSettings
    })
  }

  const saveSettings = async () => {
    await saveSettingsMutation.mutate(async () => {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save settings')
      }

      return await response.json()
    })
  }

  const resetToDefaults = () => {
    setSettings(defaultSettings)
    setHasChanges(true)
    toast.info('Settings reset to defaults', {
      description: 'Click Save to apply the default settings.'
    })
  }

  const handleReset = () => {
    toast('Reset Settings', {
      description: 'Are you sure you want to reset all settings to defaults?',
      action: {
        label: 'Reset',
        onClick: resetToDefaults
      },
      cancel: {
        label: 'Cancel',
        onClick: () => toast.dismiss()
      },
      duration: Infinity
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure platform-wide settings and features
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Unsaved Changes
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-ghana-gold text-ghana-gold hover:bg-ghana-gold hover:text-white"
          >
            Reset to Defaults
          </Button>
          <Button
            onClick={saveSettings}
            disabled={!hasChanges || saveSettingsMutation.isLoading}
            className="bg-ghana-green hover:bg-ghana-green-dark text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveSettingsMutation.isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Platform Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2 text-ghana-green" />
            Platform Information
          </CardTitle>
          <CardDescription>
            Basic platform details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="platform-name">Platform Name</Label>
              <Input
                id="platform-name"
                value={settings.platform.name}
                onChange={(e) => handleSettingChange('platform.name', e.target.value)}
                placeholder="Enter platform name"
              />
            </div>
            <div>
              <Label htmlFor="platform-version">Version</Label>
              <Input
                id="platform-version"
                value={settings.platform.version}
                onChange={(e) => handleSettingChange('platform.version', e.target.value)}
                placeholder="Enter version"
              />
            </div>
            <div>
              <Label htmlFor="platform-email">Contact Email</Label>
              <Input
                id="platform-email"
                type="email"
                value={settings.platform.contact_email}
                onChange={(e) => handleSettingChange('platform.contact_email', e.target.value)}
                placeholder="Enter contact email"
              />
            </div>
            <div>
              <Label htmlFor="platform-phone">Support Phone</Label>
              <Input
                id="platform-phone"
                value={settings.platform.support_phone}
                onChange={(e) => handleSettingChange('platform.support_phone', e.target.value)}
                placeholder="Enter support phone"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="platform-description">Description</Label>
              <Textarea
                id="platform-description"
                value={settings.platform.description}
                onChange={(e) => handleSettingChange('platform.description', e.target.value)}
                placeholder="Enter platform description"
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="platform-address">Address</Label>
              <Input
                id="platform-address"
                value={settings.platform.address}
                onChange={(e) => handleSettingChange('platform.address', e.target.value)}
                placeholder="Enter business address"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="platform-hours">Business Hours</Label>
              <Input
                id="platform-hours"
                value={settings.platform.business_hours}
                onChange={(e) => handleSettingChange('platform.business_hours', e.target.value)}
                placeholder="Enter business hours"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-ghana-green" />
            Feature Toggles
          </CardTitle>
          <CardDescription>
            Enable or disable platform features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(settings.features).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium capitalize">
                    {key.replace(/_/g, ' ')}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {value ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => handleSettingChange(`features.${key}`, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-ghana-green" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Configure security and authentication settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                <p className="text-xs text-gray-500">
                  Require 2FA for admin accounts
                </p>
              </div>
              <Switch
                checked={settings.security.two_factor_auth}
                onCheckedChange={(checked) => handleSettingChange('security.two_factor_auth', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="text-sm font-medium">Require Verification</Label>
                <p className="text-xs text-gray-500">
                  Require email verification for new users
                </p>
              </div>
              <Switch
                checked={settings.security.require_verification}
                onCheckedChange={(checked) => handleSettingChange('security.require_verification', checked)}
              />
            </div>
            <div>
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input
                id="session-timeout"
                type="number"
                min="5"
                max="480"
                value={settings.security.session_timeout}
                onChange={(e) => handleSettingChange('security.session_timeout', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
              <Input
                id="max-login-attempts"
                type="number"
                min="3"
                max="10"
                value={settings.security.max_login_attempts}
                onChange={(e) => handleSettingChange('security.max_login_attempts', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="password-min-length">Minimum Password Length</Label>
              <Input
                id="password-min-length"
                type="number"
                min="6"
                max="20"
                value={settings.security.password_min_length}
                onChange={(e) => handleSettingChange('security.password_min_length', parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="w-5 h-5 mr-2 text-ghana-green" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Configure notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium capitalize">
                    {key.replace(/_/g, ' ')}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {value ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => handleSettingChange(`notifications.${key}`, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-ghana-green" />
            System Limits
          </CardTitle>
          <CardDescription>
            Configure system usage limits and constraints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max-properties">Max Properties per User</Label>
              <Input
                id="max-properties"
                type="number"
                min="1"
                max="100"
                value={settings.limits.max_properties_per_user}
                onChange={(e) => handleSettingChange('limits.max_properties_per_user', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="max-images">Max Images per Property</Label>
              <Input
                id="max-images"
                type="number"
                min="1"
                max="20"
                value={settings.limits.max_images_per_property}
                onChange={(e) => handleSettingChange('limits.max_images_per_property', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="max-file-size">Max File Size (MB)</Label>
              <Input
                id="max-file-size"
                type="number"
                min="1"
                max="50"
                value={settings.limits.max_file_size_mb}
                onChange={(e) => handleSettingChange('limits.max_file_size_mb', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="max-users">Max Users per Plan</Label>
              <Input
                id="max-users"
                type="number"
                min="100"
                max="10000"
                value={settings.limits.max_users_per_plan}
                onChange={(e) => handleSettingChange('limits.max_users_per_plan', parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button Footer */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 bg-white border-2 border-ghana-green rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">Unsaved Changes</span>
            </div>
            <Button
              onClick={saveSettings}
              disabled={saveSettingsMutation.isLoading}
              className="bg-ghana-green hover:bg-ghana-green-dark text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveSettingsMutation.isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
