function Sidebar({ activeItem, onNavigate, isOpen, onClose, isAdmin }) {
  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-label">القائمة الرئيسية</div>
        <button
          type="button"
          className={`sidebar-nav-item ${activeItem === 'register' ? 'active' : ''}`}
          onClick={() => { onNavigate('register'); onClose(); }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          سجل المعاملات
        </button>
        {isAdmin && (
          <button
            type="button"
            className={`sidebar-nav-item ${activeItem === 'audit' ? 'active' : ''}`}
            onClick={() => { onNavigate('audit'); onClose(); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            سجل العمليات
          </button>
        )}
      </aside>
    </>
  );
}

export default Sidebar;
