-- Down step for 002_analysis_cache.sql. NOT run automatically.
-- Removes the cache and the event log (cached results are only a copy; the app works without them).
-- The stored copies in analysis_results are NOT deleted here.
DROP TABLE IF EXISTS analysis_events;
DROP TABLE IF EXISTS analysis_cache;
