import {
  DashboardOutlined,
  LayoutOutlined,
  OrderedListOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  APP_PREFIX_PATH,
  NAVIGATION_BAR_FEATURE_FLAGS,
} from "configs/AppConfig";
import { AUTH_TOKEN } from "constants/AuthConstant";
import { UserRoleConstants } from "constants/UserRoleConstant";
import { jwtDecode } from "jwt-decode";
import {
  isCategoryEnabled,
  isSubcategoryEnabled,
  isItemEnabled,
} from "utils/navigationUtils";

// Updated feature categories mapping to new structure
const FEATURE_CATEGORIES = {
  REPORTS: "orders",
  GENERAL: "services.general",
  EVENT: "services.event",
  MOVIE: "services.movie",
  DINE: "services.dine",
  ISSUE_TRACKING: "issues.issue_tracking",
  TRACK_REQUESTS: "issues.track_requests",
  LEAD_EVENTS: "issues.lead_events",
  ADVERTISEMENT: "advertisements",
  NEWSLETTER: "newsletter",
  USER_MANAGEMENT: "user_management",
  APP_MANAGEMENT: "app_management",
};

/**
 * Build dynamic submenu items based on feature flags
 * @param {string} category - Main category
 * @param {string} subcategory - Subcategory (optional)
 * @param {Array} items - Array of submenu items to filter
 * @returns {Array} - Filtered submenu items
 */
const buildDynamicSubmenu = (category, subcategory, items) => {
  return items.filter((item) => {
    // Handle orders submenu filtering
    if (category === "orders") {
      if (item.key === "reports.orders.event") {
        return isSubcategoryEnabled("orders", "event");
      }
      if (item.key === "reports.orders.movie") {
        return isSubcategoryEnabled("orders", "movie");
      }
    }

    // Handle services filtering
    if (category === "services" && subcategory) {
      // For general services
      if (subcategory === "general") {
        const itemMap = {
          "place.list": "place",
          "venue.list": "venue",
          "tax.list": "tax",
          "category.list": "category",
          "offer.list": "offer",
          "coupon.list": "coupon",
          "seat.list": "seat",
          "sidenav.payment": "payment",
        };
        const featureItem = itemMap[item.key];
        if (featureItem) {
          return isItemEnabled("services", "general", featureItem);
        }
      }

      // For event services
      if (subcategory === "event") {
        const itemMap = {
          "event.type.list": "event_type",
          "ticket.list": "ticket",
          "seat.event.list": "seat",
          "event.list": "event",
          "schedule.list": "schedule",
        };
        const featureItem = itemMap[item.key];
        if (featureItem) {
          return isItemEnabled("services", "event", featureItem);
        }
      }

      // For movie services
      if (subcategory === "movie") {
        const itemMap = {
          "movie.theater": "theater",
          "movie.screen": "screen",
          "movie.seat": "seat",
          "movie.cast": "cast",
          "movie.movie": "movie",
          "movie.schedule": "schedule",
          "movie.offer.list": "offer",
          "movie.coupon.list": "coupon",
        };
        const featureItem = itemMap[item.key];
        if (featureItem) {
          return isItemEnabled("services", "movie", featureItem);
        }
      }

      // For dine services
      if (subcategory === "dine") {
        const itemMap = {
          "dine.dine": "restaurant",
          "dine.restaurant": "restaurant",
          "dine.schedule": "schedule",
        };
        const featureItem = itemMap[item.key];
        if (featureItem) {
          return isItemEnabled("services", "dine", featureItem);
        }
      }
    }

    // Handle issues filtering
    if (category === "issues" && subcategory) {
      // For issue tracking
      if (subcategory === "issue_tracking") {
        const itemMap = {
          "issue.list": "issue",
          "alerts.list": "alert",
        };
        const featureItem = itemMap[item.key];
        if (featureItem) {
          return isItemEnabled("issues", "issue_tracking", featureItem);
        }
      }

      // For track requests
      if (subcategory === "track_requests") {
        if (item.key && item.key.includes("event")) {
          return isItemEnabled("issues", "track_requests", "event");
        }
        if (item.key && item.key.includes("movie")) {
          return isItemEnabled("issues", "track_requests", "movie");
        }
      }

      // For lead events
      if (subcategory === "lead_events") {
        const itemMap = {
          "customerEvent.update": "event_request_list",
        };
        const featureItem = itemMap[item.key];
        if (featureItem) {
          return isItemEnabled("issues", "lead_events", featureItem);
        }
      }
    }

    // Handle advertisements filtering
    if (category === "advertisements") {
      const itemMap = {
        "advertisement.category.list": "ad_category",
        "advertisement.banner.list": "banners",
        "advertisement.schedule.list": "schedule",
      };
      const featureItem = itemMap[item.key];
      if (featureItem) {
        return isSubcategoryEnabled("advertisements", featureItem);
      }
    }

    // Handle newsletter filtering
    if (category === "newsletter") {
      const itemMap = {
        "news-letter.list": "newsletter",
        "news-letter.subscriber.list": "subscribers",
      };
      const featureItem = itemMap[item.key];
      if (featureItem) {
        return isSubcategoryEnabled("newsletter", featureItem);
      }
    }

    // Handle user management filtering
    if (category === "user_management") {
      const itemMap = {
        "user.list": "user",
        "accessControl.list": "system_permissions",
      };
      const featureItem = itemMap[item.key];
      if (featureItem) {
        return isSubcategoryEnabled("user_management", featureItem);
      }
    }

    // Handle app management filtering
    if (category === "app_management") {
      const itemMap = {
        "app.management.layout.footer.list": "footer",
        "app.management.layout.faq.list": "faq",
        "app.management.layout.info.list": "app_info",
        "app.management.layout.terms.list": "terms",
      };
      const featureItem = itemMap[item.key];
      if (featureItem) {
        return isItemEnabled("app_management", "layout", featureItem);
      }
    }

    return true; // Default: keep item if no specific rule
  });
};

