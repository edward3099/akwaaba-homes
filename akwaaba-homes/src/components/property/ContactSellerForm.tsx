'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Send, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { Property } from '@/lib/types/index';

interface ContactSellerFormProps {
  property: Property;
  onClose: () => void;
}

export function ContactSellerForm({ property, onClose }: ContactSellerFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    inquiryType: 'general',
    preferredContact: 'email'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'viewing', label: 'Schedule Viewing' },
    { value: 'financing', label: 'Financing Options' },
    { value: 'negotiation', label: 'Price Negotiation' },
    { value: 'inspection', label: 'Property Inspection' },
  ];

  const contactMethods = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone Call' },
    { value: 'whatsapp', label: 'WhatsApp' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Contact form submitted:', {
      property: property.id,
      seller: property.seller.id,
      ...formData
    });

    setIsSubmitting(false);
    onClose();
    
    // Show success message (in production, use a toast notification)
    alert('Message sent successfully! The seller will contact you soon.');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl">Contact Seller</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          {/* Property Info */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-1">{property.title}</h3>
            <p className="text-sm text-muted-foreground">{property.location.address}</p>
            <p className="text-sm text-muted-foreground">Property ID: {property.id}</p>
          </div>

          {/* Seller Info */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-2 block">Contacting</Label>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">{property.seller.name}</div>
                <div className="text-sm text-muted-foreground">{property.seller.company}</div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Your Information */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Your Information</Label>
              
              <div>
                <Label htmlFor="name" className="text-sm">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+233 XX XXX XXXX"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
            </div>

            {/* Inquiry Type */}
            <div>
              <Label className="text-sm">Inquiry Type</Label>
              <Select value={formData.inquiryType} onValueChange={(value) => handleInputChange('inquiryType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {inquiryTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preferred Contact Method */}
            <div>
              <Label className="text-sm">Preferred Contact Method</Label>
              <Select value={formData.preferredContact} onValueChange={(value) => handleInputChange('preferredContact', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contactMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="message" className="text-sm">Message *</Label>
              <Textarea
                id="message"
                placeholder="I'm interested in this property. Please provide more information about..."
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Be specific about your interests, budget, and timeline
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 btn-ghana flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Quick Actions */}
          <div className="mt-6 pt-4 border-t">
            <Label className="text-sm font-medium mb-3 block">Quick Actions</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = `tel:${property.seller.phone}`}
                className="flex-1 flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const message = `Hi, I'm interested in your property: ${property.title} (ID: ${property.id})`;
                  const whatsappUrl = `https://wa.me/${property.seller.whatsapp}?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, '_blank');
                }}
                className="flex-1 flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = `mailto:${property.seller.email}?subject=Inquiry about ${property.title}&body=Hi, I'm interested in your property listing.`}
                className="flex-1 flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
