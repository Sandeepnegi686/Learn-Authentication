import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/apiIntercepter";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

interface VeryfyProps {
  VITE_SERVER_URL: string;
}

export default function Verify({ VITE_SERVER_URL }: VeryfyProps) {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const params = useParams();

  useEffect(function () {
    async function verifyUser() {
      try {
        if (!params.token) {
          return null;
        }
        const { data } = await api.get(
          `${VITE_SERVER_URL}/api/v1/token/${params.token}`,
        );
        setSuccessMessage(data.message);
        toast.success(data.message);
        navigate("/");
      } catch (error) {
        if (error instanceof AxiosError) {
          setErrorMessage(error.response!.data.message);
        }
        console.log(error);
      }
    }
    verifyUser();
  }, []);

  return (
    <div className="w-25 m-auto mt-48">
      {successMessage && (
        <p className="text-green-500 text-xl">Account Verified</p>
      )}
      {errorMessage && <p className="text-red-500 text-xl">{errorMessage}</p>}
    </div>
  );
}
