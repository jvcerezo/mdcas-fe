# MDCAS — Website & staff portal

Public website and staff scheduling portal for **Maralit Dental Clinic**, a
three-branch dental practice in Batangas.

API: [`mdcas-be`](https://github.com/jvcerezo/mdcas-be)

---

## Quick start

Start the API first (it runs with no database — see its README), then:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

`vite.config.ts` proxies `/api` to `http://localhost:5000`, so the browser talks
to a single origin in development and CORS never applies. Point it elsewhere
with `VITE_API_PROXY`.

For production, set `VITE_API_URL` to the deployed API's base URL.

---

## Pages

### Public

| Route | What it is |
|---|---|
| `/` | Landing page — branches, how booking works, featured treatments |
| `/clinics` | All three branches with contact details and hours |
| `/clinics/:slug` | One branch: services, team, weekly roster, how to book |
| `/services` | Every treatment with indicative pricing, filterable by branch |
| `/schedule` | **The availability calendar** |
| `/about` | The practice and its clinicians |
| `/contact` | Per-branch contact details and what to have ready when calling |

### Staff — sign-in required

| Route | What it is |
|---|---|
| `/staff/login` | Staff sign-in. No public sign-up exists. |
| `/staff/today` | Today's chair list: patient, procedure, time, at a glance |
| `/staff/schedule` | Month calendar with full booking detail and CRUD |

---

## The availability calendar

The public calendar shows a month per branch, split into hourly blocks, colour
coded by how busy each hour is:

| Colour | Status | Meaning |
|---|---|---|
| Green | **Open** | Chairs are free |
| Amber | **Filling up** | Partly booked, some chairs remain |
| Red | **Fully booked** | Every clinician on duty is booked |
| Grey | **No clinician** | Branch open, nobody rostered |
| Hatched | **Closed** | Branch closed that day |

Each day cell renders one thin bar per open hour, so a whole month's shape reads
at a glance; selecting a day opens the hour-by-hour breakdown.

**No patient information is fetched or rendered here.** The endpoint behind it
returns only counts and a status — the shapes it returns have no field capable
of holding a name, contact number or procedure. Colour is never the only signal:
every block carries a text label for anyone who cannot rely on it.

The site takes no bookings. Patients check the calendar, call the branch, and
the front desk records the appointment — which then appears on the calendar.

---

## The staff portal

Staff sign in and get the view the public cannot see: patient name, contact,
procedure, assigned clinician and status, for every booking.

The booking form narrows as you fill it in — choosing a branch limits the
services to what that branch offers and the clinician list to who is rostered
there, with off-shift clinicians sorted last and flagged rather than hidden.
Picking a procedure sets a sensible end time from its usual duration, still
editable because real appointments overrun.

The API validates everything again on save. Double-booking a clinician is
rejected outright; booking outside opening hours or off-roster saves with a
visible warning, because staff legitimately do both.

Cancelling keeps the record — it frees the slot on the public calendar while
preserving the history for no-show tracking and reporting.

---

## Design

A restrained editorial system rather than a template: warm bone paper, warm
near-black ink, and a single deep teal used sparingly so it still carries
weight. Depth comes from hairline rules and whitespace, not drop shadows.

Colour is reserved for meaning — branch identity and schedule status — which is
what lets a calendar of a few hundred blocks stay readable.

Type is Fraunces (an optical-size serif) for display and Inter for UI, with
tabular figures throughout so times and prices do not shift as they change.

Tokens live in `src/index.css` under `@theme`. Change them there and the whole
site follows.

Accessibility: a visible focus ring everywhere, a skip link, `aria-pressed` on
every toggle, text labels alongside every colour signal, and full support for
`prefers-reduced-motion`.

---

## Structure

```
src/
├── components/
│   ├── layout/      header, footer, public shell
│   ├── schedule/    public month grid, day detail, legend
│   ├── staff/       portal shell, auth guard, booking dialog, appointment row
│   └── ui/          buttons, cards, fields, loading and error states
├── hooks/useApi.ts  fetch + loading/error state, aborts on unmount
├── lib/
│   ├── api.ts       typed API client
│   ├── auth.tsx     staff session context
│   └── format.ts    dates, times, currency, status styling
├── pages/           public pages, plus pages/staff/
└── types.ts         mirrors mdcas-be/src/types.ts — keep in sync
```

---

## Environment

| Variable | Notes |
|---|---|
| `VITE_API_URL` | API base URL. Leave blank in development. |
| `VITE_API_PROXY` | Where `npm run dev` proxies `/api`. Default `http://localhost:5000`. |

---

## Deploying

```bash
npm run build      # outputs to dist/
```

It is a single-page app, so **the host must rewrite unknown paths to
`index.html`** — otherwise a refresh on `/schedule` or `/clinics/bayog` returns
a 404. On Netlify, a `_redirects` file with `/* /index.html 200`; on nginx,
`try_files $uri /index.html`. Vercel is handled by `vercel.json` in this repo.

### Vercel — migrating from the old Create React App setup

`vercel.json` sets the framework, build command, output directory and SPA
rewrites, so it overrides the dashboard. In **Settings → Build & Deployment**,
clear any overrides left from CRA so the file wins. What changed:

| Setting | Was (CRA) | Now (Vite) |
|---|---|---|
| Framework Preset | Create React App | Vite |
| Output Directory | `build` | **`dist`** |
| Build Command | `react-scripts build` | `npm run build` |
| Node version | 16/18 | 20 or later |

**Environment variables must be renamed.** Vite only exposes variables prefixed
`VITE_`, so a leftover `REACT_APP_API_URL` is silently ignored and the app ends
up calling `/api` on its own domain:

| Was | Now |
|---|---|
| `REACT_APP_API_URL` | `VITE_API_URL` |

Delete the `REACT_APP_*` entries — they do nothing now, and leaving them around
makes it look like the URL is configured when it is not.

`VITE_API_URL` is **inlined at build time**, not read at runtime. Changing it
requires a redeploy; there is no restart-to-pick-up-new-env.

Finally, add the deployed origins to `FRONTEND_URL` on the API, or every
request will fail CORS. Preview deployments get a new URL per commit, so allow
them with a wildcard:

```
FRONTEND_URL=https://maralitdental.ph,https://*.vercel.app
```

---

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run typecheck
```

## Stack

React 19 · TypeScript · Vite 6 · Tailwind CSS 4 · React Router 7 · lucide-react
