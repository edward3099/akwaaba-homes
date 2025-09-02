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
    console.log('lucide-building2:', adminContent.includes('lucide-building2'));
    console.log('lucide-shield:', adminContent.includes('lucide-shield'));
    console.log('from-blue-600:', adminContent.includes('from-blue-600'));
    console.log('Administrative access only:', adminContent.includes('Administrative access only'));
    
    // Check for CSS classes
    console.log('\nCSS Classes:');
    console.log('bg-gradient-to-br from-slate-900:', adminContent.includes('bg-gradient-to-br from-slate-900'));
    console.log('from-blue-600 to-indigo-600:', adminContent.includes('from-blue-600 to-indigo-600'));
    
    // Show actual text around these patterns
    const adminIndex = adminContent.indexOf('Admin Portal');
    if (adminIndex !== -1) {
      console.log('\nAdmin Portal context:', adminContent.substring(adminIndex - 20, adminIndex + 30));
    }
    
    const slateIndex = adminContent.indexOf('from-slate-900');
    if (slateIndex !== -1) {
      console.log('\nfrom-slate-900 context:', adminContent.substring(slateIndex - 20, slateIndex + 30));
    }
    
    const blueIndex = adminContent.indexOf('from-blue-600');
    if (blueIndex !== -1) {
      console.log('\nfrom-blue-600 context:', adminContent.substring(blueIndex - 20, blueIndex + 30));
    }
    
    const building2Index = adminContent.indexOf('lucide-building2');
    if (building2Index !== -1) {
      console.log('\nlucide-building2 context:', adminContent.substring(building2Index - 20, building2Index + 30));
    }
    
    const shieldIndex = adminContent.indexOf('lucide-shield');
    if (shieldIndex !== -1) {
      console.log('\nlucide-shield context:', adminContent.substring(shieldIndex - 20, shieldIndex + 30));
    }
    
    console.log('\n--- AGENT PAGE CONTENT ---');
    const agentResponse = await fetch(`${BASE_URL}/login`);
    const agentContent = await agentResponse.text();
    
    // Check for specific patterns
    console.log('Akwaaba!:', agentContent.includes('Akwaaba!'));
    console.log('Agent Sign In:', agentContent.includes('Agent Sign In'));
    console.log('from-green-500:', agentContent.includes('from-green-500'));
    console.log('lucide-house:', agentContent.includes('lucide-house'));
    console.log('lucide-heart:', agentContent.includes('lucide-heart'));
    console.log('lucide-users:', agentContent.includes('lucide-users'));
    console.log('Building dreams:', agentContent.includes('Building dreams, one home at a time'));
    
    // Check for CSS classes
    console.log('\nCSS Classes:');
    console.log('bg-gradient-to-br from-green-50:', agentContent.includes('bg-gradient-to-br from-green-50'));
    console.log('from-green-500 to-emerald-600:', agentContent.includes('from-green-500 to-emerald-600'));
    
    // Show actual text around these patterns
    const akwaabaIndex = agentContent.indexOf('Akwaaba!');
    if (akwaabaIndex !== -1) {
      console.log('\nAkwaaba! context:', agentContent.substring(akwaabaIndex - 20, akwaabaIndex + 30));
    }
    
    const greenIndex = agentContent.indexOf('from-green-500');
    if (greenIndex !== -1) {
      console.log('\nfrom-green-500 context:', agentContent.substring(greenIndex - 20, greenIndex + 30));
    }
    
    const green50Index = agentContent.indexOf('from-green-50');
    if (green50Index !== -1) {
      console.log('\nfrom-green-50 context:', agentContent.substring(green50Index - 20, green50Index + 30));
    }
    
    const houseIndex = agentContent.indexOf('lucide-house');
    if (houseIndex !== -1) {
      console.log('\nlucide-house context:', agentContent.substring(houseIndex - 20, houseIndex + 30));
    }
    
    const heartIndex = agentContent.indexOf('lucide-heart');
    if (heartIndex !== -1) {
      console.log('\nlucide-heart context:', agentContent.substring(heartIndex - 20, heartIndex + 30));
    }
    
    const usersIndex = agentContent.indexOf('lucide-users');
    if (usersIndex !== -1) {
      console.log('\nlucide-users context:', agentContent.substring(usersIndex - 20, usersIndex + 30));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugContent();
