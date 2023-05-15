export type ActionDetails = {
  id: string
  name: string
  description: string
}

export const characterActionLibrary: Record<string, ActionDetails[]> = {
  Physical: [
    {
      id: "Muscle",
      name: "Muscle",
      description: "Apply physical strength, wreck things",
    },
    {
      id: "Travel",
      name: "Move",
      description: "Run, climb, or swim somewhere",
    },
    {
      id: "Dodge",
      name: "Finesse",
      description: "Perform a swift short-distance movement",
    },
    {
      id: "Endure",
      name: "Endure",
      description: "Employ strength of will or body",
    },
    {
      id: "Sneak",
      name: "Sneak",
      description: "Act quietly and discretely",
    },
  ],
  Mental: [
    {
      id: "Focus",
      name: "Focus",
      description: "Employ intellect or strength of mind, avoid distraction",
    },
    {
      id: "Shoot",
      name: "Shoot",
      description: "Track and shoot or throw at a target",
    },
    {
      id: "Tinker",
      name: "Tinker",
      description: "Perform a small-scale dexterous task",
    },
    {
      id: "Notice",
      name: "Notice",
      description: "Pick up on important details or anticipate danger",
    },
    {
      id: "Recall",
      name: "Recall",
      description: "Bring up information from memory",
    },
  ],
  Social: [
    {
      id: "Interpret",
      name: "Interpret",
      description: "Detect lies and intuit emotions",
    },
    {
      id: "Persuade",
      name: "Persuade",
      description: "Influence with argument",
    },
    {
      id: "Charm",
      name: "Charm",
      description: "Influence with flattery or charisma",
    },
    {
      id: "Intimidate",
      name: "Intimidate",
      description: "Threaten or bully someone",
    },
    {
      id: "Comfort",
      name: "Comfort",
      description: "Ease someone's emotions",
    },
  ],
}
