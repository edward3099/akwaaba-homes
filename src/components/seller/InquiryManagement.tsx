'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare,
  Phone,
  Mail,
  Clock,
  Search,
  Filter,
  MoreHorizontal,
  Send,
  Archive,
  Star,
  Calendar,
  User,
  MapPin,
  Reply,
  CheckCircle2
} from 'lucide-react';
import { InspectionRequest } from '@/lib/types';

interface InquiryManagementProps {
  agentId: string;
}

// Mock inquiries data
interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  inquirerName: string;
  inquirerEmail: string;
  inquirerPhone: string;
  inquiryType: 'general' | 'viewing' | 'financing' | 'negotiation' | 'inspection';
  message: string;
  status: 'new' | 'responded' | 'in-progress' | 'closed';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  lastResponse?: string;
  preferredContact: 'email' | 'phone' | 'whatsapp';
  source: 'website' | 'whatsapp' | 'phone' | 'referral';
}

const mockInquiries: Inquiry[] = [
  {
    id: 'inq_001',
    propertyId: '1',
    propertyTitle: 'Luxury 4-Bedroom Villa in East Legon',
    inquirerName: 'Ama Osei',
    inquirerEmail: 'ama.osei@email.com',
    inquirerPhone: '+233244987654',
    inquiryType: 'viewing',
    message: 'Hello, I\'m interested in viewing this property. I\'m currently in London but will be visiting Ghana next month. Can we arrange a virtual tour first and then an in-person viewing?',
    status: 'new',
    priority: 'high',
    createdAt: '2024-01-20T10:30:00Z',
    preferredContact: 'whatsapp',
    source: 'website'
  },
  {
    id: 'inq_002',
    propertyId: '1',
    propertyTitle: 'Luxury 4-Bedroom Villa in East Legon',
    inquirerName: 'Kwaku Mensah',
    inquirerEmail: 'kwaku.mensah@gmail.com',
    inquirerPhone: '+233201234567',
    inquiryType: 'financing',
    message: 'I\'m interested in this property. Do you have information about mortgage options? I work with Ecobank and would like to know if you have partnerships with any banks.',
    status: 'responded',
    priority: 'medium',
    createdAt: '2024-01-19T14:15:00Z',
    lastResponse: '2024-01-19T16:30:00Z',
    preferredContact: 'email',
    source: 'whatsapp'
  },
  {
    id: 'inq_003',
    propertyId: '2',
    propertyTitle: 'Modern 3-Bedroom Apartment in Airport',
    inquirerName: 'Sarah Johnson',
    inquirerEmail: 'sarah.j@outlook.com',
    inquirerPhone: '+44771234567',
    inquiryType: 'inspection',
    message: 'Hi, I\'m a Ghanaian living in the UK. I\'d like to schedule an inspection through my brother who lives in Accra. Can you coordinate with him? His number is +233244555666.',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2024-01-18T09:20:00Z',
    lastResponse: '2024-01-18T11:45:00Z',
    preferredContact: 'email',
    source: 'website'
  },
  {
    id: 'inq_004',
    propertyId: '3',
    propertyTitle: '2-Bedroom House in Kumasi',
    inquirerName: 'Michael Asante',
    inquirerEmail: 'michael.asante@company.com',
    inquirerPhone: '+233267890123',
    inquiryType: 'negotiation',
    message: 'I\'m interested in this property but the price seems a bit high for the area. Would you consider ₵250,000? I can pay cash and close quickly.',
    status: 'responded',
    priority: 'medium',
    createdAt: '2024-01-17T16:00:00Z',
    lastResponse: '2024-01-17T18:15:00Z',
    preferredContact: 'phone',
    source: 'referral'
  }
];

