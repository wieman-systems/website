# Security Policy — Wieman Systems

This repository hosts the marketing website for Wieman Systems LLC
(wiemansystems.com), a static/SSG site with a single serverless contact endpoint.

## Reporting a vulnerability

Email **caleb@wiemansystems.com** with details and steps to reproduce. Please do
not open public issues for security reports. We aim to acknowledge within 72 hours.

A machine-readable contact is published at
`/.well-known/security.txt`.

## Posture

- **Transport & headers:** HSTS, a strict Content-Security-Policy, `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and a locked `Permissions-Policy`
  are set in `vercel.json`. CORS is scoped to the site's own origin — never `*`.
- **Secrets:** any API keys (e.g. the contact-form mailer) live only in the host
  environment (Vercel env vars), never in the repo. `.env*` is gitignored.
- **Surface:** the only dynamic endpoint is `POST /api/contact`; it validates
  input, escapes output, and uses a honeypot to deter bots. It does not read or
  expose data — it only relays a message to our own inbox.

## Scope

This policy covers wiemansystems.com. The RunIQ application has its own security
policy and contact at https://runiq-azure.vercel.app/.well-known/security.txt.
