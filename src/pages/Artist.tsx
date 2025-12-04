import Navigation from "@/components/Navigation";

const Artist = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">About the Artist</h1>
          
          <div className="aspect-video bg-muted rounded-lg mb-8 flex items-center justify-center">
            <p className="text-muted-foreground">Artist photo placeholder</p>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
              tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
              quis nostrud exercitation ullamco laboris.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">My Journey</h2>
            <p className="text-muted-foreground mb-6">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum 
              dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non 
              proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Inspiration</h2>
            <p className="text-muted-foreground mb-6">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium 
              doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore 
              veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Artist;