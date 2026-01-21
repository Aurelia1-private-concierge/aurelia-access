import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ServiceMarketplace from "@/components/ServiceMarketplace";

const Marketplace = () => {
  return (
    <>
      <SEOHead
        title="Luxury Service Marketplace | Aurelia"
        description="Discover exclusive luxury services from our curated partner network. Private aviation, yacht charters, five-star hotels, and bespoke experiences."
      />
      <Navigation />
      <main className="min-h-screen bg-background pt-20">
        <ServiceMarketplace />
      </main>
      <Footer />
    </>
  );
};

export default Marketplace;
