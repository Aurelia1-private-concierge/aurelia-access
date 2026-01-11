export { default as RealisticAvatar } from "./RealisticAvatar";
export { default as AnimeAvatar } from "./AnimeAvatar";
export { default as RoboticAvatar } from "./RoboticAvatar";
export { default as FantasyElfAvatar } from "./FantasyElfAvatar";
export { default as SteampunkAvatar } from "./SteampunkAvatar";
export { default as MinimalistAvatar } from "./MinimalistAvatar";

export type AvatarModelType = "classic" | "realistic" | "anime" | "robotic" | "elf" | "steampunk" | "minimalist";

export const AVATAR_MODELS = [
  {
    id: "classic" as const,
    name: "Classic Orla",
    description: "Elegant ethereal avatar with expressive features",
    preview: "✨",
  },
  {
    id: "realistic" as const,
    name: "Realistic",
    description: "Photorealistic human-like avatar with natural skin tones",
    preview: "👤",
  },
  {
    id: "anime" as const,
    name: "Anime",
    description: "Stylized anime character with large expressive eyes",
    preview: "🌸",
  },
  {
    id: "robotic" as const,
    name: "Robotic",
    description: "Futuristic AI robot with LED displays and holographics",
    preview: "🤖",
  },
  {
    id: "elf" as const,
    name: "Fantasy Elf",
    description: "Ethereal elven avatar with pointed ears and magical runes",
    preview: "🧝",
  },
  {
    id: "steampunk" as const,
    name: "Steampunk",
    description: "Victorian mechanical avatar with gears, brass, and steam",
    preview: "⚙️",
  },
  {
    id: "minimalist" as const,
    name: "Minimalist",
    description: "Clean geometric avatar with low-poly aesthetic",
    preview: "◆",
  },
];
