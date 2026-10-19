import { useCallback, useEffect, useRef, useState } from 'react';
import * as api from './api.js';
import Icon from './components/Icon.jsx';
import Sidebar from './components/Sidebar.jsx';
import Breadcrumbs from './components/Breadcrumbs.jsx';
import ItemList from './components/ItemList.jsx';
import PromptModal from './components/PromptModal.jsx';

const ROOT = { id: null, name: 'My Drive' };

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* storage can be blocked, fall through */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [path, setPath] = useState([ROOT]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [view, setView] = useState('grid');
  const [theme, setTheme] = useState(getInitialTheme);
  const [selectedId, setSelectedId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState(null); // { type: 'folder' } | { type: 'rename', item }
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef(null);
  const dragDepth = useRef(0);

  const current = path[path.length - 1];

  // ---- theme ----
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  // ---- Escape clears the selection and closes the mobile menu ----
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        setSelectedId(null);
        setSidebarOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await api.listItems(current.id));
    } catch (e) {
      setItems([]);
      setError(`Could not load files: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [current.id]);

  useEffect(() => {
    load();
  }, [load]);

  // Run an action, show errors, then refresh the list
  async function run(label, action) {
    setError('');
    setBusy(label);
    try {
      await action();
      await load();
    } catch (e) {
      setError(`${label} failed: ${e.message}`);
    } finally {
      setBusy('');
    }
  }

  function openFolder(item) {
    setQuery('');
    setSelectedId(null);
    // ignore a second click on the same folder while the list is still reloading
    setPath((p) =>
      p[p.length - 1].id === item.id ? p : [...p, { id: item.id, name: item.name }]
    );
  }

  function goTo(index) {
    setQuery('');
    setSelectedId(null);
    setSidebarOpen(false);
    setPath((p) => p.slice(0, index + 1));
  }

  function createFolder(name) {
    setModal(null);
    run('Creating folder', () => api.createFolder(name, current.id));
  }

  function renameItem(item, name) {
    setModal(null);
    if (name === item.name) return;
    run('Renaming', () => api.renameItem(item.id, name));
  }

  function deleteItem(item) {
    const what = item.isFolder ? 'folder and everything in it' : 'file';
    if (!window.confirm(`Delete "${item.name}"? This ${what} will be removed.`)) return;
    run('Deleting', () => api.deleteItem(item.id));
  }

  function downloadItem(item) {
    const a = document.createElement('a');
    a.href = api.downloadUrl(item.id);
    a.download = item.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function pickFiles() {
    setSidebarOpen(false);
    fileInput.current?.click();
  }

  function uploadFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    run(`Uploading ${files.length} file${files.length > 1 ? 's' : ''}`, async () => {
      for (const file of files) {
        await api.uploadFile(file, current.id);
      }
    });
  }

  // ---- drag & drop upload ----
  function onDragEnter(e) {
    if (!e.dataTransfer?.types?.includes('Files')) return;
    e.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  }
  function onDragLeave() {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }
  function onDrop(e) {
    e.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    uploadFiles(e.dataTransfer.files);
  }

  const visible = query.trim()
    ? items.filter((i) => i.name.toLowerCase().includes(query.trim().toLowerCase()))
    : items;

  return (
    <div className="app">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onHome={() => goTo(0)}
        canCreateFolder={api.FEATURES.createFolder}
        onNewFolder={() => {
          setSidebarOpen(false);
          setModal({ type: 'folder' });
        }}
        onUpload={pickFiles}
      />
      {sidebarOpen && <div className="scrim" onClick={() => setSidebarOpen(false)} />}

      <input
        ref={fileInput}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          uploadFiles(e.target.files);
          e.target.value = ''; // allow choosing the same file again
        }}
      />

      <main
        className={`main ${dragging ? 'dragging' : ''}`}
        onDragEnter={onDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <header className="topbar">
          <button
            className="icon-btn menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Icon name="menu" />
          </button>

          <div className="search">
            <Icon name="search" size={19} />
            <input
              type="search"
              placeholder="Search in this folder"
              aria-label="Search in this folder"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className="icon-btn sm"
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >
                <Icon name="close" size={16} />
              </button>
            )}
          </div>

          <div className="toolbar-end">
            <div className="segmented" role="group" aria-label="Layout">
              <button
                className={view === 'grid' ? 'on' : ''}
                onClick={() => setView('grid')}
                title="Grid view"
                aria-label="Grid view"
                aria-pressed={view === 'grid'}
              >
                <Icon name="grid" size={18} />
              </button>
              <button
                className={view === 'list' ? 'on' : ''}
                onClick={() => setView('list')}
                title="List view"
                aria-label="List view"
                aria-pressed={view === 'list'}
              >
                <Icon name="list" size={18} />
              </button>
            </div>

            <button
              className="icon-btn"
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
            </button>
          </div>
        </header>

        <div className="page-head">
          <Breadcrumbs path={path} onNavigate={goTo} />
          {!loading && items.length > 0 && (
            <span className="count">
              {visible.length} {visible.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {error && (
          <div className="banner error" role="alert">
            <Icon name="alert" size={18} />
            <span>{error}</span>
            <button className="icon-btn sm" onClick={() => setError('')} aria-label="Dismiss">
              <Icon name="close" size={16} />
            </button>
          </div>
        )}
        {busy && (
          <div className="banner info" role="status">
            <span className="spinner" />
            <span>{busy}…</span>
          </div>
        )}

        <section className="content" onClick={() => setSelectedId(null)}>
          {loading && !items.length ? (
            <div className="empty">
              <span className="spinner" />
              <p>Loading…</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="empty">
              <div className="empty-badge">
                <Icon name={query ? 'search' : 'upload'} size={40} stroke={1.5} />
              </div>
              {query ? (
                <>
                  <h2>No matches</h2>
                  <p>Nothing in this folder matches “{query.trim()}”.</p>
                </>
              ) : (
                <>
                  <h2>Drop files here</h2>
                  <p>Or use the button below to upload files to this folder.</p>
                  <button className="btn-primary" onClick={pickFiles}>
                    Upload files
                  </button>
                </>
              )}
            </div>
          ) : (
            <ItemList
              items={visible}
              view={view}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onOpen={openFolder}
              canRename={api.FEATURES.rename}
              onDownload={downloadItem}
              onRename={(item) => setModal({ type: 'rename', item })}
              onDelete={deleteItem}
            />
          )}
        </section>

        {dragging && (
          <div className="drop-overlay">
            <div className="drop-card">
              <Icon name="upload" size={34} />
              <strong>Drop to upload</strong>
              <span>to “{current.name}”</span>
            </div>
          </div>
        )}
      </main>

      {modal?.type === 'folder' && (
        <PromptModal
          title="New folder"
          label="Folder name"
          initial="Untitled folder"
          confirmText="Create"
          onSubmit={createFolder}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'rename' && (
        <PromptModal
          title="Rename"
          label="New name"
          initial={modal.item.name}
          confirmText="OK"
          onSubmit={(name) => renameItem(modal.item, name)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
