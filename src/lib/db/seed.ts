import "dotenv/config";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { categories, projects, products, services, reviews, orders, orderItems, serviceRequests, siteSettings } from "./schema";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const sqlite = new Database(dbUrl.replace(/^file:/, ""));
const db = drizzle(sqlite);

async function main() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY,
      logo_url TEXT,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      description TEXT NOT NULL,
      tech_stack TEXT NOT NULL DEFAULT '[]',
      image_url TEXT,
      demo_url TEXT,
      repo_url TEXT,
      featured INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER REFERENCES categories(id),
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      features TEXT NOT NULL DEFAULT '[]',
      price_cents INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      image_url TEXT,
      file_url TEXT,
      download_url TEXT,
      license_type TEXT NOT NULL DEFAULT 'Standard License',
      version TEXT NOT NULL DEFAULT '1.0.0',
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      deliverables TEXT NOT NULL DEFAULT '[]',
      starting_price_cents INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS service_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER REFERENCES services(id),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      budget TEXT,
      timeline TEXT,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      total_cents INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'pending',
      stripe_session_id TEXT,
      stripe_payment_intent_id TEXT,
      download_token TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id),
      product_id INTEGER NOT NULL REFERENCES products(id),
      product_name TEXT NOT NULL,
      unit_price_cents INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      download_url TEXT
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER REFERENCES products(id),
      service_id INTEGER REFERENCES services(id),
      author_name TEXT NOT NULL,
      author_email TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      verified_buyer INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.delete(reviews).run();
  db.delete(orderItems).run();
  db.delete(orders).run();
  db.delete(serviceRequests).run();
  db.delete(services).run();
  db.delete(products).run();
  db.delete(projects).run();
  db.delete(categories).run();
  db.delete(siteSettings).run();

  db.insert(siteSettings).values({ id: 1, logoUrl: null }).run();

  db.insert(categories).values([
    { name: "Business Tools", slug: "business-tools", description: "Software for operations, CRM, and productivity.", active: true },
    { name: "Developer Tools", slug: "developer-tools", description: "Tools that help developers build and ship faster.", active: true },
    { name: "Finance", slug: "finance", description: "Invoicing, payments, and finance-related software.", active: true },
  ]).run();

  db.insert(projects).values([
    {
      slug: "vindex-analytics",
      title: "Vindex Analytics",
      summary: "A lightweight analytics dashboard for SaaS teams.",
      description:
        "Vindex Analytics is a privacy-focused dashboard that helps teams track key product metrics, conversion funnels, and retention. Built with performance and clarity in mind.",
      techStack: JSON.stringify(["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"]),
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      demoUrl: "https://example.com/demo",
      repoUrl: "https://github.com/example/vindex-analytics",
      featured: true,
    },
    {
      slug: "securepay-kit",
      title: "SecurePay Kit",
      summary: "Developer toolkit for secure payment integrations.",
      description:
        "SecurePay Kit provides reusable components, webhook handlers, and validation utilities for integrating secure payments into web apps.",
      techStack: JSON.stringify(["Node.js", "Stripe", "Zod", "TypeScript"]),
      imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80",
      demoUrl: "https://example.com/securepay",
      repoUrl: "https://github.com/example/securepay-kit",
      featured: true,
    },
    {
      slug: "opsflow-automation",
      title: "OpsFlow Automation",
      summary: "Automation workflows for internal business operations.",
      description:
        "OpsFlow automates repetitive business tasks, approvals, and notifications with an auditable workflow engine.",
      techStack: JSON.stringify(["React", "Node.js", "SQLite", "BullMQ"]),
      imageUrl: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1200&q=80",
      demoUrl: "https://example.com/opsflow",
      repoUrl: "https://github.com/example/opsflow",
      featured: false,
    },
  ]).run();

  db.insert(products).values([
    {
      categoryId: 1,
      slug: "vindex-crm-pro",
      name: "Vindex CRM Pro",
      description:
        "A lightweight CRM software for freelancers and small teams. Manage leads, contacts, deals, and follow-ups in one clean interface.",
      features: JSON.stringify([
        "Lead and contact management",
        "Deal pipeline tracking",
        "Email reminders",
        "Exportable reports",
        "Lifetime license for v1.x",
      ]),
      priceCents: 7900,
      currency: "USD",
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      downloadUrl: "https://example.com/downloads/vindex-crm-pro.zip",
      licenseType: "Single-user commercial license",
      version: "1.2.0",
      active: true,
    },
    {
      categoryId: 2,
      slug: "deploy-guard",
      name: "Deploy Guard",
      description:
        "A release checklist and deployment safety tool for developers. Prevent risky releases with configurable pre-deploy checks.",
      features: JSON.stringify([
        "Pre-deploy checklist rules",
        "CI integration templates",
        "Rollback readiness checks",
        "Team audit log",
      ]),
      priceCents: 4900,
      currency: "USD",
      imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
      downloadUrl: "https://example.com/downloads/deploy-guard.zip",
      licenseType: "Team license (up to 5 seats)",
      version: "2.0.1",
      active: true,
    },
    {
      categoryId: 3,
      slug: "invoice-sprint",
      name: "Invoice Sprint",
      description:
        "Simple invoicing software for developers and agencies. Create branded invoices, track payments, and export records.",
      features: JSON.stringify([
        "Branded invoice templates",
        "Payment status tracking",
        "PDF export",
        "Client records",
      ]),
      priceCents: 3900,
      currency: "USD",
      imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
      downloadUrl: "https://example.com/downloads/invoice-sprint.zip",
      licenseType: "Single-user commercial license",
      version: "1.0.4",
      active: true,
    },
  ]).run();

  db.insert(services).values([
    {
      slug: "custom-software-development",
      name: "Custom Software Development",
      description:
        "End-to-end development for web apps, internal tools, and MVPs tailored to your business needs.",
      deliverables: JSON.stringify([
        "Technical planning",
        "UI implementation",
        "Backend/API development",
        "Deployment support",
      ]),
      startingPriceCents: 150000,
      currency: "USD",
      active: true,
    },
    {
      slug: "api-integration",
      name: "API & Payment Integration",
      description:
        "Integrate third-party APIs, payment gateways, and automation workflows securely into your product.",
      deliverables: JSON.stringify([
        "Integration architecture",
        "Secure implementation",
        "Webhook handling",
        "Testing and documentation",
      ]),
      startingPriceCents: 80000,
      currency: "USD",
      active: true,
    },
    {
      slug: "maintenance-support",
      name: "Maintenance & Support",
      description:
        "Ongoing support, bug fixes, performance improvements, and feature updates for existing software.",
      deliverables: JSON.stringify([
        "Bug fixes",
        "Performance tuning",
        "Security updates",
        "Monthly support report",
      ]),
      startingPriceCents: 50000,
      currency: "USD",
      active: true,
    },
  ]).run();

  db.insert(reviews).values([
    {
      productId: 1,
      authorName: "Amina K.",
      authorEmail: "amina@example.com",
      rating: 5,
      comment: "Clean interface and exactly what our small team needed. Setup was quick and the workflow is intuitive.",
      status: "approved",
      verifiedBuyer: true,
    },
    {
      productId: 2,
      authorName: "Daniel M.",
      authorEmail: "daniel@example.com",
      rating: 4,
      comment: "Deploy Guard helped us catch missing release steps. Would love more CI templates, but it’s already valuable.",
      status: "approved",
      verifiedBuyer: true,
    },
    {
      serviceId: 1,
      authorName: "Sarah T.",
      authorEmail: "sarah@example.com",
      rating: 5,
      comment: "Professional communication and solid delivery. The final software matched our requirements perfectly.",
      status: "approved",
      verifiedBuyer: false,
    },
  ]).run();

  console.log("Seeded database.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
