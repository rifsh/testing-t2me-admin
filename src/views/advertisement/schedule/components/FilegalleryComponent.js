import React, { useEffect } from 'react';
import { Card, Pagination } from 'antd';
import { FileImageOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { fetchAdBanner, fetchAdBanners } from 'store/slices/advertisementSlice';
import { fetchAdCategories } from "store/slices/adCategorySlice";
const FileGallery = ({ onDragStart, onDragEnd }) => {
  const dispatch = useDispatch();
  const {
    filteredAdBanner,
    pagination,
    loading
  } = useSelector((state) => state.advertisement);

  const {
    adCategories,
  
    subPagination,
    
    editable_status,
    message: responseMessage,
  } = useSelector((state) => state.adCategory);
  const handlePagination = (page, size) => {
    dispatch(fetchAdBanners({ page, size }));
  };
  const preventFormSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };
  useEffect(() => {
    // dispatch(fetchAdCategories());
  }, [dispatch]);

  const renderMedia = (mediaPath) => {
    const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaPath);
    return isVideo ? (
      <video
        src={mediaPath}
        style={{
          width: "70%",
          height: "70%",
          objectFit: "cover",
        }}
        muted
        playsInline
      />
    ) : (
      <img
        src={mediaPath}
        alt="Image Thumbnail"
        style={{
          width: "70%",
          height: "70%",
          objectFit: "cover",
        }}
      />
    );
  };

  return (
    <Card title="File Gallery" className="h-full" onKeyDown={ preventFormSubmit }>
      <SearchBarWithStatus
        fetchFunction={fetchAdBanners}
        isStatus={false}

        // ADD FILTERATION FUNCTION AFTER API COMPLETED

        additionalFilters={[
          {
            options: adCategories,
            placeholder: "Please choose a Category",
            formName: "ad_category_id",
            isAutoComplete: true,
            onClick: () => {
              dispatch(fetchAdCategories({}));
            },
          },
        ]}

        // ADD FILTERATION FUNCTION AFTER API COMPLETED

      />
       {/* <SearchBarWithStatus fetchFunction={fetchAdBanner} /> */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: "16px",
          marginBottom: "16px"
        }}
      >
        {filteredAdBanner.map((banner) => (
          <div
            key={banner.id}
            draggable={true}
            onDragStart={(e) => onDragStart(e, banner)}
            onDragEnd={onDragEnd}
            className="p-2 border rounded cursor-move hover:bg-gray-50"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              height: "150px",
              width: "100%",
            }}
          >
            <div className="d-flex align-items-center mb-2">
              <FileImageOutlined className="me-2" />
              <span className="text-sm">{banner.name}</span>
            </div>
            {renderMedia(banner.media_path)}
          </div>
        ))}
      </div>
      <Pagination
        current={pagination.page ?? 1}
        pageSize={pagination.size ?? 10}
        total={pagination.total}
        onChange={handlePagination}
        showSizeChanger
      />
    </Card>
  );
};

export default FileGallery;