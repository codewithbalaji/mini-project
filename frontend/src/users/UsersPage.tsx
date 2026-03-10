import { useEffect, useState } from "react";
import api from "@/api/axios";

/*
  Shows users in the organization
*/
export default function UsersPage(){

  const [users,setUsers] = useState([]);

  useEffect(()=>{

    const fetchUsers = async ()=>{

      const res = await api.get("/users");

      setUsers(res.data);
    };

    fetchUsers();

  },[]);

  return (

    <div>

      <h2>Users</h2>

      {users.map((u:any)=>(
        <div key={u._id}>
          {u.name} - {u.role}
        </div>
      ))}

    </div>

  );
}