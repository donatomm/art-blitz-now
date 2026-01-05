import PageContent from "@/components/PageContent";

const FAQs = () => {
  return (
    <PageContent 
      slug="FAQs" 
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "FAQs", url: "/FAQs" },
      ]}
    />
  );
};

export default FAQs;
