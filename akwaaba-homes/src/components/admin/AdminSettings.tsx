'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Save,
  RefreshCw,
  Settings,
  Mail,
  Bell,
  Shield,
  Globe,
  Database,
  Palette,
  Smartphone
} from 'lucide-react';

interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportPhone: string;
  commissionRate: number;
  maxImagesPerProperty: number;
  enableUserRegistration: boolean;
  enableAgentApplications: boolean;
  requireEmailVerification: boolean;
  enableTwoFactorAuth: boolean;
  maintenanceMode: boolean;
  debugMode: boolean;
}

interface EmailTemplates {
  welcomeEmail: {
    subject: string;
    body: string;
  };
  propertyApproved: {
    subject: string;
    body: string;
  };
  propertyRejected: {
    subject: string;
    body: string;
  };
  agentApproved: {
    subject: string;
    body: string;
  };
  agentRejected: {
    subject: string;
    body: string;
  };
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  whatsappNotifications: boolean;
  notifyOnNewUser: boolean;
  notifyOnNewProperty: boolean;
  notifyOnAgentApplication: boolean;
  notifyOnSystemIssues: boolean;
}

const defaultPlatformSettings: PlatformSettings = {
  siteName: 'AkwaabaHomes',
  siteDescription: 'Your trusted real estate marketplace in Ghana',
  contactEmail: 'admin@akwaabahomes.com',
  supportPhone: '+233 20 123 4567',
  commissionRate: 5.0,
  maxImagesPerProperty: 10,
  enableUserRegistration: true,
  enableAgentApplications: true,
  requireEmailVerification: true,
  enableTwoFactorAuth: false,
  maintenanceMode: false,
  debugMode: false,
};

const defaultEmailTemplates: EmailTemplates = {
  welcomeEmail: {
    subject: 'Welcome to AkwaabaHomes! 🏠',
    body: 'Dear {{user_name}},\n\nWelcome to AkwaabaHomes! We\'re excited to have you join our community of real estate professionals and home seekers.\n\nBest regards,\nThe AkwaabaHomes Team',
  },
  propertyApproved: {
    subject: 'Your Property Has Been Approved! ✅',
    body: 'Dear {{agent_name}},\n\nGreat news! Your property listing "{{property_title}}" has been approved and is now live on our platform.\n\nBest regards,\nThe AkwaabaHomes Team',
  },
  propertyRejected: {
    subject: 'Property Listing Update',
    body: 'Dear {{agent_name}},\n\nWe regret to inform you that your property listing "{{property_title}}" requires some modifications before it can be approved.\n\nPlease review our guidelines and resubmit.\n\nBest regards,\nThe AkwaabaHomes Team',
  },
  agentApproved: {
    subject: 'Agent Application Approved! 🎉',
    body: 'Dear {{agent_name}},\n\nCongratulations! Your agent application has been approved. You can now start listing properties on our platform.\n\nBest regards,\nThe AkwaabaHomes Team',
  },
  agentRejected: {
    subject: 'Agent Application Update',
    body: 'Dear {{applicant_name}},\n\nThank you for your interest in becoming an agent on AkwaabaHomes. Unfortunately, we are unable to approve your application at this time.\n\nBest regards,\nThe AkwaabaHomes Team',
  },
};

const defaultNotificationSettings: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  whatsappNotifications: true,
  notifyOnNewUser: true,
  notifyOnNewProperty: true,
  notifyOnAgentApplication: true,
  notifyOnSystemIssues: true,
};

