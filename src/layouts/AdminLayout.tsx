import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function AdminLayout() {
  const { logout, auth } = useAuth();

  return (
    <div style={{ padding: 20 }}>
      <nav style={{ display: "flex", gap: 15 }}>
        <NavLink to="/">Dashboard</NavLink>

        {auth.role === "admin" && (
          <>
            <NavLink to="/users">Users</NavLink>
            <NavLink to="/settings">Settings</NavLink>
          </>
        )}

        <button onClick={logout}>Logout</button>
      </nav>

      <hr />
      <Outlet />
    </div>
  );
}
