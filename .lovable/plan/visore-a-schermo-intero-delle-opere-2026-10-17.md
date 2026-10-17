# Visore a schermo intero delle opere

Si toccano solo 3 file: `src/components/ArtworkLightbox.tsx` (nuovo), `src/components/ProductCard.tsx` e `src/pages/Product.tsx`. Si aggiunge un solo pacchetto: `react-zoom-pan-pinch`. Non si toccano database, Admin Panel, immagini, vercel.json, funzioni del backend, disposizione della galleria né i dati SEO.

Prima di iniziare: vuoi che esegua il controllo di sicurezza completo (docs/SAFETY-CHECK.md)? Se approvi senza dire nulla, lo eseguo prima di modificare il codice.

## 1. Nuovo ArtworkLightbox.tsx
- Usa il Dialog esistente; sfondo nero, a schermo intero sui telefoni.
- Immagini: prima l'opera (`image_url`), poi le foto ambiente da `sizes[].mock_room_url`, senza quelle vuote e senza doppioni.
- Sui telefoni si scorre con il dito; sul computer ci sono i pulsanti freccia e i tasti freccia. Etichette: "Precedente" / "Successiva".
- Zoom con due dita e doppio tocco su ogni immagine (react-zoom-pan-pinch). Lo scorrimento è disattivato mentre l'immagine è ingrandita.
- Per chiudere: pulsante X bianco in alto a destra ("Chiudi"), tasto Esc o tocco sullo sfondo scuro.
- In basso c'è il pulsante "Scegli il formato" nello stile cta. Nella homepage porta a `/product/{slug}#acquista`; nella pagina prodotto chiude il visore e scorre fino a `#acquista`.
- Testo alternativo: "{name} - vista ingrandita".
- Proprietà: `product`, `open`, `onOpenChange`, `initialIndex`, `onChooseFormat` facoltativa (se manca, si usa il link).

## 2. ProductCard.tsx
- Pulsante lente (ZoomIn) in basso a destra sull'immagine: bianco su cerchio scuro semitrasparente, sempre visibile, area di tocco di almeno 44x44 px, etichetta "Ingrandisci".
- Il clic sulla lente apre il visore e non apre la pagina prodotto (`preventDefault` e `stopPropagation`). Un clic altrove sull'immagine porta alla pagina prodotto come oggi.
- Nascosto in modalità modifica e sulle schede "coming soon". I badge NEW e offerta restano dove sono.

## 3. Product.tsx
- Un clic sull'anteprima da 300 px apre il visore sull'opera (prima immagine). "Scegli il formato" chiude il visore e scorre fino a `#acquista`.
- Il visore attuale delle foto ambiente resta com'è.

## Verifica
- Prova in browser su telefono e computer: apertura, scorrimento, zoom, chiusura, lente che non apre la pagina, pulsante "Scegli il formato".
- Su octowonders.com le modifiche si vedono dopo "Sync & Deploy".
