---
title: Lucía, Corporate AI Assistant Integrated with Legacy ERP
summary: Enterprise AI agent embedded in Microsoft Teams that answers questions across internal documentation using semantic search and queries the corporate ERP in real time via a custom MCP server.
organizacion: Cucalón Estévez y Asociados
rol: End-to-end architecture and software development
inicio: 2025-06
fin: 2026-08
parte_de: experiencia/visados-empresas
tecnologias: [n8n, llm, agentes-ia, mcp, postgresql, pgvector, ollama, microsoft-365, api-rest]
visibilidad: public
destacado: true
---

## Context

The daily information required by international mobility consultants is split between static internal documentation—service catalogs, operational checklists, country-specific visa protocols—and the operational ERP database, where live project progress and client accounts reside. Finding answers across either domain traditionally meant digging across fragmented tools or interrupting colleagues.

The agent was named Lucía, a play on "Luc-IA" (IA being Spanish for AI).

## Technical Decisions

**Two distinct knowledge channels, not one.** An AI agent relying solely on document retrieval answers questions like "how is a skilled worker visa processed?" effectively, but is completely blind to "has client X's file been invoiced yet?". Lucía bridges both: a private knowledge base powered by semantic vector search on PostgreSQL with pgvector, combined with a bespoke Model Context Protocol (MCP) server directly querying the ERP for live transactional client and project statuses.

This allowed consultants to ask natural language questions in Microsoft Teams such as whether an invoice had been issued, which documents a client had uploaded, what services were contracted, what milestone tasks were pending, or what specific actions a team member had logged.

**Locally computed embeddings.** I deployed a quantized local embedding model via Ollama directly on the company's internal server to vectorize internal documentation. The rationale was twofold, and neither was purely technical: proprietary client data never left the corporate perimeter, and reindexing documents incurred zero API costs. Generation of final answers was delegated to frontier cloud LLMs, where generative reasoning power truly matters.

**Meeting users where they already work.** The user interface was Microsoft Teams, which the entire company used continuously, integrated via an Azure Bot Framework endpoint. A standalone desktop or web application is an assistant that employees rarely remember to open.

## Architecture

Teams transmits the incoming user message to the Azure Bot gateway, which forwards it to n8n as the central orchestrator. The AI processing node evaluates user intent: retrieving relevant semantic context from the PostgreSQL vector store or invoking structured ERP query tools over the custom MCP server. Knowledge base document ingestion and re-vectorization are handled by dedicated automated workflows.

## Experimental Prototypes

Building on this foundation, I tested self-hosted multi-agent architectures to push the concept further, creating a personal multi-agent assistant accessed daily via WhatsApp: one sub-agent transcribed meeting notes directly into an Obsidian Markdown vault synchronized with my mobile device, another queried and dispatched emails through Microsoft 365, and a third generated lightweight web utilities on demand and published them into isolated Docker containers.

The first two agents performed reliably in daily operation; the third deployed containers correctly but struggled with output consistency. The ambition was bringing these capabilities to Lucía for all staff, and the initiative concluded in experimental testing.
