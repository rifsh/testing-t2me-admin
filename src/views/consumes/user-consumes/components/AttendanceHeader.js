import React from 'react';
import { Users } from 'lucide-react';

const AttendanceHeader = ({ booking_ticket_id, total, present }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    {/* User Icon with Gradient Background */}
                    <div className="p-3 rounded-full bg-attendance-gradient">
                        <Users className="w-6 h-6 text-white" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">User Check-in Management</h1>
                        {/* <div className="flex items-center space-x-2 mb-6">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <h2 className="text-lg font-semibold text-gray-800">
                                Booking ID: {booking_ticket_id}
                            </h2>
                        </div> */}
                    </div>
                </div>

                {/* Gradient Text for Present/Total */}
                <div className="text-right">
                    <div className="text-2xl font-bold bg-attendance-gradient bg-clip-text text-transparent">
                        {present}/{total}
                    </div>
                    <div className="text-sm text-gray-500">Present</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="h-2 rounded-full transition-all duration-300 bg-attendance-gradient"
                    style={{ width: `${total > 0 ? (present / total) * 100 : 0}%` }}
                />
            </div>
        </div>
    );
};

export default AttendanceHeader;
