import { existsSync, readdirSync } from "fs";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { integrationEnabled, session, uploadDir } from "../support/integration";
import { prisma } from "@/lib/prisma";
import { localFileStorage } from "@/lib/storage";
import { POST } from "@/app/api/upload/route";
import { GET } from "@/app/api/upload/[filename]/route";
import { NextRequest } from "next/server";
import { fixture, resetDatabase, uploadFixture, uploadRequest } from "../support/db";

const png = (name = "red.png") => new Blob([fixture(name)], { type: "image/png" });

describe.skipIf(!integrationEnabled)("POST /api/upload (real local storage + PostgreSQL)", () => {
  beforeEach(async () => {
    await resetDatabase();
    session.current = { user: { role: "ADMIN", id: "t" } };
  });
  afterEach(() => vi.restoreAllMocks());

  it("stores the file on disk, records it, and serves it back byte-for-byte", async () => {
    const media = await uploadFixture("red.png");
    expect(media.url).toMatch(/^\/api\/upload\/[0-9a-f-]{36}\.png$/);
    expect(existsSync(path.join(uploadDir, media.filename))).toBe(true);
    expect(await prisma.media.count({ where: { url: media.url } })).toBe(1);

    const res = await GET(new NextRequest(`http://localhost:4000${media.url}`), { params: Promise.resolve({ filename: media.filename }) });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(Buffer.from(await res.arrayBuffer()).equals(fixture("red.png"))).toBe(true);
  });

  it("rejects unauthenticated and cross-site uploads", async () => {
    session.current = null;
    expect((await POST(uploadRequest(png(), "red.png"))).status).toBe(401);
    session.current = { user: { role: "ADMIN", id: "t" } };
    expect((await POST(uploadRequest(png(), "red.png", { origin: "https://evil.example" }))).status).toBe(403);
    expect(await prisma.media.count()).toBe(0);
  });

  it("validates real file content, not the extension", async () => {
    const res = await POST(uploadRequest(new Blob([fixture("fake.png")], { type: "image/png" }), "fake.png"));
    expect(res.status).toBe(415);
    expect((await res.json()).error).toMatch(/does not match its type/);
  });

  it("rejects unsupported formats such as SVG and HTML", async () => {
    for (const name of ["x.svg", "x.html", "noext"]) {
      const res = await POST(uploadRequest(new Blob(["<svg/>"], { type: "" }), name));
      expect(res.status).toBe(415);
    }
    expect(await prisma.media.count()).toBe(0);
  });

  it("rejects oversized files with 413", async () => {
    const big = Buffer.alloc(10 * 1024 * 1024 + 10);
    fixture("red.png").copy(big);
    const res = await POST(uploadRequest(new Blob([big], { type: "image/png" }), "big.png"));
    expect(res.status).toBe(413);
    expect((await POST(uploadRequest(png(), "red.png", { headers: { "content-length": String(500 * 1024 * 1024) } }))).status).toBe(413);
  });

  it("returns 400 for a missing file or malformed multipart body", async () => {
    expect((await POST(uploadRequest(null, "x"))).status).toBe(400);
    const res = await POST(uploadRequest(null, "x", { body: "--broken\r\n", headers: { "content-type": "multipart/form-data; boundary=broken" } }));
    expect(res.status).toBe(400);
    expect(res.headers.get("x-request-id")).toBeTruthy();
  });

  it("storage failure: nothing is recorded (fault injected into the provider)", async () => {
    vi.spyOn(localFileStorage, "put").mockRejectedValueOnce(new Error("EACCES"));
    const res = await POST(uploadRequest(png(), "red.png"));
    expect(res.status).toBe(502);
    expect(await prisma.media.count()).toBe(0);
  });

  it("real database failure after storage: the stored file is deleted (compensating action)", async () => {
    const before = new Set(readdirSync(uploadDir));
    // A genuine PostgreSQL error: the table the insert targets is temporarily missing.
    await prisma.$executeRawUnsafe(`ALTER TABLE media RENAME TO media_offline`);
    try {
      const res = await POST(uploadRequest(png(), "red.png"));
      expect(res.status).toBe(500);
      expect((await res.json()).error).toMatch(/discarded/);
    } finally {
      await prisma.$executeRawUnsafe(`ALTER TABLE media_offline RENAME TO media`);
    }
    expect(readdirSync(uploadDir).filter((f) => !before.has(f))).toEqual([]);
  });

  it("strips path components and control characters from the original filename", async () => {
    const res = await POST(uploadRequest(png(), "..\\..\\evil<name>.png"));
    expect(res.status).toBe(201);
    const media = await res.json();
    expect(media.originalFilename).toBe("evil_name_.png");
    expect(media.filename).toMatch(/^[0-9a-f-]{36}\.png$/);
  });

  it("the file route refuses unsafe keys", async () => {
    const res = await GET(new NextRequest("http://localhost:4000/api/upload/x"), { params: Promise.resolve({ filename: "../../etc/passwd" }) });
    expect(res.status).toBe(404);
  });
});
