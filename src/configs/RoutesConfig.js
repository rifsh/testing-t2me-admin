import React from "react";
import { AUTH_PREFIX_PATH, APP_PREFIX_PATH } from "configs/AppConfig";

export const publicRoutes = [
  {
    key: "login",
    path: `${AUTH_PREFIX_PATH}/login`,
    component: React.lazy(() =>
      import("views/auth-views/authentication/login")
    ),
  },
  // {
  //   key: "register",
  //   path: `${AUTH_PREFIX_PATH}/register`,
  //   component: React.lazy(() =>
  //     import("views/auth-views/authentication/register")
  //   ),
  // },
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

export const protectedRoutes = [
  {
    key: "dashboard.default",
    path: `${APP_PREFIX_PATH}/dashboards/default`,
    component: React.lazy(() => import("views/app-views/dashboards/default")),
  },
  {
    key: "dashboard.analytic",
    path: `${APP_PREFIX_PATH}/dashboards/analytic`,
    component: React.lazy(() => import("views/app-views/dashboards/analytic")),
  },
  {
    key: "dashboard.sales",
    path: `${APP_PREFIX_PATH}/dashboards/sales`,
    component: React.lazy(() => import("views/app-views/dashboards/sales")),
  },
  {
    key: "dashboard.statics",
    path: `${APP_PREFIX_PATH}/dashboards/statics`,
    component: React.lazy(() => import("views/app-views/dashboards/statics")),
  },
  {
    key: "event.add",
    path: `${APP_PREFIX_PATH}/event/add`,
    component: React.lazy(() => import("views/event/add-event")),
  },
  {
    key: "event.edit",
    path: `${APP_PREFIX_PATH}/event/edit/:eventId`,
    component: React.lazy(() => import("views/event/edit-event")),
  },
  {
    key: "event.list",
    path: `${APP_PREFIX_PATH}/event/list`,
    component: React.lazy(() => import("views/event/event-list")),
  },
  {
    key: "movie.screen",
    path: `${APP_PREFIX_PATH}/screen/list`,
    component: React.lazy(() => import("views/screen/screen-list")),
  },
  {
    key: "movie.add",
    path: `${APP_PREFIX_PATH}/screen/add`,
    component: React.lazy(() => import("views/screen/screen-add")),
  },
  {
    key: "movie.edit",
    path: `${APP_PREFIX_PATH}/screen/edit/:screenId`,
    component: React.lazy(() => import("views/screen/screen-edit")),
  },
  {
    key: "movie.detail",
    path: `${APP_PREFIX_PATH}/screen/detail/:screenId`,
    component: React.lazy(() => import("views/screen/screen-detail")),
  },
  {
    key: "movie.screen",
    path: `${APP_PREFIX_PATH}/screen/list`,
    component: React.lazy(() => import("views/screen/screen-list")),
  },
  {
    key: "movie.movie.list",
    path: `${APP_PREFIX_PATH}/movie/list`,
    component: React.lazy(() => import("views/Movie/movie-list")),
  },
  {
    key: "movie.movie.add",
    path: `${APP_PREFIX_PATH}/movie/add/:id`,
    component: React.lazy(() => import("views/Movie/movie-add")),
  },
  {
    key: "movie.movie.add",
    path: `${APP_PREFIX_PATH}/movie/add`,
    component: React.lazy(() => import("views/Movie/movie-add")),
  },
  {
    key: "movie.movie.details",
    path: `${APP_PREFIX_PATH}/movie/details`,
    component: React.lazy(() => import("views/Movie/movie-detail")),
  },
  {
    key: "movie.cast",
    path: `${APP_PREFIX_PATH}/personality/list`,
    component: React.lazy(() => import("views/Movie/cast/cast-list")),
  },
  {
    key: "movie.cast.add",
    path: `${APP_PREFIX_PATH}/personality/add`,
    component: React.lazy(() => import("views/Movie/cast/cast-add")),
  },
  {
    key: "movie.cast.details",
    path: `${APP_PREFIX_PATH}/personality/details/:id`,
    component: React.lazy(() => import("views/Movie/cast/cast-details")),
  },
  {
    key: "movie.cast.details",
    path: `${APP_PREFIX_PATH}/personality/edit/:id`,
    component: React.lazy(() => import("views/Movie/cast/cast-edit")),
  },
  {
    key: "movie.schedule",
    path: `${APP_PREFIX_PATH}/movie-schedule/list`,
    component: React.lazy(() => import("views/Movie/Schedule/schedule-list")),
  },
  {
    key: "dine.list",
    path: `${APP_PREFIX_PATH}/dine/list`,
    component: React.lazy(() => import("views/dine/list-dine")),
  },
  {
    key: "dine.restaurant",
    path: `${APP_PREFIX_PATH}/restaurant/list`,
    component: React.lazy(() => import("views/dine/list-restaurant")),
  },
  {
    key: "dine.add",
    path: `${APP_PREFIX_PATH}/dine/add`,
    component: React.lazy(() => import("views/dine/add-dine")),
  },
  {
    key: "restaurant.add",
    path: `${APP_PREFIX_PATH}/restaurant/add`,
    component: React.lazy(() => import("views/dine/add-restaurant")),
  },
  {
    key: "dine.schedule",
    path: `${APP_PREFIX_PATH}/dine/schedule/list`,
    component: React.lazy(() => import("views/dine/Schedule/schedule-list")),
  },
  {
    key: "dine.details",
    path: `${APP_PREFIX_PATH}/movie-schedule/list`,
    component: React.lazy(() => import("views/Movie/Schedule/schedule-list")),
    key: "movie.theater",
    path: `${APP_PREFIX_PATH}/movie-theater/list`,
    component: React.lazy(() => import("views/theater/list-theater")),
  },
  {
    key: "movie.theater",
    path: `${APP_PREFIX_PATH}/movie-theater/add`,
    component: React.lazy(() => import("views/theater/add-theater")),
  },
  {
    key: "movie.theater",
    path: `${APP_PREFIX_PATH}/movie-theater/edit/:theaterId`,
    component: React.lazy(() => import("views/theater/edit-theater")),
  },
  {
    key: "movie.theater",
    path: `${APP_PREFIX_PATH}/movie-theater/detail/:theaterId`,
    component: React.lazy(() => import("views/theater/details-theater")),
  },
  {
    key: "event.details",
    path: `${APP_PREFIX_PATH}/event/details/:eventId`,
    component: React.lazy(() => import("views/event/event-details")),
  },
  {
    key: "place.list",
    path: `${APP_PREFIX_PATH}/place/list`,
    component: React.lazy(() => import("views/locations/place/list-place")),
  },
  {
    key: "place.add",
    path: `${APP_PREFIX_PATH}/place/add`,
    component: React.lazy(() => import("views/locations/place/add-place")),
  },
  {
    key: "place.edit",
    path: `${APP_PREFIX_PATH}/place/edit/:placeId`,
    component: React.lazy(() => import("views/locations/place/edit_place")),
  },
  {
    key: "venue.list",
    path: `${APP_PREFIX_PATH}/venue/list`,
    component: React.lazy(() => import("views/locations/venue/list-venue")),
  },
  {
    key: "venue.add",
    path: `${APP_PREFIX_PATH}/venue/add`,
    component: React.lazy(() => import("views/locations/venue/add-venue")),
  },
  {
    key: "venue.edit",
    path: `${APP_PREFIX_PATH}/venue/edit/:venueId`,
    component: React.lazy(() => import("views/locations/venue/edit_venue")),
  },
  {
    key: "venue.details",
    path: `${APP_PREFIX_PATH}/venue/details/:venueId`,
    component: React.lazy(() => import("views/locations/venue/venue-details")),
  },
  {
    key: "place.details",
    path: `${APP_PREFIX_PATH}/place/details/:placeId`,
    component: React.lazy(() => import("views/locations/place/place-details")),
  },
  {
    key: "category.list",
    path: `${APP_PREFIX_PATH}/category/list`,
    component: React.lazy(() =>
      import("views/category/category/list-category")
    ),
  },
  {
    key: "category.details",
    path: `${APP_PREFIX_PATH}/category/details/:categoryId`,
    component: React.lazy(() =>
      import("views/category/category/category-detials")
    ),
  },
  {
    key: "subcategory.details",
    path: `${APP_PREFIX_PATH}/subcategory/details/:subcategoryId`,
    component: React.lazy(() =>
      import("views/category/category/subcategory-details")
    ),
  },
  {
    key: "category.add",
    path: `${APP_PREFIX_PATH}/category/add`,
    component: React.lazy(() => import("views/category/category/add-category")),
  },
  {
    key: "category.edit",
    path: `${APP_PREFIX_PATH}/category/edit/category/:catId`,
    component: React.lazy(() =>
      import("views/category/category/edit-category/category/index")
    ),
  },
  {
    key: "subcategory.edit",
    path: `${APP_PREFIX_PATH}/category/edit/subcategory/:subcatId`,
    component: React.lazy(() =>
      import("views/category/category/edit-category/subcategory/index")
    ),
  },
  {
    key: "offer.list",
    path: `${APP_PREFIX_PATH}/offer/list`,
    component: React.lazy(() => import("views/offer/list-offer")),
  },
  {
    key: "offer.add",
    path: `${APP_PREFIX_PATH}/offer/edit/:offerId`,
    component: React.lazy(() => import("views/offer/edit-offer/index")),
  },
  {
    key: "offer.edit",
    path: `${APP_PREFIX_PATH}/offer/add`,
    component: React.lazy(() => import("views/offer/add-offer")),
  },
  {
    key: "coupon.list",
    path: `${APP_PREFIX_PATH}/coupon/list`,
    component: React.lazy(() => import("views/coupon/list-coupon")),
  },
  {
    key: "coupon.add",
    path: `${APP_PREFIX_PATH}/coupon/add`,
    component: React.lazy(() => import("views/coupon/add-coupon")),
  },
  {
    key: "coupon.edit",
    path: `${APP_PREFIX_PATH}/coupon/edit/:couponId`,
    component: React.lazy(() => import("views/coupon/edit-coupon/index")),
  },
  {
    key: "user.list",
    path: `${APP_PREFIX_PATH}/user/list`,
    component: React.lazy(() => import("views/user/list-user")),
  },
  {
    key: "user.add",
    path: `${APP_PREFIX_PATH}/user/add`,
    component: React.lazy(() => import("views/user/add-user")),
  },
  {
    key: "user.edit",
    path: `${APP_PREFIX_PATH}/user/edit/:userId`,
    component: React.lazy(() => import("views/user/edit-user/index")),
  },
  {
    key: "seat.list",
    path: `${APP_PREFIX_PATH}/seat/list`,
    component: React.lazy(() => import("views/seat/stadium/list-seat")),
  },
  {
    key: "seat.add",
    path: `${APP_PREFIX_PATH}/seat/add`,
    component: React.lazy(() => import("views/seat/stadium/add-seat")),
  },
  {
    key: "seat.movie.list",
    path: `${APP_PREFIX_PATH}/seat/movie/list`,
    component: React.lazy(() => import("views/seat/movie/list-seat")),
  },
  {
    key: "seat.movie.add",
    path: `${APP_PREFIX_PATH}/seat/movie/add`,
    component: React.lazy(() => import("views/seat/movie/add-seat")),
  },
  {
    key: "seat.movie.add",
    path: `${APP_PREFIX_PATH}/seat/movie/edit/:seatId`,
    component: React.lazy(() => import("views/seat/movie/edit-seat")),
  },
  {
    key: "seat.movie.details",
    path: `${APP_PREFIX_PATH}/seat/movie/:seatId`,
    component: React.lazy(() => import("views/seat/movie/details-seat")),
  },
  {
    key: "schedule.list",
    path: `${APP_PREFIX_PATH}/schedule/list`,
    component: React.lazy(() => import("views/schedule/list-schedule")),
  },
  {
    key: "schedule.details",
    path: `${APP_PREFIX_PATH}/schedule/:scheduleId`,
    component: React.lazy(() => import("views/schedule/schedule-details")),
  },
  {
    key: "schedule.add",
    path: `${APP_PREFIX_PATH}/schedule/add`,
    component: React.lazy(() => import("views/schedule/add-schedule")),
  },
  {
    key: "schedule.edit",
    path: `${APP_PREFIX_PATH}/schedule/edit/:scheduleId`,
    component: React.lazy(() => import("views/schedule/edit-schedule")),
  },
  {
    key: "payment.list",
    path: `${APP_PREFIX_PATH}/payment/list`,
    component: React.lazy(() => import("views/payment/list-payment")),
  },
  {
    key: "payment.details",
    path: `${APP_PREFIX_PATH}/payment/details/:paymentId`,
    component: React.lazy(() => import("views/payment/payment-details")),
  },
  {
    key: "payment.add",
    path: `${APP_PREFIX_PATH}/payment/add`,
    component: React.lazy(() => import("views/payment/add-payment")),
  },
  {
    key: "payment.edit",
    path: `${APP_PREFIX_PATH}/payment/edit/`,
    component: React.lazy(() => import("views/payment/edit-payment")),
  },
  {
    key: "news-letter.list",
    path: `${APP_PREFIX_PATH}/news-letter/list/`,
    component: React.lazy(() => import("views/news-letter/newsLetter/list")),
  },
  {
    key: "news-letter.add",
    path: `${APP_PREFIX_PATH}/news-letter/add/`,
    component: React.lazy(() => import("views/news-letter/newsLetter/add")),
  },
  {
    key: "news-letter.subscriber.list",
    path: `${APP_PREFIX_PATH}/news-letter/subscriber/list/`,
    component: React.lazy(() => import("views/news-letter/subscribers/list")),
  },
  {
    key: "ticket.list",
    path: `${APP_PREFIX_PATH}/ticket/list`,
    component: React.lazy(() => import("views/ticket/list-ticket")),
  },
  {
    key: "ticket.add",
    path: `${APP_PREFIX_PATH}/ticket/add`,
    component: React.lazy(() => import("views/ticket/add-ticket")),
  },
  {
    key: "ticket.edit",
    path: `${APP_PREFIX_PATH}/ticket/edit/:ticketId`,
    component: React.lazy(() => import("views/ticket/edit-ticket/index")),
  },
  {
    key: "ticket.type",
    path: `${APP_PREFIX_PATH}/ticket/type/add`,
    component: React.lazy(() => import("views/ticket/components/MultyForm.js")),
  },
  {
    key: "tax.list",
    path: `${APP_PREFIX_PATH}/tax/list`,
    component: React.lazy(() => import("views/tax/list-tax")),
  },
  {
    key: "tax.add",
    path: `${APP_PREFIX_PATH}/tax/add`,
    component: React.lazy(() => import("views/tax/add-tax")),
  },
  {
    key: "tax.edit",
    path: `${APP_PREFIX_PATH}/tax/edit/:taxId`,
    component: React.lazy(() => import("views/tax/edit-tax/index")),
  },
  {
    key: "app.management.layout.footer.list",
    path: `${APP_PREFIX_PATH}/app/management/layout/footer/list`,
    component: React.lazy(() =>
      import("views/app-managment/layout/footer/list-footer")
    ),
  },
  {
    key: "app.management.layout.footer.add",
    path: `${APP_PREFIX_PATH}/app/management/layout/footer/add`,
    component: React.lazy(() =>
      import("views/app-managment/layout/footer/add-footer")
    ),
  },
  {
    key: "advertisement.category.list",
    path: `${APP_PREFIX_PATH}/advertisement/category/list`,
    component: React.lazy(() =>
      import("views/advertisement/category/list-ad-category")
    ),
  },
  {
    key: "advertisement.category.add",
    path: `${APP_PREFIX_PATH}/advertisement/category/add`,
    component: React.lazy(() =>
      import("views/advertisement/category/add-ad-category")
    ),
  },
  {
    key: "advertisement.banner.list",
    path: `${APP_PREFIX_PATH}/advertisement/banner/list`,
    component: React.lazy(() =>
      import("views/advertisement/banner/list-ad-banner")
    ),
  },
  {
    key: "advertisement.schedule.list",
    path: `${APP_PREFIX_PATH}/advertisement/schedule/list`,
    component: React.lazy(() =>
      import("views/advertisement/schedule/list-ad-schedule")
    ),
  },
  {
    key: "advertisement.schedule.add",
    path: `${APP_PREFIX_PATH}/advertisement/schedule/add`,
    component: React.lazy(() =>
      import("views/advertisement/schedule/add-ad-schedule")
    ),
  },
  {
    key: "advertisement.schedule.edit",
    path: `${APP_PREFIX_PATH}/advertisement/schedule/edit/:scheduleId`,
    component: React.lazy(() =>
      import("views/advertisement/schedule/edit-ad-schedule/index")
    ),
  },
  {
    key: "advertisement.banner.add",
    path: `${APP_PREFIX_PATH}/advertisement/banner/add`,
    component: React.lazy(() =>
      import("views/advertisement/banner/add-ad-banner")
    ),
  },
  {
    key: "mail.list",
    path: `${APP_PREFIX_PATH}/mail/list`,
    component: React.lazy(() => import("views/app-views/apps/mail/mail-list")),
  },
  {
    key: "issue.list",
    path: `${APP_PREFIX_PATH}/issue/list`,
    component: React.lazy(() =>
      import("views/app-views/apps/issues/issue-list")
    ),
  },
  {
    key: "issue.add",
    path: `${APP_PREFIX_PATH}/issue/add`,
    component: React.lazy(() =>
      import("views/app-views/apps/issues/add-issue")
    ),
  },
  {
    key: "issue.details",
    path: `${APP_PREFIX_PATH}/issue/details/:issueId`,
    component: React.lazy(() =>
      import("views/app-views/apps/issues/issue-details")
    ),
  },
  {
    key: "alerts.list",
    path: `${APP_PREFIX_PATH}/alerts/list`,
    component: React.lazy(() =>
      import("views/app-views/apps/alerts/alerts-list")
    ),
  },
  {
    key: "event.type.list",
    path: `${APP_PREFIX_PATH}/event/type/list`,
    component: React.lazy(() => import("views/event-type/list-type")),
  },
  {
    key: "event.type.add",
    path: `${APP_PREFIX_PATH}/event/type/add`,
    component: React.lazy(() => import("views/event-type/add-type")),
  },
  {
    key: "event.type.edit",
    path: `${APP_PREFIX_PATH}/event/type/edit/:typeId`,
    component: React.lazy(() => import("views/event-type/edit-type")),
  },
  {
    key: "advertisement.category.edit",
    path: `${APP_PREFIX_PATH}/advertisement/category/edit/:adCategoryId`,
    component: React.lazy(() =>
      import("views/advertisement/category/edit-ad-category")
    ),
  },
  {
    key: "advertisement.banner.edit",
    path: `${APP_PREFIX_PATH}/advertisement/banner/edit/:adBannerId`,
    component: React.lazy(() =>
      import("views/advertisement/banner/edit-ad-banner")
    ),
  },
  {
    key: "org.list",
    path: `${APP_PREFIX_PATH}/track-team/event-organizer/updatelist`,
    component: React.lazy(() =>
      import("views/track-team/event-organizer/update-list")
    ),
  },

  {
    key: "org.details",
    path: `${APP_PREFIX_PATH}/track-team/event-organizer/details/:eventUpId`,
    component: React.lazy(() =>
      import("views/track-team/event-organizer/update-list-details/index.js")
    ),
  },
  {
    key: "org.event.edit",
    path: `${APP_PREFIX_PATH}/track-team/event-organizer/update-edit/:eventId`,
    component: React.lazy(() =>
      import("views/track-team/event-organizer/update-edit/index")
    ),
  },
  {
    key: "app.management.layout.faq.list",
    path: `${APP_PREFIX_PATH}/app/management/layout/faq/list`,
    component: React.lazy(() =>
      import("views/app-managment/layout/faq/list-faq/index")
    ),
  },
  {
    key: "app.management.layout.faq.add-faq",
    path: `${APP_PREFIX_PATH}/app/management/layout/faq/add-faq`,
    component: React.lazy(() =>
      import("views/app-managment/layout/faq/add-faq")
    ),
  },
  {
    key: "app.management.layout.faq.edit-faq",
    path: `${APP_PREFIX_PATH}/app/management/layout/faq/edit-faq`,
    component: React.lazy(() =>
      import("views/app-managment/layout/faq/edit-faq")
    ),
  },
  {
    key: "app.management.layout.info.list",
    path: `${APP_PREFIX_PATH}/app/management/layout/app-info/list`,
    component: React.lazy(() =>
      import("views/app-managment/layout/app-info/list-info")
    ),
  },
  {
    key: "app.management.layout.info.add",
    path: `${APP_PREFIX_PATH}/app/management/layout/app-info/add-info`,
    component: React.lazy(() =>
      import("views/app-managment/layout/app-info/add-info/index")
    ),
  },
  {
    key: "app.management.layout.terms.list",
    path: `${APP_PREFIX_PATH}/app/management/layout/terms/list`,
    component: React.lazy(() =>
      import("views/app-managment/layout/terms/list-terms")
    ),
  },
  {
    key: "app.management.layout.terms.add",
    path: `${APP_PREFIX_PATH}/app/management/layout/terms/add-terms`,
    component: React.lazy(() =>
      import("views/app-managment/layout/terms/add-term")
    ),
  },
  {
    key: "lead.event.list",
    path: `${APP_PREFIX_PATH}/leadevent/list`,
    component: React.lazy(() => import("views/leadevent/eventrequest-list")),
  },
  {
    key: "lead.event.details",
    path: `${APP_PREFIX_PATH}/leadevent/details/:eventId`,
    component: React.lazy(() => import("views/leadevent/lead-details")),
  },
  {
    // /leadevent/add/:eventId`,
    key: "lead.event.add",
    path: `${APP_PREFIX_PATH}/event/add/:eventId`,
    component: React.lazy(() => import("views/leadevent/add-leadevent")),
  },
  {
    key: "lead.event.convert.list",
    path: `${APP_PREFIX_PATH}/leadevent/convert`,
    component: React.lazy(() => import("views/leadevent/convertevent-list")),
  },
  {
    key: "lead.event.convert.details",
    path: `${APP_PREFIX_PATH}/leadevent/convert/details/:eventId`,
    component: React.lazy(() => import("views/leadevent/convert-details")),
  },
  {
    key: "lead.event.edit",
    path: `${APP_PREFIX_PATH}/leadevent/edit/:eventId`,
    component: React.lazy(() => import("views/leadevent/edit- leadevent")),
  },

  {
    key: "organizer.reports",
    path: `${APP_PREFIX_PATH}/organizer/reports`,
    component: React.lazy(() =>
      import("views/app-views/apps/organizer/reports")
    ),
  }
  

];
