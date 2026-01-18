import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Cookies = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/cookie-policy-content.html")
      .then((res) => res.text())
      .then((html) => setContent(html))
      .catch((err) => console.error("Error loading cookie policy:", err));
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title="Cookie Policy"
        description="Informativa sui cookie di OctoWonders. Come utilizziamo i cookie e come gestire le tue preferenze."
        url="/cookies"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Cookie Policy", url: "/cookies" },
        ]}
      />
      <Navigation />
      
      <Link
        to="/"
        className="fixed top-[68px] left-4 z-40 inline-flex items-center gap-2 px-4 py-1.5 rounded-full shadow-lg transition-all duration-300 font-medium bg-gold text-primary opacity-90 hover:opacity-100 hover:scale-105 hover:shadow-xl text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Torna alla Galleria</span>
      </Link>

      <main className="pt-24 pb-16 px-4 md:px-8 max-w-4xl mx-auto flex-1">
        <div 
          className="prose prose-sm max-w-none bg-card p-6 md:p-8 rounded-lg border border-border"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Cookies;