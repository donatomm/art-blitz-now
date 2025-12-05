import Navigation from "@/components/Navigation";

const NotaClienti = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-4xl font-bold text-foreground mb-8">Nota per i Clienti</h1>
        
        <div className="prose prose-lg max-w-3xl text-muted-foreground space-y-6">
          <p>
            Contenuto della nota per i clienti da definire.
          </p>
        </div>
      </main>
    </div>
  );
};

export default NotaClienti;
