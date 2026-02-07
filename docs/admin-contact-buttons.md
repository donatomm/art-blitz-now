# Come Aggiornare i Pulsanti di Contatto (WhatsApp + Email)

Tutti i pulsanti WhatsApp e Email del sito sono controllati da **due campi** nel pannello Admin. Modificarli aggiorna automaticamente ogni pagina.

## Procedura

1. Apri il **Pannello Admin** (icona ingranaggio, angolo in basso a destra)
2. Vai alla scheda **"Hello Bar"**
3. Scorri fino alla sezione **"Contenuto Popup"**
4. Modifica i campi:
   - **Numero WhatsApp** — formato internazionale senza `+`, es. `393666295174`
   - **Indirizzo Email** — es. `info@octowonders.com`
5. Clicca **"Salva Hello Bar"**

## Dove si propagano le modifiche

Le modifiche si applicano **istantaneamente** a:

| Pagina | Componente |
|--------|-----------|
| `/contatti` | Pulsanti contatto principali |
| `/product/*` (tutte le pagine prodotto) | Sezione "Contattami / Supporto" + link nel checkout |
| Pagina di successo checkout | Sezione "contattami qui" + Lista VIP |
| HelloBar popup (pulsante "Dettagli") | Pulsanti WhatsApp e Email nel popup |
| BuyDialog (modale acquisto rapido) | Pulsanti WhatsApp e Email |
| Qualsiasi pagina CMS con token `{{CONTACT_BUTTONS}}` | Pulsanti contatto iniettati |

## Blog

Le pagine blog **non mostrano** i pulsanti di contatto di default. Per aggiungerli, inserisci il token `{{CONTACT_BUTTONS}}` nel contenuto della pagina blog dal pannello CMS.

## Fallback

Se i campi sono vuoti o il database non è raggiungibile, i pulsanti usano i valori di fallback:
- WhatsApp: `393666295174`
- Email: `info@octowonders.com`

## Architettura tecnica

Tutti i componenti leggono i dati tramite l'hook `useStaticSiteSettings()`, che interroga la tabella `site_settings` del database con una cache di 30 secondi. Il salvataggio dall'Admin Panel invalida sia la cache admin (`site-settings`) che quella consumer (`site-settings-live`), garantendo propagazione istantanea.
