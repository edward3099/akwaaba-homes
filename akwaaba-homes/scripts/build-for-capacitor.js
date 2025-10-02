const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building AkwaabaHomes for Capacitor...');

// Step 1: Build the Next.js app normally
console.log('📦 Building Next.js app...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Next.js build completed');
} catch (error) {
  console.error('❌ Next.js build failed:', error.message);
  process.exit(1);
}

// Step 2: Create a static version for Capacitor
console.log('📱 Creating static version for Capacitor...');

const outDir = path.join(__dirname, '..', 'out');
const publicDir = path.join(__dirname, '..', 'public');

// Create out directory if it doesn't exist
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Copy public files to out directory
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy public directory
copyDir(publicDir, outDir);

// Create a simple index.html for the PWA
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AkwaabaHomes - Ghana Real Estate</title>
    <meta name="description" content="Find your dream home in Ghana. Premium real estate marketplace for diaspora and local buyers.">
    <meta name="theme-color" content="#C21807">
    <link rel="manifest" href="/manifest.json">
    <link rel="icon" href="/icons/icon-192x192.png">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #C21807, #FFD700, #00A86B);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            color: white;
            padding: 2rem;
        }
        .logo {
            font-size: 3rem;
            font-weight: bold;
            margin-bottom: 1rem;
        }
        .subtitle {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        .message {
            font-size: 1rem;
            opacity: 0.8;
        }
        .install-button {
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid white;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            margin-top: 1rem;
            transition: all 0.3s ease;
        }
        .install-button:hover {
            background: rgba(255, 255, 255, 0.3);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🏠 AkwaabaHomes</div>
        <div class="subtitle">Ghana Real Estate</div>
        <div class="message">
            This is a Progressive Web App (PWA) version of AkwaabaHomes.<br>
            For the full experience, please visit our website or install our mobile app.
        </div>
        <button class="install-button" onclick="window.location.href='https://akwaabahomes.com'">
            Visit Full Website
        </button>
    </div>
    
    <script>
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => console.log('SW registered'))
                .catch(error => console.log('SW registration failed'));
        }
        
        // Handle install prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            const installButton = document.querySelector('.install-button');
            installButton.textContent = 'Install App';
            installButton.onclick = () => {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    }
                    deferredPrompt = null;
                });
            };
        });
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml);

console.log('✅ Static version created for Capacitor');
console.log('📁 Output directory:', outDir);
console.log('🎉 Build completed successfully!');
console.log('');
console.log('Next steps:');
console.log('1. Run: npx cap sync');
console.log('2. Run: npx cap open ios');
console.log('3. Build and test in Xcode');




