# Design Brief

## Direction

SafeHer — a calm, reassuring, trustworthy girl safety app: a soft, warm rose-and-lilac sanctuary with one prominent SOS trigger, now extended with approachable chat and discreet safety surfaces.

## Tone

Calm and approachable — deliberately anti-alarmist: soft blush surfaces and reassuring copy so the single saturated SOS accent stands out precisely because everything else is at ease.

## Differentiation

The persistent bottom navigation centers an oversized, full-rounded, gently pulsing red-orange SOS button — calm everywhere, urgent only at the emergency trigger — while chat bubbles and safety tools stay soft, rounded, and reassuring.

## Color Palette

| Token      | OKLCH (light)  | Role                           |
| ---------- | -------------- | ------------------------------ |
| background | 0.975 0.012 300 | soft blush-cream canvas        |
| foreground | 0.2 0.03 310   | deep plum-charcoal text        |
| card       | 0.99 0.008 300 | elevated card surface          |
| primary    | 0.48 0.13 320  | reassuring rose brand          |
| accent     | 0.6 0.16 25    | SOS red-orange (emergency only)|
| muted      | 0.94 0.02 300  | soft lavender-grey secondary   |
| destructive| 0.55 0.22 25   | warm red (SOS/destructive)     |
| chat.incoming | 0.94 0.025 300 | incoming bubble surface      |
| chat.outgoing | 0.48 0.13 320 | outgoing bubble (rose)       |
| chat.anon   | 0.88 0.06 300  | anonymous community lilac     |
| location    | 0.55 0.13 170  | live location teal            |
| location-soft | 0.93 0.03 170 | soft teal wash (map/check-in) |
| discreet    | 0.72 0.01 300  | neutral disguise surface      |

## Typography

- Display: Space Grotesk — headings, hero, SOS label
- Body: Plus Jakarta Sans — paragraphs, UI labels, forms, chat copy
- Scale: hero `text-3xl md:text-5xl font-bold tracking-tight`, h2 `text-2xl font-bold`, label `text-sm font-semibold tracking-widest uppercase`, body `text-base`, chat meta `text-xs`

## Elevation & Depth

Two-tier soft shadow system (`shadow-subtle`, `shadow-elevated`) with layered lavender-tinted shadows on cards; hero uses a gentle primary→accent gradient banner; chat bubbles use a light single-layer shadow for a flat, friendly feel.

## Structural Zones

| Zone        | Background    | Border   | Notes                                   |
| ----------- | ------------- | -------- | --------------------------------------- |
| Header      | bg-card       | border-b | elevated bar, brand + SOS quick action  |
| Content     | bg-background | —        | sections alternate bg-muted/30          |
| Map         | bg-card       | border   | `.map-container` rounded card, OSM tiles |
| Chat thread | bg-background | —        | bubbles on canvas, composer pinned      |
| Composer    | bg-card       | border-t | message-input pill + send + attach      |
| Footer      | bg-muted/40   | border-t | persistent bottom nav with SOS button   |

## Spacing & Rhythm

Mobile-first generous rhythm: section gaps `space-y-8`, card padding `p-5`, chat thread `space-y-2`, bubble max-width `max-w-[80%]`, micro-spacing 4/8/16/24 scale; large touch targets (min 44px) for accessibility.

## Component Patterns

- Buttons: rounded-full pills; primary rose, SOS uses `gradient-sos` + `animate-sos-pulse`, destructive red for cancel
- Chat bubbles: `chat-bubble-in`/`chat-bubble-out`/`chat-bubble-anon`, `animate-bubble-pop` on arrival, image messages rounded with caption
- Message input: `message-input` pill with focus ring, send + image attach + location share
- Cards: `rounded-2xl` bg-card shadow-subtle, generous padding, optional icon tile
- Badges: rounded-full, muted/success/location tint for status (typing, check-in, live location)
- Map: `.map-container` rounded card hosting Leaflet + OSM tiles; `.map-live-marker` teal pulsing pin with `.map-accuracy-ring`; `.map-center-btn` floating center-on-me control
- Check-in state: `.checkin-card-active` (teal wash, live dot + elapsed time) vs `.checkin-card-idle` (neutral card); check-in uses location teal, never SOS
- History: `.history-entry` rows with `.history-entry-marker` icon tile (teal for check-in, muted for check-out) and `.history-entry-link` to a map view
- Safety surfaces: `fake-call-overlay` dark gradient screen, `discreet-surface` neutral disguise panel

## Motion

- Entrance: `animate-fade-up` staggered 0.1s on cards/sections; `animate-bubble-pop` for new messages
- Hover: `transition-smooth`, subtle lift via shadow-elevated
- Live: `animate-typing-dot` on typing indicator, `animate-location-pulse` on live location pin, `accuracy-pulse` accuracy ring on the live marker
- Decorative: SOS button `animate-sos-pulse` (soft expanding ring, 2s loop) — the only continuous motion

## Constraints

- SOS accent (`accent`/`destructive`) reserved exclusively for emergency actions, never for generic CTAs
- Location teal reserved for live location sharing, the embedded map, and check-in/check-out; never for generic success states
- AA+ contrast in light and dark; body text min 4.5:1; no opacity-based text
- Token-only styling: no raw hex/rgb in components
- Mobile-first; SOS reachable from persistent navigation on every screen
- Map renders client-side from a free keyless tile source (OpenStreetMap); no geofence alerts
- doNotBuild (geofence alerts, proximity alert, voice/video calling) get no reserved UI zones

## Signature Detail

The centered floating SOS button in the bottom nav — oversized, full-rounded, red-orange, gently pulsing — is the single urgent element in an otherwise calm, reassuring sanctuary; the embedded teal live-location map and soft check-in/check-out cards extend that calm, supportive safety language without ever borrowing the emergency accent.
