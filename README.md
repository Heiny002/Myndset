# Myndset

**AI-Powered Performance Meditation for Ambitious Professionals**

Myndset reframes meditation from wellness/stress-relief to a **performance optimization tool** for ambitious professionals. Our AI generates personalized meditation scripts based on comprehensive psychological assessment, then converts them to professional audio.

## Target Audience

Entrepreneurs, sales professionals, athletes, and executives aged 22-32 who view meditation as:
- A competitive advantage
- A business investment
- A tool for peak performance

## Key Differentiators

1. **AI-driven personalization** based on psychological assessment
2. **State-specific meditations** for various mental states (high-energy, intense, focused)
3. **Goal-oriented outcomes** (close deals, win competitions, nail presentations)
4. **Performance-focused messaging** - "meditation for boardrooms, not yoga studios"

## Tech Stack

- **Frontend**: Next.js 14+ with TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI Services**: Anthropic Claude (script generation), ElevenLabs (voice synthesis)
- **Payments**: Stripe
- **Hosting**: Vercel

## MVP Features

- Progressive Web App (mobile-optimized, installable)
- Three-tier questionnaire system (8 + 5 + 10 questions)
- Two-step AI generation (plan approval → script generation)
- Magic link authentication (passwordless)
- Freemium model: 1 free meditation, then $9 Basic or $19 Premium tiers
- Remix feature: regenerate specific script sections

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your API keys

# Run development server
npm run dev
```

## Project Structure

```
/app          - Next.js App Router pages and API routes
/components   - Reusable React components
/lib          - Utility functions and configurations
/types        - TypeScript type definitions
```

## Environment Variables

See `.env.example` for required environment variables:
- Supabase credentials
- Anthropic API key
- ElevenLabs API key
- Stripe keys
- Email service credentials

## License

Proprietary - All rights reserved

---

Built by Jim Heiny | [TryMyndset.com](https://trymyndset.com)
