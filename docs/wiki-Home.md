# n8n-nodes-kitsu — Wiki

Benvenuto nella documentazione completa del nodo n8n per **Kitsu / CGWire**.

## Indice

| Pagina | Descrizione |
|---|---|
| [Installation](./Installation) | Come installare il nodo su n8n self-hosted o Docker |
| [Credentials](./Credentials) | Configurazione delle credenziali Kitsu API |
| [Node-Reference](./Node-Reference) | Riferimento completo di tutte le risorse e operazioni |
| [Examples](./Examples) | Workflow di esempio con AI integration |
| [Custom-Action](./Custom-Action) | Come usare la risorsa Custom Action per chiamate raw |
| [Troubleshooting](./Troubleshooting) | Problemi comuni e soluzioni |

---

## Cos'è Kitsu?

[Kitsu](https://kitsu.cg-wire.com) è la piattaforma open-source di **CGWire** per la gestione della produzione animation e VFX. Permette a studi e freelancer di tracciare task, revision, asset, shot e team in un unico sistema, esponendo tutto tramite una REST API chiamata **Zou**.

## Cos'è questo nodo?

`n8n-nodes-kitsu` è un **community node** per [n8n](https://n8n.io) che wrappa l'intera API Zou con operazioni native n8n, permettendoti di:

- **Automatizzare** task update, assegnazioni, notifiche
- **Integrare l'AI** per analisi commenti, supervisione review, chatbot di produzione
- **Collegare Kitsu** ad altri sistemi (Slack, email, Google Sheets, ecc.)
- **Eseguire qualsiasi chiamata** REST all'API Zou via Custom Action

---

> **Versione API**: Kitsu / Zou — [api-docs.kitsu.cloud](https://api-docs.kitsu.cloud)  
> **Licenza**: MIT  
> **Repository**: [github.com/Aiacos/n8n-nodes-kitsu](https://github.com/Aiacos/n8n-nodes-kitsu)