export function InquiryManagement({ agentId }: InquiryManagementProps) {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'responded' | 'in-progress' | 'closed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyMessage, setReplyMessage] = useState('');

  // Filter inquiries
  const filteredInquiries = mockInquiries.filter(inquiry => {
    const matchesSearch = inquiry.inquirerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inquiry.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inquiry.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || inquiry.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || inquiry.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: Inquiry['status']) => {
    const statusConfig = {
      new: { label: 'New', className: 'bg-blue-600' },
      responded: { label: 'Responded', className: 'bg-green-600' },
      'in-progress': { label: 'In Progress', className: 'bg-amber-600' },
      closed: { label: 'Closed', className: 'bg-gray-600' }
    };
    
    const config = statusConfig[status];
    return <Badge className={`${config.className} text-white`}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: Inquiry['priority']) => {
    const priorityConfig = {
      high: { label: 'High', className: 'border-red-500 text-red-700' },
      medium: { label: 'Medium', className: 'border-amber-500 text-amber-700' },
      low: { label: 'Low', className: 'border-green-500 text-green-700' }
    };
    
    const config = priorityConfig[priority];
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const getInquiryTypeLabel = (type: Inquiry['inquiryType']) => {
    const typeLabels = {
      general: 'General Inquiry',
      viewing: 'Schedule Viewing',
      financing: 'Financing Options',
      negotiation: 'Price Negotiation',
      inspection: 'Property Inspection'
    };
    return typeLabels[type];
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleReply = (inquiry: Inquiry) => {
    // In production, this would send the reply
    console.log('Replying to inquiry:', inquiry.id, 'Message:', replyMessage);
    setReplyMessage('');
    setSelectedInquiry(null);
  };

  const handleQuickAction = (inquiry: Inquiry, action: 'whatsapp' | 'call' | 'email') => {
    switch (action) {
      case 'whatsapp':
        const whatsappMessage = `Hi ${inquiry.inquirerName}, thank you for your inquiry about "${inquiry.propertyTitle}". I'd be happy to help you with this property.`;
        const whatsappUrl = `https://wa.me/${inquiry.inquirerPhone.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');
        break;
      case 'call':
        window.location.href = `tel:${inquiry.inquirerPhone}`;
        break;
      case 'email':
        window.location.href = `mailto:${inquiry.inquirerEmail}?subject=Re: ${inquiry.propertyTitle}&body=Hi ${inquiry.inquirerName},%0A%0AThank you for your inquiry about "${inquiry.propertyTitle}".`;
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Inquiries</h2>
        <p className="text-muted-foreground">
          Manage and respond to property inquiries from potential buyers
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search inquiries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={(value: any) => setFilterPriority(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inquiries List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInquiries.map((inquiry) => (
          <Card key={inquiry.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(inquiry.status)}
                    {getPriorityBadge(inquiry.priority)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{inquiry.inquirerName}</h3>
                    <p className="text-sm text-muted-foreground">{getInquiryTypeLabel(inquiry.inquiryType)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Property Info */}
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{inquiry.propertyTitle}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{inquiry.inquirerEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{inquiry.inquirerPhone}</span>
                </div>
              </div>

              {/* Message Preview */}
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {inquiry.message}
                </p>
              </div>

              {/* Timestamp and Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{getTimeSince(inquiry.createdAt)}</span>
                  {inquiry.lastResponse && (
                    <>
                      <span>•</span>
                      <span>Responded {getTimeSince(inquiry.lastResponse)}</span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleQuickAction(inquiry, 'whatsapp')}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleQuickAction(inquiry, 'call')}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedInquiry(inquiry)}
                  >
                    <Reply className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredInquiries.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Inquiries Found</h3>
            <p className="text-muted-foreground">
              {searchQuery || filterStatus !== 'all' || filterPriority !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'No inquiries yet. They\'ll appear here when potential buyers contact you.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reply Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Reply className="w-5 h-5" />
                Reply to {selectedInquiry.inquirerName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Original Message */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-sm font-medium mb-2">Original Message:</div>
                <p className="text-sm text-muted-foreground">{selectedInquiry.message}</p>
              </div>

              {/* Reply Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Reply</label>
                  <Textarea
                    placeholder="Type your response here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setSelectedInquiry(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleReply(selectedInquiry)}
                    disabled={!replyMessage.trim()}
                    className="flex-1 btn-ghana flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Reply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
