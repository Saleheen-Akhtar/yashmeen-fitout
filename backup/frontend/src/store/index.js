import { create } from "zustand";

function readStoredUser() {
  try {
    const raw =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    try {
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
    } catch {
      /* ignore */
    }
    return null;
  }
}

const useCreateStore = create((set) => ({
  user: readStoredUser(),

  setCredentials: (user) => set({ user }),
  logout: () => {
    try {
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
    } catch {
      /* ignore */
    }
    set({ user: null });
  },
}));

export default useCreateStore;
