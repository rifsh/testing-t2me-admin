// import { Form, Input, Button } from "antd";
// import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

// const formItemLayout = {
//   labelCol: {
//     xs: { span: 55 },
//     sm: { span: 6 }, 
//   },
//   wrapperCol: {
//     xs: { span: 55 },
//     sm: { span: 18 }, 
//   },
// };

// const formItemLayoutWithOutLabel = {
//   wrapperCol: {
//     xs: { span: 55 },
//     sm: { span: 18, offset: 6 }, 
//   },
// };

// const DynamicFieldSet = () => {
//   const onFinish = (values) => {
//     console.log("Received values of form:", values);
//   };

//   return (
//     <Form
//       name="dynamic_form_item"
//       {...formItemLayoutWithOutLabel}
//       onFinish={onFinish}
//     //   style={{ maxWidth: 600, margin: "0 auto" }}   
//     >
//       <Form.List name="names">
//         {(fields, { add, remove }) => {
//           return (
//             <div>
//               {fields.map((field, index) => (
//                 <Form.Item
//                   {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
//                   label={index === 0 ? "Passengers" : ""}
//                   required={false}
//                   key={field.key}
//                 >
//                   <div style={{ display: "flex", alignItems: "center" }}>
//                     <Form.Item
//                       {...field}
//                       validateTrigger={["onChange", "onBlur"]}
//                       rules={[
//                         {
//                           required: true,
//                           whitespace: true,
//                           message:
//                             "Please input passenger's name or delete this field.",
//                         },
//                       ]}
//                       noStyle
//                     >
//                       <Input
//                         placeholder="Passenger name"
                      
//                       />
//                     </Form.Item>
//                     {fields.length > 1 ? (
//                       <MinusCircleOutlined
//                         className="dynamic-delete-button"
//                         onClick={() => {
//                           remove(field.name);
//                         }}
//                       />
//                     ) : null}
//                   </div>
//                 </Form.Item>
//               ))}
//               <Form.Item>
//                 <Button
//                   type="dashed"
//                   onClick={() => {
//                     add();
//                   }}
//                   style={{ width: "100%" }}
//                 >
//                   <PlusOutlined /> Add field
//                 </Button>
//               </Form.Item>
//             </div>
//           );
//         }}
//       </Form.List>

//       <Form.Item>
//         <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
//           Submit
//         </Button>
//       </Form.Item>
//     </Form>
//   );
// };

// export default DynamicFieldSet;
