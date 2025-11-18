/**
 * OperatorWindow
 * Individual window component with chrome, drag, and resize
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { useOperatorStore } from '../state/operatorStore';
import { themes } from '../themes';
import { windowVariants } from '../utils/animations';
import type { OperatorWindow as OperatorWindowType } from '../types';

interface OperatorWindowProps {
  window: OperatorWindowType;
}

export function OperatorWindow({ window }: OperatorWindowProps) {
  const {
    activeTheme,
    focusWindow,
    closeWindow,
    minimiseWindow,
    maximiseWindow,
    moveWindow,
    resizeWindow,
  } = useOperatorStore();

  const theme = themes[activeTheme];
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Handle window focus
  const handleWindowClick = () => {
    if (!window.isFocused) {
      focusWindow(window.id);
    }
  };

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent) => {
    if (window.isMaximised) return;

    e.stopPropagation();
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - window.position.x,
      y: e.clientY - window.position.y,
    };
    focusWindow(window.id);
  };

  // Handle double-click to toggle maximise
  const handleTitleBarDoubleClick = () => {
    maximiseWindow(window.id);
  };

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStartPos.current.x;
      const newY = Math.max(60, e.clientY - dragStartPos.current.y); // Don't allow dragging above top bar

      moveWindow(window.id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, window.id, moveWindow]);

  // Window position and size
  const windowStyle = window.isMaximised
    ? {
        top: 60,
        left: 0,
        width: '100%',
        height: 'calc(100vh - 140px)', // Account for top bar and dock
      }
    : {
        top: window.position.y,
        left: window.position.x,
        width: window.size.width,
        height: window.size.height,
      };

  return (
    <motion.div
      ref={windowRef}
      variants={windowVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute flex flex-col rounded-lg overflow-hidden"
      style={{
        ...windowStyle,
        zIndex: window.zIndex,
        background: theme.windowChrome.background,
        border: `1px solid ${theme.windowChrome.border}`,
        boxShadow: theme.shadow,
        transition: window.isMaximised ? 'all 0.24s ease-out' : 'none',
      }}
      onClick={handleWindowClick}
    >
      {/* Title Bar */}
      <div
        className="flex items-center justify-between px-4 h-12 cursor-move select-none"
        style={{
          background: theme.windowChrome.titleBar,
          borderBottom: `1px solid ${theme.border}`,
          color: theme.windowChrome.titleBarText,
        }}
        onMouseDown={handleDragStart}
        onDoubleClick={handleTitleBarDoubleClick}
      >
        {/* Title */}
        <div className="flex items-center gap-3 flex-1">
          <span className="font-medium text-sm font-['JetBrains_Mono']">
            {window.title}
          </span>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              minimiseWindow(window.id);
            }}
            className="p-1.5 rounded hover:bg-opacity-20 transition-colors"
            style={{
              color: theme.text.secondary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.windowChrome.buttonHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Minus size={16} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              maximiseWindow(window.id);
            }}
            className="p-1.5 rounded hover:bg-opacity-20 transition-colors"
            style={{
              color: theme.text.secondary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.windowChrome.buttonHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {window.isMaximised ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(window.id);
            }}
            className="p-1.5 rounded hover:bg-red-500/20 transition-colors"
            style={{
              color: theme.text.secondary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = theme.text.secondary;
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div
        className="flex-1 overflow-hidden"
        style={{
          background: theme.windowChrome.background,
        }}
      >
        {/* TODO: Embed actual app content here via iframe or component composition */}
        <iframe
          src={window.route || `/${window.appId}`}
          className="w-full h-full border-0"
          title={window.title}
        />
      </div>

      {/* Resize Handle (bottom-right corner) */}
      {!window.isMaximised && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsResizing(true);
            focusWindow(window.id);
          }}
        />
      )}
    </motion.div>
  );
}
