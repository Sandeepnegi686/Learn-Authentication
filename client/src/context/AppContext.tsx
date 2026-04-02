import { useContext } from "react";
import { APP_CONTEXT, type AppContextType } from "./AppContext";

export function useAppContext(): AppContextType {
  const context = useContext(APP_CONTEXT);
  if (!context) {
    throw new Error("Context is outside scope");
  }
  return context;
}
