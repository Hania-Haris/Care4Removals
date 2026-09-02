import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getAdminStorage } from "@/lib/firebase/admin";

// Streams a lead attachment to a signed-in staff member. Path is validated
// to be inside leads/ so it can't be used to read arbitrary Storage objects.
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return new NextResponse("Unauthorised", { status: 401 });

  const path = req.nextUrl.searchParams.get("path") ?? "";
  if (!/^leads\/[A-Za-z0-9]+\/[A-Za-z0-9._-]+$/.test(path)) {
    return new NextResponse("Bad path", { status: 400 });
  }

  try {
    const file = getAdminStorage().bucket().file(path);
    const [exists] = await file.exists();
    if (!exists) return new NextResponse("Not found", { status: 404 });

    const [meta] = await file.getMetadata();
    const [buf] = await file.download();
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": meta.contentType ?? "application/octet-stream",
        "Content-Disposition": `inline; filename="${path.split("/").pop()}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    console.error("lead-file failed:", e);
    return new NextResponse("Error", { status: 500 });
  }
}
