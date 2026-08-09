---
name: Professional Career Hub
colors:
  surface: '#f8f9ff'
  surface-dim: '#d1dbec'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dfe9fa'
  surface-container-highest: '#d9e3f4'
  on-surface: '#121c28'
  on-surface-variant: '#434654'
  inverse-surface: '#27313e'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c5d7'
  surface-tint: '#1353d8'
  primary: '#003fb1'
  on-primary: '#ffffff'
  primary-container: '#1a56db'
  on-primary-container: '#d4dcff'
  inverse-primary: '#b5c4ff'
  secondary: '#006c4a'
  on-secondary: '#ffffff'
  secondary-container: '#82f5c1'
  on-secondary-container: '#00714e'
  tertiary: '#852b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#ad3b00'
  on-tertiary-container: '#ffd4c5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b5c4ff'
  on-primary-fixed: '#00174d'
  on-primary-fixed-variant: '#003dab'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#802a00'
  background: '#f8f9ff'
  on-background: '#121c28'
  surface-variant: '#d9e3f4'
typography:
  display-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  section-gap: 64px
---

## Brand & Style

This design system is built for a professional, efficient, and trustworthy job board environment. The aesthetic follows a **Corporate / Modern** approach, emphasizing clarity and systematic organization to reduce cognitive load for both recruiters and job seekers.

The visual language focuses on reliability and career growth. It utilizes a refined balance of generous white space, subtle tonal layering, and precise typography to convey a sense of institutional stability mixed with modern tech-forward efficiency. The interface should feel "quiet" but powerful, allowing the content (job listings and candidate profiles) to take center stage.

## Colors

The palette is anchored by **Primary Deep Blue (#1A56DB)**, symbolizing trust, authority, and professionalism. This color is reserved for primary actions, active navigation states, and brand-critical elements.

**Success Green (#059669)** is used strategically for positive affirmations: "Applied" statuses, open positions, and salary indicators.

The neutral scale is heavily utilized to create hierarchy. **#111827** is used for primary headings, while **#4B5563** handles body text. Backgrounds utilize a very light gray **(#F9FAFB)** to allow white cards to "pop" via elevation rather than heavy borders.

## Typography

The typography uses **Be Vietnam Pro** to provide a contemporary, localized feel that handles Vietnamese diacritics with exceptional elegance. 

- **Headlines:** Use Bold (700) or SemiBold (600) weights with tighter letter spacing for a grounded, editorial look.
- **Body Text:** Use Regular (400) weight for maximum readability in job descriptions and candidate bios.
- **Labels:** Use Medium (500) weight for buttons and metadata (location, time posted) to ensure they remain distinct from body copy.
- **Scale:** Maintain a strict vertical rhythm based on a 4px baseline grid.

## Layout & Spacing

The design system employs a **Fixed Grid** model for desktop, centered on a 1280px container with 12 columns. 

- **Vertical Rhythm:** Use the `stack` variables for internal component spacing. `stack-sm` for related metadata, `stack-md` for paragraph spacing within job descriptions.
- **Mobile Adaptivity:** On mobile, margins shrink to 16px. Grids collapse to a single column. Job cards should utilize full width minus the 16px margins.
- **Sectioning:** Use large `section-gap` values to clearly separate search functionality, featured jobs, and footer areas, creating a breathable, non-claustrophobic experience.

## Elevation & Depth

This design system utilizes **Tonal Layers** combined with **Ambient Shadows** to create a structured hierarchy of information.

- **Level 0 (Background):** #F9FAFB. Used for the main canvas.
- **Level 1 (Cards/Containers):** #FFFFFF. Used for job cards, profile summaries, and input containers. These should feature a subtle, soft shadow: `0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px rgba(0,0,0,0.06)`.
- **Level 2 (Hover/Active):** When a user hovers over a job card, the elevation should increase with a more pronounced shadow to indicate interactivity: `0px 10px 15px -3px rgba(0,0,0,0.1)`.
- **Level 3 (Modals/Dropdowns):** Deep shadows to separate from the main UI content.
- **Outlines:** Use a 1px border of #E5E7EB for cards at rest to maintain definition against the light background.

## Shapes

The shape language is **Rounded (0.5rem / 8px)**, striking a balance between friendly approachability and professional structure.

- **Standard Elements:** Buttons, Input fields, and Job Cards use `8px` corner radius.
- **Large Elements:** Featured sections or hero banners use `16px` (rounded-lg).
- **Tags/Chips:** Category tags use `rounded-full` (pill-shaped) to distinguish them from actionable buttons and static cards.

## Components

### Job Cards
- **Structure:** White background, 1px light gray border, 8px corner radius.
- **Content:** Top-left company logo (48x48px), top-right "Save" icon. Title in `title-md` (Blue #1A56DB), company name in `body-sm`.
- **Metadata:** Use `label-sm` with small icons for location and salary range.

### Search Bars
- **Design:** Elevated white container with a 48px height. 
- **Interaction:** Inner dividers between "Job Title" and "Location" inputs. Primary Blue button on the far right.

### Category Tags (Chips)
- **Design:** Pill-shaped. 
- **Style:** Background #EFF6FF (Light blue tint) with text #1E40AF (Dark blue) for categories like "Toàn thời gian" or "Từ xa".

### Candidate Profile Summaries
- **Structure:** Horizontal layout. 
- **Avatar:** Circular (64px) with a subtle border.
- **Status:** Use Success Green (#059669) for "Sẵn sàng làm việc" (Open to work) indicators.

### Buttons
- **Primary:** Solid #1A56DB with White text.
- **Secondary:** Transparent background with #1A56DB border and text.
- **States:** Hover state for primary buttons should be #1E429F (slightly darker blue).