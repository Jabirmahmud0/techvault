"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface ImageUploadProps {
    onChange: (url: string) => void;
    value: string;
    className?: string;
}

export function ImageUpload({ onChange, value, className }: ImageUploadProps) {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(value);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragActive, setIsDragActive] = useState(false);

    const handleFile = async (file: File) => {
        if (!file) return;

        // Create local preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        setLoading(true);

        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await api.post<{ data: { url: string } }>("/upload", formData);
            onChange(res.data.url);
        } catch (error) {
            console.error("Upload failed", error);
            // Revert preview on error
            setPreview("");
        } finally {
            setLoading(false);
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!loading) setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (loading) return;

        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            handleFile(file);
        }
    };

    const handleClick = () => {
        if (!loading) fileInputRef.current?.click();
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
        setPreview("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className={cn("w-full", className)}>
            <div
                onClick={handleClick}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-4 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 min-h-[200px]",
                    isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                    loading && "opacity-50 cursor-not-allowed",
                    preview && "border-solid border-border p-2"
                )}
            >
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={onFileChange}
                    disabled={loading}
                />

                {preview ? (
                    <div className="relative w-full h-full min-h-[200px] rounded-lg overflow-hidden group">
                        <Image
                            src={preview}
                            alt="Upload preview"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute top-2 right-2">
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={handleRemove}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        {loading && (
                            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="p-4 rounded-full bg-muted">
                            {loading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            ) : (
                                <Upload className="h-6 w-6 text-muted-foreground" />
                            )}
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-sm font-medium">
                                {isDragActive ? "Drop image here" : "Click to upload or drag & drop"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                SVG, PNG, JPG or GIF (max. 800x400px)
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
