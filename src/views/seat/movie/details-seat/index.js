import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getMovieSeatStructureDetails } from "store/slices/movieSeatSlice";
import Loading from "components/shared-components/Loading";
import {
  LoadingOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Spin, Button, Result } from "antd";
import { APP_PREFIX_PATH } from "configs/AppConfig";

export default function SeatDetailsPage() {
  const [error, setError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const dispatch = useDispatch();
  const { seatId } = useParams();
  const { singleSeatStructure, loading } = useSelector(
    (state) => state.movieSeatSlice
  );
  const navigate = useNavigate();
  useEffect(() => {
    if (seatId) {
      dispatch(getMovieSeatStructureDetails({ seat_id: seatId }));
    }
  }, [seatId, dispatch]);

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

  const handleEdit = () => {
    navigate(`${APP_PREFIX_PATH}/seat/movie/edit/${seatId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Loading />
        <div className="mt-6 text-xl font-semibold text-gray-600">
          Loading Seat Structure
        </div>
        <div className="mt-2 text-gray-500 max-w-md text-center">
          Please wait while we retrieve the seating layout information
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Result
        status="error"
        icon={<ExclamationCircleOutlined className="text-red-500" />}
        title="Error Loading Seat Structure"
        subTitle={
          error ||
          "There was a problem retrieving the seat data. Please try again."
        }
        extra={[
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => {
              // Retry loading the data
              dispatch(getMovieSeatStructureDetails({ seat_id: seatId }));
            }}
            key="retry"
          >
            Try Again
          </Button>,
          <Button onClick={() => window.history.back()} key="back">
            Go Back
          </Button>,
        ]}
        className="shadow-md rounded-lg"
      />
    );
  }

  if (!singleSeatStructure) {
    return (
      <Result
        icon={
          <InboxOutlined className="text-gray-400" style={{ fontSize: 64 }} />
        }
        title="No Seat Data Available"
        subTitle="We couldn't find any seat structure data for this ID"
        extra={[
          <Button
            type="primary"
            onClick={() => window.history.back()}
            key="back"
          >
            Return to Previous Page
          </Button>,
          <Button
            onClick={() => {
              // Retry loading the data
              dispatch(getMovieSeatStructureDetails({ seat_id: seatId }));
            }}
            key="retry"
          >
            Retry
          </Button>,
        ]}
        className="bg-white shadow-md rounded-lg p-8 max-w-2xl mx-auto mt-12"
      />
    );
  }

  const { venue, screen, name, type, total_seats, seat_data } =
    singleSeatStructure;

  // Handle invalid seat structure data
  if (!seat_data || !seat_data.seats || !seat_data.seatTypes) {
    return (
      <Result
        status="warning"
        icon={<ExclamationCircleOutlined className="text-yellow-500" />}
        title="Invalid Seat Structure Data"
        subTitle="The seat structure data is incomplete or malformed"
        extra={[
          <Button
            type="primary"
            onClick={() => window.history.back()}
            key="back"
          >
            Return to Previous Page
          </Button>,
          <Button
            onClick={() => {
              dispatch(getMovieSeatStructureDetails({ seat_id: seatId }));
            }}
            key="retry"
          >
            Retry
          </Button>,
        ]}
        className="shadow-md rounded-lg"
      />
    );
  }

  const { seats, seatTypes } = seat_data;

  const seatMatrix = [];
  seats.forEach((row) => {
    const newRow = Array.isArray(row) ? [...row] : [];
    seatMatrix.push(newRow);
  });

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
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-gray-50 p-6 border-b border-gray-200 relative">
        <Button
          type="primary"
          icon={<EditOutlined />}
          className="absolute top-6 right-6"
          onClick={handleEdit}
        >
          Edit
        </Button>

        <div className="text-left">
          <h1 className="text-3xl font-bold text-gray-800">
            {name || "Unnamed Seat Structure"}
          </h1>
          <div className="mt-2 text-gray-600">
            <p className="text-lg">
              {venue?.name || "No Venue"} | {screen?.screen_name || "No Screen"}
            </p>
            <p className="mt-1">
              Type: <span className="font-medium">{type || "N/A"}</span> | Total
              Seats: <span className="font-medium">{total_seats || 0}</span>
            </p>
          </div>
        </div>
      </div>

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

      <div className="p-6">
        <div className="mb-10 text-center">
          <div className="h-8 bg-gray-700 rounded-t-lg w-3/4 mx-auto mb-2 shadow-md"></div>
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
                            title={`${seat.rowLabel || ""}${
                              seat.number || ""
                            } - ${seatType.label} - $${
                              seat.price || seatType.basePrice || 0
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

        <div className="mt-10 mb-4">
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
        </div>
      </div>
    </div>
  );
}
