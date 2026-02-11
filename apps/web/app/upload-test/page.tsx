"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/ui/image-upload";

export default function UploadTestPage() {
    const [imageUrl, setImageUrl] = useState("");

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="mx-auto max-w-xl space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
                        Upload Test
                    </h1>
                    <p className="text-muted-foreground">
                        Test the Cloudinary image upload integration
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="space-y-4">
                        <label className="text-sm font-medium">
                            Product Image
                        </label>
                        <ImageUpload
                            value={imageUrl}
                            onChange={(url) => setImageUrl(url)}
                        />
                    </div>

                    {imageUrl && (
                        <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
                            <h3 className="text-sm font-medium mb-2">Uploaded URL:</h3>
                            <code className="text-xs break-all bg-background p-2 rounded block border border-border">
                                {imageUrl}
                            </code>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
