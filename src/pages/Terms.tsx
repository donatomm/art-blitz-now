import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-8 pt-24 pb-12 max-w-4xl">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna alla Galleria
        </Link>

        <article className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-foreground mb-2">TERMINI E CONDIZIONI DI VENDITA</h1>
          <p className="text-muted-foreground mb-8">Ultimo aggiornamento: 16 Dicembre 2025</p>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">1. INFORMAZIONI GENERALI</h2>
            <p className="text-foreground mb-4">
              Il presente documento stabilisce i termini e le condizioni generali di vendita dei prodotti offerti sul sito web octowonders.com (di seguito, il "Sito"), gestito da:
            </p>
            <p className="text-foreground mb-4">
              Octowonders è un brand di proprietà di:
            </p>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-foreground mb-1"><strong>Donato Marco Mangialardo</strong></p>
              <p className="text-foreground mb-1">Via Persiutti 8, 61032 Fano (PU), Italia</p>
              <p className="text-foreground mb-1">Codice fiscale: MNGDTM66L18F205N</p>
              <p className="text-foreground">Email: donatomm@gmail.com</p>
            </div>
            <p className="text-foreground">
              Il venditore opera in qualità di persona fisica non esercente attività d'impresa, nel rispetto della normativa vigente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">2. OGGETTO DEL CONTRATTO</h2>
            <p className="text-foreground mb-4">
              Le presenti condizioni generali disciplinano la vendita di beni mobili materiali (di seguito, i "Prodotti") offerti in vendita sul Sito, tra il venditore e qualsiasi persona fisica qualificabile come "consumatore" ai sensi dell'art. 3 del D.lgs. 206/2005 (Codice del Consumo).
            </p>
            <p className="text-foreground">
              L'acquisto dei Prodotti comporta la piena accettazione delle presenti condizioni di vendita.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">3. CARATTERISTICHE DEI PRODOTTI</h2>
            <p className="text-foreground">
              I Prodotti sono descritti nelle relative pagine del Sito. Le immagini hanno finalità puramente illustrative e possono non essere perfettamente rappresentative delle caratteristiche reali.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">4. PREZZI E DISPONIBILITÀ</h2>
            <p className="text-foreground mb-4">
              Tutti i prezzi sono espressi in euro e comprendono le imposte vigenti. I prezzi possono essere soggetti a modifiche, ma tali modifiche non influiranno sugli ordini già confermati.
            </p>
            <p className="text-foreground">
              La disponibilità dei prodotti è indicata nel Sito ed è soggetta a variazioni senza preavviso. In caso di indisponibilità, il cliente verrà informato tempestivamente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">5. MODALITÀ DI PAGAMENTO</h2>
            <p className="text-foreground mb-4">Il pagamento avviene tramite Stripe, che consente:</p>
            <ul className="list-disc pl-6 text-foreground mb-4">
              <li>Carte di credito e debito (Visa, Mastercard, American Express, ecc.)</li>
              <li>Apple Pay</li>
              <li>Google Pay</li>
              <li>Link by Stripe</li>
              <li>Satispay</li>
            </ul>
            <p className="text-foreground">
              I dati di pagamento non vengono mai trattati o conservati dal venditore, ma gestiti direttamente da Stripe nel rispetto degli standard PCI-DSS.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">6. MODALITÀ DI CONSEGNA</h2>
            <p className="text-foreground mb-4">
              I Prodotti saranno consegnati all'indirizzo fornito dal cliente in fase d'ordine. I tempi di spedizione sono indicati durante la procedura di acquisto.
            </p>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-foreground font-semibold mb-2">📦 Controllo all'arrivo</p>
              <p className="text-foreground">
                Il cliente è tenuto a verificare l'integrità del pacco alla consegna e a segnalare eventuali danni entro 48 ore, allegando prova fotografica.
              </p>
            </div>
            <p className="text-foreground">
              Il rischio di danneggiamento o perdita si trasferisce al consumatore solo al momento della consegna fisica del bene.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">7. DIRITTO DI RECESSO</h2>
            <p className="text-foreground mb-4">
              Ai sensi del D.lgs. 206/2005, il cliente ha diritto a recedere dall'acquisto entro 14 giorni dalla consegna, senza obbligo di motivazione.
            </p>
            <p className="text-foreground mb-4">
              Il recesso deve essere comunicato via email a: <a href="mailto:donatomm@gmail.com" className="text-gold hover:underline">donatomm@gmail.com</a>, anche utilizzando il modulo tipo riportato in fondo a questo documento.
            </p>
            
            <h3 className="text-lg font-semibold text-foreground mb-2">Restituzione dei prodotti</h3>
            <p className="text-foreground mb-4">
              Il cliente deve restituire i prodotti entro 14 giorni dalla comunicazione del recesso. Le spese di restituzione sono a carico del cliente.
            </p>
            <p className="text-foreground mb-4">
              Il rimborso avverrà entro 14 giorni dalla ricezione della comunicazione di recesso, ma potrà essere trattenuto fino alla ricezione del prodotto o alla prova dell'avvenuta spedizione.
            </p>
            
            <h3 className="text-lg font-semibold text-foreground mb-2">Responsabilità per uso improprio o danni</h3>
            <p className="text-foreground mb-4">
              Il cliente è responsabile della diminuzione di valore del bene se usato in modo incompatibile con la sua natura o destinazione d'uso.
            </p>
            <p className="text-foreground mb-2">In caso di restituzione di prodotto danneggiato o non rivendibile, il venditore si riserva il diritto di:</p>
            <ul className="list-disc pl-6 text-foreground">
              <li>ridurre proporzionalmente il rimborso;</li>
              <li>oppure, nei casi gravi, rifiutare il rimborso, fornendo documentazione.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">8. GARANZIA LEGALE</h2>
            <p className="text-foreground mb-4">
              Tutti i prodotti sono coperti dalla garanzia legale di conformità di 2 anni ai sensi degli artt. 128-135 del Codice del Consumo.
            </p>
            <p className="text-foreground mb-2">Il cliente ha diritto alla:</p>
            <ul className="list-disc pl-6 text-foreground mb-4">
              <li>riparazione o sostituzione gratuita,</li>
              <li>riduzione del prezzo,</li>
              <li>risoluzione del contratto nei casi previsti.</li>
            </ul>
            <p className="text-foreground">Il difetto deve essere denunciato entro 2 mesi dalla scoperta.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">9. LIMITAZIONE DI RESPONSABILITÀ</h2>
            <p className="text-foreground mb-2">Il venditore non è responsabile per:</p>
            <ul className="list-disc pl-6 text-foreground mb-4">
              <li>uso improprio dei prodotti da parte del cliente,</li>
              <li>ritardi non imputabili al venditore (es. problemi del corriere),</li>
              <li>interruzioni tecniche del sito.</li>
            </ul>
            <p className="text-foreground">La responsabilità complessiva del venditore non potrà mai eccedere il valore dell'ordine.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">10. LEGGE APPLICABILE E FORO COMPETENTE</h2>
            <p className="text-foreground">
              Il contratto è disciplinato dalla legge italiana. Per qualsiasi controversia è competente il foro del consumatore, come previsto dall'art. 66-bis del Codice del Consumo.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">11. RISOLUZIONE ALTERNATIVA DELLE CONTROVERSIE (ODR)</h2>
            <p className="text-foreground">
              Ai sensi del Regolamento UE 524/2013, il cliente può presentare un reclamo attraverso la piattaforma ODR:{" "}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">12. MODIFICA DELLE CONDIZIONI</h2>
            <p className="text-foreground">
              Il venditore si riserva il diritto di aggiornare in qualsiasi momento le presenti condizioni. Le modifiche si applicano solo agli ordini successivi alla pubblicazione.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">13. ACCETTAZIONE DELLE CONDIZIONI</h2>
            <p className="text-foreground">
              Effettuando un ordine su octowonders.com, il cliente dichiara di aver letto, compreso e accettato integralmente le presenti Condizioni Generali di Vendita.
            </p>
          </section>

          <section className="mb-8 bg-muted p-6 rounded-lg">
            <h2 className="text-xl font-bold text-foreground mb-4">📝 MODULO DI RECESSO TIPO</h2>
            <p className="text-muted-foreground mb-4 italic">Da compilare e inviare solo in caso di recesso dal contratto (entro 14 giorni)</p>
            
            <p className="text-foreground mb-4">(ai sensi dell'art. 49, comma 1, lett. h del Codice del Consumo)</p>
            
            <div className="border-t border-border pt-4">
              <p className="text-foreground mb-2"><strong>Destinatario:</strong></p>
              <p className="text-foreground mb-1">Octowonders / Donato Marco Mangialardo</p>
              <p className="text-foreground mb-4">Email: donatomm@gmail.com</p>
              
              <p className="text-foreground mb-4">
                Con la presente io sottoscritto/a, notifico il recesso dal contratto di vendita dei seguenti beni:
              </p>
              
              <ul className="text-foreground space-y-2">
                <li>Prodotto: __________________________</li>
                <li>Ordinato il: __/__/____</li>
                <li>Ricevuto il: __/__/____</li>
                <li>Nome del consumatore: _____________________</li>
                <li>Indirizzo del consumatore: __________________</li>
                <li>Firma del consumatore (solo se cartaceo): ____________</li>
                <li>Data: __/__/____</li>
              </ul>
            </div>
          </section>
        </article>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
