import { ToastNotification } from "@carbon/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ScientificNotificationDescriptor } from "./types.js";

interface ScientificNotificationApi {
  notify: (notification: Omit<ScientificNotificationDescriptor, "id"> & { id?: string }) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const ScientificNotificationContext = createContext<ScientificNotificationApi | null>(null);

export interface ScientificNotificationProviderProps {
  children: ReactNode;
  defaultTimeout?: number;
}

export function ScientificNotificationProvider({ children, defaultTimeout = 6000 }: ScientificNotificationProviderProps) {
  const [notifications, setNotifications] = useState<ScientificNotificationDescriptor[]>([]);
  const counter = useRef(0);
  const dismiss = useCallback((id: string) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);
  const clear = useCallback(() => setNotifications([]), []);
  const notify = useCallback((notification: Omit<ScientificNotificationDescriptor, "id"> & { id?: string }) => {
    const id = notification.id ?? `scientific-notification-${++counter.current}`;
    setNotifications((current) => [...current.filter((item) => item.id !== id), { ...notification, id }]);
    return id;
  }, []);

  useEffect(() => {
    const timers = notifications
      .filter((notification) => (notification.timeout ?? defaultTimeout) > 0)
      .map((notification) => window.setTimeout(() => dismiss(notification.id), notification.timeout ?? defaultTimeout));
    return () => timers.forEach(window.clearTimeout);
  }, [defaultTimeout, dismiss, notifications]);

  const api = useMemo(() => ({ notify, dismiss, clear }), [clear, dismiss, notify]);
  return (
    <ScientificNotificationContext.Provider value={api}>
      {children}
      <div className="scientific-notifications">
        {notifications.map((notification) => (
          <ToastNotification
            key={notification.id}
            kind={notification.kind}
            title={notification.title}
            subtitle={notification.subtitle}
            caption={notification.caption}
            timeout={0}
            onCloseButtonClick={() => dismiss(notification.id)}
          />
        ))}
      </div>
    </ScientificNotificationContext.Provider>
  );
}

export function useScientificNotifications() {
  const context = useContext(ScientificNotificationContext);
  if (!context) throw new Error("useScientificNotifications must be used inside ScientificNotificationProvider");
  return context;
}
