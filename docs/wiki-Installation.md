# Installazione

## Prerequisiti

- n8n **self-hosted** (v1.0+)
- Node.js >= 18

> I community node non sono installabili su n8n Cloud (piano gratuito/Pro). Serve un'istanza self-hosted.

---

## Metodo 1 — Interfaccia n8n (raccomandato)

Questo è il metodo più semplice, direttamente dall'UI di n8n.

1. Apri n8n e vai su **Settings → Community Nodes**
2. Clicca **Install a community node**
3. Nel campo *npm package name* inserisci:
   ```
   n8n-nodes-kitsu
   ```
4. Spunta la casella di conferma e clicca **Install**
5. n8n scarica e installa il pacchetto automaticamente — nessun riavvio necessario

Il nodo **Kitsu** apparirà subito nella palette.

---

## Metodo 2 — npm da terminale

Se gestisci n8n da riga di comando:

```bash
npm install -g n8n-nodes-kitsu
```

Oppure nella cartella dati di n8n (default `~/.n8n`):

```bash
npm install --prefix ~/.n8n n8n-nodes-kitsu
```

Poi riavvia n8n:

```bash
n8n start
```

---

## Metodo 3 — Docker

### Dockerfile

```dockerfile
FROM n8nio/n8n:latest
USER root
RUN cd /usr/local/lib/node_modules/n8n && npm install n8n-nodes-kitsu
USER node
```

### docker-compose.yml con variabile d'ambiente

```yaml
services:
  n8n:
    image: n8nio/n8n:latest
    environment:
      - N8N_CUSTOM_EXTENSIONS=/home/node/.n8n
    volumes:
      - n8n_data:/home/node/.n8n
    ports:
      - "5678:5678"

volumes:
  n8n_data:
```

Poi installa il nodo nel volume:

```bash
docker exec -it <container_name> npm install --prefix /home/node/.n8n n8n-nodes-kitsu
docker restart <container_name>
```

---

## Verifica installazione

Dopo l'installazione, apri il canvas di n8n e cerca **Kitsu** nella palette dei nodi.  
Dovresti vedere il nodo con l'icona blu **K**.

Se non compare, riavvia n8n e svuota la cache del browser.
