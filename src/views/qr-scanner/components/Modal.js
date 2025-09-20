import React, { useState } from 'react';
import { Modal, Tag, Card, Image, Divider } from 'antd';
import {
    CalendarOutlined,
    EnvironmentOutlined,
    TagOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import { APP_PREFIX_PATH, CDN_PATH } from 'configs/AppConfig';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setScannerType, setServiceType } from 'store/slices/qrVerificationSlice';
import { ENTRY_TYPES, SCANNER_TYPES } from 'constants/QrConstants';

const AddOnsModal = ({ visible, onClose, eventData }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    if (!eventData) return null;

    const handleAddonClikc = () => {
        dispatch(setServiceType(ENTRY_TYPES.addon));
        dispatch(setScannerType(SCANNER_TYPES.addon));
        navigate(`${APP_PREFIX_PATH}/qr-scanner/${SCANNER_TYPES.addon}/${eventData?.id}`);
    }

    return (
        <Modal
            title={eventData.event_name}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
            className="modern-modal"
        >
            <div className="flex flex-col md:flex-row gap-6">
                {/* Event Image */}
                <div className="w-full md:w-2/5">
                    <Image
                        src={`${CDN_PATH}/${eventData.thumbnail_image}`}
                        alt={eventData.event_name}
                        className="rounded-lg object-cover h-48 w-full"
                        preview={false}
                    />

                    <div className="mt-4 space-y-2">
                        <div className="flex items-center text-gray-600">
                            <CalendarOutlined className="mr-2" />
                            <span>Created: {new Date(eventData.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center text-gray-600">
                            <EnvironmentOutlined className="mr-2" />
                            <span>Venue: {eventData.venues[0]?.name}</span>
                        </div>

                        <div className="flex items-center text-gray-600">
                            <TagOutlined className="mr-2" />
                            <span>Category: {eventData.category.name}</span>
                        </div>
                    </div>
                </div>

                {/* Event Details */}
                <div className="w-full md:w-3/5">
                    <p className="text-gray-700 mb-4">{eventData.description}</p>

                    <Divider className="my-4" />

                    {/* JSON Add-Ons Section */}
                    <div>
                        <h3 className="text-lg font-semibold flex items-center mb-3">
                            <InfoCircleOutlined className="mr-2 text-blue-500" />
                            Choose a Add-On
                        </h3>

                        {eventData.jsonb_add_ons && eventData.jsonb_add_ons.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {eventData.jsonb_add_ons.map((addOn, index) => (
                                    <Card
                                        key={index}
                                        size="small"
                                        className="border-blue-100 hover:border-blue-300 transition-colors shadow-sm cursor-pointer"
                                        onClick={() => handleAddonClikc(addOn)}
                                    >
                                        <div className="flex items-center">
                                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                                                <TagOutlined className="text-blue-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-800">{addOn.name}</h4>
                                                <p className="text-xs text-gray-500">ID: {addOn.id}</p>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">No add-ons available for this event</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default AddOnsModal;