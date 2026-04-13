"use client";

import { useState } from "react";
import {
  saveCategory,
  deleteCategory,
} from "@/features/admin/actions/category.action";

interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

export function CategoryManager({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editOrder, setEditOrder] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!newName.trim()) return;
    setLoading(true);
    setError("");
    const maxOrder = categories.reduce(
      (max, c) => Math.max(max, c.sortOrder),
      -1
    );
    const result = await saveCategory({
      name: newName.trim(),
      sortOrder: maxOrder + 1,
    });
    if (result.success) {
      setNewName("");
      // 重新載入頁面以取得最新資料
      window.location.reload();
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditOrder(cat.sortOrder);
    setError("");
  }

  async function handleSaveEdit() {
    if (!editingId || !editName.trim()) return;
    setLoading(true);
    setError("");
    const result = await saveCategory(
      { name: editName.trim(), sortOrder: editOrder },
      editingId
    );
    if (result.success) {
      setEditingId(null);
      window.location.reload();
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`確定要刪除分類「${name}」嗎？使用此分類的課程會變成無分類。`))
      return;
    setLoading(true);
    await deleteCategory(id);
    setCategories(categories.filter((c) => c.id !== id));
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 新增分類 */}
      <div className="flex gap-3">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="新分類名稱"
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button
          onClick={handleAdd}
          disabled={loading || !newName.trim()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          新增
        </button>
      </div>

      {/* 分類列表 */}
      <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200">
        {categories.length === 0 ? (
          <div className="p-6 text-center text-sm text-zinc-400">
            尚無分類
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              {editingId === cat.id ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                  <input
                    type="number"
                    value={editOrder}
                    onChange={(e) => setEditOrder(Number(e.target.value))}
                    className="w-20 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                    placeholder="排序"
                  />
                  <button
                    onClick={handleSaveEdit}
                    disabled={loading}
                    className="text-sm text-zinc-600 hover:text-zinc-900"
                  >
                    儲存
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-sm text-zinc-400 hover:text-zinc-600"
                  >
                    取消
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-zinc-700">
                    {cat.name}
                  </span>
                  <span className="text-xs text-zinc-400">
                    排序: {cat.sortOrder}
                  </span>
                  <button
                    onClick={() => startEdit(cat)}
                    className="text-sm text-zinc-500 hover:text-zinc-700"
                  >
                    編輯
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    disabled={loading}
                    className="text-sm text-red-400 hover:text-red-600"
                  >
                    刪除
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
