# Node Reference

Riferimento completo di tutte le risorse e operazioni disponibili nel nodo Kitsu.

---

## Project

Endpoint base: `/api/data/projects`

| Operazione | Metodo | Descrizione |
|---|---|---|
| Get All | GET | Restituisce tutti i progetti |
| Get | GET | Restituisce un progetto per UUID |
| Create | POST | Crea un nuovo progetto |
| Update | PUT | Aggiorna un progetto esistente |
| Delete | DELETE | Elimina un progetto |

**Campi (Create/Update):**

| Campo | Tipo | Descrizione |
|---|---|---|
| Name | string | Nome del progetto |
| Production Type | enum | `short` / `featurefilm` / `tvshow` |
| Description | string | Descrizione libera |
| Start Date | string | Formato `YYYY-MM-DD` |
| End Date | string | Formato `YYYY-MM-DD` |

---

## Shot

Endpoint base: `/api/data/shots`

| Operazione | Metodo | Descrizione |
|---|---|---|
| Get All | GET | Tutti gli shot (filtrabile per `project_id`) |
| Get | GET | Shot per UUID |
| Create | POST | Crea uno shot |
| Update | PUT | Aggiorna uno shot |
| Delete | DELETE | Elimina uno shot |

**Campi (Create/Update):**

| Campo | Tipo | Descrizione |
|---|---|---|
| Name | string | Nome dello shot (es. `SH010`) |
| Project ID | string | UUID del progetto |
| Sequence ID | string | UUID della sequenza padre |
| Frame In | number | Frame di inizio |
| Frame Out | number | Frame di fine |
| FPS | number | Frequenza fotogrammi |
| Description | string | Note descrittive |

---

## Asset

Endpoint base: `/api/data/entities`

| Operazione | Metodo | Descrizione |
|---|---|---|
| Get All | GET | Tutti gli asset (filtrabile per `project_id`) |
| Get | GET | Asset per UUID |
| Create | POST | Crea un asset |
| Update | PUT | Aggiorna un asset |
| Delete | DELETE | Elimina un asset |

**Campi (Create/Update):**

| Campo | Tipo | Descrizione |
|---|---|---|
| Name | string | Nome dell'asset |
| Project ID | string | UUID del progetto |
| Asset Type ID | string | UUID del tipo asset (Character, Prop, ecc.) |
| Description | string | Note descrittive |

---

## Task

Endpoint base: `/api/data/tasks`

| Operazione | Metodo | Descrizione |
|---|---|---|
| Get All | GET | Tutti i task (filtrabile per `project_id`, `task_status_id`, `task_type_id`, `assignee_id`) |
| Get | GET | Task per UUID |
| Create | POST | Crea un task |
| Update | PUT | Aggiorna un task |
| Delete | DELETE | Elimina un task |

**Campi (Create/Update):**

| Campo | Tipo | Descrizione |
|---|---|---|
| Name | string | Nome del task |
| Entity ID | string | UUID dello shot o asset collegato |
| Task Type ID | string | UUID del tipo (Animation, Lighting, ecc.) |
| Task Status ID | string | UUID dello stato |
| Project ID | string | UUID del progetto |
| Assignee IDs | JSON array | Es. `["uuid1","uuid2"]` |
| Due Date | string | Formato `YYYY-MM-DD` |
| Start Date | string | Formato `YYYY-MM-DD` |
| Priority | number | `0`=normale, `1`=alta, `2`=molto alta, `3`=urgente |
| Estimate | number | Stima in giorni |

---

## Comment

Endpoint base: `/api/data/comments` / `/api/actions/tasks/{id}/comment`

| Operazione | Metodo | Descrizione |
|---|---|---|
| Get All for Task | GET | Tutti i commenti di un task specifico |
| Create | POST | Posta un commento su un task (può anche cambiare stato) |
| Update | PUT | Modifica il testo di un commento |
| Delete | DELETE | Elimina un commento |

**Campi Create:**

| Campo | Tipo | Descrizione |
|---|---|---|
| Task ID | string | UUID del task |
| Comment Text | string | Testo del commento |
| Task Status ID | string | (opzionale) Cambia lo stato del task con questo commento |

---

## Sequence

Endpoint base: `/api/data/sequences`

| Operazione | Descrizione |
|---|---|
| Get All | Tutte le sequenze (filtrabile per `project_id`) |
| Get | Sequenza per UUID |
| Create | Crea una sequenza |
| Update | Aggiorna una sequenza |
| Delete | Elimina una sequenza |

---

## Episode

Endpoint base: `/api/data/episodes`

| Operazione | Descrizione |
|---|---|
| Get All | Tutti gli episodi (filtrabile per `project_id`) |
| Get | Episodio per UUID |
| Create | Crea un episodio |
| Update | Aggiorna un episodio |
| Delete | Elimina un episodio |

---

## Person

Endpoint base: `/api/data/persons`

| Operazione | Descrizione |
|---|---|
| Get All | Tutte le persone |
| Get | Persona per UUID |
| Create | Crea un account |
| Update | Aggiorna un account |
| Delete | Elimina un account |

**Ruoli disponibili:** `admin`, `manager`, `supervisor`, `user`, `client`, `vendor`

---

## Task Status / Task Type

Endpoint base: `/api/data/task-status` / `/api/data/task-types`

Entrambe supportano le operazioni CRUD standard.

---

## Preview File

Endpoint base: `/api/data/preview-files`

| Operazione | Descrizione |
|---|---|
| Get All for Task | Tutti i preview di un task specifico |
| Get | Preview per UUID |

---

## Custom Action

Permette di chiamare **qualsiasi endpoint Zou** non coperto dalle operazioni predefinite.

| Campo | Descrizione |
|---|---|
| HTTP Method | GET / POST / PUT / PATCH / DELETE |
| Endpoint Path | Path relativo a `/api`, es. `/data/projects/{id}/team` |
| Query String | JSON object con parametri query, es. `{"page": 1}` |
| Request Body | JSON body per POST/PUT/PATCH |

**Esempi di endpoint utili:**

```
GET  /data/projects/{id}/sequences
GET  /data/shots/{id}/tasks
GET  /data/assets/{id}/casting
POST /actions/tasks/{id}/set-main-preview
GET  /data/projects/{id}/news
GET  /export/projects/all
```

Consulta la [documentazione ufficiale](https://api-docs.kitsu.cloud) per la lista completa.

---

## Filtri (Get All)

Tutte le risorse con `Get All` accettano questi filtri opzionali:

| Filtro | Applicabile a |
|---|---|
| `project_id` | Shot, Asset, Task, Sequence, Episode |
| `task_type_id` | Task |
| `task_status_id` | Task |
| `assignee_id` | Task |
| `page` | Tutti |
| `limit` | Tutti (default 100) |
