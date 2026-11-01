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
        // https://www.yfbfitoutcontracting.com/api/upload
        // http://localhost:8000/api/upload
        const response = await fetch("https://www.yfbfitoutcontracting.com/api/upload", {
            method: "POST",
            body: data,
        });

        const res = await response.json();
        return { default: res.url };
    }

    abort() { }
}