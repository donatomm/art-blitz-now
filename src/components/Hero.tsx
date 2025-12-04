interface HeroProps {
  imageUrl?: string;
  title?: string;
  subtitle?: string;
}

const Hero = ({
  imageUrl = "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1920&q=80",
  title = "Your Hero Title Here",
  subtitle = "Your inspiring subtitle goes here",
}: HeroProps) => {
  return (
    <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <div className="bg-black/40 backdrop-blur-sm px-8 py-6 rounded-lg border border-white/10">
          <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl whitespace-pre-line">
            {title}
          </h1>
          <p className="max-w-2xl mx-auto text-center text-lg italic text-gold sm:text-xl md:text-2xl">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;