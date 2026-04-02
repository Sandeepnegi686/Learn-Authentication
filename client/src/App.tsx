import { useState } from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Toaster } from "react-hot-toast";
import VerifyOTP from "./pages/VerifyOTP";

const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL;
console.log(VITE_SERVER_URL);

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/login"
            element={<Login VITE_SERVER_URL={VITE_SERVER_URL} />}
          />
          <Route
            path="/verifyOTP"
            element={<VerifyOTP VITE_SERVER_URL={VITE_SERVER_URL} />}
          />
          <Route
            path="/register"
            element={<Register VITE_SERVER_URL={VITE_SERVER_URL} />}
          />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
