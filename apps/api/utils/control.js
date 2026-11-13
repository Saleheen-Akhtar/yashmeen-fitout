export const itemPath = process.env.PUBLIC_ITEM_PATH || "/uploads/posts";

export const convertTitleUrl = (title) => {
    const remove = title.replace(/[^a-zA-Z0-9& ]/g, "");
    const makeUrl = remove.replaceAll(" ", "-").toLowerCase();
    return makeUrl;
};
