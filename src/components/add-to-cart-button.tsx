"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore, type CartItem } from "@/lib/cart-store";
import { ShoppingCart, Check } from "lucide-react";

function flyToCart(source: HTMLElement, imageUrl?: string | null) {
  const cart = document.getElementById("site-cart-button");
  if (!cart) return;
  const s = source.getBoundingClientRect();
  const t = cart.getBoundingClientRect();
  const startX = s.left + s.width / 2;
  const startY = s.top + s.height / 2;
  const endX = t.left + t.width / 2;
  const endY = t.top + t.height / 2;

  const el = document.createElement("div");
  el.style.position = "fixed";
  el.style.left = `${startX - 20}px`;
  el.style.top = `${startY - 20}px`;
  el.style.width = "40px";
  el.style.height = "40px";
  el.style.borderRadius = "9999px";
  el.style.zIndex = "9999";
  el.style.pointerEvents = "none";
  el.style.boxShadow = "0 10px 25px rgba(29,78,216,.35)";
  el.style.overflow = "hidden";
  el.style.background = "white";

  if (imageUrl) {
    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = "";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    el.appendChild(img);
  } else {
    el.style.background = "var(--primary)";
    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position:absolute;inset:0;margin:auto"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`;
  }

  document.body.appendChild(el);

  const dx = endX - startX;
  const dy = endY - startY;
  const arc = Math.min(-80, dy - 60);

  const anim = el.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1, offset: 0 },
      { transform: `translate(${dx * 0.45}px, ${arc}px) scale(.9)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(.25)`, opacity: 0.35, offset: 1 },
    ],
    { duration: 750, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }
  );

  anim.onfinish = () => el.remove();
}

export function AddToCartButton({ product }: { product: Omit<CartItem, "quantity"> }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const ref = useRef<HTMLButtonElement | null>(null);

  return (
    <Button
      ref={ref as any}
      onClick={() => {
        addItem(product, 1);
        if (ref.current) flyToCart(ref.current, product.imageUrl);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
      className="w-full sm:w-auto"
    >
      {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      {added ? "Added to cart" : "Add to cart"}
    </Button>
  );
}