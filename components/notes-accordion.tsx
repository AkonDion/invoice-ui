"use client"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useState } from "react"
import { Wrench } from "lucide-react"

interface NotesAccordionProps {
  notes?: string
}

function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...'
}

export function NotesAccordion({ notes }: NotesAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  if (!notes) return null

  const previewText = truncateText(notes)

  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden">
      <Accordion type="single" collapsible className="w-full" onValueChange={(value) => setIsOpen(value === "notes")}>
        <AccordionItem value="notes" className="border-none">
          <AccordionTrigger className="px-4 py-3 text-white hover:bg-white/5 hover:no-underline transition-colors duration-200">
            <div className="flex flex-col items-start gap-1 text-left">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-sm">Labour Coverage</span>
              </div>
              {!isOpen && (
                <span className="text-sm text-emerald-300/80 font-normal line-clamp-2">{previewText}</span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{notes}</div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
