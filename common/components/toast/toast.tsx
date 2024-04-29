import { ReactNode } from "react";
import { createRoot } from 'react-dom/client';
import { Portal } from "~common";
import './toast.scss' 

export const toast = (children: ReactNode, duration: number = 3000) => {
  const div = document.createElement('div');
  document.body.appendChild(div);

  const root = createRoot(div);
  root.render(
    <Portal>
      <div className="toast fade-in">{children}</div>
    </Portal>
  )

  setTimeout(() => {
    root.unmount()
    document.body.removeChild(div)
  }, duration)
}

