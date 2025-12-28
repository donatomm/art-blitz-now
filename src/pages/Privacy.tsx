import PageContent from "@/components/PageContent";

const Privacy = () => {
  return (
    <PageContent 
      slug="privacy" 
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Privacy Policy", url: "/privacy" },
      ]}
    />
  );
};

export default Privacy;
