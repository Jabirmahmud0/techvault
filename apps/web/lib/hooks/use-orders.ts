import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface OrderItem {
    id: string;
    productName: string;
    productImage: string;
    quantity: number;
    price: string;
}

export interface Order {
    id: string;
    date: string;
    status: "PENDING" | "PAID" | "FAILED" | "SHIPPED" | "DELIVERED" | "CANCELLED"; // Updated status union
    total: string;
    items: OrderItem[];
    createdAt: string;
}

export function useOrders() {
    return useQuery({
        queryKey: ["orders"],
        queryFn: async () => {
            const res = await api.get<{ data: Order[] }>("/orders");
            return res.data;
        },
    });
}

export function useOrder(id: string) {
    return useQuery({
        queryKey: ["order", id],
        queryFn: async () => {
            const res = await api.get<{ data: Order }>(`/orders/${id}`);
            return res.data;
        },
        enabled: !!id,
    });
}
