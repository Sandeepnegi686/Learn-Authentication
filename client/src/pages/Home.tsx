import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext.tsx";

export default function Home() {
  const { logoutUser } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="flex w-25 m-auto mt-40">
      <form action="" method="post">
        <label htmlFor="name"></label>
        <input type="text" name="name" id="name" />
        <input type="submit" value="update name" />
      </form>

      <button
        className="bg-red-500 text-white p-2 rounded-md"
        onClick={() => {
          logoutUser();
          navigate("/");
        }}
      ></button>
    </div>
  );
}
