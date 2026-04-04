import { useEffect, useState } from "react";
import { APP_CONTEXT, type UserType } from "./AppContext";
import api from "../lib/apiIntercepter";
import toast from "react-hot-toast";

const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL;

export function APP_PROVIDER({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  console.log(isAuth);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get(`${VITE_SERVER_URL}/api/v1/me`);
        setUser(data);
        setIsAuth(true);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, []);

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

  return (
    <APP_CONTEXT.Provider
      value={{ user, setUser, isAuth, setIsAuth, logoutUser }}
    >
      {children}
    </APP_CONTEXT.Provider>
  );
}
