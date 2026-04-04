import { use, useState } from "react";
import { useAppContext } from "../context/AppContext.tsx";
import toast from "react-hot-toast";

const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL;

export default function Dashboard() {
  const { logoutUser, user } = useAppContext();
  const [name, setName] = useState("");
  console.log(user);
  async function updateName(e) {
    e.preventDefault();

    try {
      const res = await fetch(`${VITE_SERVER_URL}/api/v1/update-name`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      toast.success(data.message);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="flex flex-col w-25 m-auto mt-40">
      <form action="" method="post" className="" onSubmit={updateName}>
        <label htmlFor="name"></label>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          id="name"
          className="border border-blue-300"
        />
        <input type="submit" value="update name" />
      </form>
      <button className="bg-red-500 text-white mt-25" onClick={logoutUser}>
        Logout
      </button>
    </div>
  );
}
