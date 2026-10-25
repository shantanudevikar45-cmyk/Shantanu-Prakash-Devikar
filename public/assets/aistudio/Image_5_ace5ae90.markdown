---
name: Taskora Precision Productivity
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#684000'
  on-tertiary: '#ffffff'
  tertiary-container: '#885500'
  on-tertiary-container: '#ffd4a4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  data-tabular:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-md: 1.5rem
  gutter-lg: 2rem
  margin: 1rem
  margin-md: 2rem
  margin-lg: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style
The design system delivers a high-focus, disciplined workspace tailored for engineering and university students navigating complex course loads and relentless deadlines. It merges the calculated rigor of developer tooling (such as Linear and Cron) with the organic, friction-free clarity of modern consumer SaaS (Notion, Todoist). 

The emotional posture is calm, authoritative, and proactive—mitigating academic stress through transparent data organization, razor-sharp visual hierarchy, and instant cognitive capture. Aesthetic direction relies on clean, modern minimalism: pure functionalism, pristine negative space, hairline slate boundaries, crisp tabular metrics, and purposeful semantic signifiers that elevate urgent academic deadlines without inducing visual panic.

## Colors
The color architecture establishes an ergonomic canvas that promotes extended focus during late-night study and high-intensity crunch periods.

- **Primary (`#4F46E5`)**: Deep Electric Indigo anchors focused states, primary action sequences, batch operations, and active tab indicators.
- **Secondary / Success (`#10B981`)**: Emerald Green denotes verified submission states, 100% completed modules, and positive GPA/effort milestones.
- **Tertiary / Warning (`#F59E0B`)**: Amber signifies impending deadlines (within 24–48 hours) and active countdown thresholds requiring immediate triage.
- **Critical / Danger (`#EF4444`)**: Rose/Red highlights overdue deliverables, high-stakes final exams, and critical grade dependencies.
- **Canvas & Surfaces**: The base canvas is `#F8FAFC` (soft off-white), establishing a neutral, low-glare foundation. Cards, data tables, and modal layers float on `#FFFFFF` enclosed by crisp `#E2E8F0` hairline borders.
- **Text Hierarchy**: Dominant typography uses `#0F172A` for primary headlines and data fields, `#64748B` for secondary contextual labels and metadata, and `#94A3B8` for tertiary hints, disabled states, and hairline divider lines.

## Typography
Typography is built entirely upon **Inter**, leveraging its dense vertical metrics and micro-legibility at compact sizes. 

- **Tabular Figures**: All timestamps, remaining duration trackers (`t-minus 03:22:15`), academic weight percentages (`35% of Grade`), and course codes (`ECE 4014`) must explicitly activate `font-variant-numeric: tabular-nums` or `tnum` to maintain vertical alignment across columns and dynamic counter components.
- **Letter Spacing**: Display and header levels enforce negative tracking (-0.01em to -0.025em) to preserve typographic tension, avoiding airy or casual editorial aesthetics. Small labels utilize deliberate positive tracking (+0.04em) in uppercase to guarantee rapid scanning across dense schedule grids.

## Layout & Spacing
The layout follows a fluid 12-column responsive layout engine optimized for information density, fast scanning, and multitasking:

- **Desktop (1280px+)**: 12-column fluid grid, constrained to a maximum content width of 1440px. Supports a persistent 260px collapsible sidebar navigation, a 480px priority stream, and dynamic side-drawers for assignment specs and rubric views. Outer margins use `margin-lg` (3rem) with `gutter-lg` (2rem) between major columns.
- **Tablet (768px - 1279px)**: 8-column layout. Sidebar transitions to an icon-only quick rail or off-canvas overlay. Canvas margins collapse to `margin-md` (2rem) and gutters scale down to `gutter-md` (1.5rem).
- **Mobile (<768px)**: 4-column single-stack arrangement with `margin` (1rem) and `gutter` (1rem). Bottom navigation bar replaces the sidebar; nested tables reflow into discrete, swipeable micro-cards.
- **Rhythm & Padding**: Component interiors adhere strictly to an 8pt base grid (`space-xs` = 4px, `space-sm` = 8px, `space-md` = 12px, `space-lg` = 20px, `space-xl` = 32px). Tight spacing enforces grouping between related attributes (course tag + due date) while isolating distinct assignment clusters.

## Elevation & Depth
Depth is constructed through subtle surface stacking, crisp 1px borders, and whisper-quiet diffuse shadows, entirely avoiding heavy skeuomorphic drops or chaotic layering:

