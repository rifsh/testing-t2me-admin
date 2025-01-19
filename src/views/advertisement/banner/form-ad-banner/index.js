import Flex from "components/shared-components/Flex";
import React, { useEffect } from "react";
import { Tabs, Form } from "antd";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import AdBannerFormFields from "../components/AdBannerFormFields";
import { useSelector } from "react-redux";

const ADD = "ADD";
const EDIT = "EDIT";

const AdBannerForm = ({ mode , id }) => {
  const { filteredAdBanner } = useSelector((state) => state.advertisement);
  console.log(id);
  let bannerData;
  if (filteredAdBanner&&filteredAdBanner.length>0) {
    const numericBannerId = parseInt(id, 10);
    const foundData = filteredAdBanner.find(banner => banner.id === numericBannerId);
    bannerData=foundData;
    console.log(bannerData,"FOUND DATA------------");
  }else{
    console.log('filteredAdBanner is empty or undefined.');
  }

  return (
    <Form
      layout="vertical"
      name="category-form"
      className="ant-advanced-search-form"
    >
      <PageHeaderAlt className="border-bottom" overlap>
        <div className="container">
          <Flex
            className="py-2"
            mobileFlex={false}
            justifyContent="space-between"
            alignItems="center"
          >
            <h2 className="mb-3">
              {mode === ADD ? "Add New Banner" : "Edit Banner"}
            </h2>
          </Flex>
        </div>
      </PageHeaderAlt>
      <div className="container">
        <Tabs
          style={{ marginTop: 30 }}
          items={[
            {
              label: "Banner",
              key: "banner",
              children: <AdBannerFormFields mode={mode} banner={bannerData} />,
            },
            
          ]}
        />
      </div>
    </Form>
  );
};

export default AdBannerForm;
