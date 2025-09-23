Run the guild emoji population script.

Make sure your DATABASE_URL is set in the environment (e.g. in .env).

Run:

```powershell
npm run tsx -- scripts/populate-guild-emojis.ts
```

This will update guild rows by matching their `name` and setting the `emoji` column.
