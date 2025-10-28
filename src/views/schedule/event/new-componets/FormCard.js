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
  setScheduleFormData,
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
import { EDIT } from "constants/AppConstants";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const FormCard = ({ onSubmit, form, onCancel, mode }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Selectors with defaults
  const {
    filteredEvents = [],
    loading = false,
    selectedEvent = null,
  } = useSelector((state) => state.event || {});

  const { availableTicketTyps = {}, selectedTicketType = null } = useSelector(
    (state) => state.tickets || {}
  );

  const { addOnServiceList = {} } = useSelector((state) => state.payment || {});
  const { scheduleDetails } = useSelector((state) => state.schedules);
  const { scheduleFormData = {} } = useSelector(
    (state) => state.schedules || {}
  );

  // Local states
  const [allowMultipleDates, setAllowMultipleDates] = useState(
    scheduleFormData?.is_multi_date || false
  );
  const [limitBookingsPerUser, setLimitBookingsPerUser] = useState(
    scheduleFormData?.booking_limit_per_user_toggle || false
  );
  const [isPaymentRequired, setIsPaymentRequired] = useState(
    scheduleFormData?.payment_required !== false
  );
  const [selectedAddOns, setSelectedAddOns] = useState(() => {
    if (scheduleFormData?.add_ons?.length > 0) {
      return scheduleFormData.add_ons.map((addon) =>
        typeof addon === "string" ? addon : addon.name
      );
    }
    return [];
  });
  const [searchValue, setSearchValue] = useState("");

  // Safe access
  const availableTypes = availableTicketTyps?.available_types || [];
  const availableAddOns = addOnServiceList?.available_add_ons || [];

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          dispatch(fetchAllEvent({ event_type: EVENT_TYPES.event })).unwrap(),
          dispatch(getPaymentAddOnService()),
        ]);
      } catch (error) {
        message.error("Failed to load initial data");
      }
    };
    fetchInitialData();
  }, [dispatch]);

  // Edit mode setup
  useEffect(() => {
    if (
      mode === EDIT &&
      scheduleFormData?.event_id &&
      filteredEvents.length > 0
    ) {
      const event = filteredEvents.find(
        (e) => e.id === scheduleFormData.event_id
      );
      if (event) {
        dispatch(
          getAvailableTicketsType({ event_id: scheduleFormData.event_id })
        );
        dispatch(setScheduleSelectTime(false));
        dispatch(setSelectedEvent(event));
        if (scheduleFormData.venue_id) {
          dispatch(setSelectedVenue(scheduleFormData.venue_id));
        }
      }
    }
  }, [mode, scheduleFormData?.event_id, filteredEvents, dispatch]);

  // Initialize form fields
  useEffect(() => {
    if (scheduleFormData && Object.keys(scheduleFormData).length > 0) {
      form.setFieldsValue({
        name: scheduleFormData.name || "",
        event_id: scheduleFormData.event_id || null,
        venue_id: scheduleFormData.venue_id || null,
        available_types: scheduleFormData.available_types || null,
        max_ticket_per_booking: scheduleFormData.max_ticket_per_booking || null,
        booking_limit_per_user: scheduleFormData.booking_limit_per_user || null,
      });

      setAllowMultipleDates(scheduleFormData.is_multi_date || false);
      setLimitBookingsPerUser(
        scheduleFormData.booking_limit_per_user_toggle || false
      );
      setIsPaymentRequired(scheduleFormData.payment_required !== false);

      if (scheduleFormData.add_ons) {
        let addOnNames = [];
        if (Array.isArray(scheduleFormData.add_ons)) {
          addOnNames = scheduleFormData.add_ons
            .map((addon) => {
              if (typeof addon === "string") return addon;
              if (addon && addon.name) return addon.name;
              if (addon && typeof addon === "object")
                return addon.name || addon.addon_name || null;
              return null;
            })
            .filter(Boolean);
        }
        if (addOnNames.length > 0) {
          setSelectedAddOns(addOnNames);
          const addOnsData = availableAddOns
            .filter((addon) => addOnNames.includes(addon.name))
            .map(({ name, id, price }) => ({
              name,
              status: true,
              id,
              price,
            }));
          if (addOnsData.length) {
            dispatch(setAddOnServie(addOnsData));
          }
        }
      }

      if (scheduleFormData.event_id && filteredEvents.length > 0) {
        const event = filteredEvents.find(
          (e) => e.id === scheduleFormData.event_id
        );
        if (event) dispatch(setSelectedEvent(event));
      }
    }
  }, [scheduleFormData, form, dispatch, filteredEvents, availableAddOns]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(async (value) => {
      if (!value?.trim()) return;
      try {
        await dispatch(
          fetchAllEvent({ event_type: EVENT_TYPES.event, search: value })
        ).unwrap();
      } catch {
        message.error("Failed to search events");
      }
    }, 500),
    [dispatch]
  );

  // Update form data in Redux
  const updateFormData = (updates) => {
    const updatedData = {
      ...scheduleFormData,
      ...form.getFieldsValue(),
      ...updates,
      is_multi_date:
        updates.is_multi_date !== undefined
          ? updates.is_multi_date
          : scheduleFormData.is_multi_date,
      booking_limit_per_user_toggle:
        updates.booking_limit_per_user_toggle !== undefined
          ? updates.booking_limit_per_user_toggle
          : scheduleFormData.booking_limit_per_user_toggle,
      payment_required:
        updates.payment_required !== undefined
          ? updates.payment_required
          : scheduleFormData.payment_required,
    };
    dispatch(setScheduleFormData(updatedData));
  };

  const handleSelectEvent = (eventId) => {
    if (!eventId) {
      dispatch(setSelectedEvent(null));
      form.setFieldsValue({ venueid: null, availabletypes: null });
      dispatch(resetSchedule());
      return;
    }

    const event = filteredEvents.find((event) => event.id === eventId);
    if (!event) return;

    // Clear timeslots completely
    dispatch(
      setScheduleFormData({
        eventid: eventId,
        showdates: [],
        show_dates: [],
        timeSlots: {},
      })
    );

    dispatch(getAvailableTicketsType({ event_id: eventId }));
    dispatch(setScheduleSelectTime(false));
    dispatch(setSelectedEvent(event));

    const venueId = event.venues?.[0]?.id || null;
    if (venueId) {
      dispatch(setSelectedVenue(venueId));
      form.setFieldsValue({ venueid: venueId, availabletypes: null });
    }

    message.info("Event changed. Timeslots cleared.");
  };

  const handleSelectVenue = (venueId) => {
    if (!venueId) return;

    // Clear timeslots completely
    dispatch(
      setScheduleFormData({
        venueid: venueId,
        showdates: [],
        show_dates: [],
        timeSlots: {},
      })
    );

    dispatch(setSelectedVenue(venueId));
    dispatch(resetSchedule());
    message.info("Venue changed. Timeslots cleared.");
  };

  const handleBookingTypeChange = (name) => {
    // Clear timeslots completely
    dispatch(
      setScheduleFormData({
        availabletypes: name,
        showdates: [],
        show_dates: [],
        timeSlots: {},
      })
    );

    dispatch(setSelectedTicketType(name));
    message.info("Booking type changed. Timeslots cleared.");
  };

  const handleSearch = (value) => {
    setSearchValue(value);
    if (value?.trim()) {
      debouncedSearch(value.trim());
    } else {
      dispatch(fetchAllEvent({ event_type: EVENT_TYPES.event }));
    }
  };

  const handleMultipleDatesToggle = (e, enabled) => {
    e?.preventDefault();
    e?.stopPropagation();
    setAllowMultipleDates(enabled);
    dispatch(
      setScheduleFormData({ ...scheduleFormData, is_multi_date: enabled })
    );
  };

  const handleBookingLimitToggle = (e, enabled) => {
    e?.preventDefault();
    e?.stopPropagation();
    setLimitBookingsPerUser(enabled);
    if (!enabled) form.setFieldsValue({ booking_limit_per_user: null });
    dispatch(
      setScheduleFormData({
        ...scheduleFormData,
        booking_limit_per_user_toggle: enabled,
        booking_limit_per_user: enabled
          ? scheduleFormData.booking_limit_per_user
          : null,
      })
    );
  };

  const handlePaymentRequiredToggle = (e, enabled) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsPaymentRequired(enabled);
    dispatch(
      setScheduleFormData({ ...scheduleFormData, payment_required: enabled })
    );
  };

  const handleAddOnsChange = (addonName, shouldAdd) => {
    let updatedAddOns;
    if (shouldAdd) {
      updatedAddOns = selectedAddOns.includes(addonName)
        ? [...selectedAddOns]
        : [...selectedAddOns, addonName];
    } else {
      updatedAddOns = selectedAddOns.filter((addon) => addon !== addonName);
    }
    setSelectedAddOns(updatedAddOns);

    const addOnsData = availableAddOns
      .filter((addon) => updatedAddOns.includes(addon.name))
      .map(({ name, id, price }) => ({
        name,
        status: true,
        id,
        price,
      }));
    dispatch(setAddOnServie(addOnsData));
    form.setFieldsValue({ add_ons: updatedAddOns });
    updateFormData({ add_ons: addOnsData });
    message.success(
      shouldAdd
        ? `${addonName} addon added successfully!`
        : `${addonName} addon removed successfully!`
    );
  };

  const handleFormValueChange = (changedValues, allValues) => {
    updateFormData({
      ...allValues,
      is_multi_date: allowMultipleDates,
      payment_required: isPaymentRequired,
      booking_limit_per_user_toggle: limitBookingsPerUser,
      add_ons: selectedAddOns,
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const addOnsData = availableAddOns
        .filter((addon) => selectedAddOns.includes(addon.name))
        .map(({ name, id, price }) => ({
          name,
          status: true,
          id,
          price,
        }));

      const finalData = {
        ...scheduleFormData,
        ...values,
        is_multi_date: allowMultipleDates,
        payment_required: isPaymentRequired,
        booking_limit_per_user_toggle: limitBookingsPerUser,
        add_ons: addOnsData,
      };

      message.success("Form validation successful!");
      onSubmit(finalData);
    } catch (errorInfo) {
      message.error("Please check the form fields and try again");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedAddOns([]);
    setAllowMultipleDates(false);
    setLimitBookingsPerUser(false);
    setIsPaymentRequired(false);
    setSearchValue("");
    dispatch(setSelectedEvent(null));
    dispatch(resetSchedule());
    if (onCancel) onCancel();
    message.info("Form has been reset");
    navigate(-1);
  };

  return (
    <div className="max-w-full m-6 bg-white rounded-xl shadow-md border border-gray-200">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">Event Schedule</h1>
        <div className="flex items-center space-x-3">
          <Button icon={<CloseOutlined />} onClick={handleCancel}>
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

      <div className="p-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleFormValueChange}
          scrollToFirstError
          requiredMark={false}
        >
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8 space-y-8">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Basic Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
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
                      disabled={mode === EDIT}
                      onChange={handleSelectEvent}
                      allowClear
                      suffixIcon={<SearchOutlined />}
                      searchValue={searchValue}
                      onClear={() => {
                        setSearchValue("");
                        dispatch(
                          fetchAllEvent({ event_type: EVENT_TYPES.event })
                        );
                      }}
                      dropdownStyle={{
                        borderRadius: "8px",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                      }}
                      filterOption={false}
                      notFoundContent={
                        loading ? (
                          <div className="text-center py-4">
                            <Spin size="small" />
                            <div className="mt-2 text-gray-500">
                              Loading events...
                            </div>
                          </div>
                        ) : filteredEvents.length === 0 ? (
                          <Empty
                            description={
                              searchValue
                                ? "No events found for your search"
                                : "No events found"
                            }
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            className="py-4"
                          />
                        ) : null
                      }
                    >
                      {filteredEvents.map((event) => (
                        <Option key={event.id} value={event.id}>
                          <div className="font-medium text-gray-900 flex items-center">
                            <CalendarOutlined className="mr-2 text-blue-500" />
                            {event.event_name}
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  {(selectedEvent?.venues?.length > 0 ||
                    scheduleDetails?.venue) && (
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
                        disabled={mode === EDIT}
                        placeholder="Select venue"
                        onChange={handleSelectVenue}
                        allowClear
                        dropdownStyle={{
                          borderRadius: "8px",
                          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {selectedEvent?.venues?.length > 0
                          ? selectedEvent.venues.map((venue) => (
                              <Option key={venue.id} value={venue.id}>
                                <div className="flex items-center">
                                  <EnvironmentOutlined className="mr-2 text-green-500" />
                                  {venue.name}
                                </div>
                              </Option>
                            ))
                          : scheduleDetails?.venue && (
                              <Option
                                key={scheduleDetails.venue.id}
                                value={scheduleDetails.venue.id}
                              >
                                <div className="flex items-center">
                                  <EnvironmentOutlined className="mr-2 text-green-500" />
                                  {scheduleDetails.venue.name}
                                </div>
                              </Option>
                            )}
                      </Select>
                    </Form.Item>
                  )}

                  {(availableTypes.length > 0 || mode === EDIT) && (
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
                        disabled={mode === EDIT}
                        dropdownStyle={{
                          borderRadius: "8px",
                          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {availableTypes.map((type) => (
                          <Option key={type.id} value={type.code}>
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

              {/* Ticket Settings */}
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
                      max={100}
                      className="w-full"
                    />
                  </Form.Item>

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
                      className="w-full"
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Add On Service Details */}
              {selectedAddOns.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Add On Service Details
                  </h2>
                  <AddOnsFoodTimeSlotes form={form} />
                </div>
              )}
            </div>

            {/* Booking Settings */}
            <div className="col-span-4 space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Booking Settings
                </h2>
                <div className="space-y-3">
                  {/* <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMultipleDatesToggle(e, !allowMultipleDates);
                    }}
                    className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                      allowMultipleDates
                        ? "bg-red-50 border-2 border-red-200"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded flex items-center justify-center bg-red-500">
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
                  </div> */}

                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleBookingLimitToggle(e, !limitBookingsPerUser);
                    }}
                    className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                      limitBookingsPerUser
                        ? "bg-blue-50 border-2 border-blue-200"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded flex items-center justify-center bg-blue-500">
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

                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePaymentRequiredToggle(e, !isPaymentRequired);
                    }}
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

              {/* Add On Services */}
              {availableAddOns.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Add On Services
                  </h2>
                  <Form.Item name="add_ons" hidden>
                    <Input />
                  </Form.Item>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableAddOns.map((addon) => {
                      const isSelected = selectedAddOns.includes(addon.name);
                      return (
                        <div
                          key={addon.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddOnsChange(addon.name, !isSelected);
                          }}
                          className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "bg-yellow-50 border-2 border-yellow-200"
                              : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-8 h-8 rounded flex items-center justify-center ${
                                isSelected ? "bg-yellow-500" : "bg-gray-400"
                              }`}
                            >
                              <span className="text-white text-sm">
                                {addon.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p
                                className={`text-sm font-medium ${
                                  isSelected
                                    ? "text-yellow-900"
                                    : "text-gray-900"
                                }`}
                              >
                                {addon.name}
                              </p>
                              {addon.price && (
                                <p className="text-xs text-gray-500">
                                  ${addon.price}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isSelected ? (
                              <div className="w-5 h-5 bg-yellow-500 rounded flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hidden fields for form control */}
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
