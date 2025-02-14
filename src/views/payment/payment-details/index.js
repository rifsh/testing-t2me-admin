import React, { useEffect } from "react";
import { Card, Row, Col, Typography, Image, Alert } from "antd";
import Loading from "components/shared-components/Loading";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { getSinglePayment, clearSinglePayment } from "store/slices/paymentSlice";

const { Title, Text } = Typography;

const PaymentDetails = () => {
    const dispatch = useDispatch();
    const { paymentId } = useParams();
    const { singlePayment, loading, error } = useSelector((state) => state.payment);

    useEffect(() => {
        console.log('Requesting Payment ID:', paymentId);
        
        if (paymentId) {
            dispatch(getSinglePayment(paymentId));
        }
        return () => {
            dispatch(clearSinglePayment());
        };
    }, [dispatch, paymentId]);

    useEffect(() => {
        console.log('Current Payment State:', { singlePayment, loading, error });
    }, [singlePayment, loading, error]);

    if (loading) return <Loading />;
    
    if (error) return (
        <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ margin: 20 }}
        />
    );
    
    if (!singlePayment) return (
        <Alert
            message="No Payment Details Found"
            description="The requested payment could not be found. Please check the payment ID and try again."
            type="info"
            showIcon
            style={{ margin: 20 }}
        />
    );

    const { jsonData } = singlePayment;

    return (
        <Row gutter={[16, 16]} style={{ padding: "20px" }}>
            <Col span={24}>
        <Card bordered={false}>
          <Title level={2} style={{ margin: "10px 0" }}>
            {jsonData?.place_name || "N/A"}
          </Title>
          <Text>{jsonData?.event || "N/A"}</Text>
        </Card>
      </Col>

      <Col span={24}>
        <Card 
          title={<span style={{ color: "#1890ff" }}>Add-on Services</span>} 
          bordered={false}
        >
          <Row gutter={[16, 16]}>
            {jsonData?.service_adons?.length > 0 ? (
              jsonData.service_adons.map((service, index) => (
                <Col span={8} key={index}>
                  <Card>
                    <div style={{ textAlign: 'center' }}>
                      <Image
                        src={service.logo}
                        alt={service.name}
                        height={100}
                        style={{ objectFit: "contain" }}
                      />
                      <Title level={4} style={{ marginTop: 16 }}>
                        {service.name}
                      </Title>
                      {service.type && (
                        <Text type="secondary">{service.type}</Text>
                      )}
                    </div>
                  </Card>
                </Col>
              ))
            ) : (
              <Col span={24}>
                <Alert message="No add-on services available" type="info" />
              </Col>
            )}
          </Row>
        </Card>
      </Col>

      <Col span={24}>
        <Card 
          title={<span style={{ color: "#1890ff" }}>Payment Methods</span>} 
          bordered={false}
        >
          <Row gutter={[16, 16]}>
            {jsonData?.payment_logos?.length > 0 ? (
              jsonData.payment_logos.map((payment, index) => (
                <Col span={8} key={index}>
                  <Card>
                    <div style={{ textAlign: 'center' }}>
                      <Image
                        src={payment.logo}
                        alt={payment.name}
                        height={100}
                        style={{ objectFit: "contain", height:50 }}
                      />
                      <Title level={4} style={{ marginTop: 16 }}>
                        {payment.name}
                      </Title>
                      {payment.type && (
                        <Text type="secondary">{payment.type}</Text>
                      )}
                    </div>
                  </Card>
                </Col>
              ))
            ) : (
              <Col span={24}>
                <Alert message="No payment methods available" type="info" />
              </Col>
            )}
          </Row>
        </Card>
      </Col>
    </Row>
    );
};

export default PaymentDetails;