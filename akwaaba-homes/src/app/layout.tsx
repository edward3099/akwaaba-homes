import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import "../styles/accessibility.css";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/lib/auth/authContext";
import { Toaster } from "sonner";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { PWAInstallPrompt, IOSInstallInstructions } from "@/components/pwa/PWAInstallPrompt";
import { PWALoadingScreen } from "@/components/pwa/SplashScreen";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins" 
});

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "AkwaabaHomes - Your Gateway to Premium Real Estate",
  description: "Discover exceptional properties in Ghana with AkwaabaHomes. From luxury homes to investment opportunities, find your perfect property with our expert guidance.",
  keywords: "Ghana real estate, luxury homes, property investment, Accra properties, real estate agents",
  authors: [{ name: "AkwaabaHomes Team" }],
  openGraph: {
    title: "AkwaabaHomes - Premium Real Estate in Ghana",
    description: "Your gateway to exceptional properties across Ghana",
    type: "website",
    locale: "en_US",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AkwaabaHomes",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="AkwaabaHomes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AkwaabaHomes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#C21807" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* PWA Theme Colors */}
        <meta name="theme-color" content="#C21807" />
        <meta name="msapplication-navbutton-color" content="#C21807" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Accessibility meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="color-scheme" content="light dark" />
        
        {/* PWA Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#C21807" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Accessibility CSS is imported in the component */}
      </head>
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        {/* Skip Links for Accessibility */}
        <a href="#main-content" className="skip-link focus:top-6">
          Skip to main content
        </a>
        <a href="#navigation" className="skip-link focus:top-6">
          Skip to navigation
        </a>
        
        <AuthProvider>
          {/* PWA Components */}
          <ServiceWorkerRegistration />
          <PWALoadingScreen />
          <PWAInstallPrompt />
          <IOSInstallInstructions />
          
          <Header />
          <main id="main-content" role="main" tabIndex={-1}>
            {children}
          </main>
          
          {/* Ghana-themed Sonner Toaster */}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: 'var(--ghana-gold, #FFD700)',
                color: 'var(--ghana-red, #C21807)',
                border: '2px solid var(--ghana-green, #00A86B)',
              },
              className: 'ghana-toast',
              duration: 5000,
            }}
          />
        </AuthProvider>
        
        {/* Accessibility Scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Focus management for skip links
              document.addEventListener('DOMContentLoaded', function() {
                const skipLinks = document.querySelectorAll('.skip-link');
                skipLinks.forEach(link => {
                  link.addEventListener('click', function(e) {
                    const targetId = this.getAttribute('href').substring(1);
                    const target = document.getElementById(targetId);
                    if (target) {
                      e.preventDefault();
                      target.focus();
                      target.scrollIntoView({ behavior: 'smooth' });
                    }
                  });
                });
                
                // Fix Safari PWA red background issue - CSS only approach
                function fixSafariThemeColor() {
                  // Only override meta theme-color, no inline styles
                  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
                  if (themeColorMeta) {
                    themeColorMeta.setAttribute('content', '#f8fafc');
                  }
                  
                  // Add CSS class to body for Safari PWA mode
                  if (window.matchMedia('(display-mode: standalone)').matches) {
                    document.body.classList.add('safari-pwa-mode');
                  }
                }
                
                // Apply fix when PWA is launched
                if (window.matchMedia('(display-mode: standalone)').matches) {
                  fixSafariThemeColor();
                }
              });
              
              // Announce page changes to screen readers
              if (typeof window !== 'undefined') {
                window.addEventListener('load', function() {
                  const announcement = document.createElement('div');
                  announcement.setAttribute('aria-live', 'polite');
                  announcement.setAttribute('aria-atomic', 'true');
                  announcement.setAttribute('class', 'sr-only');
                  announcement.textContent = 'Page loaded successfully';
                  document.body.appendChild(announcement);
                  
                  setTimeout(() => {
                    if (document.body.contains(announcement)) {
                      document.body.removeChild(announcement);
                    }
                  }, 1000);
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
