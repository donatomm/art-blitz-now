import TrustBar from "./TrustBar";
import heroImage from "@/assets/hero-image.webp";

interface HeroProps {
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  trustBarItems?: string[];
}

const Hero = ({
  imageUrl,
  title = "Your Hero Title Here",
  subtitle = "Your inspiring subtitle goes here",
  ctaText,
  onCtaClick,
  trustBarItems
}: HeroProps) => {
  // Use uploaded image if provided, otherwise fall back to default
  const displayImage = imageUrl && imageUrl.trim() !== "" ? imageUrl : heroImage;
  
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background Image with high priority for LCP */}
      <img 
        src={displayImage} 
        alt="OctoWonders Hero" 
        width={1920} 
        height={1080} 
        loading="eager" 
        decoding="sync" 
        fetchPriority="high" 
        className="absolute inset-0 w-full h-full object-cover object-center" 
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col">
        {/* Spacer to account for fixed HelloBar */}
        <div className="pt-12" />

        {/* Hero Text Area */}
        <div className="flex h-[calc(65vh-20px)] min-h-[400px] flex-col items-center justify-center px-4 text-center mt-[50px]">
          <div className="bg-blue-500/40 backdrop-blur-sm px-8 py-6 rounded-lg border border-white/10">
            <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl whitespace-pre-line">
              {title}
            </h1>
            <p className="max-w-2xl mx-auto text-center text-lg italic text-gold sm:text-xl md:text-2xl">
              {subtitle}
            </p>
            {ctaText && (
              <button 
                onClick={onCtaClick} 
                className="mt-6 px-8 py-3 font-semibold rounded-full transition-all duration-200 hover:scale-105 text-lg text-primary-foreground bg-green-600 hover:bg-green-500"
              >
                {ctaText}
              </button>
            )}
          </div>
        </div>

        {/* Trust Bar - positioned at bottom of hero */}
        <div className="pb-4">
          <TrustBar items={trustBarItems} />
        </div>
      </div>
    </section>
  );
};

export default Hero;
