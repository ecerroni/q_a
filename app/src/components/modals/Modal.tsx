import React, { useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';

import ReactPortal from './ReactPortal';
import './modal.css';

type Listener = (this: HTMLElement, _ev: KeyboardEvent | MouseEvent) => any;

const useOnEscapeClick = (
  callback: () => void,
  preventCloseOnEscapeKey?: boolean
) => {
  useEffect(() => {
    if (preventCloseOnEscapeKey) return;
    const closeOnEscapeKey: Listener = e => {
      if ('key' in e && e.key === 'Escape') {
        callback();
      }
      return null;
    };
    document.body.addEventListener('keydown', closeOnEscapeKey);
    return () => {
      document.body.removeEventListener('keydown', closeOnEscapeKey);
    };
  }, [callback, preventCloseOnEscapeKey]);
};

const useOnOutsideClick = (
  callback: () => void,
  isOpen: boolean,
  preventCloseOnClickOutside?: boolean
) => {
  useEffect(() => {
    if (preventCloseOnClickOutside) return;
    const handleClickOutside: Listener = event => {
      if ((event.target as Element).id?.includes?.('portal-modal')) {
        callback();
      }
      return null;
    };
    if (isOpen) {
      document.body.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.body.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, callback, preventCloseOnClickOutside]);
};

type PreventableAction = 'click-outside' | 'escape-key';

function Modal({
  children,
  isOpen,
  handleClose,
  preventableActions = [],
  onAfterOpen = () => {
    //
  },
  onAfterClose = () => {
    //
  },
}: {
  children: React.ReactNode;
  isOpen: boolean;
  handleClose: () => void;
  preventableActions?: [PreventableAction?, PreventableAction?];
  onAfterClose?: () => void;
  onAfterOpen?: () => void;
}) {
  const isActuallyVisible = useRef(false);
  const preventCloseOnEscapeKey = preventableActions.includes('escape-key');
  const preventCloseOnClickOutside =
    preventableActions.includes('click-outside');
  useOnEscapeClick(handleClose, preventCloseOnEscapeKey);
  useOnOutsideClick(handleClose, isOpen, preventCloseOnClickOutside);

  useEffect(() => {
    if (isOpen) {
      if (!isActuallyVisible.current) isActuallyVisible.current = true;

      onAfterOpen();
    }
  }, [onAfterOpen, isOpen]);

  useEffect(() => {
    if (!isOpen && isActuallyVisible.current) onAfterClose();
  }, [onAfterClose, isOpen]);

  const nodeRef = useRef(null);

  return (
    <ReactPortal wrapperId="react-portal-modal-container">
      <CSSTransition
        in={isOpen}
        timeout={{ enter: 0, exit: 300 }}
        unmountOnExit
        classNames="modal"
        nodeRef={nodeRef}
      >
        <div id="portal-modal" className="modal" ref={nodeRef}>
          <div className="modal-content">{children}</div>
        </div>
      </CSSTransition>
    </ReactPortal>
  );
}
export default Modal;
