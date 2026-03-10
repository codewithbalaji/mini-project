import { useEffect, useState } from "react";
import api from "@/api/axios";
import DashboardLayout from "@/layout/DashboardLayout";

/*
  Admin can update organization details
*/

export default function OrganizationSettings(){

  const [org,setOrg] = useState({
    name:"",
    industry:""
  });

  useEffect(()=>{

    const fetchOrg = async () => {

      const res = await api.get("/organization");

      setOrg(res.data);
    };

    fetchOrg();

  },[]);

  const updateOrg = async () => {

    await api.put("/organization",org);

    alert("Organization updated");
  };

  return (

    <DashboardLayout>

      <h2 className="text-xl font-bold mb-4">
        Organization Settings
      </h2>

      <input
        value={org.name}
        className="border p-2 mb-2 block"
        onChange={(e)=>setOrg({...org,name:e.target.value})}
      />

      <input
        value={org.industry}
        className="border p-2 mb-2 block"
        onChange={(e)=>setOrg({...org,industry:e.target.value})}
      />

      <button
        onClick={updateOrg}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Save
      </button>

    </DashboardLayout>
  );
}