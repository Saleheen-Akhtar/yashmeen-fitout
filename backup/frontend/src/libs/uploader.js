export function CustomUploadAdapterPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
        return new UploadAdapter(loader);
    };
}

export class UploadAdapter {
    constructor(loader) {
        this.loader = loader;
    }
    async upload() {
        const data = new FormData();

        data.append("upload", await this.loader.file);
        const uploadUrl = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL)
            ? `${import.meta.env.VITE_API_URL}/upload`
            : "/api/upload";
        const response = await fetch(uploadUrl, {
            method: "POST",
            body: data,
        });

        const res = await response.json();
        return { default: res.url };
    }

    abort() { }
}
