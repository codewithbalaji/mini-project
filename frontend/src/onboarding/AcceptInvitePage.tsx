import { useParams } from "react-router-dom";
import { useState } from "react";
import api from "@/api/axios";

/*
  Page for users invited by admin.
*/
export default function AcceptInvitePage(){

  const { token } = useParams();

  const [name,setName] = useState("");
  const [password,setPassword] = useState("");

  const submit = async ()=>{

    await api.post(`/invitations/accept/${token}`,{
      name,
      password
    });

    alert("Account created successfully");

    window.location.href="/login";
  };

  return (
    <div>

      <h2>Create your account</h2>

      <input
        placeholder="Name"
        onChange={(e)=>setName(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e)=>setPassword(e.target.value)}
      />

      <button onClick={submit}>
        Create Account
      </button>

    </div>
  );
}