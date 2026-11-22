-- Down step for 003_ai_usage.sql. NOT run automatically.
-- Removes the usage log. The daily budget and translate cap then have nothing to count
-- (the app fails open and logs an error), so switch FLAG_TOKEN_BUDGET and FLAG_TRANSLATE_LIMITS off first.
DROP TABLE IF EXISTS ai_usage;
