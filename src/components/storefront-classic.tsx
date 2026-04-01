"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  images: Array<{ url: string; alt: string; isPrimary: boolean }>;
  variants: Array<{ label: string; price: number; isDefault: boolean }>;
};

type CartItem = {
  productId: number;
  variantLabel: string;
  qty: number;
};

type HeroSlide = {
  image: string;
  alt: string;
};

const heroSlides: HeroSlide[] = [
  {
    image: "/products/Sliderimages/WhatsApp Image 2026-03-23 at 8.36.24 AM.jpeg",
    alt: "Merume slider image 1",
  },
  {
    image: "/products/Sliderimages/WhatsApp Image 2026-03-23 at 8.36.24 AM (1).jpeg",
    alt: "Merume slider image 2",
  },
  {
    image: "/products/Sliderimages/WhatsApp Image 2026-03-23 at 8.36.25 AM.jpeg",
    alt: "Merume slider image 3",
  },
];

const governorates = [
  { value: "Cairo", label: "Cairo" },
  { value: "Giza", label: "Giza" },
  { value: "Sixth_of_October", label: "6th of October" },
  { value: "Sheikh_Zayed", label: "Sheikh Zayed" },
  { value: "Rehab", label: "Rehab" },
  { value: "Madinaty", label: "Madinaty" },
  { value: "Obour", label: "Obour" },
  { value: "Shorouk", label: "Shorouk" },
  { value: "Alexandria", label: "Alexandria" },
  { value: "Ayyat", label: "Ayyat" },
  { value: "Oseem", label: "Oseem" },
  { value: "Khanka", label: "Khanka" },
  { value: "Qalyubia_Outskirts", label: "Qalyubia Outskirts" },
  { value: "Port_Said", label: "Port Said" },
  { value: "Ismailia", label: "Ismailia" },
  { value: "Suez", label: "Suez" },
  { value: "Dakahlia", label: "Dakahlia" },
  { value: "Sharqia", label: "Sharqia" },
  { value: "Gharbia", label: "Gharbia" },
  { value: "Monufia", label: "Monufia" },
  { value: "Damietta", label: "Damietta" },
  { value: "Kafr_El_Sheikh", label: "Kafr El Sheikh" },
  { value: "Asyut", label: "Asyut" },
  { value: "Beni_Suef", label: "Beni Suef" },
  { value: "Fayoum", label: "Fayoum" },
  { value: "Minya", label: "Minya" },
  { value: "Sohag", label: "Sohag" },
  { value: "Matrouh", label: "Matrouh" },
  { value: "Qena", label: "Qena" },
  { value: "Luxor", label: "Luxor" },
  { value: "Aswan", label: "Aswan" },
  { value: "Hurghada", label: "Hurghada" },
  { value: "Safaga", label: "Safaga" },
  { value: "Sharm_El_Sheikh", label: "Sharm El Sheikh" },
  { value: "Dahab", label: "Dahab" },
  { value: "Arish", label: "Arish" },
];

const featuredTestimonials = [
  {
    name: "Nour A.",
    text: "Elegant scent profile and strong longevity. Delivery was quick and beautifully packed.",
  },
  {
    name: "Karim M.",
    text: "The fragrance quality surprised me in the best way. It feels premium from first spray.",
  },
  {
    name: "Maha S.",
    text: "I ordered a gift set and the presentation was excellent. Will definitely reorder.",
  },
];

const INITIAL_ALL_PRODUCTS_COUNT = 8;
const ALL_PRODUCTS_STEP = 8;

function formatPrice(price: number) {
  return `${price.toLocaleString("en-EG")} EGP`;
}

function getCategoryLabel(category: string) {
  return category === "Candles" ? "Home scent" : category;
}

function getDefaultVariant(product: Product) {
  return product.variants.find((variant) => variant.isDefault) || product.variants[0];
}

function getVariantByLabel(product: Product, label: string) {
  return product.variants.find((variant) => variant.label === label) || getDefaultVariant(product);
}

function getCartItemKey(item: CartItem) {
  return `${item.productId}::${item.variantLabel || "single"}`;
}

function normalizeImageUrl(rawUrl: string) {
  const value = String(rawUrl || "").trim().replace(/\\/g, "/");
  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    return value;
  }

  // Ignore Windows absolute file paths that cannot be served by Next.js.
  if (/^[a-zA-Z]:\//.test(value)) {
    return "";
  }

  return `/${value.replace(/^\.?\//, "")}`;
}

function getPrimaryImage(product: Product) {
  const primary = product.images.find((image) => image.isPrimary)?.url || product.images[0]?.url || "";
  return normalizeImageUrl(primary);
}

function getProductPriceLabel(product: Product) {
  if (product.variants.length <= 1) {
    return formatPrice(product.variants[0]?.price || 0);
  }

  return product.variants.map((variant) => `${variant.label}: ${formatPrice(variant.price)}`).join(" | ");
}

function getLowestPrice(product: Product) {
  if (!product.variants.length) {
    return 0;
  }

  return Math.min(...product.variants.map((variant) => variant.price || 0));
}

