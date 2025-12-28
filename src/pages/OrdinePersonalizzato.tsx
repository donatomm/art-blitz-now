import PageContent from "@/components/PageContent";
import CanvasCustomizationOptions from "@/components/CanvasCustomizationOptions";

const OrdinePersonalizzato = () => {
  return (
    <PageContent 
      slug="ordine-personalizzato"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Ordine Personalizzato", url: "/ordine-personalizzato" },
      ]}
    >
      <CanvasCustomizationOptions />
    </PageContent>
  );
};

export default OrdinePersonalizzato;
