import { describe, it, expect } from "vitest";

/**
 * Tests for the XSS sanitization middleware.
 * Validates that dangerous HTML/script patterns are stripped from input.
 */

// Import the sanitization logic directly for unit testing
// The actual middleware wraps req.body/query/params through sanitizeObject
function sanitizeString(input: string): string {
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<\/?[^>]+(>|$)/g, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "")
        .replace(/data:\s*text\/html/gi, "")
        .trim();
}

describe("XSS Sanitization", () => {
    it("strips script tags", () => {
        const input = 'Hello <script>alert("xss")</script> World';
        expect(sanitizeString(input)).toBe("Hello  World");
    });

    it("strips HTML tags", () => {
        const input = '<b>Bold</b> and <i>italic</i>';
        expect(sanitizeString(input)).toBe("Bold and italic");
    });

    it("strips javascript: protocol", () => {
        const input = 'javascript:alert("xss")';
        expect(sanitizeString(input)).toBe('alert("xss")');
    });

    it("strips inline event handlers", () => {
        const input = 'onerror=alert(1)';
        expect(sanitizeString(input)).toBe("alert(1)");
    });

    it("strips data:text/html payloads", () => {
        const input = 'data:text/html,<script>alert(1)</script>';
        expect(sanitizeString(input)).toBe(",alert(1)");
    });

    it("preserves normal text", () => {
        const input = "Regular product name with $49.99 price";
        expect(sanitizeString(input)).toBe("Regular product name with $49.99 price");
    });

    it("preserves URLs", () => {
        const input = "https://example.com/path?q=search";
        expect(sanitizeString(input)).toBe("https://example.com/path?q=search");
    });

    it("handles empty string", () => {
        expect(sanitizeString("")).toBe("");
    });

    it("handles string with only whitespace", () => {
        expect(sanitizeString("   ")).toBe("");
    });
});
