# Credentials

Il nodo usa **JWT authentication** — ottiene automaticamente un token di accesso ad ogni esecuzione usando email e password. Non è necessario gestire i token manualmente.

---

## Configurazione

1. In n8n vai su **Credentials → Add Credential → Kitsu API**
2. Compila i campi:

| Campo | Descrizione | Esempio |
|---|---|---|
| **Kitsu Host URL** | URL base della tua istanza Kitsu/Zou, senza slash finale | `https://kitsu.yourstudio.com` |
| **Email** | Email del tuo account Kitsu | `admin@yourstudio.com` |
| **Password** | Password del tuo account Kitsu | ••••••• |

3. Clicca **Save** — n8n testerà automaticamente la connessione chiamando `/api/auth/authenticated`

---

## Come funziona l'autenticazione

Ad ogni esecuzione del nodo:

1. Viene inviata una `POST /api/auth/login` con email e password
2. Kitsu restituisce un `access_token` JWT
3. Il token viene usato come `Authorization: Bearer <token>` per tutte le chiamate successive nella stessa esecuzione

```
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

email=admin@studio.com&password=mypassword

→ { "access_token": "eyJ0eXAiOiJKV1Q...", "login": true }
```

---

## Account consigliato

Per i workflow automatizzati, crea un account dedicato in Kitsu con ruolo **Manager** o **Admin**, separato dagli account personali degli artisti. Questo permette di:

- Tracciare le azioni automatiche nei log di Kitsu
- Revocare i permessi facilmente
- Non interferire con le sessioni utente normali

---

## Variabili d'ambiente per i workflow

I workflow di esempio usano queste **n8n Variables** (Settings → Variables):

| Variabile | Come trovarla |
|---|---|
| `KITSU_PROJECT_ID` | In Kitsu → Progetto → URL (l'UUID nell'indirizzo) oppure con il nodo **Project → Get All** |
| `KITSU_STATUS_REVIEW_ID` | Con il nodo **Task Status → Get All**, cerca lo status con `short_name = "wfa"` o simile |
| `KITSU_DEFAULT_SUPERVISOR_ID` | Con il nodo **Person → Get All**, trova l'UUID del supervisor |

---

## Note di sicurezza

- Le credenziali sono cifrate da n8n nel database interno
- Non committare mai email/password in workflow esportati — usa sempre le variabili d'ambiente o le credenziali n8n
- Su istanze condivise, limita l'accesso alle credenziali tramite i permessi di n8n
