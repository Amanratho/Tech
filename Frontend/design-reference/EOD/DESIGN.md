---
name: Rentveda Gold
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4f4633'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#817661'
  outline-variant: '#d3c5ad'
  surface-tint: '#795900'
  primary: '#795900'
  on-primary: '#ffffff'
  primary-container: '#fbc02d'
  on-primary-container: '#6c5000'
  inverse-primary: '#f8bd2a'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#4c616c'
  on-tertiary: '#ffffff'
  tertiary-container: '#b6cdd9'
  on-tertiary-container: '#425761'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdfa0'
  primary-fixed-dim: '#f8bd2a'
  on-primary-fixed: '#261a00'
  on-primary-fixed-variant: '#5c4300'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#cfe6f2'
  tertiary-fixed-dim: '#b4cad6'
  on-tertiary-fixed: '#071e27'
  on-tertiary-fixed-variant: '#354a53'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  max-width: 1280px
---

## Brand & Style
The design system embodies a high-performance, premium utility aesthetic tailored for the rental and property management sector. It balances the urgency of financial transactions with the sophisticated clarity required for asset management. The brand personality is authoritative yet energetic, positioning itself as a high-visibility tool for professional landlords and tenants.

The visual style is **Corporate Modern with High-Contrast accents**. It utilizes a refined, systematic approach to information density while leveraging a vibrant amber primary color to draw immediate attention to critical actions like payment, booking, and contract signing. The overall feel is industrious, reliable, and premium, evoking a sense of organized prosperity.

## Colors
The palette is centered around **Gold Amber (#FBC02D)**, used strategically for primary actions and "Rental" status indicators. This high-visibility hue is grounded by a deep Charcoal secondary color for text and structural elements.

- **Primary (Amber):** Used for "Rent" buttons, active navigation states, and primary call-to-actions.
- **Secondary (Charcoal):** Used for headers and primary icons to provide a strong visual anchor.
- **Neutral:** A light gray background system ensures the interface remains airy and readable.
- **Success (Green):** Strictly reserved for profit margins, successful payments, and positive balances.
- **Error (Red):** Used for overdue rent, maintenance alerts, and critical dues.

## Typography
This design system utilizes a trio of typefaces to delineate hierarchy and function. **Hanken Grotesk** provides a sharp, contemporary edge for headlines. **Inter** serves as the workhorse for body content, ensuring maximum legibility in data-heavy views. **JetBrains Mono** is used for labels and financial figures, emphasizing the "Utility" aspect of the system and making numerical data feel precise and technical.

Titles should use tighter letter spacing for a more "premium" feel, while labels should use increased tracking to maintain clarity at small sizes.

## Layout & Spacing
The layout follows a **Fluid Grid** logic with fixed maximum widths for desktop to preserve readability. 

- **Grid:** A 12-column grid is used for desktop, collapsing to 4 columns on mobile.
- **Rhythm:** An 8px linear scaling system (4, 8, 16, 24, 32, 48, 64) governs all padding and margins.
- **Density:** The design system prioritizes a "Comfortable" density for tenant-facing screens and "Compact" density for landlord dashboard views.

## Elevation & Depth
Depth is conveyed through **Tonal Layers and Low-contrast outlines**. 

Rather than heavy shadows, this design system uses soft, 1px borders in a slightly darker neutral shade to define cards. Elevation is indicated by a subtle shift in background color (e.g., a white card on a light gray background). When depth is required for modals or dropdowns, use a high-spread, low-opacity (10%) shadow tinted with the secondary charcoal color to maintain a clean, architectural look.

## Shapes
The shape language is **Soft and Professional**. A consistent 0.25rem (4px) radius is applied to standard components like input fields and buttons to maintain a structured, efficient appearance. Larger containers like cards may use the `rounded-lg` (8px) variant to provide a modern, approachable frame for content.

## Components
- **Buttons:** Primary "Rent" buttons use the Amber color with Charcoal text for maximum contrast. Secondary buttons use a Charcoal outline.
- **Chips:** Used for property status (e.g., "Available", "Occupied"). Use semantic green for available and neutral for occupied.
- **Lists:** Clean, border-bottom separated rows with high vertical padding (16px) to ensure touch targets are accessible on mobile.
- **Input Fields:** Use a subtle light-gray fill with a 1px border. On focus, the border transitions to the Amber brand color.
- **Cards:** White backgrounds with a subtle border. Financial summaries within cards should use the monospaced label font for all currency values.
- **Progress Bars:** Use Amber to show "Lease Completion" or "Payment Progress" to maintain brand consistency throughout the user journey.