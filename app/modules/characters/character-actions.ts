type ActionDetails = {
  name: string
  description: string
}

export const characterActionLibrary: Record<string, ActionDetails[]> = {
  Physique: [
    {
      name: "Muscle",
      description: "Apply physical strength, wreck things",
    },
    {
      name: "Travel",
      description: "Run, climb, or swim somewhere",
    },
    {
      name: "Dodge",
      description: "Anticipate an attack and avoid it",
    },
    {
      name: "Misdirect",
      description: "Employ subtle misdirection, slight of hand",
    },
    {
      name: "Sneak",
      description: "Traverse quietly without detection",
    },
  ],
  Insight: [
    {
      name: "Shoot",
      description: "Track and shoot or throw at a target",
    },
    {
      name: "Tinker",
      description: "Create or repair items",
    },
    {
      name: "Interpret",
      description: "Distil information, detect lies, or intuit emotions",
    },
    {
      name: "Notice",
      description: "Pick up on important details or anticipate danger",
    },
    {
      name: "Recall",
      description: "Recall information from memory",
    },
  ],
  Resolve: [
    {
      name: "Focus",
      description: "Maintain concentration",
    },
    {
      name: "Persuade",
      description: "Influence with argument",
    },
    {
      name: "Charm",
      description: "Influence with flattery, charisma, or admiration",
    },
    {
      name: "Comfort",
      description: "Ease someone's emotions",
    },
    {
      name: "Intimidate",
      description: "Threaten or bully someone",
    },
  ],
}