const ALL_NAVIGATION_ITEMS = {
  // Reports - All items under orders (dynamic submenu)
  "reports.dashboard": {
    key: "super-admin.reports",
    path: `${APP_PREFIX_PATH}/super-admin/reports`,
    title: "sidenav.dashboard",
    icon: DashboardOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.REPORTS,
  },
  "reports.orders": {
    key: "super-admin.reports.orders",
    path: `${APP_PREFIX_PATH}/super-admin/reports/orders`,
    title: "sidenav.apps.admin.reports.orders",
    icon: DashboardOutlined,
    breadcrumb: false,
    get submenu() {
      const allSubmenuItems = [
        {
          key: "reports.orders.event",
          path: `${APP_PREFIX_PATH}/reports/orders/event`,
          title: "sidenav.order.event",
          icon: DashboardOutlined,
          breadcrumb: false,
          submenu: [],
        },
        {
          key: "reports.orders.booking",
          path: `${APP_PREFIX_PATH}/reports/orders/by-booking`,
          title: "sidenav.order.booking",
          icon: DashboardOutlined,
          breadcrumb: false,
          submenu: [],
        },
        {
          key: "reports.orders.movie",
          path: `${APP_PREFIX_PATH}/reports/orders/movie`,
          title: "sidenav.order.movie",
          icon: DashboardOutlined,
          breadcrumb: false,
          submenu: [],
        },
      ];
      return buildDynamicSubmenu("orders", null, allSubmenuItems);
    },
    category: FEATURE_CATEGORIES.REPORTS,
  },
  "organizer.reports.dashboard": {
    key: "organizer.reports",
    path: `${APP_PREFIX_PATH}/organizer/reports`,
    title: "sidenav.dashboard",
    icon: DashboardOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.REPORTS,
  },

  // General Services - All items under services.general
  "general.place": {
    key: "place.list",
    path: `${APP_PREFIX_PATH}/place/list`,
    title: "sidenav.place.list",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.GENERAL,
    featureItem: "place",
  },
  "general.venue": {
    key: "venue.list",
    path: `${APP_PREFIX_PATH}/venue/list`,
    title: "sidenav.venue.list",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.GENERAL,
    featureItem: "venue",
  },
  "general.tax": {
    key: "tax.list",
    path: `${APP_PREFIX_PATH}/tax/list`,
    title: "sidenav.tax",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.GENERAL,
    featureItem: "tax",
  },
  "general.category": {
    key: "category.list",
    path: `${APP_PREFIX_PATH}/category/list`,
    title: "sidenav.category",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.GENERAL,
    featureItem: "category",
  },
  "general.offer": {
    key: "offer.list",
    path: `${APP_PREFIX_PATH}/offer/list/general`,
    title: "sidenav.offer",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.GENERAL,
    featureItem: "offer",
  },
  "general.coupon": {
    key: "coupon.list",
    path: `${APP_PREFIX_PATH}/coupon/list/general`,
    title: "sidenav.coupon",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.GENERAL,
    featureItem: "coupon",
  },
  "general.seat": {
    key: "seat.list",
    path: `${APP_PREFIX_PATH}/seat/list`,
    title: "sidenav.seat",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.GENERAL,
    featureItem: "seat",
  },
  "general.payment": {
    key: "sidenav.payment",
    path: `${APP_PREFIX_PATH}/payment/list`,
    title: "sidenav.payment",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.GENERAL,
    featureItem: "payment",
  },

  // Event Services - All items under services.event
  "event.type": {
    key: "event.type.list",
    path: `${APP_PREFIX_PATH}/event/type/list`,
    title: "sidenav.event.type",
    icon: DashboardOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.EVENT,
    featureItem: "event_type",
  },
  "event.ticket": {
    key: "ticket.list",
    path: `${APP_PREFIX_PATH}/ticket/list`,
    title: "sidenav.ticket",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.EVENT,
    featureItem: "ticket",
  },
  "event.seat": {
    key: "seat.event.list",
    path: `${APP_PREFIX_PATH}/seat/event/list`,
    title: "sidenav.seat",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.EVENT,
    featureItem: "seat",
  },
  "event.list": {
    key: "event.list",
    path: `${APP_PREFIX_PATH}/event/list`,
    title: "sidenav.event.list",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.EVENT,
    featureItem: "event",
  },
  "event.schedule": {
    key: "schedule.list",
    path: `${APP_PREFIX_PATH}/schedule/list`,
    title: "sidenav.schedule",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.EVENT,
    featureItem: "schedule",
  },

  // Movie Services - All items under services.movie
  "movie.theater": {
    key: "movie.theater",
    path: `${APP_PREFIX_PATH}/movie-theater-company/list`,
    title: "sidenav.theater",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.MOVIE,
    featureItem: "theater",
  },
  "movie.screen": {
    key: "movie.screen",
    path: `${APP_PREFIX_PATH}/screen/list`,
    title: "sidenav.screen",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.MOVIE,
    featureItem: "screen",
  },
  "movie.seat": {
    key: "movie.seat",
    path: `${APP_PREFIX_PATH}/seat/movie/list`,
    title: "sidenav.seat",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.MOVIE,
    featureItem: "seat",
  },
  "movie.cast": {
    key: "movie.cast",
    path: `${APP_PREFIX_PATH}/personality/list`,
    title: "sidenav.movie.cast",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.MOVIE,
    featureItem: "cast",
  },
  "movie.list": {
    key: "movie.movie",
    path: `${APP_PREFIX_PATH}/movie/list`,
    title: "sidenav.movie.movies",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.MOVIE,
    featureItem: "movie",
  },
  "movie.schedule": {
    key: "movie.schedule",
    path: `${APP_PREFIX_PATH}/movie-schedule/list`,
    title: "sidenav.movie.schedule",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.MOVIE,
    featureItem: "schedule",
  },
  "movie.offer": {
    key: "movie.offer.list",
    path: `${APP_PREFIX_PATH}/offer/list/movie`,
    title: "sidenav.offer",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.MOVIE,
    featureItem: "offer",
  },
  "movie.coupon": {
    key: "movie.coupon.list",
    path: `${APP_PREFIX_PATH}/coupon/list/movie`,
    title: "sidenav.coupon",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.MOVIE,
    featureItem: "coupon",
  },

  // Dine Services - All items under services.dine
  "dine.list": {
    key: "dine.dine",
    path: `${APP_PREFIX_PATH}/dine/list`,
    title: "sidenav.dine.dine",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.DINE,
    featureItem: "restaurant",
  },
  "dine.restaurant": {
    key: "dine.restaurant",
    path: `${APP_PREFIX_PATH}/restaurant/list`,
    title: "sidenav.dine.restaurant",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.DINE,
    featureItem: "restaurant",
  },
  "dine.schedule": {
    key: "dine.schedule",
    path: `${APP_PREFIX_PATH}/dine/schedule/list`,
    title: "sidenav.dine.schedule",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.DINE,
    featureItem: "schedule",
  },

  // Issues - All items under issues.issue_tracking
  "issue.list": {
    key: "issue.list",
    path: `${APP_PREFIX_PATH}/issue/list`,
    title: "sidenav.apps.issue",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.ISSUE_TRACKING,
    featureItem: "issue",
  },
  "alerts.list": {
    key: "alerts.list",
    path: `${APP_PREFIX_PATH}/alerts/list`,
    title: "sidenav.apps.alerts",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.ISSUE_TRACKING,
    featureItem: "alert",
  },

  // Track Requests - All items under issues.track_requests
  "track.event.organizer": {
    key: "eventOrganiser.update",
    path: `${APP_PREFIX_PATH}/track-team/event-organizer/updatelist`,
    title: "sidenav.eventcoordinatorupdates",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.TRACK_REQUESTS,
    featureItem: "event",
  },
  "track.movie.seats": {
    key: "trackRequest.movie.seats.status.list",
    path: `${APP_PREFIX_PATH}/track/movie-seats/status/list`,
    title: "sidenav.seat",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.TRACK_REQUESTS,
    featureItem: "movie",
  },
  "track.movie.offer": {
    key: "trackRequest.movie.offer.status.list",
    path: `${APP_PREFIX_PATH}/track/offer/status/list/movie`,
    title: "sidenav.offer",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.TRACK_REQUESTS,
    featureItem: "movie",
  },
  "track.movie.coupon": {
    key: "trackRequest.movie.coupon.status.list",
    path: `${APP_PREFIX_PATH}/track/coupon/status/list/movie`,
    title: "sidenav.coupon",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.TRACK_REQUESTS,
    featureItem: "movie",
  },
  "track.movie.schedule": {
    key: "trackRequest.movie.schedule.status.list",
    path: `${APP_PREFIX_PATH}/track/movie-schedule/status/list/movie`,
    title: "sidenav.movie.schedule",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.TRACK_REQUESTS,
    featureItem: "movie",
  },
  "track.movie.screen": {
    key: "trackRequest.movie.screen.status.list",
    path: `${APP_PREFIX_PATH}/track/movie-screens/status/list`,
    title: "sidenav.screen",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.TRACK_REQUESTS,
    featureItem: "movie",
  },

  // Lead Events - All items under issues.lead_events
  "lead.event": {
    key: "customerEvent.update",
    path: `${APP_PREFIX_PATH}/leadevent/list`,
    title: "sidenav.leadevent",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.LEAD_EVENTS,
    featureItem: "event_request_list",
  },

  // Advertisement - All items under advertisements
  "advertisement.category": {
    key: "advertisement.category.list",
    path: `${APP_PREFIX_PATH}/advertisement/category/list`,
    title: "advertisement.category",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.ADVERTISEMENT,
    featureItem: "ad_category",
  },
  "advertisement.banner": {
    key: "advertisement.banner.list",
    path: `${APP_PREFIX_PATH}/advertisement/banner/list`,
    title: "advertisement.banner",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.ADVERTISEMENT,
    featureItem: "banners",
  },
  "advertisement.schedule": {
    key: "advertisement.schedule.list",
    path: `${APP_PREFIX_PATH}/advertisement/schedule/list`,
    title: "advertisement.schedule",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.ADVERTISEMENT,
    featureItem: "schedule",
  },

  // Newsletter - All items under newsletter
  "newsletter.list": {
    key: "news-letter.list",
    path: `${APP_PREFIX_PATH}/news-letter/list/`,
    title: "sidenav.news-letter",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.NEWSLETTER,
    featureItem: "newsletter",
  },
  "newsletter.subscriber": {
    key: "news-letter.subscriber.list",
    path: `${APP_PREFIX_PATH}/news-letter/subscriber/list/`,
    title: "news-letter.subscriber.list",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.NEWSLETTER,
    featureItem: "subscribers",
  },

  // User Management - All items under user_management
  "user.list": {
    key: "user.list",
    path: `${APP_PREFIX_PATH}/user/list`,
    title: "sidenav.user",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.USER_MANAGEMENT,
    featureItem: "user",
  },
  "access.control": {
    key: "accessControl.list",
    path: `${APP_PREFIX_PATH}/access-control/list`,
    title: "sidenav.accessControl",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.USER_MANAGEMENT,
    featureItem: "system_permissions",
  },

  // App Management - All items under app_management
  "app.footer": {
    key: "app.management.layout.footer.list",
    path: `${APP_PREFIX_PATH}/app/management/layout/footer/list`,
    title: "sidenav.app.management.layout.footer",
    icon: LayoutOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.APP_MANAGEMENT,
    featureItem: "footer",
  },
  "app.faq": {
    key: "app.management.layout.faq.list",
    path: `${APP_PREFIX_PATH}/app/management/layout/faq/list`,
    title: "sidenav.app.management.layout.faq",
    icon: LayoutOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.APP_MANAGEMENT,
    featureItem: "faq",
  },
  "app.info": {
    key: "app.management.layout.info.list",
    path: `${APP_PREFIX_PATH}/app/management/layout/app-info/list`,
    title: "sidenav.app.management.layout.info",
    icon: LayoutOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.APP_MANAGEMENT,
    featureItem: "app_info",
  },
  "app.terms": {
    key: "app.management.layout.terms.list",
    path: `${APP_PREFIX_PATH}/app/management/layout/terms/list`,
    title: "sidenav.app.management.layout.terms",
    icon: LayoutOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.APP_MANAGEMENT,
    featureItem: "terms",
  },
};

