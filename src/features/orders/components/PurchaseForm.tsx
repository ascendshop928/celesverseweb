// 課程報名表單 — Silk & Shadow
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/features/orders/actions/createOrder.action";

interface PurchaseFormProps {
  courseId: string;
  courseName: string;
  price: number;
}

function generateCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { question: `${a} + ${b} = ?`, answer: a + b };
}

export function PurchaseForm({ courseId, courseName, price }: PurchaseFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [agreed, setAgreed] = useState(false);

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  }, []);

  function handleOpen() {
    setIsOpen(true);
    refreshCaptcha();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // 驗證碼檢查
    if (Number(captchaInput) !== captcha.answer) {
      setError("驗證碼錯誤，請重新計算");
      refreshCaptcha();
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await createOrder({
      courseId,
      buyerName: formData.get("buyerName") as string,
      buyerEmail: formData.get("buyerEmail") as string,
      buyerPhone: formData.get("buyerPhone") as string,
    });

    if (result.success) {
      router.push(`/orders/${result.orderId}/confirmation`);
    } else {
      setError(result.error);
      refreshCaptcha();
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="px-12 py-4 bg-foreground text-background text-sm tracking-widest uppercase  hover:bg-moss transition-all duration-500 font-sans"
      >
        立即報名
      </button>
    );
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-5 p-6 bg-mist/50 ">
        <h3 className="text-xl font-serif font-light">填寫報名資料</h3>
        <p className="text-xs tracking-widest uppercase text-muted-fg font-sans">
          {courseName} — NT$ {price.toLocaleString()}
        </p>

        {error && (
          <div className=" bg-destructive/10 p-3 text-sm text-destructive font-sans">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs uppercase tracking-widest text-muted-fg mb-2 font-sans">
            姓名 *
          </label>
          <input
            name="buyerName"
            type="text"
            required
            className="w-full  border border-border bg-pearl px-4 h-12 text-sm font-sans text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="請輸入姓名"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-muted-fg mb-2 font-sans">
            Email *
          </label>
          <input
            name="buyerEmail"
            type="email"
            required
            className="w-full  border border-border bg-pearl px-4 h-12 text-sm font-sans text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-muted-fg mb-2 font-sans">
            電話（選填）
          </label>
          <input
            name="buyerPhone"
            type="tel"
            className="w-full  border border-border bg-pearl px-4 h-12 text-sm font-sans text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="0912-345-678"
          />
        </div>

        {/* 驗證碼 */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted-fg mb-2 font-sans">
            驗證碼 *
          </label>
          <div className="flex items-center gap-3">
            <span className="shrink-0 px-4 h-12 bg-foreground/5 border border-border flex items-center text-lg font-mono tracking-wider text-foreground select-none">
              {captcha.question}
            </span>
            <input
              type="text"
              inputMode="numeric"
              required
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              className="w-24 border border-border bg-pearl px-4 h-12 text-sm font-sans text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 text-center"
              placeholder="答案"
            />
            <button
              type="button"
              onClick={refreshCaptcha}
              className="shrink-0 text-xs text-muted-fg hover:text-foreground transition-colors font-sans"
              title="換一題"
            >
              換一題
            </button>
          </div>
        </div>

        {/* 同意條款 */}
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-foreground shrink-0"
          />
          <span className="text-xs text-muted-fg font-sans leading-relaxed">
            我已詳細閱讀並同意神仙部落之<a href="/privacy" target="_blank" className="text-gold-dust hover:underline">隱私權政策</a>、<a href="/terms" target="_blank" className="text-gold-dust hover:underline">使用者條款</a>及<a href="/purchase-agreement" target="_blank" className="text-gold-dust hover:underline">實體課程購買合約</a>。
          </span>
        </label>

        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !agreed}
            className="flex-1 py-4 bg-foreground text-background text-sm tracking-widest uppercase  hover:bg-moss transition-all duration-500 font-sans disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "處理中..." : "確認報名"}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setError(null);
            }}
            className="px-8 py-4 border border-border text-foreground text-sm tracking-widest uppercase  hover:bg-mist transition-colors duration-500 font-sans"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
