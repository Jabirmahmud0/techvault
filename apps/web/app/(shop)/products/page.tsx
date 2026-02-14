import { Suspense } from "react";
import ProductsClient from "./products-client";

/**
 * Products listing page.
 * Renders client-side immediately — data is fetched via useInfiniteProducts hook.
 * No server-side blocking fetch needed since the client handles pagination.
 */
export default function ProductsPage() {
    return (
        <Suspense>
            <ProductsClient />
        </Suspense>
    );
}
