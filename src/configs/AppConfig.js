import {
  SIDE_NAV_LIGHT,
  NAV_TYPE_SIDE,
  DIR_LTR,
} from "constants/ThemeConstant";

import { env } from "./EnvironmentConfig";

export const APP_NAME = "Tickets2Me";
export const API_BASE_URL = env.API_ENDPOINT_URL;
export const APP_PREFIX_PATH = "";
export const AUTH_PREFIX_PATH = "";
export const REDIRECT_URL_KEY = "redirect";
export const R2_ACCESS_KEY_ID = "cd0db678ccfe58c72b2741fe0c6d8d07";
export const R2_SECRET_ACCESS_KEY =
  "38e3d09460954fba58b4984a1c04e867950f07740b6e19f786b0aca872506d6e";
export const UNAUTHENTICATED_ENTRY = "/login";
export const ENABLE_RESOLUTIONS = false;

export const THEME_CONFIG = {
  navCollapsed: false,
  sideNavTheme: SIDE_NAV_LIGHT,
  locale: "en",
  navType: NAV_TYPE_SIDE,
  topNavColor: "#3e82f7",
  headerNavColor: "",
  mobileNav: false,
  currentTheme: "light",
  direction: DIR_LTR,
  blankLayout: false,
};
export const FEATURE_FLAGS = {
  is_general_enabled: true,
  is_movie_enabled: false,
  is_event_enabled: true,
  is_dine_enabled: false,
  is_advertisement_enabled: true,
  is_newsletter_enabled: true,
  is_reports_enabled: true,
  is_user_management_enabled: true,
  is_app_management_enabled: true,
  is_issue_tracking_enabled: true,
  is_lead_events_enabled: true,
  is_track_requests_enabled: true,
};
