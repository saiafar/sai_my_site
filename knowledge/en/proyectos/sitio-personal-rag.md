---
title: Professional Assistant with RAG on PostgreSQL
summary: Personal website featuring an AI assistant answering questions about my career using semantic search over a private knowledge base.
inicio: 2026-09
tecnologias: [postgresql, pgvector, nextjs, typescript, docker, gemini, onnx]
rol: Complete design and development
visibilidad: public
---

## Context

A static PDF resume forces the reader to hunt for answers to their real questions, which are rarely "what degrees do you have?" but rather "have you solved a problem like mine before?". I wanted a website where that question could be asked directly and answered using verifiable details from my career, rather than what a general AI model might improvise about me.

## Technical Decisions

**PostgreSQL with pgvector instead of a dedicated vector database.** The corpus comprises a few thousand chunks. At this scale, a specialized vector engine adds negligible performance benefits while introducing another system to deploy, back up, and synchronize with relational data. With pgvector, embeddings and relational metadata reside in the same transaction and can be queried with a single JOIN.

**Hybrid search instead of purely vector search.** Semantic search often struggles with proper nouns: "PostgreSQL", "Postgres", and "pgvector" occupy very close positions in embedding space, so questions targeting a specific tool can retrieve chunks discussing neighboring technologies. PostgreSQL's full-text search index excels precisely here. Both rankings are combined using Reciprocal Rank Fusion (RRF), ranking by position rather than score, avoiding the need to normalize incompatible metrics.

**Local embeddings, cloud generation.** The server is an Intel Core i3 mini PC with 8 GB of RAM. While a generative LLM cannot run there, a quantized multilingual embedding model is only 120 MB and vectorizes the entire corpus in minutes. Decoupling these components reduces indexing cost to zero—allowing dozens of re-indexing iterations while refining chunking strategies—limiting external expenses strictly to generated answers.

## Challenges

The chunk as a retrieval unit proved to be the toughest challenge. With fixed-token windowing, a section stating "we migrated to range partitioning" loses context about which project it belongs to and fails to match the query that should retrieve it. The solution was splitting by semantic sections and prepending the document title and heading path to the vectorized text, ensuring the embedding encodes contextual hierarchy along with specific details.

## Outcome

A website functioning simultaneously as a portfolio and a working demonstration of its described architecture: every design decision is justifiable and documented within the very corpus the assistant consults.
