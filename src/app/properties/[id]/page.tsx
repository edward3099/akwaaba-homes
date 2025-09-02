import PropertyDetail from '@/components/properties/PropertyDetail';

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;
  
  return (
    <main className="min-h-screen bg-gray-50">
      <PropertyDetail propertyId={id} />
    </main>
  );
}

