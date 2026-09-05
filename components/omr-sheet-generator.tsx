"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { OMRSheet } from "@/components/omr-sheet"
import { OMRGridSheet } from "@/components/omr-grid-sheet"
import { AnswerKeyGenerator } from "@/components/answer-key-generator"
import { AnswerKeyComparison } from "@/components/answer-key-comparison"
import { StudentResponseScanner } from "@/components/student-response-scanner"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { Settings, Eye, GitCompare, Scan, BarChart3, Bookmark, Printer, RotateCcw } from "lucide-react"

type Config = { title: string; numQuestions: number; optionsPerQuestion: number; showRollNumber: boolean; showName: boolean; showInstructions: boolean; uniqueId: string; format: "standard" | "grid" }
type View = "sheet" | "answerkey" | "comparison" | "scanner" | "analytics"
type StudentResponse = { id: string; name: string; rollNumber: string; responses: Record<number, string>; score: number; percentage: number; timestamp: Date }

const defaultConfig = (): Config => ({ title: "Examination OMR Sheet", numQuestions: 50, optionsPerQuestion: 4, showRollNumber: true, showName: true, showInstructions: true, uniqueId: Math.random().toString(36).slice(2, 10).toUpperCase(), format: "standard" })

export function OMRSheetGenerator() {
  const [config, setConfig] = useState<Config>(() => defaultConfig())
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [studentResponses, setStudentResponses] = useState<StudentResponse[]>([])
  const [currentView, setCurrentView] = useState<View>("sheet")
  const [presetName, setPresetName] = useState("Midterm exam")
  const [presets, setPresets] = useState<Record<string, Config>>({})
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("omr-presets")
      if (saved) setPresets(JSON.parse(saved))
      const last = localStorage.getItem("omr-config")
      if (last) setConfig({ ...defaultConfig(), ...JSON.parse(last) })
      const results = localStorage.getItem("omr-results")
      if (results) setStudentResponses(JSON.parse(results).map((r: StudentResponse) => ({ ...r, timestamp: new Date(r.timestamp) })))
    } catch { /* ignore malformed client state */ }
  }, [])

  useEffect(() => { localStorage.setItem("omr-config", JSON.stringify(config)) }, [config])
  useEffect(() => { localStorage.setItem("omr-results", JSON.stringify(studentResponses)) }, [studentResponses])

  const updateConfig = (patch: Partial<Config>) => setConfig((current) => ({ ...current, ...patch }))
  const savePreset = () => {
    const name = presetName.trim()
    if (!name) return
    const next = { ...presets, [name]: config }
    setPresets(next); localStorage.setItem("omr-presets", JSON.stringify(next))
  }
  const loadPreset = (name: string) => { if (presets[name]) setConfig({ ...presets[name], uniqueId: Math.random().toString(36).slice(2, 10).toUpperCase() }) }
  const resetConfig = () => setConfig(defaultConfig())
  const handlePrint = () => {
    if (!sheetRef.current) return
    const printWindow = window.open("", "_blank", "noopener,noreferrer")
    if (!printWindow) return
    printWindow.document.write(`<!doctype html><html><head><title>${config.title}</title><style>body{margin:0;padding:24px;font-family:Arial;color:#111} @media print{body{padding:0}} .no-print{display:none}</style></head><body>${sheetRef.current.innerHTML}</body></html>`)
    printWindow.document.close(); printWindow.focus(); setTimeout(() => { printWindow.print(); printWindow.close() }, 300)
  }
  const addStudentResponse = (response: Omit<StudentResponse, "timestamp">) => setStudentResponses((prev) => prev.some((item) => item.rollNumber === response.rollNumber) ? prev.map((item) => item.rollNumber === response.rollNumber ? { ...response, timestamp: new Date() } : item) : [...prev, { ...response, timestamp: new Date() }])
  const navigationItems = [{ id: "sheet", label: "OMR Sheet", icon: Eye }, { id: "answerkey", label: "Answer Key", icon: Settings }, { id: "comparison", label: "Compare", icon: GitCompare }, { id: "scanner", label: "Scanner", icon: Scan }, { id: "analytics", label: "Analytics", icon: BarChart3 }] as const

  return <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/50 p-3 shadow-lg backdrop-blur md:flex-row md:items-center md:justify-between">
      <nav aria-label="OMR workflow" className="flex min-w-0 gap-1 overflow-x-auto" role="tablist">{navigationItems.map(({ id, label, icon: Icon }) => <Button key={id} role="tab" aria-selected={currentView === id} variant={currentView === id ? "default" : "ghost"} onClick={() => setCurrentView(id)} className="shrink-0 gap-2"><Icon data-icon="inline-start" />{label}</Button>)}</nav>
      <div className="flex flex-wrap items-center gap-2">
        <Input aria-label="Preset name" value={presetName} onChange={(e) => setPresetName(e.target.value)} className="h-9 w-36 bg-background/70" placeholder="Preset name" />
        <Button variant="outline" size="sm" onClick={savePreset}><Bookmark data-icon="inline-start" />Save preset</Button>
        <Select onValueChange={loadPreset}><SelectTrigger className="h-9 w-36" aria-label="Load preset"><SelectValue placeholder="Load preset" /></SelectTrigger><SelectContent>{Object.keys(presets).length ? Object.keys(presets).map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>) : <SelectItem value="none" disabled>No presets yet</SelectItem>}</SelectContent></Select>
      </div>
    </div>

    {currentView === "sheet" && <div className="grid gap-6 lg:grid-cols-[minmax(280px,380px)_1fr]">
      <Card className="glass-card border-0"><CardHeader><CardTitle>Sheet setup</CardTitle></CardHeader><CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2"><Label htmlFor="title">Sheet title</Label><Input id="title" value={config.title} onChange={(e) => updateConfig({ title: e.target.value })} /></div>
        <div className="flex flex-col gap-2"><Label htmlFor="format">Sheet format</Label><Select value={config.format} onValueChange={(value: string) => updateConfig({ format: value as Config["format"] })}><SelectTrigger id="format"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="standard">Standard format</SelectItem><SelectItem value="grid">Grid format</SelectItem></SelectContent></Select></div>
        <div className="flex flex-col gap-2"><Label>Questions: {config.numQuestions}</Label><Slider value={[config.numQuestions]} min={10} max={200} step={5} onValueChange={(values: number[]) => updateConfig({ numQuestions: values[0] })} /></div>
        <div className="flex flex-col gap-2"><Label htmlFor="options">Options per question</Label><Select value={String(config.optionsPerQuestion)} onValueChange={(value: string) => updateConfig({ optionsPerQuestion: Number(value) })}><SelectTrigger id="options"><SelectValue /></SelectTrigger><SelectContent>{[2,3,4,5].map((value) => <SelectItem key={value} value={String(value)}>{value} options</SelectItem>)}</SelectContent></Select></div>
        {([{ id: "roll-number", label: "Show roll number", key: "showRollNumber" as const }, { id: "name", label: "Show name", key: "showName" as const }, { id: "instructions", label: "Show instructions", key: "showInstructions" as const }]).map(({ id, label, key }) => <div className="flex items-center justify-between gap-3" key={id}><Label htmlFor={id}>{label}</Label><Switch id={id} checked={config[key]} onCheckedChange={(checked: boolean) => updateConfig({ [key]: checked })} /></div>)}
        <div className="flex flex-wrap gap-2"><Button className="flex-1" onClick={handlePrint}><Printer data-icon="inline-start" />Print sheet</Button><Button variant="outline" size="icon" onClick={resetConfig} aria-label="Reset sheet settings"><RotateCcw /></Button></div>
      </CardContent></Card>
      <div className="max-h-[800px] overflow-auto rounded-xl border border-border/60 bg-muted/20 p-4"><div ref={sheetRef} className="bg-white text-black">{config.format === "standard" ? <OMRSheet config={config} /> : <OMRGridSheet config={config} />}</div></div>
    </div>}
    {currentView === "answerkey" && <AnswerKeyGenerator config={config} answers={answers} onAnswerChange={(question, answer) => setAnswers((prev) => ({ ...prev, [question]: answer }))} onClearAll={() => setAnswers({})} onGenerateRandom={() => { const next: Record<number, string> = {}; const options = ["A", "B", "C", "D", "E"]; for (let i = 1; i <= config.numQuestions; i++) next[i] = options[Math.floor(Math.random() * config.optionsPerQuestion)]; setAnswers(next) }} />}
    {currentView === "comparison" && <AnswerKeyComparison config={config} primaryAnswers={answers} onAnswerChange={(question, answer) => setAnswers((prev) => ({ ...prev, [question]: answer }))} />}
    {currentView === "scanner" && <StudentResponseScanner config={config} answerKey={answers} onAddResponse={addStudentResponse} studentResponses={studentResponses} />}
    {currentView === "analytics" && <AnalyticsDashboard config={config} answerKey={answers} studentResponses={studentResponses} />}
  </div>
}


export type { Config }
