import { createPortal } from 'react-dom';

function Modal({
  title,
  onClose,
  children,
  footer,
  size = 'default',
  footerClass = '',
}) {
  const sizeClass = size === 'sm' ? 'modal--sm' : size === 'md' ? 'modal--md' : size === 'lg' ? 'modal--lg' : '';

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${sizeClass}`.trim()} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="إغلاق">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && (
          <div className={`modal-footer ${footerClass}`.trim()}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
