import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user.");
    return;
  }
  if (password.length < 8) throw new Error("ADMIN_PASSWORD must be at least 8 characters.");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email} (password unchanged)`);
    return;
  }
  await prisma.user.create({ data: { email, name: "Admin", passwordHash: await hash(password, 12), role: "ADMIN" } });
  console.log(`Admin created: ${email}`);
}

async function seedSettings() {
  if (await prisma.siteSettings.count()) return;
  await prisma.siteSettings.create({
    data: {
      siteTitle: "Sewlesew Biazen — Engineering Studio",
      tagline: "Software engineer, builder, explorer",
      introduction:
        "I’m Sewlesew — a software engineer exploring enterprise systems, AI engineering, and digital products. This is my corner of the internet to build, document, and explore.",
      email: "hello@sewlesew.dev",
      githubUrl: "https://github.com/SEWLESEWBIAZEN",
      linkedinUrl: "https://linkedin.com/in/sewlesew-biazen-sfd",
      location: "Addis Ababa, ET",
    },
  });
  console.log("Site settings created");
}

async function seedTaxonomy() {
  const categories = [
    ["AI Engineering", "AI/ML engineering and agent systems"],
    ["Enterprise Systems", "Large-scale enterprise applications"],
    ["SaaS / Fintech", "SaaS products and financial technology"],
    ["Agentic Systems", "AI agents and agent-to-agent systems"],
    ["System Design", "Architecture and design patterns"],
    ["DevOps", "Deployment, infrastructure, and operations"],
  ];
  for (const [name, description] of categories) {
    await prisma.category.upsert({ where: { slug: slug(name) }, create: { name, slug: slug(name), description }, update: {} });
  }

  const tags = ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "AI agents", "RAG", "Kubernetes", "Helm", "CQRS", "SSO", "n8n", "A2A"];
  for (const name of tags) {
    await prisma.tag.upsert({ where: { slug: slug(name) }, create: { name, slug: slug(name) }, update: {} });
  }
  console.log("Categories and tags ready");
}

async function seedSampleContent() {
  const cat = async (name: string) => (await prisma.category.findUniqueOrThrow({ where: { slug: slug(name) } })).id;
  const tagIds = async (...names: string[]) =>
    (await prisma.tag.findMany({ where: { slug: { in: names.map(slug) } }, select: { id: true } })).map((t) => ({ id: t.id }));

  if ((await prisma.nowItem.count()) === 0) {
    await prisma.nowItem.createMany({
      data: [
        { title: "AI & agent systems", description: "Building useful intelligent workflows and exploring agent interoperability.", category: "ai", displayOrder: 1 },
        { title: "Software architecture", description: "Designing maintainable systems with clear boundaries and deliberate trade-offs.", category: "architecture", displayOrder: 2 },
        { title: "Product engineering", description: "Turning operational problems into practical, usable software products.", category: "product", displayOrder: 3 },
        { title: "Learning in public", description: "Capturing experiments, technical notes, and lessons from real work.", category: "learning", displayOrder: 4 },
      ],
    });
    console.log("Now items created");
  }

  if ((await prisma.project.count()) === 0) {
    const now = new Date();
    await prisma.project.create({
      data: {
        title: "CX Recovery Tool",
        slug: "cx-recovery-tool",
        shortDescription: "An intelligent workflow system exploring how AI agents can support customer experience recovery and operational decision-making.",
        technologies: ["AI agents", "RAG", "Workflow automation"],
        coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=85",
        status: "PUBLISHED",
        isFeatured: true,
        displayOrder: 1,
        publishedAt: now,
        categoryId: await cat("AI Engineering"),
        tags: { connect: await tagIds("AI agents", "RAG") },
      },
    });
    await prisma.project.create({
      data: {
        title: "Enterprise Application Hub",
        slug: "enterprise-application-hub",
        shortDescription: "A unified entry point for enterprise applications, designed around secure access and a coherent employee experience.",
        technologies: ["Next.js", "SSO", "Enterprise"],
        coverImage: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1400&q=85",
        status: "PUBLISHED",
        isFeatured: true,
        displayOrder: 2,
        publishedAt: now,
        categoryId: await cat("Enterprise Systems"),
        tags: { connect: await tagIds("Next.js", "SSO") },
      },
    });
    await prisma.project.create({
      data: {
        title: "SACCO Management",
        slug: "sacco-management",
        shortDescription: "A product direction for digitizing savings, lending, member services, and financial operations for cooperative institutions.",
        technologies: ["React", "Node.js", "PostgreSQL"],
        coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=85",
        status: "PUBLISHED",
        isFeatured: true,
        displayOrder: 3,
        publishedAt: now,
        categoryId: await cat("SaaS / Fintech"),
        tags: { connect: await tagIds("React", "Node.js", "PostgreSQL") },
      },
    });
    console.log("Sample projects created (replace them from /admin/projects)");
  }

  if ((await prisma.journalArticle.count()) === 0) {
    const articles = [
      {
        title: "Turning existing n8n workflows into A2A-enabled agents",
        slug: "n8n-workflows-a2a-agents",
        excerpt: "A practical look at the gateway, agent cards, task lifecycle, and security boundaries behind agent interoperability.",
        html: "<p>What does it take to make existing automation workflows discoverable, callable, and secure in an agent-to-agent ecosystem?</p><h2>The gateway</h2><p>Draft notes — replace with the full article from the admin editor.</p>",
        readingTime: 8,
        publishedAt: new Date("2026-11-03"),
        category: "Agentic Systems",
        tags: ["n8n", "A2A", "AI agents"],
        isFeatured: true,
      },
      {
        title: "CQRS: separating reads and writes with a purpose",
        slug: "cqrs-separating-reads-and-writes",
        excerpt: "Understanding the trade-offs behind command-query separation, beyond simply creating two folders.",
        html: "<p>Understanding the trade-offs behind command-query separation, beyond simply creating two folders.</p>",
        readingTime: 6,
        publishedAt: new Date("2026-10-28"),
        category: "System Design",
        tags: ["CQRS"],
        isFeatured: false,
      },
      {
        title: "Notes from a Kubernetes and Helm deployment",
        slug: "kubernetes-helm-deployment-notes",
        excerpt: "Troubleshooting release states, configuration drift, and the small details that make deployments predictable.",
        html: "<p>Troubleshooting release states, configuration drift, and the small details that make deployments predictable.</p>",
        readingTime: 5,
        publishedAt: new Date("2026-10-21"),
        category: "DevOps",
        tags: ["Kubernetes", "Helm"],
        isFeatured: false,
      },
    ];
    for (const a of articles) {
      await prisma.journalArticle.create({
        data: {
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt,
          contentHtml: a.html,
          status: "PUBLISHED",
          readingTime: a.readingTime,
          isFeatured: a.isFeatured,
          publishedAt: a.publishedAt,
          categoryId: await cat(a.category),
          tags: { connect: await tagIds(...a.tags) },
        },
      });
    }
    console.log("Sample articles created");
  }
}

async function main() {
  await seedAdmin();
  await seedSettings();
  await seedTaxonomy();
  if (process.env.SEED_SAMPLE_CONTENT !== "false") await seedSampleContent();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
