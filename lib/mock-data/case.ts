export type JDSummary = {
  badgeLabel: string
  roleTitle: string
  team: string
  whatYoullDo: string
  whatWereLookingFor: string
}

// Case data is hardcoded per-stage here (no backend yet, per project scope).
// Only jd is populated — other BlindCallStageId keys aren't added until
// their own tickets resolve whether/what case data they need.
export type MockCase = {
  jd: JDSummary
}

export const MOCK_CASE: MockCase = {
  jd: {
    badgeLabel: "JD",
    roleTitle: "Senior Product Engineer, Cresta Labs",
    team: "Small, high-ownership team building next-generation AI-native product experiences — product engineering, applied AI, user research, and design.",
    whatYoullDo:
      "Full product loop: identifying user needs, prototyping, evaluating quality, partnering with product/engineering to ship.",
    whatWereLookingFor:
      "Looking for 5+ years as a software/ML engineer on user-facing systems, hands-on LLM/AI agent/AI workflow experience, strong product judgment, comfort in ambiguity, ability to move fast from idea to prototype without sacrificing rigor. Bonus: experience building eval/testing frameworks for ML systems.",
  },
}
