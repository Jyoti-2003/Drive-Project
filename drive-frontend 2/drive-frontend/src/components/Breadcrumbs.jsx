import Icon from './Icon.jsx';

export default function Breadcrumbs({ path, onNavigate }) {
  return (
    <nav className="breadcrumbs" aria-label="Folder path">
      {path.map((crumb, i) => {
        const last = i === path.length - 1;
        return (
          <span key={`${crumb.id ?? 'root'}-${i}`} className="crumb-wrap">
            {i > 0 && (
              <span className="sep">
                <Icon name="chevron" size={18} />
              </span>
            )}
            {last ? (
              <span className="crumb current" aria-current="page">
                {crumb.name}
              </span>
            ) : (
              <button className="crumb" onClick={() => onNavigate(i)}>
                {crumb.name}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
