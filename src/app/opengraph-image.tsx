import { ImageResponse } from "next/og";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";

export const runtime = "edge";
export const alt = `${APP_NAME} — Backlink Indexing Service`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 64,
          background: "linear-gradient(135deg, #050810 0%, #0f1a2e 100%)",
          color: "#f0f4fa",
        }}
      >
        <div style={{ fontSize: 28, color: "#ff9500", marginBottom: 16 }}>{APP_NAME}</div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.15, maxWidth: 900 }}>
          Backlink Indexing for SEO Teams
        </div>
        <div style={{ fontSize: 28, color: "#6ecfff", marginTop: 24, maxWidth: 800 }}>
          {APP_TAGLINE} · 1 credit = 1 URL · Live tracking
        </div>
      </div>
    ),
    { ...size },
  );
}
