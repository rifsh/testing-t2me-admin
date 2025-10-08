import React, { useEffect, useState } from 'react';
import AttendanceHeader from '../components/AttendanceHeader';
import BookingCard from '../components/BookingCard';
import AttendanceFooter from '../components/AttendanceFooter';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { cosnumeTicketUsers, fetchTcketUsers } from 'store/slices/qrVerificationSlice';
import LoadingOverlay from 'components/util-components/Loader';
import { message } from 'antd';

const ConsumeUserList = () => {
    const dispatch = useDispatch();
    const { id, eventId } = useParams();
    const { loading, submitLoading, response } = useSelector((state) => state.qr);
    const [attendanceData, setAttendanceData] = useState([]);

    useEffect(() => {
        if (id) {
            dispatch(fetchTcketUsers({ booking_ticket_id: id, event_id: eventId }));
        }
    }, [id, dispatch]);

    useEffect(() => {
        if (response) {
            const formatted = Array.isArray(response) ? response : [response];

            // Add temporary editable field for users who are not consumed
            const formattedWithEditable = formatted.map(booking => ({
                ...booking,
                jsonb_data: booking.jsonb_data?.map(user => ({
                    ...user,
                    // Users who are already consumed should not be editable
                    editable: !user.consumed
                })) || []
            }));

            setAttendanceData(formattedWithEditable);
        }
    }, [response]);

    const toggleAttendance = (bookingIndex, userIndex) => {
        setAttendanceData((prev) =>
            prev.map((booking, bIndex) =>
                bIndex === bookingIndex
                    ? {
                        ...booking,
                        jsonb_data: booking.jsonb_data.map((user, uIndex) =>
                            uIndex === userIndex && !user.consumed 
                                ? {
                                    ...user,
                                    tempConsumed: !user.tempConsumed,
                                }
                                : user
                        ),
                    }
                    : booking
            )
        );
    };

    const handleSubmit = async () => {
        if (attendanceData.length === 0) return;

        const booking = attendanceData[0];

        const formattedData = {
            id: booking.id,
            users: booking.jsonb_data
                ?.filter((user) => user.tempConsumed)
                .map((user) => ({
                    age: user.age,
                    sex: user.sex,
                    name: user.name,
                    email: user.email,
                    user_id: user.user_id,
                    consumed: true,
                })) || [],
        };

        if (formattedData.users?.length === 0) {
            message.warning("No new users selected");
            return;
        }

        try {
            const response = await dispatch(
                cosnumeTicketUsers({
                    pageData: formattedData,
                    bookingTicketId: booking.booking_ticket_id,
                })
            ).unwrap();
            dispatch(fetchTcketUsers({ booking_ticket_id: id, event_id: eventId }));
        } catch (error) {
            console.log('Somthing went wrong', error);
        }
    };


    const getTotalUsers = () =>
        attendanceData.reduce(
            (total, booking) => total + (booking.jsonb_data?.length || 0),
            0
        );

    const getPresentUsers = () =>
        attendanceData.reduce(
            (total, booking) =>
                total + (booking.jsonb_data?.filter((user) => user.consumed).length || 0),
            0
        );

    if (loading) {
        return <LoadingOverlay loading={true} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <AttendanceHeader total={getTotalUsers()} present={getPresentUsers()} />

                {/* Booking List */}
                {attendanceData.length > 0 ? (
                    attendanceData.map((booking, bookingIndex) => (
                        <BookingCard
                            key={booking.id || bookingIndex}
                            booking={booking}
                            bookingIndex={bookingIndex}
                            toggleAttendance={toggleAttendance}
                            // Pass down the editable information
                            isUserEditable={(userIndex) =>
                                booking.jsonb_data[userIndex]?.editable !== false
                            }
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-600 mt-10">No participants found.</p>
                )}

                {/* Footer */}
                {attendanceData.length > 0 && (
                    <AttendanceFooter
                        loading={submitLoading}
                        total={getTotalUsers()}
                        present={getPresentUsers()}
                        handleSubmit={handleSubmit}
                    />
                )}
            </div>
        </div>
    );
};

export default ConsumeUserList;