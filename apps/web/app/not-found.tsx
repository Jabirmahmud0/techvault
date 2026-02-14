import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-4xl font-bold tracking-tight">404 Not Found</h2>
            <p className="text-muted-foreground text-lg">
                Could not find the requested resource.
            </p>
            <Button asChild variant="default" className="mt-4">
                <Link href="/">Return Home</Link>
            </Button>
        </div>
    );
}
