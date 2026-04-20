'use client';
import { useEffect } from 'react';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}

export default function Modal({ open, title, onClose, children, wide }: Props) {
  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="overlay-modal open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="overlay-modal-content"
        style={{ maxWidth: wide ? 1100 : 960 }}
      >
        <div className="overlay-modal-header">
          <h2>{title}</h2>
          <span className="modal-close" onClick={onClose}>&times;</span>
        </div>
        <div className="overlay-modal-body" style={{ padding: '0 4px', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
