import React from "react";
import { Circle, Text, Group } from "react-konva";
import { useSelector } from "react-redux";

const Seat = ({ seat, index, isSelected, draggable, onDragEnd, id }) => {
  const { x, y, label, categoryId } = seat;
  const categories = useSelector((state) => state.seat.categories);

  const category =
    categories.find((cat) => cat.id === categoryId) || categories[0];

  return (
    <Group
      id={id}
      x={x}
      y={y}
      draggable={draggable}
      onDragEnd={onDragEnd}
    >
      <Circle
        radius={10}
        fill={isSelected ? "#1890ff" : category.color}
        stroke="#000"
        strokeWidth={1}
      />
      {label && (
        <Text
          x={-5}
          y={-5}
          text={label}
          fontSize={8}
          fill="#000"
          align="center"
          width={10}
        />
      )}
    </Group>
  );
};

export default Seat;