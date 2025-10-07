import LoadingOverlay from 'components/util-components/Loader';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { cosnumeAddons, fetchTcketAddon } from 'store/slices/qrVerificationSlice';
import AttendanceFooter from 'views/consumes/user-consumes/components/AttendanceFooter';
import AttendanceHeader from 'views/consumes/user-consumes/components/AttendanceHeader';
import { Users, CheckCircle } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import FoodCheckInCard from '../components/FoodCheckInCard';
import EmptyState from '../components/EmptyState';

const ConsumeFoodList = () => {
    const dispatch = useDispatch();
    const { id, eventId } = useParams();
    const { loading, submitLoading, response } = useSelector((state) => state.qr);
    const [attendanceData, setAttendanceData] = useState([]);

    useEffect(() => {
        if (id) {
            dispatch(fetchTcketAddon({ booking_ticket_id: id, event_id: eventId }));
        }
    }, [id, dispatch, eventId]);

    useEffect(() => {
        if (response) {
            const formatted = Array.isArray(response) ? response : [response];
            const structured = formatted.map((item) => ({
                food_add_on_id: item.food_add_on_id,
                mapped_data:
                    item.mapped_data?.map((mapped) => ({
                        ...mapped,
                        editable: !mapped.consumed,
                        tempConsumed: mapped.consumed,
                    })) || [],
            }));
            setAttendanceData(structured);
        }
    }, [response]);

    const toggleAttendance = (addonIndex, userIndex) => {
        setAttendanceData((prev) =>
            prev.map((addon, aIndex) =>
                aIndex === addonIndex
                    ? {
                        ...addon,
                        mapped_data: addon.mapped_data.map((mapped, mIndex) =>
                            mIndex === userIndex && mapped.editable
                                ? { ...mapped, tempConsumed: !mapped.tempConsumed }
                                : mapped
                        ),
                    }
                    : addon
            )
        );
    };

    const getTotalUsers = () =>
        attendanceData.reduce(
            (total, addon) => total + (addon.mapped_data?.length || 0),
            0
        );

    const getPresentUsers = () =>
        attendanceData.reduce(
            (total, addon) =>
                total +
                (addon.mapped_data?.filter(
                    (mapped) => mapped.consumed || mapped.tempConsumed
                ).length || 0),
            0
        );

    const handleSubmit = async () => {
        const structuredDataArray = attendanceData
            .map((addon) => ({
                food_add_on_id: addon.food_add_on_id,
                selected_mappings: addon.mapped_data
                    .filter((mapped) => mapped.tempConsumed)
                    .map((mapped) => mapped.mapping_id),
            }))
            .filter((addon) => addon.selected_mappings.length > 0);

        const structuredData = structuredDataArray[0];

        console.log("Structured payload:", structuredData);
        try {
            const response = await dispatch(
                cosnumeAddons({
                    pageData: structuredData,
                    bookingTicketId: id,
                })
            ).unwrap();
            dispatch(fetchTcketAddon({ booking_ticket_id: id, event_id: eventId }));
        } catch (error) {
            console.log('Somthing went wrong', error);
        }
    };

    if (loading) {
        return <LoadingOverlay loading={true} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 pb-24">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <AttendanceHeader
                        title="Food Check-in Management"
                        total={getTotalUsers()}
                        present={getPresentUsers()}
                    />
                </div>

                {/* Food Add-on Cards */}
                <div className="space-y-4">
                    {attendanceData.length > 0 ? (
                        attendanceData.map((addon, addonIndex) => (
                            <FoodCheckInCard
                                key={addon.food_add_on_id}
                                addon={addon}
                                addonIndex={addonIndex}
                                toggleAttendance={toggleAttendance}
                            />
                        ))
                    ) : (
                        <EmptyState />
                    )}
                </div>

                {/* Footer */}
                {attendanceData.length > 0 && (
                    <div className="mt-6">
                        <AttendanceFooter
                            loading={submitLoading}
                            total={getTotalUsers()}
                            present={getPresentUsers()}
                            handleSubmit={handleSubmit}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConsumeFoodList;