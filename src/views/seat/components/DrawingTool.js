import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Layer, Stage, Line, Rect, Circle } from 'react-konva';
import { addDrawing } from 'store/slices/seatSlice';

const DrawingTool = ({ 
  activeTool, 
  scale, 
  width, 
  height 
}) => {
  const dispatch = useDispatch();
  const activeCategory = useSelector((state) => state.seat.activeCategory);
  const categories = useSelector((state) => state.seat.categories);

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState(null);
  const stageRef = useRef(null);

  // Find the color for the active category
  const getCategoryColor = () => {
    const category = categories.find(cat => cat.id === activeCategory);
    return category ? category.color : '#000000';
  };

  const handleMouseDown = (e) => {
    // Ensure we're using a drawing tool
    if (!['line', 'square', 'circle', 'curve'].includes(activeTool)) return;

    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    
    // Convert to world coordinates
    const worldX = pointerPos.x / scale;
    const worldY = pointerPos.y / scale;

    setIsDrawing(true);
    
    switch (activeTool) {
      case 'line':
      case 'curve':
        setCurrentDrawing({
          points: [worldX, worldY],
          color: getCategoryColor(),
          type: activeTool
        });
        break;
      case 'square':
        setCurrentDrawing({
          x: worldX,
          y: worldY,
          width: 0,
          height: 0,
          color: getCategoryColor(),
          type: 'square'
        });
        break;
      case 'circle':
        setCurrentDrawing({
          x: worldX,
          y: worldY,
          radius: 0,
          color: getCategoryColor(),
          type: 'circle'
        });
        break;
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !currentDrawing) return;

    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    
    // Convert to world coordinates
    const worldX = pointerPos.x / scale;
    const worldY = pointerPos.y / scale;

    switch (currentDrawing.type) {
      case 'line':
        setCurrentDrawing(prev => ({
          ...prev,
          points: [...prev.points, worldX, worldY]
        }));
        break;
      case 'curve':
        // For curves, keep the first point and add control points
        setCurrentDrawing(prev => {
          const newPoints = [...prev.points];
          if (newPoints.length < 6) {
            newPoints.push(worldX, worldY);
          }
          return { ...prev, points: newPoints };
        });
        break;
      case 'square':
        setCurrentDrawing(prev => ({
          ...prev,
          width: worldX - prev.x,
          height: worldY - prev.y
        }));
        break;
      case 'circle':
        const radius = Math.sqrt(
          Math.pow(worldX - currentDrawing.x, 2) + 
          Math.pow(worldY - currentDrawing.y, 2)
        );
        setCurrentDrawing(prev => ({
          ...prev,
          radius
        }));
        break;
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentDrawing) return;

    // Dispatch the completed drawing to Redux
    dispatch(addDrawing({
      ...currentDrawing,
      categoryId: activeCategory
    }));

    setIsDrawing(false);
    setCurrentDrawing(null);
  };

  return (
    <Stage
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      scaleX={scale}
      scaleY={scale}
    >
      <Layer>
        {/* Render current drawing in progress */}
        {currentDrawing && (
          <>
            {currentDrawing.type === 'line' && (
              <Line
                points={currentDrawing.points}
                stroke={currentDrawing.color}
                strokeWidth={2}
              />
            )}
            {currentDrawing.type === 'curve' && currentDrawing.points.length >= 6 && (
              <Line
                points={currentDrawing.points}
                stroke={currentDrawing.color}
                strokeWidth={2}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
              />
            )}
            {currentDrawing.type === 'square' && (
              <Rect
                x={currentDrawing.x}
                y={currentDrawing.y}
                width={currentDrawing.width}
                height={currentDrawing.height}
                stroke={currentDrawing.color}
                strokeWidth={2}
                fill="transparent"
              />
            )}
            {currentDrawing.type === 'circle' && (
              <Circle
                x={currentDrawing.x}
                y={currentDrawing.y}
                radius={currentDrawing.radius}
                stroke={currentDrawing.color}
                strokeWidth={2}
                fill="transparent"
              />
            )}
          </>
        )}
      </Layer>
    </Stage>
  );
};

export default DrawingTool;