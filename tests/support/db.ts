import { readFileSync } from "fs";
import path from "path";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { POST as uploadRoute } from "@/app/api/upload/route";

export async function resetDatabase() {
  await prisma.$executeRawUnsafe(
    `TRUNCATE journal_articles, ideas, media, projects, project_media, categories, tags RESTART IDENTITY CASCADE`,
  );
}

export const fixture = (name: string) => readFileSync(path.join(__dirname, "..", "fixtures", name));

export function uploadRequest(file: Blob | null, name: string, init: { origin?: string; headers?: Record<string, string>; body?: BodyInit } = {}) {
  const body = init.body ?? (() => {
    const form = new FormData();
    if (file) form.append("file", file, name);
    return form;
  })();
  return new NextRequest("http://localhost:4000/api/upload", {
    method: "POST",
    body,
    headers: { origin: init.origin ?? "http://localhost:4000", host: "localhost:4000", ...init.headers },
  });
}

/** Uploads a fixture through the real route handler, storage provider and database. */
export async function uploadFixture(name: string, type = "image/png") {
  const res = await uploadRoute(uploadRequest(new Blob([fixture(name)], { type }), name));
  if (res.status !== 201) throw new Error(`upload failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as { id: string; url: string; filename: string };
}
