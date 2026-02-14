"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, Loader2, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createReviewSchema, type CreateReviewInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProductReviewsProps {
    productId: string;
    productName: string;
    productSlug: string;
}

interface Review {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    userName: string;
    userImage: string | null;
}

interface ReviewsResponse {
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
    pagination: { page: number; totalPages: number; hasNext: boolean };
}

/**
 * Product reviews section: displays rating summary, rating breakdown,
 * list of reviews, and a submission form for authenticated users.
 */
export function ProductReviews({ productId, productName, productSlug }: ProductReviewsProps) {
    const [page, setPage] = useState(1);
    const queryClient = useQueryClient();
    const isAuthenticated = useAuthStore((s) => !!s.accessToken);

    // Fetch reviews
    const { data, isLoading } = useQuery<{ data: ReviewsResponse }>({
        queryKey: ["reviews", productId, page],
        queryFn: () => api.get(`/reviews/${productId}?page=${page}&limit=5`),
    });

    // Fetch rating breakdown
    const { data: breakdownData } = useQuery<{ data: Record<number, number> }>({
        queryKey: ["reviews-breakdown", productId],
        queryFn: () => api.get(`/reviews/${productId}/breakdown`),
    });

    const reviews = data?.data?.reviews ?? [];
    const averageRating = data?.data?.averageRating ?? 0;
    const totalReviews = data?.data?.totalReviews ?? 0;
    const pagination = data?.data?.pagination;
    const breakdown = breakdownData?.data ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                Customer Reviews
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Rating Summary */}
                <div className="space-y-4">
                    <div className="text-center">
                        <div className="text-5xl font-bold text-primary">{averageRating}</div>
                        <div className="flex justify-center mt-2">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn(
                                        "h-5 w-5",
                                        i < Math.floor(averageRating)
                                            ? "text-yellow-500 fill-yellow-500"
                                            : "text-muted-foreground/30"
                                    )}
                                />
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                        </p>
                    </div>

                    {/* Rating Bars */}
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = breakdown[star] ?? 0;
                            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                            return (
                                <div key={star} className="flex items-center gap-2 text-sm">
                                    <span className="w-3 text-muted-foreground">{star}</span>
                                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                    <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-yellow-500 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.6, delay: star * 0.05 }}
                                        />
                                    </div>
                                    <span className="w-8 text-right text-muted-foreground">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Reviews List */}
                <div className="md:col-span-2 space-y-6">
                    {isLoading && (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {!isLoading && reviews.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <p className="text-lg mb-1">No reviews yet</p>
                            <p className="text-sm">Be the first to review {productName}!</p>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {reviews.map((review, idx) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="rounded-xl border border-border bg-card/50 p-5"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                        {review.userImage ? (
                                            <img src={review.userImage} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-5 w-5 text-primary" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-sm">{review.userName}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex mt-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn(
                                                        "h-3.5 w-3.5",
                                                        i < review.rating
                                                            ? "text-yellow-500 fill-yellow-500"
                                                            : "text-muted-foreground/30"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {review.comment}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-center gap-2 pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                Previous
                            </Button>
                            <span className="flex items-center text-sm text-muted-foreground px-3">
                                Page {page} of {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!pagination.hasNext}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    )}

                    {/* Write Review */}
                    {isAuthenticated && (
                        <ReviewForm
                            productId={productId}
                            productSlug={productSlug}
                            onSuccess={() => {
                                queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
                                queryClient.invalidateQueries({ queryKey: ["product", productSlug] });
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Review Submission Form ──────────────────────────────────────────────────

function ReviewForm({ productId, productSlug, onSuccess }: { productId: string; productSlug: string; onSuccess: () => void }) {
    const [hoverRating, setHoverRating] = useState(0);
    const queryClient = useQueryClient();

    const form = useForm<CreateReviewInput>({
        resolver: zodResolver(createReviewSchema),
        defaultValues: {
            productId,
            rating: 0,
            comment: "",
        },
    });

    const mutation = useMutation({
        mutationFn: (data: CreateReviewInput) => api.post("/reviews", data),
        onSuccess: () => {
            toast.success("Review submitted!");
            form.reset({ productId, rating: 0, comment: "" });
            queryClient.invalidateQueries({ queryKey: ["reviews-breakdown", productId] });
            onSuccess();
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to submit review");
        },
    });

    const selectedRating = form.watch("rating");

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card/50 p-6"
        >
            <h3 className="font-semibold mb-4">Write a Review</h3>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
                    className="space-y-4"
                >
                    {/* Star Rating Selector */}
                    <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => field.onChange(star)}
                                            className="p-0.5 transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={cn(
                                                    "h-7 w-7 transition-colors",
                                                    star <= (hoverRating || selectedRating)
                                                        ? "text-yellow-500 fill-yellow-500"
                                                        : "text-muted-foreground/30"
                                                )}
                                            />
                                        </button>
                                    ))}
                                    {selectedRating > 0 && (
                                        <span className="text-sm text-muted-foreground ml-2">
                                            {selectedRating}/5
                                        </span>
                                    )}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Comment */}
                    <FormField
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea
                                        placeholder="Share your experience with this product..."
                                        rows={4}
                                        className="resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        variant="glow"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="mr-2 h-4 w-4" />
                        )}
                        Submit Review
                    </Button>
                </form>
            </Form>
        </motion.div>
    );
}
