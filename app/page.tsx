import { OMRSheetGenerator } from "@/components/omr-sheet-generator"

export default function Home() {
  return (
    <main className="min-h-screen grid-pattern px-4 py-6 sm:py-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col items-center gap-2 sm:mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">Assessment operations</p>
          <h1 className="text-balance text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">OMR Sheet Generator</h1>
          <p className="max-w-2xl text-pretty text-center text-sm leading-6 text-muted-foreground sm:text-base">
            Create, print, scan, and review optical mark recognition sheets for exams, surveys, and assessments.
          </p>
        </div>
        <OMRSheetGenerator />
      </div>
    </main>
  )
}
