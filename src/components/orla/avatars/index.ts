export { default as RealisticAvatar } from "./RealisticAvatar";
export { default as AnimeAvatar } from "./AnimeAvatar";
export { default as RoboticAvatar } from "./RoboticAvatar";

export type AvatarModelType = "classic" | "realistic" | "anime" | "robotic";

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
];
