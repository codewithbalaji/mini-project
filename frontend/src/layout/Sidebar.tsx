import { Link } from "react-router-dom";

/*
  Sidebar navigation used in dashboard
*/
export default function Sidebar(){

  return (

    <aside className="w-60 bg-gray-100 p-4">

      <h2 className="font-bold mb-4">
        Admin Panel
      </h2>

      <nav className="flex flex-col gap-2">

        <Link to="/dashboard">Dashboard</Link>

        <Link to="/users">Users</Link>

        <Link to="/departments">Departments</Link>

        <Link to="/settings">Settings</Link>

      </nav>

    </aside>

  );
}