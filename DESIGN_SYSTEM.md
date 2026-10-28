# Janaseva AI — NeoPOP Design System Specification

## 1. Overview & Design Philosophy

**Janaseva AI** connects citizens with civic governance. The citizen UI adopts the **NeoPOP design language** (CRED's retro-futuristic, tactile 3D neobrutalism design system), customized specifically for civic governance in Karnataka and India:
- **Tactile & Responsive:** Physical plinths, distinct drop elevations, crisp edge-stroke outlines, and tactile pressed states.
- **High Contrast & Clarity:** Deep charcoal/black bases (`#0D0D0D`, `#1A1A1A`) paired with crisp stark whites (`#FFFFFF`), bold civic primaries (Emerald Green `#06C270`, Civic Saffron/Amber `#FFB020`, Trust Blue `#3C82F6`), and high legibility.
- **Multilingual-First (Kannada & English):** Generous line-heights, robust typography scales, and adaptive UI layouts that accommodate longer Kannada phrasing without layout breakage.
- **Mobile-First Civic Ergonomics:** Thumb-friendly hit zones (minimum 48px), persistent tactile bottom navigation, bottom sheets for mobile actions, and accessible input fields.

---

## 2. Color Palette & NeoPOP Primitives

### Primary Civic Colors
| Role | Color Hex | NeoPOP Primitive / Equivalent | Usage |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#0D0D0D` / `#F8F9FA` | `mainColors.black` / High Contrast Light | Deep dark theme canvas or crisp daylight canvas |
| **Surface Card** | `#1A1A1A` / `#FFFFFF` | `mainColors.white` | Elevated cards, report items, bottom sheets |
| **Border Stroke** | `#000000` / `#262626` | 2px solid | 3D edge borders on cards, buttons, badges |
| **Civic Emerald (Success)** | `#06C270` | `mainColors.green` | Resolved status, primary submission button, verified badge |
| **Civic Amber (In-Progress)**| `#FFB020` | `mainColors.yellow` | In-Progress, Under Review, attention notices |
| **Civic Blue (Trust/Action)** | `#3B82F6` | `mainColors.blue` | Google Auth, navigation highlights, tracking tags |
| **Civic Crimson (Urgent)**   | `#FF3B30` | `mainColors.red` | Error states, cancel, road hazard tags |

### Status Mapping
- **Submitted:** `colorPalette.popWhite[100]` / Neutral Blue Accent `#60A5FA`
- **Under Review:** `colorPalette.warning[500]` / Amber `#F59E0B`
- **In Progress:** `colorPalette.info[500]` / Electric Cyan/Blue `#0EA5E9`
- **Resolved:** `colorPalette.success[500]` / Vivid Emerald `#10B981`
- **Needs Information:** `colorPalette.danger[400]` / Coral Pink `#F43F5E`

---

## 3. Elevation & 3D Plinth System

NeoPOP's signature 3D depth utilizes physical plinths (borders with shadow offsets):
- **Level 1 (Subtle / Tags):** `elevation: 2`, `edge: 1px solid #000000`
- **Level 2 (Cards / Inputs):** `elevation: 4`, `edge: 2px solid #000000` (e.g. Report Card, Category Option)
- **Level 3 (Primary CTAs & Floating Action):** `elevation: 6`, `edge: 2px solid #000000` (Submit Button, Emergency Report)
- **Pressed State:** `transform: translate(2px, 2px)`, shadow reduced to `0px` with spring snap.

---

## 4. Typography System

Supports bilingual rendering (English & Kannada script):

| Token | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `Heading 1` | 32px / 2rem | Bold (800) | 1.2 | Page titles, confirmation headings |
| `Heading 2` | 24px / 1.5rem | Bold (700) | 1.3 | Card titles, section headers |
| `Subheading` | 18px / 1.125rem | Semi-Bold (600) | 1.4 | Report category, tracking ID display |
| `Body Large` | 16px / 1rem | Regular (400) / 500 | 1.5 | Problem descriptions, official updates |
| `Body Small` | 14px / 0.875rem| Regular (400) | 1.4 | Meta tags, timestamps, secondary labels |
| `Caption / Monospace` | 12px / 0.75rem | Bold (700) Mono | 1.2 | Tracking code (`JAN-2026-XXXX`), status chips |

---

## 5. Core UI Component Library (NeoPOP Adapters)

1. **`NeoButton` (`@cred/neopop-web.Components.Button`):**
   - Variants: `primary` (Emerald Green 3D CTA), `secondary` (Crisp White with black 3D border), `destructive` (Crimson), `ghost`.
   - Full support for `icon`, loading spinners, and tactile feedback.
2. **`NeoCard` (`@cred/neopop-web.Components.ElevatedCard`):**
   - 3D plinth cards for listing citizen reports, status timeline milestones, and landing feature cards.
3. **`NeoTag` (`@cred/neopop-web.Components.Tag`):**
   - Status indicators (`Submitted`, `Under Review`, `In Progress`, `Resolved`, `Needs Info`).
4. **`NeoInputField` (`@cred/neopop-web.Components.InputField`):**
   - Bold bordered inputs for tracking ID search, location entry, and bilingual text areas.
5. **`NeoBottomSheet` (`@cred/neopop-web.Components.BottomSheet`):**
   - Mobile-first modals for language switching, category quick-selection, and filter sheets.
6. **`NeoToast` (`@cred/neopop-web.Components.showToast`):**
   - Instant tactile popups for submission feedback, copy tracking ID to clipboard, and error notifications.
7. **`NeoBottomNav` (Custom Citizen Navigation Component):**
   - Persistent bottom bar (Home `/`, Upload `/report`, My Reports `/my-reports`, Profile `/profile`).
   - Tactile active tab elevation with bold icon indicator.

---

## 6. Bilingual Support Structure (Kannada + English)

All user-facing strings are keyed through a lightweight dictionary provider:
- `en`: English
- `kn`: Kannada (ಕನ್ನಡ)

Examples:
- "Upload a Problem" -> "ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಿ"
- "Track Report" -> "ವರದಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ"
- "Road Damage" -> "ರಸ್ತೆ ಹಾನಿ"
- "Garbage" -> "ಕಸ ವಿಲೇವಾರಿ"
- "Drainage" -> "ಒಳಚರಂಡಿ"
- "Water Supply" -> "ಕುಡಿಯುವ ನೀರು ಸರಬರಾಜು"
- "Streetlight" -> "ಬೀದಿ ದೀಪ"
