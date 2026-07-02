import Modal from './ui/Modal';
import Button from './ui/Button';

function DeleteModal({ record, onClose, onConfirm }) {
  const footer = (
    <>
      <Button variant="danger" onClick={onConfirm}>
        نعم، احذف
      </Button>
      <Button variant="ghost" onClick={onClose}>
        إلغاء
      </Button>
    </>
  );

  return (
    <Modal title="تأكيد الحذف" onClose={onClose} size="sm" footer={footer} footerClass="modal-footer--center">
      <div className="delete-confirm">
        <div className="delete-icon-big">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </div>
        <h3>هل أنت متأكد من حذف هذه المعاملة؟</h3>
        <p>
          المعاملة رقم <strong style={{ color: 'var(--danger-text)' }}>{record.registrationNumber}</strong>
          <br />
          هذا الإجراء لا يمكن التراجع عنه
        </p>
      </div>
    </Modal>
  );
}

export default DeleteModal;
