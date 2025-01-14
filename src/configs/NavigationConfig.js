import { DashboardOutlined, OrderedListOutlined } from "@ant-design/icons";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { AUTH_TOKEN } from "constants/AuthConstant";
import { UserRoleConstants } from "constants/UserRoleConstant";
import { jwtDecode } from "jwt-decode";

const superAdminDashBoardNavTree = [
  {
    key: "dashboards",
    path: `${APP_PREFIX_PATH}/dashboards`,
    title: "sidenav.dashboard",
    icon: DashboardOutlined,
    breadcrumb: false,
    isGroupTitle: true,
    submenu: [
      // {
      //   key: 'dashboards-default',
      //   path: `${APP_PREFIX_PATH}/dashboards/default`,
      //   title: 'sidenav.dashboard.default',
      //   icon: DashboardOutlined,
      //   breadcrumb: false,
      //   submenu: []
      // },
      {
        key: "dashboards-statics",
        path: `${APP_PREFIX_PATH}/dashboards/statics`,
        title: "sidenav.dashboard.statics",
        icon: DashboardOutlined,
        breadcrumb: false,
        submenu: [],
      },
      // {
      //   key: 'dashboards-analytic',
      //   path: `${APP_PREFIX_PATH}/dashboards/analytic`,
      //   title: 'sidenav.dashboard.analytic',
      //   icon: DotChartOutlined,
      //   breadcrumb: false,
      //   submenu: []
      // },
      // {
      //   key: 'dashboards-sales',
      //   path: `${APP_PREFIX_PATH}/dashboards/sales`,
      //   title: 'sidenav.dashboard.sales',
      //   icon: FundOutlined,
      //   breadcrumb: false,
      //   submenu: []
      // }
    ],
  },
  {
    key: "Forms",
    path: `${APP_PREFIX_PATH}/forms`,
    title: "sidenav.forms",
    icon: DashboardOutlined,
    breadcrumb: false,
    isGroupTitle: false,
    submenu: [
     
      {
        key: "place.list",
        path: `${APP_PREFIX_PATH}/place/list`,
        title: "sidenav.place.list",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
      {
        key: "venue.list",
        path: `${APP_PREFIX_PATH}/venue/list`,
        title: "sidenav.venue.list",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
      {
        key: "tax.list",
        path: `${APP_PREFIX_PATH}/tax/list`,
        title: "sidenav.tax",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
      {
        key: "category.list",
        path: `${APP_PREFIX_PATH}/category/list`,
        title: "sidenav.category",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
      {
        key: "offer.list",
        path: `${APP_PREFIX_PATH}/offer/list`,
        title: "sidenav.offer",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
      {
        key: "coupon.list",
        path: `${APP_PREFIX_PATH}/coupon/list`,
        title: "sidenav.coupon",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
      {
        key: "user.list",
        path: `${APP_PREFIX_PATH}/user/list`,
        title: "sidenav.user",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
      // {
      //   key: 'seat.list',
      //   path: `${APP_PREFIX_PATH}/seat/list`,
      //   title: 'sidenav.seat',
      //   icon: OrderedListOutlined,
      //   breadcrumb: false,
      //   submenu: []
      // },
      {
        key: "ticket.list",
        path: `${APP_PREFIX_PATH}/ticket/list`,
        title: "sidenav.ticket",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
      
      {
        key: "event.list",
        path: `${APP_PREFIX_PATH}/event/list`,
        title: "sidenav.event.list",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
      {
        key: "schedule.list",
        path: `${APP_PREFIX_PATH}/schedule/list`,
        title: "sidenav.schedule",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
      
    ],
  },
  {
    key: "",
    path: ``,
    title: "Track Your Team",
    icon: DashboardOutlined,
    breadcrumb: false,
    submenu: [
      {
        key: "org.update",
        path: `${APP_PREFIX_PATH}/track-team/event-organizer/updatelist`,
        title: "sidenav.eventcoordinatorupdates",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
      
    ],
  },
 
];
const eventOrganaizerDashBoardNavTree = [
  {
    key: "dashboards",
    path: `${APP_PREFIX_PATH}/dashboards`,
    title: "sidenav.dashboard",
    icon: DashboardOutlined,
    breadcrumb: false,
    isGroupTitle: true,
    submenu: [
      {
        key: "dashboards-statics",
        path: `${APP_PREFIX_PATH}/dashboards/sales`,
        title: "sidenav.dashboard.statics",
        icon: DashboardOutlined,
        breadcrumb: false,
        submenu: [],
      },
    ],
  },
  {
    key: "Forms",
    path: `${APP_PREFIX_PATH}/forms`,
    title: "sidenav.forms",
    icon: DashboardOutlined,
    breadcrumb: false,
    isGroupTitle: false,
    submenu: [
      {
        key: "event.list",
        path: `${APP_PREFIX_PATH}/event/list`,
        title: "sidenav.event.list",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
    ],
  },
];
const navigationConfig = () => {
  const token = localStorage.getItem(AUTH_TOKEN);
  if (!token) {
    return [];
  }

  const decodedToken = jwtDecode(token);

  if (decodedToken?.role_id === UserRoleConstants.superAdminRoleId) {
    return superAdminDashBoardNavTree;
  } else if (decodedToken?.role_id === UserRoleConstants.eventOrganizerRoleId) {
    return eventOrganaizerDashBoardNavTree;
  }

  return [];
};

export default navigationConfig;
