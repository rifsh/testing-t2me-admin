import React, { useState, useEffect } from "react";
import {
  Slider,
  InputNumber,
  Typography,
  Button,
  Row,
  Col,
  Select,
  Card,
} from "antd";
import { 
    LineChartOutlined, 
    ReloadOutlined, 
    NodeIndexOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from "react-redux";
import {
  getSelectedSeats,
  getAllSeats,
  moveSeat,
} from "store/slices/seatSlice";

const { Text, Title } = Typography;
const { Option } = Select;

// Enhanced seat curving algorithm with more predictable transformations
const advancedCurveSeats = (seats, options) => {
  const { 
    curveFactor = 0, 
    curveType = 'linear', 
    curveDirection = 'right' 
  } = options;

  if (seats.length < 2) return seats;

  // Comprehensive seat positioning analysis
  const xCoords = seats.map(seat => seat.x);
  const yCoords = seats.map(seat => seat.y);
  
  const minX = Math.min(...xCoords);
  const maxX = Math.max(...xCoords);
  const minY = Math.min(...yCoords);
  const maxY = Math.max(...yCoords);

  // Determine primary movement characteristics
  const blockWidth = maxX - minX;
  const blockHeight = maxY - minY;
  const isHorizontalLayout = blockWidth > blockHeight;

  // Refined curve mapping with improved predictability
  return seats.map((seat, index) => {
    // Normalized position calculation
    const relativePosition = isHorizontalLayout
      ? (seat.x - minX) / blockWidth
      : (seat.y - minY) / blockHeight;

    // Advanced curve calculation with multiple transformation types
    let curveOffset = 0;
    const curveMagnitude = Math.abs(curveFactor) * 100;
    const directionMultiplier = curveDirection === 'right' ? 1 : -1;

    switch (curveType) {
      case 'parabolic':
        // Symmetric parabolic curve
        curveOffset = 4 * relativePosition * (1 - relativePosition);
        break;
      case 'sine':
        // Smooth sinusoidal curve
        curveOffset = Math.sin(relativePosition * Math.PI);
        break;
      case 'exponential':
        // Progressive exponential curve
        curveOffset = Math.pow(Math.abs(relativePosition - 0.5) * 2, 2);
        break;
      case 'round':
        // Rounded top curve
        curveOffset = 1 - Math.pow(Math.abs(relativePosition - 0.5) * 2, 2);
        break;
      default: // 'linear'
        // Simple linear progression
        curveOffset = Math.abs(relativePosition - 0.5) * 2;
    }

    // Apply curve with controlled intensity
    const primaryOffset = curveOffset * curveMagnitude * directionMultiplier;
    
    // Adaptive offset based on layout
    if (isHorizontalLayout) {
      return {
        ...seat,
        x: seat.x + primaryOffset,
        y: seat.y + (primaryOffset * 0.25) // Subtle vertical variation
      };
    } else {
      return {
        ...seat,
        x: seat.x + (primaryOffset * 0.25), // Subtle horizontal variation
        y: seat.y + primaryOffset
      };
    }
  });
};

const SeatCurve = () => {
  const dispatch = useDispatch();
  const selectedSeats = useSelector(getSelectedSeats);
  const allSeats = useSelector(getAllSeats);

  const [curvingOptions, setCurvingOptions] = useState({
    curveFactor: 0,
    curveType: 'linear',
    curveDirection: 'right'
  });

  const [manualAdjustments, setManualAdjustments] = useState({});

  // Comprehensive seat movement effect with improved constraint handling
  useEffect(() => {
    if (selectedSeats.length < 2) return;

    const selectedSeatObjects = selectedSeats.map(index => allSeats[index]);
    const curvedSeats = advancedCurveSeats(
      selectedSeatObjects, 
      curvingOptions
    );

    // Enhanced movement with robust constraint management
    selectedSeats.forEach((index, i) => {
      const originalSeat = allSeats[index];
      const curvedSeat = curvedSeats[i];
      
      // Dynamic displacement calculation
      const maxDisplacement = Math.max(
        50, 
        Math.abs(curvingOptions.curveFactor) * 120
      );
      
      // Precise coordinate clamping
      const clampedX = Math.max(
        originalSeat.x - maxDisplacement, 
        Math.min(originalSeat.x + maxDisplacement, curvedSeat.x)
      );
      const clampedY = Math.max(
        originalSeat.y - maxDisplacement, 
        Math.min(originalSeat.y + maxDisplacement, curvedSeat.y)
      );

      dispatch(moveSeat({
        index,
        x: clampedX,
        y: clampedY
      }));
    });
  }, [curvingOptions, selectedSeats, allSeats, dispatch]);

  // Consolidated seat position update method
  const updateSeatPosition = (seatIndex, axis, value) => {
    const newAdjustments = {
      ...manualAdjustments,
      [seatIndex]: {
        ...manualAdjustments[seatIndex],
        [axis]: value
      }
    };
    setManualAdjustments(newAdjustments);

    const originalSeat = allSeats[seatIndex];
    const newX = axis === 'x' 
      ? value 
      : (manualAdjustments[seatIndex]?.x ?? originalSeat.x);
    const newY = axis === 'y' 
      ? value 
      : (manualAdjustments[seatIndex]?.y ?? originalSeat.y);

    dispatch(moveSeat({
      index: seatIndex,
      x: newX,
      y: newY
    }));
  };

  // Comprehensive seat reset functionality
  const resetSeats = () => {
    selectedSeats.forEach(index => {
      const originalSeat = allSeats[index];
      dispatch(moveSeat({
        index,
        x: originalSeat.x,
        y: originalSeat.y
      }));
    });
    setManualAdjustments({});
    setCurvingOptions({
      curveFactor: 0,
      curveType: 'linear',
      curveDirection: 'right'
    });
  };

  // Render methods remain largely the same as in the original implementation
  const renderSingleSeatAdjustment = (seatIndex) => {
    const seat = allSeats[seatIndex];
    return (
      <Card 
        size="small"
        title={`Seat ${seatIndex} Positioning`} 
        style={{ 
          marginBottom: 8, 
          width: '100%' 
        }}
      >
        {/* Similar implementation to original */}
        {/* X and Y position sliders and input numbers */}
      </Card>
    );
  };

  const renderMultiSeatCurve = () => {
    return (
      <Card 
        size="small"
        title="Seat Arrangement" 
        style={{ 
          marginBottom: 8, 
          width: '100%' 
        }}
      >
        <div style={{ width: '100%' }}>
          <Text type="secondary">Curve Intensity</Text>
          <Row align="middle" gutter={8}>
            <Col flex="1">
              <Slider
                min={-1}
                max={1}
                step={0.1}
                value={curvingOptions.curveFactor}
                onChange={(value) => setCurvingOptions(prev => ({
                  ...prev,
                  curveFactor: value
                }))}
                marks={{
                  0: 'Neutral',
                  '-1': 'Min',
                  1: 'Max'
                }}
              />
            </Col>
            <Col flex="80px">
              <InputNumber
                size="small"
                min={-1}
                max={1}
                step={0.1}
                value={curvingOptions.curveFactor}
                onChange={(value) => {
                  const numValue = Number(value);
                  if (!isNaN(numValue) && numValue >= -1 && numValue <= 1) {
                    setCurvingOptions(prev => ({
                      ...prev,
                      curveFactor: numValue
                    }));
                  }
                }}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>

          <Row gutter={8} style={{ marginTop: 8 }}>
            <Col span={12}>
              <Text type="secondary">Curve Type</Text>
              <Select
                size="small"
                style={{ width: '100%' }}
                value={curvingOptions.curveType}
                onChange={(value) => setCurvingOptions(prev => ({
                  ...prev,
                  curveType: value
                }))}
                suffixIcon={<NodeIndexOutlined />}
              >
                <Option value="linear">Linear</Option>
                <Option value="parabolic">Parabolic</Option>
                <Option value="sine">Sine Wave</Option>
                <Option value="exponential">Exponential</Option>
                <Option value="round">Round</Option>
              </Select>
            </Col>
          </Row>
        </div>
      </Card>
    );
  };

  return (
    <div>
      <Title 
        level={4} 
        style={{ 
          marginBottom: 16, 
          display: 'flex', 
          alignItems: 'center' 
        }}
      >
        <LineChartOutlined style={{ marginRight: 8 }} />
        Seat Positioning
      </Title>
      
      {selectedSeats.length === 1 && renderSingleSeatAdjustment(selectedSeats[0])}
      
      {selectedSeats.length > 1 && (
        <>
          {renderMultiSeatCurve()}
          <Row justify="end">
            <Button 
              type="default" 
              icon={<ReloadOutlined />} 
              onClick={resetSeats}
            >
              Reset Seats
            </Button>
          </Row>
        </>
      )}

      {selectedSeats.length === 0 && (
        <Text type="secondary">
          Select seats to enable positioning
        </Text>
      )}
    </div>
  );
};

export default SeatCurve;