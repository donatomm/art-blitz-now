# Chiudere le due code: ripulire la riga di prova e rimettere in piedi il controllo di sicurezza

## Cosa ho trovato (verificato leggendo i file)

**1. La riga di prova è ancora lì.** Nel comando di deploy (`supabase/functions/trigger-deploy/index.ts`, riga 6) c'è ancora `'x-octo-marker': 'test-2026-10-11'`. Non cambia niente del comportamento: è una riga di testo in più che il sito manda e nessuno legge.

**2. Il tuo deploy NON è a rischio.** Il flusso che sta dietro al pulsante "Sync & Deploy" esegue solo due comandi, e entrambi esistono ancora. Quindi il deploy continua a funzionare, come hai confermato.

**3. C'è un allarme più serio delle 3 segnalazioni.** Il controllo di sicurezza su GitHub (`.github/workflows/p0-safety.yml`) esegue tre comandi che ora non esistono più, perché le voci corrispondenti sono state tolte da `package.json` durante il ripristino:

- `p0:check:source`
- `p0:check:artifact`
- `p0:check:repair`

Un comando che non esiste fa fallire il passaggio. Quindi quel controllo, quando scatta, **si rompe** invece di controllare.

**4. Quando scatta.** Solo in tre casi: una richiesta di unione verso `main` o `production`, una spinta sul ramo `production`, o un avvio manuale. Una spinta diretta su `main` non lo avvia. Se lavori sempre spingendo su `main`, non l'hai mai visto fallire. Non posso vedere lo storico delle esecuzioni, quindi non so se è già successo.

**5. Il codice del controllo esiste ancora** (cartella `safety/`), ma senza quelle voci non c'è modo di avviarlo. È attrezzo chiuso in un cassetto: sembra che ci sia, non lavora.

## Il mio suggerimento

**Riaccendere il controllo, non lasciarlo a metà.**

Il motivo è il punto che ti sta più a cuore: "quando tocchi la SEO il mio sito si rompe". Quel controllo è l'unico aggeggio che si accorge da solo di un danno a pagine, indirizzi e SEO. Toglierlo del tutto è una scelta legittima; lasciarlo rotto e mezzo acceso è l'unica combinazione davvero pessima, perché non protegge e nel frattempo occupa spazio e confonde.

Riaccenderlo non costa nulla: i file del controllo sono tutti al loro posto, non va installato niente, e `package.json` non viene servito ai visitatori, quindi sul sito nessuno vede differenza.

**Attenzione però:** se riaccendiamo il controllo, lui si lamenterà della modifica a `vercel.json` (i due indirizzi dell'articolo che ora puntano a `/blog`), perché il suo "giudice" si aspetta ancora la vecchia situazione. Quindi le due cose vanno decise insieme, ed è per questo che metto nel piano anche l'aggiornamento del giudice.

```text
Scelta A (consigliata)        Scelta B
riaccendi il controllo   ->   spegni il controllo del tutto
allinea il giudice a /blog    cancella anche il file del flusso
protegge dai danni SEO        nessuna rete di sicurezza
```

## Cosa farei, passo per passo

1. **Togliere la riga di prova** dal comando di deploy e ridistribuirlo. È la stessa modifica che abbiamo già distribuito due volte con successo, al contrario.
2. **Rimettere le 7 voci mancanti** in `package.json`, solo dentro `scripts`, così i comandi del controllo tornano disponibili. Nessuna dipendenza nuova, nessuna installazione.
3. **Allineare il giudice alla realtà nuova** (`safety/p0/hosting.ts`), così accetta i due indirizzi dell'articolo che vanno a `/blog` e smette di segnalarli come danno. Serve il tuo permesso esplicito, perché è il file che decide cosa è "rotto".
4. **Riordinare `roadmap.md`**: ora è fermo a una voce vecchia.

## Rischi

- **Passo 1 (riga di prova):** basso. È una riga sola dentro un blocco di intestazioni. Rischio reale: un errore di battitura che rompe il comando di deploy. Mitigazione: lo ridistribuiamo e verifichiamo che risponda, come già fatto stasera.
- **Passo 2 (rimettere le 7 voci):** basso-mecco. `package.json` torna a non essere più identico alla versione che mi hai dettato. Sul sito live non cambia nulla: quel file non viene mostrato ai visitatori, serve solo a guidare le costruzioni. Se per te la corrispondenza con la versione live è un vincolo forte, allora la scelta giusta è B, non questa.
- **Passo 3 (allineare il giudice):** medio. È il file che decide cosa è rotto: modificarlo significa fidarsi di una mia lettura. Se lo aggiorno male, il controllo potrebbe smettere di accorgersi di un danno vero. Mitigazione: gli tolgono solo le 3 asserzioni sui due indirizzi dell'articolo, non tocco le altre regole, e poi eseguo il controllo per vedere che passi davvero.
- **Passo 4 (roadmap):** nullo.

## Dettagli tecnici

- File toccati: `supabase/functions/trigger-deploy/index.ts`, `package.json`, `safety/p0/hosting.ts`, `roadmap.md`.
- Voci da rimettere in `scripts`: `build:committed`, `test:safety`, `typecheck:safety`, `p0:check:source`, `p0:check:artifact`, `p0:check:build-seo`, `p0:check:repair`.
- Il flusso `regenerate-static-data.yml` (quello del pulsante "Sync & Deploy") non viene toccato e non dipende da queste voci.
- Dopo il passo 3, le 3 segnalazioni aperte (`HOSTING_ARTICLE_REDIRECT`, `HOSTING_LEGACY_ARTICLE_REDIRECT`, `HOSTING_REQUIRED_REWRITE_MISSING`) spariscono da sole, perché il giudice non le considera più danni.
- Nessuna modifica a indirizzi, immagini, percorsi di archiviazione, o al file `vercel.json`.
