# Wix CMS content model

This document records the production content model used by the Arctic Tern frontend.

## Public content

| Collection | Purpose | Primary relationship |
| --- | --- | --- |
| `Activities` | Experience listing and detail content | `buddy` stores a Buddy `slug` |
| `Buddies` | Public China Buddy profiles | `slug` is the stable public identifier |
| `ActivityStep` | Ordered itinerary entries | `activitySlug` stores an Activity `slug` |
| `Review` | Ordered guest testimonials | `activitySlug` stores an Activity `slug` |
| `FieldNote` | Editorial cards on the community page | `authorSlug` stores a Buddy `slug` |

All public content collections are readable by visitors and writable only by site administrators. `active` or `status` fields control publication where available. `order` controls display sequence.

## Operational data

`Booking` is a custom availability-request collection, not a Wix Bookings reservation or Wix eCommerce order. Signed-in members can create requests. The author and administrators can read the request; only administrators can update or remove it.

Key request fields are `activitySlug`, `activityTitle`, `preferredDate`, `guests`, `estimatedTotal`, `currency`, `fullName`, `whatsapp`, `email`, `specialRequests`, `preferredPayment`, `status`, `source`, and `submittedAt`.

## Migration

The original `Import1` and `Import2` records were migrated into `Activities` and `Buddies`. Itinerary, review, and editorial data were normalized into their related collections before the legacy imports were retired. Stable slug fields are used instead of display titles so editors may rename public content without breaking relationships.

## Intentionally code-managed

Brand and campaign copy, navigation labels, help and trust text, search option labels, footer content, and component behavior remain in the frontend. Buddy application and support-message submission remain disabled as data writes until a protected endpoint with validation, rate limiting, and anti-spam controls is available.
