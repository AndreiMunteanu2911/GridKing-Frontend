# GridKing

GridKing is a cross-platform multiplayer American Checkers game for the web and Android. This repository contains the player-facing Angular application: authentication, menus, the checkers board, online matchmaking, bot games, settings, profiles, and the leaderboard.

## What You Can Do With GridKing

- Create an account with email and password.
- Choose a unique username and a separate visible display name.
- Play casual online matches without affecting your rating.
- Play ranked matches and gain or lose MMR.
- Practice against Easy, Medium, or Hard server-side bots.
- Follow highlighted legal moves and mandatory jump sequences.
- View player statistics and the global leaderboard.
- Switch between light and dark themes.
- Use the same interface on desktop, mobile web, and Android.

## How The App Feels To Use

GridKing uses a tactile arcade design derived from the app icon itself:

- Deep forest background: `#064E3B`
- Primary board green: `#047857`
- Bright board green: `#10B981`
- Crown gold: `#F59E0B`
- Dark gold: `#D97706`
- Crown cream: `#FEF3C7`

The main menu provides direct access to online play, bot play, settings, and rankings. During a game, tap a piece and then each highlighted landing square. Multi-jump paths are selected one landing at a time and validated by the Go server.

## For People Setting It Up

The frontend needs:

- Node.js 22
- npm
- A running GridKing backend
- A Firebase project with Authentication and Firestore
- Android Studio and Java 21 for local Android builds

The Go backend should be deployed first because the frontend and Android build need its HTTPS and WSS URLs.

## Firebase Setup

1. Create a Firebase project.
2. In **Authentication → Sign-in method**, enable **Email/Password**.
3. Create a Firestore database.
4. In **Project settings → Your apps**, create a Web app and copy its configuration values.
5. Deploy the included Firestore rules:

```bash
firebase deploy --only firestore:rules
```

6. In **Authentication → Settings → Authorized domains**, add:

- `localhost`
- Your Vercel production domain
- Any custom production domain

Firebase web configuration is intentionally bundled into the browser. It identifies the Firebase project but does not grant administrator access. Never place a Firebase service-account JSON value in this frontend.

## Environment File

Create the local file from the committed template.

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Bash:

```bash
cp .env.example .env.local
```

Fill in:

```dotenv
GRIDKING_API_URL=http://localhost:8080
GRIDKING_WS_URL=ws://localhost:8080/ws
FIREBASE_API_KEY=your-firebase-web-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
FIREBASE_APP_ID=your-firebase-web-app-id
```

`.env.local` is ignored by Git. The start and production build scripts convert these values into ignored Angular environment files.

## Run The App Locally

Start the backend first, then run:

```bash
npm install --legacy-peer-deps
npm start
```

Open `http://localhost:4200`.

For a physical Android device, `localhost` refers to the phone rather than your computer. Use the deployed backend URLs for packaged apps. For emulator-only development, Android reaches a backend on the host machine through `10.0.2.2`.

## Quick Manual Check

After setup:

1. Create a Firebase account and GridKing profile.
2. Confirm the menu displays the visible name and initial 1200 MMR.
3. Start an Easy bot game and make a legal move.
4. Confirm mandatory captures are highlighted and incomplete jump paths cannot be submitted.
5. Open two authenticated clients and join the same casual queue.
6. Complete or resign the match and confirm both clients receive the result.
7. Play a ranked match and confirm Firestore updates MMR and statistics.
8. Open the leaderboard and verify the profile appears.
9. Toggle dark mode, reload, and confirm the preference persists.

## Generate Icons And Splash Screens

The source artwork is `public/favicon.png`. Generate Android launcher icons, adaptive icons, splash screens, PWA icons, and web theme tokens with:

```bash
npm run assets
```

The generator reads the dominant colors directly from the icon, so replacing the icon and running the command updates both native assets and the Angular palette.

Generated Android resources are written under `android/app/src/main/res`. Generated web icons are written under `public/icons`.

## Build An Android App With Capacitor

Use production HTTPS/WSS values in `.env.local`, then run:

```bash
npm run assets
npm run cap:sync
npx cap open android
```

`npm run cap:sync` builds the Angular app into `dist/grid-king/browser` and syncs that bundle into the committed Android project.

For a command-line debug APK after syncing:

```bash
cd android
./gradlew assembleDebug
```

The APK is created under `android/app/build/outputs/apk/debug`.

## Automatic GitHub APK Builds

The workflow at `.github/workflows/android-apk.yml` runs on every push to `master` and can also be started manually. It:

1. Installs Node.js 22 and Java 21.
2. Generates GridKing native assets.
3. Builds the production Angular bundle.
4. Syncs Capacitor Android.
5. Builds an installable debug APK.
6. Uploads the APK as a workflow artifact.
7. Replaces previous automated APK releases with the latest release.

In the frontend GitHub repository, open **Settings → Secrets and variables → Actions → Variables** and add:

```text
GRIDKING_API_URL
GRIDKING_WS_URL
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
```

Use the deployed Render URLs, for example:

```text
GRIDKING_API_URL=https://gridking-backend.onrender.com
GRIDKING_WS_URL=wss://gridking-backend.onrender.com/ws
```

These are public browser configuration values, so GitHub repository variables are appropriate. The Firebase Admin service account belongs only in Render.

## Deploy The Frontend To Vercel

1. Import the frontend repository into Vercel.
2. Set the production branch to `master`.
3. Keep the repository root as the Vercel Root Directory.
4. Add all variables from `.env.example` under **Project Settings → Environment Variables**.
5. Use the deployed Render backend URLs for `GRIDKING_API_URL` and `GRIDKING_WS_URL`.
6. Deploy.

`vercel.json` already configures the Angular build, output directory, npm peer-dependency handling, and SPA route fallback.

After Vercel assigns the production URL:

1. Add its hostname to Firebase Authorized Domains.
2. Set the backend `FRONTEND_ORIGIN` to the exact Vercel origin, such as `https://gridking.vercel.app`.
3. Redeploy the backend if that value changed.

Vercel environment variables can also be managed with:

```bash
vercel link
vercel env add GRIDKING_API_URL production
vercel env ls production
```

## Optional Firebase Hosting

The included `firebase.json` also supports Firebase Hosting. Build first, then deploy:

```bash
npm run build
firebase deploy --only hosting
```

Use either Vercel or Firebase Hosting as the public frontend host. The backend CORS origin must match whichever production origin players use.

## Main Technologies

- Angular 21 standalone components
- Angular Signals
- Tailwind CSS 4
- Firebase Web SDK
- Capacitor 8
- TypeScript 5.9
- Sharp asset generation

## Project Map

```text
src/app/core/                 Authentication, API, settings, and WebSocket state
src/app/pages/                Authentication, menu, online, bot, settings, leaderboard
src/app/shared/               Reusable board and page header
src/environments/             Safe fallback and generated environment modules
scripts/                      Environment and native asset generators
public/                       Favicon, PWA manifest, generated web icons
android/                      Capacitor Android application
.github/workflows/            Automatic APK release workflow
firestore.rules               Client-side Firestore access rules
vercel.json                   Vercel Angular deployment settings
```

## How Authentication Works

Firebase signs the player in and returns an ID token. Protected HTTP requests send it as:

```text
Authorization: Bearer <firebase-id-token>
```

The browser WebSocket connection sends the short-lived token during connection setup. The Go backend verifies every token with Firebase Admin before allowing profile, bot, or multiplayer access.
