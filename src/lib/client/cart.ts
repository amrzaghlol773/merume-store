export type CartItem = {
  productId: number;
  variantLabel: string;
  qty: number;
};

export const CART_STORAGE_KEY = "merume_cart_v1";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => ({
        productId: Number(item.productId) || 0,
        variantLabel: String(item.variantLabel || ""),
        qty: Math.max(1, Number(item.qty) || 1),
      }))
      .filter((item) => item.productId > 0);
  } catch {
    return [];
  }
}

export function writeCart(cart: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Ignore storage errors.
  }
}

export function addToCart(item: CartItem) {
  const cart = readCart();
  const index = cart.findIndex(
    (entry) => entry.productId === item.productId && entry.variantLabel === item.variantLabel,
  );

  if (index === -1) {
    cart.push({ ...item, qty: Math.max(1, item.qty || 1) });
  } else {
    cart[index] = {
      ...cart[index],
      qty: cart[index].qty + Math.max(1, item.qty || 1),
    };
  }

  writeCart(cart);
  return cart;
}

export function updateCartItemQty(productId: number, variantLabel: string, qty: number) {
  const cart = readCart()
    .map((item) => {
      if (item.productId === productId && item.variantLabel === variantLabel) {
        return { ...item, qty: Math.max(0, qty) };
      }
      return item;
    })
    .filter((item) => item.qty > 0);

  writeCart(cart);
  return cart;
}

export function removeCartItem(productId: number, variantLabel: string) {
  const cart = readCart().filter(
    (item) => !(item.productId === productId && item.variantLabel === variantLabel),
  );
  writeCart(cart);
  return cart;
}

export function clearCart() {
  writeCart([]);
}
