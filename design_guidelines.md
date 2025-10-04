# Design Guidelines: SPICE Premium Dating App

## Design Approach: Reference-Based
**Primary Reference**: SPICE dating platform aesthetic - sophisticated, premium, adult-focused
**Secondary Inspiration**: High-end lifestyle apps (Tinder Gold, Bumble Premium, Raya)

## Core Design Elements

### A. Color Palette
**Dark Mode Primary** (matches SPICE aesthetic):
- Background: 15 8% 8% (deep charcoal)
- Card backgrounds: 20 6% 12% (warm dark gray)
- Primary brand: 350 85% 55% (sophisticated crimson)
- Text primary: 0 0% 95% (warm white)
- Text secondary: 0 0% 70% (muted gray)

**Accent Colors**:
- Gold premium: 45 90% 65% (luxury gold for premium features)
- Success green: 150 60% 50% (matches/likes)
- Warning amber: 35 85% 60% (notifications)

### B. Typography
**Primary**: Inter (Google Fonts) - clean, modern sans-serif
**Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
**Hierarchy**:
- Hero headlines: text-4xl font-bold
- Section headers: text-2xl font-semibold
- Body text: text-base font-normal
- Captions: text-sm font-medium

### C. Layout System
**Spacing**: Consistent Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section spacing: mb-8, mb-12
- Element margins: m-2, m-4
- Card spacing: gap-4, gap-6

### D. Component Library

**Core UI Elements**:
- Rounded cards (rounded-2xl) with subtle shadows
- Profile photo containers (rounded-full for avatars, rounded-xl for gallery)
- Gradient overlays on hero images for text readability
- Swipe cards with smooth animations and gesture recognition

**Navigation**:
- Bottom tab bar for mobile (fixed positioning)
- Hamburger menu for secondary features
- Floating action buttons for key actions (message, like)

**Forms**:
- Dark-themed input fields with subtle borders
- Premium subscription cards with pricing tiers
- Toggle switches for privacy settings
- Multi-step onboarding forms

**Data Displays**:
- User profile cards with overlay text
- Match notification modals
- Chat message bubbles (sender vs receiver styling)
- Activity feed with timestamps

**Overlays**:
- Profile detail modals (full-screen on mobile)
- Photo gallery lightbox
- Settings panels
- Subscription upgrade prompts

### E. Visual Treatments

**Gradients**:
- Hero overlay: Linear gradient from transparent to dark (opacity 60%)
- Premium feature highlights: Subtle gold gradient (45 90% 65% to 35 85% 55%)
- Card hover states: Gentle purple-to-red gradient for interactive elements

**Background Treatments**:
- Primary backgrounds: Solid dark colors with subtle texture
- Card backgrounds: Slightly lighter than main background for depth
- Premium sections: Subtle gradient overlays to indicate elevated features

## Images
**Hero Image**: Large lifestyle photo showing attractive couples/singles in upscale social settings
**Profile Photos**: High-quality lifestyle images, cocktail parties, travel destinations
**Background Elements**: Subtle abstract patterns or city nightlife scenes as overlays
**Icon Style**: Outline icons from Heroicons for consistency with premium aesthetic

## Key Design Principles
1. **Premium Feel**: Rich colors, quality imagery, sophisticated typography
2. **Discretion**: Tasteful presentation of adult content, privacy-first design
3. **Mobile-First**: Swipe gestures, thumb-friendly navigation, full-screen modals
4. **Trust & Safety**: Clear verification badges, report/block options prominently displayed
5. **Conversion-Focused**: Strategic premium upgrade prompts, clear subscription benefits