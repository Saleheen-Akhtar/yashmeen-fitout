export function CustomUploadAdapterPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
    return new UploadAdapter(loader);
  };
}

function readStoredToken() {
  try {
    const raw =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return parsed?.token || parsed?.data?.token || "";
  } catch {
    return "";
  }
}

export class UploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }

  async upload() {
    const data = new FormData();
    data.append("upload", await this.loader.file);

    const uploadUrl =
      typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/upload`
        : "/api/upload";

    const token = readStoredToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers,
      body: data,
    });

    const res = await response.json().catch(() => ({}));
    if (!response.ok || !res?.url) {
      throw new Error(res?.message || `Upload failed (${response.status})`);
    }

    return { default: res.url };
  }

  abort() {}
}
