"use client";

import gsap from "gsap";

/**
 * Animate an element flying from a source position to the cart icon in the navbar.
 * Call this from an "Add to Cart" button handler.
 *
 * @param sourceEl  The element to clone and animate (e.g. product image or button)
 * @param onComplete  Callback after animation finishes
 */
export function flyToCart(sourceEl: HTMLElement, onComplete?: () => void) {
    const cartIcon = document.querySelector("#nav-cart");
    if (!cartIcon) {
        onComplete?.();
        return;
    }

    const sourceRect = sourceEl.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    // Create flying clone
    const clone = sourceEl.cloneNode(true) as HTMLElement;
    clone.style.cssText = `
        position: fixed;
        top: ${sourceRect.top}px;
        left: ${sourceRect.left}px;
        width: ${sourceRect.width}px;
        height: ${sourceRect.height}px;
        z-index: 9999;
        pointer-events: none;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(clone);

    // Calculate target center
    const targetX = cartRect.left + cartRect.width / 2 - sourceRect.left - sourceRect.width / 2;
    const targetY = cartRect.top + cartRect.height / 2 - sourceRect.top - sourceRect.height / 2;

    gsap.to(clone, {
        x: targetX,
        y: targetY,
        scale: 0.15,
        opacity: 0,
        duration: 0.7,
        ease: "power3.in",
        onComplete: () => {
            clone.remove();
            onComplete?.();
        },
    });
}
