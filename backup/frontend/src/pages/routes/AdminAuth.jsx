import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useCreateStore from "../../store";

export default function AdminAuth() {
  const { user } = useCreateStore();

  if (user?.role !== "admin") {
    return <Navigate to="/login" />;
  }
  return <Outlet />;
}
