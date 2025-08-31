import React from "react";
import {
  AUTH_PREFIX_PATH,
  APP_PREFIX_PATH,
  FEATURE_FLAGS,
} from "configs/AppConfig";
import TheaterList from "views/theater/components/TheaterList";

// All available routes mapped by feature keys (same as navigation keys)
const ALL_PROTECTED_ROUTES = {
  // Reports
  "reports.dashboard": {
    key: "dashboard.default",
    path: `${APP_PREFIX_PATH}/dashboards/default`,
    component: React.lazy(() => import("views/app-views/dashboards/default")),
    feature: "is_reports_enabled",
  },
  "reports.analytic": {
    key: "dashboard.analytic",
    path: `${APP_PREFIX_PATH}/dashboards/analytic`,
    component: React.lazy(() => import("views/app-views/dashboards/analytic")),
    feature: "is_reports_enabled",
  },
  "reports.sales": {
    key: "dashboard.sales",
    path: `${APP_PREFIX_PATH}/dashboards/sales`,
    component: React.lazy(() => import("views/app-views/dashboards/sales")),
    feature: "is_reports_enabled",
  },
  "reports.orders.event": {
    key: "reports.orders.event",
    path: `${APP_PREFIX_PATH}/reports/orders/event`,
    component: React.lazy(() => import("views/orders/event/list")),
    feature: "is_reports_enabled",
  },
  "reports.orders.event.details": {
    key: "reports.orders.event.details",
    path: `${APP_PREFIX_PATH}/reports/orders/event/details/:id`,
    component: React.lazy(() => import("views/orders/event/details")),
    feature: "is_reports_enabled",
  },
  "reports.orders.event.user": {
    key: "reports.orders.event.details.user",
    path: `${APP_PREFIX_PATH}/reports/orders/event/user/details/:schedule_id/:date_id/:time_id/:user_id`,
    component: React.lazy(() => import("views/orders/event/userDetails")),
    feature: "is_reports_enabled",
  },
  "reports.orders.movie": {
    key: "reports.orders.movie",
    path: `${APP_PREFIX_PATH}/reports/orders/movie`,
    component: React.lazy(() => import("views/orders/movie/list")),
    feature: "is_reports_enabled",
  },
  "reports.orders.movie.details": {
    key: "reports.orders.movie.details",
    path: `${APP_PREFIX_PATH}/reports/orders/movie/details/:id`,
    component: React.lazy(() => import("views/orders/movie/details")),
    feature: "is_reports_enabled",
  },
  "reports.orders.movie.user": {
    key: "reports.orders.movie.details.user",
    path: `${APP_PREFIX_PATH}/reports/orders/movie/user/details/:schedule_id/:date_id/:time_id/:user_id`,
    component: React.lazy(() => import("views/orders/movie/userDetails")),
    feature: "is_reports_enabled",
  },
  "organizer.reports.dashboard": {
    key: "organizer.reports",
    path: `${APP_PREFIX_PATH}/organizer/reports`,
    component: React.lazy(() =>
      import("views/app-views/apps/super-admin/reports")
    ),
    feature: "is_reports_enabled",
  },
  "super.admin.reports": {
    key: "super-admin.reports",
    path: `${APP_PREFIX_PATH}/super-admin/reports`,
    component: React.lazy(() =>
      import("views/app-views/apps/super-admin/reports")
    ),
    feature: "is_reports_enabled",
  },

  // General Services
  "general.event.type": {
    key: "event.type.list",
    path: `${APP_PREFIX_PATH}/event/type/list`,
    component: React.lazy(() => import("views/event-type/list-type")),
    feature: "is_event_enabled",
  },
  "general.event.type.add": {
    key: "event.type.add",
    path: `${APP_PREFIX_PATH}/event/type/add`,
    component: React.lazy(() => import("views/event-type/add-type")),
    feature: "is_event_enabled",
  },
  "general.event.type.edit": {
    key: "event.type.edit",
    path: `${APP_PREFIX_PATH}/event/type/edit/:typeId`,
    component: React.lazy(() => import("views/event-type/edit-type")),
    feature: "is_event_enabled",
  },
  "general.place": {
    key: "place.list",
    path: `${APP_PREFIX_PATH}/place/list`,
    component: React.lazy(() => import("views/locations/place/list-place")),
  },
  "general.place.add": {
    key: "place.add",
    path: `${APP_PREFIX_PATH}/place/add`,
    component: React.lazy(() => import("views/locations/place/add-place")),
  },
  "general.place.edit": {
    key: "place.edit",
    path: `${APP_PREFIX_PATH}/place/edit/:placeId`,
    component: React.lazy(() => import("views/locations/place/edit_place")),
  },
  "general.place.details": {
    key: "place.details",
    path: `${APP_PREFIX_PATH}/place/details/:placeId`,
    component: React.lazy(() => import("views/locations/place/place-details")),
  },
  "general.venue": {
    key: "venue.list",
    path: `${APP_PREFIX_PATH}/venue/list`,
    component: React.lazy(() => import("views/locations/venue/list-venue")),
  },
  "general.venue.add": {
    key: "venue.add",
    path: `${APP_PREFIX_PATH}/venue/add`,
    component: React.lazy(() => import("views/locations/venue/add-venue")),
  },
  "general.venue.edit": {
    key: "venue.edit",
    path: `${APP_PREFIX_PATH}/venue/edit/:venueId`,
    component: React.lazy(() => import("views/locations/venue/edit_venue")),
  },
  "general.venue.details": {
    key: "venue.details",
    path: `${APP_PREFIX_PATH}/venue/details/:venueId`,
    component: React.lazy(() => import("views/locations/venue/venue-details")),
  },
  "general.tax": {
    key: "tax.list",
    path: `${APP_PREFIX_PATH}/tax/list`,
    component: React.lazy(() => import("views/tax/list-tax")),
  },
  "general.tax.add": {
    key: "tax.add",
    path: `${APP_PREFIX_PATH}/tax/add`,
    component: React.lazy(() => import("views/tax/add-tax")),
  },
  "general.tax.edit": {
    key: "tax.edit",
    path: `${APP_PREFIX_PATH}/tax/edit/:taxId`,
    component: React.lazy(() => import("views/tax/edit-tax/index")),
  },
  "general.category": {
    key: "category.list",
    path: `${APP_PREFIX_PATH}/category/list`,
    component: React.lazy(() =>
      import("views/category/category/list-category")
    ),
  },
  "general.category.add": {
    key: "category.add",
    path: `${APP_PREFIX_PATH}/category/add`,
    component: React.lazy(() => import("views/category/category/add-category")),
  },
  "general.category.details": {
    key: "category.details",
    path: `${APP_PREFIX_PATH}/category/details/:categoryId`,
    component: React.lazy(() =>
      import("views/category/category/category-detials")
    ),
  },
  "general.category.edit": {
    key: "category.edit",
    path: `${APP_PREFIX_PATH}/category/edit/category/:catId`,
    component: React.lazy(() =>
      import("views/category/category/edit-category/category/index")
    ),
  },
  "general.subcategory.details": {
    key: "subcategory.details",
    path: `${APP_PREFIX_PATH}/subcategory/details/:subcategoryId`,
    component: React.lazy(() =>
      import("views/category/category/subcategory-details")
    ),
  },
  "general.subcategory.edit": {
    key: "subcategory.edit",
    path: `${APP_PREFIX_PATH}/category/edit/subcategory/:subcatId`,
    component: React.lazy(() =>
      import("views/category/category/edit-category/subcategory/index")
    ),
  },
  "general.offer": {
    key: "offer.list",
    path: `${APP_PREFIX_PATH}/offer/list/:type`,
    component: React.lazy(() => import("views/offer/list-offer")),
  },
  "general.offer.add": {
    key: "offer.add",
    path: `${APP_PREFIX_PATH}/offer/add`,
    component: React.lazy(() => import("views/offer/add-offer")),
  },
  "general.offer.edit": {
    key: "offer.edit",
    path: `${APP_PREFIX_PATH}/offer/edit/:offerId`,
    component: React.lazy(() => import("views/offer/edit-offer/index")),
  },
  "general.coupon": {
    key: "coupon.list",
    path: `${APP_PREFIX_PATH}/coupon/list/:type`,
    component: React.lazy(() => import("views/coupon/list-coupon")),
  },
  "general.coupon.add": {
    key: "coupon.add",
    path: `${APP_PREFIX_PATH}/coupon/add`,
    component: React.lazy(() => import("views/coupon/add-coupon")),
  },
  "general.coupon.edit": {
    key: "coupon.edit",
    path: `${APP_PREFIX_PATH}/coupon/edit/:couponId`,
    component: React.lazy(() => import("views/coupon/edit-coupon/index")),
  },
  "general.seat": {
    key: "seat.list",
    path: `${APP_PREFIX_PATH}/seat/list`,
    component: React.lazy(() => import("views/seat/stadium/list-seat")),
  },
  "general.seat.add": {
    key: "seat.add",
    path: `${APP_PREFIX_PATH}/seat/add`,
    component: React.lazy(() => import("views/seat/stadium/add-seat")),
  },
  "general.payment": {
    key: "payment.list",
    path: `${APP_PREFIX_PATH}/payment/list`,
    component: React.lazy(() => import("views/payment/list-payment")),
  },
  "general.payment.add": {
    key: "payment.add",
    path: `${APP_PREFIX_PATH}/payment/add`,
    component: React.lazy(() => import("views/payment/add-payment")),
  },
  "general.payment.edit": {
    key: "payment.edit",
    path: `${APP_PREFIX_PATH}/payment/edit/`,
    component: React.lazy(() => import("views/payment/edit-payment")),
  },
  "general.payment.details": {
    key: "payment.details",
    path: `${APP_PREFIX_PATH}/payment/details/:paymentId`,
    component: React.lazy(() => import("views/payment/payment-details")),
  },

  // Event Services
  "event.ticket": {
    key: "ticket.list",
    path: `${APP_PREFIX_PATH}/ticket/list`,
    component: React.lazy(() => import("views/ticket/list-ticket")),
    feature: "is_event_enabled",
  },
  "event.ticket.add": {
    key: "ticket.add",
    path: `${APP_PREFIX_PATH}/ticket/add`,
    component: React.lazy(() => import("views/ticket/add-ticket")),
    feature: "is_event_enabled",
  },
  "event.ticket.edit": {
    key: "ticket.edit",
    path: `${APP_PREFIX_PATH}/ticket/edit/:ticketId`,
    component: React.lazy(() => import("views/ticket/edit-ticket/index")),
    feature: "is_event_enabled",
  },
  "event.ticket.type": {
    key: "ticket.type",
    path: `${APP_PREFIX_PATH}/ticket/type/add`,
    component: React.lazy(() => import("views/ticket/components/MultyForm.js")),
    feature: "is_event_enabled",
  },
  "event.seat": {
    key: "seat.event.list",
    path: `${APP_PREFIX_PATH}/seat/event/list`,
    component: React.lazy(() => import("views/seat/event/list-seat")),
    feature: "is_event_enabled",
  },
  "event.seat.add": {
    key: "seat.event.add",
    path: `${APP_PREFIX_PATH}/seat/event/add`,
    component: React.lazy(() => import("views/seat/event/add-seat")),
    feature: "is_event_enabled",
  },
  "event.seat.edit": {
    key: "seat.event.edit",
    path: `${APP_PREFIX_PATH}/seat/event/edit/:seatId`,
    component: React.lazy(() => import("views/seat/event/edit-seat")),
    feature: "is_event_enabled",
  },
  "event.seat.details": {
    key: "seat.event.details",
    path: `${APP_PREFIX_PATH}/seat/event/:seatId`,
    component: React.lazy(() => import("views/seat/event/details-seat")),
    feature: "is_event_enabled",
  },
  "event.list": {
    key: "event.list",
    path: `${APP_PREFIX_PATH}/event/list`,
    component: React.lazy(() => import("views/event/event-list")),
    feature: "is_event_enabled",
  },
  "event.add": {
    key: "event.add",
    path: `${APP_PREFIX_PATH}/event/add`,
    component: React.lazy(() => import("views/event/add-event")),
    feature: "is_event_enabled",
  },
  "event.edit": {
    key: "event.edit",
    path: `${APP_PREFIX_PATH}/event/edit/:eventId`,
    component: React.lazy(() => import("views/event/edit-event")),
    feature: "is_event_enabled",
  },
  "event.details": {
    key: "event.details",
    path: `${APP_PREFIX_PATH}/event/details/:eventId`,
    component: React.lazy(() => import("views/event/event-details")),
    feature: "is_event_enabled",
  },
  "event.schedule": {
    key: "schedule.list",
    path: `${APP_PREFIX_PATH}/schedule/list`,
    component: React.lazy(() => import("views/schedule/event/list-schedule")),
    feature: "is_event_enabled",
  },
  "event.schedule.add": {
    key: "schedule.add",
    path: `${APP_PREFIX_PATH}/schedule/add`,
    component: React.lazy(() => import("views/schedule/event/add-schedule")),
    feature: "is_event_enabled",
  },
  "event.schedule.edit": {
    key: "schedule.edit",
    path: `${APP_PREFIX_PATH}/schedule/edit/:scheduleId`,
    component: React.lazy(() => import("views/schedule/event/edit-schedule")),
    feature: "is_event_enabled",
  },
  "event.schedule.details": {
    key: "schedule.details",
    path: `${APP_PREFIX_PATH}/schedule/:scheduleId`,
    component: React.lazy(() =>
      import("views/schedule/event/schedule-details")
    ),
    feature: "is_event_enabled",
  },

  // Movie Services
  "movie.theater": {
    key: "movie.theater.company",
    path: `${APP_PREFIX_PATH}/movie-theater-company/list`,
    component: React.lazy(() => import("views/theater/list-theater")),
    feature: "is_movie_enabled",
  },
  "movie.theater.list": {
    key: "movie.theater.list",
    path: `${APP_PREFIX_PATH}/movie-theater/list`,
    component: TheaterList,
    feature: "is_movie_enabled",
  },
  "movie.theater.add": {
    key: "movie.theater.add",
    path: `${APP_PREFIX_PATH}/movie-theater/add`,
    component: React.lazy(() => import("views/theater/add-theater")),
    feature: "is_movie_enabled",
  },
  "movie.theater.edit": {
    key: "movie.theater.edit",
    path: `${APP_PREFIX_PATH}/movie-theater/edit/:theaterId`,
    component: React.lazy(() => import("views/theater/edit-theater")),
    feature: "is_movie_enabled",
  },
  "movie.theater.detail": {
    key: "movie.theater.detail",
    path: `${APP_PREFIX_PATH}/movie-theater/detail/:theaterId`,
    component: React.lazy(() => import("views/theater/details-theater")),
    feature: "is_movie_enabled",
  },
  "movie.theater.company.add": {
    key: "movie.theater.company.add",
    path: `${APP_PREFIX_PATH}/movie-theater-company/add`,
    component: React.lazy(() => import("views/theater/add-company")),
    feature: "is_movie_enabled",
  },
  "movie.theater.company.edit": {
    key: "movie.theater.company.edit",
    path: `${APP_PREFIX_PATH}/movie-theater-company/edit/:company_id`,
    component: React.lazy(() => import("views/theater/edit-company")),
    feature: "is_movie_enabled",
  },
  "movie.screen": {
    key: "movie.screen",
    path: `${APP_PREFIX_PATH}/screen/list`,
    component: React.lazy(() => import("views/screen/screen-list")),
    feature: "is_movie_enabled",
  },
  "movie.screen.add": {
    key: "movie.screen.add",
    path: `${APP_PREFIX_PATH}/screen/add`,
    component: React.lazy(() => import("views/screen/screen-add")),
    feature: "is_movie_enabled",
  },
  "movie.screen.edit": {
    key: "movie.screen.edit",
    path: `${APP_PREFIX_PATH}/screen/edit/:screenId`,
    component: React.lazy(() => import("views/screen/screen-edit")),
    feature: "is_movie_enabled",
  },
  "movie.screen.detail": {
    key: "movie.screen.detail",
    path: `${APP_PREFIX_PATH}/screen/detail/:screenId`,
    component: React.lazy(() => import("views/screen/screen-detail")),
    feature: "is_movie_enabled",
  },
  "movie.seat": {
    key: "seat.movie.list",
    path: `${APP_PREFIX_PATH}/seat/movie/list`,
    component: React.lazy(() => import("views/seat/movie/list-seat")),
    feature: "is_movie_enabled",
  },
  "movie.seat.add": {
    key: "seat.movie.add",
    path: `${APP_PREFIX_PATH}/seat/movie/add`,
    component: React.lazy(() => import("views/seat/movie/add-seat")),
    feature: "is_movie_enabled",
  },
  "movie.seat.edit": {
    key: "seat.movie.edit",
    path: `${APP_PREFIX_PATH}/seat/movie/edit/:seatId/:pageType?`,
    component: React.lazy(() => import("views/seat/movie/edit-seat")),
    feature: "is_movie_enabled",
  },
  "movie.seat.details": {
    key: "seat.movie.details",
    path: `${APP_PREFIX_PATH}/seat/movie/:seatId`,
    component: React.lazy(() => import("views/seat/movie/details-seat")),
    feature: "is_movie_enabled",
  },
  "movie.cast": {
    key: "movie.cast",
    path: `${APP_PREFIX_PATH}/personality/list`,
    component: React.lazy(() => import("views/Movie/cast/cast-list")),
    feature: "is_movie_enabled",
  },
  "movie.cast.add": {
    key: "movie.cast.add",
    path: `${APP_PREFIX_PATH}/personality/add`,
    component: React.lazy(() => import("views/Movie/cast/cast-add")),
    feature: "is_movie_enabled",
  },
  "movie.cast.details": {
    key: "movie.cast.details",
    path: `${APP_PREFIX_PATH}/personality/details/:id`,
    component: React.lazy(() => import("views/Movie/cast/cast-details")),
    feature: "is_movie_enabled",
  },
  "movie.cast.edit": {
    key: "movie.cast.edit",
    path: `${APP_PREFIX_PATH}/personality/edit/:id`,
    component: React.lazy(() => import("views/Movie/cast/cast-edit")),
    feature: "is_movie_enabled",
  },
  "movie.list": {
    key: "movie.movie.list",
    path: `${APP_PREFIX_PATH}/movie/list`,
    component: React.lazy(() => import("views/Movie/movie-list")),
    feature: "is_movie_enabled",
  },
  "movie.add": {
    key: "movie.movie.add",
    path: `${APP_PREFIX_PATH}/movie/add`,
    component: React.lazy(() => import("views/Movie/movie-add")),
    feature: "is_movie_enabled",
  },
  "movie.edit": {
    key: "movie.movie.edit",
    path: `${APP_PREFIX_PATH}/movie/edit/:id`,
    component: React.lazy(() => import("views/Movie/movie-edit")),
    feature: "is_movie_enabled",
  },
  "movie.details": {
    key: "movie.movie.details",
    path: `${APP_PREFIX_PATH}/movie/details/:id`,
    component: React.lazy(() => import("views/Movie/movie-detail")),
    feature: "is_movie_enabled",
  },
  "movie.schedule": {
    key: "movie.schedule.list",
    path: `${APP_PREFIX_PATH}/movie-schedule/list`,
    component: React.lazy(() => import("views/schedule/movie/schedule-list")),
    feature: "is_movie_enabled",
  },
  "movie.schedule.add": {
    key: "movie.schedule.add",
    path: `${APP_PREFIX_PATH}/movie-schedule/add`,
    component: React.lazy(() => import("views/schedule/movie/schedule-add")),
    feature: "is_movie_enabled",
  },
  "movie.schedule.details": {
    key: "movie.schedule.details",
    path: `${APP_PREFIX_PATH}/movie-schedule/details/:scheduleId`,
    component: React.lazy(() => import("views/schedule/movie/schedule-detail")),
    feature: "is_movie_enabled",
  },
  "movie.offer": {
    key: "movie.offer",
    path: `${APP_PREFIX_PATH}/offer/list/movie`,
    component: React.lazy(() => import("views/offer/list-offer")),
    feature: "is_movie_enabled",
  },
  "movie.coupon": {
    key: "movie.coupon",
    path: `${APP_PREFIX_PATH}/coupon/list/movie`,
    component: React.lazy(() => import("views/coupon/list-coupon")),
    feature: "is_movie_enabled",
  },

  // Dine Services
  "dine.list": {
    key: "dine.list",
    path: `${APP_PREFIX_PATH}/dine/list`,
    component: React.lazy(() => import("views/dine/list-dine")),
    feature: "is_dine_enabled",
  },
  "dine.add": {
    key: "dine.add",
    path: `${APP_PREFIX_PATH}/dine/add`,
    component: React.lazy(() => import("views/dine/add-dine")),
    feature: "is_dine_enabled",
  },
  "dine.restaurant": {
    key: "dine.restaurant",
    path: `${APP_PREFIX_PATH}/restaurant/list`,
    component: React.lazy(() => import("views/dine/list-restaurant")),
    feature: "is_dine_enabled",
  },
  "dine.restaurant.add": {
    key: "restaurant.add",
    path: `${APP_PREFIX_PATH}/restaurant/add`,
    component: React.lazy(() => import("views/dine/add-restaurant")),
    feature: "is_dine_enabled",
  },
  "dine.schedule": {
    key: "dine.schedule",
    path: `${APP_PREFIX_PATH}/dine/schedule/list`,
    component: React.lazy(() => import("views/dine/Schedule/schedule-list")),
    feature: "is_dine_enabled",
  },

  // Issues
  "issue.list": {
    key: "issue.list",
    path: `${APP_PREFIX_PATH}/issue/list`,
    component: React.lazy(() =>
      import("views/app-views/apps/issues/issue-list")
    ),
    feature: "is_issue_tracking_enabled",
  },
  "issue.add": {
    key: "issue.add",
    path: `${APP_PREFIX_PATH}/issue/add`,
    component: React.lazy(() =>
      import("views/app-views/apps/issues/add-issue")
    ),
    feature: "is_issue_tracking_enabled",
  },
  "issue.details": {
    key: "issue.details",
    path: `${APP_PREFIX_PATH}/issue/details/:issueId`,
    component: React.lazy(() =>
      import("views/app-views/apps/issues/issue-details")
    ),
    feature: "is_issue_tracking_enabled",
  },
  "alerts.list": {
    key: "alerts.list",
    path: `${APP_PREFIX_PATH}/alerts/list`,
    component: React.lazy(() =>
      import("views/app-views/apps/alerts/alerts-list")
    ),
    feature: "is_issue_tracking_enabled",
  },
  "alerts.details": {
    key: "alerts.details",
    path: `${APP_PREFIX_PATH}/alerts/details/:issueId`,
    component: React.lazy(() =>
      import("views/app-views/apps/alerts/alerts-details")
    ),
    feature: "is_issue_tracking_enabled",
  },

  // Track Requests
  "track.event.organizer": {
    key: "org.list",
    path: `${APP_PREFIX_PATH}/track-team/event-organizer/updatelist`,
    component: React.lazy(() =>
      import("views/track-team/event-organizer/update-list")
    ),
    feature: "is_track_requests_enabled",
  },
  "track.event.organizer.details": {
    key: "org.details",
    path: `${APP_PREFIX_PATH}/track-team/event-organizer/details/:eventUpId`,
    component: React.lazy(() =>
      import("views/track-team/event-organizer/update-list-details/index.js")
    ),
    feature: "is_track_requests_enabled",
  },
  "track.event.organizer.edit": {
    key: "org.event.edit",
    path: `${APP_PREFIX_PATH}/track-team/event-organizer/update-edit/:eventId`,
    component: React.lazy(() =>
      import("views/track-team/event-organizer/update-edit/index")
    ),
    feature: "is_track_requests_enabled",
  },
  "track.movie.seats": {
    key: "trackRequest.movie.seats.status.list",
    path: `${APP_PREFIX_PATH}/track/moive-seats/status/list`,
    component: React.lazy(() =>
      import("views/track-team/movie-organizer/seat-organizer/status-list")
    ),
    feature: "is_movie_enabled",
  },
  "track.movie.seats.details": {
    key: "trackRequest.movie.seats.status.details",
    path: `${APP_PREFIX_PATH}/track/moive-seats/status/details/:seatId`,
    component: React.lazy(() =>
      import("views/track-team/movie-organizer/seat-organizer/status-details")
    ),
    feature: "is_movie_enabled",
  },
  "track.movie.offer": {
    key: "trackRequest.offer.status",
    path: `${APP_PREFIX_PATH}/track/offer/status/list/:type`,
    component: React.lazy(() =>
      import("views/track-team/offer-organizer/status-list")
    ),
    feature: "is_movie_enabled",
  },
  "track.movie.offer.details": {
    key: "trackRequest.offer.status.details",
    path: `${APP_PREFIX_PATH}/track/offer/status/details/:offerId`,
    component: React.lazy(() =>
      import("views/track-team/offer-organizer/status-details")
    ),
    feature: "is_movie_enabled",
  },
  "track.movie.coupon": {
    key: "trackRequest.coupon.status",
    path: `${APP_PREFIX_PATH}/track/coupon/status/list/:type`,
    component: React.lazy(() =>
      import("views/track-team/coupon-organizer/status-list")
    ),
    feature: "is_movie_enabled",
  },
  "track.movie.coupon.details": {
    key: "trackRequest.coupon.status.details",
    path: `${APP_PREFIX_PATH}/track/coupon/status/details/:offerId`,
    component: React.lazy(() =>
      import("views/track-team/coupon-organizer/status-details")
    ),
    feature: "is_movie_enabled",
  },
  "track.movie.schedule": {
    key: "trackRequest.movie.schedule.status.list",
    path: `${APP_PREFIX_PATH}/track/moive-schedule/status/list/:type`,
    component: React.lazy(() =>
      import("views/track-team/movie-organizer/Schedule-organizer/status-list")
    ),
    feature: "is_movie_enabled",
  },
  "track.movie.schedule.details": {
    key: "trackRequest.movie.schedule.status.detail",
    path: `${APP_PREFIX_PATH}/track/moive-schedule/status/detail/:scheduleId`,
    component: React.lazy(() =>
      import(
        "views/track-team/movie-organizer/Schedule-organizer/status-detail"
      )
    ),
    feature: "is_movie_enabled",
  },
  "track.movie.screen": {
    key: "trackRequest.movie.screen.status.list",
    path: `${APP_PREFIX_PATH}/track/moive-screens/status/list`,
    component: React.lazy(() =>
      import("views/track-team/movie-organizer/screen-organizer/status-list")
    ),
    feature: "is_movie_enabled",
  },

  // Lead Events
  "lead.event": {
    key: "lead.event.list",
    path: `${APP_PREFIX_PATH}/leadevent/list`,
    component: React.lazy(() => import("views/leadevent/eventrequest-list")),
    feature: "is_lead_events_enabled",
  },
  "lead.event.details": {
    key: "lead.event.details",
    path: `${APP_PREFIX_PATH}/leadevent/details/:eventId`,
    component: React.lazy(() => import("views/leadevent/lead-details")),
    feature: "is_lead_events_enabled",
  },
  "lead.event.add": {
    key: "lead.event.add",
    path: `${APP_PREFIX_PATH}/event/add/:eventId`,
    component: React.lazy(() => import("views/leadevent/add-leadevent")),
    feature: "is_lead_events_enabled",
  },
  "lead.event.convert": {
    key: "lead.event.convert.list",
    path: `${APP_PREFIX_PATH}/leadevent/convert`,
    component: React.lazy(() => import("views/leadevent/convertevent-list")),
    feature: "is_lead_events_enabled",
  },
  "lead.event.convert.details": {
    key: "lead.event.convert.details",
    path: `${APP_PREFIX_PATH}/leadevent/convert/details/:eventId`,
    component: React.lazy(() => import("views/leadevent/convert-details")),
    feature: "is_lead_events_enabled",
  },
  "lead.event.edit": {
    key: "lead.event.edit",
    path: `${APP_PREFIX_PATH}/leadevent/edit/:eventId`,
    component: React.lazy(() => import("views/leadevent/edit- leadevent")),
    feature: "is_lead_events_enabled",
  },

  // Advertisement
  "advertisement.category": {
    key: "advertisement.category.list",
    path: `${APP_PREFIX_PATH}/advertisement/category/list`,
    component: React.lazy(() =>
      import("views/advertisement/category/list-ad-category")
    ),
    feature: "is_advertisement_enabled",
  },
  "advertisement.category.add": {
    key: "advertisement.category.add",
    path: `${APP_PREFIX_PATH}/advertisement/category/add`,
    component: React.lazy(() =>
      import("views/advertisement/category/add-ad-category")
    ),
    feature: "is_advertisement_enabled",
  },
  "advertisement.category.edit": {
    key: "advertisement.category.edit",
    path: `${APP_PREFIX_PATH}/advertisement/category/edit/:adCategoryId`,
    component: React.lazy(() =>
      import("views/advertisement/category/edit-ad-category")
    ),
    feature: "is_advertisement_enabled",
  },
  "advertisement.banner": {
    key: "advertisement.banner.list",
    path: `${APP_PREFIX_PATH}/advertisement/banner/list`,
    component: React.lazy(() =>
      import("views/advertisement/banner/list-ad-banner")
    ),
    feature: "is_advertisement_enabled",
  },
  "advertisement.banner.add": {
    key: "advertisement.banner.add",
    path: `${APP_PREFIX_PATH}/advertisement/banner/add`,
    component: React.lazy(() =>
      import("views/advertisement/banner/add-ad-banner")
    ),
    feature: "is_advertisement_enabled",
  },
  "advertisement.banner.edit": {
    key: "advertisement.banner.edit",
    path: `${APP_PREFIX_PATH}/advertisement/banner/edit/:adBannerId`,
    component: React.lazy(() =>
      import("views/advertisement/banner/edit-ad-banner")
    ),
    feature: "is_advertisement_enabled",
  },
  "advertisement.schedule": {
    key: "advertisement.schedule.list",
    path: `${APP_PREFIX_PATH}/advertisement/schedule/list`,
    component: React.lazy(() =>
      import("views/advertisement/schedule/list-ad-schedule")
    ),
    feature: "is_advertisement_enabled",
  },
  "advertisement.schedule.add": {
    key: "advertisement.schedule.add",
    path: `${APP_PREFIX_PATH}/advertisement/schedule/add`,
    component: React.lazy(() =>
      import("views/advertisement/schedule/add-ad-schedule")
    ),
    feature: "is_advertisement_enabled",
  },
  "advertisement.schedule.edit": {
    key: "advertisement.schedule.edit",
    path: `${APP_PREFIX_PATH}/advertisement/schedule/edit/:scheduleId`,
    component: React.lazy(() =>
      import("views/advertisement/schedule/edit-ad-schedule/index")
    ),
    feature: "is_advertisement_enabled",
  },

  // Newsletter
  "newsletter.list": {
    key: "news-letter.list",
    path: `${APP_PREFIX_PATH}/news-letter/list/`,
    component: React.lazy(() => import("views/news-letter/newsLetter/list")),
    feature: "is_newsletter_enabled",
  },
  "newsletter.add": {
    key: "news-letter.add",
    path: `${APP_PREFIX_PATH}/news-letter/add/`,
    component: React.lazy(() => import("views/news-letter/newsLetter/add")),
    feature: "is_newsletter_enabled",
  },
  "newsletter.subscriber": {
    key: "news-letter.subscriber.list",
    path: `${APP_PREFIX_PATH}/news-letter/subscriber/list/`,
    component: React.lazy(() => import("views/news-letter/subscribers/list")),
    feature: "is_newsletter_enabled",
  },

  // User Management
  "user.list": {
    key: "user.list",
    path: `${APP_PREFIX_PATH}/user/list`,
    component: React.lazy(() => import("views/user/list-user")),
    feature: "is_user_management_enabled",
  },
  "user.add": {
    key: "user.add",
    path: `${APP_PREFIX_PATH}/user/add`,
    component: React.lazy(() => import("views/user/add-user")),
    feature: "is_user_management_enabled",
  },
  "user.edit": {
    key: "user.edit",
    path: `${APP_PREFIX_PATH}/user/edit/:userId`,
    component: React.lazy(() => import("views/user/edit-user/index")),
    feature: "is_user_management_enabled",
  },
  "access.control": {
    key: "accessControl.list",
    path: `${APP_PREFIX_PATH}/access-control/list`,
    component: React.lazy(() => import("views/access-premissions/access-list")),
    feature: "is_user_management_enabled",
  },

  // App Management
  "app.footer": {
    key: "app.management.layout.footer.list",
    path: `${APP_PREFIX_PATH}/app/management/layout/footer/list`,
    component: React.lazy(() =>
      import("views/app-managment/layout/footer/list-footer")
    ),
    feature: "is_app_management_enabled",
  },
  "app.footer.add": {
    key: "app.management.layout.footer.add",
    path: `${APP_PREFIX_PATH}/app/management/layout/footer/add`,
    component: React.lazy(() =>
      import("views/app-managment/layout/footer/add-footer")
    ),
    feature: "is_app_management_enabled",
  },
  "app.faq": {
    key: "app.management.layout.faq.list",
    path: `${APP_PREFIX_PATH}/app/management/layout/faq/list`,
    component: React.lazy(() =>
      import("views/app-managment/layout/faq/list-faq/index")
    ),
    feature: "is_app_management_enabled",
  },
  "app.faq.add": {
    key: "app.management.layout.faq.add-faq",
    path: `${APP_PREFIX_PATH}/app/management/layout/faq/add-faq`,
    component: React.lazy(() =>
      import("views/app-managment/layout/faq/add-faq")
    ),
    feature: "is_app_management_enabled",
  },
  "app.faq.edit": {
    key: "app.management.layout.faq.edit-faq",
    path: `${APP_PREFIX_PATH}/app/management/layout/faq/edit-faq`,
    component: React.lazy(() =>
      import("views/app-managment/layout/faq/edit-faq")
    ),
    feature: "is_app_management_enabled",
  },
  "app.info": {
    key: "app.management.layout.info.list",
    path: `${APP_PREFIX_PATH}/app/management/layout/app-info/list`,
    component: React.lazy(() =>
      import("views/app-managment/layout/app-info/list-info")
    ),
    feature: "is_app_management_enabled",
  },
  "app.info.add": {
    key: "app.management.layout.info.add",
    path: `${APP_PREFIX_PATH}/app/management/layout/app-info/add-info`,
    component: React.lazy(() =>
      import("views/app-managment/layout/app-info/add-info/index")
    ),
    feature: "is_app_management_enabled",
  },
  "app.terms": {
    key: "app.management.layout.terms.list",
    path: `${APP_PREFIX_PATH}/app/management/layout/terms/list`,
    component: React.lazy(() =>
      import("views/app-managment/layout/terms/list-terms")
    ),
    feature: "is_app_management_enabled",
  },
  "app.terms.add": {
    key: "app.management.layout.terms.add",
    path: `${APP_PREFIX_PATH}/app/management/layout/terms/add-terms`,
    component: React.lazy(() =>
      import("views/app-managment/layout/terms/add-term")
    ),
    feature: "is_app_management_enabled",
  },

  // Mail
  "mail.list": {
    key: "mail.list",
    path: `${APP_PREFIX_PATH}/mail/list`,
    component: React.lazy(() => import("views/app-views/apps/mail/mail-list")),
  },

  // Additional Super Admin Routes (without feature flags)
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

// Helper function to check if a feature is enabled
const isFeatureEnabled = (feature) => {
  if (!feature) return true;
  return FEATURE_FLAGS[feature] === true;
};

// Function to get filtered routes based on feature flags
const getFilteredProtectedRoutes = () => {
  return Object.values(ALL_PROTECTED_ROUTES).filter((route) => {
    return isFeatureEnabled(route.feature);
  });
};

// Export the filtered protected routes
export const protectedRoutes = getFilteredProtectedRoutes();