function normalizeEgyptPhone(rawPhone: string) {
  const digits = String(rawPhone || "").replace(/\D/g, "");

  if (/^01\d{9}$/.test(digits)) {
    return `+2${digits}`;
  }

  if (/^201\d{9}$/.test(digits)) {
    return `+${digits}`;
  }

  if (/^\+201\d{9}$/.test(String(rawPhone || "").trim())) {
    return String(rawPhone).trim();
  }

  return "";
}

function isValidEmail(email: string) {
  if (!email.trim()) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function trackEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = { event: eventName, ...params };
  const scopedWindow = window as Window & {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  };

  scopedWindow.dataLayer = scopedWindow.dataLayer || [];
  scopedWindow.dataLayer.push(payload);

  if (typeof scopedWindow.gtag === "function") {
    scopedWindow.gtag("event", eventName, params);
  }
}

export default function Storefront() {
  const [isNavSolid, setIsNavSolid] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "priceAsc" | "priceDesc" | "nameAsc">("featured");
  const [visibleAllCount, setVisibleAllCount] = useState(INITIAL_ALL_PRODUCTS_COUNT);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [productViewOpen, setProductViewOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedViewVariant, setSelectedViewVariant] = useState("");
  const [selectedViewQuantity, setSelectedViewQuantity] = useState(1);
  const [selectedViewImage, setSelectedViewImage] = useState("");
  const [addFeedback, setAddFeedback] = useState("");
  const [cardVariants, setCardVariants] = useState<Record<number, string>>({});

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [selectedGovernorateKey, setSelectedGovernorateKey] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const hasOpenOverlay = cartOpen || checkoutOpen || productViewOpen;

  useEffect(() => {
    const onScroll = () => setIsNavSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((previous) => (previous + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = hasOpenOverlay ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [hasOpenOverlay]);

  useEffect(() => {
    if (!addFeedback) {
      return;
    }

    const timer = window.setTimeout(() => setAddFeedback(""), 1300);
    return () => window.clearTimeout(timer);
  }, [addFeedback]);

  useEffect(() => {
    const loadProducts = async () => {
      setProductsLoading(true);
      setProductsError("");
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        const json = (await response.json()) as { products?: Product[]; error?: string };
        if (!response.ok || !json.products) {
          throw new Error(json.error || "Failed to load products");
        }

        setProducts(json.products);
      } catch (error) {
        setProductsError(error instanceof Error ? error.message : "Failed to load products");
      } finally {
        setProductsLoading(false);
      }
    };

    void loadProducts();
  }, []);

  const visibleProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (selectedCategory === "All") {
      const filtered = query
        ? products.filter((product) => {
          const searchable = `${product.name} ${product.description} ${product.category}`.toLowerCase();
          return searchable.includes(query);
        })
        : products;

      if (sortBy === "priceAsc") {
        return [...filtered].sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
      }

      if (sortBy === "priceDesc") {
        return [...filtered].sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
      }

      if (sortBy === "nameAsc") {
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      }

      return filtered;
    }

    const filteredByCategory = products.filter((product) => product.category === selectedCategory);
    const filtered = query
      ? filteredByCategory.filter((product) => {
        const searchable = `${product.name} ${product.description} ${product.category}`.toLowerCase();
        return searchable.includes(query);
      })
      : filteredByCategory;

    if (sortBy === "priceAsc") {
      return [...filtered].sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
    }

    if (sortBy === "priceDesc") {
      return [...filtered].sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
    }

    if (sortBy === "nameAsc") {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [selectedCategory, products, searchQuery, sortBy]);

  useEffect(() => {
    setVisibleAllCount(INITIAL_ALL_PRODUCTS_COUNT);
  }, [selectedCategory, searchQuery]);

  const displayedProducts = useMemo(() => {
    if (selectedCategory !== "All") {
      return visibleProducts;
    }

    return visibleProducts.slice(0, visibleAllCount);
  }, [selectedCategory, visibleProducts, visibleAllCount]);

  const canLoadMoreAll =
    selectedCategory === "All" && displayedProducts.length < visibleProducts.length;
  const canShowLessAll =
    selectedCategory === "All" && displayedProducts.length > INITIAL_ALL_PRODUCTS_COUNT;

  const availableCategories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map((product) => product.category).filter(Boolean))];
    const preferredOrder = ["Men", "Women", "Candles"];

    const orderedCategories = [
      ...preferredOrder.filter((category) => uniqueCategories.includes(category)),
      ...uniqueCategories.filter((category) => !preferredOrder.includes(category)).sort((a, b) => a.localeCompare(b)),
    ];

    return ["All", ...orderedCategories];
  }, [products]);

  useEffect(() => {
    if (selectedCategory === "All") {
      return;
    }

    if (!availableCategories.includes(selectedCategory)) {
      setSelectedCategory("All");
    }
  }, [availableCategories, selectedCategory]);

  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);

  const cartSubtotal = useMemo(
    () =>
      cart.reduce((total, cartItem) => {
        const product = productMap.get(cartItem.productId);
        if (!product) {
          return total;
        }

        const variant = getVariantByLabel(product, cartItem.variantLabel);
        return total + (variant?.price || 0) * cartItem.qty;
      }, 0),
    [cart, productMap],
  );

  const featuredProducts = useMemo(() => products.slice(0, 3), [products]);

  const selectedProductGallery = selectedProduct
    ? selectedProduct.images
      .map((image) => normalizeImageUrl(image.url))
      .filter((url): url is string => Boolean(url))
    : [];

  const selectedProductPrice = selectedProduct
    ? (getVariantByLabel(selectedProduct, selectedViewVariant)?.price || 0)
    : 0;

  const openProductView = (product: Product) => {
    const defaultVariant = getDefaultVariant(product);
    setSelectedProduct(product);
    setSelectedViewVariant(defaultVariant?.label || "");
    setSelectedViewQuantity(1);
    setSelectedViewImage(getPrimaryImage(product));
    setAddFeedback("");
    setProductViewOpen(true);
    trackEvent("view_item", {
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      value: getLowestPrice(product),
    });
  };

  const closeAllOverlays = () => {
    setCartOpen(false);
    setCheckoutOpen(false);
    setProductViewOpen(false);
    setSelectedProduct(null);
    setSelectedViewVariant("");
    setSelectedViewQuantity(1);
  };

  const upsertCartItem = (productId: number, variantLabel = "", quantity = 1) => {
    const product = productMap.get(productId);
    if (!product) {
      return;
    }

    const fallbackVariant = getDefaultVariant(product)?.label || "";
    const normalizedVariant = variantLabel || fallbackVariant;
    const validQty = Math.max(1, Number(quantity) || 1);

    trackEvent("add_to_cart", {
      item_id: product.id,
      item_name: product.name,
      item_variant: normalizedVariant,
      quantity: validQty,
    });

    setCart((previous) => {
      const existingIndex = previous.findIndex(
        (item) => item.productId === productId && item.variantLabel === normalizedVariant,
      );

      if (existingIndex === -1) {
        return [...previous, { productId, variantLabel: normalizedVariant, qty: validQty }];
      }

      return previous.map((item, index) =>
        index === existingIndex ? { ...item, qty: item.qty + validQty } : item,
      );
    });
  };

  const increaseCartItem = (key: string) => {
    setCart((previous) =>
      previous.map((item) => (getCartItemKey(item) === key ? { ...item, qty: item.qty + 1 } : item)),
    );
  };

  const decreaseCartItem = (key: string) => {
    setCart((previous) =>
      previous
        .map((item) => (getCartItemKey(item) === key ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0),
    );
  };

  const deleteCartItem = (key: string) => {
    setCart((previous) => previous.filter((item) => getCartItemKey(item) !== key));
  };

  const addSelectedProductFromView = () => {
    if (!selectedProduct) {
      return;
    }

    upsertCartItem(selectedProduct.id, selectedViewVariant, selectedViewQuantity);
    setAddFeedback(`Added x${selectedViewQuantity}!`);
  };

  const orderSelectedProductViaWhatsApp = () => {
    if (!selectedProduct) {
      return;
    }

    const unitPrice = getVariantByLabel(selectedProduct, selectedViewVariant)?.price || 0;
    const variantLabel = selectedViewVariant ? ` ${selectedViewVariant}` : "";

    // const message = `Hello Merume, I want to order ${selectedProduct.name}${variantLabel} x${selectedViewQuantity}. Unit price: ${unitPrice} EGP, Total: ${unitPrice * selectedViewQuantity} EGP.`;
    // window.open(`https://wa.me/201131104759?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  };

  const submitCheckoutOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!cart.length) {
      setCheckoutError("Your cart is empty.");
      return;
    }

    if (!selectedGovernorateKey || !customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setCheckoutError("Please complete all required checkout fields.");
      return;
    }

    if (!isValidEmail(customerEmail)) {
      setCheckoutError("Please enter a valid email address.");
      return;
    }

    const normalizedPhone = normalizeEgyptPhone(customerPhone);
    if (!normalizedPhone) {
      setCheckoutError("Please enter a valid Egyptian phone number (e.g. 010xxxxxxxx).");
      return;
    }

    setCheckoutError("");
    setSubmittingOrder(true);

    // Safari on iOS may block window.open calls after await, so open a placeholder tab now.
    const whatsappTab =
      typeof window !== "undefined" ? window.open("", "_blank") : null;

    trackEvent("begin_checkout", {
      value: cartSubtotal,
      items_count: cart.length,
    });

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: customerName,
          phone: normalizedPhone,
          email: customerEmail,
          streetAddress: customerAddress,
          governorate: selectedGovernorateKey,
          deliveryNotes,
          items: cart.map((item) => ({
            productId: item.productId,
            variantLabel: item.variantLabel,
            quantity: item.qty,
          })),
        }),
      });

      console.log("Order API status:", response.status, response.ok);
      const json = (await response.json().catch(() => ({}))) as {
        error?: string;
        whatsappUrl?: string;
      };
      console.log("Order API response:", json);

      if (!response.ok) {
        throw new Error(json.error || "Failed to create order.");
      }

      // Only open WhatsApp if the backend provides a URL
      if (json.whatsappUrl) {
        if (whatsappTab && !whatsappTab.closed) {
          whatsappTab.location.href = json.whatsappUrl;
        } else {
          window.location.assign(json.whatsappUrl);
        }
      } else if (whatsappTab && !whatsappTab.closed) {
        whatsappTab.close();
      }

      try {
        trackEvent("purchase", {
          value: cartSubtotal,
          currency: "EGP",
        });
      } catch (trackingError) {
        console.error("Purchase tracking failed", trackingError);
      }

      setCart([]);
      setCheckoutOpen(false);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setCustomerAddress("");
      setDeliveryNotes("");
      setSelectedGovernorateKey("");
    } catch (error) {
      if (whatsappTab && !whatsappTab.closed) {
        whatsappTab.close();
      }
      setCheckoutError(error instanceof Error ? error.message : "Failed to create order");
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <>
      <div className="background-layer" aria-hidden="true"></div>

      <header
        id="site-nav"
        className={`fixed left-0 right-0 top-0 z-40 transition-all duration-300 ${isNavSolid ? "nav-solid" : ""}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#home" className="logo-mark">
            Merume
          </a>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
            <a href="#home" className="nav-link">Home</a>
            <a href="#shop" className="nav-link">Shop</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>

          <button
            onClick={() => setCartOpen(true)}
            id="cart-toggle"
            type="button"
            className="cart-icon-btn"
            aria-label="Open shopping cart"
          >
            <span aria-hidden="true">Cart</span>
            <span id="cart-count" className="cart-badge">{cartCount}</span>
          </button>
        </div>
      </header>

      <main>
        <section id="home" className="hero-wrapper relative overflow-hidden">
          <div id="hero-slider" className="h-full w-full">
            {heroSlides.map((slide, index) => (
              <div key={slide.image} className={`hero-slide ${index === currentSlide ? "active" : ""}`}>
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  sizes="100vw"
                  priority={index === 0}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <p className="text-sm uppercase tracking-[0.22em] text-white/90"></p>
            <h1 className="mt-3 text-xl font-semibold leading-tight text-white sm:text-2xl">
              scent that adds a special touch to your day, capturing attention and leaving everyone curious about what makes you so unforgettable
            </h1>
            <button
              onClick={() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" })}
              id="shop-now"
              type="button"
              className="mt-6 rounded-full bg-luxuryGold px-6 py-3 font-semibold text-charcoal transition hover:brightness-110"
            >
              Shop Now
            </button>
          </div>
        </section>

        <section id="shop" className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-black/10 bg-white/80 p-5 shadow-xl backdrop-blur">
            <h2 className="mb-4 text-2xl font-semibold">Discover Collections</h2>
            <div id="category-filters" className="flex flex-wrap gap-3">
              {availableCategories.map((category) => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? "active" : ""}`}
                  data-category={category}
                  onClick={() => setSelectedCategory(category)}
                  type="button"
                >
                  {getCategoryLabel(category)}
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name, description, or category"
                className="w-full rounded-lg border border-black/20 bg-white px-4 py-3 text-sm outline-none focus:border-luxuryGold"
                aria-label="Search products"
              />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as "featured" | "priceAsc" | "priceDesc" | "nameAsc")}
                className="w-full rounded-lg border border-black/20 bg-white px-4 py-3 text-sm outline-none focus:border-luxuryGold"
                aria-label="Sort products"
              >
                <option value="featured">Sort: Featured</option>
                <option value="priceAsc">Sort: Price low to high</option>
                <option value="priceDesc">Sort: Price high to low</option>
                <option value="nameAsc">Sort: Name A-Z</option>
              </select>
            </div>
          </div>

          <div
            id="product-grid"
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full px-4 !overflow-x-hidden"
          >
            {productsLoading ? (
              <p className="w-full rounded-xl border border-black/10 bg-white p-6 text-center text-charcoal/60 sm:col-span-full">Loading products...</p>
            ) : null}
            {productsError ? (
              <p className="w-full rounded-xl border border-red-300 bg-red-50 p-6 text-center text-red-700 sm:col-span-full">{productsError}</p>
            ) : null}
            {!productsLoading && !productsError && !visibleProducts.length ? (
              <p className="w-full rounded-xl border border-black/10 bg-white p-6 text-center text-charcoal/60 sm:col-span-full">No products found in this category.</p>
            ) : null}

            {!productsLoading && !productsError
              ? displayedProducts.map((product) => {
                const defaultVariant = getDefaultVariant(product)?.label || "";
                const selectedVariant = cardVariants[product.id] || defaultVariant;
                const selectedVariantData = getVariantByLabel(product, selectedVariant);
                const isGiveaways = product.category === "Giveaways";

                return (
                  <article
                    key={product.id}
                    className="product-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => openProductView(product)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openProductView(product);
                      }
                    }}
                    aria-label={`Open details for ${product.name}`}
                  >
                    <div className="product-image-shell p-4">
                      {getPrimaryImage(product) ? (
                        <div className="relative h-56 w-full">
                          <Image
                            src={getPrimaryImage(product)}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-56 w-full rounded-lg bg-[#f2ece2]" aria-label="No image available" />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-charcoal/60">{getCategoryLabel(product.category)}</p>
                      <h3 className="mt-1 text-xl font-semibold">{product.name}</h3>
                      <p className="mt-2 font-semibold text-price text-luxuryGold">
                        {isGiveaways && selectedVariantData
                          ? formatPrice(selectedVariantData.price)
                          : getProductPriceLabel(product)}
                      </p>
                      {product.variants.length > 1 ? (
                        isGiveaways ? (
                          <div className="mt-3" onClick={(event) => event.stopPropagation()}>
                            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-charcoal/65">
                              Choose Package
                            </label>
                            <select
                              value={selectedVariant}
                              onChange={(event) =>
                                setCardVariants((previous) => ({
                                  ...previous,
                                  [product.id]: event.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-black/15 bg-gradient-to-b from-white to-[#f6efe2] px-3 py-2.5 text-sm font-medium text-charcoal shadow-sm outline-none transition focus:border-luxuryGold focus:ring-2 focus:ring-luxuryGold/30"
                              aria-label={`Choose giveaways package for ${product.name}`}
                            >
                              {product.variants.map((variant) => (
                                <option key={variant.label} value={variant.label}>
                                  {variant.label} - {formatPrice(variant.price)}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="mt-3 flex items-center gap-4" onClick={(event) => event.stopPropagation()}>
                            {product.variants.map((variant) => (
                              <label key={variant.label} className="inline-flex cursor-pointer items-center gap-2 text-sm text-charcoal/80">
                                <input
                                  type="radio"
                                  name={`variant-${product.id}`}
                                  value={variant.label}
                                  checked={selectedVariant === variant.label}
                                  onChange={(event) =>
                                    setCardVariants((previous) => ({
                                      ...previous,
                                      [product.id]: event.target.value,
                                    }))
                                  }
                                  className="accent-charcoal"
                                />
                                {variant.label}
                              </label>
                            ))}
                          </div>
                        )
                      ) : null}
                      <button
                        className="add-to-cart-btn mt-4 w-full"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          upsertCartItem(product.id, selectedVariant || defaultVariant);
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </article>
                );
              })
              : null}
          </div>
          {!productsLoading && !productsError && (canLoadMoreAll || canShowLessAll) ? (
            <div className="mt-6 flex justify-center">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {canShowLessAll ? (
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleAllCount((previous) =>
                        Math.max(INITIAL_ALL_PRODUCTS_COUNT, previous - ALL_PRODUCTS_STEP),
                      )
                    }
                    className="rounded-full border border-charcoal/25 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-charcoal transition hover:bg-charcoal hover:text-white"
                  >
                    Show less
                  </button>
                ) : null}
                {canLoadMoreAll ? (
                  <button
                    type="button"
                    onClick={() => setVisibleAllCount((previous) => previous + ALL_PRODUCTS_STEP)}
                    className="rounded-full border border-charcoal/25 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-charcoal transition hover:bg-charcoal hover:text-white"
                  >
                    See more
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>

        <section id="about" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-10 rounded-3xl border border-black/10 bg-white/80 p-6 shadow-xl backdrop-blur md:grid-cols-2 md:gap-14 md:p-10">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-charcoal/55">Fragrance Story</p>
              <h3 className="mt-3 text-4xl leading-tight text-charcoal sm:text-5xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                ABOUT US
              </h3>
              <p className="mt-5 text-base leading-relaxed text-charcoal/80 sm:text-lg">
                We are a proud Egyptian brand offering premium-quality perfumes comparable to international standards. Our collection includes men&#39;s and women&#39;s fragrances,
                home scents, perfume gift sets, and scented candles.
              </p>
              <p className="mt-6 text-3xl text-charcoal/80" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Merume Fragrances
              </p>
            </div>
            <div className="mx-auto w-full max-w-md">
              <div className="overflow-hidden rounded-t-[13rem] rounded-b-3xl border border-black/10 bg-cream p-3 shadow-lg">
                <Image src="/about2.jpeg" alt="About Merume fragrance" width={900} height={1200} className="h-[430px] w-full rounded-t-[12rem] rounded-b-2xl object-cover" />
              </div>
            </div>
          </div>
        </section>

        <section id="why-merume" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <div className="grid items-center gap-10 rounded-3xl border border-black/10 bg-white/80 p-6 shadow-xl backdrop-blur md:grid-cols-2 md:gap-14 md:p-10">
            <div className="order-2 md:order-1">
              <div className="overflow-hidden rounded-3xl border border-black/10 bg-cream p-3 shadow-lg">
                <Image src="/why.jpeg" alt="Why choose Merume" width={900} height={1200} className="h-[430px] w-full rounded-2xl object-cover" />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <p className="text-xs uppercase tracking-[0.3em] text-charcoal/55">Signature Difference</p>
              <h3 className="mt-3 text-4xl leading-tight text-charcoal sm:text-5xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Why Choose Merume?</h3>
              <p className="mt-6 text-base leading-relaxed text-charcoal/80 sm:text-lg">
                Because our fragrances turn moments into unforgettable memories. Crafted with elegance and passion, each scent adds a unique signature to your style and makes every moment special.
              </p>
              <p className="mt-6 text-3xl text-charcoal/80" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Merume Fragrances</p>
              <p className="mt-3 text-sm uppercase tracking-[0.2em] text-charcoal/60">Elegant • Memorable • Unique</p>
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mb-10 rounded-2xl border border-black/10 bg-white/75 p-6 shadow-lg backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-charcoal/55">Most Ordered</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {featuredProducts.map((product) => (
                <article key={`featured-${product.id}`} className="rounded-xl border border-black/10 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-charcoal/55">{getCategoryLabel(product.category)}</p>
                  <h4 className="mt-1 text-lg font-semibold">{product.name}</h4>
                  <p className="mt-2 text-sm text-price">From {formatPrice(getLowestPrice(product))}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mb-10 rounded-2xl border border-black/10 bg-white/75 p-6 shadow-lg backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-charcoal/55">Customer Reviews</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {featuredTestimonials.map((review) => (
                <article key={review.name} className="rounded-xl border border-black/10 bg-white p-4">
                  <p className="text-sm leading-relaxed text-charcoal/80">&ldquo;{review.text}&rdquo;</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-charcoal/60">{review.name}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white/70 p-6">
            <h3 className="text-2xl font-semibold">Contact</h3>
            <p className="mt-3 text-charcoal/80">Order support is available on WhatsApp for quick confirmations and delivery coordination.</p>
          </div>
        </section>
      </main>

      <aside id="cart-drawer" className={`fixed inset-0 z-[60] p-4 sm:p-8 ${cartOpen ? "" : "hidden"}`} aria-label="Shopping cart">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-cream shadow-2xl">
          <div className="flex items-center justify-between border-b border-black/10 bg-charcoal px-4 py-4 text-white sm:px-6">
            <p className="text-xs uppercase tracking-[0.25em] text-white/75">Merume</p>
            <h3 className="text-xl font-semibold sm:text-2xl">Shopping Cart</h3>
            <button id="close-cart" type="button" onClick={() => setCartOpen(false)} className="rounded-full border border-white/35 px-3 py-1 text-sm transition hover:bg-white hover:text-charcoal">Close</button>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-4 sm:p-6 lg:grid-cols-[1.7fr_0.9fr]">
            <section>
              <div id="cart-items">
                {!cart.length ? <p className="empty-cart">Your cart is empty.</p> : null}
                {cart.map((cartItem) => {
                  const product = productMap.get(cartItem.productId);
                  if (!product) {
                    return null;
                  }

                  const variant = getVariantByLabel(product, cartItem.variantLabel);
                  const cartKey = getCartItemKey(cartItem);

                  return (
                    <article key={cartKey} className="cart-item">
                      {getPrimaryImage(product) ? (
                        <Image className="cart-item-image" src={getPrimaryImage(product)} alt={product.name} width={112} height={112} />
                      ) : (
                        <div className="cart-item-image rounded-lg bg-[#f2ece2]" aria-label="No image available" />
                      )}
                      <div className="flex-1 pr-2">
                        <h4 className="text-lg font-semibold leading-tight">
                          {product.name}
                          {variant?.label ? ` ${variant.label}` : ""}
                        </h4>
                        <p className="text-xs uppercase tracking-[0.12em] text-charcoal/55">{formatPrice(variant?.price || 0)} each</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button type="button" onClick={() => decreaseCartItem(cartKey)} className="rounded border border-black/20 px-2 py-1 text-sm" aria-label="Decrease quantity">-</button>
                          <span className="min-w-6 text-center text-sm font-semibold">{cartItem.qty}</span>
                          <button type="button" onClick={() => increaseCartItem(cartKey)} className="rounded border border-black/20 px-2 py-1 text-sm" aria-label="Increase quantity">+</button>
                          <button type="button" onClick={() => deleteCartItem(cartKey)} className="ml-2 rounded border border-black/20 p-2 text-sm text-red-600" aria-label="Delete item">Delete</button>
                        </div>
                      </div>
                      <p className="whitespace-nowrap text-sm font-semibold">{formatPrice((variant?.price || 0) * cartItem.qty)}</p>
                    </article>
                  );
                })}
              </div>
              <button id="continue-shopping" type="button" onClick={() => setCartOpen(false)} className="mt-4 rounded-lg border border-black/30 px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] transition hover:bg-charcoal hover:text-white">Continue Shopping</button>
            </section>

            <aside className="self-start rounded-xl border border-black/15 bg-white/85 p-5">
              <h4 className="text-xl font-semibold">Order Summary</h4>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between text-charcoal/70"><span>Subtotal</span><span id="cart-subtotal">{formatPrice(cartSubtotal)}</span></div>
                <div className="flex items-center justify-between text-charcoal/70"><span>Shipping</span><span id="cart-shipping">Calculated at checkout</span></div>
                <div className="h-px bg-black/20"></div>
                <div className="flex items-center justify-between text-base font-semibold"><span>Total</span><span id="cart-total">{formatPrice(cartSubtotal)}</span></div>
              </div>
              <button
                id="checkout-btn"
                type="button"
                disabled={!cart.length}
                onClick={() => {
                  if (!cart.length) {
                    return;
                  }
                  setCartOpen(false);
                  setCheckoutOpen(true);
                }}
                className="mt-5 w-full rounded-lg bg-luxuryGold px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-charcoal transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Proceed to Checkout
              </button>
            </aside>
          </div>
        </div>
      </aside>

      <div id="drawer-backdrop" className={`fixed inset-0 z-50 bg-black/40 ${hasOpenOverlay ? "" : "hidden"}`} onClick={closeAllOverlays}></div>

      <div id="checkout-modal" className={`fixed inset-0 z-[70] p-4 sm:p-8 ${checkoutOpen ? "" : "hidden"}`}>
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-cream shadow-2xl">
          <div className="flex items-center justify-between border-b border-black/10 bg-charcoal px-4 py-4 text-white sm:px-6">
            <h3 className="text-2xl font-semibold">Checkout</h3>
            <button id="close-checkout" type="button" onClick={() => setCheckoutOpen(false)} className="rounded-full border border-white/35 px-3 py-1 text-sm transition hover:bg-white hover:text-charcoal">Close</button>
          </div>

          <div className="flex items-center justify-center gap-4 border-b border-black/10 px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.15em] sm:gap-8 sm:text-xs">
            <span className="rounded-full bg-luxuryGold px-3 py-1 text-charcoal">1 Shipping</span>
            <span className="text-charcoal/45">2 Payment</span>
            <span className="text-charcoal/45">3 Review</span>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-4 sm:p-6 lg:grid-cols-[1.7fr_0.9fr]">
            <form id="checkout-form" onSubmit={submitCheckoutOrder} className="space-y-4 rounded-xl border border-black/10 bg-white/85 p-4 sm:p-5">
              <h4 className="text-xl font-semibold">Shipping Information</h4>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/70">Full Name</span>
                  <input id="customer-name" type="text" required value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="w-full rounded-lg border border-black/20 bg-white px-4 py-3 outline-none focus:border-luxuryGold" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/70">Email</span>
                  <input type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} className="w-full rounded-lg border border-black/20 bg-white px-4 py-3 outline-none focus:border-luxuryGold" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/70">Phone</span>
                  <input id="customer-phone" type="tel" required value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} className="w-full rounded-lg border border-black/20 bg-white px-4 py-3 outline-none focus:border-luxuryGold" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/70">Zip Code</span>
                  <input type="text" className="w-full rounded-lg border border-black/20 bg-white px-4 py-3 outline-none focus:border-luxuryGold" />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/70">Street Address</span>
                <textarea id="customer-address" required rows={2} value={customerAddress} onChange={(event) => setCustomerAddress(event.target.value)} className="w-full rounded-lg border border-black/20 bg-white px-4 py-3 outline-none focus:border-luxuryGold"></textarea>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/70">Delivery Notes (optional)</span>
                <textarea rows={2} value={deliveryNotes} onChange={(event) => setDeliveryNotes(event.target.value)} placeholder="Gate number, nearby landmark, preferred delivery time..." className="w-full rounded-lg border border-black/20 bg-white px-4 py-3 outline-none focus:border-luxuryGold"></textarea>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/70">City</span>
                  <input type="text" className="w-full rounded-lg border border-black/20 bg-white px-4 py-3 outline-none focus:border-luxuryGold" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/70">Governorate</span>
                  <select id="governorate" name="governorate" required value={selectedGovernorateKey} onChange={(event) => setSelectedGovernorateKey(event.target.value)} className="w-full rounded-lg border border-black/20 bg-white px-4 py-3 outline-none focus:border-luxuryGold">
                    <option value="">Select Governorate</option>
                    {governorates.map((governorate) => (
                      <option key={governorate.value} value={governorate.value}>{governorate.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              {checkoutError ? <p className="text-sm font-semibold text-red-600">{checkoutError}</p> : null}

              <button type="submit" disabled={submittingOrder} className="w-full rounded-lg bg-luxuryGold px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-charcoal transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
                {submittingOrder ? "Creating Order..." : "Confirm Order via WhatsApp"}
              </button>
            </form>

            <aside className="self-start rounded-xl border border-black/15 bg-white/85 p-5">
              <h4 className="text-xl font-semibold">Order Summary</h4>
              <div id="checkout-summary-items" className="mt-4 space-y-2 text-sm text-charcoal/75">
                {!cart.length ? <p className="text-charcoal/55">Your cart is empty.</p> : null}
                {cart.map((cartItem) => {
                  const product = productMap.get(cartItem.productId);
                  if (!product) {
                    return null;
                  }

                  const variant = getVariantByLabel(product, cartItem.variantLabel);
                  return (
                    <div key={`checkout-${getCartItemKey(cartItem)}`} className="flex items-center justify-between gap-3">
                      <span>{product.name}{variant?.label ? ` ${variant.label}` : ""} x{cartItem.qty}</span>
                      <span className="font-semibold">{formatPrice((variant?.price || 0) * cartItem.qty)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between text-charcoal/70"><span>Subtotal</span><span id="checkout-subtotal">{formatPrice(cartSubtotal)}</span></div>
                <div className="flex items-center justify-between text-charcoal/70"><span>Shipping</span><span id="checkout-shipping">Calculated at order creation</span></div>
                <div className="h-px bg-black/20"></div>
                <div className="flex items-center justify-between text-base font-semibold"><span>Total</span><span id="checkout-total">{formatPrice(cartSubtotal)}</span></div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <div id="product-view" className={`fixed inset-0 z-[80] p-4 sm:p-8 ${productViewOpen ? "" : "hidden"}`} role="dialog" aria-modal="true" aria-labelledby="view-name">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-cream shadow-2xl">
          <div className="flex items-center justify-between border-b border-black/10 bg-charcoal p-4 text-white sm:p-6">
            <button id="back-to-shop" type="button" onClick={() => { setProductViewOpen(false); setSelectedProduct(null); }} className="rounded-full border border-white/35 px-4 py-2 text-sm font-medium transition hover:bg-white hover:text-charcoal">Back</button>
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Product Details</p>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-4 sm:grid-cols-[1.1fr_1fr] sm:p-6">
            <div>
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                {selectedViewImage ? (
                  <div className="relative h-[330px] w-full overflow-hidden rounded-xl bg-[#faf7f2]">
                    <Image
                      id="view-image"
                      src={selectedViewImage}
                      alt={selectedProduct?.name || "Selected product"}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-[330px] w-full rounded-xl bg-[#faf7f2]" aria-label="No image available" />
                )}
              </div>
              <div id="view-thumbnails" className="mt-3 flex gap-2">
                {selectedProductGallery.map((image) => (
                  <button key={image} type="button" className={`view-thumb ${selectedViewImage === image ? "active" : ""}`} onClick={() => setSelectedViewImage(image)} aria-label="View product image">
                    <Image src={image} alt="Product thumbnail" width={56} height={56} className="h-14 w-14 rounded-md object-contain" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col rounded-2xl border border-black/10 bg-white/90 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-charcoal/55">Parfums de Merume</p>
              <h3 id="view-name" className="text-3xl font-semibold leading-tight">{selectedProduct?.name || ""}</h3>
              <p id="view-price" className="mt-2 text-2xl font-semibold text-price text-luxuryGold">{formatPrice(selectedProductPrice)}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-charcoal/60">Volume</p>
                  <div id="view-size-options" className="flex flex-wrap items-center gap-2">
                    {(selectedProduct?.variants || []).map((variant) => (
                      <label key={variant.label} className={`volume-chip ${selectedViewVariant === variant.label ? "active" : ""}`}>
                        <input type="radio" name="view-size" value={variant.label} checked={selectedViewVariant === variant.label} onChange={(event) => setSelectedViewVariant(event.target.value)} className="sr-only" />
                        <span>{variant.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-charcoal/60">Quantity</p>
                  <div className="view-qty-control">
                    <button id="view-qty-minus" type="button" onClick={() => setSelectedViewQuantity((previous) => Math.max(1, previous - 1))} className="view-qty-btn" aria-label="Decrease quantity">-</button>
                    <span id="view-qty-value" className="view-qty-value">{selectedViewQuantity}</span>
                    <button id="view-qty-plus" type="button" onClick={() => setSelectedViewQuantity((previous) => Math.min(20, previous + 1))} className="view-qty-btn" aria-label="Increase quantity">+</button>
                  </div>
                </div>
              </div>
              <p id="view-description" className="mt-4 leading-relaxed text-charcoal/85">{selectedProduct?.description || ""}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button id="view-add-to-cart" type="button" onClick={addSelectedProductFromView} className="rounded-lg bg-luxuryGold px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-charcoal transition hover:brightness-110">Add to Cart</button>
                <button id="whatsapp-order" type="button" onClick={orderSelectedProductViaWhatsApp} className="rounded-lg border border-charcoal/30 bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-charcoal transition hover:bg-charcoal hover:text-white">Order via WhatsApp</button>
              </div>
              <p id="view-add-feedback" className={`mt-2 text-sm font-semibold text-luxuryGold ${addFeedback ? "" : "hidden"}`}>{addFeedback || "Added!"}</p>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
