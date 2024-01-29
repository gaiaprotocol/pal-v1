# Pal Backend (Supabase)

```
supabase link --project-ref XXX
supabase secrets set --env-file ./supabase/.env
supabase functions deploy store-user-avatar
supabase functions deploy new-wallet-linking-nonce
supabase functions deploy link-wallet-to-user
supabase functions deploy track-contract-events
supabase db dump -f supabase/seed.sql
```

```sql
select * from cron.job;
```

```sql
select * from cron.job_run_details;
```

```sql
select
  cron.schedule(
    'track-base-pal-events',
    '*/10 * * * *',
    $$
    select net.http_post(
        'https://zwsbatwxnlcsgycwiymn.supabase.co/functions/v1/track-contract-events',
        body := '{"chain":"base"}'::JSONB,
        headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3c2JhdHd4bmxjc2d5Y3dpeW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTI2NzkzODYsImV4cCI6MjAwODI1NTM4Nn0.EZo2bbviOpTkasQsDw0A6fVa8bFrMkW0wl70Ywf6hjY"}'::JSONB
    ) AS request_id;
    $$
  );

select
  cron.schedule(
    'track-arbitrum-pal-events',
    '1,11,21,31,41,51 * * * *',
    $$
    select net.http_post(
        'https://zwsbatwxnlcsgycwiymn.supabase.co/functions/v1/track-contract-events',
        body := '{"chain":"arbitrum"}'::JSONB,
        headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3c2JhdHd4bmxjc2d5Y3dpeW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTI2NzkzODYsImV4cCI6MjAwODI1NTM4Nn0.EZo2bbviOpTkasQsDw0A6fVa8bFrMkW0wl70Ywf6hjY"}'::JSONB
    ) AS request_id;
    $$
  );

select
  cron.schedule(
    'track-optimism-pal-events',
    '2,12,22,32,42,52 * * * *',
    $$
    select net.http_post(
        'https://zwsbatwxnlcsgycwiymn.supabase.co/functions/v1/track-contract-events',
        body := '{"chain":"optimism"}'::JSONB,
        headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3c2JhdHd4bmxjc2d5Y3dpeW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTI2NzkzODYsImV4cCI6MjAwODI1NTM4Nn0.EZo2bbviOpTkasQsDw0A6fVa8bFrMkW0wl70Ywf6hjY"}'::JSONB
    ) AS request_id;
    $$
  );
```
