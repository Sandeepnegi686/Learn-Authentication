import { useEffect, useState } from "react";
import { APP_CONTEXT, type UserType } from "./AppContext";
import api from "../lib/apiIntercepter";
import toast from "react-hot-toast";

const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL;

export function APP_PROVIDER({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [isAuth, setIsAuth] = useState(false);

  async function fetchUser() {
    try {
      const { data } = await api.get(`${VITE_SERVER_URL}/api/v1/me`);
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async function logoutUser() {
    try {
      const { data } = await api.post("/api/v1/logout");
      toast.success(data.message);
      setIsAuth(false);
    } catch (error) {
      console.log(error);
      toast.error("something went wrong");
    }
  }

  useEffect(() => {
    fetchUser().then((user) => {
      setUser(user);
      setIsAuth(true);
    });
  }, []);

  return (
    <APP_CONTEXT.Provider
      value={{ user, setUser, isAuth, setIsAuth, logoutUser }}
    >
      {children}
    </APP_CONTEXT.Provider>
  );
}
