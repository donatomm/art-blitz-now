import { Link } from "react-router-dom";
import { ArrowLeft, Palette, Info, HelpCircle, Scale } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useProducts } from "@/hooks/useProducts";

const Sitemap = () => {
  const { data: products = [], isLoading } = useProducts();
  const activeProducts = products.filter(p => p.is_active && p.slug);

  const sections = [
    {
      title: "Opere d'Arte",
      icon: Palette,
      links: activeProducts.map(p => ({
        to: `/product/${p.slug}`,
        label: p.name,
      })),
      loading: isLoading,
    },
    {
      title: "Informazioni",
      icon: Info,
      links: [
        { to: "/", label: "Home" },
        { to: "/artist", label: "L'Artista" },
        { to: "/ordine-personalizzato", label: "Ordini Personalizzati" },
        { to: "/contact", label: "Contatti" },
      ],
    },
    {
      title: "Assistenza",
      icon: HelpCircle,
      links: [
        { to: "/shipping", label: "Spedizioni" },
        { to: "/pricing-policy", label: "Politica Prezzi" },
        { to: "/resi-rimborsi", label: "Resi e Rimborsi" },
        { to: "/nota-clienti", label: "Nota Clienti" },
      ],
    },
    {
      title: "Legale",
      icon: Scale,
      links: [
        { to: "/privacy", label: "Privacy Policy" },
        { to: "/cookies", label: "Cookie Policy" },
        { to: "/terms", label: "Termini e Condizioni" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <SEO
        title="Mappa del Sito"
        description="Esplora tutte le pagine di OctoWonders: opere d'arte, informazioni sull'artista, spedizioni e contatti."
        url="/sitemap"
      />

      <div className="container mx-auto px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna alla Home
        </Link>

        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Mappa del Sito
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Esplora tutte le sezioni di OctoWonders per trovare facilmente ciò che cerchi.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {sections.map((section) => (
            <section key={section.title} className="space-y-4">
              <div className="flex items-center gap-3">
                <section.icon className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">
                  {section.title}
                </h2>
              </div>
              
              {section.loading ? (
                <div className="text-muted-foreground text-sm">Caricamento...</div>
              ) : (
                <ul className="space-y-2 pl-8">
                  {section.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
