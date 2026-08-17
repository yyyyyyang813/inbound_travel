# Wix CMS content model

This document records the production content model used by the Arctic Tern frontend.

## Public content

| Collection | Purpose | Primary relationship |
| --- | --- | --- |
| `Activities` | Experience listing and detail content | `buddy` may store a Buddy name, title, slug, ID, or reference |
| `Buddies` | Public China Buddy profiles | `slug` is the stable public identifier |
| `ActivityStep` | Ordered itinerary entries | `activitySlug` stores an Activity `slug` |
| `Review` | Ordered guest testimonials | `activitySlug` stores an Activity `slug` |
| `FieldNote` | Editorial cards on the community page | `authorSlug` stores a Buddy `slug` |
| `SiteVisuals` | Global homepage and Community hero images | One `Website Images` item stores both image fields |

All public content collections are readable by visitors and writable only by site administrators. `active` or `status` fields control publication where available. `order` controls display sequence.

`SiteVisuals` uses the stable item ID `global-site-visuals`. Editors replace `homeHeroImage` for the homepage's right-hand image and `communityHeroImage` for the Community hero background.

## Operational data

`Booking` is a custom availability-request collection, not a Wix Bookings reservation or Wix eCommerce order. Signed-in members can create requests. The author and administrators can read the request; only administrators can update or remove it.

Key request fields are `activitySlug`, `activityTitle`, `preferredDate`, `guests`, `estimatedTotal`, `currency`, `fullName`, `whatsapp`, `email`, `specialRequests`, `preferredPayment`, `status`, `source`, and `submittedAt`.

`SupportMessage` stores member support requests. `BuddyApplication` stores prospective Buddy introductions. Both require a signed-in Wix member for inserts, while reads, updates, and removals are restricted to administrators.

## Migration

The original `Import1` and `Import2` records were migrated into `Activities` and `Buddies`. Itinerary, review, and editorial data were normalized into their related collections before the legacy imports were retired. Stable slug fields are used instead of display titles so editors may rename public content without breaking relationships.

## Intentionally code-managed

Brand and campaign copy, navigation labels, help and trust text, search option labels, footer content, and component behavior remain in the frontend. Anonymous support and Buddy application submission should be monitored and upgraded with rate limiting or CAPTCHA if abuse appears.
