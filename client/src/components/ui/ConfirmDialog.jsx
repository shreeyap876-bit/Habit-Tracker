import { useState } from 'react';
import Button from './Button.jsx';
import Modal from './Modal.jsx';

/** Confirmation prompt for destructive actions such as deleting a habit. */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
}) {
  const [working, setWorking] = useState(false);

  const handleConfirm = async () => {
    setWorking(true);
    try {
      await onConfirm();
      onClose?.();
    } finally {
      setWorking(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={working ? undefined : onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={working}>
            Cancel
          </Button>
          <Button variant={variant} onClick={handleConfirm} loading={working}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p style={{ color: 'var(--ink-2)' }}>{message}</p>
    </Modal>
  );
}
