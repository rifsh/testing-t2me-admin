import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import navigationConfig from "configs/NavigationConfig";
import IntlMessage from 'components/util-components/IntlMessage';

const AppBreadcrumb = () => {
  const location = useLocation();

  const breadcrumbData = useMemo(() => {
    const data = { 
      '/app': <IntlMessage id="home" />
    };

    const processNavItem = (item) => {
      data[item.path] = <IntlMessage id={item.title} />;
      if (item.submenu && item.submenu.length > 0) {
        item.submenu.forEach(processNavItem);
      }
    };

    const navTree = navigationConfig();
    navTree.forEach(processNavItem);

    return data;
  }, []);

  const pathSnippets = location.pathname.split('/').filter(i => i);
  const breadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    return {
      title: <Link to={url}>{breadcrumbData[url]}</Link>
    }
  });

  return <Breadcrumb items={breadcrumbItems} />;
};

export default AppBreadcrumb;