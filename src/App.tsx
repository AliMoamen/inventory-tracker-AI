import { useEffect, useState } from "react";
import "./styles/App.scss";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard.tsx";
import { onAuthStateChanged, User } from "firebase/auth";
import { UserContext } from "./Context/UserContext.ts";
import { auth } from "./config/firebase.ts";
function App() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  });
  const [showForm, setShowForm] = useState(false);
  const [camera, setCamera] = useState(false)
  return (
    <UserContext.Provider value={{ user, setUser, showForm, setShowForm, camera, setCamera }}>
      {user ? <Dashboard /> : <Home />}
    </UserContext.Provider>
  );
}

export default App;
