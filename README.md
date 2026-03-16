# TrendForge — Frontend Angular

Dashboard per il sistema di content creation AI automatizzato [TrendForge](../ai-influencer).

## Stack

- Angular 20 (standalone components, lazy-loaded routes)
- SCSS
- Angular HttpClient → backend FastAPI su porta 8082
- Docker (dev: porta 4200, prod: nginx porta 8080)

---

## Prerequisiti

Il backend TrendForge deve essere attivo su `http://localhost:8082`:

```bash
cd ../ai-influencer
docker compose up
# Poi al primo avvio:
docker compose exec app alembic revision --autogenerate -m "initial"
docker compose exec app alembic upgrade head
```

---

## Avvio in sviluppo

```bash
./run.sh
```

L'app è disponibile su [http://localhost:4200](http://localhost:4200).

---

## Test manuali — funzionalità per funzionalità

### 1. Dashboard (`/dashboard`)

**Cosa verificare:**
- [ ] Sidebar visibile con link Dashboard / Contenuti / Calendario
- [ ] Sezione "Trending Topics" a sinistra: lista con score colorati (verde/arancio/viola)
- [ ] Sezione "Contenuti Generati" a destra: griglia di card
- [ ] Pulsante **▶ Avvia pipeline** in alto a destra
- [ ] Toggle **Auto-publish** (ON/OFF) visibile

**Come testare il trigger pipeline:**
1. Cliccare **▶ Avvia pipeline** → il testo cambia in "⏳ In esecuzione..."
2. Attendere (la pipeline completa in ~30-120 sec a seconda delle API configurate)
3. Il testo diventa "✓ Completata"
4. Nuovi contenuti appaiono nella griglia

> Se il backend non è raggiungibile: errore visibile nel blocco Trending Topics.

---

### 2. Lista contenuti (`/content`)

**Cosa verificare:**
- [ ] Filtri per status in cima: Tutti / In revisione / Approvati / In pubblicazione / Pubblicati / Scartati
- [ ] Ogni card mostra: piattaforme, status badge, hook, script (troncato), CTA, caption, hashtag
- [ ] Se l'audio è generato: player `<audio>` nella card
- [ ] Se il video è generato: player `<video>` nella card

**Flusso approvazione:**
1. Trovare una card con status **In revisione** (giallo)
2. Cliccare **✓ Approva** → status diventa **Approvato** (verde) senza ricaricare la pagina
3. Cliccare **✗ Scarta** su un'altra → status diventa **Scartato** (rosso)

**Flusso pubblicazione:**
1. Su una card **Approvato**, cliccare **🚀 Pubblica**
2. Status diventa **In pubblicazione** (viola)
3. Dopo che il task Celery completa → status **Pubblicato** (blu)
4. Compaiono i link per piattaforma (TikTok / Instagram / YouTube)

> Senza `BUFFER_ACCESS_TOKEN` configurato, la pubblicazione usa link stub.

---

### 3. Calendario editoriale (`/calendar`)

**Cosa verificare:**
- [ ] Vista settimanale: 7 colonne (Lun-Dom) con giorno corrente evidenziato in viola
- [ ] Navigazione settimane: `‹` / `Oggi` / `›`
- [ ] Ogni giorno mostra i contenuti pianificati come chip colorati per status

**Pianificare un contenuto:**
1. Cliccare su un giorno nella griglia → si apre il pannello dettaglio sotto
2. Cliccare **✕ Rimuovi** su un contenuto già pianificato per toglierlo
3. Per aggiungere: aprire `/content`, poi usare l'API manuale (UI scheduling via modal non ancora nel flusso completo — pianificare via `PATCH /api/content/{id}/schedule`)

**Verifica visuale rapida:**
```bash
# Pianifica il contenuto ID 1 per domani
curl -X PATCH http://localhost:8082/api/content/1/schedule \
  -H "Content-Type: application/json" \
  -d '{"scheduled_for": "2026-03-17T10:00:00"}'
```
Poi ricaricare `/calendar` → il contenuto appare nella colonna del giorno corretto.

---

## Build di produzione

```bash
docker compose exec app ng build --configuration production
```

Il build viene servito da nginx sulla porta 8080.

---

## Struttura progetto

```
app/src/app/
├── core/
│   ├── models/              # trend, content, calendar, pipeline models
│   └── services/            # trends, content, pipeline, publish services
├── layout/
│   └── shell/               # sidebar di navigazione
└── features/
    ├── dashboard/
    │   ├── components/
    │   │   ├── trending-topics/  # lista top trend con score
    │   │   ├── content-list/     # griglia contenuti con filtri per status
    │   │   └── content-card/     # card con preview audio/video, approva/scarta/pubblica
    │   └── pages/
    │       ├── dashboard/        # trending + contenuti + trigger pipeline
    │       └── content/          # lista completa con filtri
    └── calendar/
        └── pages/calendar/       # vista settimanale, pianificazione contenuti
```

---

## Route

| Path | Descrizione |
|------|-------------|
| `/dashboard` | Trending topics + contenuti generati + trigger pipeline |
| `/content` | Lista completa con filtri per status |
| `/calendar` | Calendario editoriale settimanale |

---

## Variabili d'ambiente

`src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8082',
};
```

`src/environments/environment.prod.ts` per la produzione.

---

## Fasi di sviluppo

| Fase | Stato | Contenuto |
|------|-------|-----------|
| 1 | ✅ | Shell, dashboard, content-list, content-card, trending-topics |
| 2 | ✅ | Preview audio `<audio>` e video `<video>` nella card |
| 3 | ✅ | Calendario settimanale, trigger pipeline, toggle auto-publish |
| 4 | ✅ | Flusso pubblicazione via Buffer API, link per piattaforma nella card |
| 5 | ✅ | Test automatici backend (30 test, 100% pass) |
