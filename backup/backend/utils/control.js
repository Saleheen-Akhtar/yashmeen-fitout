//export const itemPath = "http://localhost:8000/uploads/"
export const itemPath = "https://www.yfbfitoutcontracting.com/backend/uploads/posts"

export const convertTitleUrl = (title) => {
    const remove = title.replace(/[^a-zA-Z0-9& ]/g, "");
    const makeUrl = remove.replaceAll(" ", "-").toLowerCase();
    return makeUrl
}