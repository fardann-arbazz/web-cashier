import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import API from "@/lib/axios";

export const useAuth = () => {
  const { token, user, login, logout } = useAuthStore();

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) return;

      try {
        const res = await API.get("/get/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        login({
          user: res.data.data,
          token,
        });
      } catch (err) {
        console.error("Failed to fetch user:", err);
        logout(); // Token tidak valid
      }
    };

    fetchMe();
  }, [token]);

  return { user, token, login, logout };
};
