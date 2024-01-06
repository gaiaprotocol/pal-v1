# Pal Backend (Supabase)

```
supabase link --project-ref XXX
supabase secrets set --env-file ./supabase/.env
supabase functions deploy track-contract-events
supabase db dump -f supabase/seed.sql
```

```sql
select * from cron.job;
```

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
