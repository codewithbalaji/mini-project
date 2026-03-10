import { useState } from "react";
import api from "@/api/axios";

/*
  Admin invites new users to organization
*/

export default function InviteUserDialog(){

  const [email,setEmail] = useState("");
  const [role,setRole] = useState("EMPLOYEE");

  const inviteUser = async () => {

    try {

      await api.post("/invitations/invite",{
        email,
        role
      });

      alert("Invitation sent successfully");

    } catch (error) {
      alert("Failed to invite user");
    }
  };

  return (

    <div className="border p-4 rounded">

      <h3 className="font-bold mb-2">
        Invite User
      </h3>

      <input
        placeholder="Email"
        className="border p-2 w-full mb-2"
        onChange={(e)=>setEmail(e.target.value)}
      />

      <select
        className="border p-2 w-full mb-2"
        onChange={(e)=>setRole(e.target.value)}
      >
        <option value="EMPLOYEE">Employee</option>
        <option value="MANAGER">Manager</option>
      </select>

      <button
        onClick={inviteUser}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Send Invite
      </button>

    </div>
  );
}