export const mockDashboardData = {
  admin: {
    stats: [
      { name: 'Total Properties', value: '1,234', change: '+12%', changeType: 'positive' },
      { name: 'Active Agents', value: '89', change: '+5%', changeType: 'positive' },
      { name: 'Premium Listings', value: '456', change: '+23%', changeType: 'positive' },
      { name: 'Monthly Revenue', value: '₵45,678', change: '+18%', changeType: 'positive' },
    ],
    recentActivity: [
      { id: 1, action: 'New property listed by Kwame Asante', time: '2 hours ago', type: 'property' },
      { id: 2, action: 'Agent Ama Osei verified', time: '4 hours ago', type: 'verification' },
      { id: 3, action: 'Premium payment received from Kofi Mensah', time: '6 hours ago', type: 'payment' },
      { id: 4, action: 'New user registration: Efua Addo', time: '8 hours ago', type: 'registration' },
      { id: 5, action: 'Property verification completed: East Legon House', time: '10 hours ago', type: 'verification' },
    ],
    chartData: [
      { month: 'Jan', properties: 65, revenue: 12000 },
      { month: 'Feb', properties: 78, revenue: 15000 },
      { month: 'Mar', properties: 92, revenue: 18000 },
      { month: 'Apr', properties: 85, revenue: 16000 },
      { month: 'May', properties: 103, revenue: 22000 },
      { month: 'Jun', properties: 118, revenue: 25000 },
    ]
  },
  
  seller: {
    stats: [
      { name: 'Active Listings', value: '12', change: '+2', changeType: 'positive' },
      { name: 'Total Views', value: '1,234', change: '+15%', changeType: 'positive' },
      { name: 'Lead Inquiries', value: '23', change: '+8', changeType: 'positive' },
      { name: 'Premium Listings', value: '5', change: '+1', changeType: 'positive' },
    ],
    recentLeads: [
      { id: 1, name: 'John Doe', property: 'East Legon House', method: 'WhatsApp', time: '1 hour ago', status: 'new' },
      { id: 2, name: 'Jane Smith', property: 'West Legon Apartment', method: 'Phone', time: '3 hours ago', status: 'contacted' },
      { id: 3, name: 'Mike Johnson', property: 'Tema Commercial Space', method: 'Email', time: '5 hours ago', status: 'new' },
      { id: 4, name: 'Sarah Wilson', property: 'East Legon House', method: 'WhatsApp', time: '1 day ago', status: 'interested' },
      { id: 5, name: 'David Brown', property: 'West Legon Apartment', method: 'Phone', time: '2 days ago', status: 'viewing' },
    ],
    chartData: [
      { day: 'Mon', views: 45, leads: 3 },
      { day: 'Tue', views: 52, leads: 4 },
      { day: 'Wed', views: 38, leads: 2 },
      { day: 'Thu', views: 67, leads: 6 },
      { day: 'Fri', views: 58, leads: 5 },
      { day: 'Sat', views: 72, leads: 7 },
      { day: 'Sun', views: 41, leads: 3 },
    ],
    properties: [
      { id: 1, title: 'East Legon House', status: 'active', views: 234, leads: 8, tier: 'premium' },
      { id: 2, title: 'West Legon Apartment', status: 'active', views: 156, leads: 5, tier: 'normal' },
      { id: 3, title: 'Tema Commercial Space', status: 'active', views: 89, leads: 3, tier: 'premium' },
      { id: 4, title: 'Accra Central Office', status: 'pending', views: 0, leads: 0, tier: 'normal' },
    ]
  }
};
