# Pal Backend (Supabase)

```sql
select
  cron.schedule(
    'track-events-every-10-minutes',
    '*/10 * * * *',
    $$
    select status
    from
      http((
        'GET',
        'https://zwsbatwxnlcsgycwiymn.supabase.co/functions/v1/track-events',
        ARRAY[http_header('Authorization','Bearer ANON_KEY')],
        NULL,
        NULL
      )::http_request)
    $$
  );
```
