export function formatSize(bytes) {
  if (!bytes) return '—';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(value) {
  if (!value) return '—';
  // Spring can send a LocalDateTime as an array: [year, month, day, hour, min, sec]
  const d = Array.isArray(value)
    ? new Date(value[0], value[1] - 1, value[2], value[3] || 0, value[4] || 0, value[5] || 0)
    : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// File type groups. `key` becomes a CSS class (kind-<key>) that sets the accent colour.
const GROUPS = [
  { key: 'image', icon: 'image', label: 'Image', exts: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'avif'] },
  { key: 'pdf', icon: 'file-text', label: 'PDF', exts: ['pdf'] },
  { key: 'doc', icon: 'file-text', label: 'Document', exts: ['doc', 'docx', 'txt', 'md', 'rtf', 'odt'] },
  { key: 'sheet', icon: 'table', label: 'Spreadsheet', exts: ['xls', 'xlsx', 'csv', 'ods'] },
  { key: 'slides', icon: 'slides', label: 'Presentation', exts: ['ppt', 'pptx', 'odp'] },
  { key: 'video', icon: 'film', label: 'Video', exts: ['mp4', 'mov', 'avi', 'mkv', 'webm'] },
  { key: 'audio', icon: 'music', label: 'Audio', exts: ['mp3', 'wav', 'flac', 'm4a', 'ogg'] },
  { key: 'archive', icon: 'archive', label: 'Archive', exts: ['zip', 'rar', '7z', 'tar', 'gz'] },
  {
    key: 'code',
    icon: 'code',
    label: 'Code',
    exts: ['js', 'jsx', 'ts', 'tsx', 'java', 'py', 'html', 'css', 'json', 'xml', 'sql', 'yml', 'yaml'],
  },
];

const FOLDER_KIND = { key: 'folder', icon: 'folder', label: 'Folder' };
const OTHER_KIND = { key: 'other', icon: 'file', label: 'File' };

export function kindOf(item) {
  if (item.isFolder) return FOLDER_KIND;
  const dot = item.name.lastIndexOf('.');
  const ext = dot > -1 ? item.name.slice(dot + 1).toLowerCase() : '';
  return GROUPS.find((g) => g.exts.includes(ext)) ?? OTHER_KIND;
}