// Role-based navigation access mapping (unchanged)
const ROLE_NAVIGATION_ACCESS = {
  [UserRoleConstants.superAdminRoleId]: [
    // Reports
    "reports.dashboard",
    "reports.orders",

    // General Services
    "general.place",
    "general.venue",
    "general.tax",
    "general.category",
    "general.offer",
    "general.coupon",
    "general.seat",
    "general.payment",

    // Event Services
    "event.type",
    "event.ticket",
    "event.seat",
    "event.list",
    "event.schedule",

    // Movie Services
    "movie.theater",
    "movie.screen",
    "movie.seat",
    "movie.cast",
    "movie.list",
    "movie.schedule",
    "movie.offer",
    "movie.coupon",

    // Dine Services
    "dine.list",
    "dine.restaurant",
    "dine.schedule",

    // Issues
    "issue.list",
    "alerts.list",

    // Track Requests
    "track.event.organizer",
    "track.movie.seats",
    "track.movie.offer",
    "track.movie.coupon",
    "track.movie.schedule",
    "track.movie.screen",

    // Lead Events
    "lead.event",

    // Advertisement
    "advertisement.category",
    "advertisement.banner",
    "advertisement.schedule",

    // Newsletter
    "newsletter.list",
    "newsletter.subscriber",

    // User Management
    "user.list",
    "access.control",

    // App Management
    "app.footer",
    "app.faq",
    "app.info",
    "app.terms",
  ],

  [UserRoleConstants.techAdminRoleId]: [
    // General Services
    "general.place",
    "general.venue",
    "general.tax",
    "general.category",
    "general.offer",
    "general.coupon",
    "general.seat",
    "general.payment",

    // Event Services
    "event.type",
    "event.ticket",
    "event.seat",
    "event.list",
    "event.schedule",

    // Movie Services
    "movie.theater",
    "movie.screen",
    "movie.seat",
    "movie.cast",
    "movie.list",
    "movie.schedule",
    "movie.offer",
    "movie.coupon",

    // Dine Services
    "dine.list",
    "dine.restaurant",
    "dine.schedule",

    // Issues
    "issue.list",
    "alerts.list",

    // Track Requests
    "track.event.organizer",
    "track.movie.seats",
    "track.movie.offer",
    "track.movie.coupon",
    "track.movie.schedule",
    "track.movie.screen",

    // Lead Events
    "lead.event",

    // Advertisement
    "advertisement.category",
    "advertisement.banner",
    "advertisement.schedule",

    // Newsletter
    "newsletter.list",
    "newsletter.subscriber",

    // User Management
    "user.list",

    // App Management
    "app.footer",
    "app.faq",
    "app.info",
    "app.terms",
  ],

  [UserRoleConstants.eventOrganizerRoleId]: [
    // Reports
    "organizer.reports.dashboard",

    // Event Services
    "event.list",
    "event.schedule.add-on",

    // Movie Services (limited access)
    "movie.offer",
    "movie.coupon",
    "movie.screen",
    "movie.seat",
    "movie.schedule",

    // Dine Services
    "dine.list",
    "dine.restaurant",
    "dine.schedule",

    // Issues
    "issue.list",

    // Track Requests
    "track.event.organizer",
    "track.movie.offer",
    "track.movie.coupon",
    "track.movie.screen",
    "track.movie.seats",
    "track.movie.schedule",
  ],

  [UserRoleConstants.techSupportingTeamRoleId]: [
    // General Services
    "general.category",
    "general.offer",
    "general.coupon",
    "general.seat",

    // Event Services
    "event.type",
    "event.ticket",
    "event.seat",
    "event.list",
    "event.schedule",

    // Movie Services
    "movie.theater",
    "movie.screen",
    "movie.seat",
    "movie.cast",
    "movie.list",
    "movie.schedule",
    "movie.offer",
    "movie.coupon",

    // Dine Services
    "dine.list",
    "dine.restaurant",
    "dine.schedule",

    // Issues
    "issue.list",
    "alerts.list",

    // Track Requests
    "track.event.organizer",
    "track.movie.seats",
    "track.movie.offer",
    "track.movie.coupon",
    "track.movie.schedule",
    "track.movie.screen",

    // Advertisement
    "advertisement.category",
    "advertisement.banner",
    "advertisement.schedule",

    // Newsletter
    "newsletter.list",
    "newsletter.subscriber",

    // App Management
    "app.footer",
    "app.faq",
    "app.info",
    "app.terms",
  ],

  [UserRoleConstants.eventSupportingTeamRoleId]: [
    // Event Services
    "event.list",
    "event.schedule.add-on",

    // Movie Services (limited access)
    "movie.offer",
    "movie.coupon",
    "movie.screen",
    "movie.seat",
    "movie.schedule",

    // Dine Services
    "dine.list",
    "dine.restaurant",
    "dine.schedule",

    // Issues
    "issue.list",

    // Track Requests
    "track.event.organizer",
    "track.movie.screen",
    "track.movie.seats",
    "track.movie.offer",
    "track.movie.coupon",
    "track.movie.schedule",
  ],
};

