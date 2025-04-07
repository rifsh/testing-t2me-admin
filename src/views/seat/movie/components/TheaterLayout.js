import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  initializeSeats,
  updateSeats,
  updateSeatsRenumber,
  setRows,
  setColumns,
  setMode,
  setSelectedSeatType,
  startSelection,
  updateSelection,
  endSelection,
  clearSelection,
  addSeatType,
  updateSeatType,
  removeSeatType,
  toggleSeatVisibility,
  applySeatType,
  zoomIn,
  zoomOut,
  resetZoom,
} from "store/slices/movieSeatSlice";
import {
  Button,
  InputNumber,
  Form,
  Tooltip,
  Switch,
  Typography,
  Modal,
  Table,
  Tag,
  Input,
  Popover,
  Row,
  Col,
  Space,
  Badge,
  Card,
} from "antd";
import {
  PlusOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  UndoOutlined,
  SaveOutlined,
  SettingOutlined,
  DeleteOutlined,
  EditOutlined,
  BorderOuterOutlined,
  AppstoreOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

// Main Layout Component
const TheaterLayout = () => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showHiddenSeats, setShowHiddenSeats] = useState(true);

  const dispatch = useDispatch();
  const { selectedSeats, seats, selectedSeatType, seatTypes, zoomLevel } =
    useSelector((state) => state.movieSeatSlice);

  const handleApplyChanges = () => {
    if (selectedSeats.length === 0) return;

    dispatch(
      applySeatType({
        selectedSeats,
        selectedSeatType,
        seatTypes,
      })
    );

    dispatch(clearSelection());

    Modal.success({
      title: "Changes Applied",
      content: "Your seat changes have been applied successfully.",
    });
  };

  const handleSaveLayout = () => {
    Modal.success({
      title: "Layout Saved",
      content: "Your theater layout has been saved successfully.",
    });
  };

  // Handle visibility toggle for selected seats
  const handleToggleVisibility = () => {
    if (selectedSeats.length === 0) return;

    dispatch(
      toggleSeatVisibility({
        selectedSeats,
      })
    );

    dispatch(clearSelection());
  };

  // Zoom controls
  const handleZoomIn = () => {
    dispatch(zoomIn());
  };

  const handleZoomOut = () => {
    dispatch(zoomOut());
  };

  const handleResetZoom = () => {
    dispatch(resetZoom());
  };

  // Config panel content
  const configContent = <ConfigPanel />;

  // Type manager content
  const typeManagerContent = (
    <div style={{ width: 300 }}>
      <TypeManager />
    </div>
  );

  // Get the currently selected seat type object
  const getSelectedSeatTypeObject = () => {
    return (
      seatTypes.find((type) => type.id === selectedSeatType) || seatTypes[0]
    );
  };

  const selectedType = getSelectedSeatTypeObject();

  return (
    <div className="bg-gray-50 flex flex-col">
      {/* Single Row Toolbar */}
      <Card>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              {/* Layout Setup */}
              <Popover
                content={configContent}
                title="Layout Setup"
                trigger="click"
                placement="bottomLeft"
                overlayStyle={{ width: "300px" }}
              >
                <Button icon={<SettingOutlined />}>Layout</Button>
              </Popover>

              {/* Seat Types */}
              <Popover
                content={typeManagerContent}
                title="Seat Types"
                trigger="click"
                placement="bottomLeft"
              >
                <Button icon={<AppstoreOutlined />}>
                  <Badge color={selectedType.color}></Badge>
                  {selectedType.label}
                </Button>
              </Popover>

              {/* Zoom Controls */}
              <Button.Group>
                <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
                <Button style={{ width: "60px", pointerEvents: "none" }}>
                  {zoomLevel}%
                </Button>
                <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
                <Button icon={<UndoOutlined />} onClick={handleResetZoom} />
              </Button.Group>

              <Tooltip title="Preview Mode">
                <Switch
                  checked={isPreviewMode}
                  onChange={(checked) => setIsPreviewMode(checked)}
                  checkedChildren={<EyeOutlined />}
                  unCheckedChildren={<EditOutlined />}
                />
              </Tooltip>

              <Tooltip title="Show Hidden Seats">
                <Switch
                  checked={showHiddenSeats}
                  onChange={(checked) => setShowHiddenSeats(checked)}
                  checkedChildren={<EyeOutlined />}
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              </Tooltip>
            </div>

            <div className="flex items-center space-x-2">
              {!isPreviewMode && (
                <>
                  <Button
                    onClick={handleToggleVisibility}
                    disabled={selectedSeats.length === 0}
                  >
                    Toggle Visibility
                  </Button>

                  <Button
                    onClick={() => dispatch(clearSelection())}
                    disabled={selectedSeats.length === 0}
                  >
                    Clear ({selectedSeats.length})
                  </Button>

                  <Button
                    type="primary"
                    onClick={handleApplyChanges}
                    disabled={selectedSeats.length === 0}
                    icon={<SaveOutlined />}
                  >
                    Apply Changes
                  </Button>
                </>
              )}

              {isPreviewMode && (
                <Button
                  icon={<SaveOutlined />}
                  type="primary"
                  onClick={handleSaveLayout}
                >
                  Save Layout
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex-1 ">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <TheaterGrid
            isPreviewMode={isPreviewMode}
            showHiddenSeats={showHiddenSeats}
          />
        </div>
      </div>
    </div>
  );
};

// Configuration Panel
const ConfigPanel = () => {
  const dispatch = useDispatch();
  const { rows, columns } = useSelector((state) => state.movieSeatSlice);

  const handleGenerateLayout = () => {
    dispatch(initializeSeats({ rows, columns }));
  };

  return (
    <Form layout="vertical" size="small" style={{ width: "100%" }}>
      <Row gutter={8}>
        <Col span={12}>
          <Form.Item label="Rows" className="mb-2">
            <InputNumber
              value={rows}
              onChange={(value) => dispatch(setRows(value))}
              min={1}
              max={40}
              className="w-full"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Seats per Row" className="mb-2">
            <InputNumber
              value={columns}
              onChange={(value) => dispatch(setColumns(value))}
              min={1}
              max={50}
              className="w-full"
            />
          </Form.Item>
        </Col>
      </Row>

      <Button
        type="primary"
        onClick={handleGenerateLayout}
        className="w-full"
        icon={<BorderOuterOutlined />}
      >
        Generate Layout
      </Button>
    </Form>
  );
};

// Type Manager Component
const TypeManager = () => {
  const dispatch = useDispatch();
  const { seatTypes, selectedSeatType } = useSelector(
    (state) => state.movieSeatSlice
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [form] = Form.useForm();

  const showModal = (type = null) => {
    if (type) {
      setEditingType(type);
      form.setFieldsValue({
        id: type.id,
        label: type.label,
        basePrice: type.basePrice,
        color: type.color,
      });
    } else {
      setEditingType(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      const seatType = {
        id: values.id || values.label.toLowerCase().replace(/\s+/g, "_"),
        label: values.label,
        basePrice: parseFloat(values.basePrice),
        color: values.color,
      };

      if (editingType) {
        dispatch(updateSeatType(seatType));
      } else {
        dispatch(addSeatType(seatType));
      }

      setIsModalVisible(false);
    });
  };

  const handleRemoveSeatType = (typeId) => {
    dispatch(removeSeatType(typeId));
  };

  const handleSelectSeatType = (typeId) => {
    dispatch(setSelectedSeatType(typeId));
  };

  const columns = [
    {
      title: "Type",
      dataIndex: "label",
      key: "label",
      render: (text, record) => (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => handleSelectSeatType(record.id)}
        >
          <span
            className="inline-block w-4 h-4 mr-2 rounded-full"
            style={{
              backgroundColor: record.color,
              border: `2px solid ${record.color}`,
            }}
          />
          <span>{text}</span>
          {record.id === selectedSeatType && (
            <Badge color="blue" className="ml-2"></Badge>
          )}
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "basePrice",
      key: "basePrice",
      render: (price, record) => (
        <div
          className="cursor-pointer"
          onClick={() => handleSelectSeatType(record.id)}
        >
          ${price.toFixed(2)}
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => showModal(record)} size="small">
            <EditOutlined />
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleRemoveSeatType(record.id)}
            size="small"
          >
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          size="small"
        >
          Add Type
        </Button>
      </div>

      <Table
        dataSource={seatTypes}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
      />

      <Modal
        title={editingType ? "Edit Seat Type" : "Add Seat Type"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          {editingType && (
            <Form.Item
              name="id"
              label="ID"
              rules={[
                { required: true, message: "Please enter the seat type ID" },
              ]}
            >
              <Input disabled />
            </Form.Item>
          )}

          <Form.Item
            name="label"
            label="Label"
            rules={[
              { required: true, message: "Please enter the seat type label" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="basePrice"
            label="Base Price"
            rules={[{ required: true, message: "Please enter the base price" }]}
          >
            <InputNumber
              formatter={(value) => `$ ${value}`}
              parser={(value) => value.replace(/\$\s?/g, "")}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item name="color" label="Color">
            <Input type="color" style={{ width: "100%", height: "32px" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Theater Grid Component
const TheaterGrid = ({ isPreviewMode, showHiddenSeats }) => {
  const dispatch = useDispatch();
  const { seats, selectedSeats, seatTypes, zoomLevel } = useSelector(
    (state) => state.movieSeatSlice
  );
  const gridRef = useRef(null);

  // Helper function to get border color for seat type
  const getSeatBorder = (typeId) => {
    const type = seatTypes.find((t) => t.id === typeId);
    return type ? type.color : "#cccccc";
  };

  // Helper function to get fill color for seat type
  const getSeatFill = (typeId) => {
    const type = seatTypes.find((t) => t.id === typeId);
    return type ? type.color : "#ffffff";
  };

  // Event handlers for mouse interactions
  const handleMouseDown = (rowIndex, colIndex) => {
    if (!isPreviewMode) {
      dispatch(startSelection({ rowIndex, colIndex }));
    }
  };

  const handleMouseMove = (rowIndex, colIndex) => {
    if (!isPreviewMode) {
      dispatch(updateSelection({ rowIndex, colIndex, seats }));
    }
  };

  const handleMouseUp = () => {
    if (!isPreviewMode) {
      dispatch(endSelection());
    }
  };

  // Handle wheel zoom
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          dispatch(zoomIn());
        } else {
          dispatch(zoomOut());
        }
      }
    };

    const grid = gridRef.current;
    if (grid) {
      grid.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (grid) {
        grid.removeEventListener("wheel", handleWheel);
      }
    };
  }, [dispatch]);

  // Calculate appropriate seat size based on zoom level
  const getSeatSizeClass = () => {
    const baseSize = Math.max(
      Math.min(24, Math.floor(500 / Math.max(1, seats[0]?.length || 10))),
      16
    );
    return `${baseSize * (zoomLevel / 100)}px`;
  };

  if (seats.length === 0) {
    return (
      <Card>
        <div className="text-center p-8">
          <BorderOuterOutlined style={{ fontSize: "48px", color: "#d9d9d9" }} />
          <Text type="secondary" className="block mt-4 text-lg">
            No seat layout yet
          </Text>
          <Text type="secondary" className="block">
            Please use the Layout tool to generate a layout
          </Text>
        </div>
      </Card>
    );
  }

  const seatSize = getSeatSizeClass();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="relative overflow-auto p-4" style={{ height: "70vh" }}>
        {/* Screen */}
        <div className="mb-10 sticky top-0 z-10 bg-gradient-to-b from-white pb-4">
          <div
            className="mx-auto relative overflow-hidden bg-gradient-to-b from-gray-300 to-gray-400"
            style={{
              width: "80%",
              height: "10px",
              borderRadius: "100px / 50px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/50"></div>
          </div>
          <Text className="block text-center text-sm mt-2 font-medium text-gray-500">
            SCREEN
          </Text>
        </div>

        {/* Seats Grid */}
        <div
          className="flex flex-col items-center space-y-2 min-w-max"
          ref={gridRef}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: "top center",
          }}
        >
          {seats.map((row, rowIndex) => (
            <div key={rowIndex} className="flex items-center">
              {/* Row label */}
              <div
                className="flex items-center justify-center font-medium text-gray-600 mr-2"
                style={{ width: "24px" }}
              >
                {String.fromCharCode(65 + rowIndex)}
              </div>

              {/* Seats */}
              <div className="flex">
                {row.map((seat, colIndex) => {
                  // Skip rendering invisible seats if option is turned off
                  if (!seat.isVisible && !showHiddenSeats && !isPreviewMode) {
                    return null;
                  }

                  const isSelected = selectedSeats.includes(
                    `${rowIndex}-${colIndex}`
                  );
                  const showPreview = isPreviewMode && seat.isVisible;
                  const seatLabel = seat.number > 0 ? seat.number : "";
                  const seatId = `${seat.rowLabel}${seat.number || "0"}`;

                  return (
                    <div
                      key={colIndex}
                      className={`
                        relative flex items-center justify-center
                        ${!isPreviewMode ? "cursor-pointer" : ""}
                        transition-all duration-150
                        ${
                          isSelected
                            ? "ring-2 ring-blue-600 scale-110 z-10"
                            : ""
                        }
                      `}
                      style={{
                        width: seatSize,
                        height: seatSize,
                        margin: "2px",
                        opacity: !seat.isVisible ? 0.3 : 1,
                        backgroundColor: isSelected
                          ? "#e6f7ff"
                          : showPreview
                          ? getSeatFill(seat.type)
                          : "white",
                        border: `2px solid ${
                          isSelected ? "#1890ff" : getSeatBorder(seat.type)
                        }`,
                        borderRadius: "4px",
                      }}
                      onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                      onMouseMove={() => handleMouseMove(rowIndex, colIndex)}
                    >
                      <Tooltip title={`ID: ${seatId}, Type: ${seat.type}`}>
                        <Text
                          className="select-none text-xs font-medium"
                          style={{
                            color:
                              showPreview &&
                              getSeatFill(seat.type) !== "transparent"
                                ? "white"
                                : "inherit",
                          }}
                        >
                          {seatLabel}
                        </Text>
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        {isPreviewMode && (
          <div className="mt-8 pt-4 border-t border-gray-200 flex flex-wrap gap-3 justify-center">
            {seatTypes.map((type) => (
              <div key={type.id} className="flex items-center">
                <div
                  className="w-4 h-4 mr-1 rounded"
                  style={{ backgroundColor: type.color }}
                />

                <Text>
                  {type.label} - ${type.basePrice.toFixed(2)}
                </Text>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TheaterLayout;
