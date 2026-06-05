"use client";

import { useEffect, useState } from "react";

export default function ClientCookiesDebugger() {
    const [clientCookies, setClientCookies] = useState<string>("");

    useEffect(() => {
        setClientCookies(document.cookie);
    }, []);

    return (
        <div className="border p-4 rounded bg-secondary/20">
            <h2 className="font-bold mb-2">Client-Side Cookies (document.cookie)</h2>
            {clientCookies ? (
                <div className="text-emerald-400 break-all">{clientCookies}</div>
            ) : (
                <div className="text-red-400">❌ document.cookie is empty (e.g. all cookies are HttpOnly or not set)</div>
            )}
        </div>
    );
}
