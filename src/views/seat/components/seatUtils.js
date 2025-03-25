export class SeatUtils{
    static getCursor = (tool,isDraggingMultiple) => {
        switch (tool) {
          case "add":
            return "crosshair";
          case "select":
            return "crosshair";
          case "clickSelect":
            return "pointer";
          case "drag":
            return isDraggingMultiple ? "grabbing" : "move";
          case "line":
            return "crosshair";
          case "square":
            return "crosshair";
          case "circle":
            return "crosshair";
          case "curve":
            return "crosshair";
          default:
            return "default";
        }
      };
}