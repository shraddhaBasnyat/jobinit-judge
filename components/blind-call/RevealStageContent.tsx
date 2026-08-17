import type { RevealCaseData } from "@/lib/mock-data/case"
import {
  ARCHETYPE_LABELS,
  FIT_VERDICT_OPTIONS,
  SCENARIO_LABELS,
  describeJdArchetype,
  describeCandidateArchetype,
  candidateArchetypePillLabel,
} from "@/lib/stages"
import { HeaderNodeInfo } from "@/components/blind-call/HeaderNodeInfo"
import { CardContentRow } from "@/components/blind-call/CardContentRow"

export type RevealStageContentProps = {
  reveal: RevealCaseData
}

// Reveal is view-only — no onChange, no forward gate beyond
// isRevealStageComplete()'s unconditional true.
export function RevealStageContent({ reveal }: RevealStageContentProps) {
  const fitOption = FIT_VERDICT_OPTIONS.find((option) => option.id === reveal.scenarioId)

  return (
    <div className="flex w-full flex-col gap-4 p-4">
      <HeaderNodeInfo badgeLabel="Reveal" label="AI's Read" />
      <CardContentRow
        variant="pill"
        label="JD Archetype"
        pillLabel={ARCHETYPE_LABELS[reveal.jdArchetype.ideal]}
        content={describeJdArchetype(reveal.jdArchetype)}
      />
      <CardContentRow variant="text" label="JD Real Ask" content={reveal.realAsk} />
      <CardContentRow
        variant="pill"
        label="Resume Archetype"
        pillLabel={candidateArchetypePillLabel(reveal.candidateArchetype, reveal.careerArcNote)}
        content={describeCandidateArchetype(reveal.candidateArchetype, reveal.careerArcNote)}
      />
      <CardContentRow
        variant="pill"
        label="Fit"
        pillLabel={SCENARIO_LABELS[reveal.scenarioId]}
        content={fitOption?.hook ?? ""}
      />
      <CardContentRow variant="text" label="Fit Summary" content={reveal.fitSummary} />
    </div>
  )
}
