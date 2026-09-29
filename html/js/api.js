const API_BASE = '/api/v1';
const TOKEN_KEY = 'access_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}

class ApiError extends Error {
  constructor(message, status, detail) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

async function parseErrorMessage(response) {
  let body = null;
  try {
    body = await response.json();
  } catch {
    return `Ошибка запроса (${response.status})`;
  }

  if (Array.isArray(body?.detail)) {
    return body.detail.map((d) => `${d.field}: ${d.message}`).join('; ');
  }

  return body?.message || `Ошибка запроса (${response.status})`;
}

async function rawFetch(path, options) {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: options.headers,
  });
}

async function refreshAccessToken() {
  const response = await rawFetch('/auth/refresh', { method: 'POST' });
  if (!response.ok) {
    return false;
  }
  const data = await response.json();
  setToken(data.access_token);
  return true;
}

export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response = await rawFetch(path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 401 && auth && getToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers.Authorization = `Bearer ${getToken()}`;
      response = await rawFetch(path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    }
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const auth = {
  register: (data) => apiFetch('/auth/register', { method: 'POST', body: data, auth: false }),
  login: async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
    setToken(data.access_token);
    return data;
  },
  me: () => apiFetch('/auth/me'),
  logout: async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      clearToken();
    }
  },
  confirmAccount: (userId, code) =>
    apiFetch(`/auth/confirm-account?user_id=${encodeURIComponent(userId)}&code=${encodeURIComponent(code)}`, {
      method: 'POST',
      auth: false,
    }),
  requestPasswordReset: (email) =>
    apiFetch('/auth/password/reset', { method: 'POST', body: { email }, auth: false }),
  changePassword: (userId, code, password, passwordConfirm) =>
    apiFetch(`/auth/password/change?user_id=${encodeURIComponent(userId)}&code=${encodeURIComponent(code)}`, {
      method: 'POST',
      body: { password, password_confirm: passwordConfirm },
      auth: false,
    }),
};

export const projects = {
  list: () => apiFetch('/projects/'),
  create: (data) => apiFetch('/projects/', { method: 'POST', body: data }),
  get: (id) => apiFetch(`/projects/${id}`),
  remove: (id) => apiFetch(`/projects/${id}`, { method: 'DELETE' }),
};

export const windows = {
  list: (projectId) => apiFetch(`/projects/${projectId}/windows/`),
  create: (projectId, data) =>
    apiFetch(`/projects/${projectId}/windows/`, { method: 'POST', body: data }),
  get: (projectId, windowId) => apiFetch(`/projects/${projectId}/windows/${windowId}`),
  remove: (projectId, windowId) =>
    apiFetch(`/projects/${projectId}/windows/${windowId}`, { method: 'DELETE' }),
  generateCode: (projectId, windowId, language) =>
    apiFetch(`/projects/${projectId}/windows/${windowId}/generate_code?language=${language}`, {
      method: 'POST',
    }),
};

export const classes = {
  list: (windowId) => apiFetch(`/windows/${windowId}/classes/`),
  create: (windowId, data) => apiFetch(`/windows/${windowId}/classes/`, { method: 'POST', body: data }),
  remove: (windowId, classId) =>
    apiFetch(`/windows/${windowId}/classes/${classId}`, { method: 'DELETE' }),
};

export const interfaces = {
  list: (windowId) => apiFetch(`/windows/${windowId}/interfaces/`),
  create: (windowId, data) =>
    apiFetch(`/windows/${windowId}/interfaces/`, { method: 'POST', body: data }),
  remove: (windowId, interfaceId) =>
    apiFetch(`/windows/${windowId}/interfaces/${interfaceId}`, { method: 'DELETE' }),
};
