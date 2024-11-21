import { DashboardOutlined , DotChartOutlined,FundOutlined,   OrderedListOutlined} from '@ant-design/icons';
import { APP_PREFIX_PATH } from 'configs/AppConfig'


const dashBoardNavTree = [
  {
  key: 'dashboards',
  path: `${APP_PREFIX_PATH}/dashboards`,
  title: 'sidenav.dashboard',
  icon: DashboardOutlined,
  breadcrumb: false,
  isGroupTitle: true,
  submenu: [
    {
      key: 'dashboards-default',
      path: `${APP_PREFIX_PATH}/dashboards/default`,
      title: 'sidenav.dashboard.default',
      icon: DashboardOutlined,
      breadcrumb: false,
      submenu: []
    },
    {
      key: 'dashboards-analytic',
      path: `${APP_PREFIX_PATH}/dashboards/analytic`,
      title: 'sidenav.dashboard.analytic',
      icon: DotChartOutlined,
      breadcrumb: false,
      submenu: []
    },{
      key: 'dashboards-sales',
      path: `${APP_PREFIX_PATH}/dashboards/sales`,
      title: 'sidenav.dashboard.sales',
      icon: FundOutlined,
      breadcrumb: false,
      submenu: []
    }
  ]
},
  {
  key: 'Forms',
  path: `${APP_PREFIX_PATH}/forms`,
  title: 'sidenav.forms',
  icon: DashboardOutlined,
  breadcrumb: false,
  isGroupTitle: false,
  submenu: [
    {
      key: 'event.list',
      path: `${APP_PREFIX_PATH}/event/list`,
      title: 'sidenav.event.list',
      icon: OrderedListOutlined,
      breadcrumb: false,
      submenu: []
    },
    {
      key: 'country.list',
      path: `${APP_PREFIX_PATH}/country/list`,
      title: 'sidenav.country.list',
      icon: OrderedListOutlined,
      breadcrumb: false,
      submenu: []
    },
    {
      key: 'venue.list',
      path: `${APP_PREFIX_PATH}/venue/list`,
      title: 'sidenav.venue.list',
      icon: OrderedListOutlined,
      breadcrumb: false,
      submenu: []
    },
    {
      key: 'category.list',
      path: `${APP_PREFIX_PATH}/category/list`,
      title: 'sidenav.category',
      icon: OrderedListOutlined,
      breadcrumb: false,
      submenu: []
    },
    {
      key: 'offer.list',
      path: `${APP_PREFIX_PATH}/offer/list`,
      title: 'sidenav.offer',
      icon: OrderedListOutlined,
      breadcrumb: false,
      submenu: []
    },
    {
      key: 'coupon.list',
      path: `${APP_PREFIX_PATH}/coupon/list`,
      title: 'sidenav.coupon',
      icon: OrderedListOutlined,
      breadcrumb: false,
      submenu: []
    },
    {
      key: 'seat.list',
      path: `${APP_PREFIX_PATH}/seat/list`,
      title: 'sidenav.seat',
      icon: OrderedListOutlined,
      breadcrumb: false,
      submenu: []
    },
    {
      key: 'schedule.list',
      path: `${APP_PREFIX_PATH}/schedule/list`,
      title: 'sidenav.schedule',
      icon: OrderedListOutlined,
      breadcrumb: false,
      submenu: []
    },
  ]
}
]

const navigationConfig = [
  ...dashBoardNavTree
]

export default navigationConfig;
