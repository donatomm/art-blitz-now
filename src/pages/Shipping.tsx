import PageContent from "@/components/PageContent";

const Shipping = () => {
  return (
    <PageContent 
      slug="spedizione" 
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Spedizioni", url: "/shipping" },
      ]}
    />
  );
};

export default Shipping;
