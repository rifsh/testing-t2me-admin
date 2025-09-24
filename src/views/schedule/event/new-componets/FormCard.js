import React, { useCallback, useEffect, useState } from "react";
import {
  Form,
  Select,
  Input,
  InputNumber,
  Spin,
  Empty,
  Button,
  message,
} from "antd";
import {
  SearchOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
  TagsOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllEvent, setSelectedEvent } from "store/slices/eventSlice";
import {
  resetSchedule,
  setAddOnServie,
  setScheduleSelectTime,
} from "store/slices/scheduleSlice";
import { setSelectedVenue } from "store/slices/locationSlice";
import { EVENT_TYPES } from "constants/PageConstants";
import { debounce } from "lodash";
import {
  getAvailableTicketsType,
  setSelectedTicketType,
} from "store/slices/ticketSlice";
import { getPaymentAddOnService } from "store/slices/paymentSlice";
import { AddOnsFoodTimeSlotes } from "./AddOnsFoodTimeSlotes";

const { Option } = Select;

const FormCard = ({ onSubmit, form }) => {
  const dispatch = useDispatch();

  // Redux state
  const {
    filteredEvents = [],
    loading,
    selectedEvent,
  } = useSelector((state) => state.event);
  const { availableTicketTyps, selectedTicketType } = useSelector(
    (state) => state.tickets
  );
  const { addOnServiceList } = useSelector((state) => state.payment);

  // Local state
  const [allowMultipleDates, setAllowMultipleDates] = useState(false);
  const [limitBookingsPerUser, setLimitBookingsPerUser] = useState(false);
  const [isPaymentRequired, setIsPaymentRequired] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  // Load initial data
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        await dispatch(
          fetchAllEvent({ event_type: EVENT_TYPES.event })
        ).unwrap();
        dispatch(getPaymentAddOnService());
      } catch (error) {
        console.error("Failed to fetch events:", error);
        message.error("Failed to load events");
      }
    };
    fetchEvents();
  }, [dispatch]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value) => {
      dispatch(fetchAllEvent({ event_type: EVENT_TYPES.event, search: value }));
    }, 500),
    [dispatch]
  );

  // Handle event selection
  const handleSelectEvent = (eventId) => {
    if (!eventId) {
      dispatch(setSelectedEvent(null));
      form.resetFields(["venue_id", "available_types"]);
      dispatch(resetSchedule());
      return;
    }

    dispatch(getAvailableTicketsType({ event_id: eventId }));

    const event = filteredEvents.find((event) => event.id === eventId);
    if (!event) return;

    dispatch(setScheduleSelectTime(false));
    dispatch(setSelectedEvent(event));

    const venueId = event.venues?.[0]?.id || null;
    dispatch(setSelectedVenue(venueId));

    // Auto-select first venue if available
    form.setFieldsValue({
      venue_id: venueId,
      available_types: undefined, // Reset booking type
    });

    dispatch(resetSchedule());
  };

  // Handle venue selection
  const handleSelectVenue = (venueId) => {
    if (!venueId) return;

    dispatch(setSelectedVenue(venueId));
    dispatch(resetSchedule());
  };

  // Handle booking type selection
  const handleBookingTypeChange = (typeId) => {
    dispatch(setSelectedTicketType(typeId));
  };

  // Handle search
  const handleSearch = (value) => {
    if (value && value.trim()) {
      debouncedSearch(value);
    } else {
      dispatch(fetchAllEvent({ event_type: EVENT_TYPES.event }));
    }
  };

  // Handle booking limit toggle
  const handleBookingLimitToggle = (enabled) => {
    setLimitBookingsPerUser(enabled);

    if (!enabled) {
      form.setFieldValue("booking_limit_per_user", undefined);
    }
  };

  // Handle multiple dates toggle
  const handleMultipleDatesToggle = (enabled) => {
    setAllowMultipleDates(enabled);
  };

  // Handle payment required toggle
  const handlePaymentRequiredToggle = (enabled) => {
    setIsPaymentRequired(enabled);
  };

  // Handle add-ons change
  const handleAddOnsChange = (addonName, checked) => {
    let updatedAddOns;

    if (checked) {
      updatedAddOns = [...selectedAddOns, addonName];
    } else {
      updatedAddOns = selectedAddOns.filter((addon) => addon !== addonName);
    }

    setSelectedAddOns(updatedAddOns);

    const addOnsData = (addOnServiceList?.available_add_ons || [])
      .filter((addon) => updatedAddOns.includes(addon.name))
      .map((addon) => ({
        name: addon.name,
        status: true,
        id: addon.id,
        price: addon.price,
      }));

    dispatch(setAddOnServie(addOnsData));
    form.setFieldValue("add_ons", updatedAddOns);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Prepare final data with toggle states
      const finalData = {
        ...values,
        is_multi_date: allowMultipleDates,
        payment_required: isPaymentRequired,
        booking_limit_per_user_toggle: limitBookingsPerUser,
        add_ons: selectedAddOns,
      };

      message.success("Form validation successful!");
      onSubmit(finalData);
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
      message.error("Please check the form fields and try again");
    }
  };

  // Handle cancel
  const handleCancel = () => {
    form.resetFields();
    setSelectedAddOns([]);
    setAllowMultipleDates(false);
    setLimitBookingsPerUser(false);
    setIsPaymentRequired(false);
    dispatch(setSelectedEvent(null));
    dispatch(resetSchedule());
    message.info("Form has been reset");
  };

  return (
    <div className="max-w-full m-6 bg-white rounded-xl shadow-md border border-gray-200">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">Event Schedule</h1>
        <div className="flex items-center space-x-3">
          <Button
            icon={<CloseOutlined />}
            onClick={handleCancel}
            className="flex items-center"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSubmit}
            loading={loading}
            className="bg-green-600 hover:bg-green-700 border-green-600"
          >
            {loading ? "Saving..." : "Save Schedule"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          scrollToFirstError
          requiredMark={false}
        >
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Form Fields */}
            <div className="col-span-8 space-y-8">
              {/* Basic Information Section */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Basic Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {/* Schedule Name */}
                  <Form.Item
                    name="name"
                    label={
                      <span className="text-sm font-medium text-gray-700">
                        Schedule Name <span className="text-red-500">*</span>
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please enter schedule name!",
                      },
                      {
                        min: 3,
                        message: "Schedule name must be at least 3 characters!",
                      },
                      {
                        max: 50,
                        message: "Schedule name cannot exceed 50 characters!",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter schedule name"
                      maxLength={50}
                      showCount
                    />
                  </Form.Item>

                  {/* Event */}
                  <Form.Item
                    name="event_id"
                    label={
                      <span className="text-sm font-medium text-gray-700">
                        Event <span className="text-red-500">*</span>
                      </span>
                    }
                    rules={[
                      { required: true, message: "Please select an event!" },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="Search and select event"
                      loading={loading}
                      onSearch={handleSearch}
                      onChange={handleSelectEvent}
                      allowClear
                      suffixIcon={<SearchOutlined />}
                      dropdownStyle={{
                        borderRadius: "8px",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                      }}
                      filterOption={(input, option) =>
                        option?.children
                          ?.toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      notFoundContent={
                        loading ? (
                          <div className="text-center py-4">
                            <Spin size="small" />
                            <div className="mt-2 text-gray-500">
                              Loading events...
                            </div>
                          </div>
                        ) : (
                          <Empty
                            description="No events found"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            className="py-4"
                          />
                        )
                      }
                    >
                      {filteredEvents.map((event) => (
                        <Option key={event.id} value={event.id}>
                          <div className="py-1">
                            <div className="font-medium text-gray-900 flex items-center">
                              <CalendarOutlined className="mr-2 text-blue-500" />
                              {event.event_name}
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  {/* Venue */}
                  {selectedEvent?.venues?.length > 0 && (
                    <Form.Item
                      name="venue_id"
                      label={
                        <span className="text-sm font-medium text-gray-700">
                          Venue <span className="text-red-500">*</span>
                        </span>
                      }
                      rules={[
                        { required: true, message: "Please select a venue!" },
                      ]}
                    >
                      <Select
                        placeholder="Select venue"
                        onChange={handleSelectVenue}
                        allowClear
                        dropdownStyle={{
                          borderRadius: "8px",
                          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {selectedEvent.venues.map((venue) => (
                          <Option key={venue.id} value={venue.id}>
                            <div className="flex items-center">
                              <EnvironmentOutlined className="mr-2 text-green-500" />
                              {venue.name}
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )}

                  {/* Booking Type */}
                  {availableTicketTyps?.available_types?.length > 0 && (
                    <Form.Item
                      name="available_types"
                      label={
                        <span className="text-sm font-medium text-gray-700">
                          Booking Type <span className="text-red-500">*</span>
                        </span>
                      }
                      rules={[
                        {
                          required: true,
                          message: "Please select booking type!",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Select booking type"
                        onChange={handleBookingTypeChange}
                        allowClear
                        dropdownStyle={{
                          borderRadius: "8px",
                          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {availableTicketTyps.available_types.map((type) => (
                          <Option key={type.id} value={type.id}>
                            <div className="flex items-center">
                              <TagsOutlined className="mr-2 text-purple-500" />
                              {type.name}
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Ticket Settings
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    name="max_ticket_per_booking"
                    label={
                      <span className="text-sm font-medium text-gray-700">
                        Max Tickets Per Booking{" "}
                        <span className="text-red-500">*</span>
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please enter max tickets per booking!",
                      },
                      {
                        type: "number",
                        min: 1,
                        message: "Must be at least 1 ticket!",
                      },
                      {
                        type: "number",
                        max: 100,
                        message: "Cannot exceed 100 tickets!",
                      },
                    ]}
                  >
                    <InputNumber
                      placeholder="Enter max tickets"
                      min={1}
                      className="w-full "
                      max={100}
                    />
                  </Form.Item>

                  {/* Booking Limit Per User */}
                  <Form.Item
                    name="booking_limit_per_user"
                    label={
                      <span className="text-sm font-medium text-gray-700">
                        Booking Limit Per User
                      </span>
                    }
                    rules={[
                      {
                        validator: (_, value) => {
                          if (limitBookingsPerUser && !value) {
                            return Promise.reject(
                              new Error("Please enter booking limit per user!")
                            );
                          }
                          if (value && value < 1) {
                            return Promise.reject(
                              new Error("Must be at least 1!")
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    tooltip={
                      limitBookingsPerUser
                        ? "Set maximum bookings per user"
                        : "Enable 'Limit Bookings Per User' first"
                    }
                  >
                    <InputNumber
                      placeholder={
                        limitBookingsPerUser
                          ? "Enter booking limit"
                          : "Enable 'Limit Bookings Per User' first"
                      }
                      min={1}
                      max={50}
                      disabled={!limitBookingsPerUser}
                      className="w-full "
                    />
                  </Form.Item>
                </div>
              </div>
              {selectedAddOns.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Add On Service Details
                  </h2>
                  <AddOnsFoodTimeSlotes form={form} />
                </div>
              )}
            </div>

            {/* Right Column - Custom Toggle Cards */}
            <div className="col-span-4 space-y-6">
              {/* Booking Settings Section */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Booking Settings
                </h2>
                <div className="space-y-3">
                  {/* Allow Multiple Dates Booking */}
                  <div
                    onClick={() =>
                      handleMultipleDatesToggle(!allowMultipleDates)
                    }
                    className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                      allowMultipleDates
                        ? "bg-red-50 border-2 border-red-200"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded flex items-center justify-center ${
                          allowMultipleDates ? "bg-red-500" : "bg-red-500"
                        }`}
                      >
                        <CalendarOutlined className="text-white text-sm" />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            allowMultipleDates
                              ? "text-red-900"
                              : "text-gray-900"
                          }`}
                        >
                          Allow Multiple Dates Booking
                        </p>
                        <p
                          className={`text-xs ${
                            allowMultipleDates
                              ? "text-red-700"
                              : "text-gray-500"
                          }`}
                        >
                          Enable custom booking for multiple days
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {allowMultipleDates ? (
                        <svg
                          className="w-5 h-5 text-red-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                      )}
                    </div>
                  </div>

                  {/* Limit Bookings Per User */}
                  <div
                    onClick={() =>
                      handleBookingLimitToggle(!limitBookingsPerUser)
                    }
                    className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                      limitBookingsPerUser
                        ? "bg-blue-50 border-2 border-blue-200"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded flex items-center justify-center bg-blue-500`}
                      >
                        <UserOutlined className="text-white text-sm" />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            limitBookingsPerUser
                              ? "text-blue-900"
                              : "text-gray-900"
                          }`}
                        >
                          Limit Bookings Per User
                        </p>
                        <p
                          className={`text-xs ${
                            limitBookingsPerUser
                              ? "text-blue-700"
                              : "text-gray-500"
                          }`}
                        >
                          Set booking limitations per user account
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {limitBookingsPerUser ? (
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                      )}
                    </div>
                  </div>

                  {/* Is Payment Required */}
                  <div
                    onClick={() =>
                      handlePaymentRequiredToggle(!isPaymentRequired)
                    }
                    className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                      isPaymentRequired
                        ? "bg-green-50 border-2 border-green-200"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded flex items-center justify-center bg-green-500">
                        <DollarOutlined className="text-white text-sm" />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            isPaymentRequired
                              ? "text-green-900"
                              : "text-gray-900"
                          }`}
                        >
                          Is Payment Required
                        </p>
                        <p
                          className={`text-xs ${
                            isPaymentRequired
                              ? "text-green-700"
                              : "text-gray-500"
                          }`}
                        >
                          Enable payment requirement for bookings
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isPaymentRequired ? (
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {addOnServiceList?.available_add_ons && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Add On Services
                  </h2>

                  {/* Hidden Form Item for Add-ons */}
                  <Form.Item name="add_ons" hidden>
                    <Input />
                  </Form.Item>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {addOnServiceList?.available_add_ons?.map((addon) => (
                      <div
                        key={addon.id}
                        onClick={() =>
                          handleAddOnsChange(
                            addon.name,
                            !selectedAddOns.includes(addon.name)
                          )
                        }
                        className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                          selectedAddOns.includes(addon.name)
                            ? "bg-yellow-50 border-2 border-yellow-200"
                            : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded flex items-center justify-center ${
                              selectedAddOns.includes(addon.name)
                                ? "bg-yellow-500"
                                : "bg-yellow-500"
                            }`}
                          >
                            <span className="text-white text-sm">
                              {addon.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p
                              className={`text-sm font-medium ${
                                selectedAddOns.includes(addon.name)
                                  ? "text-yellow-900"
                                  : "text-gray-900"
                              }`}
                            >
                              {addon.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedAddOns.includes(addon.name) ? (
                            <svg
                              className="w-5 h-5 text-yellow-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Form.Item name="is_multi_date" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="payment_required" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="booking_limit_per_user_toggle" hidden>
            <Input />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default FormCard;
