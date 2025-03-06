import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Grid } from 'antd';
import IntlMessage from '../util-components/IntlMessage';
import Icon from '../util-components/Icon';
import navigationConfig from 'configs/NavigationConfig';
import { useSelector, useDispatch } from 'react-redux';
import { SIDE_NAV_LIGHT, NAV_TYPE_SIDE } from "constants/ThemeConstant";
import utils from 'utils';
import { onMobileNavToggle } from 'store/slices/themeSlice';

const { useBreakpoint } = Grid;

const MenuItem = ({ title, icon, path }) => {
  const dispatch = useDispatch();
  const isMobile = !utils.getBreakPoint(useBreakpoint()).includes('lg');

  const closeMobileNav = () => {
    if (isMobile) {
      dispatch(onMobileNavToggle(false));
    }
  };

  return (
    <>
      {icon && <Icon type={icon} />}
      <span><IntlMessage id={title} /></span>
      {path && <Link onClick={closeMobileNav} to={path} />}
    </>
  );
};

const getNavMenuItems = (navItem, type = 'side') => navItem.map(nav => ({
  key: nav.key,
  label: <MenuItem title={nav.title} {...(nav.isGroupTitle ? {} : { path: nav.path, icon: nav.icon })} />,
  ...(nav.isGroupTitle && type === 'side' ? { type: 'group' } : {}),
  ...(nav.submenu?.length > 0 ? { children: getNavMenuItems(nav.submenu, type) } : {})

}));

const SideNavContent = (props) => {
  const { routeInfo, hideGroupTitle, sideNavTheme = SIDE_NAV_LIGHT } = props;

  const menuItems = useMemo(() => {
    const navTree = navigationConfig();
    return getNavMenuItems(navTree, 'side');
  }, []);

  const defaultOpenKeys = useMemo(() => {
    if (!routeInfo?.key) return [];
    return routeInfo.key.split('-').map((_, i, arr) => arr.slice(0, i + 1).join('-'));
  }, [routeInfo?.key]);

  return (
    <Menu
      mode="inline"
      theme={sideNavTheme === SIDE_NAV_LIGHT ? "light" : "dark"}
      style={{ height: "100%", borderInlineEnd: 0 }}
      defaultSelectedKeys={[routeInfo?.key]}
      defaultOpenKeys={defaultOpenKeys}
      className={hideGroupTitle ? "hide-group-title" : ""}
      items={menuItems}
    />
  );
};

const TopNavContent = () => {
  const topNavColor = useSelector(state => state.theme.topNavColor);

  const menuItems = useMemo(() => {
    const navTree = navigationConfig();
    return getNavMenuItems(navTree, 'top');
  }, []);

  return (
    <Menu
      mode="horizontal"
      style={{ backgroundColor: topNavColor }}
      items={menuItems}
    />
  );
};

const MenuContent = (props) => {
  return props.type === NAV_TYPE_SIDE ? (
    <SideNavContent {...props} />
  ) : (
    <TopNavContent {...props} />
  );
};

export default MenuContent;