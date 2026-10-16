# Proposal strategist and writer

Phase 4 implements a draft-only workflow: Job → Analysis → Strategy → Draft → Edit → Save. It never submits a proposal, spends Connects, deploys a demo, or schedules monitoring.

## Evidence and research

Portfolio items can represent projects, writing samples, achievements, experience, resumes, or links. Search and relevance matching use only items explicitly marked verified. Private PDF, DOCX, and text uploads are stored in the `portfolio` Supabase Storage bucket under the authenticated user's folder with a 10 MB limit.

Client research is limited to the job and authorized client fields already stored by Vurier. Job text is treated as untrusted input. The strategy prompt explicitly prohibits following embedded instructions or inventing external research, client facts, experience, links, or outcomes.

## Model routing

- `deepseek-v4-pro`: one strategic reasoning pass for the client problem, deliverables, positioning, bid/timeline estimates, proof selection, and demo recommendation.
- `deepseek-flash`: proposal drafting and user-requested rewrites.

Both responses use Zod-validated JSON. Token usage and estimated cost are persisted. Generation checks the existing monthly AI budget before provider calls.

## Quality and versioning

Drafts must lead with two client/value lines and end with a specific question. QA scores personalization, factual accuracy, relevance, clarity, client focus, and style; it flags unsupported quantified claims and generic/AI-style language. Flags remain visible and are never silently converted to verified facts.

Every generated draft, rewrite, and manual save creates an immutable `proposal_versions` row. The proposal row points to the current text while history remains available for review.

## Setup

Apply `20261018000000_phase_4_proposal_writer.sql`, including the storage bucket and policies. Configure Supabase and `DEEPSEEK_API_KEY`, then add verified portfolio evidence before generating a proposal.
