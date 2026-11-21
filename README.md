RiskLens — Explainable AML Transaction Monitoring Engine

RiskLens is a backend-focused Anti-Money Laundering (AML) transaction monitoring system built with TypeScript and Node.js.
It processes financial transactions through an event-driven pipeline and applies configurable rule-based detection to identify potentially suspicious transaction patterns.
The project focuses on reliable transaction processing, historical transaction analysis, modular detection rules, and explainable findings.
Project status: Active development — core transaction processing and four AML detection rules implemented. Risk scoring and alert persistence are planned next.

Key Features:

Event-driven transaction processing using RabbitMQ.
Reliable message publishing with publisher confirmations and backpressure handling.
Transaction validation using Zod.
Idempotent processing using Redis.
Persistent transaction storage using PostgreSQL.
Historical transaction retrieval using configurable time windows.
Modular AML detection engine with independently configurable rules.
Integration and end-to-end tests using Vitest.

Technology Stack: Node.js, TypeScript, Express.js, RabbitMQ, PostgreSQL, Redis, Docker, Zod, Decimal.js, and Vitest.
