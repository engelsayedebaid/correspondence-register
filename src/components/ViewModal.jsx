import Modal from './ui/Modal';
import Button from './ui/Button';
import Badge from './ui/Badge';

function getClassificationVariant(classification) {
  if (classification === 'سري للغاية') return 'top-secret';
  if (classification === 'سري') return 'secret';
  if (classification === 'محدود') return 'restricted';
  return 'public';
}

function ViewModal({ record, onClose, onEdit }) {
  const handleShare = async () => {
    const text = `*تفاصيل المكاتبة رقم: ${record.registrationNumber}*

• *النوع:* ${record.type}
• *التاريخ:* ${record.registrationDate}
• *الجهة:* ${record.source}
• *ملخص المكاتبة ومضمونها:* ${record.summary}
• *المسؤول:* ${record.responsible}
• *القائد / الوحدة:* ${record.commander}
• *الحالة:* ${record.status}
• *الأولوية:* ${record.priority}
• *المرفقات:* ${record.attachments} مرفق
• *ملاحظات:* ${record.notes || 'لا يوجد'}

_تمت المشاركة من نظام سجل الوارد والصادر الإلكتروني_`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `مكاتبة رقم ${record.registrationNumber}`, text });
      } catch {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
      }
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const statusVariant = record.status === 'مكتمل' ? 'completed' : record.status === 'عاجل' ? 'urgent' : 'pending';
  const priorityClass = record.priority === 'عالي' ? 'high' : record.priority === 'متوسط' ? 'medium' : 'low';

  const footer = (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {onEdit && (
          <Button variant="success" onClick={() => onEdit(record)}>
            تعديل المعاملة
          </Button>
        )}
        <Button variant="secondary" onClick={handleShare}>
          مشاركة المعاملة
        </Button>
      </div>
      <Button variant="ghost" onClick={onClose}>
        إغلاق
      </Button>
    </>
  );

  return (
    <Modal
      title={`تفاصيل المعاملة — ${record.id}`}
      onClose={onClose}
      size="md"
      footer={footer}
      footerClass="modal-footer--between"
    >
      <div className="view-detail-list">
        <div className="view-detail-section">المعلومات الأساسية</div>

        <div className="detail-row">
          <span className="detail-label">رقم القيد</span>
          <span className="detail-value detail-value--accent">{record.registrationNumber}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">التاريخ</span>
          <span className="detail-value" style={{ direction: 'ltr' }}>{record.registrationDate}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">النوع</span>
          <span className="detail-value">
            <Badge variant={record.type === 'وارد' ? 'incoming' : 'outgoing'}>{record.type}</Badge>
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">الجهة</span>
          <span className="detail-value">{record.source}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">الدرجة السرية</span>
          <span className="detail-value">
            <Badge variant={getClassificationVariant(record.classification)}>
              {record.classification || 'عام'}
            </Badge>
          </span>
        </div>

        <div className="view-detail-section">موضوع المكاتبة</div>
        <div className="detail-row">
          <span className="detail-label">الملخص</span>
          <span className="detail-value detail-value--block">{record.summary}</span>
        </div>

        <div className="view-detail-section">التكليف والمتابعة</div>
        <div className="detail-row">
          <span className="detail-label">المسؤول</span>
          <span className="detail-value">
            <span className="responsible-person">
              <span className="responsible-avatar c1">{record.responsible.split(' ')[0][0]}</span>
              {record.responsible}
            </span>
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">القائد / الوحدة</span>
          <span className="detail-value">{record.commander}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">الحالة</span>
          <span className="detail-value">
            <Badge variant={statusVariant}>{record.status}</Badge>
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">الأولوية</span>
          <span className="detail-value">
            <span className={`priority-dot ${priorityClass}`} style={{ marginLeft: '0.5rem' }} />
            {record.priority}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">المرفقات</span>
          <span className="detail-value">{record.attachments} مرفق</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">ملاحظات</span>
          <span className="detail-value" style={{ color: record.notes ? undefined : 'var(--text-muted)' }}>
            {record.notes || 'لا توجد ملاحظات'}
          </span>
        </div>
      </div>
    </Modal>
  );
}

export default ViewModal;
