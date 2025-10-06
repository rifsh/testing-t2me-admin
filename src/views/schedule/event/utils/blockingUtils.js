/**
 * Check if the entire schedule is blocked from editing
 */
export const isScheduleBlocked = (checkedScheduleDetails) => {
  if (!checkedScheduleDetails) return false;
  return checkedScheduleDetails.editable === false;
};

/**
 * Get comprehensive blocking information
 */
export const getBlockingInfo = (checkedScheduleDetails) => {
  if (!checkedScheduleDetails) {
    return {
      isScheduleBlocked: false,
      blockedDates: new Set(),
      blockedTimeSlots: new Map(),
      blockingTicketIds: [],
      blockingSeatIds: [],
      couponEditable: true,
      offerEditable: true,
      venueEditable: true,
      placeEditable: true,
    };
  }

  const blockedDates = new Set();
  const blockedTimeSlots = new Map();

  if (checkedScheduleDetails.show_dates) {
    checkedScheduleDetails.show_dates.forEach((dateInfo) => {
      if (dateInfo.editable === false) {
        blockedDates.add(dateInfo.show_date_id);
      } else if (dateInfo.show_times) {
        const blockedTimes = new Set();
        dateInfo.show_times.forEach((timeSlot) => {
          if (timeSlot.editable === false) {
            blockedTimes.add(timeSlot.show_time_id);
          }
        });
        if (blockedTimes.size > 0) {
          blockedTimeSlots.set(dateInfo.show_date_id, blockedTimes);
        }
      }
    });
  }

  return {
    isScheduleBlocked: checkedScheduleDetails.editable === false,
    blockedDates,
    blockedTimeSlots,
    blockingTicketIds: checkedScheduleDetails.blocking_ticket_ids || [],
    blockingSeatIds: checkedScheduleDetails.blocking_seat_ids || [],
    couponEditable: checkedScheduleDetails.coupon_editable !== false,
    offerEditable: checkedScheduleDetails.offer_editable !== false,
    venueEditable: checkedScheduleDetails.venue_editable !== false,
    placeEditable: checkedScheduleDetails.place_editable !== false,
  };
};

/**
 * Check if a specific date is blocked
 */
export const isDateBlocked = (blockingInfo, dateId) => {
  return blockingInfo?.blockedDates?.has(dateId) || false;
};

/**
 * Check if a specific time slot is blocked
 */
export const isTimeSlotBlocked = (blockingInfo, dateId, timeSlotId) => {
  if (!blockingInfo?.blockedTimeSlots) return false;
  const blockedTimes = blockingInfo.blockedTimeSlots.get(dateId);
  return blockedTimes?.has(timeSlotId) || false;
};

/**
 * Get CSS classes for blocked elements
 */
export const getBlockedClasses = (isBlocked) => {
  if (!isBlocked) return "";
  return "opacity-60 cursor-not-allowed bg-gray-100 border-red-300 pointer-events-none";
};
