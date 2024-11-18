import { DashboardOutlined , DotChartOutlined,FundOutlined, FormOutlined, OrderedListOutlined} from '@ant-design/icons';
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
  key: 'event',
  path: `${APP_PREFIX_PATH}/event`,
  title: 'sidenav.event',
  icon: DashboardOutlined,
  breadcrumb: false,
  isGroupTitle: true,
  submenu: [
    {
      key: 'event.create',
      path: `${APP_PREFIX_PATH}/event/create`,
      title: 'sidenav.event.create',
      icon: FormOutlined,
      breadcrumb: false,
      submenu: []
    },
    {
      key: 'event.list',
      path: `${APP_PREFIX_PATH}/event/list`,
      title: 'sidenav.event.list',
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
