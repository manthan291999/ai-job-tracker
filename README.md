# AI Job Tracker

A browser-local career workspace for AI/ML jobs around Ahmedabad and Gujarat, plus India-wide remote and hybrid roles.

## Features

- Search and filter opportunities by skills, location, work mode and experience.
- Save jobs and track application status, private notes and follow-up dates.
- Download an Oxford-style, text-based tailored resume PDF from each job card.
- Edit a master resume and export PDF, plain text or Overleaf LaTeX.
- Refresh a persistent shared job feed with Google Search-grounded Gemini discovery and independent source checks.
- Merge a Gemini Spark JSON report without replacing saved jobs or application states.
- Show last successful refresh, stale data, verification dates and unavailable configuration honestly.

## Vercel deployment

Import this repository with Root Directory set to the repository root and Framework set to **Other**. The included `vercel.json` sets the build to `npm run build`, output to `dist`, Node functions under `api`, and a daily cron at **8:00 AM IST** (`30 2 * * *` UTC).

Follow [Vercel setup](docs/VERCEL_SETUP.md) to connect private Blob storage and server-only Google API credentials. Vercel Hobby scheduling may run up to 59 minutes late. The website and resume downloads work without API credentials; fresh discovery stays explicitly unconfigured until setup is complete.

Gemini Search API and the Gemini Spark app are distinct services. See [Gemini Spark task setup](docs/GEMINI_SPARK_TASK.md) for the prepared Google task and import format. Deploying the code does not authenticate Spark or prove that a Google schedule is active.

## Local development and validation

Requires Node.js 22.x.

```sh
npm ci
npm test
npm run build
npm run dev
```

Open http://localhost:3000. Copy `.env.example` to `.env.local` only for local server testing, then use `node --env-file=.env.local scripts/dev.mjs`. Never commit real credentials.

For the static-only website, `python3 -m http.server 8000 --directory dist` also works, but server feed functions are unavailable. GitHub Pages can serve the static website using the included workflow; Vercel supplies the API and cron features.

## Source layout

| Path | Purpose |
| --- | --- |
| `dist/index.html` | Tracker UI, browser-local notes, statuses and saved jobs |
| `dist/resume.html` | Resume comparison and editing |
| `dist/resume-core.js` | Supplied master facts, local matching and PDF generation |
| `dist/jobs-feed.js` | Feed sync and Spark report imports |
| `dist/jobs-seed.json` | Dated seed opportunities |
| `dist/resumes/` | Prepared seed-job resumes |
| `api/jobs.js` | Read-only shared feed endpoint |
| `api/cron/refresh.js` | Secret-protected daily search endpoint |
| `lib/` | Discovery, verification, persistent storage and safe source fetching |
| `test/` | Verification, authorization, recovery and merge checks |
| `docs/` | Vercel and Gemini setup instructions |

## Data and limitations

This repository includes Manthan Mittal's supplied resume, email, phone number and prepared PDFs. They are visible on any public deployment. Sites' original sign-in gate is not part of the HTML and does not apply to Vercel or GitHub Pages.

Personal tracking and edited master resumes remain in localStorage on the current browser. Export backups before clearing data or moving devices. The shared backend stores only public job information and search evidence. No resume or candidate details are sent to Google by the discovery function, no employers are contacted and no applications are submitted.

Discovery is best effort, not exhaustive. Newly discovered listings are not necessarily newly posted. Unconfirmed details stay unverified; missing dates are not invented. Site fetches can fail or be blocked. Resume tailoring selects and reorders existing evidence rather than using a generative model, and does not promise an ATS percentage or hiring outcome.

The static site remains usable if Google discovery or storage fails. A failed refresh retains the previous shared feed, with its actual timestamp and error state.

Fonts and bundled pdf-lib/fontkit assets retain their respective licenses. Application source licensing has not been specified.
