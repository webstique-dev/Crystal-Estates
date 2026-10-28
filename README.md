# Crystal Estates — Premium Real Estate Website

A modern, responsive real estate web application for Crystal Estates, featuring DTCP & CMDA approved residential plots in Chennai.

## Tech Stack
- **Framework:** React 19 + Vite
- **Styling:** CSS variables & responsive design system
- **Animations:** GSAP 3 (GreenSock) + ScrollTrigger, Framer Motion
- **Icons:** Lucide React
- **Linting:** ESLint 9+

## Local Development
```bash
npm install
npm run dev      # Starts Vite development server
npm run build    # Creates optimized production build in /dist
npm run lint     # Runs ESLint checks
npm run preview  # Previews production build locally
```

## Project Structure
- `src/data/site.js`: Single source of truth for all site data (business info, plots, team, reviews, FAQs).
- `src/components/sections/`: Website sections (Hero, About, Team, Plots, Features, Process, Testimonials, FAQ, Contact, Footer).
- `src/components/ui/`: Reusable design components and botanical leaf decorations.
- `src/lib/gsap.js`: Centralized GSAP and ScrollTrigger setup.
- `src/index.css`: Design tokens, layout primitives, and responsive styling.

## Deployment to Vercel
This repository is configured with `vercel.json` for one-click deployment:
1. Push this repository to GitHub.
2. Import the repository in [Vercel Dashboard](https://vercel.com/new).
3. Vercel automatically detects Vite, sets the build command to `npm run build`, and outputs to `dist`.
