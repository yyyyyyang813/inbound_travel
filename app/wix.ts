import { items } from "@wix/data";
import { createClient, media, OAuthStrategy, type Tokens } from "@wix/sdk";

const WIX_CLIENT_ID = import.meta.env.VITE_WIX_CLIENT_ID || "6b93edde-404f-43eb-816e-b43b0b8a525f";
const TOKEN_STORAGE_KEY = "arctic-tern-wix-tokens";
const OAUTH_DATA_KEY = "arctic-tern-wix-oauth-data";

export const WIX_COLLECTIONS = {
  experiences: import.meta.env.VITE_WIX_EXPERIENCES_COLLECTION_ID || "Activities",
  buddies: import.meta.env.VITE_WIX_BUDDIES_COLLECTION_ID || "Buddies",
  activitySteps: import.meta.env.VITE_WIX_STEPS_COLLECTION_ID || "ActivityStep",
  reviews: import.meta.env.VITE_WIX_REVIEWS_COLLECTION_ID || "Review",
  fieldNotes: import.meta.env.VITE_WIX_FIELD_NOTES_COLLECTION_ID || "FieldNote",
  bookingRequests: import.meta.env.VITE_WIX_BOOKINGS_COLLECTION_ID || "Booking",
  supportMessages: import.meta.env.VITE_WIX_SUPPORT_COLLECTION_ID || "SupportMessage",
  buddyApplications: import.meta.env.VITE_WIX_BUDDY_APPLICATIONS_COLLECTION_ID || "BuddyApplication",
};

export type WixContentItem = Record<string, unknown> & { _id?: string };

export function wixImageUrl(value: unknown, fallback: string) {
  if (typeof value !== "string" || !value) return fallback;
  if (!value.startsWith("wix:image://")) {
    if (/^(https?:|data:|\/)/.test(value)) return value;
    return `${import.meta.env.BASE_URL}${value.replace(/^\.\//, "")}`;
  }
  try {
    return media.getImageUrl(value).url;
  } catch {
    return fallback;
  }
}

export type BookingRequestInput = {
  experienceId: string;
  experienceTitle: string;
  preferredDate: string;
  guests: number;
  estimatedTotal: number;
  currency: "USD";
  fullName: string;
  whatsapp: string;
  email: string;
  specialRequests: string;
  preferredPayment: string;
};

export type SupportMessageInput = {
  message: string;
  email: string;
  pageUrl: string;
};

export type BuddyApplicationInput = {
  fullName: string;
  city: string;
  contact: string;
  experienceIdea: string;
  pageUrl: string;
};

const EMPTY_TOKENS: Tokens = {
  accessToken: { value: "", expiresAt: 0 },
  refreshToken: { value: "", role: "none" },
};

const tokenStorage = {
  getTokens(): Tokens {
    if (typeof window === "undefined") return EMPTY_TOKENS;
    const saved = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!saved) return EMPTY_TOKENS;
    try {
      return JSON.parse(saved) as Tokens;
    } catch {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      return EMPTY_TOKENS;
    }
  },
  setTokens(tokens: Tokens) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    }
  },
};

const wixClient = createClient({
  modules: { items },
  auth: OAuthStrategy({ clientId: WIX_CLIENT_ID, tokenStorage }),
});

function publicBaseUrl() {
  return new URL(import.meta.env.BASE_URL, window.location.origin).toString();
}

function readableError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) return String(error.message);
  return "Wix request failed";
}

async function queryCollection(collectionId: string) {
  const result = await wixClient.items.query(collectionId).limit(100).find();
  return result.items as WixContentItem[];
}

export async function loadWixCatalog() {
  const [experienceResult, buddyResult, stepResult, reviewResult, fieldNoteResult] = await Promise.allSettled([
    queryCollection(WIX_COLLECTIONS.experiences),
    queryCollection(WIX_COLLECTIONS.buddies),
    queryCollection(WIX_COLLECTIONS.activitySteps),
    queryCollection(WIX_COLLECTIONS.reviews),
    queryCollection(WIX_COLLECTIONS.fieldNotes),
  ]);

  const experiences = experienceResult.status === "fulfilled" ? experienceResult.value : [];
  const buddies = buddyResult.status === "fulfilled" ? buddyResult.value : [];
  const steps = stepResult.status === "fulfilled" ? stepResult.value : [];
  const reviews = reviewResult.status === "fulfilled" ? reviewResult.value : [];
  const fieldNotes = fieldNoteResult.status === "fulfilled" ? fieldNoteResult.value : [];
  const errors = [experienceResult, buddyResult, stepResult, reviewResult, fieldNoteResult]
    .filter((result): result is PromiseRejectedResult => result.status === "rejected")
    .map((result) => readableError(result.reason));

  return {
    experiences,
    buddies,
    steps,
    reviews,
    fieldNotes,
    connected: experienceResult.status === "fulfilled" || buddyResult.status === "fulfilled",
    errors,
  };
}

export async function beginWixLogin() {
  const redirectUri = publicBaseUrl();
  const oauthData = wixClient.auth.generateOAuthData(redirectUri, window.location.href);
  window.localStorage.setItem(OAUTH_DATA_KEY, JSON.stringify(oauthData));
  const { authUrl } = await wixClient.auth.getAuthUrl(oauthData, { responseMode: "query" });
  window.location.assign(authUrl);
}

export async function completeWixLogin() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("code") && !params.has("error")) return { handled: false, error: "" };

  const saved = window.localStorage.getItem(OAUTH_DATA_KEY);
  if (!saved) return { handled: true, error: "The saved Wix login session could not be found." };

  const oauthData = JSON.parse(saved) as ReturnType<typeof wixClient.auth.generateOAuthData>;
  const parsed = wixClient.auth.parseFromUrl(window.location.href, "query");
  if (parsed.error) return { handled: true, error: parsed.errorDescription || parsed.error };

  const tokens = await wixClient.auth.getMemberTokens(parsed.code, parsed.state, oauthData);
  wixClient.auth.setTokens(tokens);
  window.localStorage.removeItem(OAUTH_DATA_KEY);
  window.history.replaceState({}, "", oauthData.originalUri || publicBaseUrl());
  return { handled: true, error: "" };
}

export function isWixMemberLoggedIn() {
  return wixClient.auth.loggedIn();
}

export async function logoutWixMember() {
  const { logoutUrl } = await wixClient.auth.logout(publicBaseUrl());
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.location.assign(logoutUrl);
}

export async function submitWixBookingRequest(input: BookingRequestInput) {
  return wixClient.items.insert(WIX_COLLECTIONS.bookingRequests, {
    ...input,
    title: `${input.fullName} · ${input.experienceTitle}`,
    activitySlug: input.experienceId,
    activityTitle: input.experienceTitle,
    status: "NEW",
    source: "arctic-tern-headless",
    submittedAt: new Date(),
  });
}

export async function submitWixSupportMessage(input: SupportMessageInput) {
  return wixClient.items.insert(WIX_COLLECTIONS.supportMessages, {
    ...input,
    title: input.email || "Anonymous website message",
    status: "NEW",
    source: "arctic-tern-headless",
    submittedAt: new Date(),
  });
}

export async function submitWixBuddyApplication(input: BuddyApplicationInput) {
  return wixClient.items.insert(WIX_COLLECTIONS.buddyApplications, {
    title: input.fullName,
    city: input.city,
    contact: input.contact,
    experienceIdea: input.experienceIdea,
    pageUrl: input.pageUrl,
    status: "NEW",
    source: "arctic-tern-headless",
    submittedAt: new Date(),
  });
}
