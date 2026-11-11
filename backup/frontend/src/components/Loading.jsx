import { FaSpinner } from "react-icons/fa";

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading content"
      style={{
        minHeight: "55vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--ink)",
      }}
    >
      <FaSpinner className="animate-spin" size={28} aria-hidden="true" />
    </div>
  );
}
