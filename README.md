# AI Job Tracker

Private career workspace for AI/ML opportunities in Ahmedabad, Gujarat and India-wide remote or hybrid roles.

## Features

- Search and filter verified and unverified listings by skills, location, work mode, role and experience.
- Save jobs, record application statuses, private notes and follow-up dates.
- Add job descriptions for closer resume tailoring.
- Download a tailored, text-based Oxford-style PDF directly from each job card.
- Preview and edit drafts; export PDF, text or Overleaf LaTeX.
- Export and import a tracker backup.

## Run locally

Requires Python 3. No build or package installation is needed.

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. Use an HTTP server rather than opening HTML files directly, because resume fonts and seed data are fetched locally.

## Source layout

- `dist/index.html`: job tracker UI and browser-local state.
- `dist/resume.html`: resume comparison and editing UI.
- `dist/resume-core.js`: supplied master resume, matching, PDF creation and downloads.
- `dist/jobs-seed.json`: dated seed listing data.
- `dist/resumes/`: prepared PDFs for seed jobs.
- `dist/fonts/`: embedded serif fonts and license.
- `dist/vendor/`: bundled pdf-lib and fontkit libraries.
- `.openai/hosting.json`: existing Sites deployment configuration.

## Data and limitations

This repository includes Manthan Mittal’s supplied resume facts, email address, Indian phone number and generated resume PDFs. Keep the repository private if those details should not be public.

Tracking and edited master resumes are stored in the current browser’s localStorage. They do not sync across devices. Export a backup before clearing browser data. Seed listings are a dated snapshot, not a live feed; availability needs rechecking at the source. No job applications are submitted and no employers are contacted.

Resume tailoring uses local keyword matching and evidence selection, not an AI service. It does not invent experience or guarantee an ATS percentage or hiring result. Review every resume before applying.

## Deployment

Serve `dist/` from a static host. The existing private deployment uses ChatGPT Sites; its access controls are supplied by Sites, not by the HTML files. A different public static host will not inherit that privacy gate.

Third-party assets retain their respective licenses. Repository licensing for the application source has not been specified.

## GitHub Pages

The included `.github/workflows/pages.yml` publishes `dist/` on pushes to `main`, after Pages is enabled with **GitHub Actions** as its source under repository Settings > Pages. Paths are relative so the project-site URL works. Pages availability for a private repository depends on the GitHub plan.

This exported GitHub Pages version labels itself as a browser-local tracker, not a private website. The original master resume and PDF assets are downloadable by anyone who can visit the hosted site. The personal master resume is in `dist/resume-core.js`; remove personal defaults and prepared PDFs before any public deployment if they should stay private.
