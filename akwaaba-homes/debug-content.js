#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000';

async function debugContent() {
  console.log('=== DEBUGGING HTML CONTENT ===\n');
  
  try {
    // Get admin page content
    console.log('--- ADMIN PAGE CONTENT ---');
    const adminResponse = await fetch(`${BASE_URL}/admin-signin`);
    const adminContent = await adminResponse.text();
    
    // Check for specific patterns
    console.log('Admin Portal:', adminContent.includes('Admin Portal'));
    console.log('Administrator Sign In:', adminContent.includes('Administrator Sign In'));
    console.log('from-slate-900:', adminContent.includes('from-slate-900'));
    console.log('Building2:', adminContent.includes('Building2'));
    console.log('Shield:', adminContent.includes('Shield'));
    console.log('from-blue-600:', adminContent.includes('from-blue-600'));
    console.log('Administrative access only:', adminContent.includes('Administrative access only'));
    
    // Show actual text around these patterns
    const adminIndex = adminContent.indexOf('Admin Portal');
    if (adminIndex !== -1) {
      console.log('\nAdmin Portal context:', adminContent.substring(adminIndex - 20, adminIndex + 30));
    }
    
    const slateIndex = adminContent.indexOf('from-slate-900');
    if (slateIndex !== -1) {
      console.log('\nfrom-slate-900 context:', adminContent.substring(slateIndex - 20, slateIndex + 30));
    }
    
    console.log('\n--- AGENT PAGE CONTENT ---');
    const agentResponse = await fetch(`${BASE_URL}/login`);
    const agentContent = await agentResponse.text();
    
    // Check for specific patterns
    console.log('Akwaaba!:', agentContent.includes('Akwaaba!'));
    console.log('Agent Sign In:', agentContent.includes('Agent Sign In'));
    console.log('from-green-500:', agentContent.includes('from-green-500'));
    console.log('Home:', agentContent.includes('Home'));
    console.log('Heart:', agentContent.includes('Heart'));
    console.log('Users:', agentContent.includes('Users'));
    console.log('Building dreams:', agentContent.includes('Building dreams, one home at a time'));
    
    // Show actual text around these patterns
    const akwaabaIndex = agentContent.indexOf('Akwaaba!');
    if (akwaabaIndex !== -1) {
      console.log('\nAkwaaba! context:', agentContent.substring(akwaabaIndex - 20, akwaabaIndex + 30));
    }
    
    const greenIndex = agentContent.indexOf('from-green-500');
    if (greenIndex !== -1) {
      console.log('\nfrom-green-500 context:', agentContent.substring(greenIndex - 20, greenIndex + 30));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugContent();
