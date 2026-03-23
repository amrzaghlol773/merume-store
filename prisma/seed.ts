import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const catalog = [
  {
    category: "Men",
    name: "Storm",
    slug: "storm",
    description: "Sandalwood and saffron blend with a warm spicy trail.",
    images: [{ url: "/storm.jpeg", alt: "Storm perfume bottle", isPrimary: true }],
    variants: [
      { label: "50ml", price: 400, isDefault: true },
      { label: "100ml", price: 550, isDefault: false },
    ],
  },
  {
    category: "Women",
    name: "Royal Vetiver",
    slug: "royal-vetiver",
    description: "Elegant floral opening over a smooth woody vetiver base.",
    images: [
      {
        url: "/WhatsApp Image 2026-03-06 at 12.50.07 AM.jpeg",
        alt: "Royal Vetiver perfume",
        isPrimary: true,
      },
    ],
    variants: [
      { label: "50ml", price: 1300, isDefault: true },
      { label: "100ml", price: 2100, isDefault: false },
    ],
  },
  {
    category: "Men",
    name: "Arabic Wood",
    slug: "arabic-wood",
    description: "For Oud Lovers.",
    images: [{ url: "/ArabicWood.jpeg", alt: "Arabic Wood perfume", isPrimary: true }],
    variants: [
      { label: "50ml", price: 430, isDefault: true },
      { label: "100ml", price: 570, isDefault: false },
    ],
  },
  {
    category: "Women",
    name: "Blush Peony",
    slug: "blush-peony",
    description:
      "Blush Peony opens with sparkling pear and soft peony petals before flowing into creamy sandalwood. Fresh and elegant, it feels polished in everyday use while keeping a soft luxury impression.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80",
        alt: "Blush Peony perfume",
        isPrimary: true,
      },
    ],
    variants: [
      { label: "50ml", price: 1100, isDefault: true },
      { label: "100ml", price: 1780, isDefault: false },
    ],
  },
  {
    category: "Men",
    name: "Noir Leather",
    slug: "noir-leather",
    description: "Dark leather and amber accord for evening wear.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80",
        alt: "Noir Leather perfume",
        isPrimary: true,
      },
    ],
    variants: [
      { label: "50ml", price: 980, isDefault: true },
      { label: "100ml", price: 1650, isDefault: false },
    ],
  },
  {
    category: "Men",
    name: "Cedar Rain",
    slug: "cedar-rain",
    description: "Fresh citrus top notes with cedar and musk dry-down.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=80",
        alt: "Cedar Rain perfume",
        isPrimary: true,
      },
    ],
    variants: [
      { label: "50ml", price: 760, isDefault: true },
      { label: "100ml", price: 1290, isDefault: false },
    ],
  },
  {
    category: "Men",
    name: "Amber Reef",
    slug: "amber-reef",
    description: "Marine freshness blended with amber and patchouli.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=900&q=80",
        alt: "Amber Reef perfume",
        isPrimary: true,
      },
    ],
    variants: [
      { label: "50ml", price: 830, isDefault: true },
      { label: "100ml", price: 1390, isDefault: false },
    ],
  },
  {
    category: "Women",
    name: "Velvet Iris",
    slug: "velvet-iris",
    description: "Powdery iris with vanilla and white musk finish.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=900&q=80",
        alt: "Velvet Iris perfume",
        isPrimary: true,
      },
    ],
    variants: [
      { label: "50ml", price: 1020, isDefault: true },
      { label: "100ml", price: 1710, isDefault: false },
    ],
  },
  {
    category: "Women",
    name: "Rose Mirage",
    slug: "rose-mirage",
    description: "Modern rose bouquet with fruity sparkle and soft woods.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1595425964072-67d0b3f86dd5?auto=format&fit=crop&w=900&q=80",
        alt: "Rose Mirage perfume",
        isPrimary: true,
      },
    ],
    variants: [
      { label: "50ml", price: 950, isDefault: true },
      { label: "100ml", price: 1590, isDefault: false },
    ],
  },
  {
    category: "Women",
    name: "Pearl Blossom",
    slug: "pearl-blossom",
    description: "Bright white florals with a clean, luminous finish.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=900&q=80",
        alt: "Pearl Blossom perfume",
        isPrimary: true,
      },
    ],
    variants: [
      { label: "50ml", price: 890, isDefault: true },
      { label: "100ml", price: 1490, isDefault: false },
    ],
  },
  {
    category: "Candles",
    name: "Midnight Oud Candle",
    slug: "midnight-oud-candle",
    description:
      "Midnight Oud Candle fills the room with smoky oud, resin, and warm vanilla. Designed for intimate evenings, it creates a rich atmosphere with strong diffusion and a smooth, steady burn.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80",
        alt: "Midnight Oud Candle",
        isPrimary: true,
      },
    ],
    variants: [{ label: "Single", price: 920, isDefault: true }],
  },
  {
    category: "Candles",
    name: "Soft Bloom Candle",
    slug: "soft-bloom-candle",
    description:
      "Soft Bloom Candle layers white tea and peony over warm cashmere and clean musk. It is ideal for calm routines, adding a bright, comforting, and premium touch to any room.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1637160151665-91ed66e23fb6?auto=format&fit=crop&w=900&q=80",
        alt: "Soft Bloom Candle",
        isPrimary: true,
      },
    ],
    variants: [{ label: "Single", price: 860, isDefault: true }],
  },
  {
    category: "Candles",
    name: "Citrus Linen Candle",
    slug: "citrus-linen-candle",
    description:
      "Citrus Linen Candle delivers fresh citrus and airy cotton for a clean-home mood.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1602874801006-2c1871b9c68c?auto=format&fit=crop&w=900&q=80",
        alt: "Citrus Linen Candle",
        isPrimary: true,
      },
    ],
    variants: [{ label: "Single", price: 780, isDefault: true }],
  },
  {
    category: "Candles",
    name: "Vanilla Smoke Candle",
    slug: "vanilla-smoke-candle",
    description:
      "Vanilla Smoke Candle blends creamy vanilla with incense and soft woods.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1612196808214-b7e239e5ad86?auto=format&fit=crop&w=900&q=80",
        alt: "Vanilla Smoke Candle",
        isPrimary: true,
      },
    ],
    variants: [{ label: "Single", price: 910, isDefault: true }],
  },
  {
    category: "Candles",
    name: "Fig Amber Candle",
    slug: "fig-amber-candle",
    description: "Sweet fig notes wrapped in warm amber and resin.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1608181831718-3f7704d5fadb?auto=format&fit=crop&w=900&q=80",
        alt: "Fig Amber Candle",
        isPrimary: true,
      },
    ],
    variants: [{ label: "Single", price: 890, isDefault: true }],
  },
];

async function main() {
  await prisma.reviewImage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  for (const categoryName of ["Men", "Women", "Candles"]) {
    await prisma.category.create({
      data: {
        name: categoryName,
        slug: categoryName.toLowerCase(),
      },
    });
  }

  for (const entry of catalog) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { name: entry.category },
    });

    await prisma.product.create({
      data: {
        name: entry.name,
        slug: entry.slug,
        description: entry.description,
        categoryId: category.id,
        images: {
          create: entry.images.map((image, index) => ({
            url: image.url,
            alt: image.alt,
            isPrimary: image.isPrimary,
            sortOrder: index,
          })),
        },
        variants: {
          create: entry.variants,
        },
      },
    });
  }
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
