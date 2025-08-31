import React, { useCallback } from "react";
import { Card } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AdvancedConfigurableForm } from "components/util-components/FormItems/CustomForm";
import { createUser } from "store/slices/userSlice";
import { ADD, EDIT } from "constants/AppConstants";
import { createFormApiConfig, FormConfigPresets } from "utils/formApiUtils";
import DataFormatUtils from "utils/formatData";
import { fetchAllEvent } from "store/slices/eventSlice";
import { fetchDropdownTheaters } from "store/slices/theaterSlice";
import { debounce } from "lodash";

const UserForm = ({ mode = ADD, user = null }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Your existing selectors
  const { filteredEvents, loading: eventLoading } = useSelector(
    (state) => state.event
  );
  const { response: theaterResponse } = useSelector((state) => state.theater);

  // Super simple API configuration with proper error handling
  const apiConfig = createFormApiConfig(dispatch, navigate, createUser, mode, {
    entityName: "User",
    successMessage:
      mode === ADD
        ? "User created successfully!"
        : "User updated successfully!",

    // Custom success callback if you need additional logic
    onSuccessCallback: (apiResponse, currentMode) => {
      console.log("User operation completed:", apiResponse);
      // Any additional success logic here
    },

    // Custom error callback for better error handling
    onErrorCallback: (error, currentMode, apiResponse) => {
      console.log("User operation failed:", { error, apiResponse });
      // Any additional error handling logic here
    },
  });

  // Your field definitions with sections
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
      condition: (formData, mode) => mode === ADD,
    },
    {
      name: "password",
      type: "password",
      label: "Password",
      required: true,
      condition: (formData, mode) => mode === ADD,
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
      required: mode === ADD,
      placeholder: "Select a Role",
      allowClear: true,
      showSearch: true,
      asyncOptions: async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return [
          { value: 1, label: "Super Admin" },
          { value: 2, label: "Tech Admin" },
          { value: 3, label: "Event Organizer" },
          { value: 4, label: "Event Supporting Team" },
          { value: 5, label: "Regular User" },
          { value: 6, label: "Viewer" },
        ];
      },
      colProps: { xs: 24, md: 12 },
      section: "basic",
      onChange: (value, event, form, formData) => {
        form.setFieldValue("event_ids", []);
        form.setFieldValue("theatre_ids", []);
        if (value === 3 || value === 4) {
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
      condition: (formData, mode) => {
        const roleId = formData.position_id;
        return roleId === 3 || roleId === 4;
      },
      options: (filteredEvents || []).map((event) => ({
        value: event.id,
        label: event.event_name,
      })),
      colProps: { xs: 24, md: 12 },
      section: "assignments",
    },
    {
      name: "theatre_ids",
      type: "select",
      label: "Theaters",
      required: false,
      placeholder: "Select theaters",
      mode: "multiple",
      allowClear: true,
      showSearch: true,
      maxTagCount: 5,
      loading: eventLoading,
      filterOption: false,
      condition: (formData, mode) => {
        const roleId = formData.position_id;
        return roleId === 3 || roleId === 4;
      },
      asyncOptions: async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return (theaterResponse?.items || []).map((theater) => ({
          value: DataFormatUtils.theaterListItem(theater).id,
          label: DataFormatUtils.theaterListItem(theater).name,
        }));
      },

      colProps: { xs: 24, md: 12 },
      section: "assignments",
    },
    // Add section configurations
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
          cardTitle: "Events & Theaters",
          gutter: 16,
        },
      }[field.section] || {},
  }));

  const customValidation = async (values, formData) => {
    if (
      (values.position_id === 3 || values.position_id === 4) &&
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

  const getInitialData = () => {
    if (mode === EDIT && user) {
      return DataFormatUtils.userDetails(user);
    }
    return {};
  };

  return (
    <Card>
      <AdvancedConfigurableForm
        config={{
          ...FormConfigPresets.tabbed,
          title: mode === ADD ? "Add New User" : "Edit User Account",
          subtitle:
            mode === ADD
              ? "Fill in the details below to create a new user account"
              : "Update the user information as needed",
        }}
        fields={userFields}
        initialData={getInitialData()}
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
