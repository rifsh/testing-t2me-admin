//advertisement category codes

import { CategoryOutlined } from "@mui/icons-material";
import { BiSolidOffer } from "react-icons/bi";
import { IoInformationCircleOutline } from "react-icons/io5";
import {
  UserOutlined,
  EnvironmentOutlined,
  TeamOutlined,
} from "@ant-design/icons";

export const EDIT = "edit";
export const imageUrlStartWith = "media";
export const ADD = "add";
export const ApiActions = {
  SUBMIT: "submit",
  CONFIRM: "confirm",
};
export const discounts = {
  offer: 'offer',
  coupon: 'coupon'
}
export const SUCCESS_CODE = "00000";
export const AdvCategoryCode = [
  "payment-bottom-banner",
  "home-middle-banner",
  "home-top-banner",
  "event-sidebar-banner",
];
export const AvailableBookingType = {
  SEAT_STRUCTURE: "SEAT STRUCTURE",
};
export const EventCodeConstants = {
  GENARAL: 1,
  MOVIES: 2,
  SPORTS: 3,
};

export const EventType = {
  GENARAL: "general",
  EVENT: "event",
  MOVIE: "movie",
  SPORTS: "sports",
};

export const BOOKING_TYPE = {
  EVENT_SEAT: "event_seat",
  EVENT_TICKET: "event_ticket",
  MOVIE_TICKET: "movie_ticket",
  MOVIE_SEAT: "movie_seat",
};
export const APPROVAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CHANGE_REQUEST: "change request",
};

export const BOOKING_ADDON_TYPE = {
  USER_AND_FOOD: "USER_AND_FOOD",
};

export const EVENT_SECTIONS = [
  {
    key: "basic",
    title: "Basic Info",
    icon: <UserOutlined />,
  },
  {
    key: "category",
    title: "Category",
    icon: <CategoryOutlined />,
  },
  {
    key: "location",
    title: "Location",
    icon: <EnvironmentOutlined />,
  },
  {
    key: "ticket",
    title: "Tickets and Food",
    icon: <TeamOutlined />,
  },
  {
    key: "pricing",
    title: "Offer and Coupon",
    icon: <BiSolidOffer />,
  },
  {
    key: "additionalinfo",
    title: "Addons",
    icon: <IoInformationCircleOutline />,
  },
];
