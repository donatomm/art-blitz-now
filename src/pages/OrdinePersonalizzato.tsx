import PageContent from "@/components/PageContent";

const OrdinePersonalizzato = () => {
  return (
    <PageContent 
      slug="ordine-personalizzato"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Ordine Personalizzato", url: "/ordine-personalizzato" },
      ]}
    />
  );
};

export default OrdinePersonalizzato;