const isNavigationFeatureEnabled = (featureCategory, featureItem = null) => {
  if (!featureCategory) return true;

  const parts = featureCategory.split(".");

  if (parts.length === 1) {
    // Special handling for app_management since it has a nested structure
    if (parts[0] === 'app_management' && featureItem) {
      // App management items are under app_management.subitems.layout.items
      return isItemEnabled('app_management', 'layout', featureItem);
    }

    if (featureItem) {
      return isSubcategoryEnabled(parts[0], featureItem);
    }
    return isCategoryEnabled(parts[0]);
  } else if (parts.length === 2) {
    // Two levels: services.general, issues.tracking, etc.
    if (featureItem) {
      return isItemEnabled(parts[0], parts[1], featureItem);
    }
    return isSubcategoryEnabled(parts[0], parts[1]);
  }

  return true;
};

/**
 * Get navigation items filtered by user permissions and feature flags
 * @param {string[]} allowedKeys - Array of navigation keys allowed for the user
 * @returns {Object[]} - Array of filtered navigation items
 */
const getFilteredNavigationItems = (allowedKeys) => {
  console.log('=== NAVIGATION FILTERING DEBUG ===');
  console.log('Allowed keys for role:', allowedKeys);

  const filteredResults = allowedKeys
    .map((key) => {
      const item = ALL_NAVIGATION_ITEMS[key];
      if (!item) {
        console.log(`❌ Item not found: ${key}`);
        return null;
      }

      // Check if the feature category and specific item are enabled
      const isFeatureEnabled = isNavigationFeatureEnabled(item.category, item.featureItem);

      console.log(`🔍 Checking ${key}:`, {
        category: item.category,
        featureItem: item.featureItem,
        isFeatureEnabled: isFeatureEnabled,
        title: item.title
      });

      if (!isFeatureEnabled) {
        console.log(`🚫 Filtered out: ${key} (feature disabled)`);
        return null;
      }

      console.log(`✅ Included: ${key}`);
      return item;
    })
    .filter(Boolean)
    .map((item) => {
      // Return item with resolved submenu if it's a getter
      return {
        ...item,
        submenu: typeof item.submenu === "function" ? item.submenu : item.submenu,
      };
    });

  console.log('=== FILTERING RESULTS ===');
  console.log('Total items after filtering:', filteredResults.length);

  // Group by category for debugging
  const debugGroups = filteredResults.reduce((groups, item) => {
    const category = item.category || 'uncategorized';
    if (!groups[category]) groups[category] = [];
    groups[category].push(item.title || item.key);
    return groups;
  }, {});

  console.log('Items by category:', debugGroups);

  return filteredResults;
};

