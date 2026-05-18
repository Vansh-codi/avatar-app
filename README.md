# AvatarAI — Real-Time 3D Avatar Generator

A production-ready full-stack web app that generates and animates a personalized 3D avatar using live webcam face and body tracking.

![AvatarAI Preview](public/preview.png)

---

##  Features

| Feature | Tech |
|---|---|
| Real-time face tracking (468 landmarks) | MediaPipe FaceMesh |
| Full-body pose estimation (33 keypoints) | MediaPipe Pose |
| Emotion detection from facial geometry | Custom blend shape analysis |
| Gesture recognition | Pose landmark angles |
| Animated 3D avatar mirroring | React Three Fiber + Three.js |
| Morph targets (blink, smile, jaw, etc.) | Landmark-to-blendshape mapping |
| Motion smoothing (EMA filter) | Custom SmoothingFilter class |
| Avatar deep customization | Zustand state + R3F materials |
| PNG / GLB / GIF export | Three.js canvas + GLTFExporter |
| Save avatars to account (up to 20) | Prisma + PostgreSQL |
| JWT authentication | jose + secure httpOnly cookies |
| bcrypt password hashing | bcryptjs (cost 12) |
| Rate limiting | In-memory sliding window |
| CSRF / security headers | Next.js middleware headers |
| Dark / light mode | CSS variables + Zustand persist |
| Fully responsive UI | TailwindCSS |
| Smooth animations | Framer Motion |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser Client                       │
│                                                          │
│  ┌──────────────┐   ┌──────────────┐  ┌─────────────┐  │
│  │  MediaPipe   │──▶│  Landmark    │─▶│  React 3F   │  │
│  │  FaceMesh+   │   │  Processor   │  │  Avatar3D   │  │
│  │  Pose        │   │  (bone maps) │  │  (Three.js) │  │
│  └──────────────┘   └──────────────┘  └─────────────┘  │
│        ▲                                      │          │
│   Webcam feed                         3D canvas render   │
└─────────────────────────────────────────────────────────┘
                            │
                       Next.js API
                            │
                    ┌───────┴────────┐
                    │   Prisma ORM   │
                    └───────┬────────┘
                            │
                       PostgreSQL
```

---

##  Folder Structure

```
avatar-app/
├── app/
│   ├── layout.tsx              # Root layout + metadata
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles + CSS vars
│   ├── dashboard/
│   │   └── page.tsx            # Main editor (requires auth)
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── register/route.ts
│       │   └── logout/route.ts
│       └── avatar/
│           └── save/route.ts   # GET / POST / DELETE
├── components/
│   ├── three/
│   │   ├── Avatar3D.tsx        # Procedural 3D avatar mesh
│   │   └── AvatarScene.tsx     # R3F canvas + lighting
│   ├── ml/
│   │   └── WebcamTracker.tsx   # Camera + landmark overlay
│   └── ui/
│       ├── CustomizePanel.tsx  # Avatar appearance controls
│       ├── ExportPanel.tsx     # PNG/GLB/GIF export
│       ├── SavedAvatarsPanel.tsx
│       └── Providers.tsx
├── hooks/
│   └── useMediaPipe.ts         # MediaPipe init + RAF loop
├── lib/
│   ├── auth.ts                 # JWT sign/verify helpers
│   ├── db.ts                   # Prisma singleton
│   ├── landmarkProcessor.ts    # ML → bone transforms
│   ├── rateLimit.ts            # Sliding window rate limiter
│   └── store.ts                # Zustand global store
├── prisma/
│   ├── schema.prisma           # DB schema
│   └── seed.ts                 # Dev seed data
├── types/
│   └── index.ts                # TypeScript types
├── .env.example                # Environment template
├── .gitignore
├── next.config.js              # Security headers + webpack
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
└── README.md
```

---

##  Local Development Setup

### Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org))
- **PostgreSQL** v14+ ([download](https://www.postgresql.org/download/) or use Docker)
- **Git** ([download](https://git-scm.com))
- **VS Code** (recommended) with extensions: ESLint, Tailwind CSS IntelliSense, Prisma

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/avatar-ai.git
cd avatar-ai

# Install all dependencies
npm install
```

### 2. Set Up Environment Variables

```bash
# Copy the example env file
cp .env.example .env.local

# Open .env.local in VS Code
code .env.local
```

Edit `.env.local` with your values:

