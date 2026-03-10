import { createContext, useState, useEffect } from "react";

/*
  Type definition for TypeScript.
*/
interface AuthContextType {
  user: any;
  setUser: (user: any) => void;
}

/*
  Create React context for authentication.
*/
export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {}
});

/*
  Provider component that wraps the app.
*/
export const AuthProvider = ({ children }: any) => {

  const [user, setUser] = useState(null);

  /*
    Restore session when app loads.
    If user exists in localStorage we load it.
  */
  useEffect(() => {

    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};