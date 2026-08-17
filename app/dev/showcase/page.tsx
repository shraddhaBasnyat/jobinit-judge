import { StatusPill, TogglePill } from "@/components/blind-call/Pill"
import { CardContentRow } from "@/components/blind-call/CardContentRow"

// Dev/test-only route — not part of the real judge flow. The /judge page
// only ever renders Pill's default tone and fixed-length JD copy, so this
// route exists purely so Playwright (and the eye) can check the three
// non-default Pill tones and Card-Content-Row's Hug/no-clip behavior with
// long content. Remove once a future ticket consumes these for real.
const LONG_CONTENT =
  "This is deliberately much longer than the real Cresta Labs copy so the test can confirm Card-Content-Row's height grows to fit its content instead of clipping or overflowing. Padding out with enough text to wrap across several lines at a realistic card width, well past what a single line or two would hold, so the Hug behavior actually gets exercised rather than just asserted in theory."

export default function DevShowcasePage() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6 p-6">
      <div className="flex flex-col items-start gap-2" data-testid="pill-tone-showcase">
        <StatusPill tone="default" label="Specialist Depth" />
        <StatusPill tone="positive" label="Specialist Depth" />
        <StatusPill tone="neutral" label="Specialist Depth" />
        <StatusPill tone="negative" label="Specialist Depth" />
      </div>
      <div className="flex flex-col items-start gap-2" data-testid="toggle-pill-showcase">
        <TogglePill selected={false} label="Specialist Depth" />
        <TogglePill selected={true} label="Specialist Depth" />
      </div>
      <div data-testid="long-content-showcase">
        <CardContentRow variant="text" label="LONG CONTENT" content={LONG_CONTENT} />
      </div>
      <div data-testid="pill-variant-showcase">
        <CardContentRow
          variant="pill"
          label="PILL VARIANT"
          pillLabel="Specialist Depth"
          content="Body copy shown alongside the pill."
        />
      </div>
    </div>
  )
}
