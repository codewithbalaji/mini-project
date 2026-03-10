import { useState } from "react";
import api from "@/api/axios";
import DashboardLayout from "@/layout/DashboardLayout";

/*
  Admin can create and view departments
*/

export default function DepartmentsPage(){

  const [name,setName] = useState("");

  const createDepartment = async () => {

    try {

      await api.post("/departments",{
        name
      });

      alert("Department created");

    } catch (err) {
      alert("Error creating department");
    }
  };

  return (

    <DashboardLayout>

      <h2 className="text-xl font-bold mb-4">
        Departments
      </h2>

      <input
        placeholder="Department name"
        className="border p-2 mr-2"
        onChange={(e)=>setName(e.target.value)}
      />

      <button
        onClick={createDepartment}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Create
      </button>

    </DashboardLayout>
  );
}