import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = (
    process.env.ADMIN_BOOTSTRAP_USERNAME ?? "admin"
  ).toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "KeydTechAdmin2026!";
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { username },
    update: {
      name: "KeydTech Admin",
      passwordHash,
      role: Role.SUPER_ADMIN,
      active: true,
      avatarUrl: "/images/avatar-keydtech.png",
    },
    create: {
      name: "KeydTech Admin",
      username,
      email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "keydtechnology@gmail.com",
      passwordHash,
      role: Role.SUPER_ADMIN,
      avatarUrl: "/images/avatar-keydtech.png",
    },
  });

  const categories = [
    {
      slug: "odoo",
      nameEn: "Odoo ERP",
      nameSo: "Odoo ERP",
      descriptionEn: "Implementation tips and product deep-dives.",
      descriptionSo: "Talooyin hirgelin iyo faham qoto dheer oo Odoo.",
    },
    {
      slug: "retail",
      nameEn: "Retail & POS",
      nameSo: "Tukaan & POS",
      descriptionEn: "POS, inventory, and shop-floor operations.",
      descriptionSo: "POS, kayd, iyo hawlgalka dukaanka.",
    },
    {
      slug: "inventory",
      nameEn: "Inventory",
      nameSo: "Kaydka",
      descriptionEn: "Stock control, barcodes, and warehouses.",
      descriptionSo: "Xakamaynta kaydka, barcode, iyo bakhaarrada.",
    },
    {
      slug: "somalia-business",
      nameEn: "Somalia Business",
      nameSo: "Ganacsiga Soomaaliya",
      descriptionEn: "Local insights for Mogadishu and Somali SMEs.",
      descriptionSo: "Aragtiyo maxalli ah oo Muqdisho iyo ganacsatada.",
    },
    {
      slug: "tips",
      nameEn: "Tips & Guides",
      nameSo: "Talooyin & Hagayaal",
      descriptionEn: "Practical how-tos for growing teams.",
      descriptionSo: "Habab wax ku ool ah oo kooxaha koraya.",
    },
    {
      slug: "news",
      nameEn: "News",
      nameSo: "Wararka",
      descriptionEn: "Product updates and company announcements.",
      descriptionSo: "Cusboonaysiinta alaabta iyo ogeysiisyada.",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  const sampleSlug = "odoo-erp-for-mogadishu-retailers";
  const existing = await prisma.post.findUnique({ where: { slug: sampleSlug } });
  if (!existing) {
    const retail = await prisma.category.findUnique({ where: { slug: "retail" } });
    const odoo = await prisma.category.findUnique({ where: { slug: "odoo" } });

    await prisma.post.create({
      data: {
        slug: sampleSlug,
        titleEn: "Odoo ERP for Mogadishu Retailers: A Practical Start",
        titleSo: "Odoo ERP ee Tukaamada Muqdisho: Bilow Wax Ku Ool Ah",
        excerptEn:
          "How retail shops in Mogadishu can replace spreadsheets with POS, inventory, and accounting that work together.",
        excerptSo:
          "Sida tukaamada Muqdisho uga beddeli karaan spreadsheet-yada POS, kayd, iyo xisaab isku shaqeeya.",
        contentEn: `
          <p>Running a shop in Mogadishu means busy days, thin margins, and stock that must stay accurate. Spreadsheets break when sales spike.</p>
          <p><strong>Start with three modules:</strong> Point of Sale, Inventory, and Invoicing. Connect them so every sale updates stock and cash in real time.</p>
          <h2>Week-one checklist</h2>
          <ul>
            <li>Map your product categories and barcodes</li>
            <li>Train cashiers on a simple POS flow</li>
            <li>Set reorder rules for your top 50 SKUs</li>
          </ul>
          <p>KeydTech helps Somali retailers go live without months of chaos — local support, clear training, and Odoo configured for how you actually sell.</p>
        `,
        contentSo: `
          <p>Maamulka dukaanka Muqdisho wuxuu u baahan yahay kayd sax ah iyo iib degdeg ah. Spreadsheet-yadu way daciifaan marka iibku kordho.</p>
          <p><strong>Ku bilow saddex module:</strong> Point of Sale, Inventory, iyo Invoicing. Isku xir si iib kastaa u cusbooneysiiyo kaydka iyo lacagta.</p>
          <h2>Liiska toddobaadka koowaad</h2>
          <ul>
            <li>Diyaarso qaybaha alaabta iyo barcode-yada</li>
            <li>Tababar lacag-qaadayaasha POS fudud</li>
            <li>Deji xeerarka dib-u-dalbashada 50 SKU ee ugu muhiimsan</li>
          </ul>
          <p>KeydTech waxay ka caawisaa tukaamada Soomaaliyeed inay si degdeg ah u bilaabaan — taageero maxalli ah, tababar cad, iyo Odoo ku habboon sida aad u iibiso.</p>
        `,
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorId: admin.id,
        seoTitleEn: "Odoo ERP Mogadishu Retailers | KeydTech",
        seoTitleSo: "Odoo ERP Tukaamada Muqdisho | KeydTech",
        seoDescEn:
          "Practical guide to launching Odoo POS and inventory for retail shops in Mogadishu, Somalia.",
        seoDescSo:
          "Hagaha wax ku ool ah ee bilowga Odoo POS iyo kaydka tukaamada Muqdisho.",
        categories: {
          create: [
            ...(odoo ? [{ categoryId: odoo.id }] : []),
            ...(retail ? [{ categoryId: retail.id }] : []),
          ],
        },
      },
    });
  }

  console.log(`Seeded admin user: ${username}`);
  console.log("Seeded categories and sample post.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
