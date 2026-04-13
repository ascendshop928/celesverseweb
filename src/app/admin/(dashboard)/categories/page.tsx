import { getCategories } from "@/features/admin/actions/category.action";
import { CategoryManager } from "@/features/admin/components/CategoryManager";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 text-2xl font-bold text-zinc-900">分類管理</h1>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
