import PageContent from "@/components/PageContent";

const OctopusFacts = () => {
  return (
    <PageContent 
      slug="Octopus-Facts" 
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Octopus Facts", url: "/Octopus-Facts" },
      ]}
    />
  );
};

export default OctopusFacts;