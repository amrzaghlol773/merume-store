"use client";

import Image from "next/image";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import styles from "./luxe-preview.module.css";

const headingFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-heading",
});

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

type PreviewProduct = {
  id: number;
  name: string;
  notes: string;
  price: string;
  image: string;
  ratingCount: number;
  limited?: boolean;
};

const products: PreviewProduct[] = [
  {
    id: 1,
    name: "Midnight Oud",
    notes: "100ml - Eau de Parfum",
    price: "$245.00",
    image:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80",
    ratingCount: 48,
  },
  {
    id: 2,
    name: "Saffron Bloom",
    notes: "50ml - Extract",
    price: "$185.00",
    image:
      "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=900&q=80",
    ratingCount: 32,
  },
  {
    id: 3,
    name: "Ember Whisper",
    notes: "100ml - Parfum Intense",
    price: "$210.00",
    image:
      "https://images.unsplash.com/photo-1585386959984-a41552231658?auto=format&fit=crop&w=900&q=80",
    ratingCount: 120,
    limited: true,
  },
  {
    id: 4,
    name: "Velvet Musk",
    notes: "75ml - Eau de Parfum",
    price: "$195.00",
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80",
    ratingCount: 56,
  },
];

function Stars() {
  return <span className={styles.stars}>★★★★★</span>;
}

export default function LuxePreview() {
  return (
    <div className={`${styles.shell} ${headingFont.variable} ${bodyFont.variable}`}>
      <div className={styles.noise} aria-hidden="true" />

      <header className={styles.topBar}>
        <div className={styles.brand}>LUXE AURA</div>
        <nav className={styles.navLinks}>
          <a href="#collections">Collections</a>
          <a href="#best-sellers">Best Sellers</a>
          <a href="#men">Men</a>
          <a href="#women">Women</a>
          <a href="#story">Our Story</a>
        </nav>
        <div className={styles.search}>Search for your signature scent...</div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <Image
            src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1800&q=80"
            alt="Luxury perfume bottle"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 1200px"
            className={styles.heroImage}
          />
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>NEW COLLECTION 2024</p>
            <h1>
              Merume Artisan Scents for the <span>Discerning</span>
            </h1>
            <p>
              Merume Experience the pinnacle of olfactory art with our curated collection of rare essences and bespoke
              blends.
            </p>
            <div className={styles.heroActions}>
              <button type="button" className={styles.primaryBtn}>
                Shop Now
              </button>
            </div>
          </div>
        </section>

        <section className={styles.catalog} id="collections">
          <div className={styles.sectionHeader}>
            <h2>Refined Selection</h2>
            <p>Discover your next signature fragrance</p>
          </div>

          <div className={styles.filterRow}>
            <button type="button">Gender</button>
            <button type="button">Scent Type: Oud/Floral</button>
            <button type="button">Price Range</button>
            <button type="button" className={styles.iconFilter}>
              ☰
            </button>
          </div>

          <div className={styles.productGrid} id="best-sellers">
            {products.map((product) => (
              <article key={product.id} className={styles.productCard}>
                <div className={styles.cardImageWrap}>
                  {product.limited && <span className={styles.limitedBadge}>Limited</span>}
                  <button type="button" className={styles.heartBtn} aria-label={`Save ${product.name}`}>
                    ❤
                  </button>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 900px) 100vw, 320px"
                    className={styles.cardImage}
                  />
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardTitleRow}>
                    <h3>{product.name}</h3>
                    <strong>{product.price}</strong>
                  </div>
                  <p>{product.notes}</p>
                  <div className={styles.ratingRow}>
                    <Stars />
                    <span>({product.ratingCount})</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <button type="button" className={styles.viewAllBtn}>
            View All Products
          </button>
        </section>

        <section className={styles.newsletter}>
          <h2>Join the Inner Circle</h2>
          <p>
            Receive exclusive invitations to private launches, early access to limited editions, and olfactory insights
            from our master perfumers.
          </p>
          <form className={styles.newsletterForm} onSubmit={(event) => event.preventDefault()}>
            <input type="email" placeholder="Email address" aria-label="Email address" />
            <button type="submit">Subscribe</button>
          </form>
        </section>
      </main>

      <footer className={styles.footer} id="story">
        <div>
          <h4>Luxe Aura</h4>
          <p>Crafting memories through scent since 1994. Every bottle is a journey through time and emotion.</p>
        </div>
        <div>
          <h5>Navigation</h5>
          <ul>
            <li>Shop All</li>
            <li>Gift Sets</li>
            <li>Samples</li>
            <li>Find Your Scent</li>
          </ul>
        </div>
        <div>
          <h5>Support</h5>
          <ul>
            <li>Shipping & Returns</li>
            <li>Store Locator</li>
            <li>Track Order</li>
            <li>Contact Us</li>
          </ul>
        </div>
        <div>
          <h5>Follow Us</h5>
          <div className={styles.socials}>
            <span>◉</span>
            <span>◈</span>
            <span>◌</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
