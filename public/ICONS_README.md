# PWA Icons Guide

This directory needs the following icon files for PWA functionality:

## Required Icons

1. **favicon.ico** (32x32)
   - Standard favicon for browsers
   - Format: ICO

2. **icon-192.png** (192x192)
   - PWA minimum icon size
   - Format: PNG with transparency
   - Background: Transparent or #0a0a0a

3. **icon-512.png** (512x512)
   - PWA high-res icon
   - Format: PNG with transparency
   - Background: Transparent or #0a0a0a

4. **apple-touch-icon.png** (180x180)
   - iOS home screen icon
   - Format: PNG
   - Background: Should be opaque (#0a0a0a)
   - Note: iOS adds rounded corners automatically

5. **og-image.png** (1200x630)
   - Open Graph image for social sharing
   - Format: PNG or JPG
   - Include: Logo, tagline "Meditation for boardrooms, not yoga studios"
   - Background: #0a0a0a with primary accent #00ff88

6. **screenshot-1.png** (1170x2532)
   - Mobile PWA screenshot (narrow)
   - Show: Dashboard or meditation player on mobile

7. **screenshot-2.png** (2048x1536)
   - Desktop/tablet PWA screenshot (wide)
   - Show: Dashboard or landing page on desktop

## Design Guidelines

- **Brand Colors**:
  - Background: #0a0a0a (dark)
  - Primary: #00ff88 (bright green)
  - Neutral: #e5e5e5 (light gray for text)

- **Logo Style**:
  - Clean, modern, minimalist
  - Should work well at small sizes
  - Consider using "M" monogram or brain/wave icon

## Generation Tools

You can use these tools to generate icons:
- [Favicon Generator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- Design tools: Figma, Adobe XD, Canva

## Testing

After adding icons, test PWA installation:
1. Open app in Chrome/Edge
2. Look for "Install" button in address bar
3. Install to home screen
4. Verify icon appears correctly
5. Test offline functionality with service worker
