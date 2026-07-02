import Modal from './ui/Modal';
import Button from './ui/Button';
import Badge from './ui/Badge';

function getRoleVariant(role) {
  if (role === 'مدير النظام') return 'urgent';
  if (role === 'مدخل بيانات') return 'pending';
  return 'incoming';
}

function getActionClass(action) {
  if (action.includes('حذف')) return 'log-action--danger';
  if (action.includes('دخول')) return 'log-action--success';
  return 'log-action--info';
}

function AuditLogModal({ onClose, logs, onClear }) {
  const footer = (
    <>
      <Button
        variant="danger"
        size="sm"
        onClick={() => {
          if (window.confirm('هل أنت متأكد من تصفير سجل العمليات بالكامل؟')) {
            onClear();
          }
        }}
        disabled={logs.length === 0}
      >
        تصفير السجل
      </Button>
      <Button variant="ghost" onClick={onClose}>
        إغلاق
      </Button>
    </>
  );

  return (
    <Modal
      title="سجل العمليات الأمني"
      onClose={onClose}
      size="lg"
      footer={footer}
      footerClass="modal-footer--between"
    >
      <p className="audit-description">
        يقوم هذا السجل برصد كافة العمليات والأنشطة الأمنية في النظام بشكل فوري لضمان الشفافية ومراقبة الوصول.
      </p>

      <div className="audit-table-wrap">
        <table className="audit-table">
          <thead>
            <tr>
              <th style={{ width: '160px' }}>التاريخ والوقت</th>
              <th>المستخدم</th>
              <th>الدور</th>
              <th>الإجراء</th>
              <th>عنوان IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="audit-empty">
                  لا توجد عمليات مسجلة حالياً
                </td>
              </tr>
            ) : (
              [...logs].reverse().map((log, index) => (
                <tr key={index}>
                  <td style={{ direction: 'ltr', color: 'var(--text-muted)' }}>{log.timestamp}</td>
                  <td style={{ fontWeight: 600 }}>{log.username}</td>
                  <td>
                    <Badge variant={getRoleVariant(log.role)}>{log.role}</Badge>
                  </td>
                  <td className={getActionClass(log.action)}>{log.action}</td>
                  <td style={{ direction: 'ltr', color: 'var(--text-muted)' }}>{log.ip}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}

export default AuditLogModal;
