"use client";

import { useState, useEffect, useCallback } from "react";
import { resendConfirmationEmail } from "@/features/orders/actions/resendEmail.action";

export function ResendEmailButton({ orderId }: { orderId: string }) {
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const locked = attempts >= 3;

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (locked || cooldown > 0 || sending) return;
    setSending(true);
    setMessage(null);

    const result = await resendConfirmationEmail(orderId);

    if (result.success) {
      setMessage("已重新寄送，請檢查信箱（含垃圾郵件）");
      setAttempts((a) => a + 1);
      setCooldown(60);
    } else {
      setMessage(result.error || "寄送失敗，請稍後再試");
    }
    setSending(false);
  }, [orderId, locked, cooldown, sending]);

  if (locked) {
    return (
      <p className="text-xs text-muted-fg font-sans text-center">
        重寄次數已達上限，請直接聯繫客服。
      </p>
    );
  }

  return (
    <div className="text-center space-y-2">
      <button
        onClick={handleResend}
        disabled={sending || cooldown > 0}
        className="text-xs text-muted-fg hover:text-foreground transition-colors font-sans underline underline-offset-2 disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
      >
        {sending
          ? "寄送中..."
          : cooldown > 0
            ? `${cooldown} 秒後可再次寄送`
            : "沒收到確認信？點此重寄"}
      </button>
      {message && (
        <p className="text-xs text-muted-fg font-sans">{message}</p>
      )}
    </div>
  );
}
