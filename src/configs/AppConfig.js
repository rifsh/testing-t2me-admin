import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  SIDE_NAV_LIGHT,
  NAV_TYPE_SIDE,
  DIR_LTR,
} from "constants/ThemeConstant";
import { env } from "./EnvironmentConfig";

const ProtectedRoute = () => {
  const { token } = useSelector((state) => state.auth);
  const location = useLocation();

  useEffect(() => {
    // Add logging to debug the flow
    console.log("ProtectedRoute check - Token exists:", !!token);
  }, [token]);

  if (!token) {
    // Save the current location for later redirect if needed
    const redirectUrl = location.pathname + location.search;
    localStorage.setItem(REDIRECT_URL_KEY, redirectUrl);

    return (
      <Navigate to={`${AUTH_PREFIX_PATH}${UNAUTHENTICATED_ENTRY}`} replace />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;

// App Configuration
export const APP_NAME = "Tickets2Me";
export const API_BASE_URL = env.API_ENDPOINT_URL;
export const CDN_PATH = env.CDN_PATH;
export const APP_PREFIX_PATH = "";
export const AUTH_PREFIX_PATH = "";
export const REDIRECT_URL_KEY = "redirect";
export const R2_ACCESS_KEY_ID = "cd0db678ccfe58c72b2741fe0c6d8d07";
export const R2_SECRET_ACCESS_KEY =
  "38e3d09460954fba58b4984a1c04e867950f07740b6e19f786b0aca872506d6e";
export const UNAUTHENTICATED_ENTRY = "/login";
export const ENABLE_RESOLUTIONS = false;
export const MAIN_LAYOUT_COMPONENT = ['/qr-scanner','/qr-scanner/event','/qr-scanner/add-ons']

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
export const APP_FEATURE_FLAGS = {
  MOVIE: false,
  EVENT: true,
  DINE: false,
};
export const NAVIGATION_BAR_FEATURE_FLAGS = {
  // Orders category
  orders: {
    enabled: true,
    subitems: {
      event: { enabled: true },
      booking: { enabled: true },
      movie: { enabled: false },
    },
  },

  // Services category
  services: {
    enabled: true,
    subitems: {
      // General services subcategory
      general: {
        enabled: true,
        items: {
          place: { enabled: true },
          venue: { enabled: true },
          tax: { enabled: true },
          category: { enabled: true },
          offer: { enabled: false },
          coupon: { enabled: false },
          seat: { enabled: false },
          payment: { enabled: true },
        },
      },
      // Event services subcategory
      event: {
        enabled: true,
        items: {
          event_type: { enabled: true },
          ticket: { enabled: true },
          seat: { enabled: false },
          event: { enabled: true },
          schedule: { enabled: true },
        },
      },
      // Movie services subcategory
      movie: {
        enabled: false,
        items: {
          theater: { enabled: true },
          screen: { enabled: true },
          seat: { enabled: true },
          cast: { enabled: true },
          movie: { enabled: true },
          schedule: { enabled: true },
          offer: { enabled: true },
          coupon: { enabled: true },
        },
      },
      // Dine services subcategory
      dine: {
        enabled: false,
        items: {
          restaurant: { enabled: true },
          schedule: { enabled: true },
        },
      },
    },
  },

  // Issues category
  issues: {
    enabled: true,
    subitems: {
      issue_tracking: {
        enabled: true,
        items: {
          issue: { enabled: true },
          alert: { enabled: true },
        },
      },
      track_requests: {
        enabled: true,
        items: {
          event: { enabled: true },
          movie: { enabled: false },
        },
      },
      lead_events: {
        enabled: true,
        items: {
          event_request_list: { enabled: true },
        },
      },
    },
  },

  // Advertisements category
  advertisements: {
    enabled: true,
    subitems: {
      ad_category: { enabled: true },
      banners: { enabled: true },
      schedule: { enabled: true },
    },
  },

  // Newsletter category
  newsletter: {
    enabled: false,
    subitems: {
      newsletter: { enabled: true },
      subscribers: { enabled: true },
    },
  },

  // User Management category
  user_management: {
    enabled: true,
    subitems: {
      user: { enabled: true },
      system_permissions: { enabled: true },
    },
  },

  // App Management category - FIXED
  app_management: {
    enabled: true, // <-- This was missing
    subitems: {
      layout: {
        enabled: true, // <-- This was missing
        items: {
          footer: { enabled: true }, // <-- Changed from false to true
          faq: { enabled: true }, // <-- Changed from false to true
          app_info: { enabled: true }, // <-- Changed from false to true
          terms: { enabled: true }, // <-- Changed from false to true
        },
      },
    },
  },
};
