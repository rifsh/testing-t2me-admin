// import React, { useEffect } from "react";
// import {
//   Form,
//   Card,
//   Button,
//   Input,
//   Upload,
//   Space,
//   Checkbox,
//   message,
//   Select
// } from "antd";
// import {
//   PlusOutlined,
//   MinusCircleOutlined,
//   UploadOutlined,
// } from "@ant-design/icons";
// import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
// import Flex from "components/shared-components/Flex";
// import DiscardButton from "components/shared-components/Buttons/DiscardButton";
// import { getVenues } from "store/slices/locationSlice";
// import { addPayment } from "store/slices/paymentSlice";
// import { RulesMessageConstants } from "constants/RulesConstant";
// import { fetchAllEvent, setSelectedEvent } from "store/slices/eventSlice";
// import {
//   SupportImageFormat,
//   ResolutionByServices,
// } from "constants/SupportFileConstants";
// import { useDispatch, useSelector } from "react-redux";
// import Utils from "utils/index";
// const { Option } = Select;

// const PaymentFormFields = ({ mode, id }) => {
//   const [form] = Form.useForm();
//   const dispatch = useDispatch();
//   const { filteredEvents = [], loading } = useSelector((state) => state.event);

//   useEffect(() => {
//       dispatch(fetchAllEvent({}));
//     }, [dispatch]);
//     const handleSelectEvent = (id) => {
//       if (!id) return;
//     }
//   const handleSubmit = async () => {
//     const values = form.getFieldsValue();
//     console.log("Form values:", values);
  
//     try {
//       const formData = new FormData();
  
//       formData.append("place_id", form.getFieldValue('venue_id'));
  
//       if (form.getFieldValue('event_id')) {
//         formData.append("event_id", form.getFieldValue('event_id'));
//       }
  
//       if (values.url) {
//         formData.append("terms_and_conditions", values.url);
//       }
  
//       if (values.additional_urls) {
//         formData.append("additional_urls", values.additional_urls);
//       }

//     const qrPayments = form.getFieldValue('qrPayments') || [];
//     const qrDetails = qrPayments.map((qr) => {
//       return {
//         payment_provider: qr.paymentProvider,
//         qr_code: qr.qrCode && qr.qrCode[0]?.uid ? qr.qrCode[0].uid : null, // Extract uid
//         image: qr.qrCode && qr.qrCode[0]?.uid ? qr.qrCode[0].uid : null,//qr.image && qr.image[0]?.uid ? qr.image[0].uid : null, // Extract uid
//       };
//     });
//     formData.append("payment_qr_details", JSON.stringify(qrDetails));

//     const cardPayments = form.getFieldValue('cardPayments') || [];
//     const cardDetails = cardPayments.map((payment) => {
//       return {
//         bank_name: payment.bankName,
//         bank_code: payment.bankCode || '',
//         image: payment.image && payment.image[0]?.uid ? payment.image[0].uid : null, // Extract uid
//         is_debit: payment.cardType?.includes('debit') || false,
//         is_credit: payment.cardType?.includes('credit') || false,
//         is_master: payment.cardType?.includes('master') || false,
//         is_visa: payment.cardType?.includes('visa') || false,
//       };
//     });

//     // Append Card Payments as a JSON string
//     formData.append("payment_methods", JSON.stringify(cardDetails));

//     // Handle Add-On Services
//     const services = values.services || [];
//     const serviceDetails = services.map((service) => {
//       return {
//         service_name: service.name,
//         description: service.description || '',
//          thumbnail_image: service.image && service.image[0]?.uid ? service.image[0].uid : null, // Extract uid
//         // thumbnail_image: service.thumbnail_image && service.thumbnail_image[0]?.uid
//         // ? service.thumbnail_image[0].uid
//         // : null,
//         is_percentage: service.isPercentage || false,
//         percentage_or_amount: service.percentageOrAmount || 0,
//       };
//     });

//     // Append Add-On Services as a JSON string
//     formData.append("add_on_services", JSON.stringify(serviceDetails));
//       console.log("FormData content:");
//       for (let [key, value] of formData.entries()) {
//         console.log("v",key, value);
//       }
  
//       const result = await dispatch(addPayment(formData));
  
//       if (result) {
//         message.success("Payment details added successfully");
//         form.resetFields();
//       }
//     } catch (error) {
//       console.error("Error submitting form:", error);
//       message.error("Failed to add payment details");
//     }
//   };

//   const handleFinishFailed = (errorInfo) => {
//     console.log("Form submission failed:", errorInfo);
//   };

