import { NextRequest, NextResponse } from "next/server";
import { getPdfPathForToken } from "@/lib/data/customer-quote";
import { getQuotePdfBuffer } from "@/lib/pdf/generate";

// Proxies the stored quote PDF only for a valid, unexpired, unrevoked token.
// Storage itself stays private — no public/signed URL is ever handed out.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const path = await getPdfPathForToken(token);

  if (!path) {
    return new NextResponse("Not available", { status: 404 });
  }

  try {
    const buf = await getQuotePdfBuffer(path);
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="quotation.pdf"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new NextResponse("Could not load the PDF", { status: 500 });
  }
}
