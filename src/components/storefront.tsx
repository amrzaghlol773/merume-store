"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  images: Array<{ url: string; alt: string; isPrimary: boolean }>;
  variants: Array<{ label: string; price: number; isDefault: boolean }>;
  reviewSummary: { averageRating: number; totalReviews: number };
  reviews: Array<{
    id: number;
    rating: number;
    comment: string;
    customerName: string;
    createdAt: string;
    images: string[];
  }>;
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

type StorefrontProps = {
  theme?: "dark" | "light";
  onToggleThemeAction?: () => void;
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

function formatRatingStars(rating: number) {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(safeRating) || "-";
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

export default function Storefront({ theme = "dark", onToggleThemeAction }: StorefrontProps) {
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

  const [reviewOrderId, setReviewOrderId] = useState("");
  const [reviewPhone, setReviewPhone] = useState("");
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState("");

  const hasOpenOverlay = cartOpen || checkoutOpen || productViewOpen;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("merume_cart_v1");
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as CartItem[];
      if (!Array.isArray(parsed)) {
        return;
      }

      const safeItems = parsed
        .map((item) => ({
          productId: Number(item.productId) || 0,
          variantLabel: String(item.variantLabel || ""),
          qty: Math.max(1, Number(item.qty) || 1),
        }))
        .filter((item) => item.productId > 0);

      if (safeItems.length) {
        setCart(safeItems);
      }
    } catch {
      // Ignore malformed cart payloads.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("merume_cart_v1", JSON.stringify(cart));
    } catch {
      // Ignore storage persistence errors.
    }
  }, [cart]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("openCart") === "1") {
      setCartOpen(true);
    }
  }, []);

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
    if (!reviewFeedback) {
      return;
    }

    const timer = window.setTimeout(() => setReviewFeedback(""), 2400);
    return () => window.clearTimeout(timer);
  }, [reviewFeedback]);

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
  const spotlightProduct = useMemo(() => visibleProducts[0] || featuredProducts[0] || null, [visibleProducts, featuredProducts]);
  const spotlightVariantLabel = spotlightProduct
    ? (cardVariants[spotlightProduct.id] || getDefaultVariant(spotlightProduct)?.label || "")
    : "";
  const spotlightPrice = spotlightProduct
    ? (getVariantByLabel(spotlightProduct, spotlightVariantLabel)?.price || getLowestPrice(spotlightProduct))
    : 0;

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
    setReviewOrderId("");
    setReviewPhone("");
    setReviewName("");
    setReviewRating(5);
    setReviewComment("");
    setReviewImages([]);
    setReviewFeedback("");
    setProductViewOpen(true);
    trackEvent("view_item", {
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      value: getLowestPrice(product),
    });
  };

  const closeProductView = () => {
    setProductViewOpen(false);
    setSelectedProduct(null);
    setSelectedViewVariant("");
    setSelectedViewQuantity(1);
    setReviewOrderId("");
    setReviewPhone("");
    setReviewName("");
    setReviewRating(5);
    setReviewComment("");
    setReviewImages([]);
    setReviewFeedback("");
  };

  const closeAllOverlays = () => {
    setCartOpen(false);
    setCheckoutOpen(false);
    closeProductView();
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

    const message = `Hello Merume, I want to order ${selectedProduct.name}${variantLabel} x${selectedViewQuantity}. Unit price: ${unitPrice} EGP, Total: ${unitPrice * selectedViewQuantity} EGP.`;
    window.open(`https://wa.me/201098208357?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  };

  const orderCartViaWhatsApp = () => {
    if (!cart.length) {
      return;
    }

    const lines = cart
      .map((cartItem, index) => {
        const product = productMap.get(cartItem.productId);
        if (!product) {
          return `${index + 1}) Product unavailable x${cartItem.qty}`;
        }

        const variant = getVariantByLabel(product, cartItem.variantLabel);
        const variantText = variant?.label ? ` (${variant.label})` : "";
        const lineTotal = (variant?.price || 0) * cartItem.qty;
        return `${index + 1}) ${product.name}${variantText} x${cartItem.qty} - ${lineTotal.toLocaleString("en-EG")} EGP`;
      })
      .join("%0A");

    const message = `Hello Merume, I want to place a quick WhatsApp order:%0A%0A${lines}%0A%0ASubtotal: ${cartSubtotal.toLocaleString("en-EG")} EGP`;
    trackEvent("begin_checkout", {
      value: cartSubtotal,
      items_count: cart.length,
      checkout_mode: "whatsapp_quick",
    });
    window.open(`https://wa.me/201098208357?text=${message}`, "_blank", "noopener");
  };

  const submitProductReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedProduct) {
      return;
    }

    if (!reviewName.trim() || !reviewOrderId.trim() || !reviewPhone.trim() || !reviewComment.trim()) {
      setReviewFeedback("Please fill all required review fields.");
      return;
    }

    setReviewSubmitting(true);
    setReviewFeedback("");

    try {
      const uploadedImageUrls: string[] = [];

      for (const image of reviewImages.slice(0, 3)) {
        const formData = new FormData();
        formData.set("image", image);

        const uploadResponse = await fetch("/api/reviews/upload", {
          method: "POST",
          body: formData,
        });

        const uploadJson = (await uploadResponse.json()) as { url?: string; error?: string };
        if (!uploadResponse.ok || !uploadJson.url) {
          throw new Error(uploadJson.error || "Failed to upload one of the review images");
        }

        uploadedImageUrls.push(uploadJson.url);
      }

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          orderId: Number(reviewOrderId),
          customerName: reviewName,
          phone: reviewPhone,
          rating: reviewRating,
          comment: reviewComment,
          imageUrls: uploadedImageUrls,
        }),
      });

      const json = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        throw new Error(json.error || "Failed to submit review");
      }

      setReviewFeedback(json.message || "Review submitted for approval.");
      setReviewOrderId("");
      setReviewPhone("");
      setReviewName("");
      setReviewRating(5);
      setReviewComment("");
      setReviewImages([]);
    } catch (error) {
      setReviewFeedback(error instanceof Error ? error.message : "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
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

      const json = (await response.json()) as { whatsappUrl?: string; error?: string };
      if (!response.ok || !json.whatsappUrl) {
        throw new Error(json.error || "Failed to create order");
      }

      window.open(json.whatsappUrl, "_blank", "noopener");
      trackEvent("purchase", {
        value: cartSubtotal,
        currency: "EGP",
      });
      setCart([]);
      setCheckoutOpen(false);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setCustomerAddress("");
      setDeliveryNotes("");
      setSelectedGovernorateKey("");
    } catch (error) {
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
          <a href="#home" className="logo-mark flex flex-col items-start leading-none" style={{ textDecoration: "none" }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: "2.1rem",
              letterSpacing: "0.08em",
              color: "#fff",
              lineHeight: 1.1
            }}>MÉRÛME</span>
            <span style={{
              fontFamily: "'Dancing Script', cursive",
              fontWeight: 500,
              fontSize: "1.05rem",
              color: "#fff",
              marginTop: "-0.2em",
              marginLeft: "0.1em"
            }}>Unique Fragrances</span>
          </a>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
            <a href="/collections" className="nav-link">Collections</a>
            <a href="#spotlight" className="nav-link">Best Sellers</a>
            <a href="#about" className="nav-link">Our Story</a>
            <a href="#contact" className="nav-link">Support</a>
            <a href="/cart" className="nav-link">Cart</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleThemeAction}
              type="button"
              className="theme-toggle-btn"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>

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
              Merume scent that adds a special touch to your day, capturing attention and leaving everyone curious about what makes you so unforgettable
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/85 sm:text-base"></p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" })}
                id="shop-now"
                type="button"
                className="rounded-full bg-luxuryGold px-6 py-3 font-semibold text-charcoal transition hover:brightness-110"
              >
                Shop Now
              </button>
            </div>
          </div>
        </section>

        <section id="shop" className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-black/10 bg-white/80 p-5 shadow-xl backdrop-blur">
            <h2 className="mb-1 text-3xl font-semibold">Refined Selection</h2>
            <p className="mb-4 text-sm text-charcoal/70">Discover your next signature fragrance</p>
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
            className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-4"
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
                const isLimited = product.id % 3 === 0;

                return (
                  <article
                    key={product.id}
                    className="product-card min-w-[84%] snap-start sm:min-w-0"
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
                    <div className="product-image-shell relative p-4">
                      {isLimited ? <span className="limited-chip">Limited</span> : null}
                      <button
                        type="button"
                        aria-label={`Save ${product.name}`}
                        className="wishlist-btn"
                        onClick={(event) => event.stopPropagation()}
                      >
                        ❤
                      </button>
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
                        <div className="h-56 w-full rounded-lg bg-white" aria-label="No image available" />
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
                      <p className="mt-2 text-xs text-charcoal/70">
                        {product.reviewSummary.totalReviews
                          ? `${formatRatingStars(product.reviewSummary.averageRating)} ${product.reviewSummary.averageRating.toFixed(1)} (${product.reviewSummary.totalReviews})`
                          : "No reviews yet"}
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
                        className="mt-4 w-full rounded-lg bg-luxuryGold px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-charcoal transition hover:brightness-110"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          upsertCartItem(product.id, selectedVariant || defaultVariant);
                        }}
                      >
                        Add to Cart
                      </button>
                      <Link
                        href={`/products/${product.slug}`}
                        className="mt-2 block rounded-lg border border-black/20 px-4 py-2 text-center text-sm font-semibold uppercase tracking-[0.1em] transition hover:bg-charcoal hover:text-white"
                        onClick={(event) => event.stopPropagation()}
                      >
                        Open Product Page
                      </Link>
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

        <section id="spotlight" className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="grid gap-8 rounded-3xl border border-black/10 bg-white/75 p-5 shadow-xl backdrop-blur md:grid-cols-[1fr_1.1fr] md:p-8">
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-[#f1ead9] p-3">
              {spotlightProduct && getPrimaryImage(spotlightProduct) ? (
                <div className="relative h-[320px] w-full overflow-hidden rounded-xl sm:h-[420px]">
                  <Image
                    src={getPrimaryImage(spotlightProduct)}
                    alt={spotlightProduct.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-[320px] w-full rounded-xl bg-[#e8dcc3] sm:h-[420px]" />
              )}
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-xs uppercase tracking-[0.2em] text-charcoal/55">The Noir Collection</p>
              <h3 className="mt-2 text-4xl font-semibold leading-tight sm:text-5xl">
                {spotlightProduct?.name || "Oud Royale Eau de Parfum"}
              </h3>
              <p className="mt-4 text-sm text-charcoal/75">
                {spotlightProduct?.reviewSummary?.totalReviews
                  ? `${formatRatingStars(spotlightProduct.reviewSummary.averageRating)} ${spotlightProduct.reviewSummary.averageRating.toFixed(1)} (${spotlightProduct.reviewSummary.totalReviews} reviews)`
                  : "No reviews yet"}
              </p>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-charcoal/80">
                {spotlightProduct?.description || "A rare, exotic, and distinctive fragrance with warm woods, rich spices, and a soft oriental glow."}
              </p>

              {spotlightProduct?.variants?.length ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {spotlightProduct.variants.map((variant) => (
                    <button
                      key={`spotlight-${variant.label}`}
                      type="button"
                      onClick={() => setCardVariants((previous) => ({ ...previous, [spotlightProduct.id]: variant.label }))}
                      className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${spotlightVariantLabel === variant.label
                          ? "border-charcoal bg-charcoal text-white"
                          : "border-black/20 bg-white text-charcoal hover:border-charcoal"
                        }`}
                    >
                      {variant.label}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <p className="text-4xl font-semibold text-price">{formatPrice(spotlightPrice)}</p>
                <button
                  type="button"
                  onClick={() => spotlightProduct && upsertCartItem(spotlightProduct.id, spotlightVariantLabel || getDefaultVariant(spotlightProduct)?.label || "")}
                  className="rounded-lg bg-luxuryGold px-7 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-charcoal transition hover:brightness-110"
                >
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={() => spotlightProduct && openProductView(spotlightProduct)}
                  className="rounded-lg border border-black/25 px-7 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition hover:bg-charcoal hover:text-white"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
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
            <div className="mt-5 rounded-2xl border border-black/10 bg-white p-5">
              <h4 className="text-2xl font-semibold">Customer Reviews & Ratings</h4>
              <div className="mt-4 grid gap-6 sm:grid-cols-[220px_1fr]">
                <div className="rounded-xl border border-black/10 bg-[#f6f2e6] p-5 text-center">
                  <p className="text-5xl font-semibold text-charcoal">4.8</p>
                  <p className="mt-1 text-luxuryGold">★★★★★</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.12em] text-charcoal/60">Based on 1,240 reviews</p>
                </div>
                <div className="space-y-3">
                  {[82, 12, 4, 1, 1].map((value, index) => (
                    <div key={`rating-${5 - index}`} className="flex items-center gap-3 text-sm">
                      <span className="w-4 text-charcoal/70">{5 - index}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/10">
                        <div className="h-full rounded-full bg-luxuryGold" style={{ width: `${value}%` }} />
                      </div>
                      <span className="w-10 text-right text-charcoal/70">{value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="luxe-newsletter rounded-3xl border border-black/10 p-7 text-center sm:p-10">
            <p className="text-sm uppercase tracking-[0.2em] text-luxuryGold">Private Access</p>
            <h3 className="mt-3 text-4xl font-semibold">Join the Inner Circle</h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-charcoal/75 sm:text-base">
              Receive exclusive invitations to private launches, early access to limited editions, and master perfumer insights.
            </p>
            <form className="mx-auto mt-5 flex max-w-xl flex-col gap-3 sm:flex-row" onSubmit={(event) => event.preventDefault()}>
              <input
                type="email"
                placeholder="Email address"
                aria-label="Email address"
                className="h-12 flex-1 rounded-lg border border-black/20 px-4"
              />
              <button type="submit" className="h-12 rounded-lg bg-luxuryGold px-6 text-sm font-semibold uppercase tracking-[0.12em] text-charcoal">
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="mx-auto mb-20 grid w-full max-w-7xl gap-8 border-t border-black/10 px-4 pt-10 sm:grid-cols-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-lg font-semibold tracking-[0.08em] text-luxuryGold">LUXE AURA</p>
          <p className="mt-3 text-sm leading-6 text-charcoal/70">
            Crafting memories through scent since 1994. Every bottle is a journey through time and emotion.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-charcoal/65">Navigation</p>
          <p className="mt-3 text-sm text-charcoal/70">Shop All</p>
          <p className="mt-2 text-sm text-charcoal/70">Gift Sets</p>
          <p className="mt-2 text-sm text-charcoal/70">Samples</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-charcoal/65">Support</p>
          <p className="mt-3 text-sm text-charcoal/70">Shipping & Returns</p>
          <p className="mt-2 text-sm text-charcoal/70">Track Order</p>
          <p className="mt-2 text-sm text-charcoal/70">Contact Us</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-charcoal/65">Follow Us</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <a href="https://www.instagram.com/merume_fragrances?igsh=MWgyM2lvYTNiaG00NA==" target="_blank" rel="noopener" className="flex items-center gap-2 rounded-md border border-black/20 px-3 py-2 hover:bg-luxuryGold hover:text-charcoal transition">
              <img src="/instagram.svg" alt="Instagram" className="h-5 w-5" />
              @merume_fragrances
            </a>
            <a href="https://www.instagram.com/scaleup_egy?igsh=MWkza2RvNG1ucGphMg==" target="_blank" rel="noopener" className="flex items-center gap-2 rounded-md border border-black/20 px-3 py-2 hover:bg-luxuryGold hover:text-charcoal transition">
              <img src="/instagram.svg" alt="Instagram" className="h-5 w-5" />
              @scaleup_egy
            </a>
          </div>
          <div className="mt-6 text-xs text-charcoal/60">
            <p>By scaleup agency</p>
            <p>Mohamed Hamada</p>
            <p>Amr Ahmed</p>
          </div>
        </div>
      </footer>

      <aside id="cart-drawer" className={`fixed inset-0 z-[60] p-4 sm:p-8 ${cartOpen ? "" : "hidden"}`} aria-label="Shopping cart">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-cream shadow-2xl">
          <div className="flex items-center justify-between border-b border-black/10 bg-charcoal px-4 py-4 text-white sm:px-6">
            <p className="text-xs uppercase tracking-[0.25em] text-white/75">Merume</p>
            <h3 className="text-xl font-semibold sm:text-2xl">Shopping Cart</h3>
            <button id="close-cart" type="button" onClick={() => setCartOpen(false)} className="rounded-full border border-white/35 px-3 py-1 text-sm text-luxuryGold transition hover:bg-white hover:text-charcoal">Close</button>
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
              <button
                id="quick-whatsapp-btn"
                type="button"
                disabled={!cart.length}
                onClick={orderCartViaWhatsApp}
                className="quick-whatsapp-btn mt-3 w-full rounded-lg border border-black/25 px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-charcoal transition hover:bg-charcoal hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Quick Order via WhatsApp
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
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-black/10 bg-charcoal p-4 text-white sm:p-6">
            <button id="back-to-shop" type="button" onClick={closeProductView} className="rounded-full border border-white/35 px-4 py-2 text-sm font-medium text-luxuryGold transition hover:bg-white hover:text-charcoal">Back</button>
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Product Details</p>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-4 sm:grid-cols-[1.1fr_1fr] sm:p-6">
            <div>
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                {selectedViewImage ? (
                  <div className="relative h-[330px] w-full overflow-hidden rounded-xl bg-white">
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
                  <div className="h-[330px] w-full rounded-xl bg-white" aria-label="No image available" />
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

            <div className="flex flex-col rounded-2xl border border-black/10 bg-white p-5">
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

              <div className="mt-6 border-t border-black/10 pt-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-charcoal/70">Customer Reviews</p>
                  <p className="text-xs text-charcoal/60">
                    {selectedProduct?.reviewSummary.totalReviews
                      ? `${selectedProduct.reviewSummary.averageRating.toFixed(1)} / 5 (${selectedProduct.reviewSummary.totalReviews})`
                      : "No reviews yet"}
                  </p>
                </div>

                <div className="mt-3 max-h-44 space-y-3 overflow-y-auto pr-1">
                  {!selectedProduct?.reviews.length ? (
                    <p className="text-sm text-charcoal/60">Be the first verified customer to share feedback.</p>
                  ) : null}
                  {(selectedProduct?.reviews || []).map((review) => (
                    <article key={review.id} className="rounded-lg border border-black/10 bg-white p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{review.customerName}</p>
                        <p className="text-xs text-luxuryGold">{formatRatingStars(review.rating)} ({review.rating}/5)</p>
                      </div>
                      <p className="mt-1 text-xs text-charcoal/55">{new Date(review.createdAt).toLocaleDateString("en-EG")}</p>
                      <p className="mt-2 text-sm leading-relaxed text-charcoal/80">{review.comment}</p>
                      {review.images.length ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {review.images.map((url) => (
                            <a key={`${review.id}-${url}`} href={url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-md border border-black/10 bg-[#f9f5eb]">
                              <Image src={url} alt="Customer review upload" width={56} height={56} className="h-12 w-12 object-cover" />
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </div>

              <form onSubmit={submitProductReview} className="mt-5 rounded-xl border border-black/10 bg-white p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-charcoal/70">Add Your Review (Verified Order)</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={(event) => setReviewName(event.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm outline-none focus:border-luxuryGold"
                  />
                  <input
                    type="tel"
                    required
                    value={reviewPhone}
                    onChange={(event) => setReviewPhone(event.target.value)}
                    placeholder="Phone used in order"
                    className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm outline-none focus:border-luxuryGold"
                  />
                  <input
                    type="number"
                    min={1}
                    required
                    value={reviewOrderId}
                    onChange={(event) => setReviewOrderId(event.target.value)}
                    placeholder="Order ID"
                    className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm outline-none focus:border-luxuryGold"
                  />
                  <select
                    value={reviewRating}
                    onChange={(event) => setReviewRating(Number(event.target.value))}
                    className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm outline-none focus:border-luxuryGold"
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>
                        {value} Star{value > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  placeholder="How was longevity, projection, and packaging?"
                  className="mt-3 w-full rounded-lg border border-black/20 px-3 py-2 text-sm outline-none focus:border-luxuryGold"
                ></textarea>
                <label className="mt-3 block text-xs font-semibold uppercase tracking-[0.1em] text-charcoal/60">
                  Upload photos (up to 3)
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    onChange={(event) => {
                      const files = Array.from(event.target.files || []).slice(0, 3);
                      setReviewImages(files);
                    }}
                    className="mt-2 block w-full text-xs"
                  />
                </label>
                {reviewImages.length ? <p className="mt-1 text-xs text-charcoal/60">{reviewImages.length} image(s) selected.</p> : null}
                {reviewFeedback ? <p className="mt-2 text-sm font-semibold text-luxuryGold">{reviewFeedback}</p> : null}
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="mt-3 rounded-lg bg-charcoal px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
