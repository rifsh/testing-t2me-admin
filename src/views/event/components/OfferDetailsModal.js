import React from "react";
import { Modal } from "antd";
import CDNImage from "components/layout-components/Image/CDNImage";

const OfferDetailsModal = ({ open, onClose, offer }) => {
    if (!offer) return null;

    const WEEKDAYS = [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
    ];

    const formatDate = (date) =>
        date
            ? new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })
            : "N/A";

    const formatDateTime = (date) =>
        new Date(date).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <Modal
            title="Offer Details"
            open={open}
            onCancel={onClose}
            footer={null}
            width={800}
            className="coupon-details-modal"
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                        {offer.thumbnail_image && offer.thumbnail_image !== "images" ? (
                            <CDNImage
                                src={`${offer.thumbnail_image}?v=${offer?.updated_at}`}
                                alt="Offer Thumbnail"
                                height={80}
                                width={80}
                                className="rounded-lg object-cover border-2 border-gray-200"
                            />
                        ) : (
                            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed">
                                <span className="text-gray-500 text-xs">No Image</span>
                            </div>
                        )}

                        <div>
                            <h2 className="text-2xl font-bold">{offer.name}</h2>
                            <div className="flex items-center space-x-2 mt-1">
                                <span
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${offer.status
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                        }`}
                                >
                                    {offer.status ? "Active Schedule" : "Inactive Schedule"}
                                </span>

                                <span
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${offer.is_active
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-gray-100 text-gray-800"
                                        }`}
                                >
                                    {offer.is_active ? "Active Offer" : "Inactive Offer"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">
                            {offer.is_percentage
                                ? `${offer.discount_percentage_amount}% OFF`
                                : offer.discount_percentage_amount?.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">Discount</div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Validity */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <h3 className="text-lg font-semibold">Validity Period</h3>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Start Date</span>
                            <span className="font-medium">{formatDate(offer.start_date)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">End Date</span>
                            <span className="font-medium">{formatDate(offer.end_date)}</span>
                        </div>
                    </div>

                    {/* Usage */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <h3 className="text-lg font-semibold">Usage Limits</h3>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Max Uses</span>
                            <span className="font-medium">{offer.max_uses}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Used Count</span>
                            <span className="font-medium">{offer.used_count}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Remaining Uses</span>
                            <span className="font-semibold text-blue-600">
                                {offer.max_uses - offer.used_count}
                            </span>
                        </div>
                    </div>

                    {/* Requirements */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <h3 className="text-lg font-semibold">Requirements</h3>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Min Purchase</span>
                            <span>{offer.min_purchase_amount?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Date Required</span>
                            <span className={offer.date_required ? "text-green-600" : ""}>
                                {offer.date_required ? "Yes" : "No"}
                            </span>
                        </div>
                    </div>

                    {/* Offer Types */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <h3 className="text-lg font-semibold">Offer Type</h3>

                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: "General", key: "is_general", color: "blue" },
                                { label: "Single Use", key: "is_single", color: "green" },
                                { label: "Offline", key: "is_offline", color: "purple" },
                                { label: "Reusable", key: "is_reusable", color: "orange" },
                            ].map((item) => (
                                <div
                                    key={item.key}
                                    className={`rounded text-center py-2 ${offer[item.key]
                                            ? `bg-${item.color}-100 text-${item.color}-800`
                                            : "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    <div className="font-medium text-sm">{item.label}</div>
                                    <div className="text-xs">{offer[item.key] ? "Yes" : "No"}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Keywords */}
                {offer.key_words?.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3">Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                            {offer.key_words.map((word, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                >
                                    {word}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Weekdays */}
                {offer.weekday_associations?.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3">Valid Days</h3>

                        <div className="grid grid-cols-7 gap-2">
                            {WEEKDAYS.map((day) => {
                                const active = offer.weekday_associations.some(
                                    (d) => d.weekday === day
                                );
                                return (
                                    <div
                                        key={day}
                                        className={`text-center py-2 rounded-lg ${active
                                                ? "bg-green-500 text-white"
                                                : "bg-gray-200 text-gray-500"
                                            }`}
                                    >
                                        {day.slice(0, 3)}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Timeline */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <h3 className="text-lg font-semibold">Timeline</h3>

                    <div className="flex justify-between">
                        <span className="text-gray-600">Created</span>
                        <span>{formatDateTime(offer.created_at)}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated</span>
                        <span>{formatDateTime(offer.updated_at)}</span>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default OfferDetailsModal;
