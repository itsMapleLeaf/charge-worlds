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
      description: "Quickly move from your current position to someplace else",
    },
    {
      name: "Dodge",
      description: "Anticipate an attack and dextrously avoid it",
    },
    {
      name: "Misdirect",
      description: "Employ subtle misdirection and/or slight of hand",
    },
    {
      name: "Sneak",
      description: "Traverse quietly without detection",
    },
  ],
  Insight: [
    {
      name: "Shoot",
      description: "Track and shoot at a target, including throwing",
    },
    {
      name: "Tinker",
      description: "Create and/or repair items",
    },
    {
      name: "Interpret",
      description:
        "Gather and distil information, or read a person's emotions and statements",
    },
    {
      name: "Notice",
      description: "Pick up on important details, anticipate danger",
    },
    {
      name: "Recall",
      description: "Recall information from memory",
    },
  ],
  Resolve: [
    {
      name: "Focus",
      description: "Maintain concentration in the face of distraction",
    },
    {
      name: "Persuade",
      description: "Influence with argument",
    },
    {
      name: "Charm",
      description: "Butter up to someone to get on their good side",
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
