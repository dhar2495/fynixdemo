# SyslaFynix

A realistic, login-gated finance app — think a small slice of Paytm/a
neobank — built as a **cross-platform QA automation showcase**: a REST
**API** with live Swagger, a single **app** that runs on **Android, iOS and
Web** from one codebase, and automation suites (**Playwright** for web + API,
**Appium** for Android + iOS) that all key off **one shared locator
contract**.

Demo login: `demo@SyslaFynix.dev` / `Demo@123`

**Contents:** [Features](#whats-in-the-app) · [Tech stack](#tech-stack) ·
[API reference](#api-reference) · [1. Get the code](#1-get-the-code-any-machine) ·
[2. Run it locally](#2-run-it-locally-5-minutes) ·
[3. Access from another device](#3-access-it-from-another-device) ·
[4. Run the automation](#4-run-the-automation) · [CI workflows](#ci-workflows) ·
[5. Push to GitHub](#5-push-your-own-copy-to-github) ·
[6. Build the APK / IPA](#6-produce-the-actual-apk--ipa) ·
[7. Host it live](#7-get-a-live-swagger-url--hosted-app) · [Notes](#notes)

### What's in the app

- **Dashboard** — balance hero card, income/expense split, offer banners, a
  Paytm-style quick-actions row (Send Money, Recharge, Electricity, DTH/Bills)
- **Transactions** — searchable/filterable list with category icons, add/delete,
  a **Send Money** flow (pick a contact → amount → pay) and dedicated
  **bill-pay flows** for mobile recharge, electricity and DTH (provider →
  account number → quick amount chips → pay) — all backed by the same
  `POST /transactions` endpoint, just with a friendlier UI in front of it
- **Loan calculator** — EMI, total interest/payment and full amortization
  schedule from the reducing-balance formula
- **Settings** — profile, display currency (INR/USD/EUR), reset demo data,
  log out

Everything renders from the API — there's no hardcoded balance or transaction
anywhere in the app.

```
meridian-finance/
├─ api/            Node + Express + TypeScript REST API + served Swagger UI
├─ app/            Expo (React Native) — Android + iOS + Web from one codebase
├─ automation/
│  ├─ web-api/     Playwright (web UI + API request tests) + POM + data utils
│  └─ mobile/      Appium + WebdriverIO (Android + iOS)
├─ .github/workflows/   CI, Pages deploy, APK & IPA builds
└─ docs/          testid contract + E2E scenario matrix + static Swagger
```

The pitch, in one line: **the same business journey is verified on web, API,
Android and iOS from a single set of `testID`s** — see `docs/scenario-matrix.md`.

### Tech stack

| Layer | Stack |
|---|---|
| API | Node + Express 4 + TypeScript, JWT auth (`jsonwebtoken`), in-memory data store, `swagger-ui-express` for live docs |
| App | Expo SDK 51, React Native 0.74, React 18, React Navigation 6 (bottom-tabs + native), `react-native-web` for the web target |
| Web-only UI | A top nav bar replaces the mobile bottom tab bar above ~700px width; content is capped at a readable max-width so it doesn't stretch edge-to-edge on wide monitors |
| Web/API automation | Playwright (`@playwright/test`) — API contract tests + Chromium E2E |
| Mobile automation | Appium 2 + WebdriverIO 8 (`appium-uiautomator2-driver` for Android, `appium-xcuitest-driver` for iOS) |
| Builds | `expo prebuild` + Gradle for Android APK (no account needed); EAS (Expo Application Services) for iOS IPA cloud builds |
| CI/CD | GitHub Actions — API tests, web E2E, GitHub Pages deploy, APK/IPA builds |

### API reference

Base URL: `http://localhost:4000/api` locally; full interactive docs at
`/api-docs` (Swagger UI) or the raw spec at `/api/openapi.json`.

| Method & path | Auth | What it does |
|---|---|---|
| `GET /health` | — | Health check |
| `POST /auth/login` | — | Exchange email + password for a JWT |
| `GET /accounts` | ✓ | List accounts |
| `GET /accounts/summary` | ✓ | Dashboard KPIs — income, expense, net, opening/current balance, transaction count |
| `GET /transactions` | ✓ | List transactions — filter by `type`, `category`, `q`; sort/paginate |
| `GET /transactions/:id` | ✓ | Get one transaction |
| `POST /transactions` | ✓ | Create a transaction (validates amount, type, category, date) |
| `PUT /transactions/:id` | ✓ | Update a transaction |
| `DELETE /transactions/:id` | ✓ | Delete a transaction |
| `POST /loans/calculate` | — | EMI + full amortization schedule (reducing balance); public so Swagger's "Try it out" works without a token |
| `POST /reset` | ✓ | Restore the deterministic seed data (8 transactions) |

Auth is `Authorization: Bearer <token>`. There are no separate endpoints for
Send Money or bill-pay — those are UI flows in the app that call the same
`POST /transactions` with a category of `transfer` or `utilities` and a
descriptive `description` (e.g. `Jio Mobile recharge · 9998887770`).

---

## 1. Get the code (any machine)

```bash
git clone https://github.com/<you>/meridian-finance.git
cd meridian-finance
```

Requires **Node.js 18+** and **npm**. Nothing else to install upfront — each
package (`api/`, `app/`, `automation/*`) manages its own dependencies.

## 2. Run it locally (5 minutes)

```bash
# Terminal 1 — API (http://localhost:4000, Swagger at /api-docs)
cd api && npm install && npm run dev

# Terminal 2 — app on web (http://localhost:8081)
cd app && npm install && npx expo start --web
```

Open `http://localhost:8081` and sign in with the demo login above. That's
the whole stack running on one machine.

## 3. Access it from another device

**A phone/tablet on the same Wi-Fi (fastest — no build needed):**
1. Install the **Expo Go** app (App Store / Play Store).
2. Find your computer's LAN IP (`ipconfig` on Windows, `ifconfig`/`ip a` on
   Mac/Linux — look for something like `192.168.1.9`).
3. Start the API and app pointed at that IP instead of localhost:
   ```bash
   cd app && EXPO_PUBLIC_API_URL=http://192.168.1.9:4000/api npx expo start
   ```
   (PowerShell: `$env:EXPO_PUBLIC_API_URL="http://192.168.1.9:4000/api"; npx expo start`)
4. Scan the QR code Expo prints with your phone's camera (iOS) or the Expo Go
   app (Android). The app opens live on your phone, talking to the API on
   your computer.

**A device on a different network:** add `--tunnel` to the `expo start`
command — Expo relays the connection so you don't need the same Wi-Fi (slower,
needs the `@expo/ngrok` package which Expo offers to install automatically).

**An Android phone with no Expo Go / no dev server running:** install the
built **APK** directly — see §6 below. That's a real standalone app, no
computer needed once it's installed.

**An emulator/simulator on the same machine:**
```bash
cd app && npx expo start        # press a (Android) or i (iOS)
```

---

## 4. Run the automation

```bash
# API suite (needs the API running on :4000)
cd automation/web-api && npm install
npx playwright install chromium
npm run test:api

# Web UI suite (needs API on :4000 AND the web app served on :8081)
npm run test:web

# Mobile suite (needs an emulator/simulator + a built app — see §6)
cd automation/mobile && npm install
APP_PATH=/path/to/SyslaFynix.apk npm run android
APP_PATH=/path/to/SyslaFynix.app npm run ios
```

The API suite asserts exact values (EMI = ₹22,957.25, seed transaction count =
8) because the data is deterministic and `POST /reset` restores the baseline.

### CI workflows

All under `.github/workflows/`, running automatically on push to `main` (plus
manual dispatch for the build ones):

| Workflow | Trigger | What it does |
|---|---|---|
| `api-tests.yml` | push/PR to main | Boots the API, runs the Playwright API suite against it |
| `web-e2e.yml` | push to main / manual | Boots the API + exported web app, runs Playwright Chromium E2E |
| `deploy-pages.yml` | push to main / manual | Builds the web app + static Swagger, deploys to GitHub Pages |
| `build-apk.yml` | tag push (`v*`) / manual | `expo prebuild` + Gradle → Android APK attached to the GitHub Release |
| `build-ipa.yml` | manual only | EAS cloud build → iOS IPA attached to the GitHub Release (needs Apple credentials configured) |

---

## 5. Push your own copy to GitHub

Starting from a fresh checkout instead of a clone (e.g. you unzipped the
project)?

```bash
cd meridian-finance
git init && git add . && git commit -m "SyslaFynix demo"
git branch -M main
git remote add origin https://github.com/<you>/meridian-finance.git
git push -u origin main
```

On push, **API tests** and **Web E2E** run automatically (`.github/workflows`).

---

## 6. Produce the actual APK / IPA

The APK builds with **`expo prebuild` + Gradle + the Android SDK** — all
open-source, running directly on GitHub's own runner, no third-party account
or token needed. The IPA still uses **EAS** (Expo Application Services) since
iOS signing requires Apple's tooling. Both publish the artifact to a
**GitHub Release** (a real download URL).

**One-time setup**
- In the GitHub repo: **Settings → Secrets and variables → Actions** → add
  variable `PUBLIC_API_URL` = your hosted API base (see §7). Needed so the
  built app knows where to send requests; skip it and it falls back to
  `localhost`, which won't work off your dev machine.

**Build the APK** (installable Android build):
```bash
git tag v1.0.0 && git push --tags     # triggers .github/workflows/build-apk.yml
```
The workflow runs `expo prebuild` to generate the native Android project,
then `./gradlew assembleDebug`, and attaches `SyslaFynix.apk` to the `v1.0.0`
release. It's a debug-signed build (no keystore to manage) — fine for
installing on a device, not for a store submission. Locally you can also run:
```bash
cd app && npx expo prebuild --platform android && cd android && ./gradlew assembleDebug
```

**Installing it on a phone:** download `SyslaFynix.apk` from the GitHub Release
(or copy the local file) onto the Android device via a cable, cloud drive, or
a direct download link, then open it — Android will prompt to allow installs
from that source once. No Expo Go, no dev server, no computer needed
afterwards; it talks to whatever `PUBLIC_API_URL` was set at build time
(see §7 for hosting that API somewhere reachable from the phone).

**Build the IPA** (needs an Apple Developer account, $99/yr):
```bash
cd app && eas credentials        # configure signing once, then:
# trigger .github/workflows/build-ipa.yml manually (workflow_dispatch)
```
EAS handles provisioning/signing; the IPA lands on the release. Without an
Apple account you can still build an unsigned **simulator** `.app`
(`eas build -p ios --profile ios-adhoc`) which is enough for Appium on the iOS
simulator.

---

## 7. Get a live Swagger URL + hosted app

**Static Swagger + web app on GitHub Pages (free, automatic):**
Enable **Settings → Pages → Source: GitHub Actions**. The
`deploy-pages.yml` workflow publishes:
- the web app at `https://<you>.github.io/meridian-finance/`
- Swagger docs at `.../api-docs/`

Static Swagger renders the spec; "Try it out" needs a live API, so:

**Deploy the API (working Swagger + real requests):** any Node host works.
Example with [Render](https://render.com) — free tier:
- New Web Service → connect the repo → root dir `api`
- Build: `npm install && npm run build` · Start: `npm start`
- After deploy, your live Swagger is `https://<service>.onrender.com/api-docs`
- Set the Pages variable `PUBLIC_API_URL` to `https://<service>.onrender.com/api`
  so the hosted web app and the built APK talk to it.

The API also serves the web bundle itself: drop the Expo `dist/` into
`api/public/` and a single deploy gives you app + API + Swagger on one URL.

---

## Client demo script (suggested)
1. Open the **live app** (web) and the **APK on a phone** side by side — same product, two platforms.
2. Open **Swagger**, run `POST /loans/calculate` — show the API returns the exact EMI the app shows.
3. Run `npm run test:api` and the **mobile** suite — same journey, same IDs, green across web/API/Android/iOS.
4. Point at `app/src/testids.ts`: "one file changes a locator everywhere."

See `docs/scenario-matrix.md` and `docs/testid-contract.md` for the detail.

## Notes
- In-memory data store; `POST /reset` (or the Settings screen) restores the seed.
- Demo auth stores passwords in plain text and uses a demo JWT secret — this is
  intentional for a throwaway demo and must not be copied into production.
