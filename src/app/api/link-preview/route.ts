import { NextRequest, NextResponse } from "next/server";

type LinkPreview = {
  description: string;
  image: string;
  siteName: string;
  title: string;
  url: string;
};

function readMeta(html: string, key: string) {
  const propertyPattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    "i",
  );
  const contentFirstPattern = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["'][^>]*>`,
    "i",
  );

  return (
    propertyPattern.exec(html)?.[1] ??
    contentFirstPattern.exec(html)?.[1] ??
    ""
  ).trim();
}

function readTitle(html: string) {
  return (/<title[^>]*>([^<]+)<\/title>/i.exec(html)?.[1] ?? "").trim();
}

function normalizeUrl(value: string, baseUrl: string) {
  if (!value) {
    return "";
  }

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return "";
  }
}

function isAllowedUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const targetUrl = request.nextUrl.searchParams.get("url") ?? "";

  if (!isAllowedUrl(targetUrl)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(targetUrl, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent":
          "Mozilla/5.0 (compatible; InternalSpaceAnnouncement/1.0)",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    const html = await response.text();
    const title =
      readMeta(html, "og:title") ||
      readMeta(html, "twitter:title") ||
      readTitle(html) ||
      new URL(targetUrl).hostname;
    const description =
      readMeta(html, "og:description") ||
      readMeta(html, "twitter:description") ||
      readMeta(html, "description");
    const image = normalizeUrl(
      readMeta(html, "og:image") || readMeta(html, "twitter:image"),
      targetUrl,
    );
    const siteName =
      readMeta(html, "og:site_name") || new URL(targetUrl).hostname;

    const preview: LinkPreview = {
      description,
      image,
      siteName,
      title,
      url: targetUrl,
    };

    return NextResponse.json(preview, {
      headers: {
        "Cache-Control": "s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json(
      {
        description: "",
        image: "",
        siteName: new URL(targetUrl).hostname,
        title: new URL(targetUrl).hostname,
        url: targetUrl,
      } satisfies LinkPreview,
      { status: 200 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
