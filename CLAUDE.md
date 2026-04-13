# CelesVerse - 身心靈課程電商網站

課程展示、線上購買、即時庫存、管理後台（上下架 / 編輯商品）。

@AGENTS.md

## 技術棧
- Next.js 16 (App Router) + TypeScript
- Prisma ORM + PostgreSQL
- Tailwind CSS v4

## 目錄結構速查
- `src/features/courses/` — 課程瀏覽、詳情頁、商品卡片
- `src/features/orders/` — 購買流程、訂單管理
- `src/features/inventory/` — 庫存計算與即時更新邏輯
- `src/features/admin/` — 管理後台（上下架、編輯商品、訂單查看）
- `src/components/ui/` — 共用 UI 元件（Button、Modal、Card 等）
- `src/components/layout/` — 版面元件（Header、Footer、Sidebar）
- `src/lib/` — 工具函式與第三方整合（prisma client 等）
- `src/config/` — 環境變數和設定常數
- `src/types/` — 全專案共用的 TypeScript 型別
- `prisma/schema.prisma` — 資料庫模型定義

## 開發指令
```bash
npm run dev          # 啟動開發伺服器 (port 3000)
npx prisma dev       # 啟動本地 Prisma Postgres 並同步 schema
npx prisma studio    # 開啟資料庫 GUI
npx prisma generate  # 重新生成 Prisma Client
npm run build        # 建置生產版本
npm run lint         # ESLint 檢查
```

## 程式碼規範
- 功能模組之間不可直接引用彼此的內部檔案，透過 `src/lib/` 或 `src/types/` 溝通
- Server Actions 放在各 feature 的 `actions/` 資料夾，檔名加 `.action.ts` 後綴
- 價格以整數（新台幣元）儲存，不使用浮點數
- 庫存計算：剩餘名額 = totalSlots - soldCount，購買時需檢查

## 注意事項
- `.env` 不可提交到 git，參考 `.env.example` 建立
- Prisma Client 生成在 `src/generated/prisma/`，已加入 .gitignore
- 管理員密碼必須 bcrypt hash 後儲存
