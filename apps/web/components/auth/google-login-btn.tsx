"use client";

import { GoogleLogin } from "@react-oauth/google";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function GoogleLoginBtn() {
    const setAuth = useAuthStore((s) => s.setAuth);
    const router = useRouter();

    const handleSuccess = async (credentialResponse: any) => {
        try {
            const { credential } = credentialResponse;
            const res = await api.post<{ data: { user: any; accessToken: string } }>("/auth/google", {
                credential,
            });

            setAuth(res.data.user, res.data.accessToken);
            toast.success("Logged in with Google");
            router.push("/");
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Google login failed");
        }
    };

    const handleError = () => {
        toast.error("Google login failed");
    };

    return (
        <div className="w-full flex justify-center mt-4">
            <div className="w-full">
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={handleError}
                    theme="filled_black"
                    shape="pill"
                    text="continue_with"
                    width="100%"
                />
            </div>
        </div>
    );
}
