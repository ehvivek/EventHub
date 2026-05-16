<div align="center">

# ⚡ EventHub

### *Events Made Easy*

A modern, full-stack event management platform built with React, Supabase, and Firebase.  
Create, discover, manage, and attend events — all from one premium, beautifully designed interface.

[![MIT License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase)](https://supabase.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel)](https://vercel.com)

---

**Created by [Vivek](https://github.com/ehvivek)**

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎪 **Event Creation** | Rich event forms with banner upload, categories, tags, and organizer details |
| 🔍 **Explore & Discover** | Browse, search, and filter events with real-time data |
| 🗓️ **Chrono Timeline** | Visualize events in Calendar, Timeline, and Orbit views |
| 🔐 **Custom Vault** | Private, personal event tracker with importance levels, colors, and notes |
| 🎟️ **Tickets & Registration** | Register for events and manage your tickets |
| 💾 **Save Events** | Bookmark events for later viewing |
| 🔔 **Smart Notifications** | 24h and 1h event reminders with browser push notifications |
| 📧 **Email Notifications** | Admin alerts on new events via Resend API |
| 📱 **Phone OTP Verification** | Firebase phone authentication for organizer verification |
| 👤 **User Profiles** | Customizable profiles with avatar upload and bio |
| 🌗 **Dark / Light Mode** | Full theme support with smooth transitions |
| 🛡️ **Admin Moderation** | Admin-level event management and deletion |
| ⚡ **Premium UI** | Glassmorphism, animations, and micro-interactions powered by Framer Motion |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, React Router 7, Framer Motion |
| **Styling** | Tailwind CSS 3, Glassmorphism design system |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, RLS) |
| **Auth** | Supabase Email Auth + Firebase Phone OTP |
| **Email** | Resend API + EmailJS |
| **Build** | Vite 8 |
| **Icons** | Lucide React, React Icons |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- A [Supabase](https://supabase.com) project
- A [Firebase](https://console.firebase.google.com) project (for phone auth)
- A [Resend](https://resend.com) account (for email notifications)
- An [EmailJS](https://www.emailjs.com) account (for OTP emails)

### 1. Clone the Repository

```bash
git clone https://github.com/ehvivek/EventHub.git
cd EventHub/eventhub
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Open `.env` and add your actual keys:

```env
# Supabase
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Resend
VITE_RESEND_API_KEY=your-resend-api-key

# Firebase
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

# EmailJS
VITE_EMAILJS_SERVICE_ID=your-emailjs-service-id
VITE_EMAILJS_TEMPLATE_ID=your-emailjs-template-id
VITE_EMAILJS_PUBLIC_KEY=your-emailjs-public-key
```

### 4. Database Setup

Run the SQL migration files in your **Supabase SQL Editor** in this order:

1. `supabase_migration.sql` — Tables, RLS policies, and storage buckets
2. `sql_admin_migration.sql` — Admin moderation system *(update the email placeholder)*

### 5. Run Locally

```bash
npm run dev
```

The app will start at `http://localhost:5173/` (or the next available port).

---

## ▲ Vercel Deployment

### 1. Push to GitHub

```bash
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect **Vite** as the framework

### 3. Configure Build Settings

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
| **Root Directory** | `eventhub` |

### 4. Environment Variables

Add **all** variables from `.env.example` in Vercel's dashboard:

> **Project Settings → Environment Variables**

Add each `VITE_*` key with its production value for the **Production** environment.

### 5. Deploy

Click **Deploy** — Vercel handles the rest automatically.

> **Note:** The Vite dev server proxy (`/api/resend`) won't work on Vercel. For production email sending, move the Resend integration to a [Supabase Edge Function](https://supabase.com/docs/guides/functions) or a [Vercel Serverless Function](https://vercel.com/docs/functions).

---

## 📁 Project Structure

```
eventhub/
├── public/              # Static assets (service worker, favicons)
├── src/
│   ├── assets/          # Images, logos, backgrounds, icons
│   ├── components/      # Reusable UI components (28 components)
│   ├── context/         # React Context (Auth, Theme)
│   ├── data/            # Mock data for development
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Core services (Supabase, Firebase, Email, DB)
│   ├── pages/           # Route-level page components (18 pages)
│   ├── App.jsx          # Root app with routing
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── *.sql                # Database migration scripts
├── .env.example         # Environment variable template
├── tailwind.config.js   # Tailwind CSS configuration
├── vite.config.js       # Vite build configuration
└── package.json
```

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Guidelines

- Follow the existing code style and component patterns
- Write descriptive commit messages
- Test your changes locally before submitting
- Keep PRs focused on a single feature or fix

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
Copyright (c) 2026 Vivek (https://github.com/ehvivek)
```

---

## 📬 Contact

- **Creator:** Vivek
- **GitHub:** [github.com/ehvivek](https://github.com/ehvivek)
- **Email:** ev3nthub@gmail.com
- **Project:** [EventHub](https://github.com/ehvivek/EventHub)


