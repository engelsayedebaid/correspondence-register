import { Icons } from './Icons';

function Toast({ toasts }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          {toast.type === 'success' && Icons.check}
          {toast.type === 'error' && Icons.alertCircle}
          {toast.type === 'info' && Icons.info}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

export default Toast;
