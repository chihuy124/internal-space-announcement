"use client";

import { ExternalLink, ImageOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type Preview = {
  description: string;
  image: string;
  siteName: string;
  title: string;
  url: string;
};

type LinkPreviewInlineProps = {
  children: React.ReactNode;
  href: string;
};

export function LinkPreviewInline({ children, href }: LinkPreviewInlineProps) {
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [hideImage, setHideImage] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadPreview() {
      setLoading(true);

      try {
        const response = await fetch(
          `/api/link-preview?url=${encodeURIComponent(href)}`,
        );

        if (!response.ok) {
          throw new Error("Preview request failed");
        }

        const result = (await response.json()) as Preview;

        if (!ignore) {
          setPreview(result);
        }
      } catch {
        if (!ignore) {
          setPreview({
            description: "",
            image: "",
            siteName: new URL(href).hostname,
            title: new URL(href).hostname,
            url: href,
          });
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadPreview();

    return () => {
      ignore = true;
    };
  }, [href]);

  return (
    <span className="my-4 block">
      {loading ? (
        <span className="mb-2 flex items-center gap-2 text-sm text-[#6b6a67]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải preview...
        </span>
      ) : null}

      {preview ? (
        <a
          className="mb-2 block overflow-hidden rounded-lg border border-[#e5e2dc] bg-white text-left shadow-[0_4px_12px_rgba(15,15,15,0.08)] transition-colors hover:bg-[#fbfaf8]"
          href={preview.url}
          rel="noreferrer"
          target="_blank"
        >
          {preview.image && !hideImage ? (
            <span className="flex justify-center bg-[#f7f6f3] p-4 sm:p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                className="max-h-[70dvh] w-auto max-w-full rounded-md object-contain shadow-[0_1px_4px_rgba(15,15,15,0.08)]"
                onError={() => setHideImage(true)}
                src={preview.image}
              />
            </span>
          ) : (
            <span className="flex h-24 items-center justify-center bg-[#f7f6f3] text-[#8a8985]">
              <ImageOff className="h-5 w-5" />
            </span>
          )}
          {preview.image && !hideImage ? null : (
            <span className="block p-3">
              <span className="mb-1 flex items-center gap-1 text-xs font-medium text-[#787774]">
                <span className="truncate">{preview.siteName}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </span>
              <span className="line-clamp-2 text-sm font-semibold leading-5 text-[#191919]">
                {preview.title || preview.url}
              </span>
              {preview.description ? (
                <span className="mt-1 line-clamp-2 text-xs leading-5 text-[#6b6a67]">
                  {preview.description}
                </span>
              ) : null}
            </span>
          )}
        </a>
      ) : null}

      <a
        className="block text-center font-medium text-[#0b6e99] underline underline-offset-2"
        href={href}
        rel="noreferrer"
        target="_blank"
      >
        {children}
      </a>
    </span>
  );
}
