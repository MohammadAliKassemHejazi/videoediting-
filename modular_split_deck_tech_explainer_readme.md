# Modular Split-Deck Tech Explainer

A production-ready motion design architecture and animation framework for short-form vertical tech explainers (TikTok, Reels, Shorts).

---

## 1. Canvas Architecture

| Property | Value | Notes |
| :--- | :--- | :--- |
| **Resolution** | 1080 × 1920 | 9:16 vertical aspect ratio |
| **Frame Rate** | 60 fps | Required for fluid kinetic typography and vector transitions |
| **Top Safe Zone** | 150 px | Clearance for platform headers and search overlays |
| **Bottom Safe Zone** | 320 px | Clearance for usernames, captions, and audio tags |
| **Horizontal Margins** | 48 px | Minimum edge padding on both sides |

---

## 2. Spatial Hierarchy & Compositing Stack

```text
+------------------------------------------+  0 px (Canvas Top)
| [Z-0] Background: Dark Grid Texture      |
|                                          |
| +--------------------------------------+ |
| | [Z-10] Visual Display Deck           | |  Top Half (~45% Height)
| | (Keynotes, Screencasts, Doc Cards)   | |  1000 px × 840 px
| +--------------------------------------+ |
|                                          |
| [Z-30] Overlay Badges, Reticles, SFX     |
|                                          |
| +--------------------------------------+ |
| | [Z-10] Speaker Stage Card            | |  Bottom Half (~45% Height)
| | (Talking-Head Live Footage)          | |  1000 px × 840 px
| +--------------------------------------+ |
|                                          |
| [Z-40] Dynamic Subtitles (1–2 Words)   |  y: 1450 px (Center-Chest)
+------------------------------------------+  1920 px (Canvas Bottom)
```

* **Z-0 Base Layer:** Matte slate-black solid with a subtle 40px isometric grid at 6% opacity.
* **Split Deck Containers (Top & Bottom):**
  * Mask: Rounded rectangle (`border-radius: 36px`).
  * Edge Treatment: 1px inner stroke (`rgba(255, 255, 255, 0.08)`).
  * Ambient Shadow: `box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5)`.

### Dynamic Speaker Breakouts (Punch Zoom Mode)
* **Trigger:** Strong rhetorical punches, intro hooks, transitions, or final calls to action.
* **Behavior:**
  * The bottom rounded card container expands instantly or snaps to **100% full-screen height and width**.
  * The dark grid base background and the top card temporarily disappear completely beneath the full-frame footage.
  * The camera scales to a tighter framing on the speaker (digital punch-in of roughly 1.15x–1.2x).
* **Duration:** Typically held for 1.5 to 3.0 seconds before snapping back to the dual rounded-card layout to reveal new visual evidence.

---

## 3. Design Tokens

```json
{
  "colors": {
    "background": "#0B0F17",
    "grid": "#1E293B",
    "cardSurface": "#FFFFFF",
    "cardText": "#0F172A",
    "accentRed": "#EF4444",
    "highlighterYellow": "#FDE047",
    "textPrimary": "#FFFFFF",
    "textMuted": "#94A3B8"
  },
  "typography": {
    "primaryFont": "Inter, SF Pro Display, or Readex Pro (Arabic)",
    "weights": {
      "regular": 400,
      "medium": 500,
      "bold": 700,
      "black": 900
    }
  }
}
```

---

## 4. Reusable Motion Components

### Component A: Step Number Badge (`.step-pill`)
* **Usage:** Introduce numbered takeaways (e.g., Point 1, 2, 3).
* **Structure:** Capsule pill (`padding: 10px 22px`, `border-radius: 999px`, `background: #EF4444`) with centered bold white text.
* **Animation:** Scale from `0.6` to `1.08` to `1.0` using `cubic-bezier(0.34, 1.56, 0.64, 1)` over 200 ms with an outer red glow.
* **Audio:** High-frequency mechanical UI pop (`pop.wav`).

### Component B: Documentation Pull Card (`.doc-card`)
* **Usage:** Display official quotes, change logs, and external sources.
* **Structure:** Pure white floating container (`#FFFFFF`, `border-radius: 28px`, `padding: 32px 40px`, text color `#0F172A`).
* **Header:** Source URL and release date in muted gray (`#64748B`, 12 pt).
* **Marker Wipe:** Translucent yellow rectangle (`#FDE047`) placed beneath key terms, animating left-to-right (`clip-path: inset(0 100% 0 0)` to `inset(0 0% 0 0)`) in sync with spoken audio.
* **Audio:** Soft card slide whoosh (`whoosh.wav`) followed by a marker rub transient.

### Component C: Precision Focus Reticle (`.ui-reticle`)
* **Usage:** Highlight specific buttons, form inputs, or toggles inside UI screen captures.
* **Structure:** Stroke-only rounded rectangle (`border: 3.5px solid #EF4444`, `border-radius: 12px`, transparent fill).
* **Animation:** Scale snap from `1.15` down to `1.0` over 120 ms.
* **Audio:** Tactile click or camera focus tick (`click.wav`).

### Component D: Metric Hero Reveal (`.stat-hero`)
* **Usage:** Emphasize high-impact quantitative stats (e.g., `1/5` price, `16+` tools).
* **Structure:** Heavy display typography paired with an outline pill below defining the parameter.
* **Animation:** Upward spring reveal with a subtle localized shockwave ring.
* **Audio:** Low-end sub impact (`thump.wav`, -8 dB).

### Component E: Mental Model Strikethrough (`.strikethrough-pivot`)
* **Usage:** Visually obsolete a legacy tool in favor of a modern approach.
* **Animation Sequence:**
  1. Old approach text appears in muted white.
  2. Red horizontal rule slashes across the text (`width: 0% -> 100%`, 140 ms).
  3. Old text dims to 35% opacity.
  4. New solution pops in beneath in bright coral text with an overshoot scale.
* **Audio:** Sharp whip-swish on cut, mechanical impact on reveal.

---

## 5. Timing & Audio Engineering Directives

1. **3-Second Visual Shift:** Transition the top visual deck every 2.5 to 3.5 seconds across screen recordings, pull cards, and stat callouts to prevent viewer drop-off.
2. **Audio-Action Pairing:** Every graphic appearance, marker wipe, and card snap must synchronize with an audio transient (-12 dB relative to the primary dialogue track).
3. **Subtitles:** Restrict auto-captions to 1 to 2 words per screen at chest height (`y: 1450px`) so they never obstruct facial expressions or the visual deck.