# 💰 MoneyMind — Personal Finance & Investment Platform

Ecosistema full-stack per la gestione del denaro: budget personale, wallet
condivisi tra più utenti e simulatore di trading su azioni, ETF e
criptovalute con quotazioni reali.

---

## Indice

1. [Funzionalità](#funzionalità)
2. [Tech Stack](#tech-stack)
3. [Architettura](#architettura)
4. [Struttura del Progetto](#struttura-del-progetto)
5. [Prerequisiti](#prerequisiti)
6. [Installazione e Avvio](#installazione-e-avvio)
7. [Variabili d'Ambiente](#variabili-dambiente)
8. [API Endpoints](#api-endpoints)
9. [Dietro le Quinte](#dietro-le-quinte)
10. [Autore](#autore)

---

## Funzionalità

### Budget & Wallet

| Funzionalità | Descrizione |
|---|---|
| **Wallet personali e condivisi** | Ogni utente può creare un wallet o unirsi a uno condiviso tramite codice di invito |
| **Gestione membri** | Il proprietario del wallet può rimuovere membri o cambiarne lo stato |
| **Budget e limiti di spesa** | Impostazione di limiti di spesa e deposito minimo sul wallet |
| **Movimenti** | Tracciamento di entrate e uscite, storico transazioni recenti per wallet e per utente |
| **Dashboard** | Riepilogo investimenti, andamento annuale, panoramica del budget — sia a livello personale che di wallet condiviso |

### Mercati & Investimenti

| Funzionalità | Descrizione |
|---|---|
| **Quotazioni in tempo reale** | Dati di mercato live per azioni, ETF e crypto (API Finnhub) |
| **Compravendita simulata** | Acquisto/vendita di asset con calcolo del prezzo medio di carico (PMC) |
| **Portafoglio personale** | Vista sul controvalore attuale e sulla performance degli investimenti |
| **News finanziarie** | Ultime notizie di mercato (NewsAPI), aggiornate in background |
| **Grafici** | Visualizzazione storico prezzi e andamento del portafoglio (Chart.js) |

### Account

- Registrazione e login
- Modifica profilo e reset password
- Impostazioni utente personalizzabili

---

## Tech Stack

| Layer | Tecnologia | Versione |
|-------|-----------|----------|
| **Backend** | Spring Boot | 3.4.1 |
| **Linguaggio** | Java | 21 |
| **Build tool** | Gradle | — |
| **Database** | PostgreSQL | — |
| **ORM** | Spring Data JPA / Hibernate | — |
| **Sicurezza** | Spring Security | — |
| **Cache** | Spring Cache (`@Scheduled` + `@Cacheable`) | — |
| **Utility** | Lombok | — |
| **Frontend** | Angular | 20 |
| **Grafici** | Chart.js + ng2-charts | 4 / 8 |
| **Reactive** | RxJS | 7.8 |
| **API esterne** | Finnhub (quotazioni), NewsAPI (notizie) | — |

---

## Architettura

```
┌─────────────────────────────┐
│         FRONTEND            │
│      Angular 20 (SPA)       │
│   dashboard · wallet · market│
└──────────────┬──────────────┘
               │ REST / JSON
┌──────────────▼──────────────┐
│          BACKEND             │
│    Spring Boot 3 (Java 21)   │
│ controller → service → repo  │
├───────────────────────────────┤
│ NewsCacheScheduler (@Scheduled)│
│  aggiorna in background la    │
│  cache di quotazioni e news   │
│  per restare sotto i rate     │
│  limit delle API esterne      │
└──────────────┬───────────────┘
               │ Spring Data JPA
┌──────────────▼──────────────┐
│         PostgreSQL            │
│ users · wallets · transactions│
│ investments · portfolios      │
│ market_assets                 │
└───────────────────────────────┘
```

Backend organizzato a livelli classici: `controller` (endpoint REST) →
`service` (logica di business) → `repository` (persistenza) → `entity`
(modello dati), con `dto` dedicati per non esporre mai le entity JPA
direttamente sulle API.

---

## Struttura del Progetto

```
PROG-WEB/
├── backend/
│   ├── src/main/java/com/example/backend/
│   │   ├── controller/     # Endpoint REST
│   │   ├── service/        # Logica di business
│   │   ├── repository/     # Spring Data JPA
│   │   ├── entity/         # Modello dati (User, Wallet, Investment, ...)
│   │   ├── dto/             # Data Transfer Object
│   │   ├── proxy/           # Client verso servizi esterni
│   │   ├── scheduler/       # Job schedulati (cache news/quotazioni)
│   │   └── config/          # Security, seed dati iniziali
│   └── build.gradle
└── frontend/
    └── src/app/
        ├── features/
        │   ├── auth/                # Login
        │   ├── dashboard/            # Riepilogo personale
        │   ├── DashboardWallet/      # Riepilogo wallet condiviso
        │   ├── Wallet/ GestioneWallet/
        │   ├── movimenti/            # Storico transazioni
        │   ├── portfolio/            # Investimenti
        │   ├── market/               # Quotazioni e grafici
        │   ├── Profilo/ settings/
        │   └── chi-siamo/
        └── shared/                   # Header, sidebar, componenti comuni
```

---

## Prerequisiti

| Cosa | Note |
|---|---|
| **JDK 21** | Il backend usa il toolchain Java 21 |
| **Node.js 18+** | Per il frontend Angular |
| **PostgreSQL** | Database vuoto chiamato `moneymind` |
| **Chiavi API** | Account gratuiti su [Finnhub](https://finnhub.io/) e [NewsAPI](https://newsapi.org/) |

---

## Installazione e Avvio

### 1. Database

```sql
CREATE DATABASE moneymind;
```

Hibernate crea automaticamente le tabelle al primo avvio
(`spring.jpa.hibernate.ddl-auto=update`); i dati di mercato di base (azioni,
ETF, crypto) vengono popolati da `DataInitializer.java`.

### 2. Variabili d'ambiente

Vedi la sezione dedicata qui sotto — servono prima di avviare il backend.

### 3. Backend

```bash
cd backend
./gradlew bootRun
```

Parte su `http://localhost:8080`.

### 4. Frontend

```bash
cd frontend
npm install
npm start
```

Apri [http://localhost:4200](http://localhost:4200).

---

## Variabili d'Ambiente

Il backend legge queste variabili dall'ambiente (mai da valori scritti nel
codice): impostale nel tuo terminale, nella configurazione di run
dell'IDE, o come variabili d'ambiente del sistema prima di avviare
`bootRun`.

| Variabile | Serve per |
|---|---|
| `DB_USERNAME` | Utente PostgreSQL |
| `DB_PASSWORD` | Password PostgreSQL |
| `FINNHUB_API_KEY` | Quotazioni di mercato in tempo reale — [ottienila qui](https://finnhub.io/register) (piano gratuito) |
| `NEWS_API_KEY` | Notizie finanziarie — [ottienila qui](https://newsapi.org/register) (piano gratuito) |

```bash
# esempio, macOS/Linux
export DB_USERNAME=postgres
export DB_PASSWORD=la-tua-password
export FINNHUB_API_KEY=la-tua-chiave-finnhub
export NEWS_API_KEY=la-tua-chiave-newsapi
```

> ⚠️ Se stai clonando questo repository e trovavi in precedenza delle chiavi
> API scritte direttamente in `application.properties`: erano di test, sono
> state rimosse e vanno considerate compromesse. Usa sempre le tue, tramite
> variabili d'ambiente come sopra — mai committate nel codice.

---

## API Endpoints

| Metodo | Endpoint | Descrizione |
|---|---|---|
| `POST` | `/api/users/register` | Registrazione nuovo utente |
| `POST` | `/api/users/login` | Login |
| `GET` | `/api/users/{id}` | Dettaglio utente |
| `PUT` | `/api/users/{id}/update` | Aggiorna profilo |
| `POST` | `/api/users/reset-password` | Reset password |
| `GET` | `/api/wallets/user/{userId}` | Wallet di un utente |
| `POST` | `/api/wallets/user/{userId}/create` | Crea un wallet |
| `POST` | `/api/wallets/join-by-code` | Unisciti a un wallet condiviso |
| `PUT` | `/api/wallets/{walletId}/budget` | Aggiorna limiti di budget |
| `DELETE` | `/api/wallets/{walletId}/remove-member/{memberId}` | Rimuovi un membro |
| `GET` | `/api/transactions/wallet/{walletId}` | Transazioni di un wallet |
| `POST` | `/api/transactions/user/{userId}/wallet/{walletId}` | Registra un movimento |
| `GET` | `/api/portfolio/{userId}` | Panoramica portafoglio |
| `POST` | `/api/investments/trade` | Esegui una compravendita simulata |
| `GET` | `/api/market/overview` | Quotazioni di mercato |
| `GET` | `/api/market/history/{symbol}` | Storico prezzi di un asset |
| `GET` | `/api/news` | Ultime notizie finanziarie |

---

## Dietro le Quinte

**Integrità transazionale.** Spostare denaro verso un wallet condiviso
richiede precisione assoluta: le operazioni che toccano saldo e portafoglio
sono transazionali (`@Transactional`) — o si aggiornano entrambi i lati
dell'operazione, o non si aggiorna niente.

**Caching & rate limit.** Le API di mercato gratuite concedono pochissime
chiamate al minuto. `NewsCacheScheduler` aggiorna quotazioni e notizie in
background a intervalli regolari invece che a ogni richiesta dell'utente:
l'app resta reattiva anche con più utenti collegati, senza sbattere contro
i limiti di Finnhub o NewsAPI.

> Nota: la configurazione di sicurezza attuale (`SecurityConfig`) lascia le
> API aperte (`permitAll`) — scelta deliberata per lo sviluppo e la demo
> locale del progetto universitario, da irrigidire con autenticazione reale
> sulle rotte prima di qualsiasi deploy pubblico con dati veri.

---

## Autore

**Dario Elia** — [github.com/darioeliaaa](https://github.com/darioeliaaa) · [darioelia.it](https://www.darioelia.it)
