# Sarah AI | سارة

Prototype PWA for iPhone and iPad. This is **not** a connected autonomous assistant yet.

## What works
- Arabic, English, German, Russian UI
- Tasks and notes (stored in this browser only)
- Daily report draft (not AI-generated)
- Built-in speech synthesis (voice availability varies per device)
- Installable web app shell (once deployed over HTTPS)

## Publish to Vercel
1. Sign in at https://vercel.com with the GitHub account that owns this repository.
2. New Project > Import `Sara` > Deploy (Next.js defaults).
3. Open the HTTPS deployment link on iPhone/iPad Safari > Share > Add to Home Screen.

## Important
Do not store private client data in this prototype. It lacks authentication and cross-device sync. WhatsApp, Google Calendar, AI and dedicated Sarah voice have not yet been integrated.

## Local
Node.js 20.9+; `npm install`, then `npm run dev`.
