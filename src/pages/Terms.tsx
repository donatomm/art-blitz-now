import PageContent from "@/components/PageContent";

const Terms = () => {
  return (
    <PageContent 
      slug="terms" 
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Termini e Condizioni", url: "/terms" },
      ]}
    />
  );
};

export default Terms;
