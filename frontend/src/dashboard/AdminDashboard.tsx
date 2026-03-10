import DashboardLayout from "@/layout/DashboardLayout";

/*
  Admin dashboard is the main page after login.

  For Phase-1 we show simple statistics and navigation links.
  Later we will add analytics and charts.
*/

export default function AdminDashboard() {

  return (

    <DashboardLayout>

      <h1 className="text-2xl font-bold mb-6">
        Admin Dashboard
      </h1>

      {/* Simple dashboard cards */}

      <div className="grid grid-cols-3 gap-6">

        <div className="p-6 border rounded-lg shadow">
          <h3 className="text-lg font-semibold">
            Users
          </h3>
          <p className="text-gray-500">
            Manage organization members
          </p>
        </div>

        <div className="p-6 border rounded-lg shadow">
          <h3 className="text-lg font-semibold">
            Departments
          </h3>
          <p className="text-gray-500">
            Manage company departments
          </p>
        </div>

        <div className="p-6 border rounded-lg shadow">
          <h3 className="text-lg font-semibold">
            Settings
          </h3>
          <p className="text-gray-500">
            Organization configuration
          </p>
        </div>

      </div>

    </DashboardLayout>
  );
}