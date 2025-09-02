#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000';

async function debugContent() {
  try {
    console.log('=== ADMIN PAGE ===');
    const adminResponse = await fetch(`${BASE_URL}/admin-signin`);
    const adminContent = await adminResponse.text();
    
    console.log('lucide-building2:', adminContent.includes('lucide-building2'));
    console.log('lucide-shield:', adminContent.includes('lucide-shield'));
    console.log('from-slate-900:', adminContent.includes('from-slate-900'));
    console.log('from-blue-600:', adminContent.includes('from-blue-600'));
    
    console.log('\n=== AGENT PAGE ===');
    const agentResponse = await fetch(`${BASE_URL}/login`);
    const agentContent = await agentResponse.text();
    
    console.log('lucide-house:', agentContent.includes('lucide-house'));
    console.log('lucide-heart:', agentContent.includes('lucide-heart'));
    console.log('lucide-users:', agentContent.includes('lucide-users'));
    console.log('from-green-500:', agentContent.includes('from-green-500'));
    console.log('from-green-50:', agentContent.includes('from-green-50'));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugContent();
