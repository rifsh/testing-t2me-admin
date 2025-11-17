import React from "react";
import { AUTH_PREFIX_PATH, APP_PREFIX_PATH } from "configs/AppConfig";
import TheaterList from "views/theater/components/TheaterList";
import {
  isFeatureEnabled,
  isCategoryEnabled,
  isSubcategoryEnabled,
  isItemEnabled,
} from "utils/navigationUtils";

// Enhanced route filtering function
const isRouteFeatureEnabled = (
  feature,
  category = null,
  subcategory = null,
  item = null
) => {
  // Handle legacy feature flags first
  if (feature && isFeatureEnabled(feature) !== undefined) {
    return isFeatureEnabled(feature);
  }

  // Handle new hierarchical structure
  if (category && subcategory && item) {
    // Three-level check: category -> subcategory -> item
    return isItemEnabled(category, subcategory, item);
  } else if (category && subcategory) {
    // Two-level check: category -> subcategory
    return isSubcategoryEnabled(category, subcategory);
  } else if (category) {
    // One-level check: category only
    return isCategoryEnabled(category);
  }

  return true; // Default: enabled if no feature flag specified
};

// All available routes mapped by feature keys
const ALL_PROTECTED_ROUTES = {
  // Reports (Orders category)
  "reports.dashboard": {
    key: "dashboard.default",
    path: `${APP_PREFIX_PATH}/dashboards/default`,
    component: React.lazy(() => import("views/app-views/dashboards/default")),
    category: "orders",
  },
  "reports.dashboard": {
    key: "super-admin.statistics",
    path: `${APP_PREFIX_PATH}/dashboards/statics`,
    component: React.lazy(() => import("views/app-views/statics/index")),
    category: "orders",
  },
  "reports.analytic": {
    key: "dashboard.analytic",
    path: `${APP_PREFIX_PATH}/dashboards/analytic`,
    component: React.lazy(() => import("views/app-views/dashboards/analytic")),
    category: "orders",
  },
  "reports.sales": {
    key: "dashboard.sales",
    path: `${APP_PREFIX_PATH}/dashboards/sales`,
    component: React.lazy(() => import("views/app-views/dashboards/sales")),
    category: "orders",
  },
  "reports.orders.event": {
    key: "reports.orders.event",
    path: `${APP_PREFIX_PATH}/reports/orders/event`,
    component: React.lazy(() => import("views/orders/event/list")),
    category: "orders",
    subcategory: "event",
  },
  "reports.orders.event.details": {
    key: "reports.orders.event.details",
    path: `${APP_PREFIX_PATH}/reports/orders/event/details/:id`,
    component: React.lazy(() => import("views/orders/event/details")),
    category: "orders",
    subcategory: "event",
  },
  "reports.orders.booking": {
    key: "reports.orders.booking",
    path: `${APP_PREFIX_PATH}/reports/orders/by-booking/:type`,
    component: React.lazy(() => import("views/orders/by-booking/list")),
    category: "orders",
    subcategory: "event",
  },
  "reports.orders.booking.detail": {
    key: "reports.orders.booking.detail",
    path: `${APP_PREFIX_PATH}/reports/orders/by-booking/detail/:id/:type`,
    component: React.lazy(() => import("views/orders/by-booking/details")),
    category: "orders",
    subcategory: "event",
  },
  "reports.batchrun.loger": {
    key: "reports.orders.appscheduler",
    path: `${APP_PREFIX_PATH}/reports/activity/logs`,
    component: React.lazy(() => import("views/logger/batch-run/list")),
    category: "orders",
    subcategory: "event",
  },
  "reports.orders.appscheduler": {
    key: "reports.orders.appscheduler",
    path: `${APP_PREFIX_PATH}/reports/orders/app-scheduler`,
    component: React.lazy(() => import("views/logger/app-scheduler/list")),
    category: "orders",
    subcategory: "event",
  },
  "reports.orders.event.user": {
    key: "reports.orders.event.details.user",
    path: `${APP_PREFIX_PATH}/reports/orders/event/user/details/:schedule_id/:date_id/:time_id/:user_id`,
    component: React.lazy(() => import("views/orders/event/userDetails")),
    category: "orders",
    subcategory: "event",
  },
  "reports.orders.movie": {
    key: "reports.orders.movie",
    path: `${APP_PREFIX_PATH}/reports/orders/movie`,
    component: React.lazy(() => import("views/orders/movie/list")),
    category: "orders",
    subcategory: "movie",
  },
  "reports.orders.movie.details": {
    key: "reports.orders.movie.details",
    path: `${APP_PREFIX_PATH}/reports/orders/movie/details/:id`,
    component: React.lazy(() => import("views/orders/movie/details")),
    category: "orders",
    subcategory: "movie",
  },
  "reports.orders.movie.user": {
    key: "reports.orders.movie.details.user",
    path: `${APP_PREFIX_PATH}/reports/orders/movie/user/details/:schedule_id/:date_id/:time_id/:user_id`,
    component: React.lazy(() => import("views/orders/movie/userDetails")),
    category: "orders",
    subcategory: "movie",
  },
  "organizer.reports.dashboard": {
    key: "organizer.reports",
    path: `${APP_PREFIX_PATH}/organizer/reports`,
    component: React.lazy(() =>
      import("views/app-views/apps/organizer/reports")
    ),
    category: "orders",
  },
  "super.admin.reports": {
    key: "super-admin.reports",
    path: `${APP_PREFIX_PATH}/super-admin/reports`,
    component: React.lazy(() =>
      import("views/app-views/apps/super-admin/reports")
    ),
    category: "orders",
  },

  // General Services
  "general.event.type": {
    key: "event.type.list",
    path: `${APP_PREFIX_PATH}/event/type/list`,
    component: React.lazy(() => import("views/event-type/list-type")),
    category: "services",
    subcategory: "event",
    item: "event_type",
  },
  "general.event.type.add": {
    key: "event.type.add",
    path: `${APP_PREFIX_PATH}/event/type/add`,
    component: React.lazy(() => import("views/event-type/add-type")),
    category: "services",
    subcategory: "event",
    item: "event_type",
  },
  "general.event.type.edit": {
    key: "event.type.edit",
    path: `${APP_PREFIX_PATH}/event/type/edit/:typeId`,
    component: React.lazy(() => import("views/event-type/edit-type")),
    category: "services",
    subcategory: "event",
    item: "event_type",
  },
  "general.place": {
    key: "place.list",
    path: `${APP_PREFIX_PATH}/place/list`,
    component: React.lazy(() => import("views/locations/place/list-place")),
    category: "services",
    subcategory: "general",
    item: "place",
  },
  "general.place.add": {
    key: "place.add",
    path: `${APP_PREFIX_PATH}/place/add`,
    component: React.lazy(() => import("views/locations/place/add-place")),
    category: "services",
    subcategory: "general",
    item: "place",
  },
  "general.place.edit": {
    key: "place.edit",
    path: `${APP_PREFIX_PATH}/place/edit/:placeId`,
    component: React.lazy(() => import("views/locations/place/edit_place")),
    category: "services",
    subcategory: "general",
    item: "place",
  },
  "general.place.details": {
    key: "place.details",
    path: `${APP_PREFIX_PATH}/place/details/:placeId`,
    component: React.lazy(() => import("views/locations/place/place-details")),
    category: "services",
    subcategory: "general",
    item: "place",
  },
  "general.venue": {
    key: "venue.list",
    path: `${APP_PREFIX_PATH}/venue/list`,
    component: React.lazy(() => import("views/locations/venue/list-venue")),
    category: "services",
    subcategory: "general",
    item: "venue",
  },
  "general.venue.add": {
    key: "venue.add",
    path: `${APP_PREFIX_PATH}/venue/add`,
    component: React.lazy(() => import("views/locations/venue/add-venue")),
    category: "services",
    subcategory: "general",
    item: "venue",
  },
  "general.venue.edit": {
    key: "venue.edit",
    path: `${APP_PREFIX_PATH}/venue/edit/:venueId`,
    component: React.lazy(() => import("views/locations/venue/edit_venue")),
    category: "services",
    subcategory: "general",
    item: "venue",
  },
  "general.venue.details": {
    key: "venue.details",
    path: `${APP_PREFIX_PATH}/venue/details/:venueId`,
    component: React.lazy(() => import("views/locations/venue/venue-details")),
    category: "services",
    subcategory: "general",
    item: "venue",
  },
  "general.tax": {
    key: "tax.list",
    path: `${APP_PREFIX_PATH}/tax/list`,
    component: React.lazy(() => import("views/tax/list-tax")),
    category: "services",
    subcategory: "general",
    item: "tax",
  },
  "general.tax.add": {
    key: "tax.add",
    path: `${APP_PREFIX_PATH}/tax/add`,
    component: React.lazy(() => import("views/tax/add-tax")),
    category: "services",
    subcategory: "general",
    item: "tax",
  },
  "general.tax.edit": {
    key: "tax.edit",
    path: `${APP_PREFIX_PATH}/tax/edit/:taxId`,
    component: React.lazy(() => import("views/tax/edit-tax/index")),
    category: "services",
    subcategory: "general",
    item: "tax",
  },
  "general.category": {
    key: "category.list",
    path: `${APP_PREFIX_PATH}/category/list`,
    component: React.lazy(() =>
      import("views/category/category/list-category")
    ),
    category: "services",
    subcategory: "general",
    item: "category",
  },
  "general.category.add": {
    key: "category.add",
    path: `${APP_PREFIX_PATH}/category/add`,
    component: React.lazy(() => import("views/category/category/add-category")),
    category: "services",
    subcategory: "general",
    item: "category",
  },
  "general.category.details": {
    key: "category.details",
    path: `${APP_PREFIX_PATH}/category/details/:categoryId`,
    component: React.lazy(() =>
      import("views/category/category/category-detials")
    ),
    category: "services",
    subcategory: "general",
    item: "category",
  },
  "general.category.edit": {
    key: "category.edit",
    path: `${APP_PREFIX_PATH}/category/edit/category/:catId`,
    component: React.lazy(() =>
      import("views/category/category/edit-category/category/index")
    ),
    category: "services",
    subcategory: "general",
    item: "category",
  },
  "general.subcategory.details": {
    key: "subcategory.details",
    path: `${APP_PREFIX_PATH}/subcategory/details/:subcategoryId`,
    component: React.lazy(() =>
      import("views/category/category/subcategory-details")
    ),
    category: "services",
    subcategory: "general",
    item: "category",
  },
  "general.subcategory.edit": {
    key: "subcategory.edit",
    path: `${APP_PREFIX_PATH}/category/edit/subcategory/:subcatId`,
    component: React.lazy(() =>
      import("views/category/category/edit-category/subcategory/index")
    ),
    category: "services",
    subcategory: "general",
    item: "category",
  },
  "general.offer": {
    key: "offer.list",
    path: `${APP_PREFIX_PATH}/offer/list/:type`,
    component: React.lazy(() => import("views/offer/list-offer")),
    category: "services",
    subcategory: "general",
    item: "offer",
  },
  "general.offer.add": {
    key: "offer.add",
    path: `${APP_PREFIX_PATH}/offer/add/:type`,
    component: React.lazy(() => import("views/offer/add-offer")),
    category: "services",
    subcategory: "general",
    item: "offer",
  },
  "general.offer.edit": {
    key: "offer.edit",
    path: `${APP_PREFIX_PATH}/offer/edit/:offerId/:type`,
    component: React.lazy(() => import("views/offer/edit-offer/index")),
    category: "services",
    subcategory: "general",
    item: "offer",
  },
  "general.coupon": {
    key: "coupon.list",
    path: `${APP_PREFIX_PATH}/coupon/list/:type`,
    component: React.lazy(() => import("views/coupon/list-coupon")),
    category: "services",
    subcategory: "general",
    item: "coupon",
  },
  "general.coupon.add": {
    key: "coupon.add",
    path: `${APP_PREFIX_PATH}/coupon/add`,
    component: React.lazy(() => import("views/coupon/add-coupon")),
    category: "services",
    subcategory: "general",
    item: "coupon",
  },
  "general.coupon.edit": {
    key: "coupon.edit",
    path: `${APP_PREFIX_PATH}/coupon/edit/:couponId`,
    component: React.lazy(() => import("views/coupon/edit-coupon/index")),
    category: "services",
    subcategory: "general",
    item: "coupon",
  },
  "general.seat": {
    key: "seat.list",
    path: `${APP_PREFIX_PATH}/seat/list`,
    component: React.lazy(() => import("views/seat/stadium/list-seat")),
    category: "services",
    subcategory: "general",
    item: "seat",
  },
  "general.seat.add": {
    key: "seat.add",
    path: `${APP_PREFIX_PATH}/seat/add`,
    component: React.lazy(() => import("views/seat/stadium/add-seat")),
    category: "services",
    subcategory: "general",
    item: "seat",
  },
  "general.payment": {
    key: "payment.list",
    path: `${APP_PREFIX_PATH}/payment/list`,
    component: React.lazy(() => import("views/payment/list-payment")),
    category: "services",
    subcategory: "general",
    item: "payment",
  },
  "general.payment.add": {
    key: "payment.add",
    path: `${APP_PREFIX_PATH}/payment/add`,
    component: React.lazy(() => import("views/payment/add-payment")),
    category: "services",
    subcategory: "general",
    item: "payment",
  },
  "general.payment.edit": {
    key: "payment.edit",
    path: `${APP_PREFIX_PATH}/payment/edit/:paymentId`,
    component: React.lazy(() => import("views/payment/edit-payment")),
    category: "services",
    subcategory: "general",
    item: "payment",
  },
  "general.payment.details": {
    key: "payment.details",
    path: `${APP_PREFIX_PATH}/payment/details/:paymentId`,
    component: React.lazy(() => import("views/payment/payment-details")),
    category: "services",
    subcategory: "general",
    item: "payment",
  },

  // Event Services
  "event.ticket": {
    key: "ticket.list",
    path: `${APP_PREFIX_PATH}/ticket/list`,
    component: React.lazy(() => import("views/ticket/list-ticket")),
    category: "services",
    subcategory: "event",
    item: "ticket",
  },
  "event.ticket.add": {
    key: "ticket.add",
    path: `${APP_PREFIX_PATH}/ticket/add`,
    component: React.lazy(() => import("views/ticket/add-ticket")),
    category: "services",
    subcategory: "event",
    item: "ticket",
  },
  "event.ticket.edit": {
    key: "ticket.edit",
    path: `${APP_PREFIX_PATH}/ticket/edit/:ticketId`,
    component: React.lazy(() => import("views/ticket/edit-ticket/index")),
    category: "services",
    subcategory: "event",
    item: "ticket",
  },
  "event.ticket.type": {
    key: "ticket.type",
    path: `${APP_PREFIX_PATH}/ticket/type/add`,
    component: React.lazy(() => import("views/ticket/components/MultyForm.js")),
    category: "services",
    subcategory: "event",
    item: "ticket",
  },
  "event.offer": {
    key: "offer.event.list",
    path: `${APP_PREFIX_PATH}/offer/list/:type`,
    component: React.lazy(() => import("views/offer/list-offer")),
    category: "services",
    subcategory: "event",
    item: "offer",
  },
  "event.coupon": {
    key: "coupon.event.list",
    path: `${APP_PREFIX_PATH}/coupon/list/:type`,
    component: React.lazy(() => import("views/coupon/list-coupon")),
    category: "services",
    subcategory: "event",
    item: "coupon",
  },
  "event.seat": {
    key: "seat.event.list",
    path: `${APP_PREFIX_PATH}/seat/event/list`,
    component: React.lazy(() => import("views/seat/event/list-seat")),
    category: "services",
    subcategory: "event",
    item: "seat",
  },
  "event.seat.add": {
    key: "seat.event.add",
    path: `${APP_PREFIX_PATH}/seat/event/add`,
    component: React.lazy(() => import("views/seat/event/add-seat")),
    category: "services",
    subcategory: "event",
    item: "seat",
  },
  "event.seat.edit": {
    key: "seat.event.edit",
    path: `${APP_PREFIX_PATH}/seat/event/edit/:seatId`,
    component: React.lazy(() => import("views/seat/event/edit-seat")),
    category: "services",
    subcategory: "event",
    item: "seat",
  },
  "event.seat.details": {
    key: "seat.event.details",
    path: `${APP_PREFIX_PATH}/seat/event/:seatId`,
    component: React.lazy(() => import("views/seat/event/details-seat")),
    category: "services",
    subcategory: "event",
    item: "seat",
  },
  "event.list": {
    key: "event.list",
    path: `${APP_PREFIX_PATH}/event/list`,
    component: React.lazy(() => import("views/event/event-list")),
    category: "services",
    subcategory: "event",
    item: "event",
  },
  "event.add": {
    key: "event.add",
    path: `${APP_PREFIX_PATH}/event/add`,
    component: React.lazy(() => import("views/event/add-event")),
    category: "services",
    subcategory: "event",
    item: "event",
  },
  "event.edit": {
    key: "event.edit",
    path: `${APP_PREFIX_PATH}/event/edit/:eventId`,
    component: React.lazy(() => import("views/event/edit-event")),
    category: "services",
    subcategory: "event",
    item: "event",
  },
  "event.details": {
    key: "event.details",
    path: `${APP_PREFIX_PATH}/event/details/:eventId`,
    component: React.lazy(() => import("views/event/event-details")),
    category: "services",
    subcategory: "event",
    item: "event",
  },
  "event.schedule": {
    key: "schedule.list",
    path: `${APP_PREFIX_PATH}/schedule/list`,
    component: React.lazy(() => import("views/schedule/event/list-schedule")),
    category: "services",
    subcategory: "event",
    item: "schedule",
  },
  "event.schedule.add-on": {
    key: "schedule.list",
    path: `${APP_PREFIX_PATH}/qr-scanner/:type/:eventId`,
    component: React.lazy(() => import("views/qr-scanner")),
    category: "services",
    subcategory: "event",
    item: "schedule",
  },
  "event.schedule.add": {
    key: "schedule.add",
    path: `${APP_PREFIX_PATH}/schedule/add`,
    component: React.lazy(() => import("views/schedule/event/add-schedule")),
    category: "services",
    subcategory: "event",
    item: "schedule",
  },
  "event.schedule.new.add": {
    key: "schedule.add",
    path: `${APP_PREFIX_PATH}/schedule/new/add`,
    component: React.lazy(() =>
      import("views/schedule/event/new-add-schedule")
    ),
    category: "services",
    subcategory: "event",
    item: "schedule",
  },
  "event.schedule.edit": {
    key: "schedule.edit",
    path: `${APP_PREFIX_PATH}/schedule/edit/:scheduleId`,
    component: React.lazy(() => import("views/schedule/event/edit-schedule")),
    category: "services",
    subcategory: "event",
    item: "schedule",
  },
  "event.schedule.details": {
    key: "schedule.details",
    path: `${APP_PREFIX_PATH}/schedule/:scheduleId`,
    component: React.lazy(() =>
      import("views/schedule/event/schedule-details")
    ),
    category: "services",
    subcategory: "event",
    item: "schedule",
  },

  // Movie Services
  "movie.theater": {
    key: "movie.theater.company",
    path: `${APP_PREFIX_PATH}/movie-theater-company/list`,
    component: React.lazy(() => import("views/theater/list-theater")),
    category: "services",
    subcategory: "movie",
    item: "theater",
  },
  "movie.theater.list": {
    key: "movie.theater.list",
    path: `${APP_PREFIX_PATH}/movie-theater/list`,
    component: TheaterList,
    category: "services",
    subcategory: "movie",
    item: "theater",
  },
  "movie.theater.add": {
    key: "movie.theater.add",
    path: `${APP_PREFIX_PATH}/movie-theater/add`,
    component: React.lazy(() => import("views/theater/add-theater")),
    category: "services",
    subcategory: "movie",
    item: "theater",
  },
  "movie.theater.edit": {
    key: "movie.theater.edit",
    path: `${APP_PREFIX_PATH}/movie-theater/edit/:theaterId`,
    component: React.lazy(() => import("views/theater/edit-theater")),
    category: "services",
    subcategory: "movie",
    item: "theater",
  },
  "movie.theater.detail": {
    key: "movie.theater.detail",
    path: `${APP_PREFIX_PATH}/movie-theater/detail/:theaterId`,
    component: React.lazy(() => import("views/theater/details-theater")),
    category: "services",
    subcategory: "movie",
    item: "theater",
  },
  "movie.theater.company.add": {
    key: "movie.theater.company.add",
    path: `${APP_PREFIX_PATH}/movie-theater-company/add`,
    component: React.lazy(() => import("views/theater/add-company")),
    category: "services",
    subcategory: "movie",
    item: "theater",
  },
  "movie.theater.company.edit": {
    key: "movie.theater.company.edit",
    path: `${APP_PREFIX_PATH}/movie-theater-company/edit/:company_id`,
    component: React.lazy(() => import("views/theater/edit-company")),
    category: "services",
    subcategory: "movie",
    item: "theater",
  },
  "movie.screen": {
    key: "movie.screen",
    path: `${APP_PREFIX_PATH}/screen/list`,
    component: React.lazy(() => import("views/screen/screen-list")),
    category: "services",
    subcategory: "movie",
    item: "screen",
  },
  "movie.screen.add": {
    key: "movie.screen.add",
    path: `${APP_PREFIX_PATH}/screen/add`,
    component: React.lazy(() => import("views/screen/screen-add")),
    category: "services",
    subcategory: "movie",
    item: "screen",
  },
  "movie.screen.edit": {
    key: "movie.screen.edit",
    path: `${APP_PREFIX_PATH}/screen/edit/:screenId`,
    component: React.lazy(() => import("views/screen/screen-edit")),
    category: "services",
    subcategory: "movie",
    item: "screen",
  },
  "movie.screen.detail": {
    key: "movie.screen.detail",
    path: `${APP_PREFIX_PATH}/screen/detail/:screenId`,
    component: React.lazy(() => import("views/screen/screen-detail")),
    category: "services",
    subcategory: "movie",
    item: "screen",
  },
  "movie.seat": {
    key: "seat.movie.list",
    path: `${APP_PREFIX_PATH}/seat/movie/list`,
    component: React.lazy(() => import("views/seat/movie/list-seat")),
    category: "services",
    subcategory: "movie",
    item: "seat",
  },
  "movie.seat.add": {
    key: "seat.movie.add",
    path: `${APP_PREFIX_PATH}/seat/movie/add`,
    component: React.lazy(() => import("views/seat/movie/add-seat")),
    category: "services",
    subcategory: "movie",
    item: "seat",
  },
  "movie.seat.edit": {
    key: "seat.movie.edit",
    path: `${APP_PREFIX_PATH}/seat/movie/edit/:seatId/:pageType`,
    component: React.lazy(() => import("views/seat/movie/edit-seat")),
    category: "services",
    subcategory: "movie",
    item: "seat",
  },
  "movie.seat.details": {
    key: "seat.movie.details",
    path: `${APP_PREFIX_PATH}/seat/movie/:seatId`,
    component: React.lazy(() => import("views/seat/movie/details-seat")),
    category: "services",
    subcategory: "movie",
    item: "seat",
  },
  "movie.cast": {
    key: "movie.cast",
    path: `${APP_PREFIX_PATH}/personality/list`,
    component: React.lazy(() => import("views/Movie/cast/cast-list")),
    category: "services",
    subcategory: "movie",
    item: "cast",
  },
  "movie.cast.add": {
    key: "movie.cast.add",
    path: `${APP_PREFIX_PATH}/personality/add`,
    component: React.lazy(() => import("views/Movie/cast/cast-add")),
    category: "services",
    subcategory: "movie",
    item: "cast",
  },
  "movie.cast.details": {
    key: "movie.cast.details",
    path: `${APP_PREFIX_PATH}/personality/details/:id`,
    component: React.lazy(() => import("views/Movie/cast/cast-details")),
    category: "services",
    subcategory: "movie",
    item: "cast",
  },
  "movie.cast.edit": {
    key: "movie.cast.edit",
    path: `${APP_PREFIX_PATH}/personality/edit/:id`,
    component: React.lazy(() => import("views/Movie/cast/cast-edit")),
    category: "services",
    subcategory: "movie",
    item: "cast",
  },
  "movie.list": {
    key: "movie.movie.list",
    path: `${APP_PREFIX_PATH}/movie/list`,
    component: React.lazy(() => import("views/Movie/movie-list")),
    category: "services",
    subcategory: "movie",
    item: "movie",
  },
  "movie.add": {
    key: "movie.movie.add",
    path: `${APP_PREFIX_PATH}/movie/add`,
    component: React.lazy(() => import("views/Movie/movie-add")),
    category: "services",
    subcategory: "movie",
    item: "movie",
  },
  "movie.edit": {
    key: "movie.movie.edit",
    path: `${APP_PREFIX_PATH}/movie/edit/:id`,
    component: React.lazy(() => import("views/Movie/movie-edit")),
    category: "services",
    subcategory: "movie",
    item: "movie",
  },
  "movie.details": {
    key: "movie.movie.details",
    path: `${APP_PREFIX_PATH}/movie/details/:id`,
    component: React.lazy(() => import("views/Movie/movie-detail")),
    category: "services",
    subcategory: "movie",
    item: "movie",
  },
  "movie.schedule": {
    key: "movie.schedule.list",
    path: `${APP_PREFIX_PATH}/movie-schedule/list`,
    component: React.lazy(() => import("views/schedule/movie/schedule-list")),
    category: "services",
    subcategory: "movie",
    item: "schedule",
  },
  "movie.schedule.add": {
    key: "movie.schedule.add",
    path: `${APP_PREFIX_PATH}/movie-schedule/add`,
    component: React.lazy(() => import("views/schedule/movie/schedule-add")),
    category: "services",
    subcategory: "movie",
    item: "schedule",
  },
  "movie.schedule.details": {
    key: "movie.schedule.details",
    path: `${APP_PREFIX_PATH}/movie-schedule/details/:scheduleId`,
    component: React.lazy(() => import("views/schedule/movie/schedule-detail")),
    category: "services",
    subcategory: "movie",
    item: "schedule",
  },
  "movie.offer": {
    key: "movie.offer",
    path: `${APP_PREFIX_PATH}/offer/list/:type`,
    component: React.lazy(() => import("views/offer/list-offer")),
    category: "services",
    subcategory: "movie",
    item: "offer",
  },
  "movie.coupon": {
    key: "movie.coupon",
    path: `${APP_PREFIX_PATH}/coupon/list/:type`,
    component: React.lazy(() => import("views/coupon/list-coupon")),
    category: "services",
    subcategory: "movie",
    item: "coupon",
  },

  // Dine Services
  "dine.list": {
    key: "dine.list",
    path: `${APP_PREFIX_PATH}/dine/list`,
    component: React.lazy(() => import("views/dine/list-dine")),
    category: "services",
    subcategory: "dine",
    item: "restaurant",
  },
  "dine.add": {
    key: "dine.add",
    path: `${APP_PREFIX_PATH}/dine/add`,
    component: React.lazy(() => import("views/dine/add-dine")),
    category: "services",
    subcategory: "dine",
    item: "restaurant",
  },
  "dine.restaurant": {
    key: "dine.restaurant",
    path: `${APP_PREFIX_PATH}/restaurant/list`,
    component: React.lazy(() => import("views/dine/list-restaurant")),
    category: "services",
    subcategory: "dine",
    item: "restaurant",
  },
  "dine.restaurant.add": {
    key: "restaurant.add",
    path: `${APP_PREFIX_PATH}/restaurant/add`,
    component: React.lazy(() => import("views/dine/add-restaurant")),
    category: "services",
    subcategory: "dine",
    item: "restaurant",
  },
  "dine.schedule": {
    key: "dine.schedule",
    path: `${APP_PREFIX_PATH}/dine/schedule/list`,
    component: React.lazy(() => import("views/dine/Schedule/schedule-list")),
    category: "services",
    subcategory: "dine",
    item: "schedule",
  },

  // Issues
  "issue.list": {
    key: "issue.list",
    path: `${APP_PREFIX_PATH}/issue/list`,
    component: React.lazy(() =>
      import("views/app-views/apps/issues/issue-list")
    ),
    category: "issues",
    subcategory: "issue_tracking",
    item: "issue",
  },
  "issue.add": {
    key: "issue.add",
    path: `${APP_PREFIX_PATH}/issue/add`,
    component: React.lazy(() =>
      import("views/app-views/apps/issues/add-issue")
    ),
    category: "issues",
    subcategory: "issue_tracking",
    item: "issue",
  },
  "issue.details": {
    key: "issue.details",
    path: `${APP_PREFIX_PATH}/issue/details/:issueId`,
    component: React.lazy(() =>
      import("views/app-views/apps/issues/issue-details")
    ),
    category: "issues",
    subcategory: "issue_tracking",
    item: "issue",
  },
  "alerts.list": {
    key: "alerts.list",
    path: `${APP_PREFIX_PATH}/alerts/list`,
    component: React.lazy(() =>
      import("views/app-views/apps/alerts/alerts-list")
    ),
    category: "issues",
    subcategory: "issue_tracking",
    item: "alert",
  },
  "alerts.details": {
    key: "alerts.details",
    path: `${APP_PREFIX_PATH}/alerts/details/:issueId`,
    component: React.lazy(() =>
      import("views/app-views/apps/alerts/alerts-details")
    ),
    category: "issues",
    subcategory: "issue_tracking",
    item: "alert",
  },

  // Track Requests
  "track.event.organizer": {
    key: "org.list",
    path: `${APP_PREFIX_PATH}/track-team/event-organizer/updatelist`,
    component: React.lazy(() =>
      import("views/track-team/event-organizer/update-list")
    ),
    category: "issues",
    subcategory: "track_requests.event",
    item: "event",
  },
  "track.event.offer": {
    key: "trackRequest.offer.status",
    path: `${APP_PREFIX_PATH}/track/offer/status/list/:type`,
    component: React.lazy(() =>
      import("views/track-team/offer-organizer/status-list")
    ),
    category: "issues",
    subcategory: "track_requests",
    item: "event",
  },
  "track.event.ticket": {
    key: "trackRequest.ticket.status",
    path: `${APP_PREFIX_PATH}/track/event-tickets/status/list`,
    component: React.lazy(() =>
      import("views/track-team/ticket-organizer/status-list")
    ),
    category: "issues",
    subcategory: "track_requests",
    item: "event",
  },
  "track.event.seat": {
    key: "trackRequest.seat.status",
    path: `${APP_PREFIX_PATH}/track/event-seats/status/list`,
    component: React.lazy(() =>
      import("views/track-team/seat-organizer/status-list")
    ),
    category: "issues",
    subcategory: "track_requests",
    item: "event",
  },
  "track.event.event": {
    key: "trackRequest.organizer.status",
    path: `${APP_PREFIX_PATH}/track/event/status/list`,
    component: React.lazy(() =>
      import("views/track-team/event-organizer/status-list")
    ),
    category: "issues",
    subcategory: "track_requests",
    item: "event",
  },
  "track.schedule.organizer": {
    key: "trackRequest.organizer.status",
    path: `${APP_PREFIX_PATH}/track/event-schedule/status/list`,
    component: React.lazy(() =>
      import("views/track-team/schedule-organizer/status-list")
    ),
    category: "issues",
    subcategory: "track_requests",
    item: "event",
  },
  "track.event.organizer.details": {
    key: "org.details",
    path: `${APP_PREFIX_PATH}/track-team/event-organizer/details/:eventUpId`,
    component: React.lazy(() =>
      import("views/track-team/event-organizer/update-list-details/index.js")
    ),
    category: "issues",
    subcategory: "track_requests",
    item: "event",
  },
  "track.event.organizer.edit": {
    key: "org.event.edit",
    path: `${APP_PREFIX_PATH}/track-team/event-organizer/update-edit/:eventId`,
    component: React.lazy(() =>
      import("views/track-team/event-organizer/update-edit/index")
    ),
    category: "issues",
    subcategory: "track_requests",
    item: "event",
  },
  "track.movie.seats": {
    key: "trackRequest.movie.seats.status.list",
    path: `${APP_PREFIX_PATH}/track/movie-seats/status/list`,
    component: React.lazy(() =>
      import("views/track-team/movie-organizer/seat-organizer/status-list")
    ),
    category: "issues",
    subcategory: "track_requests",
    item: "movie",
  },
  "track.movie.seats.details": {
    key: "trackRequest.movie.seats.status.details",
    path: `${APP_PREFIX_PATH}/track/movie-seats/status/details/:seatId`,
    component: React.lazy(() =>
      import("views/track-team/movie-organizer/seat-organizer/status-details")
    ),
    category: "issues",
    subcategory: "track_requests",
    item: "movie",
  },
  "track.movie.offer": {
    key: "trackRequest.offer.status",
    path: `${APP_PREFIX_PATH}/track/offer/status/list/:type`,
    component: React.lazy(() =>
      import("views/track-team/offer-organizer/status-list")
    ),
    category: "issues",
    subcategory: "track_requests",
    item: "movie",
  },
  "track.movie.offer.details": {
    key: "trackRequest.offer.status.details",
    path: `${APP_PREFIX_PATH}/track/offer/status/details/:offerId/:type`,
    component: React.lazy(() =>
      import("views/track-team/offer-organizer/status-details")
    ),
    category: "issues",
    subcategory: "track_requests",
    item: "movie",
  },
  "track.movie.coupon": {
    key: "trackRequest.coupon.status",
    path: `${APP_PREFIX_PATH}/track/coupon/status/list/:type`,
    component: React.lazy(() =>
      import("views/track-team/coupon-organizer/status-list")
    ),
    category: "issues",
    subcategory: "track_requests",
    item: "movie",
  },
  "track.movie.coupon.details": {
    key: "trackRequest.coupon.status.details",
    path: `${APP_PREFIX_PATH}/track/coupon/status/details/:offerId/:type`,
    component: React.lazy(() =>
      import("views/track-team/coupon-organizer/status-details")
    ),
    category: "issues",
    subcategory: "track_requests",
    item: "movie",
  },
  "track.movie.schedule": {
    key: "trackRequest.movie.schedule.status.list",
    path: `${APP_PREFIX_PATH}/track/movie-schedule/status/list/movie`,
    component: React.lazy(() =>
      import("views/track-team/movie-organizer/Schedule-organizer/status-list")
    ),
    category: "issues",
    subcategory: "track_requests",
    item: "movie",
  },
  "track.movie.schedule.details": {
    key: "trackRequest.movie.schedule.status.detail",
    path: `${APP_PREFIX_PATH}/track/movie-schedule/status/detail/:scheduleId`,
    component: React.lazy(() =>
      import(
        "views/track-team/movie-organizer/Schedule-organizer/status-detail"
      )
    ),
    category: "issues",
    subcategory: "track_requests",
    item: "movie",
  },
  "track.movie.screen": {
    key: "trackRequest.movie.screen.status.list",
    path: `${APP_PREFIX_PATH}/track/movie-screens/status/list`,
    component: React.lazy(() =>
      import("views/track-team/movie-organizer/screen-organizer/status-list")
    ),
    category: "issues",
    subcategory: "track_requests",
    item: "movie",
  },

  // Lead Events
  "lead.event": {
    key: "lead.event.list",
    path: `${APP_PREFIX_PATH}/leadevent/list`,
    component: React.lazy(() => import("views/leadevent/eventrequest-list")),
    category: "issues",
    subcategory: "lead_events",
    item: "event_request_list",
  },
  "lead.event.details": {
    key: "lead.event.details",
    path: `${APP_PREFIX_PATH}/leadevent/details/:eventId`,
    component: React.lazy(() => import("views/leadevent/lead-details")),
    category: "issues",
    subcategory: "lead_events",
    item: "event_request_list",
  },
  "lead.event.add": {
    key: "lead.event.add",
    path: `${APP_PREFIX_PATH}/event/add/:eventId`,
    component: React.lazy(() => import("views/leadevent/add-leadevent")),
    category: "issues",
    subcategory: "lead_events",
    item: "event_request_list",
  },
  "lead.event.convert": {
    key: "lead.event.convert.list",
    path: `${APP_PREFIX_PATH}/leadevent/convert`,
    component: React.lazy(() => import("views/leadevent/convertevent-list")),
    category: "issues",
    subcategory: "lead_events",
    item: "event_request_list",
  },
  "lead.event.convert.details": {
    key: "lead.event.convert.details",
    path: `${APP_PREFIX_PATH}/leadevent/convert/details/:eventId`,
    component: React.lazy(() => import("views/leadevent/convert-details")),
    category: "issues",
    subcategory: "lead_events",
    item: "event_request_list",
  },
  "lead.event.edit": {
    key: "lead.event.edit",
    path: `${APP_PREFIX_PATH}/leadevent/edit/:eventId`,
    component: React.lazy(() => import("views/leadevent/edit- leadevent")),
    category: "issues",
    subcategory: "lead_events",
    item: "event_request_list",
  },

  // Advertisement
  "advertisement.category": {
    key: "advertisement.category.list",
    path: `${APP_PREFIX_PATH}/advertisement/category/list`,
    component: React.lazy(() =>
      import("views/advertisement/category/list-ad-category")
    ),
    category: "advertisements",
    subcategory: "ad_category",
  },
  "advertisement.category.add": {
    key: "advertisement.category.add",
    path: `${APP_PREFIX_PATH}/advertisement/category/add`,
    component: React.lazy(() =>
      import("views/advertisement/category/add-ad-category")
    ),
    category: "advertisements",
    subcategory: "ad_category",
  },
  "advertisement.category.edit": {
    key: "advertisement.category.edit",
    path: `${APP_PREFIX_PATH}/advertisement/category/edit/:adCategoryId`,
    component: React.lazy(() =>
      import("views/advertisement/category/edit-ad-category")
    ),
    category: "advertisements",
    subcategory: "ad_category",
  },
  "advertisement.banner": {
    key: "advertisement.banner.list",
    path: `${APP_PREFIX_PATH}/advertisement/banner/list`,
    component: React.lazy(() =>
      import("views/advertisement/banner/list-ad-banner")
    ),
    category: "advertisements",
    subcategory: "banners",
  },
  "advertisement.banner.add": {
    key: "advertisement.banner.add",
    path: `${APP_PREFIX_PATH}/advertisement/banner/add`,
    component: React.lazy(() =>
      import("views/advertisement/banner/add-ad-banner")
    ),
    category: "advertisements",
    subcategory: "banners",
  },
  "advertisement.banner.edit": {
    key: "advertisement.banner.edit",
    path: `${APP_PREFIX_PATH}/advertisement/banner/edit/:adBannerId`,
    component: React.lazy(() =>
      import("views/advertisement/banner/edit-ad-banner")
    ),
    category: "advertisements",
    subcategory: "banners",
  },
  "advertisement.schedule": {
    key: "advertisement.schedule.list",
    path: `${APP_PREFIX_PATH}/advertisement/schedule/list`,
    component: React.lazy(() =>
      import("views/advertisement/schedule/list-ad-schedule")
    ),
    category: "advertisements",
    subcategory: "schedule",
  },
  "advertisement.schedule.add": {
    key: "advertisement.schedule.add",
    path: `${APP_PREFIX_PATH}/advertisement/schedule/add`,
    component: React.lazy(() =>
      import("views/advertisement/schedule/add-ad-schedule")
    ),
    category: "advertisements",
    subcategory: "schedule",
  },
  "advertisement.schedule.edit": {
    key: "advertisement.schedule.edit",
    path: `${APP_PREFIX_PATH}/advertisement/schedule/edit/:scheduleId`,
    component: React.lazy(() =>
      import("views/advertisement/schedule/edit-ad-schedule/index")
    ),
    category: "advertisements",
    subcategory: "schedule",
  },

  // Newsletter
  "newsletter.list": {
    key: "news-letter.list",
    path: `${APP_PREFIX_PATH}/news-letter/list/`,
    component: React.lazy(() => import("views/news-letter/newsLetter/list")),
    category: "newsletter",
    subcategory: "newsletter",
  },
  "newsletter.add": {
    key: "news-letter.add",
    path: `${APP_PREFIX_PATH}/news-letter/add/`,
    component: React.lazy(() => import("views/news-letter/newsLetter/add")),
    category: "newsletter",
    subcategory: "newsletter",
  },
  "newsletter.subscriber": {
    key: "news-letter.subscriber.list",
    path: `${APP_PREFIX_PATH}/news-letter/subscriber/list/`,
    component: React.lazy(() => import("views/news-letter/subscribers/list")),
    category: "newsletter",
    subcategory: "subscribers",
  },

  // User Management
  "user.list": {
    key: "user.list",
    path: `${APP_PREFIX_PATH}/user/list`,
    component: React.lazy(() => import("views/user/list-user")),
    category: "user_management",
    subcategory: "user",
  },
  "user.add": {
    key: "user.add",
    path: `${APP_PREFIX_PATH}/user/add`,
    component: React.lazy(() => import("views/user/add-user")),
    category: "user_management",
    subcategory: "user",
  },
  "user.edit": {
    key: "user.edit",
    path: `${APP_PREFIX_PATH}/user/edit/:userId`,
    component: React.lazy(() => import("views/user/edit-user/index")),
    category: "user_management",
    subcategory: "user",
  },
  "user.details": {
    key: "user.details",
    path: `${APP_PREFIX_PATH}/user/:userId`,
    component: React.lazy(() => import("views/user/details-user/index")),
    category: "user_management",
    subcategory: "user",
  },
  "access.control": {
    key: "accessControl.list",
    path: `${APP_PREFIX_PATH}/access-control/list`,
    component: React.lazy(() => import("views/access-premissions/access-list")),
    category: "user_management",
    subcategory: "system_permissions",
  },

  // App Management
  "app.footer": {
    key: "app.management.layout.footer.list",
    path: `${APP_PREFIX_PATH}/app/management/layout/footer/list`,
    component: React.lazy(() =>
      import("views/app-managment/layout/footer/list-footer")
    ),
    category: "app_management",
    subcategory: "layout",
    item: "footer",
  },
  "app.footer.add": {
    key: "app.management.layout.footer.add",
    path: `${APP_PREFIX_PATH}/app/management/layout/footer/add`,
    component: React.lazy(() =>
      import("views/app-managment/layout/footer/add-footer")
    ),
    category: "app_management",
    subcategory: "layout",
    item: "footer",
  },
  "app.footer.edit": {
    key: "app.management.layout.footer.edit",
    path: `${APP_PREFIX_PATH}/app/management/layout/footer/edit`,
    component: React.lazy(() =>
      import("views/app-managment/layout/footer/edit-footer")
    ),
    category: "app_management",
    subcategory: "layout",
    item: "footer",
  },
  "app.faq": {
    key: "app.management.layout.faq.list",
    path: `${APP_PREFIX_PATH}/app/management/layout/faq/list`,
    component: React.lazy(() =>
      import("views/app-managment/layout/faq/list-faq/index")
    ),
    category: "app_management",
    subcategory: "layout",
    item: "faq",
  },
  "app.faq.add": {
    key: "app.management.layout.faq.add-faq",
    path: `${APP_PREFIX_PATH}/app/management/layout/faq/add-faq`,
    component: React.lazy(() =>
      import("views/app-managment/layout/faq/add-faq")
    ),
    category: "app_management",
    subcategory: "layout",
    item: "faq",
  },
  "app.faq.edit": {
    key: "app.management.layout.faq.edit-faq",
    path: `${APP_PREFIX_PATH}/app/management/layout/faq/edit-faq`,
    component: React.lazy(() =>
      import("views/app-managment/layout/faq/edit-faq")
    ),
    category: "app_management",
    subcategory: "layout",
    item: "faq",
  },
  "app.info": {
    key: "app.management.layout.info.list",
    path: `${APP_PREFIX_PATH}/app/management/layout/app-info/list`,
    component: React.lazy(() =>
      import("views/app-managment/layout/app-info/list-info")
    ),
    category: "app_management",
    subcategory: "layout",
    item: "app_info",
  },
  "app.info.add": {
    key: "app.management.layout.info.add",
    path: `${APP_PREFIX_PATH}/app/management/layout/app-info/add-info`,
    component: React.lazy(() =>
      import("views/app-managment/layout/app-info/add-info/index")
    ),
    category: "app_management",
    subcategory: "layout",
    item: "app_info",
  },
  "app.terms": {
    key: "app.management.layout.terms.list",
    path: `${APP_PREFIX_PATH}/app/management/layout/terms/list`,
    component: React.lazy(() =>
      import("views/app-managment/layout/terms/list-terms")
    ),
    category: "app_management",
    subcategory: "layout",
    item: "terms",
  },
  "app.terms.add": {
    key: "app.management.layout.terms.add",
    path: `${APP_PREFIX_PATH}/app/management/layout/terms/add-terms`,
    component: React.lazy(() =>
      import("views/app-managment/layout/terms/add-term")
    ),
    category: "app_management",
    subcategory: "layout",
    item: "terms",
  },

  // Mail (no feature flag)
  "mail.list": {
    key: "mail.list",
    path: `${APP_PREFIX_PATH}/mail/list`,
    component: React.lazy(() => import("views/app-views/apps/mail/mail-list")),
  },

  // Additional Super Admin Routes (no feature flags)
  "super.admin.organizer.details": {
    key: "super.admin.organizer.details",
    path: `${APP_PREFIX_PATH}/super-admin/organizer-details/:organizerId`,
    component: React.lazy(() =>
      import("views/app-views/apps/super-admin/organizer-details")
    ),
  },
  "super.admin.movie.organizer": {
    key: "super.admin.movie.organizer",
    path: `${APP_PREFIX_PATH}/super-admin/movie-organizer-detail/:organizerId`,
    component: React.lazy(() =>
      import("views/app-views/apps/super-admin/movie-organizer")
    ),
  },
  "super.admin.movie.organizer.theater": {
    key: "super.admin.movie.organizer.theater",
    path: `${APP_PREFIX_PATH}/super-admin/movie-organizer/theater-details/:theaterId`,
    component: React.lazy(() =>
      import("views/app-views/apps/super-admin/movie-organizer/theater-details")
    ),
  },
  "super.admin.organizer.event": {
    key: "super.admin.organizer.event",
    path: `${APP_PREFIX_PATH}/super-admin/organizer-details/event-details/:eventId`,
    component: React.lazy(() =>
      import("views/app-views/apps/super-admin/organizer-details/event-details")
    ),
  },
  "super.admin.movie.organizer.movie": {
    key: "super.admin.movie.organizer.movie",
    path: `${APP_PREFIX_PATH}/super-admin/movie-organizer/theater-details/:theaterId/movie-details/:movieId`,
    component: React.lazy(() =>
      import(
        "views/app-views/apps/super-admin/movie-organizer/theater-details/movie-details"
      )
    ),
  },
  "organizer.event.details": {
    key: "organizer.event.details",
    path: `${APP_PREFIX_PATH}/organizer/reports/event-details/:eventId`,
    component: React.lazy(() =>
      import("views/app-views/apps/organizer/reports/event-details")
    ),
  },
  "organizer.theater.details": {
    key: "organizer.theater.details",
    path: `${APP_PREFIX_PATH}/organizer/reports/theater-details/:theaterId`,
    component: React.lazy(() =>
      import("views/app-views/apps/organizer/reports/theater-details")
    ),
  },
  "organizer.theater.movie.details": {
    key: "organizer.theater.movie.details",
    path: `${APP_PREFIX_PATH}/organizer/reports/theater-details/:theaterId/movie-details/:movieId`,
    component: React.lazy(() =>
      import(
        "views/app-views/apps/organizer/reports/theater-details/movie-details"
      )
    ),
  },
  "user.consumes": {
    key: "user.consumes.list",
    path: `${APP_PREFIX_PATH}/user/consumes/:id/:eventId`,
    component: React.lazy(() =>
      import("views/consumes/user-consumes/list-user")
    ),
  },
  "food.consumes": {
    key: "food.consumes.list",
    path: `${APP_PREFIX_PATH}/food/consumes/:id/:eventId`,
    component: React.lazy(() =>
      import("views/consumes/food-consumes/list-food")
    ),
  },
};

// Public routes remain unchanged
export const publicRoutes = [
  {
    key: "login",
    path: `${AUTH_PREFIX_PATH}/login`,
    component: React.lazy(() =>
      import("views/auth-views/authentication/login")
    ),
  },
  {
    key: "register",
    path: `${AUTH_PREFIX_PATH}/register/*`,
    component: React.lazy(() =>
      import("views/auth-views/authentication/register")
    ),
  },
  {
    key: "forgot-password",
    path: `${AUTH_PREFIX_PATH}/forgot-password`,
    component: React.lazy(() =>
      import("views/auth-views/authentication/forgot-password")
    ),
  },
];

// Enhanced function to get filtered routes based on hierarchical feature flags
const getFilteredProtectedRoutes = () => {
  return Object.values(ALL_PROTECTED_ROUTES).filter((route) => {
    // Check hierarchical feature flags
    return isRouteFeatureEnabled(
      route.feature, // Legacy feature flag (for backward compatibility)
      route.category,
      route.subcategory,
      route.item
    );
  });
};

// Export the filtered protected routes
export const protectedRoutes = getFilteredProtectedRoutes();
