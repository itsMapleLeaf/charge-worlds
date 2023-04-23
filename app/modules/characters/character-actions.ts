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
      name: "Travel",
      description: "Run, climb, or swim somewhere",
    },
    {
      id: "Dodge",
      name: "Dodge",
      description: "Move swiftly",
    },
    {
      id: "Endure",
      name: "Endure",
      description: "Employ strength of will or body",
    },
    {
      id: "Sneak",
      name: "Sneak",
      description: "Traverse quietly without detection",
    },
  ],
  Mental: [
    {
      id: "Focus",
      name: "Focus",
      description: "Employ strength of mind",
    },
    {
      id: "Shoot",
      name: "Shoot",
      description: "Track and shoot or throw at a target",
    },
    {
      id: "Tinker",
      name: "Tinker",
      description: "Carry out a dexterous task",
    },
    {
      id: "Notice",
      name: "Notice",
      description: "Pick up on important details or anticipate danger",
    },
    {
      id: "Recall",
      name: "Recall",
      description: "Recall information from memory",
    },
  ],
  Social: [
    {
      id: "Interpret",
      name: "Interpret",
      description: "Distil information, detect lies, or intuit emotions",
    },
    {
      id: "Persuade",
      name: "Persuade",
      description: "Influence with argument",
    },
    {
      id: "Charm",
      name: "Charm",
      description: "Influence with flattery, charisma, or admiration",
    },
    {
      id: "Comfort",
      name: "Comfort",
      description: "Ease someone's emotions",
    },
    {
      id: "Intimidate",
      name: "Intimidate",
      description: "Threaten or bully someone",
    },
  ],
}
