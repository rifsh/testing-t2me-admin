import React, { useState, useEffect } from 'react';
import {
    Card, Row, Col, Space, Empty, Button
} from 'antd';
import {
    TeamOutlined,
    FormOutlined
} from '@ant-design/icons';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { useNavigate } from 'react-router-dom';

const SeatStructure = ({ SeatStructure }) => {
    const navigate = useNavigate();
    const [zoomLevel, setZoomLevel] = useState(1);
    const { seats, seatTypes } = SeatStructure;
    const seatMatrix = [];

    seats.forEach((row) => {
        const newRow = Array.isArray(row) ? [...row] : [];
        seatMatrix.push(newRow);
    });


    const handleZoomIn = () => {
        if (zoomLevel < 2) {
            setZoomLevel((prev) => Math.min(prev + 0.2, 2));
        }
    };

    const handleZoomOut = () => {
        if (zoomLevel > 0.6) {
            setZoomLevel((prev) => Math.max(prev - 0.2, 0.6));
        }
    };

    const handleResetZoom = () => {
        setZoomLevel(1);
    };

    const getSeatType = (typeId) => {
        return (
            seatTypes.find((type) => type.id === typeId) || {
                label: "Unknown",
                color: "#999",
                basePrice: 0,
            }
        );
    };

    return (
        <div>
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={24}>
                    <Card
                        title={
                            <Row justify="space-between" align="middle" style={{ width: '100%' }}>
                                <Col>
                                    <Space>
                                        <TeamOutlined />
                                        <span>Seating Layout</span>
                                    </Space>
                                </Col>
                                {SeatStructure && <Col>
                                    <div className="flex justify-end mt-4 mb-2">
                                        <div className="inline-flex items-center gap-2 p-2 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700">
                                                Zoom: {Math.round(zoomLevel * 100)}%
                                            </span>
                                            <Button onClick={handleZoomOut} disabled={zoomLevel <= 0.6}>
                                                −
                                            </Button>
                                            <Button onClick={handleResetZoom}>Reset</Button>
                                            <Button onClick={handleZoomIn} disabled={zoomLevel >= 2}>
                                                +
                                            </Button>
                                        </div>
                                    </div>
                                </Col>}
                                <Col>
                                    <Button
                                        type="primary"
                                        icon={<FormOutlined />}
                                        onClick={() => navigate(`${APP_PREFIX_PATH}/seat/movie/add`)}
                                    >
                                        Add Seat
                                    </Button>
                                </Col>
                            </Row>
                        }
                    >
                        {SeatStructure ? (
                            <div className="p-6">
                                <div className="mb-10 text-center">
                                    <div
                                        className="h-8 bg-gray-700 rounded-t-lg w-3/4 mx-auto mb-2 shadow-md">
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">SCREEN</p>
                                </div>
                                <div className="flex justify-center overflow-x-auto">
                                    <div
                                        className="inline-block transition-transform duration-200"
                                        style={{
                                            transform: `scale(${zoomLevel})`,
                                            transformOrigin: "center center",
                                        }}
                                    >
                                        {seatMatrix.length > 0 ? (
                                            seatMatrix.map((row, rowIndex) => (
                                                <div
                                                    key={rowIndex}
                                                    className="flex mb-2 items-center justify-center"
                                                >
                                                    <div className="w-8 font-bold text-gray-700 text-center">
                                                        {row[0]?.rowLabel || ""}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {Array.isArray(row) &&
                                                            row.map((seat, seatIndex) => {
                                                                if (!seat || !seat.isVisible) {
                                                                    return (
                                                                        <div
                                                                            key={`empty-${rowIndex}-${seatIndex}`}
                                                                            className="w-8 h-8"
                                                                        ></div>
                                                                    );
                                                                }

                                                                const seatType = getSeatType(seat.type);

                                                                return (
                                                                    <div
                                                                        key={seat.id || `${rowIndex}-${seatIndex}`}
                                                                        className="w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium text-white shadow-sm"
                                                                        style={{ backgroundColor: seatType.color }}
                                                                        title={`${seat.rowLabel || ""}${seat.number || ""
                                                                            } - ${seatType.label} - $${seat.price || seatType.basePrice || 0
                                                                            }`}
                                                                    >
                                                                        {seat.number || ""}
                                                                    </div>
                                                                );
                                                            })}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-gray-500">No seating layout available</div>
                                        )}
                                    </div>
                                </div>

                                {/* <div className="mt-10 mb-4">
                                    <h4 className="text-lg font-semibold mb-4 text-center">Seat Types</h4>
                                    <div className="flex flex-wrap gap-4 justify-center">
                                        {seatTypes.map((type) => (
                                            <div key={type.id} className="flex items-center px-2 py-1">
                                                <div
                                                    className="w-3 h-3 rounded-md mr-2"
                                                    style={{ backgroundColor: type.color }}
                                                ></div>
                                                <span className="font-medium">
                                                    {type.label} - ${type.basePrice || 0}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div> */}
                            </div>
                        ) : (
                            <Empty
                                description="No seating layout available"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default SeatStructure