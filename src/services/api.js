const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000")
  .replace(/\/$/, "");

export function getToken() {
  return localStorage.getItem("token");
}

export function saveToken(token) {
  localStorage.setItem("token", token);
}

export function removeToken() {
  localStorage.removeItem("token");
}

export function getImageUrl(path) {
  if (!path) return "";

  if (
    path.startsWith("http") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  if (path.startsWith("/uploads")) {
    return `${API_URL}${path}`;
  }

  if (path.startsWith("/")) {
    return path;
  }

  return `${API_URL}/${path}`;
}

export async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
  };

  const isFormData = options.body instanceof FormData;

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const validationDetails = Array.isArray(data?.details)
      ? data.details
          .map((detail) => `${detail.field}: ${detail.message}`)
          .join("; ")
      : "";

    throw new Error(
      data?.error ||
        data?.message ||
        validationDetails ||
        "Erro ao comunicar com a API."
    );
  }

  return data;
}

export default API_URL;
