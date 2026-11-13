# Deploy AI Job Tracker on Vercel

The website works without Google credentials; automatic discovery stays visibly disabled until configured. No secret is needed in the frontend. This is a public site: the supplied resume and PDFs are included, while edits, application states and personal notes remain in each browser.

## 1. Import the repository

In Vercel, import `manthan291999/ai-job-tracker`.

- Framework preset: **Other**
- Root directory: repository root (leave blank)
- Build: `npm run build` (already in `vercel.json`)
- Output directory: `dist` (already configured)
- Node.js: 22.x
- Install command: automatic / `npm ci`

Do not set Root Directory to `dist`: the `api/` functions and package file must remain in the project root. Vercel builds independently of GitHub Actions, so the GitHub Actions billing block does not stop a Vercel import. Vercel and Google have their own account and usage requirements.

## 2. Connect a private Blob store

In the Vercel project, open Storage and create/connect a **private Vercel Blob** store. Connect it to Production. Vercel supplies `BLOB_READ_WRITE_TOKEN`. Do not use a public store with this configuration. The store holds only public job listings and search evidence, never the master resume or application notes.

## 3. Set server environment variables

In Project Settings > Environment Variables, set these for Production:

| Name | Value |
| --- | --- |
| `GEMINI_API_KEY` | A Gemini API key created in your Google AI Studio account |
| `GEMINI_MODEL` | `gemini-3.8-flash` by default; choose another supported Search-grounding model if your account requires it |
| `BLOB_READ_WRITE_TOKEN` | Supplied by the connected private Blob store |
| `CRON_SECRET` | A random secret at least 24 characters long |

Generate a secret locally with `openssl rand -hex 32`. Never commit it, put it in a URL, or paste it into a public issue or browser field in this app. Google AI Studio API access is separate from a Gemini/Spark consumer subscription. Google Search grounding can consume paid quota depending on the account/model; check your Google project budget before enabling scheduled execution. This project does not change billing plans.

Redeploy after adding variables.

## 4. First refresh and schedule

The configured Vercel cron is `30 2 * * *` UTC, which is **8:00 AM Asia/Kolkata**, with no daylight-saving shift.

The Hobby plan runs daily cron with per-hour precision: an 8:00 AM configuration can run between 8:00 and 8:59 AM IST. Do not assume exact-minute delivery. Pro has finer precision, but jobs can still take time to finish. This website updates a shared feed; it does not send email or phone notifications. A separate ChatGPT task has been rescheduled in the conversation for an 8:00 AM IST daily report.

Run the configured cron from Vercel's dashboard, or make an authenticated request to start the first refresh:

```sh
# Set TRACKER_URL to your actual deployment URL. CRON_SECRET should already
# be set locally; do not write its literal value into shell history.
curl --fail --header "Authorization: Bearer $CRON_SECRET" "$TRACKER_URL/api/cron/refresh"
```

Check `$TRACKER_URL/api/jobs` for `state: ready`, `lastSuccessAt`, and jobs. The web page's **Check for updates** only downloads the latest stored feed; it does not expose the cron secret or start paid searches from visitors' browsers.

## Verification and reliability

- Discovery uses Gemini's Google Search grounding, not the Gemini Spark app. It sends only generic role/location preferences, never contact details or a resume.
- Responses without valid JSON and search-grounding evidence are rejected.
- Each direct source is fetched independently over public HTTPS with bounded redirects, pinned public DNS addresses and time/size limits.
- A matching structured JobPosting, employer, geographic eligibility and evidence of an active application or future deadline are required for a verified label. Other discoveries stay unverified.
- Missing or guessed dates are not presented as verified posting dates/deadlines. Some sites block automated fetches or require JavaScript; those jobs remain unverified.
- Search is best effort, not an exhaustive list of every job. Newly discovered does not mean newly posted.
- Stable URL IDs and first-seen timestamps prevent duplicates. User application states, saved jobs and local notes are preserved during sync.
- Feed writes use ETag checks. Successful runs are idempotent per India calendar day; failures keep the previous good feed. Check the dashboard for a stale or failed update.
- There is no automatic retry scheduler. You can retry after fixing an error using the authenticated cron endpoint; a successful day is not searched again.
- Older jobs not rediscovered are retained for up to 14 days and lose their verified state when stale. Browser-owned saved entries are retained for your tracking history.

## Gemini Spark

See [GEMINI_SPARK_TASK.md](GEMINI_SPARK_TASK.md). Spark is a separate Google app account and schedule. Connecting Vercel or setting a Gemini API key does not authenticate Spark, and no Spark schedule is claimed by this code. Its task report can be imported into the app using **Import Spark report**; imported entries are always unverified until checked.

## Local testing

```sh
npm ci
npm test
npm run build
npm run dev
```

Open http://localhost:3000. Use `.env.local` with `node --env-file=.env.local scripts/dev.mjs` when testing configured functions. Without credentials, the app and resume downloads work and the feed reports `not_configured`.
