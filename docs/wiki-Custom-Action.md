# Custom Action

La risorsa **Custom Action** è un "escape hatch" che ti permette di chiamare qualsiasi endpoint Zou non coperto dalle operazioni predefinite del nodo.

---

## Configurazione

Seleziona:
- **Resource** → `Custom Action`
- **Operation** → `Execute`

Poi compila:

| Campo | Descrizione |
|---|---|
| **HTTP Method** | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |
| **Endpoint Path** | Path relativo a `/api`, inizia sempre con `/` |
| **Query String Parameters** | JSON object, es. `{"page": 2, "limit": 50}` |
| **Request Body (JSON)** | Solo per POST/PUT/PATCH |

---

## Esempi pratici

### Ottenere il casting di un asset

```
Method:   GET
Path:     /data/assets/{{$json.id}}/casting
```

### Impostare il main preview di un task

```
Method:   POST
Path:     /actions/tasks/{{$json.task_id}}/set-main-preview
Body:     { "preview_file_id": "uuid-del-preview" }
```

### Ottenere tutte le news di un progetto

```
Method:   GET
Path:     /data/projects/{{$vars.KITSU_PROJECT_ID}}/news
QS:       { "page": 1, "limit": 100 }
```

### Esportare dati produzione in CSV

```
Method:   GET
Path:     /export/projects/all
```

### Aggiungere una persona al team di un progetto

```
Method:   POST
Path:     /data/projects/{{$json.project_id}}/team
Body:     { "person_id": "uuid-persona" }
```

### Ottenere le statistiche di un progetto

```
Method:   GET
Path:     /data/projects/{{$json.project_id}}/sequences/stats
```

### Ottenere tutti i task di uno shot

```
Method:   GET
Path:     /data/shots/{{$json.shot_id}}/tasks
```

---

## Combinare Custom Action con altri nodi

Il Custom Action si usa spesso **dopo** un nodo standard che recupera un ID:

```
[Kitsu: Shot → Get All]
       ↓           (id dello shot in $json.id)
[Kitsu: Custom Action]
  Path: /data/shots/{{ $json.id }}/tasks
  Method: GET
```

---

## Riferimento API completo

La documentazione ufficiale di tutti gli endpoint è disponibile su:

- **Specifica interattiva**: [api-docs.kitsu.cloud](https://api-docs.kitsu.cloud)
- **Documentazione Zou**: [zou.cg-wire.com](https://zou.cg-wire.com)

---

## Paginazione

Per risultati paginati, aggiungi nei Query String Parameters:

```json
{
  "page": 1,
  "limit": 100
}
```

Usa un nodo **Loop** in n8n per iterare le pagine finché la risposta restituisce meno di `limit` elementi.
