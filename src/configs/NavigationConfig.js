import {
  DashboardOutlined,
  LayoutOutlined,
  OrderedListOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { APP_PREFIX_PATH, FEATURE_FLAGS } from "configs/AppConfig";
import { AUTH_TOKEN } from "constants/AuthConstant";
import { UserRoleConstants } from "constants/UserRoleConstant";
import { jwtDecode } from "jwt-decode";

// Define feature categories for better organization
const FEATURE_CATEGORIES = {
  REPORTS: "is_reports_enabled",
  GENERAL: "is_general_enabled",
  EVENT: "is_event_enabled",
  MOVIE: "is_movie_enabled",
  DINE: "is_dine_enabled",
  ISSUE_TRACKING: "is_issue_tracking_enabled",
  TRACK_REQUESTS: "is_track_requests_enabled",
  LEAD_EVENTS: "is_lead_events_enabled",
  ADVERTISEMENT: "is_advertisement_enabled",
  NEWSLETTER: "is_newsletter_enabled",
  USER_MANAGEMENT: "is_user_management_enabled",
  APP_MANAGEMENT: "is_app_management_enabled",
};

const ALL_NAVIGATION_ITEMS = {
  // Reports - All items under is_reports_enabled
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
    submenu: [
      {
        key: "reports.orders.event",
        path: `${APP_PREFIX_PATH}/reports/orders/event`,
        title: "sidenav.event",
        icon: DashboardOutlined,
        breadcrumb: false,
        submenu: [],
      },
      {
        key: "reports.orders.movie",
        path: `${APP_PREFIX_PATH}/reports/orders/movie`,
        title: "sidenav.movie",
        icon: DashboardOutlined,
        breadcrumb: false,
        submenu: [],
      },
    ],
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

  // General Services - All items under is_general_enabled
  "general.place": {
    key: "place.list",
    path: `${APP_PREFIX_PATH}/place/list`,
    title: "sidenav.place.list",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.GENERAL,
  },
  "general.venue": {
    key: "venue.list",
    path: `${APP_PREFIX_PATH}/venue/list`,
    title: "sidenav.venue.list",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.GENERAL,
  },
  "general.tax": {
    key: "tax.list",
    path: `${APP_PREFIX_PATH}/tax/list`,
    title: "sidenav.tax",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.GENERAL,
  },
  "general.category": {
    key: "category.list",
    path: `${APP_PREFIX_PATH}/category/list`,
    title: "sidenav.category",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.GENERAL,
  },
  "general.offer": {
    key: "offer.list",
    path: `${APP_PREFIX_PATH}/offer/list/general`,
    title: "sidenav.offer",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.GENERAL,
  },
  "general.coupon": {
    key: "coupon.list",
    path: `${APP_PREFIX_PATH}/coupon/list/general`,
    title: "sidenav.coupon",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.GENERAL,
  },
  "general.seat": {
    key: "seat.list",
    path: `${APP_PREFIX_PATH}/seat/list`,
    title: "sidenav.seat",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.GENERAL,
  },
  "general.payment": {
    key: "sidenav.payment",
    path: `${APP_PREFIX_PATH}/payment/list`,
    title: "sidenav.payment",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.GENERAL,
  },

  // Event Services - All items under is_event_enabled
  "event.type": {
    key: "event.type.list",
    path: `${APP_PREFIX_PATH}/event/type/list`,
    title: "sidenav.event.type",
    icon: DashboardOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.EVENT,
  },
  "event.ticket": {
    key: "ticket.list",
    path: `${APP_PREFIX_PATH}/ticket/list`,
    title: "sidenav.ticket",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.EVENT,
  },
  "event.seat": {
    key: "seat.event.list",
    path: `${APP_PREFIX_PATH}/seat/event/list`,
    title: "sidenav.seat",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.EVENT,
  },
  "event.list": {
    key: "event.list",
    path: `${APP_PREFIX_PATH}/event/list`,
    title: "sidenav.event.list",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.EVENT,
  },
  "event.schedule": {
    key: "schedule.list",
    path: `${APP_PREFIX_PATH}/schedule/list`,
    title: "sidenav.schedule",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.EVENT,
  },

  // Movie Services - All items under is_movie_enabled
  "movie.theater": {
    key: "movie.theater",
    path: `${APP_PREFIX_PATH}/movie-theater-company/list`,
    title: "sidenav.theater",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.MOVIE,
  },
  "movie.screen": {
    key: "movie.screen",
    path: `${APP_PREFIX_PATH}/screen/list`,
    title: "sidenav.screen",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.MOVIE,
  },
  "movie.seat": {
    key: "movie.seat",
    path: `${APP_PREFIX_PATH}/seat/movie/list`,
    title: "sidenav.seat",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.MOVIE,
  },
  "movie.cast": {
    key: "movie.cast",
    path: `${APP_PREFIX_PATH}/personality/list`,
    title: "sidenav.movie.cast",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.MOVIE,
  },
  "movie.list": {
    key: "movie.movie",
    path: `${APP_PREFIX_PATH}/movie/list`,
    title: "sidenav.movie.movies",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.MOVIE,
  },
  "movie.schedule": {
    key: "movie.schedule",
    path: `${APP_PREFIX_PATH}/movie-schedule/list`,
    title: "sidenav.movie.schedule",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.MOVIE,
  },
  "movie.offer": {
    key: "movie.offer.list",
    path: `${APP_PREFIX_PATH}/offer/list/movie`,
    title: "sidenav.offer",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.MOVIE,
  },
  "movie.coupon": {
    key: "movie.coupon.list",
    path: `${APP_PREFIX_PATH}/coupon/list/movie`,
    title: "sidenav.coupon",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.MOVIE,
  },

  // Dine Services - All items under is_dine_enabled
  "dine.list": {
    key: "dine.dine",
    path: `${APP_PREFIX_PATH}/dine/list`,
    title: "sidenav.dine.dine",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.DINE,
  },
  "dine.restaurant": {
    key: "dine.restaurant",
    path: `${APP_PREFIX_PATH}/restaurant/list`,
    title: "sidenav.dine.restaurant",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.DINE,
  },
  "dine.schedule": {
    key: "dine.schedule",
    path: `${APP_PREFIX_PATH}/dine/schedule/list`,
    title: "sidenav.dine.schedule",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.DINE,
  },

  // Issues - All items under is_issue_tracking_enabled
  "issue.list": {
    key: "issue.list",
    path: `${APP_PREFIX_PATH}/issue/list`,
    title: "sidenav.apps.issue",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.ISSUE_TRACKING,
  },
  "alerts.list": {
    key: "alerts.list",
    path: `${APP_PREFIX_PATH}/alerts/list`,
    title: "sidenav.apps.alerts",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.ISSUE_TRACKING,
  },

  // Track Requests - All items under is_track_requests_enabled
  "track.event.organizer": {
    key: "eventOrganiser.update",
    path: `${APP_PREFIX_PATH}/track-team/event-organizer/updatelist`,
    title: "sidenav.eventcoordinatorupdates",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.TRACK_REQUESTS,
  },
  "track.movie.seats": {
    key: "trackRequest.movie.seats.status.list",
    path: `${APP_PREFIX_PATH}/track/movie-seats/status/list`,
    title: "sidenav.seat",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.TRACK_REQUESTS,
  },
  "track.movie.offer": {
    key: "trackRequest.movie.offer.status.list",
    path: `${APP_PREFIX_PATH}/track/offer/status/list/movie`,
    title: "sidenav.offer",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.TRACK_REQUESTS,
  },
  "track.movie.coupon": {
    key: "trackRequest.movie.coupon.status.list",
    path: `${APP_PREFIX_PATH}/track/coupon/status/list/movie`,
    title: "sidenav.coupon",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.TRACK_REQUESTS,
  },
  "track.movie.schedule": {
    key: "trackRequest.movie.schedule.status.list",
    path: `${APP_PREFIX_PATH}/track/movie-schedule/status/list/movie`,
    title: "sidenav.movie.schedule",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.TRACK_REQUESTS,
  },
  "track.movie.screen": {
    key: "trackRequest.movie.screen.status.list",
    path: `${APP_PREFIX_PATH}/track/movie-screens/status/list`,
    title: "sidenav.screen",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.TRACK_REQUESTS,
  },

  // Lead Events - All items under is_lead_events_enabled
  "lead.event": {
    key: "customerEvent.update",
    path: `${APP_PREFIX_PATH}/leadevent/list`,
    title: "sidenav.leadevent",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.LEAD_EVENTS,
  },

  // Advertisement - All items under is_advertisement_enabled
  "advertisement.category": {
    key: "advertisement.category.list",
    path: `${APP_PREFIX_PATH}/advertisement/category/list`,
    title: "advertisement.category",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.ADVERTISEMENT,
  },
  "advertisement.banner": {
    key: "advertisement.banner.list",
    path: `${APP_PREFIX_PATH}/advertisement/banner/list`,
    title: "advertisement.banner",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.ADVERTISEMENT,
  },
  "advertisement.schedule": {
    key: "advertisement.schedule.list",
    path: `${APP_PREFIX_PATH}/advertisement/schedule/list`,
    title: "advertisement.schedule",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.ADVERTISEMENT,
  },

  // Newsletter - All items under is_newsletter_enabled
  "newsletter.list": {
    key: "news-letter.list",
    path: `${APP_PREFIX_PATH}/news-letter/list/`,
    title: "sidenav.news-letter",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.NEWSLETTER,
  },
  "newsletter.subscriber": {
    key: "news-letter.subscriber.list",
    path: `${APP_PREFIX_PATH}/news-letter/subscriber/list/`,
    title: "news-letter.subscriber.list",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.NEWSLETTER,
  },

  // User Management - All items under is_user_management_enabled
  "user.list": {
    key: "user.list",
    path: `${APP_PREFIX_PATH}/user/list`,
    title: "sidenav.user",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.USER_MANAGEMENT,
  },
  "access.control": {
    key: "accessControl.list",
    path: `${APP_PREFIX_PATH}/access-control/list`,
    title: "sidenav.accessControl",
    icon: OrderedListOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.USER_MANAGEMENT,
  },

  // App Management - All items under is_app_management_enabled
  "app.footer": {
    key: "app.management.layout.footer.list",
    path: `${APP_PREFIX_PATH}/app/management/layout/footer/list`,
    title: "sidenav.app.management.layout.footer",
    icon: LayoutOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.APP_MANAGEMENT,
  },
  "app.faq": {
    key: "app.management.layout.faq.list",
    path: `${APP_PREFIX_PATH}/app/management/layout/faq/list`,
    title: "sidenav.app.management.layout.faq",
    icon: LayoutOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.APP_MANAGEMENT,
  },
  "app.info": {
    key: "app.management.layout.info.list",
    path: `${APP_PREFIX_PATH}/app/management/layout/app-info/list`,
    title: "sidenav.app.management.layout.info",
    icon: LayoutOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.APP_MANAGEMENT,
  },
  "app.terms": {
    key: "app.management.layout.terms.list",
    path: `${APP_PREFIX_PATH}/app/management/layout/terms/list`,
    title: "sidenav.app.management.layout.terms",
    icon: LayoutOutlined,
    breadcrumb: false,
    submenu: [],
    category: FEATURE_CATEGORIES.APP_MANAGEMENT,
  },
};

// Role-based navigation access mapping
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

/**
 * Check if a feature is enabled based on feature flags
 * @param {string} featureFlag - The feature flag to check
 * @returns {boolean} - Whether the feature is enabled
 */
const isFeatureEnabled = (featureFlag) => {
  if (!featureFlag) return true;
  return FEATURE_FLAGS[featureFlag] === true;
};

/**
 * Get navigation items filtered by user permissions and feature flags
 * @param {string[]} allowedKeys - Array of navigation keys allowed for the user
 * @returns {Object[]} - Array of filtered navigation items
 */
const getFilteredNavigationItems = (allowedKeys) => {
  return allowedKeys
    .filter((key) => {
      const item = ALL_NAVIGATION_ITEMS[key];
      if (!item) return false;

      // Check if the feature category is enabled
      return isFeatureEnabled(item.category);
    })
    .map((key) => ALL_NAVIGATION_ITEMS[key]);
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
const buildNavigationTree = (items) => {
  const groupedItems = groupItemsByCategory(items);
  const navigationTree = [];

  // Reports Section
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

  // Applications Section (Services)
  const serviceCategories = [
    FEATURE_CATEGORIES.GENERAL,
    FEATURE_CATEGORIES.EVENT,
    FEATURE_CATEGORIES.MOVIE,
    FEATURE_CATEGORIES.DINE,
  ];

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

  if (servicesSubmenu.length > 0) {
    navigationTree.push({
      key: "Applications",
      path: `${APP_PREFIX_PATH}/apps`,
      title: "sidenav.applications",
      icon: DashboardOutlined,
      breadcrumb: false,
      isGroupTitle: true,
      submenu: [
        {
          key: "Services",
          path: `${APP_PREFIX_PATH}/services`,
          title: "sidenav.services",
          icon: DashboardOutlined,
          breadcrumb: false,
          isGroupTitle: false,
          submenu: servicesSubmenu,
        },
      ],
    });
  }

  // Issues Section
  if (groupedItems[FEATURE_CATEGORIES.ISSUE_TRACKING]?.length > 0) {
    navigationTree.push({
      key: "Issues",
      path: `${APP_PREFIX_PATH}/issues`,
      title: "sidenav.apps.issues",
      icon: DashboardOutlined,
      breadcrumb: false,
      isGroupTitle: false,
      submenu: groupedItems[FEATURE_CATEGORIES.ISSUE_TRACKING],
    });
  }

  // Track Requests Section
  if (groupedItems[FEATURE_CATEGORIES.TRACK_REQUESTS]?.length > 0) {
    const trackingItems = groupedItems[FEATURE_CATEGORIES.TRACK_REQUESTS];
    const eventTracking = trackingItems.filter((item) =>
      item.key.includes("event")
    );
    const movieTracking = trackingItems.filter((item) =>
      item.key.includes("movie")
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
      navigationTree.push({
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
    navigationTree.push({
      key: "LeadEvents",
      path: `${APP_PREFIX_PATH}/lead-events`,
      title: "Lead Event Requests",
      icon: DashboardOutlined,
      breadcrumb: false,
      isGroupTitle: false,
      submenu: groupedItems[FEATURE_CATEGORIES.LEAD_EVENTS],
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
      title: "sidenav.user.management",
      icon: DashboardOutlined,
      breadcrumb: false,
      isGroupTitle: false,
      submenu: groupedItems[FEATURE_CATEGORIES.USER_MANAGEMENT],
    });
  }

  // App Management Section
  if (groupedItems[FEATURE_CATEGORIES.APP_MANAGEMENT]?.length > 0) {
    navigationTree.push({
      key: "AppManagement",
      path: `${APP_PREFIX_PATH}/app/management`,
      title: "sidenav.app.management",
      icon: SettingOutlined,
      breadcrumb: true,
      isGroupTitle: true,
      submenu: [
        {
          key: "app.management.layout",
          path: `${APP_PREFIX_PATH}/app/management/layout`,
          title: "sidenav.app.management.layout",
          icon: LayoutOutlined,
          breadcrumb: false,
          submenu: groupedItems[FEATURE_CATEGORIES.APP_MANAGEMENT],
        },
      ],
    });
  }

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
      enabledFeatures: Object.entries(FEATURE_FLAGS)
        .filter(([, enabled]) => enabled)
        .map(([feature]) => feature),
    });

    return navigationTree;
  } catch (error) {
    console.error("Error building navigation tree:", error);
    return [];
  }
};

/**
 * Utility function to check if a specific feature is available for current user
 * @param {string} featureFlag - Feature flag to check
 * @returns {boolean} - Whether feature is available
 */
export const isFeatureAvailableForUser = (featureFlag) => {
  const token = localStorage.getItem(AUTH_TOKEN);
  if (!token) return false;

  const userRoleId = getUserRoleFromToken(token);
  if (!userRoleId) return false;

  const allowedKeys = ROLE_NAVIGATION_ACCESS[userRoleId] || [];
  const userItems = getFilteredNavigationItems(allowedKeys);

  return userItems.some((item) => item.category === featureFlag);
};

/**
 * Utility function to get all available categories for current user
 * @returns {string[]} - Array of available feature categories
 */
export const getAvailableCategoriesForUser = () => {
  const token = localStorage.getItem(AUTH_TOKEN);
  if (!token) return [];

  const userRoleId = getUserRoleFromToken(token);
  if (!userRoleId) return [];

  const allowedKeys = ROLE_NAVIGATION_ACCESS[userRoleId] || [];
  const userItems = getFilteredNavigationItems(allowedKeys);

  return [...new Set(userItems.map((item) => item.category))];
};

export default navigationConfig;
export { FEATURE_CATEGORIES, ALL_NAVIGATION_ITEMS, ROLE_NAVIGATION_ACCESS };
