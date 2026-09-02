import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { formatPence } from "@/lib/quote/calc";
import type { QuoteVersionRecord } from "@/lib/data/quotes";

// Branded quote PDF, generated server-side from an immutable quoteVersion.
// Contains NO internal commercial data — line items carry only
// description/category/qty/unitPrice/total; there is no cost or margin field
// anywhere in the version record to leak.

const styles = StyleSheet.create({
  page: {
    padding: 44,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0b1a30",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  brand: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#0b1a30" },
  brandAccent: { color: "#37c4e0" },
  meta: { textAlign: "right", fontSize: 9, color: "#4a5b73" },
  h1: { fontSize: 15, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  section: { marginBottom: 16 },
  label: {
    fontSize: 8,
    color: "#7f93ad",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  row: { flexDirection: "row" },
  tHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#0b1a30",
    paddingBottom: 4,
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
  },
  tRow: {
    flexDirection: "row",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#d9e0ea",
  },
  cDesc: { width: "46%" },
  cCat: { width: "22%" },
  cQty: { width: "10%", textAlign: "right" },
  cUnit: { width: "10%", textAlign: "right" },
  cTot: { width: "12%", textAlign: "right" },
  totals: { marginTop: 10, alignSelf: "flex-end", width: "45%" },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  grand: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    marginTop: 3,
    borderTopWidth: 1,
    borderTopColor: "#0b1a30",
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  terms: { fontSize: 9, color: "#33465f", lineHeight: 1.4 },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 44,
    right: 44,
    fontSize: 8,
    color: "#7f93ad",
    textAlign: "center",
  },
});

export type QuotePdfProps = {
  quoteNumber: string;
  legalEntityName: string;
  customerName: string;
  customerEmail: string;
  moveSummary: string;
  issuedAt: string;
  expiresAt: string;
  version: QuoteVersionRecord;
};

export function QuotePdf(props: QuotePdfProps) {
  const { version } = props;
  return (
    <Document title={`Quote ${props.quoteNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>
              care4<Text style={styles.brandAccent}>removals</Text>
            </Text>
            <Text style={{ fontSize: 8, color: "#7f93ad", marginTop: 2 }}>
              {props.legalEntityName}
            </Text>
          </View>
          <View style={styles.meta}>
            <Text>Quote {props.quoteNumber}</Text>
            <Text>Version {version.versionNumber}</Text>
            <Text>Issued {props.issuedAt}</Text>
            <Text>Valid until {props.expiresAt}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h1}>Removal quotation</Text>
        </View>

        <View style={[styles.section, styles.row]}>
          <View style={{ width: "50%" }}>
            <Text style={styles.label}>Prepared for</Text>
            <Text>{props.customerName}</Text>
            <Text>{props.customerEmail}</Text>
          </View>
          <View style={{ width: "50%" }}>
            <Text style={styles.label}>Move summary</Text>
            <Text>{props.moveSummary}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.tHead}>
            <Text style={styles.cDesc}>Description</Text>
            <Text style={styles.cCat}>Category</Text>
            <Text style={styles.cQty}>Qty</Text>
            <Text style={styles.cUnit}>Unit</Text>
            <Text style={styles.cTot}>Amount</Text>
          </View>
          {version.lineItems.map((li, i) => (
            <View style={styles.tRow} key={i}>
              <Text style={styles.cDesc}>{li.description || "—"}</Text>
              <Text style={styles.cCat}>{li.category}</Text>
              <Text style={styles.cQty}>{li.quantity}</Text>
              <Text style={styles.cUnit}>{formatPence(li.unitPrice)}</Text>
              <Text style={styles.cTot}>{formatPence(li.total)}</Text>
            </View>
          ))}

          <View style={styles.totals}>
            <View style={styles.totalLine}>
              <Text>Subtotal</Text>
              <Text>{formatPence(version.subtotal)}</Text>
            </View>
            <View style={styles.totalLine}>
              <Text>
                {version.vatMode === "none"
                  ? "VAT (not applicable)"
                  : version.vatMode === "inclusive"
                    ? "VAT (included)"
                    : "VAT (20%)"}
              </Text>
              <Text>{formatPence(version.tax)}</Text>
            </View>
            <View style={styles.grand}>
              <Text>Total</Text>
              <Text>{formatPence(version.total)}</Text>
            </View>
          </View>
        </View>

        {version.paymentTerms ? (
          <View style={styles.section}>
            <Text style={styles.label}>Payment terms</Text>
            <Text style={styles.terms}>{version.paymentTerms}</Text>
          </View>
        ) : null}

        {version.assumptions ? (
          <View style={styles.section}>
            <Text style={styles.label}>Assumptions</Text>
            <Text style={styles.terms}>{version.assumptions}</Text>
          </View>
        ) : null}

        {version.exclusions ? (
          <View style={styles.section}>
            <Text style={styles.label}>Exclusions</Text>
            <Text style={styles.terms}>{version.exclusions}</Text>
          </View>
        ) : null}

        {version.cancellationTerms ? (
          <View style={styles.section}>
            <Text style={styles.label}>Terms &amp; conditions</Text>
            <Text style={styles.terms}>{version.cancellationTerms}</Text>
          </View>
        ) : null}

        <Text style={styles.footer} fixed>
          {props.legalEntityName} · Quote {props.quoteNumber} v
          {version.versionNumber} · This quotation is valid until{" "}
          {props.expiresAt}.
        </Text>
      </Page>
    </Document>
  );
}
