# Examples

Tre workflow pronti da importare in n8n, disponibili nella cartella [`examples/`](https://github.com/Aiacos/n8n-nodes-kitsu/tree/main/examples) del repository.

Per importare: **n8n → Workflows → ⋮ → Import from file**

---

## Workflow 1 — AI analizza commenti

**File:** `workflow-1-ai-comment-analysis.json`

### Cosa fa

1. Prende tutti i task di un progetto
2. Per ogni task legge i commenti
3. Manda i commenti a GPT-4o con un prompt da supervisore VFX
4. Posta il riepilogo AI direttamente come nuovo commento nel task

### Flusso

```
[Trigger manuale]
       ↓
[Kitsu: Task → Get All]  (project_id = $vars.KITSU_PROJECT_ID)
       ↓
[Split in Batches]
       ↓
[Kitsu: Comment → Get All for Task]
       ↓
[Aggregate]
       ↓
[GPT-4o — prompt supervisore]
       ↓
[Kitsu: Comment → Create]  (posta riepilogo nel task)
```

### Configurazione richiesta

- Variabile n8n `KITSU_PROJECT_ID`
- Credenziali Kitsu API
- Credenziali OpenAI API

### Prompt AI usato

> "Sei un supervisore di produzione VFX/animation. Analizza i commenti di revisione di un task e produci: 1. Un riassunto conciso dei problemi aperti. 2. Le priorità di intervento. 3. Eventuali blockers."

---

## Workflow 2 — AI supervisore task in Review

**File:** `workflow-2-ai-task-supervisor.json`

### Cosa fa

Ogni 4 ore, un AI Agent analizza tutti i task in stato "Review" e interviene autonomamente:

- **Due date scaduta** → alza la priorità a urgente (3)
- **Nessun assignee** → assegna il supervisor di default
- **In Review da +7 giorni** → posta un commento di sollecito

### Flusso

```
[Schedule: ogni 4 ore]
       ↓
[Kitsu: Task → Get All]  (status = Review)
       ↓
[Aggregate]
       ↓
[AI Agent (GPT-4o)]
   Tool A: Aggiorna Task  →  [Kitsu: Task → Update]
   Tool B: Posta Commento →  [Kitsu: Comment → Create]
       ↓
[Log output AI]
```

### Configurazione richiesta

- Variabile n8n `KITSU_PROJECT_ID`
- Variabile n8n `KITSU_STATUS_REVIEW_ID`
- Variabile n8n `KITSU_DEFAULT_SUPERVISOR_ID`
- Credenziali Kitsu API
- Credenziali OpenAI API

### Personalizzazione

Modifica il prompt nell'AI Agent per cambiare le regole di supervisione. Puoi aggiungere tool aggiuntivi (es. invio email via Gmail, notifica Slack) collegandoli all'agente.

---

## Workflow 3 — Chatbot produzione VFX

**File:** `workflow-3-chatbot-production.json`

### Cosa fa

Un chatbot in linguaggio naturale con accesso completo a Kitsu come strumenti. L'AI Agent decide autonomamente quali API chiamare in base alla domanda dell'utente.

### Flusso

```
[Chat Trigger]
       ↓
[AI Agent (GPT-4o) + Memoria conversazione]
   Tool: Cerca Task
   Tool: Cerca Shot
   Tool: Cerca Asset
   Tool: Leggi Commenti Task
   Tool: Aggiorna Task
   Tool: Posta Commento
   Tool: Cerca Persone
   Tool: Lista Progetti
```

### Esempi di domande

```
"Quali shot sono ancora in WIP nel progetto Alpha?"
"Chi ha task in Review scaduti questa settimana?"
"Mostrami tutti i commenti del task abc-123"
"Assegna il task xyz a Mario Rossi e metti priorità urgente"
"Quanti task ha ancora aperte la sequenza SQ020?"
"Crea un task di Lighting per lo shot SH050"
```

### Configurazione richiesta

- Credenziali Kitsu API
- Credenziali OpenAI API
- (opzionale) Variabile `KITSU_PROJECT_ID` come default

### Comportamento sicuro

Il sistema prompt impone all'AI di **chiedere conferma** prima di qualsiasi operazione di scrittura (update, create, delete). Modifica il prompt per cambiare questo comportamento.

---

## Aggiungere altri tool al chatbot

Puoi estendere il Workflow 3 collegando altri nodi come tool dell'AI Agent:

- **Slack** → invia notifiche quando cambia uno stato
- **Gmail** → manda report settimanali ai supervisori
- **Google Sheets** → esporta dati di produzione in un foglio
- **HTTP Request** → chiama webhook di altri sistemi pipeline

In n8n, trascina qualsiasi nodo nell'area "Tools" dell'AI Agent per aggiungerlo come strumento disponibile.
