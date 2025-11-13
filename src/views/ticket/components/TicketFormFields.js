// Enhanced TicketFormFields.js with proper draft support
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Card,
  Select,
  Button,
  message,
  Checkbox,
  Radio,
  Divider,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import Flex from "components/shared-components/Flex";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import { RulesMessageConstants } from "constants/RulesConstant";
import {
  getVenues,
  singleVenue,
  validateVenue,
  setPlaceValidationDialogVisible,
} from "store/slices/locationSlice";
import { useSelector, useDispatch } from "react-redux";
import {
  addTicket,
  editTicket,
  currentStepSaveUpdate,
  addOrUpdateTicketSet,
  resetTicketTypes,
  resetTicketSets,
  getSingleTicket,
} from "store/slices/ticketSlice";
import VenueListForm from "components/util-components/FormItems/VenueList";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import LoadingOverlay from "components/util-components/Loader/index";
import ValidationModal from "components/util-components/ModalItems/ValidationModal";
import BackButton from "components/Buttons/BackPageButoon";
import DraftSystem from "drafts/components/DraftSystem";

const TicketFormFields = ({ mode, ticketId }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    filteredVenues,
    ValidateData,
    validationStatus,
    placeValidationDialogVisible,
    message,
  } = useSelector((state) => state.locations);
  const tickets = useSelector((state) => state.tickets.ticketTypes);
  const VenueData = useSelector((state) =>
    state.locations.filteredVenues.find(
      (venue) => venue.id === form.getFieldValue("venue_id")
    )
  );
  const { loading, responseData, responseMessage, singleTicket } = useSelector(
    (state) => state.tickets
  );

  // State for draft system
  const [allFormData, setAllFormData] = useState({});
  const numberOfTickets = Form.useWatch("number_of_tickets", form);

  useEffect(() => {
    if (numberOfTickets) {
      form.setFieldsValue({ type_number_of_tickets: numberOfTickets });
    }
  }, [numberOfTickets, form]);

  useEffect(() => {
    if (mode === "EDIT" && ticketId) {
      dispatch(getSingleTicket(ticketId));
    }
  }, [mode, ticketId, dispatch]);

  useEffect(() => {
    if (mode === "EDIT" && ticketId && singleTicket) {
      console.log("📝 [EDIT MODE] Single ticket data received:", singleTicket);
      console.log(
        "📍 [EDIT MODE] Venue place data:",
        singleTicket.venue?.place
      );

      // Determine ticket type
      const ticketType = determineTicketType(
        singleTicket.ticket_types,
        singleTicket.is_dynamic
      );
      console.log("🎫 [EDIT MODE] Determined ticket type:", ticketType);

      // Prepare form values
      const formValues = {
        place_id: singleTicket.venue?.place?.id,
        place: `${singleTicket.venue.place.name}, ${singleTicket.venue.place.country.name}`,
        name: singleTicket.name,
        number_of_tickets: singleTicket.number_of_tickets,
        ticket_type: ticketType,
      };

      console.log("📋 [EDIT MODE] Form values to populate:", formValues);

      // If normal ticket type, populate the single ticket details
      if (ticketType === "normal" && singleTicket.ticket_types.length > 0) {
        const normalTicket = singleTicket.ticket_types[0];
        formValues.type_name = normalTicket.name;
        formValues.type_price = normalTicket.price;
        formValues.type_number_of_tickets = normalTicket.number_of_tickets;
        console.log("✅ [EDIT MODE] Normal ticket data added to form");
      }

      // Set form values
      form.setFieldsValue(formValues);
      console.log("✅ [EDIT MODE] Form values set");

      // If dynamic, populate Redux store properly for multi-step form
      if (ticketType === "dynamic") {
        console.log("🔄 [EDIT MODE] Setting up dynamic ticket data in Redux");

        // STEP 1: Initialize the base ticket structure FIRST
        console.log("🏗️ [EDIT MODE] Step 1: Initializing base ticket data");
        dispatch(
          addOrUpdateTicketSet({
            venue_id: singleTicket.venue?.id,
            place_id: singleTicket.venue?.place?.id,
            name: singleTicket.name,
            number_of_tickets: singleTicket.number_of_tickets,

            base_price: singleTicket.base_price,
          })
        );

        console.log("✅ [EDIT MODE] Base ticket data initialized");

        // STEP 2: Now add each ticket set one by one
        console.log("🎟️ [EDIT MODE] Step 2: Adding individual ticket sets");
        singleTicket.ticket_types.forEach((tt, index) => {
          const ticketSetData = {
            id: index,
            ticket_set: tt.ticket_set,
            tickets: [
              {
                id: `${index}-ticket-1`,
                name: tt.name,
                price: tt.price,
                number_of_tickets: tt.number_of_tickets,
                ticket_set: tt.ticket_set,
              },
            ],
          };

          console.log(
            `🎟️ [EDIT MODE] Dispatching ticket set ${index}:`,
            ticketSetData
          );
          dispatch(addOrUpdateTicketSet(ticketSetData));
          console.log(`✅ [EDIT MODE] Ticket set ${index} dispatched`);
        });

        console.log("✅ [EDIT MODE] All ticket sets dispatched to Redux");
      }

      // Trigger venue list if place_id is set
      if (formValues.place_id) {
        console.log(
          "🏢 [EDIT MODE] Fetching venues for place_id:",
          formValues.place_id
        );
        dispatch(getVenues({ place_id: formValues.place_id }));
      }

      console.log("✅ [EDIT MODE] Edit data population complete");
    }
  }, [mode, ticketId, singleTicket, dispatch, form]);

  const venueId = singleTicket?.venue?.id;

  useEffect(() => {
    if (mode === "EDIT" && venueId && filteredVenues.length > 0) {
      // Re-set venue only after venues list arrives
      form.setFieldsValue({ venue_id: venueId });
      console.log("✅ Venue populated after venue list loaded:", venueId);
    }
  }, [filteredVenues, venueId, mode]);

  // Enhanced function to get complete form data for draft
  const getCompleteFormData = () => {
    const mainFormValues = form.getFieldsValue();
    console.log("🎫 Getting complete ticket form data:", mainFormValues);

    // Include Redux state for tickets if available
    const ticketReduxData = tickets && tickets.length > 0 ? tickets[0] : null;

    const completeData = {
      ...mainFormValues,

      ...(ticketReduxData && {
        redux_ticket_data: {
          venue_id: ticketReduxData.venue_id,
          place_id: ticketReduxData.place_id,
          base_price: ticketReduxData.base_price,
          number_of_tickets: ticketReduxData.number_of_tickets,
        },
      }),
    };

    console.log("📊 Complete ticket form data:", {
      mainFields: Object.keys(mainFormValues),
      hasReduxData: !!ticketReduxData,
      completeFields: Object.keys(completeData),
    });

    return completeData;
  };

  // Add this function before the component or as a utility
  const determineTicketType = (ticketTypes, isDynamic) => {
    // 1️⃣ If backend provides isDynamic explicitly
    if (isDynamic !== null && isDynamic !== undefined) {
      return isDynamic ? "dynamic" : "normal";
    }

    // 2️⃣ Fallback to old logic
    if (!ticketTypes || ticketTypes.length === 0) return "normal";

    if (ticketTypes.length === 1) {
      const singleTicket = ticketTypes[0];

      if (singleTicket.name?.toLowerCase().includes("normal")) {
        return "normal";
      }
    }

    return "dynamic";
  };

  // Handle draft loaded - restore all form data
  const handleDraftLoaded = (draftData) => {
    console.log("📥 Loading ticket draft data:", draftData);

    const { formValues } = draftData;

    // Set all form values
    const formValuesToSet = { ...formValues };

    // Remove redux data from form values (it's metadata)
    if (formValuesToSet.redux_ticket_data) {
      delete formValuesToSet.redux_ticket_data;
    }

    form.setFieldsValue(formValuesToSet);

    // If there's redux data, dispatch it back to store
    if (formValues.redux_ticket_data) {
      console.log(
        "🔄 Restoring Redux ticket data:",
        formValues.redux_ticket_data
      );
      // You might need to dispatch actions to restore Redux state here
      // Example: dispatch(restoreTicketData(formValues.redux_ticket_data));
    }

    console.log("✅ Ticket form values set");
    setAllFormData(formValues);
  };

  const addTicketType = async () => {
    try {
      console.log("🚀 [ADD TICKET TYPE] Starting navigation to multi-step");
      const formValues = await form.validateFields();
      console.log("📋 [ADD TICKET TYPE] Form values validated:", formValues);

      // In edit mode, we don't need to dispatch here because data is already in Redux
      if (mode !== "EDIT") {
        console.log("➕ [ADD TICKET TYPE] ADD mode - dispatching form values");
        dispatch(addOrUpdateTicketSet(formValues));
      } else {
        console.log("✏️ [ADD TICKET TYPE] EDIT mode - data already in Redux");
        console.log("📦 [ADD TICKET TYPE] Current tickets in Redux:", tickets);
      }

      const navigationState = { mode, ticketId };
      console.log("🧭 [ADD TICKET TYPE] Navigation state:", navigationState);

      // Pass mode and ticketId as state to the multi-step form
      navigate(`${APP_PREFIX_PATH}/ticket/type/add`, {
        state: navigationState,
      });

      console.log("✅ [ADD TICKET TYPE] Navigation triggered");
    } catch (error) {
      console.error("❌ [ADD TICKET TYPE] Validation failed:", error);
    }
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();

      const isDynamic = values.ticket_type === "dynamic";

      const ticketData = {
        venue_id: values.venue_id,
        number_of_tickets: values.number_of_tickets,
        base_price: values.type_price,
        name: values.name,
        is_dynamic: isDynamic,
        ticket_types: [
          {
            id: "0-ticket-1",
            name: values.type_name,
            price: values.type_price,
            number_of_tickets: values.type_number_of_tickets,
            ticket_set: "Normal",
          },
        ],
      };

      if (mode === "EDIT" && ticketId) {
        ticketData.id = ticketId;
      }

      console.log(ticketData, "ticketData, from page");

      const resultAction = await dispatch(validateVenue(values.venue_id));

      if (validateVenue.fulfilled.match(resultAction)) {
        const response = resultAction.payload;
        if (response.message === "warning") {
          dispatch(setPlaceValidationDialogVisible(true));
        } else if (response.data && response.data[0]?.validation_status) {
          console.log("TICKET DATAXxxxxxxxxx ", ticketData);

          dispatch(setSelectedSubmitItem(ticketData));
        }
      }
    } catch (error) {
      console.log("Form validation failed:", error);
    }
  };

  const handleValidationModalCancel = () => {
    dispatch(setPlaceValidationDialogVisible(false));
  };

  useEffect(() => {
    dispatch(resetTicketTypes());
    dispatch(currentStepSaveUpdate(false));

    if (tickets && tickets.length > 0) {
      const ticket = tickets[0];
      if (ticket.base_price)
        form.setFieldsValue({ base_price: ticket.base_price });
      if (ticket.number_of_tickets)
        form.setFieldsValue({ number_of_tickets: ticket.number_of_tickets });
      if (ticket.venue_id) form.setFieldsValue({ venue_id: ticket.venue_id });
      if (ticket.place_id) form.setFieldsValue({ place_id: ticket.place_id });
    }
  }, []);

  const ticketType = Form.useWatch("ticket_type", form);

  return (
    <Form
      form={form}
      layout="vertical"
      key={`ticket-form-${JSON.stringify(allFormData)}`}
    >
      <Card title="Ticket Form">
        <PlaceWithCountryForm
          form={form}
          label={"Place"}
          onSelect={(id) => {
            dispatch(getVenues({ place_id: id }));
            form.setFieldsValue({ venue_id: null });
          }}
          rules={[{ required: true, message: RulesMessageConstants.PLACE }]}
        />
        <VenueListForm
          form={form}
          label="Venue"
          rules={[{ required: true, message: RulesMessageConstants.VENUE }]}
          onSelect={(value) => console.log("Selected Venue ID:", value)}
        />

        <Form.Item
          name="name"
          label="Ticket Type name"
          rules={[
            { required: true, message: "Please enter the number of tickets" },
          ]}
        >
          <Input placeholder="Enter Ticket Type Name" type="text" />
        </Form.Item>

        <Form.Item
          name="number_of_tickets"
          label="No of Tickets"
          rules={[
            { required: true, message: "Please enter the number of tickets" },
            {
              validator: (_, value) =>
                value && VenueData?.capacity && value > VenueData.capacity
                  ? Promise.reject(
                      new Error(
                        `The number of tickets cannot exceed the venue capacity of ${VenueData.capacity}.`
                      )
                    )
                  : Promise.resolve(),
            },
          ]}
        >
          <Input
            placeholder={
              VenueData
                ? `Venue Capacity: ${VenueData.capacity || 0}`
                : "Number of tickets"
            }
            type="number"
            onWheel={(e) => e.target.blur()}
          />
        </Form.Item>

        <Form.Item
          name="ticket_type"
          label="Ticket Structure Type"
          initialValue="normal"
        >
          <Radio.Group>
            <Radio value="normal">Normal Ticket Types</Radio>
            <Radio value="dynamic">Dynamic Ticket Types</Radio>
          </Radio.Group>
        </Form.Item>
      </Card>

      {ticketType === "normal" && (
        <Card
          title={`Ticket Type Details`}
          style={{ marginBottom: "24px", position: "relative" }}
        >
          <Form.Item
            name="type_name"
            label="Ticket Type Name"
            initialValue="Normal"
            rules={[{ required: true, message: "Please enter a name" }]}
          >
            <Input placeholder="Enter Ticket Name" />
          </Form.Item>

          <Form.Item
            name={"type_price"}
            label="Ticket Price"
            rules={[
              { required: true, message: "Please enter a price" },
              {
                pattern: /^\d+(\.\d{1,2})?$/,
                message: "Please enter a valid price",
              },
            ]}
          >
            <Input
              placeholder="Enter Ticket Price"
              type="number"
              min={0}
              onWheel={(e) => e.target.blur()}
            />
          </Form.Item>

          <Form.Item
            name={"type_number_of_tickets"}
            label="Ticket Quantity"
            dependencies={["number_of_tickets"]}
            rules={[
              { required: true, message: "Please enter ticket quantity" },
              { pattern: /^\d+$/, message: "Please enter a valid number" },
            ]}
          >
            <Input
              value={form.getFieldValue("number_of_tickets")}
              readOnly
              placeholder="Number of Tickets"
              type="number"
              min={1}
            />
          </Form.Item>
        </Card>
      )}

      <Flex className="py-2" mobileFlex={false} justifyContent="space-between">
        <div className="flex">
          <DraftSystem
            form={form}
            formType="ticket"
            mode={mode}
            titleField="name"
            excludeFromDraft={["id", "created_at"]}
            style={{ marginRight: 12, display: "inline-block" }}
            enableAutoSave={mode !== "EDIT"}
            onGetCompleteData={getCompleteFormData}
            onDraftLoaded={handleDraftLoaded}
          />
          <DiscardButton form={form} />
        </div>

        {ticketType === "dynamic" ? (
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={addTicketType}
            style={{ marginRight: "10px" }}
          >
            {mode === "EDIT" ? "Edit Sub Ticket Type" : "Add Sub Ticket Type"}
          </Button>
        ) : (
          <Button onClick={onSubmit} type="primary" htmlType="submit">
            {mode === "EDIT" ? "Update" : "Submit"}
          </Button>
        )}
      </Flex>

      <LoadingOverlay loading={loading} />
      <ValidationModal
        visible={placeValidationDialogVisible}
        data={ValidateData?.errors}
        statusMessage={message}
        onClose={handleValidationModalCancel}
      />
      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={mode == "EDIT" ? editTicket : addTicket}
        navigationPath={`${APP_PREFIX_PATH}/ticket/list`}
        responseMessage={responseMessage}
        mode={mode}
        form={form}
        formType={"ticket"}
      />
    </Form>
  );
};

export default TicketFormFields;
