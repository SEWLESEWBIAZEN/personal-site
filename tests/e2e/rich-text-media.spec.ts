import path from "path";
import { expect, test, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { e2eEnv } from "../../playwright.config";

const fixture = (name: string) => path.join(__dirname, "..", "fixtures", name);
const db = new PrismaClient({ datasources: { db: { url: e2eEnv.DATABASE_URL } } });
test.afterAll(() => db.$disconnect());

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.fill("input[type=email]", e2eEnv.ADMIN_EMAIL);
  await page.fill("input[type=password]", e2eEnv.ADMIN_PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForURL((u) => !u.pathname.startsWith("/admin/login"));
}

const editor = (page: Page) => page.locator(".ProseMirror");

async function uploadImage(page: Page, file: string) {
  const before = await editor(page).locator("img").count();
  await page.getByRole("button", { name: "Image", exact: true }).click();
  await page.locator("dialog[open] input[type=file]").setInputFiles(fixture(file));
  await expect(editor(page).locator("img")).toHaveCount(before + 1);
  await expect(page.locator("dialog[open]")).toHaveCount(0);
}

/** Puts the caret in the paragraph the editor created after an inserted image. */
async function continueAfterImage(page: Page) {
  await editor(page).locator("img + p").last().click();
}

async function imageSources(page: Page) {
  return editor(page).locator("img").evaluateAll((els) => els.map((e) => (e as HTMLImageElement).getAttribute("src")));
}

async function expectImagesLoaded(page: Page, scope: string) {
  const imgs = page.locator(`${scope} img`);
  for (let i = 0; i < (await imgs.count()); i++) {
    await expect.poll(() => imgs.nth(i).evaluate((e) => (e as HTMLImageElement).complete && (e as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
}

test("create → save → refresh → reopen → edit images → save → verify persisted state", async ({ page }) => {
  await login(page);
  await page.goto("/admin/journal/new");
  await page.fill("#title", "E2E media article");

  // Formatted text using the editor's own input rules and shortcuts.
  await editor(page).click();
  await page.keyboard.type("## Architecture");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Intro with ");
  await page.keyboard.press("Control+b");
  await page.keyboard.type("bold");
  await page.keyboard.press("Control+b");
  await page.keyboard.type(" and ");
  await page.keyboard.press("Control+i");
  await page.keyboard.type("italic");
  await page.keyboard.press("Control+i");
  await page.keyboard.press("Enter");
  await uploadImage(page, "red.png");
  // The editor adds a paragraph after the image; typing there must not replace it.
  await continueAfterImage(page);
  await page.keyboard.type("- first point");
  await page.keyboard.press("Enter");
  await page.keyboard.type("second point");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await page.keyboard.type("> a quote");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await uploadImage(page, "blue.png");

  const [red, blue] = await imageSources(page);
  expect(red).toMatch(/^\/api\/upload\/[0-9a-f-]{36}\.png$/);
  expect(blue).toMatch(/^\/api\/upload\/[0-9a-f-]{36}\.png$/);

  // The original defect: this click returned HTTP 500.
  const saveResponse = page.waitForResponse((r) => r.request().method() === "POST" && !!r.request().headers()["next-action"]);
  await page.getByRole("button", { name: "Publish" }).click();
  expect((await saveResponse).status()).toBe(200);
  await page.waitForURL(/\/admin\/journal\/[^/]+\/edit$/, { timeout: 15_000 });
  const id = page.url().split("/").at(-2)!;

  // Refresh and reopen: everything comes back from PostgreSQL.
  await page.reload();
  await expect(editor(page).locator("h2")).toHaveText("Architecture");
  await expect(editor(page).locator("strong")).toHaveText("bold");
  await expect(editor(page).locator("em")).toHaveText("italic");
  await expect(editor(page).locator("ul li")).toHaveCount(2);
  await expect(editor(page).locator("blockquote")).toContainText("a quote");
  expect(await imageSources(page)).toEqual([red, blue]);

  const saved = await db.journalArticle.findUniqueOrThrow({ where: { id } });
  expect(JSON.stringify(saved.content)).not.toContain("$T");
  expect(saved.contentHtml).toContain(`src="${red}"`);

  // Public page renders the images from storage.
  await page.goto(`/journal/${saved.slug}`);
  await expect(page.locator(".prose img")).toHaveCount(2);
  await expectImagesLoaded(page, ".prose");

  // Edit: remove the first image, add another at the end, change text.
  await page.goto(`/admin/journal/${id}/edit`);
  await editor(page).locator("img").first().click();
  await page.keyboard.press("Backspace");
  await expect(editor(page).locator("img")).toHaveCount(1);
  await editor(page).locator("h2").click();
  await page.keyboard.press("End");
  await page.keyboard.type(" revised");
  await editor(page).locator("p").last().click();
  await page.keyboard.press("End");
  await uploadImage(page, "green.png");
  const beforeSave = await imageSources(page);
  const green = beforeSave.find((s) => s !== blue)!;
  expect(beforeSave).toHaveLength(2);
  expect(beforeSave).toContain(blue);
  await page.getByRole("button", { name: "Update published" }).click();
  await expect(page.locator("[data-sonner-toast]").getByText("Published", { exact: true })).toBeVisible();

  await page.reload();
  await expect(editor(page).locator("h2")).toHaveText("Architecture revised");
  expect(await imageSources(page)).toEqual(beforeSave);

  const final = await db.journalArticle.findUniqueOrThrow({ where: { id } });
  expect(final.contentHtml).not.toContain(red!);
  const [firstSrc, secondSrc] = beforeSave;
  expect(final.contentHtml!.indexOf(firstSrc!)).toBeLessThan(final.contentHtml!.indexOf(secondSrc!));
  expect(final.contentHtml).toContain(green);
  // Removed media stays in the library (deleted only from the media screen when unused).
  expect(await db.media.count({ where: { url: red! } })).toBe(1);

  await page.goto(`/journal/${final.slug}`);
  await expect(page.locator(".prose img")).toHaveCount(2);
  await expectImagesLoaded(page, ".prose");
});

test("ideas use the same editor pipeline", async ({ page }) => {
  await login(page);
  await page.goto("/admin/ideas/new");
  await page.fill("#title", "E2E idea with image");
  await editor(page).click();
  await page.keyboard.type("## Concept");
  await page.keyboard.press("Enter");
  await uploadImage(page, "red.png");
  await page.getByRole("button", { name: /save|capture/i }).first().click();
  await page.waitForURL(/\/admin\/ideas\/[^/]+\/edit$/);
  await page.reload();
  await expect(editor(page).locator("h2")).toHaveText("Concept");
  await expect(editor(page).locator("img")).toHaveCount(1);
});

test("existing HTML-only content opens in the editor instead of an empty document", async ({ page }) => {
  await login(page);
  const legacy = await db.journalArticle.findFirstOrThrow({ where: { content: { equals: null as never } } }).catch(() => db.journalArticle.findFirstOrThrow({ where: { slug: "kubernetes-helm-deployment-notes" } }));
  await page.goto(`/admin/journal/${legacy.id}/edit`);
  await expect(editor(page)).toContainText(legacy.contentHtml!.replace(/<[^>]+>/g, "").slice(0, 40));
});

test("upload failures surface actionable errors and keep the document", async ({ page, context }) => {
  await login(page);
  await page.goto("/admin/journal/new");
  await editor(page).click();
  await page.keyboard.type("Keep this text");
  await page.getByRole("button", { name: "Image", exact: true }).click();
  await page.locator("dialog[open] input[type=file]").setInputFiles(fixture("fake.png"));
  await expect(page.getByText(/does not match its type/)).toBeVisible();

  await context.setOffline(true);
  await page.locator("dialog[open] input[type=file]").setInputFiles(fixture("red.png"));
  await expect(page.getByText(/network connection was interrupted/)).toBeVisible();
  await context.setOffline(false);
  await expect(editor(page)).toContainText("Keep this text");
  await expect(editor(page).locator("img")).toHaveCount(0);
});

test("unauthenticated upload is refused", async ({ request }) => {
  const res = await request.post("/api/upload", { multipart: { file: { name: "a.png", mimeType: "image/png", buffer: Buffer.from("x") } } });
  expect(res.status()).toBe(401);
});