```env
# Your PostgreSQL connection string
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/avatardb"

# Generate a secure secret: openssl rand -base64 32
JWT_SECRET="your-super-secret-jwt-key-at-least-32-chars-long"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. PostgreSQL Setup

**Option A — Local PostgreSQL:**
```bash
# Create the database
psql -U postgres -c "CREATE DATABASE avatardb;"
```

**Option B — Docker (no PostgreSQL install needed):**
```bash
docker run --name avatardb \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=avatardb \
  -p 5432:5432 \
  -d postgres:16
```

**Option C — Local dev with SQLite (easiest):**

Change `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

And set in `.env.local`:
```env
DATABASE_URL="file:./dev.db"
```

### 4. Prisma Database Setup

```bash
# Generate Prisma client types
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev --name init

# (Optional) Seed with test data
npx ts-node prisma/seed.ts

# (Optional) Open Prisma Studio visual DB browser
npx prisma studio
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Test Webcam Detection

1. Navigate to [http://localhost:3000/auth/register](http://localhost:3000/auth/register)
2. Create an account
3. You'll be redirected to the dashboard
4. Click **▶ Start Camera & Tracking** in the left panel
5. Allow camera permissions when prompted
6. Your face and body should be detected and the 3D avatar will mirror your movements

**Troubleshooting webcam:**
- Make sure you're on `http://localhost:3000` (not a file:// URL)
- Check browser console for MediaPipe loading errors
- Chrome/Edge work best; Firefox may have limitations
- MediaPipe models load from CDN on first use (~5-10 seconds)

---

## ML Architecture: How Landmark Mapping Works

```
Webcam Frame (640×480)
        │
        ▼
MediaPipe FaceMesh ──────────── 468 3D face landmarks
        │                              │
        │                     computeBlendShapes()
        │                              │
MediaPipe Pose ──────────────── 33 3D body keypoints
        │                              │
        │                    extractBoneTransforms()
        │                              │
        ▼                              ▼
SmoothingFilter (EMA)        AvatarBoneTransforms
        │                    {head, spine, arms, legs}
        │
        ▼
Three.js bone.quaternion.slerp() ──▶ Avatar animates!
```

### Key files:
- **`lib/landmarkProcessor.ts`** — Core ML processing. Converts raw `{x,y,z}` landmark arrays into 3D rotation quaternions and ARKit-style blend shapes. Each function is heavily commented.
- **`hooks/useMediaPipe.ts`** — Initializes FaceMesh + Pose, manages camera, runs a `requestAnimationFrame` processing loop.
- **`components/three/Avatar3D.tsx`** — Uses `useFrame()` to read landmark data from the Zustand store each frame and apply transforms to bone refs via `slerp()`.

---

## Available Scripts

```bash
npm run dev          # Start dev server on :3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npm run db:generate  # Regenerate Prisma client
npm run db:migrate   # Run pending migrations
npm run db:push      # Push schema without migration (dev only)
npm run db:studio    # Open Prisma Studio
```

---

## GitHub Integration

### Initial Setup

```bash
# Initialize git repository
git init

# Stage all files
git add .

# Initial commit
git commit -m "feat: initial project setup with Next.js, Prisma, Three.js, MediaPipe"

# Rename branch to main
git branch -M main

# Add your GitHub remote (create a repo on github.com first)
git remote add origin https://github.com/YOUR_USERNAME/avatar-ai.git

# Push to GitHub
git push -u origin main
```

### Recommended Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# New features
git commit -m "feat: add real-time face tracking with MediaPipe FaceMesh"
git commit -m "feat: implement avatar customization panel with color pickers"
git commit -m "feat: add JWT authentication with httpOnly cookies"
git commit -m "feat: add Three.js avatar with bone animations"
git commit -m "feat: add PNG/GLB/GIF export functionality"

# Bug fixes
git commit -m "fix: resolve motion smoothing jitter on fast head turns"
git commit -m "fix: correct quaternion slerp causing gimbal lock"
git commit -m "fix: handle camera permission denial gracefully"

# Improvements
git commit -m "perf: reduce landmark processing from 60fps to 30fps"
git commit -m "refactor: extract bone transform logic to landmarkProcessor"
git commit -m "style: improve dark mode contrast ratios"

# Documentation
git commit -m "docs: add comprehensive local setup instructions"
git commit -m "docs: document ML landmark-to-bone mapping algorithm"

# Dependencies
git commit -m "chore: upgrade Three.js to 0.159.0"
git commit -m "chore: add Prisma migration for sessions table"
```

### Useful Git Commands

```bash
# View commit history
git log --oneline --graph

