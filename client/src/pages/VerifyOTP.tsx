import axios, { AxiosError } from "axios";
import { useCallback, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

interface VerifyOTPProps {
  VITE_SERVER_URL: string;
}

export default function VerifyOTP({ VITE_SERVER_URL }: VerifyOTPProps) {
  const [otp, setOTP] = useState("");

  const navigate = useNavigate();

  const submitHandler = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        const email = localStorage.getItem("email");
        const res = await axios.post(
          `${VITE_SERVER_URL}/api/v1/verifyOTP`,
          {
            otp,
            email,
          },
          { withCredentials: true },
        );

        if (res.data.success) {
          toast.success(res.data.message);
          localStorage.removeItem("email");
          navigate("/verifyOTP");
        } else {
          toast.error(res.data.message);
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          const errMsg =
            error?.response?.data.message || "Something went wrong";
          toast.error(errMsg);
        }
      }
    },
    [VITE_SERVER_URL, otp, navigate],
  );

  return (
    <section className="text-gray-600 body-font">
      <div className="container px-5 py-24 mx-auto flex flex-wrap items-center">
        <div className="lg:w-3/5 md:w-1/2 md:pr-16 lg:pr-0 pr-0">
          <h1 className="title-font font-medium text-3xl text-gray-900">
            Slow-carb next level shoindcgoitch ethical authentic, poko scenester
          </h1>
          <p className="leading-relaxed mt-4">
            Poke slow-carb mixtape knausgaard, typewriter street art gentrify
            hammock starladder roathse. Craies vegan tousled etsy austin.
          </p>
        </div>
        <form
          className="lg:w-2/6 md:w-1/2 bg-gray-100 rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0"
          onSubmit={submitHandler}
        >
          <h2 className="text-gray-900 text-lg font-medium title-font mb-5">
            Log In
          </h2>
          <div className="relative mb-4">
            <label htmlFor="otp" className="leading-7 text-sm text-gray-600">
              OTP
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
            />
          </div>

          <button className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg">
            Submit OTP
          </button>
          <Link className="text-xs text-gray-500 mt-3" to={"/register"}>
            Go to login page
          </Link>
        </form>
      </div>
    </section>
  );
}
