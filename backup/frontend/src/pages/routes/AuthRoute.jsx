import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useCreateStore from "../../store";

export function AdminProtectedRoute() {
  const { user } = useCreateStore();
  if (user?.usertype !== "admin") {
    return <Navigate to="/login" />;
  }
  return <Outlet />;
}

export function PrivateRoute() {
  const { user } = useCreateStore();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return <Outlet />;
}
