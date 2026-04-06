# Installation

## Prerequisiti

- n8n **self-hosted** (v1.0+) — i community node non verificati non sono disponibili su n8n Cloud
- Node.js >= 18

---

## Metodo 1 — npm (raccomandato)

```bash
# Installa nella cartella custom extensions di n8n (default: ~/.n8n)
npm install --prefix ~/.n8n n8n-nodes-kitsu

# Riavvia n8n
n8n start
```

Il nodo apparirà nella palette come **Kitsu**.

---

## Metodo 2 — Docker

### Dockerfile

```dockerfile
FROM n8nio/n8n:latest
ENV N8N_CUSTOM_EXTENSIONS=/home/node/.n8n
USER root
RUN npm install --prefix /home/node/.n8n n8n-nodes-kitsu
USER node
```

### docker-compose.yml

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

---

## Metodo 3 — Installazione da sorgente

```bash
git clone https://github.com/Aiacos/n8n-nodes-kitsu.git
cd n8n-nodes-kitsu
npm install
npm run build
```

Poi copia la cartella `dist/` nella tua directory custom extensions e imposta la variabile d'ambiente:

```bash
export N8N_CUSTOM_EXTENSIONS=/path/to/n8n-nodes-kitsu
n8n start
```

---

## Metodo 4 — GUI n8n (solo nodi verificati)

1. Vai su **Settings → Community Nodes**
2. Clicca **Install**
3. Inserisci `n8n-nodes-kitsu`
4. Conferma

> Nota: questo metodo è disponibile solo se il pacchetto è stato verificato e pubblicato su npm.

---

## Verifica installazione

Dopo il riavvio di n8n, cerca **Kitsu** nella palette dei nodi. Dovresti vedere il nodo con l'icona blu **K**.
