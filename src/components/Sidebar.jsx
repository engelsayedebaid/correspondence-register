function Sidebar({ activeItem, onNavigate, isOpen, onClose, isAdmin }) {
  const isMobile = () => window.innerWidth <= 768;

  const handleNav = (item) => {
    onNavigate(item);
    if (isMobile()) onClose();
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-label">القائمة الرئيسية</div>
        
        <nav className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-nav-item ${activeItem === 'register' ? 'active' : ''}`}
            onClick={() => handleNav('register')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>سجل المكاتبات</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeItem === 'add-record' ? 'active' : ''}`}
            onClick={() => handleNav('add-record')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>إضافة معاملة جديدة</span>
          </button>

          {isAdmin && (
            <>
              <div className="sidebar-label" style={{ marginTop: '1.5rem' }}>الإدارة</div>
              <button
                type="button"
                className={`sidebar-nav-item ${activeItem === 'audit' ? 'active' : ''}`}
                onClick={() => handleNav('audit')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
                <span>سجل العمليات</span>
              </button>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
