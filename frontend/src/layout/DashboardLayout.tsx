import Sidebar from "./Sidebar";

/*
  Layout used across dashboard pages.
*/
export default function DashboardLayout({children}:any){

  return (

    <div className="flex min-h-screen">

      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 p-6">

        {children}

      </main>

    </div>

  );
}