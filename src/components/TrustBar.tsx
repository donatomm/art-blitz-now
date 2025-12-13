const trustPoints = ["Stampe Professionali Su Tela", "Tecnologia HP Latex™", "Colori Brillanti Garantiti per Decenni", "Pronte da Appendere"];
const TrustBar = () => {
  return <div className="py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-center gap-3">
          {trustPoints.map((point, index) => <div key={index} className="px-5 bg-gray-900/80 border-l-2 border-gold text-white text-sm font-light tracking-wide whitespace-nowrap py-[5px]">
              {point}
            </div>)}
          <div className="px-5 bg-red-600 border-l-2 border-yellow-400 text-white text-sm font-bold tracking-wide whitespace-nowrap py-[5px]">
            Sconto 44% fino al 14 Dicembre
          </div>
        </div>
      </div>
    </div>;
};
export default TrustBar;