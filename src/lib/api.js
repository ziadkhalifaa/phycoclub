const API_BASE = import.meta.env.VITE_API_URL || "";

async function request(path, { method = "GET", body, headers } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const err = new Error(data?.error || "REQUEST_FAILED");
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

export const api = {
  me: () => request("/api/me"),
  login: (email, password) => request("/api/auth/login", { method: "POST", body: { email, password } }),
  register: (payload) => request("/api/auth/register", { method: "POST", body: payload }),
  logout: () => request("/api/auth/logout", { method: "POST" }),

  listCourses: (limit) => request(`/api/courses${limit ? `?limit=${limit}` : ""}`),
  getCourse: (id) => request(`/api/courses/${id}`),
  enroll: (courseId) => request(`/api/courses/${courseId}/enroll`, { method: "POST" }),
  getLesson: (courseId, lessonId) => request(`/api/courses/${courseId}/lesson/${lessonId}`),

  listArticles: (limit) => request(`/api/articles${limit ? `?limit=${limit}` : ""}`),
  getArticle: (id) => request(`/api/articles/${id}`),

  // Admin: articles
  createArticle: (payload) => request(`/api/articles`, { method: "POST", body: payload }),
  updateArticle: (id, payload) => request(`/api/articles/${id}`, { method: "PUT", body: payload }),
  deleteArticle: (id) => request(`/api/articles/${id}`, { method: "DELETE" }),

  // Admin: courses
  createCourse: (payload) => request(`/api/courses`, { method: "POST", body: payload }),
  updateCourse: (id, payload) => request(`/api/courses/${id}`, { method: "PUT", body: payload }),
  deleteCourse: (id) => request(`/api/courses/${id}`, { method: "DELETE" }),

  createSection: (courseId, payload) => request(`/api/courses/${courseId}/sections`, { method: "POST", body: payload }),
  deleteSection: (courseId, sectionId) => request(`/api/courses/${courseId}/sections/${sectionId}`, { method: "DELETE" }),

  createLesson: (courseId, payload) => request(`/api/courses/${courseId}/lessons`, { method: "POST", body: payload }),
  deleteLesson: (courseId, lessonId) => request(`/api/courses/${courseId}/lessons/${lessonId}`, { method: "DELETE" }),

  // Admin: users / roles
  adminListUsers: () => request(`/api/admin/users`),
  adminSetRole: (userId, role) => request(`/api/admin/users/${userId}`, { method: "PATCH", body: { role } }),
};
