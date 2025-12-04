const trustPoints = [
  "Stampe Professionali Su Tela",
  "Tecnologia HP Latex",
  "Colori Brillanti Garantiti per Decenni",
  "Pronte da Appendere",
];

const TrustBar = () => {
  return (
    <section className="py-6 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-center gap-3">
          {trustPoints.map((point, index) => (
            <div
              key={index}
              className="px-5 py-2.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-white text-sm font-medium whitespace-nowrap"
            >
              {point}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
