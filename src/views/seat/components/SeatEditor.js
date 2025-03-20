import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Rect, Text, Circle, Group, Line } from "react-konva";

const AdvancedSeatEditor = () => {
  // Main state
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [gridSize, setGridSize] = useState(20);
  const [showGrid, setShowGrid] = useState(true);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [sectionPoints, setSectionPoints] = useState([]);
  const [sections, setSections] = useState([]);
  const [activeTool, setActiveTool] = useState("seat"); // seat, section, select
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [seatCounter, setSeatCounter] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [currentSection, setCurrentSection] = useState(null);
  const [currentRow, setCurrentRow] = useState("");
  const containerRef = useRef(null);

  // Create seat types with more options
  const [seatTypes, setSeatTypes] = useState([
    {
      name: "Standard",
      color: "#4285F4",
      width: 30,
      height: 30,
      shape: "rect",
      price: 50,
    },
    {
      name: "Premium",
      color: "#EA4335",
      width: 35,
      height: 35,
      shape: "rect",
      price: 100,
    },
    {
      name: "VIP",
      color: "#FBBC05",
      width: 40,
      height: 40,
      shape: "rect",
      price: 150,
    },
    {
      name: "Accessible",
      color: "#34A853",
      width: 35,
      height: 35,
      shape: "circle",
      price: 50,
    },
  ]);

  const [activeSeatType, setActiveSeatType] = useState(0);
  const [editingSeatType, setEditingSeatType] = useState(null);
  const [isAddingSeatType, setIsAddingSeatType] = useState(false);
  const [sidemenuTab, setSidemenuTab] = useState("seats"); // seats, sections, tools, settings

  // Sidebar form state
  const [seatForm, setSeatForm] = useState({
    label: "",
    row: "",
    section: "",
    price: 0,
    status: "available",
  });

  useEffect(() => {
    // Resize handler for responsiveness
    const handleResize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        setStageSize({
          width: container.offsetWidth - 300, // Adjust for sidebar width
          height: container.offsetHeight,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelectedSeats();
      }
      if (e.key === "Escape") {
        if (isCreatingSection) {
          setIsCreatingSection(false);
          setSectionPoints([]);
        } else {
          setSelectedSeat(null);
          setSelectedSeats([]);
        }
      }
      if (e.ctrlKey) {
        setIsCtrlPressed(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === "Control") {
        setIsCtrlPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isCreatingSection, selectedSeats]);

  // Create grid lines
  const gridLines = [];
  if (showGrid) {
    // Horizontal lines
    for (let i = 0; i < stageSize.height / gridSize; i++) {
      gridLines.push(
        <Line
          key={`h${i}`}
          points={[0, i * gridSize, stageSize.width, i * gridSize]}
          stroke="#ddd"
          strokeWidth={1}
        />
      );
    }
    // Vertical lines
    for (let i = 0; i < stageSize.width / gridSize; i++) {
      gridLines.push(
        <Line
          key={`v${i}`}
          points={[i * gridSize, 0, i * gridSize, stageSize.height]}
          stroke="#ddd"
          strokeWidth={1}
        />
      );
    }
  }

  // Stage click handler
  const handleStageClick = (e) => {
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    const x = (pointerPos.x - stagePos.x) / scale;
    const y = (pointerPos.y - stagePos.y) / scale;
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;

    // If we're creating a section
    if (isCreatingSection) {
      setSectionPoints([...sectionPoints, { x: snappedX, y: snappedY }]);
      return;
    }

    // If we're in seat mode and clicked on the stage itself
    if (activeTool === "seat" && e.target === stage) {
      addSeat(snappedX, snappedY);
    }

    // If we're in select mode and clicked on stage, clear selection
    if (activeTool === "select" && e.target === stage) {
      setSelectedSeat(null);
      setSelectedSeats([]);
    }
  };

  // Add a new seat
  const addSeat = (x, y) => {
    const type = seatTypes[activeSeatType];
    const newSeat = {
      id: Date.now(),
      x,
      y,
      type: type.name,
      width: type.width,
      height: type.height,
      color: type.color,
      shape: type.shape,
      price: type.price,
      label: seatCounter,
      row: currentRow || "A",
      section: currentSection || "",
      status: "available",
    };

    setSeatCounter((prev) => prev + 1);
    setSeats([...seats, newSeat]);
    setSelectedSeat(newSeat.id);
    setSelectedSeats([newSeat.id]);

    // Update form with new seat details
    setSeatForm({
      label: newSeat.label.toString(),
      row: newSeat.row,
      section: newSeat.section,
      price: newSeat.price,
      status: newSeat.status,
    });
  };

  // Handle seat dragging
  const handleDragMove = (e, id) => {
    const seat = e.target;
    // Snap to grid while dragging
    const snappedX = Math.round(seat.x() / gridSize) * gridSize;
    const snappedY = Math.round(seat.y() / gridSize) * gridSize;
    seat.position({ x: snappedX, y: snappedY });
  };

  // Handle seat drag end
  const handleDragEnd = (e, id) => {
    const seat = e.target;
    const snappedX = Math.round(seat.x() / gridSize) * gridSize;
    const snappedY = Math.round(seat.y() / gridSize) * gridSize;

    // If multiple seats are selected, move them all
    if (selectedSeats.includes(id) && selectedSeats.length > 1) {
      const targetSeat = seats.find((s) => s.id === id);
      const deltaX = snappedX - targetSeat.x;
      const deltaY = snappedY - targetSeat.y;

      const newSeats = seats.map((s) => {
        if (selectedSeats.includes(s.id)) {
          return { ...s, x: s.x + deltaX, y: s.y + deltaY };
        }
        return s;
      });

      setSeats(newSeats);
    } else {
      // Just move the single seat
      const newSeats = seats.map((s) =>
        s.id === id ? { ...s, x: snappedX, y: snappedY } : s
      );
      setSeats(newSeats);
    }
  };

  // Handle seat selection
  const handleSeatClick = (id) => {
    if (activeTool === "select" || isCtrlPressed) {
      if (isCtrlPressed) {
        // Multi-select mode
        if (selectedSeats.includes(id)) {
          setSelectedSeats(selectedSeats.filter((seatId) => seatId !== id));
          if (selectedSeat === id) {
            setSelectedSeat(
              selectedSeats.filter((seatId) => seatId !== id)[0] || null
            );
          }
        } else {
          setSelectedSeats([...selectedSeats, id]);
          setSelectedSeat(id);
        }
      } else {
        // Single select mode
        setSelectedSeat(id);
        setSelectedSeats([id]);
      }

      // Update form with selected seat details
      const seat = seats.find((s) => s.id === id);
      if (seat) {
        setSeatForm({
          label: seat.label.toString(),
          row: seat.row,
          section: seat.section,
          price: seat.price,
          status: seat.status,
        });
      }
    }
  };

  // Delete selected seats
  const deleteSelectedSeats = () => {
    if (selectedSeats.length > 0) {
      setSeats(seats.filter((seat) => !selectedSeats.includes(seat.id)));
      setSelectedSeat(null);
      setSelectedSeats([]);
    }
  };

  // Complete section creation
  const completeSection = () => {
    if (sectionPoints.length >= 3) {
      const newSection = {
        id: Date.now(),
        points: sectionPoints.flatMap((p) => [p.x, p.y]),
        name: `Section ${sections.length + 1}`,
        color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
          Math.random() * 255
        )}, ${Math.floor(Math.random() * 255)}, 0.2)`,
      };

      setSections([...sections, newSection]);
      setCurrentSection(newSection.name);
    }

    setIsCreatingSection(false);
    setSectionPoints([]);
  };

  // Handle stage zooming
  const handleWheel = (e) => {
    e.evt.preventDefault();

    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = scale;
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setScale(newScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setStagePos(newPos);
  };

  // Update seat properties from form
  const updateSeatProperties = () => {
    if (selectedSeat) {
      const newSeats = seats.map((seat) => {
        if (selectedSeats.includes(seat.id)) {
          return {
            ...seat,
            label:
              parseInt(seatForm.label) +
              (seat.id === selectedSeat
                ? 0
                : seat.label - seats.find((s) => s.id === selectedSeat).label),
            row: seatForm.row,
            section: seatForm.section,
            price: parseFloat(seatForm.price),
            status: seatForm.status,
          };
        }
        return seat;
      });

      setSeats(newSeats);
    }
  };

  // Create a row of seats
  const createRow = (rowCount, seatCount, startX, startY, spacing) => {
    const newSeats = [];
    const type = seatTypes[activeSeatType];

    for (let r = 0; r < rowCount; r++) {
      const rowChar = String.fromCharCode(65 + r);

      for (let s = 0; s < seatCount; s++) {
        const newSeat = {
          id: Date.now() + r * seatCount + s,
          x: startX + s * (type.width + spacing),
          y: startY + r * (type.height + spacing),
          type: type.name,
          width: type.width,
          height: type.height,
          color: type.color,
          shape: type.shape,
          price: type.price,
          label: seatCounter + r * seatCount + s,
          row: rowChar,
          section: currentSection || "",
          status: "available",
        };

        newSeats.push(newSeat);
      }
    }

    setSeatCounter(seatCounter + rowCount * seatCount);
    setSeats([...seats, ...newSeats]);
  };

  // Create a curved row of seats
  const createCurvedRow = (
    rowCount,
    seatCount,
    centerX,
    centerY,
    radius,
    startAngle,
    endAngle
  ) => {
    const newSeats = [];
    const type = seatTypes[activeSeatType];

    for (let r = 0; r < rowCount; r++) {
      const rowChar = String.fromCharCode(65 + r);
      const currentRadius = radius + r * (type.height + 10);

      for (let s = 0; s < seatCount; s++) {
        const angle =
          startAngle + (s * (endAngle - startAngle)) / (seatCount - 1);
        const radians = (angle * Math.PI) / 180;

        const x = centerX + currentRadius * Math.cos(radians);
        const y = centerY + currentRadius * Math.sin(radians);

        const snappedX = Math.round(x / gridSize) * gridSize;
        const snappedY = Math.round(y / gridSize) * gridSize;

        const newSeat = {
          id: Date.now() + r * seatCount + s,
          x: snappedX - type.width / 2,
          y: snappedY - type.height / 2,
          type: type.name,
          width: type.width,
          height: type.height,
          color: type.color,
          shape: type.shape,
          price: type.price,
          label: seatCounter + r * seatCount + s,
          row: rowChar,
          section: currentSection || "",
          status: "available",
          angle: angle - 90, // Adjust seat to face center
        };

        newSeats.push(newSeat);
      }
    }

    setSeatCounter(seatCounter + rowCount * seatCount);
    setSeats([...seats, ...newSeats]);
  };

  // Save the layout
  const saveLayout = () => {
    const layout = {
      seats,
      sections,
      seatTypes,
      gridSize,
      seatCounter,
    };

    const dataStr = JSON.stringify(layout);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "seating-layout.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Load a layout
  const loadLayout = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const layout = JSON.parse(e.target.result);
        setSeats(layout.seats || []);
        setSections(layout.sections || []);
        setSeatTypes(layout.seatTypes || seatTypes);
        setGridSize(layout.gridSize || 20);
        setSeatCounter(layout.seatCounter || 1);
      } catch (error) {
        console.error("Failed to parse layout file:", error);
      }
    };
    reader.readAsText(file);
  };

  // Add custom seat type
  const addSeatType = () => {
    if (isAddingSeatType && editingSeatType) {
      setSeatTypes([...seatTypes, editingSeatType]);
      setIsAddingSeatType(false);
      setEditingSeatType(null);
    } else {
      setEditingSeatType({
        name: "New Type",
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
        width: 30,
        height: 30,
        shape: "rect",
        price: 50,
      });
      setIsAddingSeatType(true);
    }
  };

  // Update custom seat type
  const updateSeatType = (field, value) => {
    if (editingSeatType) {
      setEditingSeatType({
        ...editingSeatType,
        [field]: value,
      });
    }
  };

  // Render seat
  const renderSeat = (seat) => {
    const isSelected = selectedSeats.includes(seat.id);

    if (seat.shape === "circle") {
      return (
        <Group
          key={seat.id}
          draggable={activeTool !== "section"}
          onDragMove={(e) => handleDragMove(e, seat.id)}
          onDragEnd={(e) => handleDragEnd(e, seat.id)}
          onClick={() => handleSeatClick(seat.id)}
          onTap={() => handleSeatClick(seat.id)}
          rotation={seat.angle || 0}
        >
          <Circle
            x={seat.x + seat.width / 2}
            y={seat.y + seat.height / 2}
            radius={seat.width / 2}
            fill={seat.color}
            opacity={
              seat.status === "available" ? (isSelected ? 0.9 : 0.7) : 0.3
            }
            stroke={isSelected ? "#000" : "transparent"}
            strokeWidth={2}
          />
          {showLabels && (
            <Text
              x={seat.x}
              y={seat.y}
              width={seat.width}
              height={seat.height}
              text={`${seat.row}${seat.label}`}
              fontSize={12}
              fill="#fff"
              align="center"
              verticalAlign="middle"
            />
          )}
        </Group>
      );
    } else {
      return (
        <Group
          key={seat.id}
          draggable={activeTool !== "section"}
          onDragMove={(e) => handleDragMove(e, seat.id)}
          onDragEnd={(e) => handleDragEnd(e, seat.id)}
          onClick={() => handleSeatClick(seat.id)}
          onTap={() => handleSeatClick(seat.id)}
          rotation={seat.angle || 0}
        >
          <Rect
            x={seat.x}
            y={seat.y}
            width={seat.width}
            height={seat.height}
            fill={seat.color}
            opacity={
              seat.status === "available" ? (isSelected ? 0.9 : 0.7) : 0.3
            }
            stroke={isSelected ? "#000" : "transparent"}
            strokeWidth={2}
            cornerRadius={3}
          />
          {showLabels && (
            <Text
              x={seat.x}
              y={seat.y}
              width={seat.width}
              height={seat.height}
              text={`${seat.row}${seat.label}`}
              fontSize={12}
              fill="#fff"
              align="center"
              verticalAlign="middle"
            />
          )}
        </Group>
      );
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-100" ref={containerRef}>
      {/* Main Toolbar */}
      <div className="flex flex-col p-2 bg-gray-800 text-white">
        <button
          onClick={() => setActiveTool("seat")}
          className={`p-2 mb-2 rounded ${
            activeTool === "seat" ? "bg-blue-600" : "hover:bg-gray-700"
          }`}
          title="Add Seats"
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          </svg>
        </button>
        <button
          onClick={() => setActiveTool("select")}
          className={`p-2 mb-2 rounded ${
            activeTool === "select" ? "bg-blue-600" : "hover:bg-gray-700"
          }`}
          title="Select Tool"
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3l7 7m0 0v-6m0 6h-6"></path>
          </svg>
        </button>
        <button
          onClick={() => {
            setActiveTool("section");
            setIsCreatingSection(true);
            setSectionPoints([]);
          }}
          className={`p-2 mb-2 rounded ${
            activeTool === "section" ? "bg-blue-600" : "hover:bg-gray-700"
          }`}
          title="Create Section"
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"></path>
            <path d="M3 10h18"></path>
          </svg>
        </button>
        <div className="flex-grow"></div>
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-2 mb-2 rounded ${
            showGrid ? "bg-green-600" : "hover:bg-gray-700"
          }`}
          title="Toggle Grid"
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </button>
        <button
          onClick={() => setShowLabels(!showLabels)}
          className={`p-2 mb-2 rounded ${
            showLabels ? "bg-green-600" : "hover:bg-gray-700"
          }`}
          title="Toggle Labels"
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 7V4h16v3"></path>
            <path d="M9 20h6"></path>
            <path d="M12 4v16"></path>
          </svg>
        </button>
        <button
          onClick={saveLayout}
          className="p-2 mb-2 rounded hover:bg-gray-700"
          title="Save Layout"
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
        </button>
        <label
          className="p-2 mb-2 rounded hover:bg-gray-700 cursor-pointer"
          title="Load Layout"
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <input
            type="file"
            className="hidden"
            onChange={loadLayout}
            accept=".json"
          />
        </label>
      </div>

      {/* Side Panel */}
      <div className="w-64 bg-white border-r overflow-y-auto flex flex-col">
        <div className="border-b">
          <div className="flex border-b">
            <button
              className={`flex-1 py-2 px-3 text-sm ${
                sidemenuTab === "seats"
                  ? "bg-blue-100 text-blue-800"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setSidemenuTab("seats")}
            >
              Seats
            </button>
            <button
              className={`flex-1 py-2 px-3 text-sm ${
                sidemenuTab === "sections"
                  ? "bg-blue-100 text-blue-800"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setSidemenuTab("sections")}
            >
              Sections
            </button>
            <button
              className={`flex-1 py-2 px-3 text-sm ${
                sidemenuTab === "tools"
                  ? "bg-blue-100 text-blue-800"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setSidemenuTab("tools")}
            >
              Tools
            </button>
          </div>
        </div>

        {/* Seats Tab */}
        {sidemenuTab === "seats" && (
          <div className="p-3">
            <h3 className="font-medium mb-2">Seat Types</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {seatTypes.map((type, index) => (
                <button
                  key={type.name}
                  onClick={() => setActiveSeatType(index)}
                  className={`p-2 text-xs rounded flex items-center ${
                    activeSeatType === index
                      ? "bg-blue-100 border-blue-300"
                      : "bg-gray-50 border-gray-200"
                  } border`}
                >
                  <div
                    className="w-4 h-4 mr-1 rounded-sm"
                    style={{ backgroundColor: type.color }}
                  ></div>
                  {type.name}
                </button>
              ))}
            </div>

            <button
              onClick={addSeatType}
              className="text-xs mb-4 p-2 bg-gray-100 hover:bg-gray-200 rounded w-full flex items-center justify-center"
            >
              <span className="mr-1">+</span>
              {isAddingSeatType ? "Save Type" : "Add Type"}
            </button>

            {isAddingSeatType && (
              <div className="mb-4 p-2 border rounded bg-gray-50">
                <div className="mb-2">
                  <label className="block text-xs text-gray-600">Name</label>
                  <input
                    type="text"
                    value={editingSeatType?.name || ""}
                    onChange={(e) => updateSeatType("name", e.target.value)}
                    className="w-full p-1 text-sm border rounded"
                  />
                </div>
                <div className="mb-2 flex">
                  <div className="w-1/2 pr-1">
                    <label className="block text-xs text-gray-600">Color</label>
                    <input
                      type="color"
                      value={editingSeatType?.color || "#000000"}
                      onChange={(e) => updateSeatType("color", e.target.value)}
                      className="w-full p-0 h-6 border rounded"
                    />
                  </div>
                  <div className="w-1/2 pl-1">
                    <label className="block text-xs text-gray-600">Shape</label>
                    <select
                      value={editingSeatType?.shape || "rect"}
                      onChange={(e) => updateSeatType("shape", e.target.value)}
                      className="w-full p-1 text-sm border rounded"
                    >
                      <option value="rect">Rectangle</option>
                      <option value="circle">Circle</option>
                    </select>
                  </div>
                </div>
                <div className="mb-2 flex">
                  <div className="w-1/3 pr-1">
                    <label className="block text-xs text-gray-600">Width</label>
                    <input
                      type="number"
                      value={editingSeatType?.width || 30}
                      onChange={(e) =>
                        updateSeatType("width", parseInt(e.target.value))
                      }
                      className="w-full p-1 text-sm border rounded"
                    />
                  </div>
                  <div className="w-1/3 px-1">
                    <label className="block text-xs text-gray-600">
                      Height
                    </label>
                    <input
                      type="number"
                      value={editingSeatType?.height || 30}
                      onChange={(e) =>
                        updateSeatType("height", parseInt(e.target.value))
                      }
                      className="w-full p-1 text-sm border rounded"
                    />
                  </div>
                  <div className="w-1/3 pl-1">
                    <label className="block text-xs text-gray-600">Price</label>
                    <input
                      type="number"
                      value={editingSeatType?.price || 50}
                      onChange={(e) =>
                        updateSeatType("price", parseFloat(e.target.value))
                      }
                      className="w-full p-1 text-sm border rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            <hr className="my-3" />

            <h3 className="font-medium mb-2">
              Selected Seat{selectedSeats.length > 1 ? "s" : ""}
            </h3>

            {selectedSeat ? (
              <div>
                <div className="mb-2">
                  <label className="block text-xs text-gray-600">Label</label>
                  <input
                    type="text"
                    value={seatForm.label}
                    onChange={(e) =>
                      setSeatForm({ ...seatForm, label: e.target.value })
                    }
                    className="w-full p-1 text-sm border rounded"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs text-gray-600">Row</label>
                  <input
                    type="text"
                    value={seatForm.row}
                    onChange={(e) =>
                      setSeatForm({ ...seatForm, row: e.target.value })
                    }
                    className="w-full p-1 text-sm border rounded"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs text-gray-600">Section</label>
                  <select
                    value={seatForm.section}
                    onChange={(e) =>
                      setSeatForm({ ...seatForm, section: e.target.value })
                    }
                    className="w-full p-1 text-sm border rounded"
                  >
                    <option value="">No Section</option>
                    {sections.map((section) => (
                      <option key={section.id} value={section.name}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="block text-xs text-gray-600">Price</label>
                  <input
                    type="number"
                    value={seatForm.price}
                    onChange={(e) =>
                      setSeatForm({
                        ...seatForm,
                        price: parseFloat(e.target.value),
                      })
                    }
                    className="w-full p-1 text-sm border rounded"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs text-gray-600">Status</label>
                  <select
                    value={seatForm.status}
                    onChange={(e) =>
                      setSeatForm({ ...seatForm, status: e.target.value })
                    }
                    className="w-full p-1 text-sm border rounded"
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={updateSeatProperties}
                    className="flex-1 p-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Update
                  </button>
                  <button
                    onClick={deleteSelectedSeats}
                    className="flex-1 p-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No seat selected</p>
            )}
          </div>
        )}

        {/* Sections Tab */}
        {sidemenuTab === "sections" && (
          <div className="p-3">
            <h3 className="font-medium mb-2">Sections</h3>

            {sections.length > 0 ? (
              <div className="mb-3">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="mb-2 p-2 bg-gray-50 border rounded flex items-center"
                  >
                    <div
                      className="w-4 h-4 mr-2 rounded"
                      style={{ backgroundColor: section.color }}
                    ></div>
                    <div className="flex-grow text-sm">{section.name}</div>
                    <button
                      onClick={() => {
                        setCurrentSection(section.name);
                      }}
                      className="text-xs p-1 bg-blue-100 text-blue-800 rounded"
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-3">No sections created</p>
            )}

            <button
              onClick={() => {
                setActiveTool("section");
                setIsCreatingSection(true);
                setSectionPoints([]);
              }}
              className="text-xs p-2 bg-gray-100 hover:bg-gray-200 rounded w-full flex items-center justify-center"
            >
              <span className="mr-1">+</span> Create Section
            </button>

            {isCreatingSection && (
              <div className="mt-3 p-2 border rounded bg-gray-50">
                <p className="text-xs text-gray-600 mb-2">
                  Click on the stage to add points. Add at least 3 points to
                  create a section.
                </p>
                <p className="text-xs font-medium">
                  Points: {sectionPoints.length}
                </p>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={completeSection}
                    disabled={sectionPoints.length < 3}
                    className={`flex-1 p-1 ${
                      sectionPoints.length < 3
                        ? "bg-gray-300"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    } rounded text-sm`}
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingSection(false);
                      setSectionPoints([]);
                    }}
                    className="flex-1 p-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <hr className="my-3" />

            <h3 className="font-medium mb-2">Current Section</h3>
            <select
              value={currentSection || ""}
              onChange={(e) => setCurrentSection(e.target.value)}
              className="w-full p-2 text-sm border rounded mb-3"
            >
              <option value="">No Section</option>
              {sections.map((section) => (
                <option key={section.id} value={section.name}>
                  {section.name}
                </option>
              ))}
            </select>

            <h3 className="font-medium mb-2">Current Row</h3>
            <input
              type="text"
              value={currentRow}
              onChange={(e) => setCurrentRow(e.target.value)}
              placeholder="A"
              className="w-full p-2 text-sm border rounded"
            />
          </div>
        )}

        {/* Tools Tab */}
        {sidemenuTab === "tools" && (
          <div className="p-3">
            <h3 className="font-medium mb-3">Create Rows</h3>

            <div className="mb-4 p-3 border rounded bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Straight Rows</h4>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-xs text-gray-600">Rows</label>
                  <input
                    type="number"
                    id="rowCount"
                    defaultValue="3"
                    min="1"
                    className="w-full p-1 text-sm border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">
                    Seats per Row
                  </label>
                  <input
                    type="number"
                    id="seatCount"
                    defaultValue="10"
                    min="1"
                    className="w-full p-1 text-sm border rounded"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-xs text-gray-600">Start X</label>
                  <input
                    type="number"
                    id="startX"
                    defaultValue="100"
                    className="w-full p-1 text-sm border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Start Y</label>
                  <input
                    type="number"
                    id="startY"
                    defaultValue="100"
                    className="w-full p-1 text-sm border rounded"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs text-gray-600">Spacing</label>
                <input
                  type="number"
                  id="spacing"
                  defaultValue="10"
                  min="0"
                  className="w-full p-1 text-sm border rounded"
                />
              </div>
              <button
                onClick={() => {
                  const rowCount = parseInt(
                    document.getElementById("rowCount").value
                  );
                  const seatCount = parseInt(
                    document.getElementById("seatCount").value
                  );
                  const startX = parseInt(
                    document.getElementById("startX").value
                  );
                  const startY = parseInt(
                    document.getElementById("startY").value
                  );
                  const spacing = parseInt(
                    document.getElementById("spacing").value
                  );

                  createRow(rowCount, seatCount, startX, startY, spacing);
                }}
                className="w-full p-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Create Straight Rows
              </button>
            </div>

            <div className="mb-4 p-3 border rounded bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Curved Rows</h4>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-xs text-gray-600">Rows</label>
                  <input
                    type="number"
                    id="curvedRowCount"
                    defaultValue="3"
                    min="1"
                    className="w-full p-1 text-sm border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">
                    Seats per Row
                  </label>
                  <input
                    type="number"
                    id="curvedSeatCount"
                    defaultValue="10"
                    min="1"
                    className="w-full p-1 text-sm border rounded"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-xs text-gray-600">
                    Center X
                  </label>
                  <input
                    type="number"
                    id="centerX"
                    defaultValue="400"
                    className="w-full p-1 text-sm border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">
                    Center Y
                  </label>
                  <input
                    type="number"
                    id="centerY"
                    defaultValue="300"
                    className="w-full p-1 text-sm border rounded"
                  />
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-xs text-gray-600">Radius</label>
                <input
                  type="number"
                  id="radius"
                  defaultValue="150"
                  min="50"
                  className="w-full p-1 text-sm border rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-xs text-gray-600">
                    Start Angle
                  </label>
                  <input
                    type="number"
                    id="startAngle"
                    defaultValue="-30"
                    className="w-full p-1 text-sm border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">
                    End Angle
                  </label>
                  <input
                    type="number"
                    id="endAngle"
                    defaultValue="30"
                    className="w-full p-1 text-sm border rounded"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  const rowCount = parseInt(
                    document.getElementById("curvedRowCount").value
                  );
                  const seatCount = parseInt(
                    document.getElementById("curvedSeatCount").value
                  );
                  const centerX = parseInt(
                    document.getElementById("centerX").value
                  );
                  const centerY = parseInt(
                    document.getElementById("centerY").value
                  );
                  const radius = parseInt(
                    document.getElementById("radius").value
                  );
                  const startAngle = parseInt(
                    document.getElementById("startAngle").value
                  );
                  const endAngle = parseInt(
                    document.getElementById("endAngle").value
                  );

                  createCurvedRow(
                    rowCount,
                    seatCount,
                    centerX,
                    centerY,
                    radius,
                    startAngle,
                    endAngle
                  );
                }}
                className="w-full p-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Create Curved Rows
              </button>
            </div>

            <div className="p-3 border rounded bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Settings</h4>
              <div className="mb-2">
                <label className="block text-xs text-gray-600">Grid Size</label>
                <input
                  type="number"
                  value={gridSize}
                  onChange={(e) => setGridSize(parseInt(e.target.value))}
                  min="5"
                  max="50"
                  className="w-full p-1 text-sm border rounded"
                />
              </div>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="showGridCheck"
                  checked={showGrid}
                  onChange={() => setShowGrid(!showGrid)}
                  className="mr-2"
                />
                <label htmlFor="showGridCheck" className="text-xs">
                  Show Grid
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showLabelsCheck"
                  checked={showLabels}
                  onChange={() => setShowLabels(!showLabels)}
                  className="mr-2"
                />
                <label htmlFor="showLabelsCheck" className="text-xs">
                  Show Labels
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-grow overflow-hidden bg-white">
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          onWheel={handleWheel}
          onClick={handleStageClick}
          onTap={handleStageClick}
          scaleX={scale}
          scaleY={scale}
          x={stagePos.x}
          y={stagePos.y}
          draggable={activeTool === "select"}
          onDragEnd={(e) => {
            setStagePos({ x: e.target.x(), y: e.target.y() });
          }}
        >
          <Layer>
            {/* Grid */}
            {gridLines}

            {/* Sections */}
            {sections.map((section) => (
              <Group key={section.id}>
                <Line
                  points={section.points}
                  closed
                  fill={section.color}
                  stroke="#666"
                  strokeWidth={1}
                />
                <Text
                  x={section.points[0]}
                  y={section.points[1] - 20}
                  text={section.name}
                  fontSize={14}
                  fill="#000"
                />
              </Group>
            ))}

            {/* Section being created */}
            {isCreatingSection && sectionPoints.length > 0 && (
              <Group>
                <Line
                  points={sectionPoints.flatMap((p) => [p.x, p.y])}
                  closed={false}
                  stroke="#666"
                  strokeWidth={2}
                  dash={[5, 5]}
                />
                {sectionPoints.map((point, i) => (
                  <Circle
                    key={i}
                    x={point.x}
                    y={point.y}
                    radius={4}
                    fill="#666"
                  />
                ))}
              </Group>
            )}

            {/* Seats */}
            {seats.map((seat) => renderSeat(seat))}
          </Layer>
        </Stage>
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-800 text-white text-xs py-1 px-3 flex">
        <div className="mr-4">Zoom: {Math.round(scale * 100)}%</div>
        <div className="mr-4">Seats: {seats.length}</div>
        <div className="mr-4">Selected: {selectedSeats.length}</div>
        <div className="mr-4">
          Tool: {activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}
        </div>
        {isCreatingSection && (
          <div className="mr-4">Section Points: {sectionPoints.length}</div>
        )}
        <div className="flex-grow"></div>
        <div>Press ESC to cancel | DEL to delete | CTRL for multi-select</div>
      </div>
    </div>
  );
};

export default AdvancedSeatEditor;
