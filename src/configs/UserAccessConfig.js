import EventDetailsField from "views/event/components/EventDetailsField";
import CategoryField from "views/event/components/CategoryField";
import LocationDetailsField from "views/event/components/LocationDetailsField";
import TaxField from "views/event/components/TaxField";
import TicketField from "views/event/components/TicketsField";
import OfferField from "views/event/components/OfferField";
import { jwtDecode } from "jwt-decode";
import { AUTH_TOKEN } from "constants/AuthConstant";

// Function to get the current user from the token
export const getCurrentUser = () => {
  const token = localStorage.getItem(AUTH_TOKEN);

  if (!token) {
    console.warn("No auth token found. Returning empty navigation.");
    return null;
  }

  try {
    const decodedToken = jwtDecode(token);
    console.log(decodedToken, "Decoded Token");
    return decodedToken;
  } catch (error) {
    console.error("Invalid token format. Unable to decode:", error);
    return null;
  }
};

// Function to get form items based on the user's role and current step
const getEventFormItems = (form, currentStep) => {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    console.error("User not authenticated. Cannot render form items.");
    return null;
  }

  console.log(currentUser, "currentUser");

  // Super Admin items
  if (currentUser.is_superuser) {
    switch (currentStep) {
      case 1:
        return <EventDetailsField form={form} />;
      case 2:
        return <CategoryField form={form} />;
      case 3:
        return <LocationDetailsField form={form} />;
      case 4:
        return <TaxField form={form} />;
      case 5:
        return <TicketField form={form} />;
      case 6:
        return <OfferField form={form} />;
      default:
        return null;
    }
  }

  if (!currentUser.is_superuser) {
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
  
    console.log(currentUser, "currentUser");
  
    if (currentUser.is_superuser) {
      return [
        "Event Details",
        "Category",
        "Location",
        "Tax",
        "Ticket",
        "Offers",
      ];
    } else {
      return ["Event Details"];
    }
  };
  