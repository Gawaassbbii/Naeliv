/**
 * Script de test pour l'endpoint inbound-email
 * Usage: node scripts/test-inbound-email.js
 */

const testEmail = {
  type: 'email.received',
  data: {
    from: 'test@example.com',
    from_name: 'Test User',
    to: 'user@naeliv.com',
    subject: 'Test Email',
    text: 'This is a test email body',
    html: '<p>This is a test email body</p>',
  }
};

async function testInboundEmail() {
  const url = process.env.API_URL || 'http://localhost:3000/api/inbound-email';
  
  console.log('Testing inbound email endpoint:', url);
  console.log('Sending test email:', JSON.stringify(testEmail, null, 2));
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEmail),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success:', data);
    } else {
      console.error('❌ Error:', data);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testInboundEmail();

