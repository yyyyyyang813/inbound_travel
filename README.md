# LOOP Shenzhen

An interactive, mobile-first prototype for an inbound travel marketplace in Shenzhen. It implements the product brief with:

- city/date/service discovery and instant category filters
- editorial experience cards and local favorites
- detailed itinerary, trust, host and review content
- a sticky availability/booking widget
- a magazine-style community surface
- contact capture and payment-method checkout preview

## Run locally

```bash
npm install
npm run dev
```

Production validation:

```bash
npm run build
```

## Backend boundary

The first version intentionally keeps booking and favorites in browser storage so the full journey can be reviewed without committing to a provider. The UI is ready to be connected to an API adapter with four capabilities:

1. identity (`signIn`, `signOut`, `currentUser`)
2. catalog (`listExperiences`, `getExperience`)
3. booking (`requestAvailability`, `createCheckoutSession`)
4. community (`listPosts`, `getPost`)

A SaaS provider such as Wix can own the catalog, contacts and orders; Stripe or PayPal can own payment; and the front end can remain unchanged behind that adapter.

