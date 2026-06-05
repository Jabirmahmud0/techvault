import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const hasAuthCookie =
        Boolean(cookieStore.get("accessToken")?.value) ||
        Boolean(cookieStore.get("refreshToken")?.value);

    return NextResponse.json(
        { authenticated: hasAuthCookie },
        {
            headers: {
                "Cache-Control": "no-store",
            },
        }
    );
}
