import PageContent from "@/components/PageContent";

const Contact = () => {
  return (
    <PageContent 
      slug="contatti"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Contatti", url: "/contatti" },
      ]}
    />
  );
};

export default Contact;
