import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
            <Link href="/" className="flex items-center text-gray-900 hover:text-gray-700 transition-colors">
              <Home className="h-5 w-5 mr-2" />
              AkwaabaHomes
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Terms Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to AkwaabaHomes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using AkwaabaHomes ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Permission is granted to temporarily download one copy of AkwaabaHomes per device for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">3. Real Estate Services</h2>
              <p className="text-gray-700 leading-relaxed">
                AkwaabaHomes provides a platform for real estate agents to list properties and for users to search for properties. We do not guarantee the accuracy of property information, and all transactions are between users and agents. We are not responsible for the quality, safety, or legality of properties listed on our platform.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">4. User Accounts</h2>
              <p className="text-gray-700 leading-relaxed">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">5. Prohibited Uses</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                You may not use our service:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">6. Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">7. Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed">
                The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms relating to our website and the use of this website.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">8. Limitations</h2>
              <p className="text-gray-700 leading-relaxed">
                In no event shall AkwaabaHomes or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AkwaabaHomes' website.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">9. Accuracy of Materials</h2>
              <p className="text-gray-700 leading-relaxed">
                The materials appearing on AkwaabaHomes' website could include technical, typographical, or photographic errors. AkwaabaHomes does not warrant that any of the materials on its website are accurate, complete, or current.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">10. Links</h2>
              <p className="text-gray-700 leading-relaxed">
                AkwaabaHomes has not reviewed all of the sites linked to our website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by AkwaabaHomes of the site.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">11. Modifications</h2>
              <p className="text-gray-700 leading-relaxed">
                AkwaabaHomes may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">12. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws of Ghana and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">13. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
              <div className="mt-2 text-gray-700">
                <p>Email: legal@akwaabahomes.com</p>
                <p>Phone: +233 XX XXX XXXX</p>
                <p>Address: Accra, Ghana</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="outline" className="mr-4">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link href="/auth">
            <Button>
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
