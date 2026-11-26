"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore, type CartItem } from "@/lib/cart-store";
import { ShoppingCart, Check } from "lucide-react";

export function AddToCartButton({ product }: { product: Omit<CartItem, "quantity"> }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  return (
    <Button
      onClick={() => {
        addItem(product, 1);
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
