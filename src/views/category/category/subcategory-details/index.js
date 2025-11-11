import React, { useEffect } from "react";
import { Card, Row, Col, Typography, Image, Carousel, Alert } from "antd";
import Loading from "components/shared-components/Loading";
import { useDispatch, useSelector } from "react-redux";
import { CDN_PATH } from "configs/AppConfig";
import { useParams } from "react-router-dom";
import { getSingleSubCateory } from "store/slices/categorySlice";

const { Title, Text } = Typography;
// singleCategory
const SubCategoryDetails = () => {
  const dispatch = useDispatch();
  const { subcategoryId } = useParams();
  const { singleSubcategory, loading, error } = useSelector(
    (state) => state.category
  );

  useEffect(() => {
    if (subcategoryId) {
      dispatch(getSingleSubCateory(subcategoryId));
    }
  }, [subcategoryId])

  if (loading) return <Loading />;
  if (error) return <Alert message={`Error: ${error}`} type="error" />;
  if (!singleSubcategory) return <div>No SubCategory Details Found</div>;


  const isNoImage =
    !singleSubcategory.thumbnail_image || singleSubcategory.thumbnail_image === "images";

  return (
    <Row gutter={[16, 16]} style={{ padding: "20px" }}>
      <Col span={24}>
        <Card
          bordered={false}
          cover={
            isNoImage ? (
              <div
                style={{
                  height: 300,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#f0f0f0",
                  color: "#888",
                }}
              >
                No Image
              </div>
            ) : (
              <Image
                alt="SubCategory thumbnail"
                src={`${CDN_PATH}/${singleSubcategory.thumbnail_image}`}
                height={300}
                style={{ objectFit: "cover" }}
              />
            )
          }
        >
          <Title level={2} style={{ margin: "10px 0" }}>
            {singleSubcategory.name}
          </Title>
        </Card>
      </Col>

      <Col span={24}>
        <Card title={<span style={{ color: "#1890ff" }}>SubCategory Overview</span>} bordered={false}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong>Description:</Text> {singleSubcategory.description || "Not Available"}
            </Col>
          </Row>
        </Card>
      </Col>


    </Row>
  );
};

export default SubCategoryDetails;
