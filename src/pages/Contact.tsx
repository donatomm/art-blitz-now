import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, MapPin } from "lucide-react";

const Contact = () => {
  const getWhatsAppLink = () => {
    const message = encodeURIComponent("Hi! I'd like to get in touch about your artwork.");
    return `https://wa.me/?text=${message}`;
  };

  const getEmailLink = () => {
    const subject = encodeURIComponent("Inquiry from Website");
    return `mailto:?subject=${subject}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Have a question about our artwork or want to discuss a custom order? 
            We'd love to hear from you. Choose your preferred contact method below.
          </p>
          
          <div className="grid gap-6 md:grid-cols-2 mb-12">
            <Button
              asChild
              size="lg"
              className="h-auto py-6 flex-col gap-2"
            >
              <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-8 w-8" />
                <span className="text-lg font-semibold">WhatsApp</span>
                <span className="text-sm opacity-80">Quick response</span>
              </a>
            </Button>
            
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="h-auto py-6 flex-col gap-2"
            >
              <a href={getEmailLink()}>
                <Mail className="h-8 w-8" />
                <span className="text-lg font-semibold">Email</span>
                <span className="text-sm opacity-80">Detailed inquiries</span>
              </a>
            </Button>
          </div>
          
          <div className="border-t pt-8">
            <h2 className="text-2xl font-semibold mb-4">Location</h2>
            <div className="flex items-start gap-3 text-muted-foreground">
              <MapPin className="h-5 w-5 mt-1 shrink-0" />
              <div>
                <p>Your Studio Name</p>
                <p>Street Address</p>
                <p>City, Country</p>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-8 mt-8">
            <h2 className="text-2xl font-semibold mb-4">Business Hours</h2>
            <div className="text-muted-foreground space-y-1">
              <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
              <p>Saturday: 10:00 AM - 4:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;