/**
 * OperatorNotifications
 * Toast notification stack
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useOperatorStore } from '../state/operatorStore';
import { themes } from '../themes';
import { notificationVariants } from '../utils/animations';

const notificationIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const notificationColors = {
  info: '#3AA9BE',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
};

export function OperatorNotifications() {
  const { activeTheme, notifications, dismissNotification } = useOperatorStore();
  const theme = themes[activeTheme];

  return (
    <div className="fixed top-20 right-6 z-[9999] flex flex-col gap-3 max-w-md">
      <AnimatePresence>
        {notifications.map((notification) => {
          const Icon = notificationIcons[notification.type];
          const color = notificationColors[notification.type];

          return (
            <motion.div
              key={notification.id}
              variants={notificationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex items-start gap-3 p-4 rounded-lg backdrop-blur-xl"
              style={{
                background: theme.windowChrome.background,
                border: `1px solid ${color}40`,
                boxShadow: theme.shadow,
              }}
            >
              {/* Icon */}
              <Icon size={20} style={{ color, flexShrink: 0 }} />

              {/* Message */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm break-words"
                  style={{ color: theme.text.primary }}
                >
                  {notification.message}
                </p>
              </div>

              {/* Dismiss button */}
              <button
                onClick={() => dismissNotification(notification.id)}
                className="p-1 rounded hover:bg-opacity-20 transition-colors flex-shrink-0"
                style={{ color: theme.text.muted }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.dock.itemHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
