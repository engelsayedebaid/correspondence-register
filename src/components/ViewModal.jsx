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
    const attachmentCount = Array.isArray(record.attachments) ? record.attachments.length : (record.attachments || 0);
    const text = `*تفاصيل المكاتبة رقم: ${record.registrationNumber}*

• *النوع:* ${record.type}
• *التاريخ:* ${record.registrationDate}
• *الجهة:* ${record.source}
• *ملخص المكاتبة ومضمونها:* ${record.summary}
• *المسؤول:* ${record.responsible}
• *القائد / الوحدة:* ${record.commander}
• *الحالة:* ${record.status}
• *الأولوية:* ${record.priority}
• *المرفقات:* ${attachmentCount} مرفق
• *ملاحظات:* ${record.notes || 'لا يوجد'}

_تمت المشاركة من نظام سجل الوارد والصادر الإلكتروني_`;

    // Convert data URLs to File objects for sharing
    let shareFiles = [];
    if (Array.isArray(record.attachments)) {
      shareFiles = record.attachments
        .filter(att => att.url && att.url.startsWith('data:'))
        .map(att => {
          const byteString = atob(att.url.split(',')[1]);
          const mimeType = att.url.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
          return new File([ab], att.name, { type: mimeType });
        });
    }

    const shareData = {
      title: `مكاتبة رقم ${record.registrationNumber}`,
      text: text,
    };

    // Add files if browser supports it
    if (shareFiles.length > 0 && navigator.canShare && navigator.canShare({ files: shareFiles })) {
      shareData.files = shareFiles;
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData);
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
          <div className="detail-value">
            {Array.isArray(record.attachments) && record.attachments.length > 0 ? (
              <div className="view-attachments-list">
                {record.attachments.map((file, idx) => (
                  <div key={file.id || idx} className="view-attachment-item">
                    {file.url && file.type?.includes('image') && (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="attachment-thumbnail"
                      />
                    )}
                    <span className="file-name">{file.name}</span>
                    <div className="file-actions">
                      {file.url && (
                        <>
                          <button
                            type="button"
                            className="file-preview-btn"
                            onClick={() => {
                              const win = window.open('');
                              if (file.type?.includes('image')) {
                                win.document.write(`<img src="${file.url}" style="max-width:100%;height:auto;" />`);
                              } else {
                                win.document.write(`<iframe src="${file.url}" style="width:100%;height:100%;border:none;" />`);
                              }
                              win.document.title = file.name;
                            }}
                          >
                            معاينة
                          </button>
                          <a
                            href={file.url}
                            download={file.name}
                            className="file-preview-btn"
                            style={{ textDecoration: 'none' }}
                          >
                            تحميل
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span>{typeof record.attachments === 'number' ? record.attachments : 0} مرفق</span>
            )}
          </div>
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
