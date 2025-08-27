import { AccessibilityEnhancements } from '@/components/accessibility';

export default function AccessibilityDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Accessibility & Responsive Design Demo
          </h1>
          <p className="text-lg text-gray-600">
            This page demonstrates the comprehensive accessibility features and responsive design patterns 
            implemented for the Akwaaba Homes platform.
          </p>
        </div>

        <AccessibilityEnhancements />
      </div>
    </div>
  );
}
