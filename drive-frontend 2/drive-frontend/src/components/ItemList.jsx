import { useState } from 'react';
import Icon from './Icon.jsx';
import { downloadUrl } from '../api.js';
import { formatDate, formatSize, kindOf } from '../utils.js';

function Actions({ item, canRename, onDownload, onRename, onDelete }) {
  return (
    <div
      className="actions"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {!item.isFolder && (
        <button
          className="icon-btn sm"
          title="Download"
          aria-label={`Download ${item.name}`}
          onClick={() => onDownload(item)}
        >
          <Icon name="download" size={17} />
        </button>
      )}
      {canRename && (
        <button
          className="icon-btn sm"
          title="Rename"
          aria-label={`Rename ${item.name}`}
          onClick={() => onRename(item)}
        >
          <Icon name="edit" size={17} />
        </button>
      )}
      <button
        className="icon-btn sm danger"
        title="Delete"
        aria-label={`Delete ${item.name}`}
        onClick={() => onDelete(item)}
      >
        <Icon name="trash" size={17} />
      </button>
    </div>
  );
}

// Image files show a real thumbnail (loaded from the download endpoint);
// everything else, or an image that fails to load, shows a coloured icon.
function Thumb({ item, kind }) {
  const [failed, setFailed] = useState(false);
  if (kind.key === 'image' && !failed) {
    return (
      <img
        className="thumb-img"
        src={downloadUrl(item.id)}
        alt=""
        loading="lazy"
        draggable={false}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <span className="thumb-icon">
      <Icon name={kind.icon} size={34} stroke={1.6} />
    </span>
  );
}

export default function ItemList({
  items,
  view,
  selectedId,
  onSelect,
  onOpen,
  canRename,
  onDownload,
  onRename,
  onDelete,
}) {
  const folders = items.filter((i) => i.isFolder);
  const files = items.filter((i) => !i.isFolder);
  const actionProps = { canRename, onDownload, onRename, onDelete };

  // Folders open on click, files get selected.
  function activate(item, e) {
    e.stopPropagation();
    if (item.isFolder) onOpen(item);
    else onSelect(item.id);
  }

  function onKeyDown(item, e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activate(item, e);
    }
  }

  if (view === 'list') {
    return (
      <div className="table-wrap">
        <table className="list">
          <thead>
            <tr>
              <th>Name</th>
              <th className="col-date">Uploaded</th>
              <th>Size</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {[...folders, ...files].map((item) => {
              const kind = kindOf(item);
              return (
                <tr
                  key={item.id}
                  className={`kind-${kind.key} ${selectedId === item.id ? 'selected' : ''}`}
                  tabIndex={0}
                  onClick={(e) => activate(item, e)}
                  onKeyDown={(e) => onKeyDown(item, e)}
                >
                  <td className="name-cell">
                    <div className="name-line">
                      <span className="kind-badge">
                        <Icon name={kind.icon} size={19} />
                      </span>
                      <span className="card-name" title={item.name}>
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="col-date muted">{formatDate(item.createdAt)}</td>
                  <td className="muted">{item.isFolder ? '—' : formatSize(item.size)}</td>
                  <td>
                    <Actions item={item} {...actionProps} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      {folders.length > 0 && (
        <>
          <h3 className="section-title">Folders</h3>
          <div className="grid">
            {folders.map((item) => {
              const kind = kindOf(item);
              return (
                <div
                  key={item.id}
                  className={`card folder kind-${kind.key}`}
                  tabIndex={0}
                  onClick={(e) => activate(item, e)}
                  onKeyDown={(e) => onKeyDown(item, e)}
                >
                  <span className="kind-badge">
                    <Icon name="folder" size={20} />
                  </span>
                  <span className="card-text">
                    <span className="card-name" title={item.name}>
                      {item.name}
                    </span>
                  </span>
                  <Actions item={item} {...actionProps} />
                </div>
              );
            })}
          </div>
        </>
      )}

      {files.length > 0 && (
        <>
          <h3 className="section-title">Files</h3>
          <div className="grid">
            {files.map((item) => {
              const kind = kindOf(item);
              return (
                <div
                  key={item.id}
                  className={`card file kind-${kind.key} ${selectedId === item.id ? 'selected' : ''}`}
                  tabIndex={0}
                  onClick={(e) => activate(item, e)}
                  onKeyDown={(e) => onKeyDown(item, e)}
                  aria-pressed={selectedId === item.id}
                >
                  <div className="card-preview">
                    <Thumb item={item} kind={kind} />
                    <Actions item={item} {...actionProps} />
                  </div>
                  <div className="card-foot">
                    <span className="kind-badge">
                      <Icon name={kind.icon} size={18} />
                    </span>
                    <span className="card-text">
                      <span className="card-name" title={item.name}>
                        {item.name}
                      </span>
                      <span className="meta">
                        {formatSize(item.size)}
                        <span className="meta-date"> · {formatDate(item.createdAt)}</span>
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
