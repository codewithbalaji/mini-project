import { useState } from "react";
import api from "@/api/axios";

/*
  Register Page for creating an organization + admin user.
*/
export default function RegisterPage() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    organizationName: ""
  });

  const handleSubmit = async (e: any) => {

    e.preventDefault();

    try {

      /*
        Call backend register API
      */
      const res = await api.post("/auth/register", form);

      /*
        Store JWT token
      */
      localStorage.setItem("token", res.data.token);

      /*
        Store user info
      */
      localStorage.setItem("user", JSON.stringify(res.data.user));

      /*
        Redirect to dashboard
      */
      window.location.href = "/dashboard";

    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      <input
        placeholder="Name"
        onChange={(e)=>setForm({...form,name:e.target.value})}
      />

      <input
        placeholder="Email"
        onChange={(e)=>setForm({...form,email:e.target.value})}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e)=>setForm({...form,password:e.target.value})}
      />

      <input
        placeholder="Organization"
        onChange={(e)=>setForm({...form,organizationName:e.target.value})}
      />

      <button type="submit">Register</button>

    </form>
  );
}