import locationsData from "@/data/locations.json";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://streetfoodrey.com").replace(/\/$/, "");
export const GTM_ID = "GTM-PRJTLQX";
export const PHONE = locationsData.phone;
export const PHONE_HREF = `tel:${PHONE.replace(/\s+/g, "")}`;
export const TIMEZONE = locationsData.timezone;

export const SOCIAL = {
  instagram: "https://www.instagram.com/streetfoodrey/",
  facebook: "https://www.facebook.com/streetfoodrey/",
};

/** Delivery fee in EUR — placeholder, adjust as needed. */
export const DELIVERY_FEE = 2;

/**
 * Catering video. Set a YouTube ID (preferred) or drop an MP4 at
 * public/videos/catering.mp4 and leave youtubeId empty.
 */
export const CATERING_VIDEO = {
  youtubeId: "",
  mp4: "/videos/catering.mp4",
  poster: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600&q=80",
};
