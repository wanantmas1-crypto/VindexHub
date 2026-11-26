import { getAllCategories, getAllProducts } from "@/lib/data";
import { ProductsManager } from "./products-manager";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getAllProducts(), getAllCategories()]);
  return <ProductsManager initialProducts={products} categories={categories} />;
}
