import { useState, useRef, useCallback, useEffect } from "react";

export const useDraggable = (onPositionChange) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const elementRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0, elementX: 0, elementY: 0 });

  const handleMouseDown = useCallback((e) => {
    if (!dragRef.current || !elementRef.current) return;

    // Only start dragging if the target is the drag handle or its children
    if (!dragRef.current.contains(e.target)) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = elementRef.current.getBoundingClientRect();

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      elementX: rect.left,
      elementY: rect.top,
    };

    setIsDragging(true);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !elementRef.current) return;

      e.preventDefault();

      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      let newX = dragStartRef.current.elementX + deltaX;
      let newY = dragStartRef.current.elementY + deltaY;

      // Get element dimensions for boundary constraints
      const elementRect = elementRef.current.getBoundingClientRect();
      const padding = 10;

      // Constrain to viewport
      newX = Math.max(
        padding,
        Math.min(newX, window.innerWidth - elementRect.width - padding)
      );
      newY = Math.max(
        padding,
        Math.min(newY, window.innerHeight - elementRect.height - padding)
      );

      const newPosition = { x: newX, y: newY };
      setPosition(newPosition);

      if (onPositionChange) {
        onPositionChange(newPosition);
      }
    },
    [isDragging, onPositionChange]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }
  }, [isDragging]);

  // Global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const resetPosition = useCallback(() => {
    setPosition({ x: 0, y: 0 });
    if (onPositionChange) {
      onPositionChange({ x: 0, y: 0 });
    }
  }, [onPositionChange]);

  return {
    isDragging,
    position,
    dragRef,
    elementRef,
    handleMouseDown,
    resetPosition,
    isDragged: position.x !== 0 || position.y !== 0,
  };
};
