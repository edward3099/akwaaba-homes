'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Users, 
  Globe,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Property } from '@/lib/types/index';
import { format } from 'date-fns';

interface InspectionSchedulerProps {
  property: Property;
  onClose: () => void;
}

export function InspectionScheduler({ property, onClose }: InspectionSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState({
    inspectorType: 'self',
    inspectorName: '',
    inspectorPhone: '',
    inspectorEmail: '',
    preferredTime: '',
    specialRequests: '',
    requesterName: '',
    requesterEmail: '',
    requesterPhone: '',
    relationship: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inspectorTypes = [
    { value: 'self', label: 'I will inspect myself', description: 'You will visit the property personally' },
    { value: 'family', label: 'Family member', description: 'A family member in Ghana will inspect' },
    { value: 'representative', label: 'Trusted representative', description: 'Someone you trust will inspect on your behalf' },
  ];

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const relationships = [
    'Spouse', 'Child', 'Parent', 'Sibling', 'Friend', 'Colleague', 'Professional Agent', 'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('Inspection scheduled:', {
      property: property.id,
      date: selectedDate,
      ...formData
    });

    setIsSubmitting(false);
    onClose();
    
    // Show success message
    alert('Inspection request submitted successfully! The seller will confirm the appointment.');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isDiasporaInspection = formData.inspectorType !== 'self';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
          <div>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              Schedule Property Inspection
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Arrange a viewing for this property
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          {/* Property Info */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-1">{property.title}</h3>
            <p className="text-sm text-muted-foreground">{property.location.address}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Inspector Type */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Who will inspect the property?</Label>
              <div className="space-y-3">
                {inspectorTypes.map((type) => (
                  <div key={type.value}>
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="inspectorType"
                        value={type.value}
                        checked={formData.inspectorType === type.value}
                        onChange={(e) => handleInputChange('inspectorType', e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date & Time Selection */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Preferred Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Preferred Time</Label>
                <Select value={formData.preferredTime} onValueChange={(value) => handleInputChange('preferredTime', value)}>
                  <SelectTrigger>
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Your Information (Requester) */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Your Information (Request Submitter)</Label>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="requesterName" className="text-sm">Your Name *</Label>
                  <Input
                    id="requesterName"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.requesterName}
                    onChange={(e) => handleInputChange('requesterName', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="requesterEmail" className="text-sm">Your Email *</Label>
                  <Input
                    id="requesterEmail"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.requesterEmail}
                    onChange={(e) => handleInputChange('requesterEmail', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="requesterPhone" className="text-sm">Your Phone Number *</Label>
                <Input
                  id="requesterPhone"
                  type="tel"
                  placeholder="+233 XX XXX XXXX"
                  value={formData.requesterPhone}
                  onChange={(e) => handleInputChange('requesterPhone', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Inspector Information (if different from requester) */}
            {isDiasporaInspection && (
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-5 h-5 text-primary" />
                  <Label className="text-sm font-medium">Inspector Information (Person who will visit)</Label>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Diaspora Inspection Service</p>
                      <p>Since you&apos;re arranging inspection through someone else, please provide their contact information so the seller can coordinate directly with them.</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="inspectorName" className="text-sm">Inspector&apos;s Name *</Label>
                    <Input
                      id="inspectorName"
                      type="text"
                      placeholder="Name of person who will inspect"
                      value={formData.inspectorName}
                      onChange={(e) => handleInputChange('inspectorName', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="inspectorPhone" className="text-sm">Inspector&apos;s Phone *</Label>
                    <Input
                      id="inspectorPhone"
                      type="tel"
                      placeholder="+233 XX XXX XXXX"
                      value={formData.inspectorPhone}
                      onChange={(e) => handleInputChange('inspectorPhone', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="inspectorEmail" className="text-sm">Inspector&apos;s Email</Label>
                    <Input
                      id="inspectorEmail"
                      type="email"
                      placeholder="inspector@example.com"
                      value={formData.inspectorEmail}
                      onChange={(e) => handleInputChange('inspectorEmail', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Relationship to You</Label>
                    <Select value={formData.relationship} onValueChange={(value) => handleInputChange('relationship', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationships.map((rel) => (
                          <SelectItem key={rel} value={rel}>
                            {rel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Special Requests */}
            <div>
              <Label htmlFor="specialRequests" className="text-sm">Special Requests or Notes</Label>
              <Textarea
                id="specialRequests"
                placeholder="Any specific areas to focus on, questions to ask, or special arrangements needed..."
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                rows={3}
              />
            </div>

            {/* Important Notes */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-2">Important Notes:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>The seller will confirm availability for your requested date and time</li>
                    <li>You will receive confirmation via email and SMS</li>
                    <li>Please arrive on time or notify if you need to reschedule</li>
                    {isDiasporaInspection && (
                      <li>Ensure your inspector has valid ID for property access</li>
                    )}
                  </ul>
                </div>
              </div>
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
                disabled={isSubmitting || !selectedDate}
                className="flex-1 btn-ghana flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Schedule Inspection
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
