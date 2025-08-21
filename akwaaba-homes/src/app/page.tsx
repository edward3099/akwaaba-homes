import { FeaturedProperties } from '@/components/sections/FeaturedProperties';
import { DiasporaSection } from '@/components/sections/DiasporaSection';

export default function Home() {
  return (
        <main className="min-h-screen">
      <FeaturedProperties />
      <DiasporaSection />
    </main>
  );
}