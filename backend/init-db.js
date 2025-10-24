const https = require('https');

// Function to make POST request
function initDatabase() {
  const postData = JSON.stringify({});
  
  const options = {
    hostname: 'masapp-backend.onrender.com',
    port: 443,
    path: '/api/init-database',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('🔧 Initializing database...');
  
  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      try {
        const result = JSON.parse(data);
        if (result.success) {
          console.log('✅ Database initialized successfully!');
          console.log('📊 Tables created:', result.tables);
        } else {
          console.log('❌ Database initialization failed:', result.message);
        }
      } catch (e) {
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Request error:', e.message);
  });

  req.write(postData);
  req.end();
}

// Also try to check debug endpoint
function checkDebug() {
  const options = {
    hostname: 'masapp-backend.onrender.com',
    port: 443,
    path: '/debug-users',
    method: 'GET'
  };

  console.log('🔍 Checking debug endpoint...');
  
  const req = https.request(options, (res) => {
    console.log(`Debug Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Debug endpoint is working!');
        console.log('First 200 chars:', data.substring(0, 200));
      } else {
        console.log('❌ Debug endpoint error:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Debug request error:', e.message);
  });

  req.end();
}

// Run both checks
console.log('🚀 Starting database diagnostics...');
checkDebug();
setTimeout(() => {
  initDatabase();
}, 2000);
