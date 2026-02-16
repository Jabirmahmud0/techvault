export const dynamic = "force-dynamic";

export default function DebugEnvPage() {
    const apiUrl = process.env.API_URL;
    const nextPublicApiUrl = process.env.NEXT_PUBLIC_API_URL;
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    return (
        <div className="p-8 font-mono space-y-4">
            <h1 className="text-xl font-bold">Environment Debugger</h1>

            <div className="border p-4 rounded bg-secondary/20">
                <h2 className="font-bold mb-2">Server-Side (process.env)</h2>
                <div className="grid grid-cols-[200px_1fr] gap-2">
                    <div>API_URL:</div>
                    <div className="font-bold text-primary break-all">
                        {apiUrl || "❌ MISSING"}
                    </div>
                </div>
            </div>

            <div className="border p-4 rounded bg-secondary/20">
                <h2 className="font-bold mb-2">Client-Side (NEXT_PUBLIC_)</h2>
                <div className="grid grid-cols-[200px_1fr] gap-2">
                    <div>NEXT_PUBLIC_API_URL:</div>
                    <div className="font-bold text-primary break-all">
                        {nextPublicApiUrl || "❌ MISSING"}
                    </div>
                    <div>GOOGLE_CLIENT_ID:</div>
                    <div className="font-bold text-primary break-all">
                        {googleClientId ? "✅ PRESENT" : "❌ MISSING"}
                    </div>
                </div>
            </div>

            <div className="text-sm text-muted-foreground mt-8">
                <p>If API_URL is missing or doesn't include /api, rewrites will fail.</p>
            </div>
        </div>
    );
}
