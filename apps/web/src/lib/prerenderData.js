export const getPrerenderData = () => globalThis.__YASHMEEN_PRERENDER__ || {};

export const getPrerenderProject = (id) => {
  const data = getPrerenderData();
  if (data.project && String(data.project._id) === String(id)) return data.project;
  return (data.projects || []).find((project) => String(project._id) === String(id)) || null;
};

export const getPrerenderPost = (id) => {
  const data = getPrerenderData();
  if (data.post && String(data.post._id) === String(id)) return data.post;
  return (data.posts || []).find((post) => String(post._id) === String(id)) || null;
};
