import { useAppContext } from "../context/AppContext.tsx";

export default function Dashboard() {
  const { logoutUser } = useAppContext();
  return (
    <div className="flex w-25 m-auto mt-40">
      <button className="bg-red-500 text-white" onClick={logoutUser}>
        Logout
      </button>
    </div>
  );
}
