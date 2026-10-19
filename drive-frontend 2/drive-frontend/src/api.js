// ---------------------------------------------------------------------------
//  All communication with your Spring Boot backend (FileController) lives here.
// ---------------------------------------------------------------------------

// Your controller has @CrossOrigin(origins = "http://localhost:3000"), so this
// frontend runs on port 3000 (see vite.config.js) and calls the backend directly.
// For a deployed build, set VITE_API_URL=https://your-server.com/api
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');

// What your backend can do today. FileController has no "create folder" or
// "rename" endpoint yet, so those buttons are hidden. After you add the
// endpoints in Java, set the flag to true and check the path below.
export const FEATURES = {
  createFolder: false,
  rename: false,
};

const ENDPOINTS = {
  // GET    /api/files/list?parentFolderId=      (omit for the root)
  list: (folderId) =>
    `/files/list${folderId ? `?parentFolderId=${encodeURIComponent(folderId)}` : ''}`,
  // POST   /api/files/upload   multipart: file, parentFolderId (optional)
  upload: '/files/upload',
  // GET    /api/files/download/{id}
  download: (id) => `/files/download/${id}`,
  // DELETE /api/files/delete/{id}
  remove: (id) => `/files/delete/${id}`,

  // --- not in your backend yet (only used when FEATURES above are true) ---
  createFolder: '/files/folder', // POST { name, parentFolderId }
  rename: (id) => `/files/rename/${id}`, // PUT { name }
};

// Maps one FileEntity from your backend to the shape the UI uses.
// FileEntity fields: id, name, path, type ("file"), size, parentFolderId, createdAt
function normalize(raw) {
  return {
    id: raw.id,
    name: raw.name ?? 'Untitled',
    isFolder: String(raw.type ?? '').toLowerCase() === 'folder',
    size: raw.size ?? 0,
    createdAt: raw.createdAt ?? null,
  };
}

// ---------------------------------------------------------------------------

function authHeaders() {
  // Your backend has no login yet. If you add JWT later, save the token with
  // localStorage.setItem('token', '...') and it is sent with every request.
  try {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      ...options,
      headers: { ...authHeaders(), ...(options.headers || {}) },
    });
  } catch {
    throw new Error(
      'Cannot reach the backend. Is Spring Boot running on http://localhost:8080?'
    );
  }

  // Your controller returns plain text for upload and delete, JSON for list.
  const text = await res.text();
  let data = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* plain text, keep it as is */
  }

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && (data.message || data.error)) ||
      (typeof data === 'string' && data.slice(0, 200)) ||
      `${res.status} ${res.statusText}`;
    throw new Error(message);
  }
  return data;
}

export async function listItems(folderId) {
  const data = await request(ENDPOINTS.list(folderId));
  const rows = Array.isArray(data) ? data : data?.content ?? [];
  return rows.map(normalize);
}

export async function uploadFile(file, folderId) {
  const form = new FormData();
  form.append('file', file);
  if (folderId) form.append('parentFolderId', folderId);
  // Do not set Content-Type: the browser adds the multipart boundary itself.
  const result = await request(ENDPOINTS.upload, { method: 'POST', body: form });

  // FileServiceStorage catches disk errors and returns "File upload failed: ..."
  // with HTTP 200, so the status alone cannot tell us it failed.
  if (typeof result === 'string' && /upload failed/i.test(result)) {
    throw new Error(result);
  }
  return result;
}

export function deleteItem(id) {
  return request(ENDPOINTS.remove(id), { method: 'DELETE' });
}

export function downloadUrl(id) {
  return BASE + ENDPOINTS.download(id);
}

// Loads a file's bytes so the app can preview it (images, PDFs, text).
export async function fetchBlob(id, signal) {
  let res;
  try {
    res = await fetch(BASE + ENDPOINTS.download(id), { headers: authHeaders(), signal });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new Error(
      'Cannot reach the backend. Is Spring Boot running on http://localhost:8080?'
    );
  }
  if (!res.ok) throw new Error(`Could not load the file (HTTP ${res.status}).`);
  return res.blob();
}

// Only used when FEATURES.createFolder / FEATURES.rename are turned on.
export function createFolder(name, parentFolderId) {
  return request(ENDPOINTS.createFolder, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, parentFolderId: parentFolderId ?? null }),
  });
}

export function renameItem(id, name) {
  return request(ENDPOINTS.rename(id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
}
