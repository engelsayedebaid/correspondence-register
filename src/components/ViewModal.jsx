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
        await navigator.share({
          title: `مكاتبة رقم ${record.registrationNumber}`,
          text: text,
        });
      } catch (err) {
        // user cancelled or share failed, fallback to whatsapp link
        openWhatsAppFallback(text);
      }
    } else {
      openWhatsAppFallback(text);
    }
  };

  const openWhatsAppFallback = (text) => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">تفاصيل المعاملة — {record.id}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="view-detail-grid">
            
            {/* Section 1: Basic Info */}
            <div className="view-detail-section-title">المعلومات الأساسية</div>
            
            <div className="detail-item">
              <span className="detail-label">رقم القيد</span>
              <span className="detail-value" style={{ fontWeight: 700, color: 'var(--text-accent)' }}>
                {record.registrationNumber}
              </span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">التاريخ</span>
              <span className="detail-value" style={{ direction: 'ltr', textAlign: 'right' }}>
                {record.registrationDate}
              </span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">النوع</span>
              <div className="detail-value" style={{ display: 'inline-flex', padding: '0.4rem 0.6rem' }}>
                <span className={`status-badge ${record.type === 'وارد' ? 'incoming' : 'outgoing'}`}>
                  {record.type === 'وارد' ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                      <line x1="17" y1="7" x2="7" y2="17" /><polyline points="17 17 7 17 7 7" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                      <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
                    </svg>
                  )}
                  {record.type}
                </span>
              </div>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">الجهة المرسلة / الواردة</span>
              <span className="detail-value">{record.source}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">الدرجة السرية</span>
              <div className="detail-value" style={{ display: 'inline-flex', padding: '0.4rem 0.6rem' }}>
                <span className={`classification-badge ${
                  record.classification === 'سري للغاية' ? 'top-secret' : record.classification === 'سري' ? 'secret' : record.classification === 'محدود' ? 'restricted' : 'public'
                }`}>
                  {record.classification || 'عام'}
                </span>
              </div>
            </div>

            {/* Section 2: Summary */}
            <div className="view-detail-section-title">موضوع المكاتبة</div>
            
            <div className="detail-item full-width">
              <span className="detail-label">ملخص المكاتبة الواردة ومضمونها</span>
              <div className="detail-value" style={{ lineHeight: '1.6', background: 'rgba(30, 41, 59, 0.25)', minHeight: '60px' }}>
                {record.summary}
              </div>
            </div>

            {/* Section 3: Responsibilities */}
            <div className="view-detail-section-title">التكليف والمتابعة</div>
            
            <div className="detail-item">
              <span className="detail-label">المسؤول</span>
              <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="responsible-avatar" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}>
                  {record.responsible.split(' ')[0][0]}
                </span>
                <span style={{ fontWeight: 600 }}>{record.responsible}</span>
              </div>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">القائد / الوحدة</span>
              <span className="detail-value">{record.commander}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">الحالة</span>
              <div className="detail-value" style={{ display: 'inline-flex', padding: '0.4rem 0.6rem' }}>
                <span className={`status-badge ${
                  record.status === 'مكتمل' ? 'completed' : record.status === 'قيد المعالجة' ? 'pending' : 'urgent'
                }`}>
                  {record.status}
                </span>
              </div>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">الأولوية</span>
              <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`priority-dot ${
                  record.priority === 'عالي' ? 'high' : record.priority === 'متوسط' ? 'medium' : 'low'
                }`}></span>
                <span>أولوية {record.priority}</span>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-label">عدد المرفقات</span>
              <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
                <span>{record.attachments} مرفق</span>
              </div>
            </div>

            <div className="detail-item full-width">
              <span className="detail-label">ملاحظات إضافية</span>
              <div className="detail-value" style={{ color: record.notes ? '#f1f5f9' : 'var(--text-muted)', fontSize: '0.82rem' }}>
                {record.notes || 'لا توجد ملاحظات إضافية مسجلة لهذه المعاملة'}
              </div>
            </div>
            
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {onEdit && (
              <button
                type="button"
                className="btn btn-success"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                onClick={() => onEdit(record)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                تعديل المعاملة
              </button>
            )}

            <button
              type="button"
              className="btn btn-ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.25)' }}
              onClick={handleShare}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              مشاركة المعاملة
            </button>
          </div>
          
          <button className="btn btn-ghost" onClick={onClose}>
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewModal;
