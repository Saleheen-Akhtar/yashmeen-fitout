import { Navigate, Outlet, useLocation } from "react-router-dom";
import useCreateStore from "../store/index";

export function AdminProtectedRoute() {
  const location = useLocation();
  const { user } = useCreateStore();
  if (import.meta.env.DEV && location.search.includes("preview=dashboard")) return <Outlet />;
  if (user?.usertype !== "admin") {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export function PrivateRoute() {
  const location = useLocation();
  const { user } = useCreateStore();
  if (import.meta.env.DEV && location.search.includes("preview=dashboard")) return <Outlet />;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
