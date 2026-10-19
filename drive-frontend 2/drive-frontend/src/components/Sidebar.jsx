import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';

// "My Drive" works today. The others need endpoints your backend does not have yet,
// so they are shown disabled instead of pretending to work.
const NAV = [
  { id: 'drive', label: 'My Drive', icon: 'drive', enabled: true },
  { id: 'shared', label: 'Shared with me', icon: 'users' },
  { id: 'recent', label: 'Recent', icon: 'clock' },
  { id: 'starred', label: 'Starred', icon: 'star' },
  { id: 'trash', label: 'Trash', icon: 'trash' },
];

export default function Sidebar({ open, onClose, onHome, onNewFolder, onUpload, canCreateFolder }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // close the "New" menu when clicking anywhere else
  useEffect(() => {
    function close(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Without a create-folder endpoint the menu would hold a single item,
  // so the button uploads directly.
  function handleNew() {
    if (canCreateFolder) setMenuOpen((o) => !o);
    else onUpload();
  }

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Sidebar">
      <div className="brand">
        <span className="logo">
          <Icon name="drive" size={20} />
        </span>
        <span className="brand-name">Drive</span>
        <button className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu">
          <Icon name="close" />
        </button>
      </div>

      <div className="new-wrap" ref={menuRef}>
        <button
          className="btn-new"
          onClick={handleNew}
          title={canCreateFolder ? 'New' : 'Upload files'}
          aria-haspopup={canCreateFolder ? 'menu' : undefined}
          aria-expanded={canCreateFolder ? menuOpen : undefined}
        >
          <Icon name={canCreateFolder ? 'plus' : 'upload'} size={22} stroke={2.2} />
          <span className="new-label">{canCreateFolder ? 'New' : 'Upload'}</span>
        </button>

        {canCreateFolder && menuOpen && (
          <div className="menu" role="menu">
            <button
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                onNewFolder();
              }}
            >
              <Icon name="folder-plus" /> New folder
            </button>
            <button
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                onUpload();
              }}
            >
              <Icon name="upload" /> File upload
            </button>
          </div>
        )}
      </div>

      <nav className="nav" aria-label="Main">
        {NAV.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${item.enabled ? 'active' : ''}`}
            onClick={item.enabled ? onHome : undefined}
            disabled={!item.enabled}
            aria-current={item.enabled ? 'page' : undefined}
            title={item.enabled ? item.label : `${item.label} (needs backend support)`}
          >
            <Icon name={item.icon} />
            <span className="nav-label">{item.label}</span>
            {!item.enabled && <span className="soon">Soon</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
}