//   return (
//     <Form
//       form={form}
//       layout="vertical"
//       //onFinish={handleSubmit}
//       onFinishFailed={handleFinishFailed}
//     >
//       <Card title="Payment Form">
//         <PlaceWithCountryForm
//           form={form}
//           label="Place"
//           onSelect={(id) => {
//             dispatch(getVenues({ place_id: id }));
//             form.setFieldsValue({ venue_id: id });
//           }}
//           rules={[{ required: true, message: RulesMessageConstants.PLACE }]}
//         />
//         <Form.Item
//         name="event_id"
//         label="Event"
//         rules={[{ required: false, message: "Please select an event" }]}
//       >
//         <Select
//           loading={loading}
//           className="w-100"
//           placeholder="Select an event"
//           onChange={handleSelectEvent}
//           allowClear
//           showSearch
//           filterOption={(input, option) =>
//             option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
//           }
//         >
//           {filteredEvents.map((event) => (
//             <Option key={event.id} value={event.id}>
//               {event.event_name}
//             </Option>
//           ))}
//         </Select>
//       </Form.Item>

//         <Form.Item name="url" label="Terms and Conditions">
//           <Input placeholder="Enter your URL" type="text" />
//         </Form.Item>

//         <Form.Item name="additional_urls" label="Additional Urls">
//           <Input placeholder="Enter your URL" type="text" />
//         </Form.Item>
//       </Card>

      // <Card>
      //   <Form.Item name="services" label="Add-On Services">
      //     <Form.List name="services">
      //       {(fields, { add, remove }) => (
      //         <>
      //           {fields.map(({ key, name, ...restField }) => (
      //             <Space
      //               key={key}
      //               style={{ display: "flex", marginBottom: 8 }}
      //               align="baseline"
      //             >
      //               <Form.Item
      //                 {...restField}
      //                 name={[name, "name"]}
      //               >
      //                 <Input placeholder="Service name" />
      //               </Form.Item>
      //               <Form.Item
      //                 {...restField}
      //                 name={[name, "image"]}
      //                 valuePropName="fileList"
      //                 getValueFromEvent={(e) =>
      //                   Array.isArray(e) ? e : e?.fileList
      //                 }
      //               >
      //                 <Upload
      //                   name="thumbnail_image"
      //                   listType="picture"
      //                   maxCount={1}
      //                   beforeUpload={(file) =>
      //                     Utils.handleBeforeUpload(
      //                       file,
      //                       ResolutionByServices.place
      //                     )
      //                   }
      //                   accept={`.${SupportImageFormat.join(",.")}`}
      //                 >
      //                   <Button icon={<UploadOutlined />}>
      //                     Click to upload
      //                   </Button>
      //                 </Upload>
      //               </Form.Item>
      //               <MinusCircleOutlined onClick={() => remove(name)} />
      //             </Space>
      //           ))}
      //           <Form.Item>
      //             <Button
      //               type="dashed"
      //               onClick={() => add()}
      //               block
      //               icon={<PlusOutlined />}
      //             >
      //               Add Service
      //             </Button>
      //           </Form.Item>
      //         </>
      //       )}
      //     </Form.List>
      //   </Form.Item>
      // </Card>

      // <Card>
      //   <Form.Item name="qrPayments" label="QR Payments">
      //     <Form.List name="qrPayments">
      //       {(fields, { add, remove }) => (
      //         <>
      //           {fields.map(({ key, name, ...restField }) => (
      //             <Space
      //               key={key}
      //               style={{ display: "flex", marginBottom: 8 }}
      //               align="baseline"
      //             >
      //               <Form.Item
      //                 {...restField}
      //                 name={[name, "paymentProvider"]}
      //               >
      //                 <Input placeholder="Payment Provider" />
      //               </Form.Item>
      //               <Form.Item
      //                 {...restField}
      //                 name={[name, "qrCode"]}
      //                 valuePropName="fileList"
      //                 getValueFromEvent={(e) =>
      //                   Array.isArray(e) ? e : e?.fileList
      //                 }
      //               >
      //                 <Upload
      //                   name="qr_code"
      //                   listType="picture"
      //                   maxCount={1}
      //                   beforeUpload={(file) =>
      //                     Utils.handleBeforeUpload(
      //                       file,
      //                       ResolutionByServices.place
      //                     )
      //                   }
      //                   accept={`.${SupportImageFormat.join(",.")}`}
      //                 >
      //                   <Button icon={<UploadOutlined />}>
      //                     Upload QR Code
      //                   </Button>
      //                 </Upload>
      //               </Form.Item>
      //               <MinusCircleOutlined onClick={() => remove(name)} />
      //             </Space>
      //           ))}
      //           <Form.Item>
      //             <Button
      //               type="dashed"
      //               onClick={() => add()}
      //               block
      //               icon={<PlusOutlined />}
      //             >
      //               Add QR Payment
      //             </Button>
      //           </Form.Item>
      //         </>
      //       )}
      //     </Form.List>
      //   </Form.Item>
      // </Card>

      // <Card>
      //   <Form.Item name="cardPayments" label="Add Payment Methods">
      //     <Form.List name="cardPayments">
      //       {(fields, { add, remove }) => (
      //         <>
      //           {fields.map(({ key, name, ...restField }) => (
      //             <Space
      //               key={key}
      //               style={{
      //                 display: "flex",
      //                 flexWrap: "wrap",
      //                 alignItems: "center",
      //                 marginBottom: 8,
      //               }}
      //             >
      //               <Form.Item
      //                 {...restField}
      //                 name={[name, "bankName"]}
      //               >
      //                 <Input placeholder="Bank Name" />
      //               </Form.Item>
      //               <Form.Item
      //                 {...restField}
      //                 name={[name, "cardType"]}
      //               >
      //                 <Checkbox.Group>
      //                   <Checkbox value="debit">Debit Card</Checkbox>
      //                   <Checkbox value="credit">Credit Card</Checkbox>
      //                 </Checkbox.Group>
      //               </Form.Item>
      //               <MinusCircleOutlined onClick={() => remove(name)} />
      //             </Space>
      //           ))}
      //           <Form.Item>
      //             <Button
      //               type="dashed"
      //               onClick={() => add()}
      //               block
      //               icon={<PlusOutlined />}
      //             >
      //               Add Bank & Card Type
      //             </Button>   
      //           </Form.Item>
      //         </>
      //       )}
      //     </Form.List>
      //   </Form.Item>
      // </Card>

