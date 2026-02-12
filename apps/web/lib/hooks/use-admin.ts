import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

interface AdminStats {
    revenue: number;
    orders: number;
    users: number;
    products: number;
    trends?: {
        revenue: number;
        orders: number;
        users: number;
    };
}

interface RecentOrder {
    id: string;
    total: string;
    status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    createdAt: string;
    user: {
        name: string;
        email: string;
        image: string | null;
    };
    items: {
        productName: string;
        quantity: number;
    }[];
}

interface RevenueChartData {
    date: string;
    revenue: string; // aggregated by SQL, usually string
}

export function useAdminStats() {
    return useQuery({
        queryKey: ["admin", "stats"],
        queryFn: async () => {
            const res = await api.get<{ data: AdminStats }>("/admin/stats");
            return res.data;
        },
    });
}

export function useRecentOrders() {
    return useQuery({
        queryKey: ["admin", "recent-orders"],
        queryFn: async () => {
            const res = await api.get<{ data: RecentOrder[] }>("/admin/recent-orders");
            return res.data;
        }
    });
}

export function useRevenueChart() {
    return useQuery({
        queryKey: ["admin", "revenue-chart"],
        queryFn: async () => {
            const res = await api.get<{ data: RevenueChartData[] }>("/admin/revenue-chart");
            return res.data;
        }
    });
}

export function useRevenueByCategory() {
    return useQuery({
        queryKey: ["admin", "revenue-by-category"],
        queryFn: async () => {
            const res = await api.get<{ data: { name: string; value: number }[] }>("/admin/revenue-by-category");
            return res.data;
        }
    });
}

export function useLowStockProducts() {
    return useQuery({
        queryKey: ["admin", "low-stock"],
        queryFn: async () => {
            const res = await api.get<{ data: any[] }>("/admin/low-stock"); // using any[] for simplicity with complex relation type
            return res.data;
        }
    });
}

interface Customer {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
    createdAt: string;
    orderCount: number;
    totalSpent: number;
}

interface CustomersResponse {
    customers: Customer[];
    total: number;
    page: number;
    totalPages: number;
}

export function useCustomers(page: number = 1, search: string = "") {
    return useQuery({
        queryKey: ["admin", "customers", page, search],
        queryFn: async () => {
            const params = new URLSearchParams({ page: String(page), limit: "10" });
            if (search) params.set("search", search);
            const res = await api.get<{ data: CustomersResponse }>(`/admin/customers?${params}`);
            return res.data;
        }
    });
}
