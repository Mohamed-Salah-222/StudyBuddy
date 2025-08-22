import { useNotification } from "../context/NotificationContext";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import { useEffect } from "react";

function Notification({ onNotificationShow }) {
  const { notification, showNotification } = useNotification();

  useEffect(() => {
    if (notification && onNotificationShow) {
      if (notification.type === "reminder" || notification.isReminder) {
        onNotificationShow({
          title: notification.message,
          type: notification.reminderType || "reminder",
          dueTime: notification.dueTime || new Date().toISOString(),
          originalNotification: notification,
        });
      }
    }
  }, [notification, onNotificationShow]);

  if (!notification) {
    return null;
  }

  const getIcon = (type) => {
    const iconProps = { size: 20, className: "flex-shrink-0" };
    switch (type) {
      case "success":
        return <CheckCircle {...iconProps} style={{ color: "#52796f" }} />;
      case "error":
        return <XCircle {...iconProps} style={{ color: "#dc2626" }} />;
      case "warning":
        return <AlertCircle {...iconProps} style={{ color: "#d97706" }} />;
      default:
        return <CheckCircle {...iconProps} style={{ color: "#52796f" }} />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case "success":
        return {
          background: "linear-gradient(135deg, rgba(132, 169, 140, 0.95) 0%, rgba(82, 121, 111, 0.95) 100%)",
          borderColor: "rgba(132, 169, 140, 0.3)",
        };
      case "error":
        return {
          background: "linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(185, 28, 28, 0.95) 100%)",
          borderColor: "rgba(239, 68, 68, 0.3)",
        };
      case "warning":
        return {
          background: "linear-gradient(135deg, rgba(217, 119, 6, 0.95) 0%, rgba(180, 83, 9, 0.95) 100%)",
          borderColor: "rgba(217, 119, 6, 0.3)",
        };
      default:
        return {
          background: "linear-gradient(135deg, rgba(132, 169, 140, 0.95) 0%, rgba(82, 121, 111, 0.95) 100%)",
          borderColor: "rgba(132, 169, 140, 0.3)",
        };
    }
  };

  const styles = getStyles(notification.type);

  return (
    <div className="fixed top-20 right-5 z-[60]">
      <div
        className="border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_#323232] p-4 bg-white text-gray-800 font-semibold transition-all duration-500 ease-in-out transform hover:scale-105 animate-notification"
        style={{
          ...styles,
          minWidth: "320px",
          maxWidth: "400px",
          fontFamily: "var(--font-SpaceMono, SpaceMono, monospace)",
        }}
      >
        <div className="relative flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-relaxed">{notification.message}</p>
          </div>

          <button onClick={() => showNotification(null)} className="flex-shrink-0 p-1 rounded border border-gray-800 transition-all duration-200 hover:bg-gray-800 hover:text-white active:scale-95">
            <X size={16} />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes notification {
          0% {
            transform: translateX(100%) scale(0.95);
            opacity: 0;
          }
          10%,
          90% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateX(100%) scale(0.95);
            opacity: 0;
          }
        }

        .animate-notification {
          animation: notification 3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}

export default Notification;
