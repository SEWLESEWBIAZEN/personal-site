import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { ALLOWED_TYPES, SAFE_KEY, localFileStorage } from "@/lib/storage";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!SAFE_KEY.test(filename)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rule = ALLOWED_TYPES[path.extname(filename).toLowerCase()];
  if (!rule) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const buffer = await localFileStorage.read(filename);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": rule.mime,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
