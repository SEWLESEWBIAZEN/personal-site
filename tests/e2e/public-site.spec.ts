import { expect, test, type Page } from "@playwright/test";
import { e2eEnv } from "../../playwright.config";

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.fill("input[type=email]", e2eEnv.ADMIN_EMAIL);
  await page.fill("input[type=password]", e2eEnv.ADMIN_PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForURL((u) => !u.pathname.startsWith("/admin/login"));
}

test("public routes respond and render", async ({ page }) => {
  for (const path of ["/", "/projects", "/projects/cx-recovery-tool", "/journal", "/ideas", "/about", "/now", "/sitemap.xml", "/robots.txt"]) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
  }
  expect((await page.goto("/journal/does-not-exist"))?.status()).toBe(404);
});

test("homepage keeps the headline and adds capabilities and contact paths", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("I build software");
  await expect(page.locator("h1")).toContainText("And share what");
  await expect(page.getByRole("link", { name: /EXPLORE MY WORK/ })).toHaveAttribute("href", "/projects");
  await expect(page.getByRole("link", { name: /READ THE JOURNAL/ })).toHaveAttribute("href", "/journal");
  await expect(page.getByRole("link", { name: /Have a project in mind/ })).toHaveAttribute("href", "#contact");
  await expect(page.locator("#capabilities li")).toHaveCount(5);
  const contact = page.locator("#contact");
  await expect(contact.getByRole("link", { name: /EMAIL ME/ })).toHaveAttribute("href", /^mailto:/);
  await expect(contact.getByRole("link", { name: /LINKEDIN/ })).toHaveAttribute("href", /linkedin\.com/);
  await expect(contact.getByRole("link", { name: /GITHUB/ })).toHaveAttribute("href", /github\.com/);
  const headings = await page.locator("h1").count();
  expect(headings).toBe(1);
});

test("mobile layout has no horizontal scroll", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  for (const path of ["/", "/projects/cx-recovery-tool", "/journal", "/ideas"]) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), path).toBeLessThanOrEqual(0);
  }
  await page.close();
});

test("project stage and role are saved in admin and shown on the case study", async ({ page }) => {
  await login(page);
  await page.goto("/admin/projects");
  await page.getByRole("link", { name: "SACCO Management" }).first().click();
  await page.waitForURL(/\/admin\/projects\/[^/]+\/edit$/);
  await expect(page.getByText("Case study completeness")).toBeVisible();
  await page.selectOption("#stage", "CONCEPT");
  // Unique per run so the form is always dirty, even against a reused database.
  const role = `E2E role text ${Date.now()}.`;
  await page.selectOption("#stage", "PROTOTYPE");
  await page.selectOption("#stage", "CONCEPT");
  await page.fill("#role", role);
  await page.getByRole("button", { name: /save/i }).first().click();
  await expect(page.locator("[data-sonner-toast]").getByText(/saved/i)).toBeVisible();

  await page.goto("/projects/sacco-management");
  await expect(page.locator(".case-glance")).toContainText("Concept");
  await expect(page.getByRole("heading", { name: "My role" })).toBeVisible();
  await expect(page.getByText(role)).toBeVisible();
  await page.goto("/projects");
  await expect(page.locator(".stage-chip").first()).toBeVisible();
});
