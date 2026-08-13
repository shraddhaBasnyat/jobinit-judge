import type { Statement } from "@/components/blind-call/StatementAssess"

export type JDSummary = {
  badgeLabel: string
  roleTitle: string
  team: string
  whatYoullDo: string
  whatWereLookingFor: string
}

export type ResumeSummary = {
  badgeLabel: string
  roleTitle: string
}

// Case data is hardcoded per-stage here (no backend yet, per project scope).
// Only jd and resume are populated — other BlindCallStageId keys aren't
// added until their own tickets resolve whether/what case data they need.
export type MockCase = {
  jd: JDSummary
  resume: {
    summary: ResumeSummary
    statements: Statement[]
  }
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
  resume: {
    summary: {
      badgeLabel: "Resume",
      roleTitle: "Staff Software Engineer",
    },
    statements: [
      {
        id: "current-jobinit",
        statement:
          "Current: Built JobInit.app, a LangGraph-based AI agent that combines deterministic scoring with LLM-driven analysis, backed by a dedicated human-annotation and eval suite.",
      },
      {
        id: "image-selection-engine",
        statement:
          "Designed a image-selection rules engine that ranked catalog images using real-time customer journey signals and multi-armed bandit testing. One of the company's first production proof points for personalization.",
      },
      {
        id: "swe-to-staff",
        statement:
          "Progressed from Software Engineer to Engineering Manager to Staff Engineer over six years on, taking on org-wide architecture mandates like retiring a legacy data-access layer used by the entire core customer funnel.",
      },
    ],
  },
}
