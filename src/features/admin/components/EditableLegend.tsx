"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Pencil, Plus, X } from "lucide-react";
import { Popover } from "@/components/ui/Popover";

const COLOR_PALETTE = [
  "#1B5B4A", "#2D8B78", "#D4943A", "#8B5E3C",
  "#3B5998", "#7C3AED", "#BE185D", "#4B5563",
  "#F97316", "#0891B2", "#A1A1AA", "#10B981",
  "#DC2626", "#EA580C", "#CA8A04", "#16A34A",
  "#0284C7", "#7C3AED", "#C026D3", "#475569",
];

export interface LegendItem {
  key: string;
  label: string;
  color: string;
  editable?: boolean;
}

interface EditableLegendProps {
  items: LegendItem[];
  onChange: (items: LegendItem[]) => void;
}

export function EditableLegend({ items, onChange }: EditableLegendProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const newInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingKey && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingKey]);

  useEffect(() => {
    if (addingNew && newInputRef.current) {
      newInputRef.current.focus();
    }
  }, [addingNew]);

  function startEditing(item: LegendItem) {
    setEditingKey(item.key);
    setEditLabel(item.label);
  }

  function commitLabel(key: string) {
    if (editLabel.trim()) {
      onChange(
        items.map((it) =>
          it.key === key ? { ...it, label: editLabel.trim() } : it
        )
      );
    }
    setEditingKey(null);
  }

  function changeColor(key: string, color: string) {
    onChange(
      items.map((it) => (it.key === key ? { ...it, color } : it))
    );
  }

  function deleteItem(key: string) {
    onChange(items.filter((it) => it.key !== key));
  }

  function addItem() {
    if (!newLabel.trim()) return;
    const key = `custom_${Date.now()}`;
    // Pick a color not yet used, or cycle
    const usedColors = new Set(items.map((it) => it.color));
    const availableColor =
      COLOR_PALETTE.find((c) => !usedColors.has(c)) || COLOR_PALETTE[0];
    onChange([
      ...items,
      { key, label: newLabel.trim(), color: availableColor, editable: true },
    ]);
    setNewLabel("");
    setAddingNew(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {items.map((item) => {
          const isEditing = editingKey === item.key;
          const isEditable = item.editable !== false;

          return (
            <div
              key={item.key}
              className="group flex items-center gap-1.5 rounded-full bg-zinc-50 border border-zinc-200 px-2.5 py-1"
            >
              {isEditable ? (
                <Popover
                  trigger={
                    <button
                      className="inline-block w-3 h-3 rounded-full ring-1 ring-zinc-300 cursor-pointer hover:scale-125 transition-transform"
                      style={{ backgroundColor: item.color }}
                      title="更換顏色"
                    />
                  }
                >
                  <div className="grid grid-cols-5 gap-2">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c}
                        onClick={() => changeColor(item.key, c)}
                        className="relative w-7 h-7 rounded-md border-2 transition-all hover:scale-110"
                        style={{
                          backgroundColor: c,
                          borderColor: item.color === c ? "#fff" : c,
                          boxShadow:
                            item.color === c
                              ? `0 0 0 2px ${c}`
                              : undefined,
                        }}
                      >
                        {item.color === c && (
                          <Check className="absolute inset-0 m-auto w-3.5 h-3.5 text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </Popover>
              ) : (
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              )}

              {isEditing ? (
                <input
                  ref={inputRef}
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onBlur={() => commitLabel(item.key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitLabel(item.key);
                    if (e.key === "Escape") setEditingKey(null);
                  }}
                  className="w-16 px-1 py-0 text-xs border border-zinc-300 rounded bg-white text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-500"
                />
              ) : (
                <span
                  className={`text-xs text-zinc-700 ${isEditable ? "cursor-pointer hover:underline" : "text-zinc-400"}`}
                  onClick={() => isEditable && startEditing(item)}
                  title={isEditable ? "點擊編輯名稱" : undefined}
                >
                  {item.label}
                </span>
              )}

              {isEditable && !isEditing && (
                <Pencil
                  className="w-2.5 h-2.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => startEditing(item)}
                />
              )}

              {isEditable && (
                <X
                  className="w-3 h-3 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-red-400"
                  onClick={() => deleteItem(item.key)}
                />
              )}
            </div>
          );
        })}

        {/* 新增按鈕 */}
        {addingNew ? (
          <div className="flex items-center gap-1.5 rounded-full border border-dashed border-zinc-300 px-2.5 py-1">
            <input
              ref={newInputRef}
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addItem();
                if (e.key === "Escape") {
                  setAddingNew(false);
                  setNewLabel("");
                }
              }}
              placeholder="標籤名稱"
              className="w-20 px-1 py-0 text-xs border-none bg-transparent text-zinc-900 outline-none placeholder:text-zinc-300"
            />
            <button
              onClick={addItem}
              disabled={!newLabel.trim()}
              className="text-xs text-zinc-500 hover:text-zinc-700 disabled:text-zinc-300"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                setAddingNew(false);
                setNewLabel("");
              }}
              className="text-xs text-zinc-300 hover:text-zinc-500"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddingNew(true)}
            className="flex items-center gap-1 rounded-full border border-dashed border-zinc-300 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-600 hover:border-zinc-400 transition-colors"
          >
            <Plus className="w-3 h-3" />
            新增標籤
          </button>
        )}
      </div>
    </div>
  );
}
