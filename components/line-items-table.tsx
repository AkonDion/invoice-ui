import type { InvoiceLineItem } from "@/types/invoice"
import { money } from "@/lib/invoice/adapter"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState, useRef, useEffect } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

interface LineItemsTableProps {
  items: InvoiceLineItem[]
  currency: "CAD" | "USD"
}

interface ExpandableLineItemProps {
  item: InvoiceLineItem
  currency: "CAD" | "USD"
  index: number
}

function ExpandableLineItem({ item, currency }: ExpandableLineItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showExpandButton, setShowExpandButton] = useState(false)
  const textRef = useRef<HTMLSpanElement>(null)
  const maxLength = 50

  useEffect(() => {
    if (textRef.current) {
      // Check if the text is actually clipped by measuring the element
      const isTextClipped = item.description.length > maxLength
      setShowExpandButton(isTextClipped)
    }
  }, [item.description])

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const displayText = isExpanded ? item.description : item.description.substring(0, maxLength)
  const shouldShowEllipsis = !isExpanded && item.description.length > maxLength

  return (
    <TableRow className="border-white/20 hover:bg-white/5 transition-colors duration-200">
      <TableCell className="text-white/80 font-mono text-xs">{item.sku}</TableCell>
      <TableCell className="text-white/90">
        <div className="max-w-xs flex items-start gap-2">
          <span 
            ref={textRef}
            title={isExpanded ? undefined : item.description}
            className="flex-1"
          >
            {displayText}
            {shouldShowEllipsis && '...'}
          </span>
          {showExpandButton && (
            <button
              onClick={toggleExpanded}
              className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors duration-200"
              aria-label={isExpanded ? 'Collapse description' : 'Expand description'}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-white/60" />
              ) : (
                <ChevronRight className="w-4 h-4 text-white/60" />
              )}
            </button>
          )}
        </div>
      </TableCell>
      <TableCell className="text-white/80 text-center">{item.quantity}</TableCell>
      <TableCell className="text-white/80 text-right font-mono">
        {money(item.price, currency)}
      </TableCell>
      <TableCell className="text-white font-semibold text-right font-mono">
        {money(item.total, currency)}
      </TableCell>
    </TableRow>
  )
}

export function LineItemsTable({ items, currency }: LineItemsTableProps) {
  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden">
      <div className="p-4 border-b border-white/20">
        <h3 className="font-semibold text-white text-sm">Line Items</h3>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/20 hover:bg-white/5">
              <TableHead className="text-white/70 font-medium">SKU</TableHead>
              <TableHead className="text-white/70 font-medium">Description</TableHead>
              <TableHead className="text-white/70 font-medium text-center">Qty</TableHead>
              <TableHead className="text-white/70 font-medium text-right">Unit Price</TableHead>
              <TableHead className="text-white/70 font-medium text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <ExpandableLineItem 
                key={index} 
                item={item} 
                currency={currency} 
                index={index} 
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
