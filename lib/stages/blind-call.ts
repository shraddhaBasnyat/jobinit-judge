import type { JDStageState } from "@/lib/stages/jd"
import type { ResumeStageState } from "@/lib/stages/resume"

export type BlindCallStageId = "jd" | "resume" | "fit" | "reveal" | "revise" | "done"

export type BlindCallState = {
  currentStageId: BlindCallStageId
  jd: JDStageState
  resume: ResumeStageState
  // fit / reveal / revise / done — no fields yet, no ticket builds these;
  // render as placeholder stage content until they have real tickets
}

export const STAGE_META: { id: BlindCallStageId; label: string }[] = [
  { id: "jd", label: "JD" },
  { id: "resume", label: "Resume" },
  { id: "fit", label: "Fit" },
  { id: "reveal", label: "Reveal" },
  { id: "revise", label: "Revise" },
  { id: "done", label: "Done" },
]