export default function AdminSettings() {
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(defaultPlatformSettings);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplates>(defaultEmailTemplates);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      const settings = await response.json();
      setPlatformSettings(settings.platform);
      setEmailTemplates(settings.emailTemplates);
      setNotificationSettings(settings.notifications);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformSettingChange = (key: keyof PlatformSettings, value: any) => {
    setPlatformSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleEmailTemplateChange = (template: keyof EmailTemplates, field: 'subject' | 'body', value: string) => {
    setEmailTemplates(prev => ({
      ...prev,
      [template]: { ...prev[template], [field]: value }
    }));
    setHasChanges(true);
  };

  const handleNotificationSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: platformSettings,
          emailTemplates,
          notifications: notificationSettings,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      toast({
        title: "Success",
        description: "Settings saved successfully!",
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    setPlatformSettings(defaultPlatformSettings);
    setEmailTemplates(defaultEmailTemplates);
    setNotificationSettings(defaultNotificationSettings);
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600">Configure platform behavior and appearance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={saveSettings} disabled={!hasChanges || loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="platform" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="platform" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Platform</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="space-y-6">
          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Configure your platform's basic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={platformSettings.siteName}
                    onChange={(e) => handlePlatformSettingChange('siteName', e.target.value)}
                    placeholder="Enter site name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={platformSettings.contactEmail}
                    onChange={(e) => handlePlatformSettingChange('contactEmail', e.target.value)}
                    placeholder="admin@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={platformSettings.siteDescription}
                  onChange={(e) => handlePlatformSettingChange('siteDescription', e.target.value)}
                  placeholder="Enter site description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supportPhone">Support Phone</Label>
                  <Input
                    id="supportPhone"
                    value={platformSettings.supportPhone}
                    onChange={(e) => handlePlatformSettingChange('supportPhone', e.target.value)}
                    placeholder="+233 20 123 4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={platformSettings.commissionRate}
                    onChange={(e) => handlePlatformSettingChange('commissionRate', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Toggles */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Configuration</CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>User Registration</Label>
                    <p className="text-sm text-muted-foreground">Allow new users to register</p>
                  </div>
                  <Switch
                    checked={platformSettings.enableUserRegistration}
                    onCheckedChange={(checked) => handlePlatformSettingChange('enableUserRegistration', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Agent Applications</Label>
                    <p className="text-sm text-muted-foreground">Allow users to apply as agents</p>
                  </div>
                  <Switch
                    checked={platformSettings.enableAgentApplications}
                    onCheckedChange={(checked) => handlePlatformSettingChange('enableAgentApplications', checked)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Verification</Label>
                    <p className="text-sm text-muted-foreground">Require email verification for new users</p>
                  </div>
                  <Switch
                    checked={platformSettings.requireEmailVerification}
                    onCheckedChange={(checked) => handlePlatformSettingChange('requireEmailVerification', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Enable 2FA for enhanced security</p>
                  </div>
                  <Switch
                    checked={platformSettings.enableTwoFactorAuth}
                    onCheckedChange={(checked) => handlePlatformSettingChange('enableTwoFactorAuth', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Advanced system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxImagesPerProperty">Max Images per Property</Label>
                  <Input
                    id="maxImagesPerProperty"
                    type="number"
                    min="1"
                    max="20"
                    value={platformSettings.maxImagesPerProperty}
                    onChange={(e) => handlePlatformSettingChange('maxImagesPerProperty', parseInt(e.target.value))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Put platform in maintenance mode</p>
                  </div>
                  <Switch
                    checked={platformSettings.maintenanceMode}
                    onCheckedChange={(checked) => handlePlatformSettingChange('maintenanceMode', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          {/* Email Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Customize automated email messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(emailTemplates).map(([key, template]) => (
                <div key={key} className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${key}-subject`}>Subject</Label>
                      <Input
                        id={`${key}-subject`}
                        value={template.subject}
                        onChange={(e) => handleEmailTemplateChange(key as keyof EmailTemplates, 'subject', e.target.value)}
                        placeholder="Email subject"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${key}-body`}>Body</Label>
                      <Textarea
                        id={`${key}-body`}
                        value={template.body}
                        onChange={(e) => handleEmailTemplateChange(key as keyof EmailTemplates, 'body', e.target.value)}
                        placeholder="Email body content"
                        rows={6}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          {/* Notification Channels */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>Configure how notifications are delivered</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => handleNotificationSettingChange('emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send push notifications to users</p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => handleNotificationSettingChange('pushNotifications', checked)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => handleNotificationSettingChange('smsNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>WhatsApp Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via WhatsApp</p>
                  </div>
                  <Switch
                    checked={notificationSettings.whatsappNotifications}
                    onCheckedChange={(checked) => handleNotificationSettingChange('whatsappNotifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Types */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Types</CardTitle>
              <CardDescription>Choose which events trigger notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New User Registration</Label>
                    <p className="text-sm text-muted-foreground">Notify when new users join</p>
                  </div>
                  <Switch
                    checked={notificationSettings.notifyOnNewUser}
                    onCheckedChange={(checked) => handleNotificationSettingChange('notifyOnNewUser', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Property Listing</Label>
                    <p className="text-sm text-muted-foreground">Notify when properties are listed</p>
                  </div>
                  <Switch
                    checked={notificationSettings.notifyOnNewProperty}
                    onCheckedChange={(checked) => handleNotificationSettingChange('notifyOnNewProperty', checked)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Agent Applications</Label>
                    <p className="text-sm text-muted-foreground">Notify when agents apply</p>
                  </div>
                  <Switch
                    checked={notificationSettings.notifyOnAgentApplication}
                    onCheckedChange={(checked) => handleNotificationSettingChange('notifyOnAgentApplication', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Issues</Label>
                    <p className="text-sm text-muted-foreground">Notify about system problems</p>
                  </div>
                  <Switch
                    checked={notificationSettings.notifyOnSystemIssues}
                    onCheckedChange={(checked) => handleNotificationSettingChange('notifyOnSystemIssues', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
              <CardDescription>Configure security and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                </div>
                <Switch
                  checked={platformSettings.enableTwoFactorAuth}
                  onCheckedChange={(checked) => handlePlatformSettingChange('enableTwoFactorAuth', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Verification</Label>
                  <p className="text-sm text-muted-foreground">Require email verification for all users</p>
                </div>
                <Switch
                  checked={platformSettings.requireEmailVerification}
                  onCheckedChange={(checked) => handlePlatformSettingChange('requireEmailVerification', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Debug Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable debug logging (development only)</p>
                </div>
                <Switch
                  checked={platformSettings.debugMode}
                  onCheckedChange={(checked) => handlePlatformSettingChange('debugMode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