/**
 * Group navigation items by their categories
 * @param {Object[]} items - Array of navigation items
 * @returns {Object} - Object with items grouped by category
 */
const groupItemsByCategory = (items) => {
  return items.reduce((groups, item) => {
    const category = item.category || "uncategorized";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});
};

/**
 * Build the navigation tree structure
 * @param {Object[]} items - Array of filtered navigation items
 * @returns {Object[]} - Array representing the navigation tree
 */
// Fix for the buildNavigationTree function - replace the existing function with this corrected version

// Fixed version of buildNavigationTree function
const buildNavigationTree = (items) => {
  const groupedItems = groupItemsByCategory(items);
  const navigationTree = [];

  // Reports Section (Orders)
  if (groupedItems[FEATURE_CATEGORIES.REPORTS]?.length > 0) {
    navigationTree.push({
      key: "Reports",
      path: `${APP_PREFIX_PATH}/reports`,
      title: "sidenav.apps.reports",
      icon: SettingOutlined,
      breadcrumb: true,
      isGroupTitle: true,
      submenu: groupedItems[FEATURE_CATEGORIES.REPORTS],
    });
  }

  // Applications Section (Services + Issues)
  const applicationsSubmenu = [];

  // Services Subsection
  const servicesSubmenu = [];

  // General Services
  if (groupedItems[FEATURE_CATEGORIES.GENERAL]?.length > 0) {
    servicesSubmenu.push({
      key: "general",
      path: `${APP_PREFIX_PATH}/services/general`,
      title: "sidenav.general",
      icon: DashboardOutlined,
      breadcrumb: false,
      isGroupTitle: false,
      submenu: groupedItems[FEATURE_CATEGORIES.GENERAL],
    });
  }

  // Event Services
  if (groupedItems[FEATURE_CATEGORIES.EVENT]?.length > 0) {
    servicesSubmenu.push({
      key: "event",
      path: `${APP_PREFIX_PATH}/services/event`,
      title: "sidenav.event",
      icon: DashboardOutlined,
      breadcrumb: false,
      isGroupTitle: false,
      submenu: groupedItems[FEATURE_CATEGORIES.EVENT],
    });
  }

  // Movie Services
  if (groupedItems[FEATURE_CATEGORIES.MOVIE]?.length > 0) {
    servicesSubmenu.push({
      key: "movie",
      path: `${APP_PREFIX_PATH}/services/movie`,
      title: "sidenav.movie",
      icon: DashboardOutlined,
      breadcrumb: false,
      isGroupTitle: false,
      submenu: groupedItems[FEATURE_CATEGORIES.MOVIE],
    });
  }

  // Dine Services
  if (groupedItems[FEATURE_CATEGORIES.DINE]?.length > 0) {
    servicesSubmenu.push({
      key: "dine",
      path: `${APP_PREFIX_PATH}/services/dine`,
      title: "sidenav.dine",
      icon: DashboardOutlined,
      breadcrumb: false,
      isGroupTitle: false,
      submenu: groupedItems[FEATURE_CATEGORIES.DINE],
    });
  }

  // Add Services to Applications if any services exist
  if (servicesSubmenu.length > 0) {
    applicationsSubmenu.push({
      key: "Services",
      path: `${APP_PREFIX_PATH}/services`,
      title: "sidenav.services",
      icon: DashboardOutlined,
      breadcrumb: false,
      isGroupTitle: false,
      submenu: servicesSubmenu,
    });
  }

  // Issue Tracking
  if (groupedItems[FEATURE_CATEGORIES.ISSUE_TRACKING]?.length > 0) {
    applicationsSubmenu.push({
      key: "issue_tracking",
      path: `${APP_PREFIX_PATH}/issues/tracking`,
      title: "Issue Tracking",
      icon: DashboardOutlined,
      breadcrumb: false,
      isGroupTitle: false,
      submenu: groupedItems[FEATURE_CATEGORIES.ISSUE_TRACKING],
    });
  }

  // Track Requests Section
  if (groupedItems[FEATURE_CATEGORIES.TRACK_REQUESTS]?.length > 0) {
    const trackingItems = groupedItems[FEATURE_CATEGORIES.TRACK_REQUESTS];
    const eventTracking = trackingItems.filter(
      (item) => item.featureItem === "event"
    );
    const movieTracking = trackingItems.filter(
      (item) => item.featureItem === "movie"
    );

    const trackingSubmenu = [];

    if (eventTracking.length > 0) {
      trackingSubmenu.push({
        key: "trackRequest.event",
        path: `${APP_PREFIX_PATH}/track/event`,
        title: "sidenav.event",
        icon: DashboardOutlined,
        breadcrumb: false,
        isGroupTitle: false,
        submenu: eventTracking,
      });
    }

    if (movieTracking.length > 0) {
      trackingSubmenu.push({
        key: "trackRequest.movie",
        path: `${APP_PREFIX_PATH}/track/movie`,
        title: "sidenav.movie",
        icon: DashboardOutlined,
        breadcrumb: false,
        isGroupTitle: false,
        submenu: movieTracking,
      });
    }

    if (trackingSubmenu.length > 0) {
      applicationsSubmenu.push({
        key: "TrackRequests",
        path: `${APP_PREFIX_PATH}/track`,
        title: "Track Requests",
        icon: DashboardOutlined,
        breadcrumb: false,
        isGroupTitle: false,
        submenu: trackingSubmenu,
      });
    }
  }

  // Lead Events Section
  if (groupedItems[FEATURE_CATEGORIES.LEAD_EVENTS]?.length > 0) {
    applicationsSubmenu.push({
      key: "LeadEvents",
      path: `${APP_PREFIX_PATH}/lead-events`,
      title: "Lead Event Requests",
      icon: DashboardOutlined,
      breadcrumb: false,
      isGroupTitle: false,
      submenu: groupedItems[FEATURE_CATEGORIES.LEAD_EVENTS],
    });
  }

  // Add Applications section if any subsections exist
  if (applicationsSubmenu.length > 0) {
    navigationTree.push({
      key: "Applications",
      path: `${APP_PREFIX_PATH}/applications`,
      title: "sidenav.applications",
      icon: DashboardOutlined,
      breadcrumb: false,
      isGroupTitle: true,
      submenu: applicationsSubmenu,
    });
  }

  // Advertisement Section
  if (groupedItems[FEATURE_CATEGORIES.ADVERTISEMENT]?.length > 0) {
    navigationTree.push({
      key: "Advertisement",
      path: `${APP_PREFIX_PATH}/advertisement`,
      title: "sidenav.advertisements",
      icon: DashboardOutlined,
      breadcrumb: false,
      isGroupTitle: false,
      submenu: groupedItems[FEATURE_CATEGORIES.ADVERTISEMENT],
    });
  }

  // Newsletter Section
  if (groupedItems[FEATURE_CATEGORIES.NEWSLETTER]?.length > 0) {
    navigationTree.push({
      key: "Newsletter",
      path: `${APP_PREFIX_PATH}/newsletter`,
      title: "sidenav.news-letter",
      icon: DashboardOutlined,
      breadcrumb: false,
      isGroupTitle: false,
      submenu: groupedItems[FEATURE_CATEGORIES.NEWSLETTER],
    });
  }

  // User Management Section
  if (groupedItems[FEATURE_CATEGORIES.USER_MANAGEMENT]?.length > 0) {
    navigationTree.push({
      key: "UserManagement",
      path: `${APP_PREFIX_PATH}/users`,
      title: "User Management",
      icon: DashboardOutlined,
      breadcrumb: false,
      isGroupTitle: false,
      submenu: groupedItems[FEATURE_CATEGORIES.USER_MANAGEMENT],
    });
  }

  // App Management Section - FIXED: This was the main issue
  if (groupedItems[FEATURE_CATEGORIES.APP_MANAGEMENT]?.length > 0) {
    navigationTree.push({
      key: "AppManagement",
      path: `${APP_PREFIX_PATH}/app/management`,
      title: "sidenav.app.management",
      icon: SettingOutlined,
      breadcrumb: false,
      isGroupTitle: false,
      submenu: [
        {
          key: "app.management.layout",
          path: `${APP_PREFIX_PATH}/app/management/layout`,
          title: "sidenav.app.management.layout",
          icon: LayoutOutlined,
          breadcrumb: false,
          isGroupTitle: false,
          submenu: groupedItems[FEATURE_CATEGORIES.APP_MANAGEMENT],
        },
      ],
    });
  }

  // Debug logging - remove in production
  console.log("Navigation Debug Info:", {
    appManagementItems: groupedItems[FEATURE_CATEGORIES.APP_MANAGEMENT],
    appManagementEnabled:
      groupedItems[FEATURE_CATEGORIES.APP_MANAGEMENT]?.length > 0,
    totalNavigationItems: navigationTree.length,
  });

  return navigationTree;
};

