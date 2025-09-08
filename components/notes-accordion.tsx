"use client"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface NotesAccordionProps {
  notes?: string
}

function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...'
}

export function NotesAccordion({ notes }: NotesAccordionProps) {
  if (!notes) return null

  const previewText = truncateText(notes)

  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="notes" className="border-none">
          <AccordionTrigger className="px-4 py-3 text-white hover:bg-white/5 hover:no-underline transition-colors duration-200">
            <div className="flex flex-col items-start gap-1 text-left">
              <span className="font-semibold text-sm">Notes</span>
              <span className="text-sm text-white/60 font-normal line-clamp-2">{previewText}</span>
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