# Create a feature branch
git checkout -b feat/multiplayer-avatar-room

# Merge feature back to main
git checkout main
git merge feat/multiplayer-avatar-room

# Tag a release
git tag -a v1.0.0 -m "Initial production release"
git push origin v1.0.0
```

---

## Vercel Deployment

### 1. Push to GitHub (see above)

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `avatar-ai` repo
4. Click **"Import"**

### 3. Configure Environment Variables in Vercel

In the Vercel dashboard → **Settings → Environment Variables**, add:

| Variable | Value | Environment |
|---|---|---|
| `DATABASE_URL` | Your PostgreSQL URL | Production, Preview |
| `JWT_SECRET` | Secure random string | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Production |

**For production PostgreSQL**, use a managed service:
- [Neon](https://neon.tech) (free tier, serverless PostgreSQL) ← recommended
- [Supabase](https://supabase.com) (free tier)
- [PlanetScale](https://planetscale.com) (MySQL, update Prisma provider)

**Neon setup:**
```bash
# In Neon dashboard, create a project and copy connection string
# It looks like: postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 4. Production Prisma Migration

After deploying, run migrations against your production database:

```bash
# From your local machine (one-time setup)
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

Or add to your Vercel build command:
```
npx prisma generate && npx prisma migrate deploy && npm run build
```

### 5. Deploy

Click **"Deploy"** in Vercel — that's it! 

Subsequent deploys happen automatically on every `git push` to `main`.

---

##  Security Implementation

| Threat | Mitigation |
|---|---|
| Brute-force login | Rate limiting: 10 req / 15 min on auth endpoints |
| Password theft | bcrypt hashing with cost factor 12 |
| Token theft | httpOnly, Secure, SameSite=Lax cookies |
| XSS | httpOnly cookies (JS can't access), CSP headers |
| CSRF | SameSite=Lax cookie policy |
| SQL injection | Prisma ORM parameterized queries |
| User enumeration | Timing-safe comparison in login |
| Clickjacking | `X-Frame-Options: DENY` |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| Unauthorized API | JWT verification on all protected routes |

---

##  Bonus Features (Bonus Roadmap)

These features are partially implemented or ready to add:

### Emotion Detection  (Implemented)
Already working via `detectEmotion()` in `lib/landmarkProcessor.ts`. 
Emotion badge shows in the 3D viewport. Extend by adding emotion-triggered animations.

### Gesture Controls  (Implemented)
`detectGesture()` recognizes "wave" and "victory". 
Add more gestures by analyzing joint angles between wrist/elbow/shoulder.

### Voice Commands 🔧 (Add via Web Speech API)
```javascript
const recognition = new webkitSpeechRecognition();
recognition.onresult = (e) => {
  const command = e.results[0][0].transcript.toLowerCase();
  if (command.includes('wave')) triggerWaveAnimation();
};
```

### Multiplayer Avatar Room  (Add via Socket.IO)
```bash
npm install socket.io socket.io-client
# Create: app/api/socket/route.ts
# Create: components/MultiplayerRoom.tsx
# Broadcast landmark data via WebSocket to other users
```

---

##  Troubleshooting

**MediaPipe not loading:**
```
Error: Failed to load MediaPipe
```
→ Check network tab for CDN failures. MediaPipe loads from `cdn.jsdelivr.net`.

**Prisma client not found:**
```
Error: Cannot find module '@prisma/client'
```
→ Run `npx prisma generate`

**Camera not working in production:**
→ Ensure your domain uses HTTPS (required for `getUserMedia`). Vercel provides HTTPS automatically.

**Avatar not animating:**
→ Open browser console. Check if MediaPipe is detecting landmarks (look for `isTracking: true` in Zustand devtools).

**Database connection refused:**
→ Check `DATABASE_URL` in `.env.local`. Ensure PostgreSQL is running: `pg_ctl status`

---

## License

MIT — free to use, modify, and distribute.

---

## Built With

- [Next.js](https://nextjs.org) — React framework
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) — Three.js in React
- [MediaPipe](https://mediapipe.dev) — ML face and pose detection
- [Prisma](https://prisma.io) — Type-safe database ORM
- [TailwindCSS](https://tailwindcss.com) — Utility-first CSS
- [Framer Motion](https://www.framer.com/motion) — Animation library
- [Zustand](https://zustand-demo.pmnd.rs) — State management
- [jose](https://github.com/panva/jose) — JWT library
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) — Password hashing
