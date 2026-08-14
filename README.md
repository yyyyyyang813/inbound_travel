# Arctic Tern — China Buddy

React + Vite frontend for Arctic Tern's people-led China experiences. The public site is deployed with GitHub Pages and uses Wix Headless for CMS content, member authentication, and availability requests.

## Features

- Search and filter experiences by city and category
- Rule-based Trip Matcher for city, interest, group size, budget, and Buddy preferences
- Experience details with Buddy profiles, itinerary steps, reviews, and location maps
- Buddy directory and editorial Field Notes
- Wix-hosted member sign-in and registration
- Member-only availability request submission
- Responsive support and Buddy application interfaces

## Wix Headless configuration

The public client ID may be configured with `VITE_WIX_CLIENT_ID`. Never put a Wix API key in this repository or in frontend environment variables.

Production content uses these Wix CMS collections:

- `Activities`: experience cards and detail-page content. Activities reference a Buddy using the Buddy `slug`.
- `Buddies`: public host name, portrait, profile, city, languages, interests, hosting count, verification, and publication status.
- `ActivityStep`: ordered itinerary rows linked through `activitySlug`.
- `Review`: ordered guest reviews linked through `activitySlug`.
- `FieldNote`: community-page editorial cards linked to a Buddy through `authorSlug`.
- `Booking`: private member-authored availability requests. Personal data is not publicly readable.
- `SupportMessage`: member support messages. Signed-in members can submit, but only administrators can read or manage entries.
- `BuddyApplication`: prospective Buddy applications. Signed-in members can submit, but only administrators can read or manage entries.

The frontend defaults to those collection IDs. Alternate Wix projects can override them:

```env
VITE_WIX_CLIENT_ID=your-headless-client-id
VITE_WIX_EXPERIENCES_COLLECTION_ID=Activities
VITE_WIX_BUDDIES_COLLECTION_ID=Buddies
VITE_WIX_STEPS_COLLECTION_ID=ActivityStep
VITE_WIX_REVIEWS_COLLECTION_ID=Review
VITE_WIX_FIELD_NOTES_COLLECTION_ID=FieldNote
VITE_WIX_BOOKINGS_COLLECTION_ID=Booking
VITE_WIX_SUPPORT_COLLECTION_ID=SupportMessage
VITE_WIX_BUDDY_APPLICATIONS_COLLECTION_ID=BuddyApplication
```

Public content collections allow anonymous reads and administrator writes. `Booking` allows signed-in members to insert their own request and limits reads to the author and administrators.

## What remains in the frontend

Brand copy, navigation labels, help text, trust statements, search options, footer content, and interface state remain in source code because they are presentation-level copy rather than frequently managed catalog data. Buddy applications and support messages are persisted in private Wix collections. Because submission is available to anonymous visitors, production traffic should be monitored and protected with rate limiting or CAPTCHA if abuse appears.

## Local development

```bash
pnpm install
pnpm dev
```

Production validation:

```bash
pnpm exec tsc --noEmit
pnpm build
```

GitHub Pages deployment runs from `.github/workflows/deploy-pages.yml` after changes reach `main`.
