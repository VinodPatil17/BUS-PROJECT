import React from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, Check, Info, AlertTriangle, CheckCircle, X } from 'lucide-react';

export default function NotificationCenter({ onClose }) {
  const { notifications, markNotificationRead } = useSocket();

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-statusWarning" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-statusLive" />;
      default: return <Info className="w-4 h-4 text-emeraldPrimary" />;
    }
  };

  return (
    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-borderLight rounded-2xl shadow-soft-lg z-50 p-4">
      <div className="flex items-center justify-between pb-3 border-b border-borderLight mb-3">
        <div className="flex items-center gap-2 font-bold text-sm text-charcoal">
          <Bell className="w-4 h-4 text-emeraldPrimary" />
          Live Transit Alerts
        </div>
        <button onClick={onClose} className="text-mutedGray hover:text-charcoal p-1 rounded-lg">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto space-y-2.5">
        {notifications.length === 0 ? (
          <div className="text-center py-6 text-mutedGray text-xs">
            No active alerts at this time
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className="p-3 rounded-xl bg-warmBg border border-borderLight flex gap-3 items-start justify-between hover:border-emeraldPrimary/30 transition"
            >
              <div className="mt-0.5">{getIcon(notif.type)}</div>
              <div className="flex-1">
                <div className="text-xs font-bold text-charcoal flex items-center justify-between">
                  {notif.title}
                  <span className="text-[10px] text-mutedGray font-normal">{notif.timestamp}</span>
                </div>
                <p className="text-xs text-mutedGray mt-1 leading-relaxed">{notif.message}</p>
              </div>
              <button
                onClick={() => markNotificationRead(notif.id)}
                className="text-mutedGray hover:text-charcoal p-1"
                title="Dismiss"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
