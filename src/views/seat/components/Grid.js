import React from 'react';
import { Line } from 'react-konva';

const Grid = ({ width, height, size = 20 }) => {
  const lines = [];
  
  // Vertical lines
  for (let i = 0; i <= width; i += size) {
    lines.push(
      <Line
        key={`v-${i}`}
        points={[i, 0, i, height]}
        stroke="#ddd"
        strokeWidth={0.5}
        perfectDrawEnabled={false}
      />
    );
  }
  
  // Horizontal lines
  for (let i = 0; i <= height; i += size) {
    lines.push(
      <Line
        key={`h-${i}`}
        points={[0, i, width, i]}
        stroke="#ddd"
        strokeWidth={0.5}
        perfectDrawEnabled={false}
      />
    );
  }
  
  return <>{lines}</>;
};

export default Grid;