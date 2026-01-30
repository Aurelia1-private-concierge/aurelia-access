import VettedPartnersSection from "./VettedPartnersSection";

const PartnersSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <VettedPartnersSection limit={6} showHeader={true} />
      </div>
    </section>
  );
};

export default PartnersSection;
