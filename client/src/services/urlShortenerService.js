import API from "./api.js";

export async function shortenUrl({ url, customSlug, expiresIn }) {
  const { data } = await API.post("/urls/shorten", {
    url,
    customSlug: customSlug || undefined,
    expiresIn:  expiresIn  || "never",
  });
  return data;
}

export async function getUrlInfo(slug) {
  const { data } = await API.get(`/urls/info/${slug}`);
  return data;
}
