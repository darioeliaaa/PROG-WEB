# Deploy di MoneyMind — guida passo passo

Una cosa da chiarire prima di partire: **Vercel da solo non basta**.
Vercel è pensato per frontend e funzioni serverless (Node, Python...), non
fa girare un backend Java/Spring Boot che deve restare acceso e parlare con
un database. Ti serve lo stesso schema che hai già usato per Ohimà Che
Pizza, che infatti gira già così in produzione:

```
Vercel (frontend Angular)  →  Render (backend Spring Boot)  →  Neon (PostgreSQL)
```

Le ho preparate tutte e tre nel codice — quello che segue è solo la parte
che va fatta dai pannelli web dei tre servizi (serve il tuo account, non
posso farlo io).

## Cosa ho già sistemato nel codice

- **Frontend**: creato `environments/environment.ts` (dev) ed
  `environment.prod.ts` (produzione) — tutte le chiamate API prima
  puntavano a `localhost:8080` scritto a mano in 7 file diversi, ora
  passano tutte da lì
- **Backend**: `application.properties` ora legge porta, URL del database e
  origini CORS da variabili d'ambiente invece di averle fisse — in locale
  continua a funzionare esattamente come prima, senza che tu debba
  impostare nulla
- **Backend**: aggiunto un `Dockerfile` (stesso schema di quello di Ohimà
  Che Pizza, adattato a Gradle) — è quello che Render userà per compilare
  e avviare l'app
- Ho verificato che sia il backend (`./gradlew compileJava`) sia il
  frontend compilino senza errori con questi cambi

---

## 1. Database — Neon (gratis)

1. Vai su [neon.tech](https://neon.tech) → crea un account → **New Project**
2. Dai un nome al progetto (es. `moneymind`), scegli una regione europea
3. Neon ti mostra subito una **connection string** tipo:
   ```
   postgresql://utente:password@ep-xxxx.eu-central-1.aws.neon.tech/moneymind?sslmode=require
   ```
4. Da questa stringa ti servono, separati, per il passo successivo:
   - l'host+db → diventa il tuo `DB_URL` in formato JDBC:
     `jdbc:postgresql://ep-xxxx.eu-central-1.aws.neon.tech/moneymind?sslmode=require`
   - l'utente → `DB_USERNAME`
   - la password → `DB_PASSWORD`

## 2. Backend — Render

1. Vai su [render.com](https://render.com) → **New** → **Web Service**
2. Collega il repository `PROG-WEB` su GitHub
3. **Root Directory**: `backend` (il Dockerfile sta lì, non nella radice del repo)
4. **Runtime**: Docker (Render lo rileva da solo trovando il Dockerfile)
5. **Instance Type**: Free va benissimo per una demo
6. Prima di confermare, apri **Environment** e aggiungi queste variabili:

   | Nome | Valore |
   |---|---|
   | `DB_URL` | la stringa JDBC di Neon del passo 1 |
   | `DB_USERNAME` | utente Neon |
   | `DB_PASSWORD` | password Neon |
   | `FINNHUB_API_KEY` | la tua chiave Finnhub **nuova** (rigenerala, quella vecchia è compromessa) |
   | `NEWS_API_KEY` | la tua chiave NewsAPI **nuova** (stesso motivo) |
   | `CORS_ALLOWED_ORIGINS` | per ora lascia `http://localhost:4200`, la aggiorni al passo 4 |

7. **Create Web Service** — la prima build richiede qualche minuto
   (Render compila l'immagine Docker da zero)
8. A build finita, Render ti dà un URL tipo
   `https://moneymind-backend.onrender.com` — salvalo, ti serve subito dopo

> ⚠️ Il piano gratuito di Render "addormenta" il servizio dopo un po' di
> inattività: la prima richiesta dopo una pausa lunga può metterci
> 30-60 secondi a rispondere mentre si risveglia. Normale, non è un bug —
> se fai una demo dal vivo, apri il link un minuto prima.

## 3. Frontend — Vercel

1. Prima, in locale, apri
   `frontend/src/environments/environment.prod.ts` e sostituisci il
   placeholder con l'URL Render vero del passo 2:
   ```ts
   export const environment = {
     production: true,
     apiUrl: 'https://moneymind-backend.onrender.com',
   };
   ```
2. Commit e push di questa modifica
3. Vai su [vercel.com](https://vercel.com) → **Add New** → **Project** →
   importa `PROG-WEB`
4. **Root Directory**: `frontend`
5. Framework Preset: Vercel riconosce Angular da solo (Build Command
   `ng build`, Output Directory `dist/frontend/browser` — se non lo indovina
   da solo, impostalo tu così)
6. **Deploy** — in un paio di minuti hai l'URL, tipo
   `https://moneymind-tuonome.vercel.app`

## 4. L'ultimo collegamento — CORS

Il backend per ora accetta richieste solo da `localhost:4200`. Con l'URL
Vercel del passo 3 in mano:

1. Torna su Render → il tuo servizio → **Environment**
2. Modifica `CORS_ALLOWED_ORIGINS` in:
   ```
   http://localhost:4200,https://moneymind-tuonome.vercel.app
   ```
3. Salva — Render fa da solo un redeploy automatico con la nuova variabile

Fatto. Apri l'URL Vercel: dovrebbe parlare con il backend su Render, che
parla con il database su Neon.

---

## Come verificare che funzioni davvero

1. Apri l'URL Vercel, prova a registrare un utente — se va a buon fine, la
   catena Vercel → Render → Neon funziona
2. Se vedi errori nella console del browser (F12):
   - **CORS error** → hai sbagliato/dimenticato il passo 4
   - **Richiesta che non parte proprio, dominio sbagliato** →
     `environment.prod.ts` non ha l'URL giusto, o non hai fatto push/redeploy
   - **500 dal backend** → controlla i log su Render (tab "Logs"), quasi
     sempre è una variabile d'ambiente sbagliata o mancante

## Quando aggiorni il codice più avanti

- Push su `main` del backend → Render fa redeploy da solo
- Push su `main` del frontend → Vercel fa redeploy da solo

Nessuna delle due piattaforme richiede altro dopo il primo setup.
