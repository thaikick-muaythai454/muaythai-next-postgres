import { HeroSection, QuickSearchBar, FeaturedSection, LatestProducts, NewsBanner } from "@/components/features/sections";
import Marquee from "@/components/ui/Marquee";
import { GYMS, EVENTS, PRODUCTS } from "@/lib/data";

export default function Home() {
  return (
    <>
      {/* Hero Section with Video */}
      <HeroSection />
      
      {/* News Banner */}
      <NewsBanner />
      
      <Marquee />

      {/* Quick Search Bar */}
      <QuickSearchBar />

      {/* Featured Gyms and Events */}
      <FeaturedSection gyms={GYMS} events={EVENTS} />

      {/* Latest Products */}
      <LatestProducts products={PRODUCTS} />
    </>
  );
}
