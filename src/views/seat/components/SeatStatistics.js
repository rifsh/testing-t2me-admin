import React from "react";
import { useSelector } from "react-redux";
import { Card, Statistic, Tag } from "antd";
import { PiPaintBucket } from "react-icons/pi";
import { IoLayersOutline } from "react-icons/io5";
import { MdEventSeat } from "react-icons/md";
import { PiSelectionAllLight } from "react-icons/pi";
const SeatStatistics = () => {
  // Get state from Redux
  const seats = useSelector((state) => state.seat.seats);
  const selectedSeats = useSelector((state) => state.seat.selectedSeats);
  const drawings = useSelector((state) => state.seat.drawings);
  const categories = useSelector((state) => state.seat.categories);
  const activeCategory = useSelector((state) => state.seat.activeCategory);

  // Group seats by category
  const seatsByCategory = seats.reduce((acc, seat) => {
    acc[seat.categoryId] = (acc[seat.categoryId] || 0) + 1;
    return acc;
  }, {});

  // Get selected seats category information
  const selectedSeatCategories =
    selectedSeats.length > 0
      ? selectedSeats.reduce((acc, seatIndex) => {
          const seat = seats[seatIndex];
          const category = categories.find((cat) => cat.id === seat.categoryId);
          if (category) {
            acc[category.id] = (acc[category.id] || 0) + 1;
          }
          return acc;
        }, {})
      : {};

  // Find active category details
  const activeCategoryDetails = categories.find(
    (cat) => cat.id === activeCategory
  );

  return (
    <div className="p-4 space-y-4">
      <Card
        title="Seat Statistics"
        extra={<IoLayersOutline size={20} />}
        className="shadow-md"
      >
        <div className="grid grid-cols-2 gap-4">
          <Statistic
            title="Total Seats"
            value={seats.length}
            prefix={<MdEventSeat size={16} className="mr-2" />}
          />
          <Statistic
            title="Total Drawings"
            value={drawings.length}
            prefix={<PiPaintBucket size={16} className="mr-2" />}
          />
        </div>
      </Card>

      <Card
        title="Selected Seats"
        extra={<PiSelectionAllLight size={20} />}
        className="shadow-md"
      >
        <Statistic
          title="Number of Selected Seats"
          value={selectedSeats.length}
        />

        {selectedSeats.length > 0 && (
          <div className="mt-4">
            <h4 className="mb-2 font-semibold">Selected Seat Categories</h4>
            {Object.entries(selectedSeatCategories).map(
              ([categoryId, count]) => {
                const category = categories.find(
                  (cat) => cat.id === categoryId
                );
                return (
                  <Tag key={categoryId} color={category.color} className="mb-2">
                    {category.name}: {count} seat{count > 1 ? "s" : ""}
                  </Tag>
                );
              }
            )}
          </div>
        )}
      </Card>

      <Card
        title="Current Category"
        extra={<MdEventSeat />}
        className="shadow-md"
      >
        {activeCategoryDetails && (
          <div className="flex items-center">
            <div
              className="w-6 h-6 mr-2 rounded-full"
              style={{ backgroundColor: activeCategoryDetails.color }}
            />
            <div>
              <div className="font-semibold">{activeCategoryDetails.name}</div>
              <div className="text-gray-500">
                {seatsByCategory[activeCategory] || 0} seats
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SeatStatistics;
