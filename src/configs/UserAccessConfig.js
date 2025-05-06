import EventDetailsField from "views/event/components/EventDetailsField";
import CategoryField from "views/event/components/CategoryField";
import LocationDetailsField from "views/event/components/LocationDetailsField";
import TaxField from "views/event/components/TaxField";
import TicketField from "views/event/components/TicketsField";
import OfferField from "views/event/components/OfferField";
import { jwtDecode } from "jwt-decode";
import { AUTH_TOKEN } from "constants/AuthConstant";
import { UserRoleConstants } from "constants/UserRoleConstant";
import {
  APP_PREFIX_PATH,
  AUTH_PREFIX_PATH,
  UNAUTHENTICATED_ENTRY,
} from "./AppConfig";

export const getCurrentUser = () => {
  const token = localStorage.getItem(AUTH_TOKEN);

  if (!token) {
    console.warn("No auth token found. Returning empty navigation.");
    return null;
  }

  try {
    const decodedToken = jwtDecode(token);
    return decodedToken;
  } catch (error) {
    console.error("Invalid token format. Unable to decode:", error);
    return null;
  }
};

export const getUserRole = () => {
  const currentUser = getCurrentUser();
  switch (currentUser.role_id) {
    case UserRoleConstants.superAdminRoleId:
      return UserRoleConstants.superAdmin;
    case UserRoleConstants.techAdminRoleId:
      return UserRoleConstants.techAdmin;
    case UserRoleConstants.techSupportingTeamRoleId:
      return UserRoleConstants.superSupportingTeam;
    case UserRoleConstants.eventOrganizerRoleId:
      return UserRoleConstants.eventOrganizer;
    case UserRoleConstants.eventSupportingTeamRoleId:
      return UserRoleConstants.eventSupportingTeam;
    default:
      return UserRoleConstants.defaultRole;
  }
};

const getEventFormItems = (form, currentStep, mode) => {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    console.error("User not authenticated. Cannot render form items.");
    return null;
  }

  if (currentUser.role_id === UserRoleConstants.superAdminRoleId) {
    switch (currentStep) {
      case 1:
        return <EventDetailsField form={form} />;

      // return <TicketField form={form} />;
      case 2:
        return <CategoryField form={form} />;
      case 3:
        return <LocationDetailsField form={form} />;
      case 4:
        return <TaxField form={form} />;
      case 5:
        return <TicketField form={form} />;
      case 6:
        return <OfferField form={form} mode={mode} />;
      default:
        return null;
    }
  }
  if (currentUser.role_id === UserRoleConstants.techAdminRoleId) {
    switch (currentStep) {
      case 1:
        return <EventDetailsField form={form} />;

      // return <TicketField form={form} />;
      case 2:
        return <CategoryField form={form} />;
      case 3:
        return <LocationDetailsField form={form} />;
      case 4:
        return <TaxField form={form} />;
      case 5:
        return <TicketField form={form} />;
      case 6:
        return <OfferField form={form} mode={mode} />;
      default:
        return null;
    }
  }

  if (currentUser.role_id === UserRoleConstants.eventOrganizerRoleId) {
    switch (currentStep) {
      case 1:
        return <EventDetailsField form={form} />;

      default:
        return null;
    }
  }

  console.warn("Unknown role. Cannot render form items.");
  return null;
};

export default getEventFormItems;

export const getEventFormSteps = () => {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    console.error("User not authenticated. Cannot fetch form steps.");
    return null;
  }

  if (currentUser.role_id === UserRoleConstants.superAdminRoleId) {
    return ["Event Details", "Category", "Location", "Tax", "Ticket", "Offers"];
  } else if (currentUser.role_id === UserRoleConstants.techAdminRoleId) {
    return ["Event Details", "Category", "Location", "Tax", "Ticket", "Offers"];
  } else if (currentUser.role_id === UserRoleConstants.eventOrganizerRoleId) {
    return ["Event Details"];
  } else {
    return [];
  }
};

export const AUTHENTICATED_ENTRY = () => {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    console.error("User not authenticated. Cannot fetch form steps.");
    return `${APP_PREFIX_PATH}${AUTH_PREFIX_PATH}${UNAUTHENTICATED_ENTRY}`;
  }

  switch (currentUser.role_id) {
    case UserRoleConstants.superAdminRoleId:
      return `${APP_PREFIX_PATH}/super-admin/reports`;
    case UserRoleConstants.techAdminRoleId:
      return `${APP_PREFIX_PATH}/super-admin/reports`;
    case UserRoleConstants.eventOrganizerRoleId:
      return `${APP_PREFIX_PATH}/organizer/reports`;
    case UserRoleConstants.eventSupportingTeamRoleId:
      return `${APP_PREFIX_PATH}/organizer/reports`;
    case UserRoleConstants.techSupportingTeamRoleId:
      return `${APP_PREFIX_PATH}/super-admin/reports`;
    default:
      return `${APP_PREFIX_PATH}/super-admin/reports`;
  }
};
