import {
  DashboardOutlined,
  LayoutOutlined,
  MoreOutlined,
  OrderedListOutlined,
  SettingOutlined,
} from "@ant-design/icons";
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
    ]
  },
  {
    key: "Issue",
    path: `${APP_PREFIX_PATH}/apps`,
    title: "sidenav.apps.issues",
    icon: DashboardOutlined,
    breadcrumb: false,
    isGroupTitle: false,
    submenu: [
      {
        key: "issue.list",
        path: `${APP_PREFIX_PATH}/issue/list`,
        title: "sidenav.apps.issue",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
      // {
      //   key: "mail.list",
      //   path: `${APP_PREFIX_PATH}/mail/list`,
      //   title: "sidenav.apps.mail",
      //   icon: OrderedListOutlined,
      //   breadcrumb: false,
      //   submenu: [],
      // },
      {
        key: "alerts.list",
        path: `${APP_PREFIX_PATH}/alerts/list`,
        title: "sidenav.apps.alerts",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
    ],
  },
  {
    key: "TrackRequest",
    path: `${APP_PREFIX_PATH}/forms`,
    title: "Track Request",
    icon: DashboardOutlined,
    breadcrumb: false,
    submenu: [
      {
        key: "eventOrganiser.update",
        path: `${APP_PREFIX_PATH}/track-team/event-organizer/updatelist`,
        title: "sidenav.eventcoordinatorupdates",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },

    ],
  },

  {
    key: "advertisement",
    path: `${APP_PREFIX_PATH}/advertisement`,
    title: "sidenav.advertisements",
    icon: DashboardOutlined,
    breadcrumb: false,
    isGroupTitle: false,
    submenu: [
      {
        key: "advertisement.category.list",
        path: `${APP_PREFIX_PATH}/advertisement/category/list`,
        title: "advertisement.category",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
      {
        key: "advertisement.banner.list",
        path: `${APP_PREFIX_PATH}/advertisement/banner/list`,
        title: "advertisement.banner",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
      {
        key: "advertisement.schedule.list",
        path: `${APP_PREFIX_PATH}/advertisement/schedule/list`,
        title: "advertisement.schedule",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
    ],
  },  {
    key: "user.list",
    path: `${APP_PREFIX_PATH}/user/list`,
    title: "sidenav.user",
    icon: DashboardOutlined,
    breadcrumb: false,
    submenu: [],
  },

  {
    key: "app.management",
    path: `${APP_PREFIX_PATH}/app/management`,
    title: "sidenav.app.management",
    icon: SettingOutlined,
    breadcrumb: true,
    isGroupTitle: true,
    submenu: [
      {
        key: "app.management.layout",
        path: `${APP_PREFIX_PATH}/dashboards/statics`,
        title: "sidenav.app.management.layout",
        icon: LayoutOutlined,
        breadcrumb: false,
        submenu: [
          {
            key: "app.management.layout.footer.list",
            path: `${APP_PREFIX_PATH}/app/management/layout/footer/list`,
            title: "sidenav.app.management.layout.footer",
            icon: LayoutOutlined,
            breadcrumb: false,
            submenu: [],
          },
          {
            key: "app.management.layout.faq.list",
            path: `${APP_PREFIX_PATH}/app/management/layout/faq/list`,
            title: "sidenav.app.management.layout.faq",
            icon: LayoutOutlined,
            breadcrumb: false,
            submenu: [],
          },
        ],
      },
    ],
  },
];
const techAdminDashBoardNavTree = [
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
    ]
  },
  {
    key: "Issue",
    path: `${APP_PREFIX_PATH}/apps`,
    title: "sidenav.apps.issues",
    icon: DashboardOutlined,
    breadcrumb: false,
    isGroupTitle: false,
    submenu: [
      {
        key: "issue.list",
        path: `${APP_PREFIX_PATH}/issue/list`,
        title: "sidenav.apps.issue",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
      // {
      //   key: "mail.list",
      //   path: `${APP_PREFIX_PATH}/mail/list`,
      //   title: "sidenav.apps.mail",
      //   icon: OrderedListOutlined,
      //   breadcrumb: false,
      //   submenu: [],
      // },
      {
        key: "alerts.list",
        path: `${APP_PREFIX_PATH}/alerts/list`,
        title: "sidenav.apps.alerts",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
    ],
  },
  {
    key: "TrackRequest",
    path: `${APP_PREFIX_PATH}/forms`,
    title: "Track Request",
    icon: DashboardOutlined,
    breadcrumb: false,
    submenu: [
      {
        key: "eventOrganiser.update",
        path: `${APP_PREFIX_PATH}/track-team/event-organizer/updatelist`,
        title: "sidenav.eventcoordinatorupdates",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },

    ],
  },

  {
    key: "advertisement",
    path: `${APP_PREFIX_PATH}/advertisement`,
    title: "sidenav.advertisements",
    icon: DashboardOutlined,
    breadcrumb: false,
    isGroupTitle: false,
    submenu: [
      {
        key: "advertisement.category.list",
        path: `${APP_PREFIX_PATH}/advertisement/category/list`,
        title: "advertisement.category",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
      {
        key: "advertisement.banner.list",
        path: `${APP_PREFIX_PATH}/advertisement/banner/list`,
        title: "advertisement.banner",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
      {
        key: "advertisement.schedule.list",
        path: `${APP_PREFIX_PATH}/advertisement/schedule/list`,
        title: "advertisement.schedule",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
    ],
  },  {
    key: "user.list",
    path: `${APP_PREFIX_PATH}/user/list`,
    title: "sidenav.user",
    icon: DashboardOutlined,
    breadcrumb: false,
    submenu: [],
  },

  {
    key: "app.management",
    path: `${APP_PREFIX_PATH}/app/management`,
    title: "sidenav.app.management",
    icon: SettingOutlined,
    breadcrumb: true,
    isGroupTitle: true,
    submenu: [
      {
        key: "app.management.layout",
        path: `${APP_PREFIX_PATH}/dashboards/statics`,
        title: "sidenav.app.management.layout",
        icon: LayoutOutlined,
        breadcrumb: false,
        submenu: [
          {
            key: "app.management.layout.footer.list",
            path: `${APP_PREFIX_PATH}/app/management/layout/footer/list`,
            title: "sidenav.app.management.layout.footer",
            icon: LayoutOutlined,
            breadcrumb: false,
            submenu: [],
          },
          {
            key: "app.management.layout.footer.list",
            path: `${APP_PREFIX_PATH}/app/management/layout/footer/list`,
            title: "sidenav.app.management.layout.footer",
            icon: LayoutOutlined,
            breadcrumb: false,
            submenu: [],
          },
        ],
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
  {
    key: "TrackRequest",
    path: `${APP_PREFIX_PATH}/forms`,
    title: "Track Request",
    icon: DashboardOutlined,
    breadcrumb: false,
    submenu: [
      {
        key: "eventOrganiser.update",
        path: `${APP_PREFIX_PATH}/track-team/event-organizer/updatelist`,
        title: "sidenav.eventcoordinatorupdates",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },

    ],
  },
  {
    key: "Issue",
    path: `${APP_PREFIX_PATH}/apps`,
    title: "sidenav.apps.issue",
    icon: DashboardOutlined,
    breadcrumb: false,
    isGroupTitle: false,
    submenu: [
      {
        key: "issue.list",
        path: `${APP_PREFIX_PATH}/issue/list`,
        title: "sidenav.apps.issue",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
      // {
      //   key: "mail.list",
      //   path: `${APP_PREFIX_PATH}/mail/list`,
      //   title: "sidenav.apps.mail",
      //   icon: OrderedListOutlined,
      //   breadcrumb: false,
      //   submenu: [],
      // },
    ],
  },
];
const techSupportingTeamDashBoardNavTree = [
  {
    key: "Issue",
    path: `${APP_PREFIX_PATH}/apps`,
    title: "sidenav.apps.issue",
    icon: DashboardOutlined,
    breadcrumb: false,
    isGroupTitle: false,
    submenu: [
      {
        key: "issue.list",
        path: `${APP_PREFIX_PATH}/issue/list`,
        title: "sidenav.apps.issue",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
      // {
      //   key: "mail.list",
      //   path: `${APP_PREFIX_PATH}/mail/list`,
      //   title: "sidenav.apps.mail",
      //   icon: OrderedListOutlined,
      //   breadcrumb: false,
      //   submenu: [],
      // },
    ],
  },
];
const EventSupportingTeamDashBoardNavTree = [
  {
    key: "Issue",
    path: `${APP_PREFIX_PATH}/apps`,
    title: "sidenav.apps.issue",
    icon: DashboardOutlined,
    breadcrumb: false,
    isGroupTitle: false,
    submenu: [
      {
        key: "issue.list",
        path: `${APP_PREFIX_PATH}/issue/list`,
        title: "sidenav.apps.issue",
        icon: OrderedListOutlined,
        breadcrumb: false,
        submenu: [],
      },
      // {
      //   key: "mail.list",
      //   path: `${APP_PREFIX_PATH}/mail/list`,
      //   title: "sidenav.apps.mail",
      //   icon: OrderedListOutlined,
      //   breadcrumb: false,
      //   submenu: [],
      // },
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
  } else if (decodedToken?.role_id === UserRoleConstants.techAdminRoleId) {
    
    return techAdminDashBoardNavTree;
  } else if (decodedToken?.role_id === UserRoleConstants.eventOrganizerRoleId) {

    return eventOrganaizerDashBoardNavTree;
  } 
   else if (decodedToken?.role_id === UserRoleConstants.techSupportingTeamRoleId) {
    
    return techSupportingTeamDashBoardNavTree;
  }
  else if (decodedToken?.role_id === UserRoleConstants.eventSupportingTeamRoleId) {
    return EventSupportingTeamDashBoardNavTree;
  }

  return [];
};

export default navigationConfig;
