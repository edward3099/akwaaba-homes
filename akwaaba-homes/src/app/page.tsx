import { Suspense } from 'react';
import { FeaturedProperties } from '@/components/sections/FeaturedProperties';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<div>Loading properties...</div>}>
        <FeaturedProperties />
      </Suspense>
    </main>
  );
}