import PageContent from "@/components/PageContent";

const PricingPolicy = () => {
  return (
    <PageContent 
      slug="pricing-policy" 
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Politica Prezzi", url: "/pricing-policy" },
      ]}
    />
  );
};

export default PricingPolicy;
