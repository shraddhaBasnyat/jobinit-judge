import type { Statement } from "@/components/blind-call/StatementAssess"
import type { FitVerdict, RoleArchetype } from "@/lib/stages/blind-call"

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

// This is JobInit's actual AI output (ground truth) for the case, not
// reviewer-facing copy — field names mirror JobInit's production schema
// vocabulary exactly (jdArchetype, realAsk, candidateArchetype,
// careerArcNote, scenarioId). realAsk here is intentionally independent
// from JDStageState's realAsk.value — that's the reviewer's own typed
// answer, this is the AI's, and they happen to share a name.
export type RevealCaseData = {
  jdArchetype: {
    ideal: RoleArchetype
    couldWork: RoleArchetype[]
  }
  realAsk: string
  candidateArchetype: RoleArchetype
  careerArcNote: {
    transitions: { from: RoleArchetype; to: RoleArchetype }[]
  }
  scenarioId: FitVerdict
  // Longer reasoning behind scenarioId — distinct from FIT_VERDICT_OPTIONS'
  // short `hook` (used for the Fit row's pill body text); this is the
  // Fit Summary row's own longer-form content.
  fitSummary: string
}

// Case data is hardcoded per-stage here (no backend yet, per project scope).
// Other BlindCallStageId keys (revise, done) aren't added until their own
// tickets resolve whether/what case data they need.
export type MockCase = {
  jd: JDSummary
  resume: {
    summary: ResumeSummary
    statements: Statement[]
  }
  reveal: RevealCaseData
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
  reveal: {
    jdArchetype: {
      ideal: "greenfield_builder",
      couldWork: ["founding_engineer", "growth_hire"],
    },
    realAsk:
      "They need someone who can take a fuzzy AI product problem from prototype to production without a platform team behind them, and who already trusts eval/testing rigor enough to build it in from day one.",
    candidateArchetype: "founding_engineer",
    careerArcNote: {
      transitions: [{ from: "growth_hire", to: "founding_engineer" }],
    },
    scenarioId: "invisible_expert",
    fitSummary:
      "The resume's title and framing undersell what's actually there — six years including an EM stint reads as management-track, not hands-on AI builder, even though the JobInit project alone demonstrates exactly the loop this role needs: LangGraph agent design, deterministic + LLM-driven scoring, and a dedicated eval suite built without being asked. The skills are real; the resume just doesn't say them the way an AI-native product team is trained to look for.",
  },
}
