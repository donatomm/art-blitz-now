import TrustBar from "./TrustBar";
interface HeroProps {
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}
const Hero = ({
  imageUrl = "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1920&q=80",
  title = "Your Hero Title Here",
  subtitle = "Your inspiring subtitle goes here",
  ctaText,
  onCtaClick
}: HeroProps) => {
  return <section className="relative w-full overflow-hidden">
      {/* Background Image - extends full height including trust bar */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: `url(${imageUrl})`
    }} />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col">
        {/* Hero Text Area - increased height by 70px */}
        <div className="flex h-[calc(65vh-10px)] min-h-[440px] flex-col items-center justify-end px-4 text-center pb-[52px]">
          <div className="bg-blue-500/40 backdrop-blur-sm px-8 py-6 rounded-lg border border-white/10">
            <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl whitespace-pre-line">
              {title}
            </h1>
            <p className="max-w-2xl mx-auto text-center text-lg italic text-gold sm:text-xl md:text-2xl">
              {subtitle}
            </p>
            {ctaText && <button onClick={onCtaClick} className="mt-6 px-8 py-3 font-semibold rounded-full transition-all duration-200 hover:scale-105 text-lg text-primary-foreground bg-green-600 hover:bg-green-500">
                {ctaText}
              </button>}
          </div>
        </div>

        {/* Trust Bar - positioned at bottom of hero */}
        <div className="pb-4">
          <TrustBar />
        </div>
      </div>
    </section>;
};
export default Hero;