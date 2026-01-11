export { default as TyroneAvatar } from "./TyroneAvatar";

export type AvatarModelType = "classic" | "tyrone";

export const AVATAR_MODELS = [
  {
    id: "classic" as const,
    name: "Orla",
    description: "Elegant ethereal avatar with expressive features",
    preview: "✨",
  },
  {
    id: "tyrone" as const,
    name: "Tyrone",
    description: "Elegant sophisticated partner with refined features and golden accents",
    preview: "👑",
  },
];
