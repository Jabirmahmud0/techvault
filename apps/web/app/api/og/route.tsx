import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Dynamic Open Graph image generator.
 * Usage: /api/og?title=Product+Name&price=99.99&brand=Apple&rating=4.5
 */
export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const title = searchParams.get("title") || "TechVault";
    const price = searchParams.get("price");
    const brand = searchParams.get("brand");
    const rating = searchParams.get("rating");
    const category = searchParams.get("category");

    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
                    fontFamily: "system-ui, sans-serif",
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "32px",
                    }}
                >
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, #6366f1, #818cf8)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "24px",
                        }}
                    >
                        ⚡
                    </div>
                    <span
                        style={{
                            fontSize: "28px",
                            fontWeight: 700,
                            color: "#e2e8f0",
                            letterSpacing: "-0.5px",
                        }}
                    >
                        TechVault
                    </span>
                </div>

                {/* Title */}
                <div
                    style={{
                        fontSize: "56px",
                        fontWeight: 800,
                        color: "white",
                        textAlign: "center",
                        maxWidth: "900px",
                        lineHeight: 1.1,
                        letterSpacing: "-1px",
                        marginBottom: "24px",
                    }}
                >
                    {title}
                </div>

                {/* Meta row */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "24px",
                        marginTop: "8px",
                    }}
                >
                    {brand && (
                        <div
                            style={{
                                fontSize: "22px",
                                color: "#94a3b8",
                                fontWeight: 500,
                            }}
                        >
                            {brand}
                        </div>
                    )}
                    {category && (
                        <div
                            style={{
                                fontSize: "18px",
                                color: "#818cf8",
                                background: "rgba(99, 102, 241, 0.15)",
                                padding: "6px 16px",
                                borderRadius: "8px",
                                fontWeight: 600,
                            }}
                        >
                            {category}
                        </div>
                    )}
                    {rating && (
                        <div
                            style={{
                                fontSize: "22px",
                                color: "#fbbf24",
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                            }}
                        >
                            ★ {rating}
                        </div>
                    )}
                    {price && (
                        <div
                            style={{
                                fontSize: "32px",
                                fontWeight: 800,
                                color: "#34d399",
                            }}
                        >
                            ${price}
                        </div>
                    )}
                </div>

                {/* Bottom gradient line */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "0",
                        width: "100%",
                        height: "4px",
                        background: "linear-gradient(90deg, #6366f1, #818cf8, #a78bfa)",
                    }}
                />
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
