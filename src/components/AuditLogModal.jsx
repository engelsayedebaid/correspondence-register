function AuditLogModal({ onClose, logs, onClear }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '850px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">سجل العمليات الأمني (Audit Logs)</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.25rem' }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.5' }}>
            يقوم هذا السجل برصد كافة العمليات والأنشطة الأمنية الحاصلة في النظام بشكل فوري وغير قابل للتعديل لضمان الشفافية ومراقبة الوصول في المؤسسة الحكومية.
          </p>

          <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="register-table" style={{ fontSize: '0.8rem' }}>
              <thead style={{ background: '#111827' }}>
                <tr>
                  <th style={{ width: '160px' }}>التاريخ والوقت</th>
                  <th>المستخدم</th>
                  <th>الدور</th>
                  <th>الإجراء المتخذ</th>
                  <th>الجهاز / عنوان IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      لا توجد عمليات مسجلة حالياً
                    </td>
                  </tr>
                ) : (
                  [...logs].reverse().map((log, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
                      <td style={{ direction: 'ltr', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{log.timestamp}</td>
                      <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{log.username}</td>
                      <td>
                        <span className={`status-badge ${
                          log.role === 'مدير النظام' ? 'urgent' : log.role === 'مدخل بيانات' ? 'pending' : 'incoming'
                        }`} style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem' }}>
                          {log.role}
                        </span>
                      </td>
                      <td style={{ color: log.action.includes('حذف') ? 'var(--accent-rose)' : log.action.includes('دخول') ? '#6ee7b7' : '#93c5fd' }}>
                        {log.action}
                      </td>
                      <td style={{ direction: 'ltr', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{log.ip}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => {
              if (window.confirm('هل أنت متأكد من تصفير سجل العمليات بالكامل؟')) {
                onClear();
              }
            }}
            disabled={logs.length === 0}
          >
            تصفير السجل الأمني
          </button>
          
          <button className="btn btn-ghost" onClick={onClose}>
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuditLogModal;