//       <Card>
//         <div className="container" style={{ padding: "0px" }}>
//           <Flex className="py-2" mobileFlex={false} justifyContent="flex-end">
//             <DiscardButton form={form} />
//             <div className="mb-3">
//               <Button onClick={() => handleSubmit()} type="primary" htmlType="submit">
//                 Submit
//               </Button>
//             </div>
//           </Flex>
//         </div>
//       </Card>
//     </Form>
    
//   );
// };

// export default PaymentFormFields;

import React, { useEffect, useState } from "react";
import {
  Form,
  Card,
  Button,
  Input,
  Upload,
  Space,
  Checkbox,
  message,
  Select,
  Modal,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import Flex from "components/shared-components/Flex";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import { getVenues } from "store/slices/locationSlice";
import { addPayment } from "store/slices/paymentSlice";
import { RulesMessageConstants } from "constants/RulesConstant";
import { fetchAllEvent, setSelectedEvent } from "store/slices/eventSlice";
import {
  SupportImageFormat,
  ResolutionByServices,
} from "constants/SupportFileConstants";
import { useDispatch, useSelector } from "react-redux";
import Utils from "utils/index";

const { Option } = Select;

const PaymentFormFields = ({ mode, id }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { filteredEvents = [], loading } = useSelector((state) => state.event);

  // State for confirmation modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formValues, setFormValues] = useState(null);

  useEffect(() => {
    dispatch(fetchAllEvent({}));
  }, [dispatch]);

  const handleSelectEvent = (id) => {
    if (!id) return;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log("Form values:", values);

      // Set form values and open confirmation modal
      setFormValues(values);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Validation Failed:", error);
    }
  };

  const handleModalConfirm = async () => {
    if (!formValues) return;

    try {
      const formData = new FormData();

      formData.append("place_id", formValues.venue_id);

      if (formValues.event_id) {
        formData.append("event_id", formValues.event_id);
      }

      if (formValues.url) {
        formData.append("terms_and_conditions", formValues.url);
      }

      if (formValues.additional_urls) {
        formData.append("additional_urls", formValues.additional_urls);
      }

      const qrPayments = formValues.qrPayments || [];
      const qrDetails = qrPayments.map((qr) => ({
        payment_provider: qr.paymentProvider,
        qr_code: qr.qrCode && qr.qrCode[0]?.uid ? qr.qrCode[0].uid : null,
        image: qr.qrCode && qr.qrCode[0]?.uid ? qr.qrCode[0].uid : null,
      }));
      formData.append("payment_qr_details", JSON.stringify(qrDetails));

      const cardPayments = formValues.cardPayments || [];
      const cardDetails = cardPayments.map((payment) => ({
        bank_name: payment.bankName,
        bank_code: payment.bankCode || "",
        image: payment.image && payment.image[0]?.uid ? payment.image[0].uid : null,
        is_debit: payment.cardType?.includes("debit") || false,
        is_credit: payment.cardType?.includes("credit") || false,
        is_master: payment.cardType?.includes("master") || false,
        is_visa: payment.cardType?.includes("visa") || false,
      }));
      formData.append("payment_methods", JSON.stringify(cardDetails));

      const services = formValues.services || [];
      const serviceDetails = services.map((service) => ({
        service_name: service.name,
        description: service.description || "",
        thumbnail_image:
          service.thumbnail_image && service.thumbnail_image[0]?.uid
            ? service.thumbnail_image[0].uid
            : null,
        is_percentage: service.isPercentage || false,
        percentage_or_amount: service.percentageOrAmount || 0,
      }));
      formData.append("add_on_services", JSON.stringify(serviceDetails));

      console.log("FormData content:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const result = await dispatch(addPayment(formData));

      if (result) {
        message.success("Payment details added successfully");
        form.resetFields();
        setIsModalVisible(false); // Close the modal
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Failed to add payment details");
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false); // Close the modal without submitting
  };

  const handleFinishFailed = (errorInfo) => {
    console.log("Form submission failed:", errorInfo);
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinishFailed={handleFinishFailed}
      >
        <Card title="Payment Form">
          <PlaceWithCountryForm
            form={form}
            label="Place"
            onSelect={(id) => {
              dispatch(getVenues({ place_id: id }));
              form.setFieldsValue({ venue_id: id });
            }}
            rules={[{ required: true, message: RulesMessageConstants.PLACE }]}
          />
          <Form.Item
            name="event_id"
            label="Event"
            rules={[{ required: false, message: "Please select an event" }]}
          >
            <Select
              loading={loading}
              className="w-100"
              placeholder="Select an event"
              onChange={handleSelectEvent}
              allowClear
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {filteredEvents.map((event) => (
                <Option key={event.id} value={event.id}>
                  {event.event_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="url" label="Terms and Conditions">
            <Input placeholder="Enter your URL" type="text" />
          </Form.Item>

          <Form.Item name="additional_urls" label="Additional Urls">
            <Input placeholder="Enter your URL" type="text" />
          </Form.Item>
        </Card>

        <Card>
        <Form.Item name="services" label="Add-On Services">
          <Form.List name="services">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "name"]}
                    >
                      <Input placeholder="Service name" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "image"]}
                      valuePropName="fileList"
                      getValueFromEvent={(e) =>
                        Array.isArray(e) ? e : e?.fileList
                      }
                    >
                      <Upload
                        name="thumbnail_image"
                        listType="picture"
                        maxCount={1}
                        beforeUpload={(file) =>
                          Utils.handleBeforeUpload(
                            file,
                            ResolutionByServices.place
                          )
                        }
                        accept={`.${SupportImageFormat.join(",.")}`}
                      >
                        <Button icon={<UploadOutlined />}>
                          Click to upload
                        </Button>
                      </Upload>
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Service
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
      </Card>

      <Card>
        <Form.Item name="qrPayments" label="QR Payments">
          <Form.List name="qrPayments">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "paymentProvider"]}
                    >
                      <Input placeholder="Payment Provider" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "qrCode"]}
                      valuePropName="fileList"
                      getValueFromEvent={(e) =>
                        Array.isArray(e) ? e : e?.fileList
                      }
                    >
                      <Upload
                        name="qr_code"
                        listType="picture"
                        maxCount={1}
                        beforeUpload={(file) =>
                          Utils.handleBeforeUpload(
                            file,
                            ResolutionByServices.place
                          )
                        }
                        accept={`.${SupportImageFormat.join(",.")}`}
                      >
                        <Button icon={<UploadOutlined />}>
                          Upload QR Code
                        </Button>
                      </Upload>
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add QR Payment
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
      </Card>

      <Card>
        <Form.Item name="cardPayments" label="Add Payment Methods">
          <Form.List name="cardPayments">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "bankName"]}
                    >
                      <Input placeholder="Bank Name" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "cardType"]}
                    >
                      <Checkbox.Group>
                        <Checkbox value="debit">Debit Card</Checkbox>
                        <Checkbox value="credit">Credit Card</Checkbox>
                      </Checkbox.Group>
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Bank & Card Type
                  </Button>   
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
      </Card>

        <Card>
          <div className="container" style={{ padding: "0px" }}>
            <Flex className="py-2" mobileFlex={false} justifyContent="flex-end">
              <DiscardButton form={form} />
              <div className="mb-3">
                <Button
                  onClick={handleSubmit}
                  type="primary"
                  htmlType="submit"
                >
                  Submit
                </Button>
              </div>
            </Flex>
          </div>
        </Card>
      </Form>

      {/* Confirmation Modal */}
      <Modal
        title="Confirm Submission"
        visible={isModalVisible}
        onOk={handleModalConfirm}
        onCancel={handleModalCancel}
        okText="Confirm"
        cancelText="Cancel"
      >
        <p>Are you sure you want to submit the form?</p>
      </Modal>
    </>
  );
};

export default PaymentFormFields;