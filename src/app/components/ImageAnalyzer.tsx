"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createWorker } from "tesseract.js";
import { useTheme } from "../providers";

const MAX_IMAGES = 10;

type Item = { id: string; file: File; url: string };

export default function ImageAnalyzer({
  showIntro = true,
}: {
  showIntro?: boolean;
}) {
  const router = useRouter();
  const { lang, colors } = useTheme();
  const isAr = lang === "ar";

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const itemsRef = useRef<Item[]>([]);
  itemsRef.current = items;

  // Free preview URLs on unmount
  useEffect(() => {
    return () => itemsRef.current.forEach((i) => URL.revokeObjectURL(i.url));
  }, []);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setError("");

    const incoming = Array.from(list).filter((f) => f.type.startsWith("image/"));
    const room = MAX_IMAGES - items.length;

    if (incoming.length > room) {
      setError(
        isAr
          ? `الحد الأقصى ${MAX_IMAGES} صور.`
          : `Maximum ${MAX_IMAGES} images.`
      );
    }

    const added = incoming.slice(0, Math.max(room, 0)).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
    }));

    setItems((prev) => [...prev, ...added]);
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((i) => i.id !== id);
    });
  }

  function move(index: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  async function handleAnalyze() {
    if (items.length === 0 || loading) return;

    setError("");
    setLoading(true);
    setProgress(0);

    let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

    try {
      worker = await createWorker(["eng", "ara"]);

      const pages: string[] = [];
      for (let i = 0; i < items.length; i++) {
        setProgress(i + 1);
        const { data } = await worker.recognize(items[i].file);
        const pageText = (data?.text ?? "").trim();
        if (pageText) pages.push(pageText);
      }

      const text = pages.join("\n\n");

      if (text.length < 50) {
        throw new Error(
          isAr
            ? "ما قدرنا نقرأ نص كافٍ من الصور."
            : "Couldn't read enough text from the images."
        );
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang }),
      });
      const result = await res.json();

      if (!res.ok || !result?.id) {
        throw new Error(
          result?.error || (isAr ? "فشل التحليل." : "Analysis failed.")
        );
      }

      router.push(`/results?id=${result.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      if (worker) await worker.terminate();
      setLoading(false);
    }
  }

  const buttonBase = {
    padding: "10px 18px",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: "0.9rem",
  } as const;

  return (
    <div style={{ textAlign: "center" }}>
      {showIntro && (
        <p style={{ color: colors.muted, marginBottom: 10 }}>
          {isAr
            ? "أو ارفع لقطات شاشة للسياسة (يمكن أكثر من صورة)"
            : "Or upload screenshots of the policy (multiple images allowed)"}
        </p>
      )}

      <input
        id="policy-image"
        type="file"
        accept="image/*"
        multiple
        hidden
        disabled={loading || items.length >= MAX_IMAGES}
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <label
          htmlFor="policy-image"
          style={{
            ...buttonBase,
            border: `1px solid ${colors.border}`,
            background: colors.card,
            color: colors.accentText,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading || items.length >= MAX_IMAGES ? 0.6 : 1,
          }}
        >
          {items.length === 0
            ? isAr ? "📷 اختر صور" : "📷 Choose Images"
            : isAr ? "➕ أضف المزيد" : "➕ Add more"}
        </label>

        {items.length > 0 && (
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              ...buttonBase,
              border: "none",
              background: colors.accent,
              color: colors.onAccent,
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? isAr
                ? `جارٍ قراءة ${progress}/${items.length}...`
                : `Reading ${progress}/${items.length}...`
              : isAr
              ? `تحليل (${items.length})`
              : `Analyze (${items.length})`}
          </button>
        )}
      </div>

      {items.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "14px 0 0",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {items.map((item, i) => (
            <li
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: 8,
                borderRadius: 10,
                border: `1px solid ${colors.border}`,
                background: colors.card,
              }}
            >
              <span
                style={{
                  width: 22,
                  color: colors.muted,
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}
              >
                {isAr ? (i + 1).toLocaleString("ar-SA") : i + 1}
              </span>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt=""
                style={{
                  width: 44,
                  height: 44,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: `1px solid ${colors.border}`,
                }}
              />

              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  textAlign: isAr ? "right" : "left",
                  color: colors.text,
                  fontSize: "0.85rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.file.name}
              </span>

              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={loading || i === 0}
                aria-label="Move up"
                style={iconBtn(colors.muted, loading || i === 0)}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={loading || i === items.length - 1}
                aria-label="Move down"
                style={iconBtn(colors.muted, loading || i === items.length - 1)}
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                disabled={loading}
                aria-label="Remove"
                style={iconBtn(colors.high, loading)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p style={{ color: colors.high, marginTop: 10 }}>{error}</p>}
    </div>
  );
}

function iconBtn(color: string, disabled: boolean) {
  return {
    background: "transparent",
    border: "none",
    color,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.35 : 1,
    fontSize: "1rem",
    padding: "4px 6px",
  } as const;
}