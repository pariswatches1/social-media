export const PLATFORMS = [
  { id: "instagram", label: "Instagram", color: "#E1306C", bg: "rgba(225,48,108,0.1)", border: "rgba(225,48,108,0.3)", limit: 2200 },
  { id: "linkedin", label: "LinkedIn", color: "#0A66C2", bg: "rgba(10,102,194,0.1)", border: "rgba(10,102,194,0.3)", limit: 3000 },
  { id: "twitter", label: "X / Twitter", color: "#e7e9ea", bg: "rgba(231,233,234,0.08)", border: "rgba(231,233,234,0.25)", limit: 280 },
  { id: "tiktok", label: "TikTok", color: "#FF0050", bg: "rgba(255,0,80,0.1)", border: "rgba(255,0,80,0.3)", limit: 2200 },
  { id: "reddit", label: "Reddit", color: "#FF4500", bg: "rgba(255,69,0,0.1)", border: "rgba(255,69,0,0.3)", limit: 40000 },
  { id: "facebook", label: "Facebook", color: "#1877F2", bg: "rgba(24,119,242,0.1)", border: "rgba(24,119,242,0.3)", limit: 63206 },
  { id: "snapchat", label: "Snapchat", color: "#FFFC00", bg: "rgba(255,252,0,0.08)", border: "rgba(255,252,0,0.25)", limit: 250 },
] as const;

export type PlatformId = (typeof PLATFORMS)[number]["id"];

export function getPlatformById(id: string) {
  return PLATFORMS.find((p) => p.id === id);
}

export function getPlatformLabel(id: string): string {
  return PLATFORMS.find((p) => p.id === id)?.label ?? id;
}

export function getPlatformColor(id: string): string {
  return PLATFORMS.find((p) => p.id === id)?.color ?? "#4a5568";
}

const BEST_TIMES: Record<string, string> = {
  instagram: "Tue-Fri 9-11am",
  linkedin: "Tue-Thu 7-8am, 12pm",
  twitter: "Mon-Fri 8-10am",
  tiktok: "Tue-Thu 7-9pm",
  reddit: "Mon-Wed 8-10am",
  facebook: "Wed-Fri 1-4pm",
  snapchat: "Sat-Sun 10pm-1am",
};

export function getBestTime(platform: string): string {
  return BEST_TIMES[platform] ?? "Tue-Thu 9am-12pm";
}
