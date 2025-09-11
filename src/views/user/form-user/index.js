import React, { useCallback } from "react";
import { Card } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CustomForm } from "components/util-components/FormItems/CustomForm";
import { createUser, editUser } from "store/slices/userSlice";
import { ADD, EDIT } from "constants/AppConstants";
import { createFormApiConfig, FormConfigPresets } from "utils/formApiUtils";
import DataFormatUtils from "utils/formatData";
import { fetchAllEvent } from "store/slices/eventSlice";
import { fetchDropdownTheaters } from "store/slices/theaterSlice";
import { debounce } from "lodash";

const UserForm = ({ mode = ADD, user = null }) => {
  console.log("User form mode:", mode, "User data:", user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { filteredEvents, loading: eventLoading } = useSelector(
    (state) => state.event
  );

  const { response: theaterResponse } = useSelector((state) => state.theater);

  const apiConfig = createFormApiConfig(
    dispatch,
    navigate,
    mode === ADD ? createUser : editUser,
    mode,
    {
      entityName: "User",
      successMessage:
        mode === ADD
          ? "User created successfully!"
          : "User updated successfully!",
    }
  );

  const userFields = [
    {
      name: "username",
      type: "input",
      label: "Username",
      required: true,
      tooltip: "Username must contain only letters, be 3-30 characters long",
      placeholder: "Enter Username",
      maxLength: 30,
      showCount: true,
      rules: [
        { min: 3, message: "Username must be at least 3 characters" },
        { max: 30, message: "Username cannot exceed 30 characters" },
        {
          pattern: /^[a-zA-Z0-9_]+$/,
          message:
            "Username can only contain letters, numbers, and underscores",
        },
      ],
      colProps: { xs: 24, md: 12 },
      section: "basic",
    },
    {
      name: "email",
      type: "input",
      label: "Email Address",
      required: true,
      tooltip: "Enter a valid email address",
      placeholder: "Enter Email Address",
      rules: [{ type: "email", message: "Please enter a valid email address" }],
      colProps: { xs: 24, md: 12 },
      section: "basic",
      // condition: (formData, mode) => mode === ADD,
    },
    {
      name: "password",
      type: "password",
      label: "Password",
      required: true,
      // condition: (formData, mode) => mode === ADD,
      tooltip:
        "Password must be 8-30 characters with mixed case, number, and special character",
      placeholder: "Enter Password",
      maxLength: 30,
      rules: [
        { min: 8, message: "Password must be at least 8 characters" },
        { max: 30, message: "Password cannot exceed 30 characters" },
        {
          pattern:
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
          message:
            "Password must contain uppercase, lowercase, number, and special character",
        },
      ],
      colProps: { xs: 24, md: 12 },
      section: "basic",
    },
    {
      name: "position_id",
      type: "select",
      label: "Role",
      required: true,
      placeholder: "Select a Role",
      allowClear: true,
      showSearch: true,
      asyncOptions: async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return [
          { value: 1, label: "Super Admin" },
          { value: 2, label: "Tech Admin" },
          { value: 3, label: "Tech Supporting Team" },
          { value: 4, label: "Event Supporting Team" },
          { value: 5, label: "Event Organizer" },
        ];
      },
      colProps: { xs: 24, md: 12 },
      section: "basic",
      onChange: (value, event, form, formData) => {
        form.setFieldValue("event_ids", []);
        form.setFieldValue("theatre_ids", []);
        if (value === 5 || value === 4) {
          dispatch(fetchAllEvent({ event_type: "General" }));
          dispatch(fetchDropdownTheaters({}));
        }
      },
    },
    {
      name: "event_ids",
      type: "select",
      label: "Events",
      required: false,
      placeholder: "Select events",
      mode: "multiple",
      allowClear: true,
      showSearch: true,
      maxTagCount: 5,
      loading: eventLoading,
      filterOption: false,
      asyncOptions: async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return (filteredEvents || []).map((event) => ({
          value: event.id,
          label: event.event_name,
        }));
      },
      actionCreation: fetchAllEvent,
      actionCreationParams: { event_type: "General" },
      // Fetch events when field is focused
      condition: (formData, mode) => {
        const roleId = formData.position_id;
        return roleId === 5 || roleId === 4;
      },
      options: (filteredEvents || []).map((event) => ({
        value: event.id,
        label: event.event_name,
      })),
      colProps: { xs: 24, md: 12 },
      section: "assignments",
    },
    // {
    //   name: "theatre_ids",
    //   type: "select",
    //   label: "Theaters",
    //   required: false,
    //   placeholder: "Select theaters",
    //   mode: "multiple",
    //   allowClear: true,
    //   showSearch: true,
    //   actionCreation: fetchDropdownTheaters,

    //   maxTagCount: 5,
    //   loading: eventLoading,
    //   filterOption: false,
    //   condition: (formData, mode) => {
    //     const roleId = formData.position_id;
    //     return roleId === 5 || roleId === 4;
    //   },
    //   asyncOptions: async () => {
    //     await new Promise((resolve) => setTimeout(resolve, 500));
    //     return (theaterResponse?.items || []).map((theater) => ({
    //       value: DataFormatUtils.theaterListItem(theater).id,
    //       label: DataFormatUtils.theaterListItem(theater).name,
    //     }));
    //   },

    //   colProps: { xs: 24, md: 12 },
    //   section: "assignments",
    // },
  ].map((field) => ({
    ...field,
    sectionConfig:
      {
        basic: {
          title: "Basic Information",
          cardTitle: "User Details",
          gutter: 16,
        },
        assignments: {
          title: "Role Assignments",
          cardTitle: "Events",
          gutter: 16,
        },
      }[field.section] || {},
  }));

  const customValidation = async (values, formData) => {
    if (
      (values.position_id === 5 || values.position_id === 4) &&
      (!values.event_ids || values.event_ids.length === 0)
    ) {
      return {
        isValid: false,
        message:
          "Event organizers and supporting team members must be assigned to at least one event",
      };
    }
    return { isValid: true };
  };

  const getInitialData = useCallback(() => {
    if (mode === EDIT && user) {
      return {
        ...user,
      };
    }

    // Return default structure for ADD mode
    return {
      username: "",
      email: "",
      password: "",
      position_id: undefined,
      event_ids: [],
      theatre_ids: [],
    };
  }, [mode, user]);
  const initialData = getInitialData();

  return (
    <Card>
      <CustomForm
        config={{
          ...FormConfigPresets.tabbed,
          title: mode === ADD ? "Add New User" : "Edit User Account",
        }}
        fields={userFields}
        initialData={initialData}
        mode={mode}
        customValidation={customValidation}
        apiConfig={apiConfig}
        onFieldChange={(newData, changedFields) => {
          console.log("Form data changed:", { newData, changedFields });
        }}
        className="advanced-user-form"
      />
    </Card>
  );
};

export default UserForm;
