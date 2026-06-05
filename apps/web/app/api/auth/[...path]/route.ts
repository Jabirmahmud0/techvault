import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:4000/api";

/**
 * Auth proxy route handler.
 * Replaces the Next.js rewrite for /api/auth/* paths so that
 * Set-Cookie headers from the Render backend are reliably forwarded
 * to the browser (Next.js rewrites can silently drop them).
 */
async function proxyRequest(request: NextRequest, pathSegments: string[]) {
    const path = pathSegments.join("/");
    const backendUrl = `${API_URL}/auth/${path}`;

    const forwardHeaders: Record<string, string> = {};

    const contentType = request.headers.get("content-type");
    if (contentType) forwardHeaders["content-type"] = contentType;

    // Forward browser cookies to backend (for refresh token)
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) forwardHeaders["cookie"] = cookieHeader;

    // Forward Authorization header if present
    const authHeader = request.headers.get("authorization");
    if (authHeader) forwardHeaders["authorization"] = authHeader;

    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    let body: string | undefined;
    if (hasBody) {
        body = await request.text();
    }

    let backendResponse: Response;
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 35000); // 35s timeout for cold starts
        backendResponse = await fetch(backendUrl, {
            method: request.method,
            headers: forwardHeaders,
            body,
            signal: controller.signal,
        });
        clearTimeout(timeout);
    } catch (err) {
        console.error("[AuthProxy] Backend unreachable:", err);
        return NextResponse.json(
            { success: false, error: "Service temporarily unavailable. Please try again." },
            { status: 503 }
        );
    }

    const responseText = await backendResponse.text();

    const response = new NextResponse(responseText, {
        status: backendResponse.status,
        headers: { "Content-Type": "application/json; charset=utf-8" },
    });

    // Forward all Set-Cookie headers from backend → browser
    // This is the critical part that Next.js rewrites can miss
    const rawHeaders = backendResponse.headers as any;
    const setCookies: string[] =
        typeof rawHeaders.getSetCookie === "function"
            ? rawHeaders.getSetCookie()
            : [];

    if (setCookies.length > 0) {
        for (const cookie of setCookies) {
            response.headers.append("Set-Cookie", cookie);
        }
    } else {
        // Fallback: try raw header (only gets first value if multiple cookies)
        const setCookie = backendResponse.headers.get("set-cookie");
        if (setCookie) {
            response.headers.set("Set-Cookie", setCookie);
        }
    }

    return response;
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
    const { path } = await params;
    return proxyRequest(request, path);
}

export async function POST(request: NextRequest, { params }: RouteContext) {
    const { path } = await params;
    return proxyRequest(request, path);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
    const { path } = await params;
    return proxyRequest(request, path);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
    const { path } = await params;
    return proxyRequest(request, path);
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
    const { path } = await params;
    return proxyRequest(request, path);
}
