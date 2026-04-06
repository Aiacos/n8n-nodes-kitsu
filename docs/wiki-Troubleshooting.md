# Troubleshooting

## Errori di autenticazione

### `Kitsu login failed — no access_token returned`

**Causa:** Email o password errati, oppure l'URL host non è raggiungibile.

**Soluzione:**
1. Verifica che l'URL in **Kitsu Host URL** non abbia lo slash finale (es. `https://kitsu.studio.com` ✓, `https://kitsu.studio.com/` ✗)
2. Testa le credenziali manualmente:
   ```bash
   curl -X POST https://kitsu.studio.com/api/auth/login \
     -d "email=tua@email.com&password=tuapassword"
   ```
3. Verifica che l'account abbia i permessi sufficienti (Manager o Admin per operazioni di scrittura)

---

### `401 Unauthorized` su una chiamata dopo il login

**Causa:** Il token JWT potrebbe essere scaduto o l'account non ha i permessi per quella risorsa.

**Soluzione:**
- I token Kitsu scadono dopo un certo periodo — il nodo ne ottiene uno nuovo ad ogni esecuzione, quindi questo non dovrebbe essere un problema con workflow normali
- Verifica il ruolo dell'account (un artista `user` non può creare/eliminare progetti)

---

## Errori di connessione

### `ECONNREFUSED` o `ENOTFOUND`

**Causa:** L'istanza Kitsu non è raggiungibile dall'ambiente n8n.

**Soluzione:**
1. Verifica che il server Kitsu/Zou sia in esecuzione
2. Se n8n gira in Docker, assicurati che possa raggiungere il host — potrebbe essere necessario usare l'IP della rete Docker invece di `localhost`
3. Controlla eventuali firewall o proxy

---

## Errori nelle operazioni

### `404 Not Found` su Get/Update/Delete

**Causa:** L'UUID fornito non esiste o appartiene a una risorsa diversa.

**Soluzione:**
- Usa prima `Get All` per trovare gli UUID corretti
- Verifica che stai usando l'ID del tipo di risorsa giusto (es. non usare un `shot_id` dove si aspetta un `task_id`)

---

### Il nodo restituisce un array vuoto `[]`

**Causa:** I filtri applicati non corrispondono ad alcun record, oppure l'account non ha visibilità su quel progetto.

**Soluzione:**
- Prova senza filtri per vedere se ci sono dati
- Verifica che l'account sia nel team del progetto in Kitsu (Admin → Projects → Team)

---

### `400 Bad Request` su Create/Update

**Causa:** Campi obbligatori mancanti o formato errato.

**Soluzione:**
- Verifica che i campi obbligatori siano compilati (es. `name` e `project_id` per Shot e Asset)
- Controlla che le date siano nel formato `YYYY-MM-DD`
- Controlla che gli array (es. `assignees`) siano JSON validi: `["uuid1","uuid2"]`

---

## Problemi con i workflow AI

### L'AI Agent non trova i task/shot giusti

**Causa:** Il project_id nel sistema prompt non è corretto o non è stato impostato.

**Soluzione:**
1. Imposta la variabile n8n `KITSU_PROJECT_ID` in Settings → Variables
2. In alternativa, aggiungi al chatbot il tool **Lista Progetti** — l'AI potrà chiedere i progetti disponibili prima di filtrare

---

### L'AI Agent modifica task senza conferma

**Causa:** Il sistema prompt non impone la conferma.

**Soluzione:** Aggiungi questa istruzione al system prompt dell'AI Agent:
```
Prima di eseguire qualsiasi operazione di scrittura (update, create, delete, posta commento),
mostra sempre all'utente cosa stai per fare e attendi una risposta di conferma esplicita.
```

---

## Il nodo non appare in n8n

**Causa:** Il pacchetto non è stato installato correttamente o n8n non è stato riavviato.

**Soluzione:**
1. Verifica che il percorso `N8N_CUSTOM_EXTENSIONS` sia corretto
2. Riavvia completamente n8n (non solo il workflow)
3. Controlla i log di avvio di n8n per errori di caricamento del nodo

---

## Segnalare un bug

Apri una issue su [github.com/Aiacos/n8n-nodes-kitsu/issues](https://github.com/Aiacos/n8n-nodes-kitsu/issues) includendo:
- Versione n8n
- Risorsa e operazione usata
- Messaggio di errore completo
- Payload di esempio (senza dati sensibili)
