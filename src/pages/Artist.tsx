import PageContent from "@/components/PageContent";

const Artist = () => {
  return (
    <PageContent 
      slug="artista" 
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "L'Artista", url: "/artist" },
      ]}
    />
  );
};

export default Artist;
