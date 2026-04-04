import { useState } from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Toaster } from "react-hot-toast";
import VerifyOTP from "./pages/VerifyOTP";
import { useAppContext } from "./context/AppContext.tsx";
import Verify from "./pages/Verify.tsx";

const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL;
// console.log(VITE_SERVER_URL);

function App() {
  const [count, setCount] = useState(0);

  const { isAuth } = useAppContext();

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path={"/"}
            element={
              isAuth ? (
                <Dashboard />
              ) : (
                <Login VITE_SERVER_URL={VITE_SERVER_URL} />
              )
            }
          />
          <Route
            path={"/login"}
            element={
              isAuth ? (
                <Dashboard />
              ) : (
                <Login VITE_SERVER_URL={VITE_SERVER_URL} />
              )
            }
          />
          <Route
            path={"/register"}
            element={
              isAuth ? (
                <Dashboard />
              ) : (
                <Register VITE_SERVER_URL={VITE_SERVER_URL} />
              )
            }
          />
          <Route
            path={"/verifyOTP"}
            element={
              isAuth ? (
                <Dashboard />
              ) : (
                <VerifyOTP VITE_SERVER_URL={VITE_SERVER_URL} />
              )
            }
          />
          <Route
            path={"/token/:token"}
            element={<Verify VITE_SERVER_URL={VITE_SERVER_URL} />}
          />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
