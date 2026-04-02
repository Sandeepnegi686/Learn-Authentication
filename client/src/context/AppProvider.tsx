import { useEffect, useState } from "react";
import { APP_CONTEXT, type UserType } from "./AppContext";
import api from "../lib/apiIntercepter";

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

  useEffect(() => {
    fetchUser().then((user) => {
      setUser(user);
      setIsAuth(true);
    });
  }, []);

  return (
    <APP_CONTEXT.Provider value={{ user, setUser, isAuth, setIsAuth }}>
      {children}
    </APP_CONTEXT.Provider>
  );
}
