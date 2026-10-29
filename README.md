# 🏛️ Janaseva AI (ಜನಸೇವಾ)
### AI-Powered Civic Grievance Routing & Resolution Platform for Bengaluru Wards

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Storage-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vercel Live](https://img.shields.io/badge/Deployment-Vercel_Production-000000?style=for-the-badge&logo=vercel)](https://janaseva-ai-tau.vercel.app)

> **Live Production URL:** [https://janaseva-ai-tau.vercel.app](https://janaseva-ai-tau.vercel.app)  
> **Local Development Server:** `http://localhost:3001`

---

## 📖 Table of Contents
1. [Overview & Vision](#-overview--vision)
2. [User Interface & Visual Walkthrough](#-user-interface--visual-walkthrough)
3. [Core Architectural Features](#-core-architectural-features)
4. [Bengaluru 117-Ward Auto-Routing Engine](#-bengaluru-117-ward-auto-routing-engine)
5. [Before & After Resolution Verification](#-before--after-resolution-verification)
6. [Department Accounts & Credentials (All 702 Accounts)](#-department-accounts--credentials)
7. [System Architecture](#-system-architecture)
8. [Database Schema & Storage Configuration](#-database-schema--storage-configuration)
9. [Local Setup & Getting Started](#-local-setup--getting-started)
10. [Production Deployment Guide](#-production-deployment-guide)

---

## 🌟 Overview & Vision

**Janaseva AI (ಜನಸೇವಾ)** is a next-generation civic governance platform engineered to eliminate bureaucratic latency in urban grievance redressal across Bengaluru. 

Citizens report civic emergencies (potholes, garbage dumps, drainage overflows, water leakages, dark streetlights, hazardous debris) using a live geolocated camera. The proprietary **Auto-Routing Engine** analyzes GPS coordinates, postal codes, and locality names across all **117 Bengaluru Postal Wards (560001 to 560117)**, automatically dispatching tickets directly into the private queue of the designated ward department officer among **702 pre-seeded municipal accounts**.

Once field maintenance is executed, the responsible officer must upload **tamper-evident after-fix photo proof** and field inspection remarks to resolve and close the ticket—visible to citizens in real time.

---

## 📱 User Interface & Visual Walkthrough

### 1. Citizen Experience (Reporting & Tracking)

| 01. Citizen Landing Page | 02. One-Tap Grievance Submission | 03. Live Status & Before/After Proof |
|:---:|:---:|:---:|
| <img src="./docs/screenshots/01-citizen-landing.png" width="280" alt="Citizen Landing Page" /> | <img src="./docs/screenshots/02-citizen-report-form.png" width="280" alt="Report Filing Form" /> | <img src="./docs/screenshots/03-citizen-tracking.png" width="280" alt="Citizen Tracking Page" /> |
| **Midnight Indigo Hero** with quick category discovery and persistent camera scanner dock. | **Live Camera & Geolocation** with custom WebP category illustrations and fixed submission action. | **Milestone Progress Stepper** with official inspection notes and verified Before/After photos. |

---

### 2. Municipal Official Experience (Dashboard, Queues & Action)

| 04. Department Queue & Metrics | 05. Action Sheet & Resolution Proof | 06. Interactive Ward Map |
|:---:|:---:|:---:|
| <img src="./docs/screenshots/04-official-dashboard.png" width="280" alt="Official Dashboard" /> | <img src="./docs/screenshots/05-official-action.png" width="280" alt="Official Action Page" /> | <img src="./docs/screenshots/06-official-map.png" width="280" alt="Ward Map View" /> |
| **Clean Flat Metrics** showing Total, New, In-Progress, and Resolved complaints for the ward PIN. | **Single-Card Action Sheet** with Before/After upload manager, remarks, and zoom lightbox. | **Zero-Clutter Ward Map** geolocating complaints within the official's municipal jurisdiction. |

---

## ⚡ Core Architectural Features

* **Instant Auto-Routing Engine:** Evaluates pincode, locality string parsing (e.g. "Indiranagar", "RPC Layout", "Whitefield"), and GPS Euclidean distance to route grievances to the correct department without manual triage.
* **Tamper-Evident Geotag Watermarking:** Embeds coordinates, compass heading, timestamp, and verification ID directly into citizen camera captures via HTML5 Canvas.
* **Two-Stage Before & After Photo Management:** Prevents fraudulent ticket closure by mandating photo proof of resolution, displayed side-by-side with the citizen's original grievance image.
* **Modal Lightbox Zoom:** Click any photo (citizen evidence or resolution proof) to inspect full-resolution imagery in an interactive dark backdrop modal.
* **Real-Time Cross-Tab Reactivity:** Uses custom event streaming (`janaseva:report_created`) and storage listeners to update official dashboard counters and citizen progress bars without manual page reloads.
* **Bilingual English & Kannada (`ಕನ್ನಡ`):** Built-in i18n dictionary supporting English and Kannada text across all civic touchpoints.
* **Mobile-First Responsive Design:** Styled using a modern, flat, unnested UI with soft emerald municipal accents and zero visual clutter.

---

## 🗺️ Bengaluru 117-Ward Auto-Routing Engine

Located in [`src/lib/routing-engine.ts`](src/lib/routing-engine.ts), the engine handles routing logic across all postal codes:

```text
[Citizen Files Complaint]
         │
         ├── 1. Has explicit 6-digit PIN in address? (e.g. "560104") ──► Use PIN
         │
         ├── 2. Contains locality keyword? (e.g. "RPC Layout", "HAL") ──► Lookup PIN
         │
         └── 3. Has GPS Lat/Lng? ────────────────────────────────────────► Nearest Ward Centroid
                                                                                │
                                                                   [Assigned Department Official]
                                                                     dept104@road.com (PIN 560104)
```

### Supported Categories & Department Mapping:

| Category ID | Category Name | Department Code | Email Domain |
|---|---|---|---|
| `road_damage` | Road Damage & Potholes | `road_damage` | `@road.com` |
| `garbage` | Solid Waste & Garbage Dump | `garbage` | `@garbage.com` |
| `water_supply` | Water Leakage & Supply | `water_supply` | `@water.com` |
| `streetlight` | Streetlight & Electrical | `streetlight` | `@light.com` |
| `drainage` | Drainage Overflow & Sewage | `drainage` | `@drainage.com` |
| `other` | Public Works & Hazardous Debris | `other` | `@other.com` |

---

## 📸 Before & After Resolution Verification

Janaseva AI solves the common civic issue where complaints are marked "resolved" without actual on-site work:

1. **Citizen Submission (Before Fix):**
   * Snapped via live camera or uploaded from device.
   * Saved into Supabase Storage `report-photos/` and stored in `reports.photo_url`.
   * Displayed to the official in the department queue as **Citizen Grievance Photo (Before Fix)**.

2. **Official Field Work (In Progress):**
   * Official claims ticket by clicking **Mark in Progress**.
   * Work order logged in `report_status_history`.

3. **Resolution & Evidence (After Fix):**
   * Field officer takes an **after-fix photo** showing the repaired road, cleared garbage, or fixed light.
   * UI provides a live thumbnail preview with a removal button (`X`) and input for **completion remarks**.
   * On submitting **Mark Resolved & Close Ticket**, the photo is uploaded and saved to `reports.resolution_photo_url`.
   * Both citizen and official can view the **Before** and **After** photos with inspection notes.

---

## 🔑 Department Accounts & Credentials

Janaseva AI includes a complete directory of **702 Official Department Accounts** + **1 Central Administrator Account** pre-configured in Supabase Auth.

### 1. Central Administrator Account
* **Portal URL:** `/portal?tab=admin` or `/admin/login`
* **Email:** `admin@janaseva.com`
* **Password:** `Admin@123`
* **Assigned PIN:** `560001` (Chief Municipal Operations)

### 2. Department Official Accounts (702 Accounts)
* **Portal URL:** `/portal?tab=official` or `/official/login`
* **Account Formula:**
  * **Email:** `dept<PIN_SUFFIX>@<DEPT_DOMAIN>`
  * **Password:** `Dept<PIN_SUFFIX>`
  * **PIN:** `560<PIN_SUFFIX>`

#### Examples Across Major Bengaluru Localities:

| Ward / Locality | PIN Code | Road Dept | Garbage Dept | Water Board | Streetlight Dept | Password |
|---|---|---|---|---|---|---|
| **General Post Office / Central** | `560001` | `dept001@road.com` | `dept001@garbage.com` | `dept001@water.com` | `dept001@light.com` | `Dept001` |
| **Indiranagar / HAL 2nd Stage** | `560038` | `dept038@road.com` | `dept038@garbage.com` | `dept038@water.com` | `dept038@light.com` | `Dept038` |
| **Koramangala** | `560034` | `dept034@road.com` | `dept034@garbage.com` | `dept034@water.com` | `dept034@light.com` | `Dept034` |
| **Jayanagar** | `560011` | `dept011@road.com` | `dept011@garbage.com` | `dept011@water.com` | `dept011@light.com` | `Dept011` |
| **Whitefield** | `560066` | `dept066@road.com` | `dept066@garbage.com` | `dept066@water.com` | `dept066@light.com` | `Dept066` |
| **RPC Layout / Vijayanagar** | `560104` | `dept104@road.com` | `dept104@garbage.com` | `dept104@water.com` | `dept104@light.com` | `Dept104` |
| **Electronic City** | `560100` | `dept100@road.com` | `dept100@garbage.com` | `dept100@water.com` | `dept100@light.com` | `Dept100` |

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Citizen Client
        A[Mobile Browser / PWA] -->|Capture Issue with GPS| B[Report Page /report]
        B -->|Submits Grievance| C[Routing Engine]
        A -->|Tracks Complaint| D[Track Page /reports/id]
    end

    subgraph Backend Services
        C -->|Routes via PIN 560001-560117| E[(Supabase Postgres)]
        B -->|Uploads Evidence| F[Supabase Storage: report-photos]
        E -->|Publishes Events| G[Realtime Sync]
    end

    subgraph Official Portal
        H[Official Console /official/dashboard] -->|Queries Ward PIN Queue| E
        I[Resolution Action /official/reports/id] -->|Uploads After-Fix Proof| F
        I -->|Updates Status to Resolved| E
    end

    G -.->|Live Updates| D
    G -.->|Live Updates| H
```

---

## 🗄️ Database Schema & Storage Configuration

The complete SQL migration script is located in [`supabase-complete-schema.sql`](supabase-complete-schema.sql).

### Tables & Storage Setup:

1. **`reports`:** Core complaints table storing `tracking_id`, `category`, `description`, `location`, `pincode`, `latitude`, `longitude`, `photo_url`, `status`, `assigned_official_email`, `assigned_department`, `resolution_notes`, `resolution_photo_url`, `resolved_at`.
2. **`report_status_history`:** Audit timeline logging every status transition (`submitted`, `in_progress`, `resolved`) with `official_comment` and `official_email`.
3. **`official_accounts`:** Directory of all 702 accounts indexed by PIN and department code.
4. **`profiles`:** User profile synchronization linked to `auth.users`.
5. **Storage Bucket `report-photos`:** Public CDN bucket with row-level policies for photo uploads.

#### Applying the Schema (1 Minute):
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open **SQL Editor** ➜ **New query**.
3. Paste the contents of [`supabase-complete-schema.sql`](supabase-complete-schema.sql) and click **Run**.

---

## 💻 Local Setup & Getting Started

### Prerequisites:
* Node.js 18.x or 20.x
* npm 9.x or newer
* Git

### 1. Clone the Repository:
```bash
git clone https://github.com/sangamesh5588/Janaseva.ai.git
cd Janaseva.ai
```

### 2. Install Dependencies:
```bash
npm install
```
*(A `.npmrc` file with `legacy-peer-deps=true` is included in the root for React 19 compatibility)*

### 3. Configure Environment Variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://qwvjeajsmyghvuxgwoys.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCVymv_zKYtV3I-KPtq0U8Q1SDzQ0TaCck
```

### 4. Start the Local Development Server:
```bash
npm run dev
```
Open **[http://localhost:3001](http://localhost:3001)** in your browser.

---

## 🚀 Production Deployment Guide

The platform is optimized for zero-configuration deployment on **Vercel**:

1. Push your changes to GitHub (`git push origin main`).
2. Import the repository in [Vercel](https://vercel.com).
3. Add the three environment variables:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
4. Deploy!

### Deploy via Vercel CLI:
```bash
vercel login
vercel --prod
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  <b>Janaseva AI (ಜನಸೇವಾ)</b> • Empowering Citizens and Municipal Officers for a Cleaner, Safer Bengaluru.
</p>
