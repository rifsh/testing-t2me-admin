import React from "react";
import { Modal, Button } from "antd";
import { LockOutlined, InfoCircleOutlined } from "@ant-design/icons";

const getBlockingMessage = (blockingInfo) => {
  if (blockingInfo.isScheduleBlocked) {
    return {
      title: "Schedule Cannot Be Edited",
      message: "This schedule has active bookings and cannot be modified.",
      level: "schedule",
    };
  }

  const blockedDatesCount = blockingInfo.blockedDates?.size || 0;
  const blockedTimeSlotsCount = Array.from(
    blockingInfo.blockedTimeSlots?.values() || []
  ).reduce((sum, set) => sum + set.size, 0);

  if (blockedDatesCount > 0) {
    return {
      title: "Some Dates Are Locked",
      message: `${blockedDatesCount} date(s) have active bookings.`,
      level: "date",
    };
  }

  if (blockedTimeSlotsCount > 0) {
    return {
      title: "Some Time Slots Are Locked",
      message: `${blockedTimeSlotsCount} time slot(s) have active bookings.`,
      level: "timeSlot",
    };
  }

  return null;
};

export const BlockingWarningModal = ({
  visible,
  blockingInfo,
  onOk,
  onCancel,
}) => {
  const message = getBlockingMessage(blockingInfo);

  if (!message) return null;

  const isScheduleBlocked = message.level === "schedule";

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <LockOutlined className="text-red-500 text-lg" />
          <span className="text-lg font-semibold">{message.title}</span>
        </div>
      }
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      closable={!isScheduleBlocked}
      maskClosable={false}
      centered
      width={560}
      footer={
        isScheduleBlocked ? (
          <Button type="primary" onClick={onOk}>
            Go Back to List
          </Button>
        ) : (
          <div className="flex space-x-2 justify-end">
            <Button onClick={onCancel}>Go Back to List</Button>
            <Button type="primary" onClick={onOk}>
              I Understand, Continue
            </Button>
          </div>
        )
      }
    >
      <div className="py-4">
        <div className="flex items-start space-x-3">
          <InfoCircleOutlined className="text-blue-500 text-2xl mt-1" />
          <div className="flex-1">
            <p className="text-gray-700 mb-4">{message.message}</p>

            {blockingInfo.blockingTicketIds?.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                <p className="text-sm text-yellow-800">
                  <strong>Affected Tickets:</strong>{" "}
                  {blockingInfo.blockingTicketIds.length} ticket type(s)
                </p>
              </div>
            )}

            {blockingInfo.blockingSeatIds?.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                <p className="text-sm text-yellow-800">
                  <strong>Affected Seats:</strong>{" "}
                  {blockingInfo.blockingSeatIds.length} seat(s)
                </p>
              </div>
            )}

            {isScheduleBlocked && (
              <div className="bg-red-50 border-2 border-red-300 rounded p-4">
                <p className="text-sm text-red-800">
                  <strong>Important:</strong> You cannot make any changes to
                  this schedule. Please create a new schedule instead.
                </p>
              </div>
            )}

            {message.level === "date" && (
              <div className="bg-orange-50 border border-orange-200 rounded p-3">
                <p className="text-sm text-orange-800">
                  Locked dates are marked and cannot be modified. You can edit
                  other dates.
                </p>
              </div>
            )}

            {message.level === "timeSlot" && (
              <div className="bg-orange-50 border border-orange-200 rounded p-3">
                <p className="text-sm text-orange-800">
                  Locked time slots cannot be deleted or modified. You can add
                  new time slots.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BlockingWarningModal;
