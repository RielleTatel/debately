import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import { formatAmount } from '@/lib/money'

type Line = { id: string; kind: string; label: string; quantity: number; unitPriceMinor: number; subtotalMinor: number }
type Invoice = {
  id: string; invoiceNumber: string
  subtotalMinor: number; discountMinor: number; discountReason: string | null
  totalMinor: number; currency: string
  overrideMinor: number | null; overrideReason: string | null
  createdAt: Date; updatedAt: Date
  lineItems: Line[]
}

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: 'Helvetica' },
  h1: { fontSize: 20, marginBottom: 4 },
  meta: { fontSize: 10, color: '#555', marginBottom: 12 },
  section: { marginBottom: 16 },
  row: { flexDirection: 'row', borderBottom: '1 solid #ddd', paddingVertical: 4 },
  cellLabel: { flex: 4 },
  cellQty: { flex: 1, textAlign: 'right' },
  cellUnit: { flex: 2, textAlign: 'right' },
  cellSub: { flex: 2, textAlign: 'right' },
  totalsBox: { alignSelf: 'flex-end', width: 260, marginTop: 12 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  totalsFinal: { fontSize: 12, fontWeight: 'bold', marginTop: 4, paddingTop: 4, borderTop: '1 solid #000' },
  overrideNote: { marginTop: 10, padding: 6, backgroundColor: '#fff8e1', fontSize: 9 },
})

export function InvoiceDocument({ invoice, institution, tournament, organization }: {
  invoice: Invoice
  institution: { name: string }
  tournament: { name: string; venue: string; startDate: Date }
  organization: { name: string }
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Invoice {invoice.invoiceNumber}</Text>
        <Text style={styles.meta}>{organization.name} — {tournament.name} — {tournament.venue} — {tournament.startDate.toDateString()}</Text>
        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Bill to: {institution.name}</Text>
          <Text>Issued: {invoice.createdAt.toDateString()}</Text>
        </View>
        <View>
          <View style={[styles.row, { fontWeight: 'bold' }]}>
            <Text style={styles.cellLabel}>Description</Text>
            <Text style={styles.cellQty}>Qty</Text>
            <Text style={styles.cellUnit}>Unit</Text>
            <Text style={styles.cellSub}>Subtotal</Text>
          </View>
          {invoice.lineItems.map((l) => (
            <View key={l.id} style={styles.row}>
              <Text style={styles.cellLabel}>{l.label}</Text>
              <Text style={styles.cellQty}>{l.quantity}</Text>
              <Text style={styles.cellUnit}>{formatAmount(l.unitPriceMinor, invoice.currency)}</Text>
              <Text style={styles.cellSub}>{formatAmount(l.subtotalMinor, invoice.currency)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.totalsBox}>
          <View style={styles.totalsRow}><Text>Subtotal</Text><Text>{formatAmount(invoice.subtotalMinor, invoice.currency)}</Text></View>
          {invoice.discountMinor > 0 && <View style={styles.totalsRow}><Text>Discount</Text><Text>-{formatAmount(invoice.discountMinor, invoice.currency)}</Text></View>}
          <View style={[styles.totalsRow, styles.totalsFinal]}><Text>Total</Text><Text>{formatAmount(invoice.totalMinor, invoice.currency)}</Text></View>
          {invoice.overrideMinor !== null && <Text style={styles.overrideNote}>Manual override applied: {invoice.overrideReason ?? ''}</Text>}
        </View>
      </Page>
    </Document>
  )
}

export async function renderInvoicePDF(input: Parameters<typeof InvoiceDocument>[0]): Promise<Buffer> {
  return renderToBuffer(<InvoiceDocument {...input} />)
}
