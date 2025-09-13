import type { InvoiceLineItem } from "@/types/invoice"
import { money } from "@/lib/invoice/adapter"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface LineItemsTableProps {
  items: InvoiceLineItem[]
  currency: "CAD" | "USD"
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
              <TableRow key={index} className="border-white/20 hover:bg-white/5 transition-colors duration-200">
                <TableCell className="text-white/80 font-mono text-xs">{item.sku}</TableCell>
                <TableCell className="text-white/90">
                  <div className="max-w-xs">
                    <span 
                      title={item.description.replace(/<[^>]*>/g, '')} 
                      dangerouslySetInnerHTML={{ 
                        __html: item.description.length > 50 
                          ? `${item.description.substring(0, 50)}...` 
                          : item.description 
                      }} 
                    />
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
