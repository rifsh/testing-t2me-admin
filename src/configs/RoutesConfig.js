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
    key: "event.add",
    path: `${APP_PREFIX_PATH}/event/add`,
    component: React.lazy(() => import("views/event/add-event")),
  },
  {
    key: "event.list",
    path: `${APP_PREFIX_PATH}/event/list`,
    component: React.lazy(() => import("views/event/event-list")),
  },
 
  {
    key: "event.details",
    path: `${APP_PREFIX_PATH}/event/details`,
    component: React.lazy(() => import("views/event/event-details")),
  },
  {
    key: "country.list",
    path: `${APP_PREFIX_PATH}/country/list`,
    component: React.lazy(() => import("views/place/country/list-country")),
  },
  {
    key: "country.add",
    path: `${APP_PREFIX_PATH}/country/add`,
    component: React.lazy(() => import("views/place/country/add-country")),
  },
  {
    key: "venue.list",
    path: `${APP_PREFIX_PATH}/venue/list`,
    component: React.lazy(() => import("views/place/venue/list-venue")),
  },
  {
    key: "venue.add",
    path: `${APP_PREFIX_PATH}/venue/add`,
    component: React.lazy(() => import("views/place/venue/add-venue")),
  },
  {
    key: "category.list",
    path: `${APP_PREFIX_PATH}/category/list`,
    component: React.lazy(() => import("views/category/category/list-category")),
  },
  {
    key: "category.add",
    path: `${APP_PREFIX_PATH}/category/add`,
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
];
