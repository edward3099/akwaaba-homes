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
  CheckCircle,
  CreditCard,
  Smartphone,
  DollarSign,
  PoundSterling,
  Euro
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
    premium_listings: boolean
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
  payments: {
    mobile_money_merchant_number: string
    premium_listing_price: number
  }
  currency_rates: {
    usd_to_ghs: number
    gbp_to_ghs: number
    eur_to_ghs: number
  }
}

const defaultSettings: PlatformSettings = {
  platform: {
    name: 'AkwaabaHomes',
    description: 'Ghana\'s premier real estate marketplace for diaspora buyers',
    version: '1.0.0',
    contact_email: 'admin@akwaabahomes.com',
    support_phone: '+44 7949 4321 95',
    address: 'Accra, Ghana',
    business_hours: 'Monday - Friday: 8:00 AM - 6:00 PM GMT'
  },
  features: {
    user_registration: true,
    property_listings: true,
    agent_verification: true,
    payment_processing: false,
    analytics_dashboard: true,
    mobile_app: false,
    premium_listings: true
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
  },
  payments: {
    mobile_money_merchant_number: '',
    premium_listing_price: 50
  },
  currency_rates: {
    usd_to_ghs: 16.13, // 1 USD = 16.13 GHS (approximate current rate)
    gbp_to_ghs: 20.50, // 1 GBP = 20.50 GHS (approximate current rate)
    eur_to_ghs: 17.25  // 1 EUR = 17.25 GHS (approximate current rate)
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
      const response = await fetch('/api/admin/settings', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        const backendSettings = data.settings
        
        // Map backend settings to frontend structure
        if (backendSettings) {
          const mappedSettings: PlatformSettings = {
            platform: {
              name: backendSettings.platform?.name || defaultSettings.platform.name,
              description: backendSettings.platform?.description || defaultSettings.platform.description,
              version: backendSettings.platform?.version || defaultSettings.platform.version,
              contact_email: backendSettings.platform?.contact_email || defaultSettings.platform.contact_email,
              support_phone: backendSettings.platform?.support_phone || defaultSettings.platform.support_phone,
              address: backendSettings.platform?.address || defaultSettings.platform.address,
              business_hours: backendSettings.platform?.business_hours || defaultSettings.platform.business_hours
            },
            features: {
              user_registration: backendSettings.platform?.user_registration_enabled ?? defaultSettings.features.user_registration,
              property_listings: backendSettings.platform?.property_listings_enabled ?? defaultSettings.features.property_listings,
              agent_verification: backendSettings.platform?.agent_verification_enabled ?? defaultSettings.features.agent_verification,
              payment_processing: backendSettings.platform?.payment_processing_enabled ?? defaultSettings.features.payment_processing,
              analytics_dashboard: backendSettings.platform?.analytics_dashboard_enabled ?? defaultSettings.features.analytics_dashboard,
              mobile_app: backendSettings.platform?.mobile_app_enabled ?? defaultSettings.features.mobile_app,
              premium_listings: backendSettings.platform?.premium_listings_enabled ?? defaultSettings.features.premium_listings
            },
            security: {
              two_factor_auth: backendSettings.platform?.two_factor_auth ?? defaultSettings.security.two_factor_auth,
              session_timeout: backendSettings.platform?.session_timeout ?? defaultSettings.security.session_timeout,
              max_login_attempts: backendSettings.platform?.max_login_attempts ?? defaultSettings.security.max_login_attempts,
              password_min_length: backendSettings.platform?.password_min_length ?? defaultSettings.security.password_min_length,
              require_verification: backendSettings.platform?.require_verification ?? defaultSettings.security.require_verification
            },
            notifications: {
              email_notifications: backendSettings.notification_settings?.email_notifications_enabled ?? defaultSettings.notifications.email_notifications,
              sms_notifications: backendSettings.notification_settings?.sms_notifications_enabled ?? defaultSettings.notifications.sms_notifications,
              push_notifications: backendSettings.notification_settings?.push_notifications_enabled ?? defaultSettings.notifications.push_notifications,
              admin_alerts: backendSettings.notification_settings?.admin_alerts_enabled ?? defaultSettings.notifications.admin_alerts
            },
            limits: {
              max_properties_per_user: backendSettings.platform?.max_properties_per_user ?? defaultSettings.limits.max_properties_per_user,
              max_images_per_property: backendSettings.platform?.max_images_per_property ?? defaultSettings.limits.max_images_per_property,
              max_file_size_mb: backendSettings.platform?.max_file_size_mb ?? defaultSettings.limits.max_file_size_mb,
              max_users_per_plan: backendSettings.platform?.max_users_per_plan ?? defaultSettings.limits.max_users_per_plan
            },
            payments: {
              mobile_money_merchant_number: backendSettings.platform?.mobile_money_merchant_number ?? defaultSettings.payments.mobile_money_merchant_number,
              premium_listing_price: backendSettings.platform?.premium_listing_price ?? defaultSettings.payments.premium_listing_price
            },
            currency_rates: {
              usd_to_ghs: backendSettings.currency_rates?.usd_to_ghs ?? defaultSettings.currency_rates.usd_to_ghs,
              gbp_to_ghs: backendSettings.currency_rates?.gbp_to_ghs ?? defaultSettings.currency_rates.gbp_to_ghs,
              eur_to_ghs: backendSettings.currency_rates?.eur_to_ghs ?? defaultSettings.currency_rates.eur_to_ghs
            }
          }
          setSettings(mappedSettings)
        } else {
          setSettings(defaultSettings)
        }
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
      // Structure the data for the backend API
      const apiData = {
        platform: {
          name: settings.platform.name,
          description: settings.platform.description,
          version: settings.platform.version,
          contact_email: settings.platform.contact_email,
          support_phone: settings.platform.support_phone,
          address: settings.platform.address,
          business_hours: settings.platform.business_hours,
          user_registration_enabled: settings.features.user_registration,
          property_listings_enabled: settings.features.property_listings,
          agent_verification_enabled: settings.features.agent_verification,
          payment_processing_enabled: settings.features.payment_processing,
          analytics_dashboard_enabled: settings.features.analytics_dashboard,
          mobile_app_enabled: settings.features.mobile_app,
          premium_listings_enabled: settings.features.premium_listings,
          two_factor_auth: settings.security.two_factor_auth,
          session_timeout: settings.security.session_timeout,
          max_login_attempts: settings.security.max_login_attempts,
          password_min_length: settings.security.password_min_length,
          require_verification: settings.security.require_verification,
          max_properties_per_user: settings.limits.max_properties_per_user,
          max_images_per_property: settings.limits.max_images_per_property,
          max_file_size_mb: settings.limits.max_file_size_mb,
          max_users_per_plan: settings.limits.max_users_per_plan,
          mobile_money_merchant_number: settings.payments.mobile_money_merchant_number,
          premium_listing_price: settings.payments.premium_listing_price
        },
        notification_settings: {
          email_notifications_enabled: settings.notifications.email_notifications,
          sms_notifications_enabled: settings.notifications.sms_notifications,
          push_notifications_enabled: settings.notifications.push_notifications,
          admin_alerts_enabled: settings.notifications.admin_alerts
        },
        currency_rates: {
          usd_to_ghs: settings.currency_rates.usd_to_ghs,
          gbp_to_ghs: settings.currency_rates.gbp_to_ghs,
          eur_to_ghs: settings.currency_rates.eur_to_ghs
        }
      }

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(apiData)
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

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-ghana-green" />
            Payment Settings
          </CardTitle>
          <CardDescription>
            Configure mobile money integration and listing prices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="merchant-number" className="flex items-center">
                <Smartphone className="w-4 h-4 mr-2" />
                Mobile Money Merchant Number
              </Label>
              <Input
                id="merchant-number"
                value={settings.payments.mobile_money_merchant_number}
                onChange={(e) => handleSettingChange('payments.mobile_money_merchant_number', e.target.value)}
                placeholder="Enter merchant number (e.g., 0241234567)"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                This is the number agents will send payments to for premium listings
              </p>
            </div>
            <div>
              <Label htmlFor="premium-price">Premium Listing Price (GHS)</Label>
              <Input
                id="premium-price"
                type="number"
                min="0"
                step="0.01"
                value={settings.payments.premium_listing_price}
                onChange={(e) => handleSettingChange('payments.premium_listing_price', parseFloat(e.target.value))}
                placeholder="50.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                This is the price agents pay for premium property listings
              </p>
            </div>
          </div>
          {!settings.payments.mobile_money_merchant_number && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Mobile Money Not Configured</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Add a merchant number to enable mobile money payments for premium listings.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Currency Exchange Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-ghana-green" />
            Currency Exchange Rates
          </CardTitle>
          <CardDescription>
            Set manual exchange rates for USD, GBP, and EUR to GHS conversion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="usd-rate" className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                USD to GHS Rate
              </Label>
              <Input
                id="usd-rate"
                type="number"
                min="0"
                step="0.01"
                value={settings.currency_rates.usd_to_ghs}
                onChange={(e) => handleSettingChange('currency_rates.usd_to_ghs', parseFloat(e.target.value))}
                placeholder="16.13"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                1 USD = {settings.currency_rates.usd_to_ghs} GHS
              </p>
            </div>
            <div>
              <Label htmlFor="gbp-rate" className="flex items-center">
                <PoundSterling className="w-4 h-4 mr-2 text-blue-600" />
                GBP to GHS Rate
              </Label>
              <Input
                id="gbp-rate"
                type="number"
                min="0"
                step="0.01"
                value={settings.currency_rates.gbp_to_ghs}
                onChange={(e) => handleSettingChange('currency_rates.gbp_to_ghs', parseFloat(e.target.value))}
                placeholder="20.50"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                1 GBP = {settings.currency_rates.gbp_to_ghs} GHS
              </p>
            </div>
            <div>
              <Label htmlFor="eur-rate" className="flex items-center">
                <Euro className="w-4 h-4 mr-2 text-purple-600" />
                EUR to GHS Rate
              </Label>
              <Input
                id="eur-rate"
                type="number"
                min="0"
                step="0.01"
                value={settings.currency_rates.eur_to_ghs}
                onChange={(e) => handleSettingChange('currency_rates.eur_to_ghs', parseFloat(e.target.value))}
                placeholder="17.25"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                1 EUR = {settings.currency_rates.eur_to_ghs} GHS
              </p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">Exchange Rate Information</h4>
                <p className="text-sm text-blue-700 mt-1">
                  These rates are used to convert property prices from GHS to USD, GBP, and EUR for diaspora buyers. 
                  Update these rates regularly to reflect current market conditions.
                </p>
              </div>
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
