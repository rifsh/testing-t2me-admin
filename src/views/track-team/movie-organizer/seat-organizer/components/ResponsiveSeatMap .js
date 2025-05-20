import { useState, useRef, useEffect } from 'react';
import { useGesture } from '@use-gesture/react';
import { Tooltip, Typography } from 'antd';
const { Title, Text, Paragraph } = Typography;

const ResponsiveSeatMap = ({ TrackrequestSeatsDetails }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState([0, 0]);
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    // Handle window resize
    useEffect(() => {   
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
            // Reset zoom and position on resize for better mobile experience
            setScale(1);
            setPosition([0, 0]);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Zoom and pan gestures
    useGesture(
        {
            onPinch: ({ offset: [d] }) => {
                setScale(d);
            },
            onWheel: ({ delta: [, dy], event }) => {
                event.preventDefault();
                setScale((prev) => Math.max(0.5, Math.min(3, prev - dy * 0.001)));
            },
        },
        {
            target: contentRef,
            drag: {
                bounds: containerRef,
                rubberband: true,
            },
            pinch: { scaleBounds: { min: 0.5, max: 3 } },
            wheel: { enabled: true },
        }
    );

    useEffect(() => {
        if (TrackrequestSeatsDetails) {
            console.log("TrackrequestSeatsDetails", TrackrequestSeatsDetails?.
                seat_data
            )
        }
    }, [TrackrequestSeatsDetails]);

    const renderSeatMap = () => {
        if (!TrackrequestSeatsDetails?.seat_data?.seats) {
            return <div className="text-white p-4">No seat data available</div>;
        }

        // Calculate responsive seat size based on window width
        const seatSize = windowSize.width < 768 ? 6 : 8;
        const rowLabelWidth = windowSize.width < 768 ? 4 : 6;

        return (
            <div className="flex flex-col items-center space-y-2">
                {TrackrequestSeatsDetails.seat_data.seats.map((row, rowIndex) => (
                    <div key={`row-${rowIndex}`} className="flex items-center space-x-1 md:space-x-2">
                        <div className={`w-${rowLabelWidth} text-gray-300 text-center text-xs md:text-sm`}>
                            {row[0]?.rowLabel}
                        </div>
                        <div className="flex space-x-1 md:space-x-2">
                            {row.map((seat) => {
                                const isPlaceholder = !seat.rowLabel;
                                const seatType = getSeatType(seat.type);

                                return (
                                    <Tooltip
                                        key={seat.id}
                                        title={
                                            isPlaceholder
                                                ? ''
                                                : `${seat.rowLabel}${seat.colIndex + 1} - ${seat.type}`
                                        }
                                    >
                                        <div
                                            className={`w-${seatSize} h-${seatSize} rounded-t-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:opacity-80`}
                                            onClick={() => !isPlaceholder && handleSeatClick(seat)}
                                            style={{
                                                backgroundColor: seat.rowLabel ? seatType.color : ''
                                            }}
                                        >
                                            {!isPlaceholder && (
                                                <Text className="text-white text-xs">{seat.colIndex + 1}</Text>
                                            )}
                                        </div>
                                    </Tooltip>
                                );
                            })}
                        </div>
                        <div className={`w-${rowLabelWidth} text-gray-300 text-center text-xs md:text-sm`}>
                            {row[0]?.rowLabel}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const handleSeatClick = (seat) => {
        // Handle seat selection logic
        console.log('Seat selected:', seat);
    };

    const handleZoomIn = () => {
        setScale((prev) => Math.min(3, prev + 0.2));
    };

    const handleZoomOut = () => {
        setScale((prev) => Math.max(0.5, prev - 0.2));
    };

    const handleResetZoom = () => {
        setScale(1);
        setPosition([0, 0]);
    };

    const { seatTypes } = TrackrequestSeatsDetails?.seat_data;

    const getSeatType = (typeId) => {
        return (
            seatTypes?.find((type) => type.id === typeId) || {
                label: "Unknown",
                color: "#999",
                basePrice: 0,
            }
        );
    };

    const renderSeatTypeLegend = () => {
        if (!TrackrequestSeatsDetails?.
            seat_data?.seatTypes || !TrackrequestSeatsDetails?.
                seat_data?.seatTypes) return null;

        return (
            <div className="mt-4 md:mt-8 flex flex-wrap justify-center gap-3 md:gap-6 px-4 pb-4">
                {TrackrequestSeatsDetails?.seat_data?.seatTypes.map((type) => {
                    return (
                        <div key={type.id} className="flex items-center">
                            <div
                                className="w-3 h-3 md:w-4 md:h-4 rounded-sm mr-2"
                                style={{ backgroundColor: type.color }}
                            ></div>
                            <Text className="text-white text-xs">{type.label}</Text>
                        </div>
                    );
                })}

            </div>
        );
    };

    return (
        <div className="relative h-full w-full overflow-hidden bg-gray-900 rounded-lg">
            {/* Zoom controls */}
            <div className="absolute top-4 right-4 z-10 flex space-x-2 bg-gray-800 p-2 rounded-lg">
                <button
                    onClick={handleZoomIn}
                    className="text-white bg-gray-700 hover:bg-gray-600 w-8 h-8 rounded flex items-center justify-center"
                    aria-label="Zoom in"
                >
                    +
                </button>
                <button
                    onClick={handleZoomOut}
                    className="text-white bg-gray-700 hover:bg-gray-600 w-8 h-8 rounded flex items-center justify-center"
                    aria-label="Zoom out"
                >
                    -
                </button>
                <button
                    onClick={handleResetZoom}
                    className="text-white bg-gray-700 hover:bg-gray-600 w-8 h-8 rounded flex items-center justify-center text-xs"
                    aria-label="Reset zoom"
                >
                    ⟲
                </button>
            </div>

            {/* Screen representation */}
            <div className="w-full mb-4 md:mb-8 pt-4">
                <div className="h-4 md:h-6 bg-blue-400 bg-opacity-70 rounded-t-lg mx-auto w-4/5 flex items-center justify-center">
                    <Text className="text-white text-xs">SCREEN</Text>
                </div>
                <div className="h-1 bg-blue-300 w-4/5 mx-auto mb-6 md:mb-10"></div>
            </div>

            {/* Seat map container with transform */}
            <div
                ref={containerRef}
                className="h-[60vh] w-full overflow-hidden touch-none"
            >
                <div
                    ref={contentRef}
                    className="origin-top transform-gpu"
                    style={{
                        transform: `translate(${position[0]}px, ${position[1]}px) scale(${scale})`,
                        touchAction: 'none',
                    }}
                >
                    {renderSeatMap()}
                </div>
            </div>
            {/* Seat type legend */}
            {renderSeatTypeLegend()}
            {/* Mobile instructions */}
            {windowSize.width < 768 && (
                <div className="text-center text-gray-400 text-xs pb-2">
                    Pinch to zoom, drag to pan
                </div>
            )}
        </div>
    );
};

export default ResponsiveSeatMap;