import React from 'react';
import { Calendar } from 'lucide-react';
import UserCard from './UserCard';

const BookingCard = ({ booking, bookingIndex, toggleAttendance }) => {
    return (
        <div className="mb-6">
            <div className="flex items-center space-x-2 mb-6">
                <Calendar className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-800">
                    Booking ID: {booking.booking_ticket_id}
                </h2>
            </div>

            <div className="grid gap-4">
                {booking.jsonb_data.map((user, userIndex) => (
                    <UserCard
                        key={userIndex}
                        user={user}
                        bookingIndex={bookingIndex}
                        userIndex={userIndex}
                        toggleAttendance={toggleAttendance}
                        isEditable={user.editable}
                    />
                ))}
            </div>
        </div>
    );
};

export default BookingCard;
