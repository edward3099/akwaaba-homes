import PropertiesList from '@/components/properties/PropertiesList';

export default function PropertiesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            All Properties
          </h1>
          <p className="text-lg text-gray-600">
            Discover exceptional properties across Ghana
          </p>
        </div>
        <PropertiesList />
      </div>
    </main>
  );
}

