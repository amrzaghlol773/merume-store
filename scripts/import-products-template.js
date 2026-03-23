/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const shouldPrune = process.argv.includes("--prune");
  const templatePath = path.join(process.cwd(), "data", "products.template.json");
  const items = JSON.parse(fs.readFileSync(templatePath, "utf8"));
  const templateSlugs = new Set(items.map((item) => String(item.slug || "").trim()).filter(Boolean));

  const categoryNames = [...new Set(items.map((p) => String(p.category || "").trim()).filter(Boolean))];

  for (const categoryName of categoryNames) {
    await prisma.category.upsert({
      where: { name: categoryName },
      update: { slug: categoryName.toLowerCase() },
      create: { name: categoryName, slug: categoryName.toLowerCase() },
    });
  }

  let created = 0;
  let updated = 0;

  for (const item of items) {
    const categoryName = String(item.category || "").trim();
    const name = String(item.name || "").trim();
    const slug = String(item.slug || "").trim();
    if (!categoryName || !name || !slug) {
      continue;
    }

    const category = await prisma.category.findUnique({ where: { name: categoryName } });
    if (!category) {
      continue;
    }

    const primaryImage = String(item.primaryImage || "").trim();
    const galleryImages = Array.isArray(item.galleryImages)
      ? item.galleryImages.map((url) => String(url || "").trim()).filter(Boolean)
      : [];

    const variants = Array.isArray(item.variants)
      ? item.variants
          .map((variant) => ({
            label: String(variant.label || "").trim(),
            price: Number(variant.price) || 0,
            isDefault: Boolean(variant.isDefault),
          }))
          .filter((variant) => variant.label)
      : [];

    const normalizedVariants = variants.length
      ? variants.map((variant, index) => ({
          ...variant,
          isDefault: variants.some((entry) => entry.isDefault) ? variant.isDefault : index === 0,
        }))
      : [{ label: "50ml", price: 0, isDefault: true }];

    const imageUrls = [primaryImage, ...galleryImages].filter(Boolean);

    const existing = await prisma.product.findUnique({ where: { slug } });

    if (existing) {
      await prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id: existing.id },
          data: {
            name,
            description: String(item.description || "").trim() || "TODO: add product description",
            categoryId: category.id,
          },
        });

        await tx.productImage.deleteMany({ where: { productId: existing.id } });
        await tx.productVariant.deleteMany({ where: { productId: existing.id } });

        if (imageUrls.length) {
          await tx.productImage.createMany({
            data: imageUrls.map((url, index) => ({
              productId: existing.id,
              url,
              alt: `${name} image ${index + 1}`,
              isPrimary: index === 0,
              sortOrder: index,
            })),
          });
        }

        await tx.productVariant.createMany({
          data: normalizedVariants.map((variant) => ({
            productId: existing.id,
            label: variant.label,
            price: variant.price,
            isDefault: variant.isDefault,
          })),
        });
      });
      updated += 1;
    } else {
      await prisma.product.create({
        data: {
          name,
          slug,
          description: String(item.description || "").trim() || "TODO: add product description",
          categoryId: category.id,
          images: {
            create: imageUrls.map((url, index) => ({
              url,
              alt: `${name} image ${index + 1}`,
              isPrimary: index === 0,
              sortOrder: index,
            })),
          },
          variants: {
            create: normalizedVariants,
          },
        },
      });
      created += 1;
    }
  }

  let deleted = 0;
  if (shouldPrune) {
    const productsToDelete = await prisma.product.findMany({
      where: {
        slug: {
          notIn: [...templateSlugs],
        },
      },
      select: { id: true },
    });

    if (productsToDelete.length) {
      const productIds = productsToDelete.map((product) => product.id);

      await prisma.$transaction(async (tx) => {
        await tx.productImage.deleteMany({ where: { productId: { in: productIds } } });
        await tx.productVariant.deleteMany({ where: { productId: { in: productIds } } });
        await tx.reviewImage.deleteMany({ where: { review: { productId: { in: productIds } } } });
        await tx.review.deleteMany({ where: { productId: { in: productIds } } });
        const result = await tx.product.deleteMany({ where: { id: { in: productIds } } });
        deleted = result.count;
      });
    }
  }

  const totalProducts = await prisma.product.count();
  console.log(
    `Import done. created=${created}, updated=${updated}, deleted=${deleted}, total_products=${totalProducts}, prune=${shouldPrune}`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
