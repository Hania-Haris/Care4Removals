import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import { getAdminStorage } from "@/lib/firebase/admin";
import { QuotePdf, type QuotePdfProps } from "./quote-pdf";

/**
 * Renders the quote PDF from immutable quoteVersion data and stores it in
 * protected Storage at quotes/{quoteId}/{versionId}.pdf. Returns the storage
 * path (never a public URL — customer download is proxied through a
 * token-validated route in Phase 8).
 */
export async function generateAndStoreQuotePdf(
  quoteId: string,
  versionId: string,
  props: QuotePdfProps
): Promise<string> {
  const buffer = await renderToBuffer(<QuotePdf {...props} />);

  const path = `quotes/${quoteId}/${versionId}.pdf`;
  const file = getAdminStorage().bucket().file(path);
  await file.save(buffer, {
    contentType: "application/pdf",
    resumable: false,
    metadata: { cacheControl: "private, max-age=0" },
  });

  return path;
}

export async function getQuotePdfBuffer(path: string): Promise<Buffer> {
  const [buf] = await getAdminStorage().bucket().file(path).download();
  return buf;
}