/**
 * Get user role from JWT token
 * @param {string} token - JWT token
 * @returns {string|null} - User role ID or null if invalid
 */
const getUserRoleFromToken = (token) => {
  try {
    const decodedToken = jwtDecode(token);
    return decodedToken?.role_id || null;
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
};

/**
 * Main navigation configuration function
 * @returns {Object[]} - Navigation tree for the current user
 */
const navigationConfig = () => {
  // Get token from localStorage
  const token = localStorage.getItem(AUTH_TOKEN);
  if (!token) {
    console.warn("No authentication token found");
    return [];
  }

  // Get user role from token
  const userRoleId = getUserRoleFromToken(token);
  if (!userRoleId) {
    console.error("Invalid token or missing role information");
    return [];
  }

  // Get allowed navigation keys for the user role
  const allowedNavigationKeys = ROLE_NAVIGATION_ACCESS[userRoleId];
  if (!allowedNavigationKeys) {
    console.warn(`No navigation access defined for role: ${userRoleId}`);
    return [];
  }

  try {
    // Filter navigation items based on permissions and feature flags
    const filteredItems = getFilteredNavigationItems(allowedNavigationKeys);

    // Build and return the navigation tree
    const navigationTree = buildNavigationTree(filteredItems);

    console.log(`Navigation tree built successfully for role: ${userRoleId}`, {
      totalItems: filteredItems.length,
      treeNodes: navigationTree.length,
      enabledCategories: Object.keys(NAVIGATION_BAR_FEATURE_FLAGS).filter(
        (category) => isCategoryEnabled(category)
      ),
    });

    return navigationTree;
  } catch (error) {
    console.error("Error building navigation tree:", error);
    return [];
  }
};

/**
 * Utility function to check if a specific feature is available for current user
 * @param {string} category - Feature category
 * @param {string} subcategory - Feature subcategory (optional)
 * @returns {boolean} - Whether feature is available
 */
export const isFeatureAvailableForUser = (category, subcategory = null) => {
  const token = localStorage.getItem(AUTH_TOKEN);
  if (!token) return false;

  const userRoleId = getUserRoleFromToken(token);
  if (!userRoleId) return false;

  if (subcategory) {
    return isSubcategoryEnabled(category, subcategory);
  } else {
    return isCategoryEnabled(category);
  }
};

/**
 * Utility function to get all available categories for current user
 * @returns {string[]} - Array of available feature categories
 */
export const getAvailableCategoriesForUser = () => {
  return Object.keys(NAVIGATION_BAR_FEATURE_FLAGS).filter((category) =>
    isCategoryEnabled(category)
  );
};

export default navigationConfig;
export { FEATURE_CATEGORIES, ALL_NAVIGATION_ITEMS, ROLE_NAVIGATION_ACCESS };