- **Level 0 (Base Canvas)**: `#F8FAFC`. Completely unshadowed. Provides structural anchor for navigation dividers and section markers.
- **Level 1 (Cards, List Items, Task Panels)**: Pure `#FFFFFF` surface bounded by a continuous 1px `#E2E8F0` hairline border, accompanied by an ultra-subtle ambient shadow: `box-shadow: 0 1px 2px 0 rgba(15, 23, 42, 0.04)`.
- **Level 2 (Dropdowns, Popovers, Date Pickers, Hover States)**: Elevated `#FFFFFF` container with `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)` and `#CBD5E1` border for enhanced separation over dense data.
- **Level 3 (Command Menus, Focus Modals, Overlays)**: Floats with `box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`, underpinned by a soft backdrop overlay (`rgba(15, 23, 42, 0.35)` with a 4px blur).

## Shapes
Geometry is calibrated at **Level 2 (Rounded)** to provide an approachable yet precision-engineered aesthetic:
- **Base Components**: Standard inputs, buttons, chips, and notification toasts employ `0.5rem` (8px) corner radii.
- **Containers & Cards (`rounded-lg`)**: Primary cards, assignment lists, course panels, and modal containers use `0.75rem` to `1rem` (12px–16px) radii, pairing naturally with hairline outer borders.
- **Outer Modals & Sheets (`rounded-xl`)**: Top-level command palettes and sliding assignment panels enforce `1.5rem` (24px) for distinct encapsulation.
- **Status Indicators**: Micro status indicators, completion checkboxes, and avatar badges use true circles (`9999px`).

## Components

### Buttons
- **Primary**: Deep indigo background (`#4F46E5`), high-contrast white text (`#FFFFFF`), font weight 500 (`label-md`), height 36px (desktop) / 44px (touch), 8px border radius. Hover: `#4338CA`. Active: `#3730A3`. Focus-visible: 2px ring with 2px offset in `#4F46E5`.
- **Secondary / Subtle**: Pure white surface, 1px `#E2E8F0` border, `#0F172A` text. Hover: `#F1F5F9` background with `#CBD5E1` border.
- **Ghost / Action**: Transparent background, `#64748B` icon/text. Hover: `#F1F5F9`, `#0F172A` text. Used for row-level actions and sorting triggers.

### Chips & Course Tags
- **Base Structure**: Compact height (22px–24px), 6px border radius, uppercase or medium-weight label (`label-sm`), featuring a leading 6px colored dot denoting course subject.
- **Semantic Deadlines**:
  - *Completed*: Light emerald surface (`rgba(16, 185, 129, 0.10)`), text `#059669`.
  - *Approaching*: Light amber surface (`rgba(245, 158, 11, 0.12)`), text `#D97706`.
  - *Overdue / Critical*: Light rose surface (`rgba(239, 68, 68, 0.10)`), text `#DC2626`.

### Cards & Assignment Rows
- **Card**: Pure white surface, 1px `#E2E8F0` border, `rounded-lg` (12px). Interactive cards feature a smooth transition: hover adds 1px `#CBD5E1` border and elevates to Level 2 shadow.
- **List Rows**: Minimal row division with 1px `#F1F5F9` bottom borders. Grid-aligned columns: completion checkbox (col 1), course tag (col 2), assignment title with tabular weight badge (col 3), countdown ticker (col 4), and quick actions menu (col 5). Hover invokes `#F8FAFC` background shift.

### Form Inputs & Date Selectors
- **Fields**: Background `#FFFFFF`, 1px `#E2E8F0` border, text `#0F172A`, placeholder `#94A3B8`, height 38px, `space-md` horizontal padding.
- **Focus**: Border jumps to `#4F46E5` with an exterior `0 0 0 3px rgba(79, 70, 229, 0.15)` focus ring.
- **Monospaced Input Toggles**: Time and date fields enforce tabular numbers (`Inter`, `tnum`).

### Checkboxes & Progress Indicators
- **Checkboxes**: 18x18px squares, 5px radius, 1.5px border `#CBD5E1`. On check: `#10B981` solid background with a clean Lucide `Check` glyph in pure white.
- **Progress Trackers**: 4px slim linear tracks in `#E2E8F0` holding dual-tone indicators reflecting total completed weight versus impending deliverables.

### Specialized Component: Quick Add Command Bar
- Global `Cmd + K` capture bar featuring natural language processing ("Submit Math Lab report by Friday 5pm, 20% weight"). Embedded Lucide icons (Calendar, Clock, Tag) serve as live parsing indicators that dynamically highlight as entities are typed.