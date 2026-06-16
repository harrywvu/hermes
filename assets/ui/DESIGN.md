---
name: Hermes Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  display:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is built for a modern HRMS SaaS, emphasizing efficiency, speed, and reliability. The brand personality is professional and premium, drawing heavy influence from high-end B2B interfaces like Linear and Stripe. It balances a utilitarian core with sophisticated visual flair.

The style is **Modern / Corporate**, characterized by:
- **Precision:** Tight alignment and consistent geometry.
- **Airiness:** High levels of negative space to reduce cognitive load during complex HR tasks.
- **Subtle Dynamism:** The use of the primary gradient is restricted to key actions and indicators to maintain a high-signal environment.
- **Symbolism:** The winged hat logo is used sparingly as a monochrome mark for navigation or as a subtle watermark in empty states, representing the "messenger" and "facilitator" aspect of HR technology.

## Colors
The palette is centered on a "clean-canvas" approach. The primary gradient (Blue to Cyan) is the signature of the design system, used for high-impact elements like primary buttons, active progress bars, and brand highlights.

- **Surfaces:** We utilize a tiered background strategy. The main application background is a cool light gray (`#F8FAFC`), while interactive cards and content containers are pure white (`#FFFFFF`) to create distinct separation.
- **Text:** High-contrast slate colors ensure readability.
- **Status:** Semantics follow industry standards but use slightly softened, modern saturation levels to feel integrated with the professional aesthetic.

## Typography
This design system utilizes **Geist** for its technical precision and neutral clarity. The typographic scale is optimized for high information density without sacrificing legibility. 

- **Weighting:** Headlines use Semi-Bold (`600`) to create strong hierarchy against the Regular (`400`) body text. 
- **Tracking:** We apply subtle negative letter-spacing on larger headlines to give them a "tighter," more premium editorial feel. 
- **Utility:** Small caps are reserved for table headers and section labels to provide structure without clutter.

## Layout & Spacing
The layout follows a **Fluid Grid** philosophy within a max-width container for desktop efficiency.

- **Grid Model:** A 12-column system is used for dashboard layouts. On desktop, we utilize a 240px fixed sidebar with a fluid content area.
- **Rhythm:** An 8px base grid governs all spatial decisions. Padding inside cards is generous (typically `24px` or `32px`) to emphasize the premium SaaS aesthetic.
- **Breakpoints:**
  - **Mobile (<768px):** 1-column layout, 16px margins, sidebars collapse into a bottom navigation or "hamburger" menu.
  - **Tablet (768px - 1024px):** 6-column layout, 24px margins, condensed sidebars.
  - **Desktop (>1024px):** Full 12-column layout, 32px margins.

## Elevation & Depth
Hierarchy is achieved through **Tonal Layers** and **Ambient Shadows**.

- **Level 0 (Background):** `#F8FAFC` - The base of the application.
- **Level 1 (Cards/Surfaces):** Pure white background with a 1px border (`#E2E8F0`) and a soft, highly diffused shadow: `0px 4px 12px rgba(0, 0, 0, 0.03)`.
- **Level 2 (Dropdowns/Modals):** Pure white with a more pronounced shadow to indicate floating: `0px 12px 32px rgba(0, 0, 0, 0.08)`.
- **Focus States:** Primary blue glow with 20% opacity to highlight interactive elements during keyboard navigation.

## Shapes
The shape language is "Extra Rounded" to offset the seriousness of HR data with a modern, approachable feel.

- **Cards/Containers:** Use `rounded-2xl` (1.5rem / 24px) to define the primary content areas.
- **Buttons/Inputs:** Use `rounded-xl` (0.75rem / 12px) to provide a comfortable, tactile feel that isn't fully circular.
- **Badges:** Use a full pill shape for status indicators to make them instantly recognizable as non-button elements.

## Components
- **Buttons:**
  - **Primary:** Features the brand gradient, white text, and a subtle inner-glow on top.
  - **Secondary:** White background with a `#E2E8F0` border and slate text.
- **Input Fields:** Minimum height of 44px. Background is white, border is light gray, transitioning to a primary blue border on focus. Labels sit outside the field in `label-md` style.
- **Status Badges:** Use a "soft-tint" approach. E.g., a Success badge has a 10% opacity green background with 100% opacity green text.
- **Cards:** The core container of the system. Always white, `rounded-2xl`, with the Level 1 shadow.
- **Progress Bars:** Use the primary gradient for the fill and a light gray for the track, with a `height` of 6px and fully rounded caps.
- **Data Tables:** Row-based with no vertical borders. Alternating light gray rows or a subtle hover state (`#F1F5F9`) to guide the eye.