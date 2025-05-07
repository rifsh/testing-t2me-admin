import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Grid } from "antd";
import IntlMessage from "../util-components/IntlMessage";
import Icon from "../util-components/Icon";
import navigationConfig from "configs/NavigationConfig";
import { useSelector, useDispatch } from "react-redux";
import { SIDE_NAV_LIGHT, NAV_TYPE_SIDE } from "constants/ThemeConstant";
import utils from "utils";
import { onMobileNavToggle } from "store/slices/themeSlice";

const { useBreakpoint } = Grid;

const MenuItem = ({ title, icon, path }) => {
  const dispatch = useDispatch();
  const isMobile = !utils.getBreakPoint(useBreakpoint()).includes("lg");

  const closeMobileNav = () => {
    if (isMobile) {
      dispatch(onMobileNavToggle(false));
    }
  };

  return (
    <>
      {icon && <Icon type={icon} />}
      <span>
        <IntlMessage id={title} />
      </span>
      {path && <Link onClick={closeMobileNav} to={path} />}
    </>
  );
};

const getNavMenuItems = (navItem, type = "side") =>
  navItem.map((nav) => ({
    key: nav.key,
    label: (
      <MenuItem
        title={nav.title}
        {...(nav.isGroupTitle ? {} : { path: nav.path, icon: nav.icon })}
      />
    ),
    ...(nav.isGroupTitle && type === "side" ? { type: "group" } : {}),
    ...(nav.submenu?.length > 0
      ? { children: getNavMenuItems(nav.submenu, type) }
      : {}),
  }));

const SideNavContent = (props) => {
  const { hideGroupTitle, sideNavTheme = SIDE_NAV_LIGHT } = props;
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [openKeys, setOpenKeys] = useState([]);

  const menuItems = useMemo(() => {
    const navTree = navigationConfig();
    return getNavMenuItems(navTree, "side");
  }, []);

  // const defaultOpenKeys = useMemo(() => {
  //   if (!routeInfo?.key) return [];
  //   return routeInfo.key.split('-').map((_, i, arr) => arr.slice(0, i + 1).join('-'));
  // }, [routeInfo?.key]);

  const findActiveMenu = (items, path) => {
    for (const item of items) {
      if (item.path === path) return item;
      if (item.submenu) {
        const found = findActiveMenu(item.submenu, path);
        if (found) return found;
      }
    }
    return null;
  };
  useEffect(() => {
    const activeMenu = findActiveMenu(navigationConfig(), location.pathname);

    if (activeMenu) {
      setSelectedKeys([activeMenu.key]);
      const keys = activeMenu.key.split("-");
      const parentKeys = keys
        .slice(0, -1)
        .map((_, index) => keys.slice(0, index + 1).join("-"));
      setOpenKeys(parentKeys);
    }
  }, [location.pathname]);

  return (
    // <Menu
    //   mode="inline"
    //   theme={sideNavTheme === SIDE_NAV_LIGHT ? "light" : "dark"}
    //   style={{ height: "100%", borderInlineEnd: 0 }}
    //   defaultSelectedKeys={[routeInfo?.key]}
    //   defaultOpenKeys={defaultOpenKeys}
    //   className={hideGroupTitle ? "hide-group-title" : ""}
    //   items={menuItems}
    // />

    <Menu
      mode="inline"
      theme={sideNavTheme === SIDE_NAV_LIGHT ? "light" : "dark"}
      style={{ height: "100%", borderInlineEnd: 0 }}
      selectedKeys={selectedKeys}
      openKeys={openKeys}
      onOpenChange={setOpenKeys}
      className={hideGroupTitle ? "hide-group-title" : ""}
      items={menuItems}
    />
  );
};

const TopNavContent = () => {
  const topNavColor = useSelector((state) => state.theme.topNavColor);

  const menuItems = useMemo(() => {
    const navTree = navigationConfig();
    return getNavMenuItems(navTree, "top");
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
