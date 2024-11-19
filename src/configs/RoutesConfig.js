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
    component: React.lazy(() => import("views/app-views/event/create-event")),
  },
  {
    key: "event.list",
    path: `${APP_PREFIX_PATH}/event/list`,
    component: React.lazy(() => import("views/app-views/event/event-list")),
  },
  {
    key: "event.list",
    path: `${APP_PREFIX_PATH}/event/list`,
    component: React.lazy(() => import("views/app-views/event/event-list")),
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
];
