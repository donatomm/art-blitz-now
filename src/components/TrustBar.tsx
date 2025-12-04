const trustPoints = [
  "Stampe Professionali Su Tela",
  "Tecnologia HP Latex",
  "Colori Brillanti Garantiti per Decenni",
  "Pronte da Appendere",
];

const TrustBar = () => {
  return (
    <div className="py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-center gap-3">
          {trustPoints.map((point, index) => (
            <div
              key={index}
              className="px-5 py-2.5 rounded-full bg-gray-900/90 border border-amber-500/40 text-white text-sm font-light tracking-wide whitespace-nowrap transition-all duration-200 hover:scale-105 hover:border-amber-500/70 hover:bg-gray-800/90"
            >
              {point}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustBar;
