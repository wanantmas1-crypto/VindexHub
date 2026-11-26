import { getAllCategories } from "@/lib/data";
import { CategoriesManager } from "./categories-manager";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();
  return <CategoriesManager initialCategories={categories} />;
}
