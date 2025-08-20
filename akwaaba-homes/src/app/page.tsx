import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturedProperties } from '@/components/sections/FeaturedProperties';
import { DiasporaSection } from '@/components/sections/DiasporaSection';

export default function Home() {
  return (
        <main className="min-h-screen">
      <HeroSection />
      <FeaturedProperties />
      <DiasporaSection />
    </main>
  );
}