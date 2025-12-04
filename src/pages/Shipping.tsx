import Navigation from "@/components/Navigation";

const Shipping = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Shipping Rules</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Delivery Times</h2>
              <p className="text-muted-foreground mb-4">
                All artwork is carefully packaged and shipped within 5-7 business days 
                of your order. Delivery times vary by location:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Domestic: 3-5 business days</li>
                <li>Europe: 5-10 business days</li>
                <li>International: 10-21 business days</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Shipping Costs</h2>
              <p className="text-muted-foreground mb-4">
                Shipping costs are calculated at checkout based on your location and 
                the size of the artwork. We offer free shipping on orders over €500.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Packaging</h2>
              <p className="text-muted-foreground mb-4">
                Each piece is professionally packaged with protective materials to ensure 
                it arrives in perfect condition. Canvas prints are shipped flat or rolled 
                in protective tubes depending on size.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Returns & Exchanges</h2>
              <p className="text-muted-foreground mb-4">
                We want you to love your artwork. If for any reason you're not satisfied, 
                please contact us within 14 days of delivery. Custom orders are non-refundable.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Questions?</h2>
              <p className="text-muted-foreground">
                If you have any questions about shipping, please don't hesitate to 
                contact us via WhatsApp or email.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Shipping;