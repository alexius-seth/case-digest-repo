-- Migration: 20261101_fts_and_integrity.sql
-- Enforce user_id + gr_number uniqueness and add weighted Full-Text Search (FTS) with GIN index.

-- 1. Composite Unique Constraint
alter table public.case_digests
  drop constraint if exists case_digests_user_gr_number_unique;

alter table public.case_digests
  add constraint case_digests_user_gr_number_unique
  unique (user_id, gr_number);

-- 2. Generated tsvector Column with Weighted Fields
-- Weight A: case_title, gr_number (highest relevance)
-- Weight B: doctrine (core legal takeaway)
-- Weight C: facts, ruling (case narrative and disposition)
alter table public.case_digests
  add column if not exists fts tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(case_title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(gr_number, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(doctrine, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(facts, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(ruling, '')), 'C')
  ) stored;

-- 3. GIN Index for High-Performance Search
create index if not exists case_digests_fts_idx
  on public.case_digests using gin (fts);

