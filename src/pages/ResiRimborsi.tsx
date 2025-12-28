import PageContent from "@/components/PageContent";

const ResiRimborsi = () => {
  return (
    <PageContent 
      slug="resi-rimborsi" 
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Resi e Rimborsi", url: "/resi-rimborsi" },
      ]}
    />
  );
};

export default ResiRimborsi;
