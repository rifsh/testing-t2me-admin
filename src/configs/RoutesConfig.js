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
  {
    key: "register",
    path: `${AUTH_PREFIX_PATH}/register`,
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
    component: React.lazy(() => import("views/category/category/category-detials")),
  },
  {
    key: "subcategory.details",
    path: `${APP_PREFIX_PATH}/subcategory/details/:subcategoryId`,
    component: React.lazy(() => import("views/category/category/subcategory-details")),
  },
  {
    key: "category.add",
    path: `${APP_PREFIX_PATH}/category/add`,
    component: React.lazy(() => import("views/category/category/add-category")),
  },
  {
    key: "category.edit",
    path: `${APP_PREFIX_PATH}/category/edit`,
    component: React.lazy(() => import("views/category/category/add-category")),
  },
  {
    key: "offer.list",
    path: `${APP_PREFIX_PATH}/offer/list`,
    component: React.lazy(() => import("views/offer/list-offer")),
  },
  {
    key: "offer.add",
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
    key: "seat.list",
    path: `${APP_PREFIX_PATH}/seat/list`,
    component: React.lazy(() => import("views/seat/list-seat")),
  },
  {
    key: "seat.add",
    path: `${APP_PREFIX_PATH}/seat/add`,
    component: React.lazy(() => import("views/seat/add-seat")),
  },
  {
    key: "schedule.list",
    path: `${APP_PREFIX_PATH}/schedule/list`,
    component: React.lazy(() => import("views/schedule/list-schedule")),
  },
  {
    key: "schedule.add",
    path: `${APP_PREFIX_PATH}/schedule/add`,
    component: React.lazy(() => import("views/schedule/add-schedule")),
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

    key: "tapp.management.layout.footer.list",
    path: `${APP_PREFIX_PATH}/app/management/layout/footer/list`,
    component: React.lazy(() => import("views/app-managment/layout/footer/list-footer")),
  },
  {
    key: "tapp.management.layout.footer.add",
    path: `${APP_PREFIX_PATH}/app/management/layout/footer/add`,
    component: React.lazy(() => import("views/app-managment/layout/footer/add-footer")),
  }, {
    key: "advertisement.category.list",
    path: `${APP_PREFIX_PATH}/advertisement/category/list`,
    component: React.lazy(() => import("views/advertisement/category/list-ad-category")),
  },
  {
    key: "advertisement.category.add",
    path: `${APP_PREFIX_PATH}/advertisement/category/add`,
    component: React.lazy(() => import("views/advertisement/category/add-ad-category")),
  },
  {
    key: "advertisement.banner.list",
    path: `${APP_PREFIX_PATH}/advertisement/banner/list`,
    component: React.lazy(() => import("views/advertisement/banner/list-ad-banner")),
  },
  {
    key: "advertisement.schedule.list",
    path: `${APP_PREFIX_PATH}/advertisement/schedule/list`,
    component: React.lazy(() => import("views/advertisement/schedule/list-ad-schedule")),
  },
  {
    key: "advertisement.schedule.add",
    path: `${APP_PREFIX_PATH}/advertisement/schedule/add`,
    component: React.lazy(() => import("views/advertisement/schedule/add-ad-schedule")),
  },
  {
    key: "advertisement.banner.add",
    path: `${APP_PREFIX_PATH}/advertisement/banner/add`,
    component: React.lazy(() => import("views/advertisement/banner/add-ad-banner")),
  },
  {
    key: "mail.list",
    path: `${APP_PREFIX_PATH}/mail/list`,
    component: React.lazy(() => import("views/app-views/apps/mail/mail-list")),
  },
  {
    key: "issue.list",
    path: `${APP_PREFIX_PATH}/issue/list`,
    component: React.lazy(() => import("views/app-views/apps/issues/issue-list")),
  },
  {
    key: "issue.add",
    path: `${APP_PREFIX_PATH}/issue/add`,
    component: React.lazy(() => import("views/app-views/apps/issues/add-issue")),
  },
  {
    key: "issue.details",
    path: `${APP_PREFIX_PATH}/issue/details/:issueId`,
    component: React.lazy(() => import("views/app-views/apps/issues/issue-details")),
  },
  {
    key: "alerts.list",
    path: `${APP_PREFIX_PATH}/alerts/list`,
    component: React.lazy(() => import("views/app-views/apps/alerts/alerts-list")),
  }, {
    key: "organiser.update",
    path: `${APP_PREFIX_PATH}/track-team/event-organizer/updatelist`,
    component: React.lazy(() => import("views/track-team/event-organizer/update-list/index.js")),

  },
  {
    key: "advertisement.category.edit",
    path: `${APP_PREFIX_PATH}/advertisement/category/edit/:adCategoryId`,
    component: React.lazy(() => import("views/advertisement/category/edit-ad-category")),
  },
  {
    key: "advertisement.banner.edit",
    path: `${APP_PREFIX_PATH}/advertisement/banner/edit/:adBannerId`,
    component: React.lazy(() => import("views/advertisement/banner/edit-ad-banner")),
  },
  {
    key: "org.details",
    path: `${APP_PREFIX_PATH}/track-team/event-organizer/details/:eventUpId`,
    component: React.lazy(() => import("views/track-team/event-organizer/update-list-details/index.js")),
  },
  {
    key: "org.event.edit",
    path: `${APP_PREFIX_PATH}/track-team/event-organizer/update-edit/:eventId`,
    component: React.lazy(() => import("views/track-team/event-organizer/update-edit/index")),
  },
];
