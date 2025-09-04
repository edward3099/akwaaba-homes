import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import "../styles/accessibility.css";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/lib/auth/authContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins" 
});

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Accessibility meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#f8fafc" />
        <meta name="color-scheme" content="light dark" />
        
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
