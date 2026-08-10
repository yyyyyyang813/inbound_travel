# Arctic Tern · China Buddy

A responsive front-end prototype for people-led inbound travel experiences in China.

## Features

- Experience discovery, search, categories and saved favorites
- Buddy-led experience pages with itinerary, reviews and location maps
- Become a Buddy community and application page
- Floating customer support and message panel
- Booking request and checkout preview
- Wix Headless member authentication, CMS catalog sync and booking request storage
- Responsive desktop and mobile layouts

## Wix Headless setup

The frontend uses Wix Headless client `6b93edde-404f-43eb-816e-b43b0b8a525f`. A Wix Headless client ID is public and does not require a client secret in browser code. Never add a Wix API key to this repository.

In the Wix Studio account that owns the Headless project:

1. Install Wix Members Area and publish the Wix site connected to the Headless project.
2. In **Settings → Development & integrations → Headless Settings**, add this exact allowed authorization redirect URI:

   `https://yyyyyyang813.github.io/inbound_travel/`

3. Add `yyyyyyang813.github.io` as an allowed redirect domain.
4. Enable Dev Mode/Data APIs and create these case-sensitive CMS collection IDs:

### `Experiences`

Allow **Anyone** to read. Keep create, update and delete restricted to CMS collaborators or admins.

Required fields: `slug`, `title`, `category`, `city`, `price`.

Supported optional fields: `kicker`, `duration`, `rating`, `reviews`, `image`, `image2`, `buddyName`, `buddyImage`, `buddyRole`, `intro`, `groupSize`, `quote`, `mapUrl`, `mapLabel`, `comments`, `steps`.

### `Buddies`

Allow **Anyone** to read. Keep create, update and delete restricted to CMS collaborators or admins.

Fields: `name`, `photo`, `focus`, `city`, `guestDays`.

### `BookingRequests`

Allow logged-in site members to create items. For personal-data safety, restrict reads and updates to the item author and CMS collaborators/admins; restrict deletion to admins.

Fields: `experienceId`, `experienceTitle`, `preferredDate`, `guests`, `estimatedTotal`, `currency`, `fullName`, `whatsapp`, `email`, `specialRequests`, `preferredPayment`, `status`, `source`, `submittedAt`.

Until these collections exist and permissions are enabled, the site keeps showing its built-in preview catalog. Booking submissions intentionally remain unavailable.

Optional build-time overrides:

```bash
VITE_WIX_CLIENT_ID=...
VITE_WIX_EXPERIENCES_COLLECTION_ID=Experiences
VITE_WIX_BUDDIES_COLLECTION_ID=Buddies
VITE_WIX_BOOKINGS_COLLECTION_ID=BookingRequests
```

## Local development

```bash
pnpm install
pnpm dev
```

Create a production build with `pnpm build`. The site is deployed to GitHub Pages by the workflow in `.github/workflows/pages.yml`.
