/*
  Top navigation bar used inside dashboard
*/

export default function Navbar() {

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  return (

    <header className="flex justify-between items-center p-4 border-b">

      <h2 className="font-bold">
        AI Project System
      </h2>

      <div className="flex gap-4 items-center">

        <span>{user?.name}</span>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>

      </div>

    </header>
  );
}