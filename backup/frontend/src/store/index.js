import { create } from 'zustand';

const useCreateStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")),

  setCredentials: (user) => set({ user }),
  //singOut: () => set({ user: null }),
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null });
  }
}));

export default useCreateStore;

