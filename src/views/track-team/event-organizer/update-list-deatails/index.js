import React, { useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import { Button, Row, Col, Card, Typography } from "antd";
import CommentShowModal from "components/util-components/ModalItems/CommentShowModal";

const { Title, Text } = Typography;

const DummyDataExample = () => {
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);

  const handleSubmitComment = () => {
    // Handle comment submission logic here
  };

  const dummyCurrentData = [
    {
      id: 1,
    //  img: "https://via.placeholder.com/100",
      name: "Shaheen",
      title: "Dubai Fest",
      role: "Organizer",
      status: true,
      date: "2025-01-16",
      time: "03:00 PM",
      eventLocation: "Dubai, UAE",
    },

  ];

  const dummyEditedData = [
    {
      id: 1,
     // img: "https://via.placeholder.com/100",
      name: "Shaheen",
      title: "Dubai eve",
      role: "Organizer",
      status: false,
      date: "2025-01-16",
      time: "10:00 PM",
      eventLocation: "Dubai, UAE",
    },
  ];

  return (
    <div>
      {/* Main container to display both columns */}
      <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
        {/* Displaying Current Data */}
        <Col span={12}>
          <Title level={4}>Current Data</Title>
          {dummyCurrentData.map((record) => (
            <Card key={record.id} style={{ marginBottom: "16px" }}>
              <Row gutter={[16, 16]} align="middle">
                <Col>
                  {record.img ? (
                    <img
                      src={record.img}
                      alt={record.name}
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <UserOutlined
                      style={{
                        fontSize: "80px",
                        color: "#aaa",
                      }}
                    />
                  )}
                </Col>
                <Col>
                  <Title level={5}>{record.name}</Title>
                  <Text strong>Event: </Text>
                  <Text>{record.title}</Text>
                  <br />
                  <Text strong>Date: </Text>
                  <Text>{record.date}</Text>
                  <br />
                  <Text strong>Time: </Text>
                  <Text>{record.time}</Text>
                  <br />
                  <Text strong>Location: </Text>
                  <Text>{record.eventLocation}</Text>
                </Col>
              </Row>
            </Card>
          ))}
        </Col>

        {/* Displaying Edited Data */}
        <Col span={12}>
          <Title level={4}>Edited Data</Title>
          {dummyEditedData.map((record) => (
            <Card key={record.id} style={{ marginBottom: "16px" }}>
              <Row gutter={[16, 16]} align="middle">
                <Col>
                  {record.img ? (
                    <img
                      src={record.img}
                      alt={record.name}
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <UserOutlined
                      style={{
                        fontSize: "80px",
                        color: "#aaa",
                      }}
                    />
                  )}
                </Col>
                <Col>
                  <Title level={5}>{record.name}</Title>
                  <Text strong>Event: </Text>
                  <Text>{record.title}</Text>
                  <br />
                  <Text strong>Date: </Text>
                  <Text>{record.date}</Text>
                  <br />
                  <Text strong>Time: </Text>
                  <Text>{record.time}</Text>
                  <br />
                  <Text strong>Location: </Text>
                  <Text>{record.eventLocation}</Text>
                </Col>
              </Row>
            </Card>
          ))}
        </Col>
      </Row>

      {/* Button container below both columns */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
        <Button
          size="large"
          className="text-primary"
          onClick={() => setIsCommentModalVisible(true)}
          style={{ marginBottom: "8px" }}
        >
          Comments
        </Button>
        <Button
          size="large"
          className="text-primary"
          onClick={() => setIsRejectModalVisible(true)}
          style={{ marginBottom: "8px", marginInline: "10px" }}
        >
          Reject
        </Button>
        <Button
          size="large"
          className="text-primary"
          onClick={() => setIsApproveModalVisible(true)}
          style={{ marginBottom: "8px" }}
        >
          Approve
        </Button>
      </div>

      {/* Comment Modal */}
      <div>
        <CommentShowModal
          visible={isCommentModalVisible}
          onSubmit={handleSubmitComment}
          onCancel={() => setIsCommentModalVisible(false)}
          loading={false}
          comment={comment}
          setComment={setComment}
          title={"Reassignment Comment"}
          warningMessage={"Please provide a reason for reassigning the ticket."}
        />
      </div>
    </div>
  );
};

export default DummyDataExample;





// // import React, { useState } from "react";
// // import { UserOutlined } from "@ant-design/icons";
// // import CommentShowModal from "components/util-components/ModalItems/CommentShowModal";
// // import { Button } from "antd";

// // const DummyDataExample = () => {
// //   const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
// //   const [comment, setComment] = useState('');
// //   const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
// //   const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
// //   const [, ] = useState(false);

// //   const handleSubmitComment = () => {
// //     // Handle comment submission logic here
// //   };

// //   const dummyCurrentData = [
// //     {
// //       id: 1,
// //       img: "https://via.placeholder.com/100",
// //       name: "Shaheen",
// //       title: "Dubai Fest",
// //       role: "",
// //       status: true,
// //     },
// //   ];

// //   const dummyEditedData = [
// //     {
// //       id: 1,
// //       img: "https://via.placeholder.com/100",
// //       name: "Shaheen",
// //       title: "Dubai eve",
// //       role: "",
// //       status: false,
// //     },
// //   ];

// //   return (
// //     <div>
// //       {/* Main container to display both columns */}
// //       <div style={{ display: "flex", justifyContent: "space-between" }}>
// //         {/* Displaying Current Data */}
// //         <div style={{ flex: 1 }}>
// //           <h4>Current Data</h4>
// //           {dummyCurrentData.map((record) => (
// //             <div
// //               key={record.id}
// //               style={{
// //                 display: "flex",
// //                 alignItems: "center",
// //                 marginBottom: "16px",
// //                 border: "1px solid #ddd",
// //                 padding: "15px",
// //                 borderRadius: "8px",
// //                 marginRight: "16px",
// //               }}
// //             >
// //               {record.img ? (
// //                 <img
// //                   src={record.img}
// //                   alt={record.name}
// //                   style={{
// //                     width: "50px",
// //                     height: "50px",
// //                     borderRadius: "50%",
// //                     objectFit: "cover",
// //                     marginRight: "16px",
// //                   }}
// //                 />
// //               ) : (
// //                 <UserOutlined
// //                   style={{
// //                     fontSize: "50px",
// //                     color: "#aaa",
// //                     marginRight: "16px",
// //                   }}
// //                 />
// //               )}
// //               <div>
// //                 <h3 style={{ margin: 0 }}>{record.name}</h3>
// //                 <p style={{ margin: 0, color: "#555" }}>{record.title}</p>
// //                 <p style={{ margin: 0, color: "#888" }}>{record.role}</p>
// //               </div>
// //             </div>
// //           ))}
// //         </div>

// //         {/* Displaying Edited Data */}
// //         <div style={{ flex: 1 }}>
// //           <h4>Edited Data</h4>
// //           {dummyEditedData.map((record) => (
// //             <div
// //               key={record.id}
// //               style={{
// //                 display: "flex",
// //                 alignItems: "center",
// //                 marginBottom: "16px",
// //                 border: "1px solid #ddd",
// //                 padding: "15px",
// //                 borderRadius: "8px",
// //               }}
// //             >
// //               {record.img ? (
// //                 <img
// //                   src={record.img}
// //                   alt={record.name}
// //                   style={{
// //                     width: "50px",
// //                     height: "50px",
// //                     borderRadius: "50%",
// //                     objectFit: "cover",
// //                     marginRight: "16px",
// //                   }}
// //                 />
// //               ) : (
// //                 <UserOutlined
// //                   style={{
// //                     fontSize: "50px",
// //                     color: "#aaa",
// //                     marginRight: "16px",
// //                   }}
// //                 />
// //               )}
// //               <div>
// //                 <h3 style={{ margin: 0 }}>{record.name}</h3>
// //                 <p style={{ margin: 0, color: "#555" }}>{record.title}</p>
// //                 <p style={{ margin: 0, color: "#888" }}>{record.role}</p>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       </div>

// //       {/* Button container below both columns */}
// //       <div style={{ display: "flex", justifyContent:"end",flexDirection: "Row", marginTop: "20px" }}>
// //         <Button
// //           size="large"
// //           className="text-primary"
// //           onClick={() => setIsCommentModalVisible(true)}
// //           style={{ marginBottom: "8px" }}
// //         >
// //           Comments
// //         </Button>
// //         <Button
// //           size="large"
// //           className="text-primary"
// //           onClick={() => setIsRejectModalVisible(true)}
// //           style={{ marginBottom: "8px" , marginInline: "10px", }}
          
// //         >
// //           Reject
// //         </Button>
// //         <Button
// //           size="large"
// //           className="text-primary"
// //           onClick={() => setIsApproveModalVisible(true)}
// //           style={{ marginBottom: "8px" }}
// //         >
// //           Approve
// //         </Button>
// //       </div>

// //       {/* Comment Modal */}
// //       <div>
// //         <CommentShowModal
// //           visible={isCommentModalVisible}
// //           onSubmit={handleSubmitComment}
// //           onCancel={() => setIsCommentModalVisible(false)}
// //           loading={false}
// //           comment={comment}
// //           setComment={setComment}
// //           title={'Reassignment Comment'}
// //           warningMessage={'Please provide a reason for reassigning the ticket.'}
// //         />
// //       </div>
// //     </div>
// //   );
// // };

// // export default DummyDataExample;


// import React, { useState } from "react";
// import { UserOutlined } from "@ant-design/icons";
// import CommentShowModal from "components/util-components/ModalItems/CommentShowModal";
// import { Button } from "antd";

// const DummyDataExample = () => {
//   const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
//   const [comment, setComment] = useState('');
//   const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
//   const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);

//   const handleSubmitComment = () => {
//     // Handle comment submission logic here
//   };

//   const dummyCurrentData = [
//     {
//       id: 1,
//       img: "https://via.placeholder.com/100",
//       name: "Shaheen",
//       title: "Dubai Fest",
//       role: "Organizer",
//       status: true,
//       date: "2025-01-16",
//       time: "03:00 AM",
//       eventLocation: "Dubai, UAE",
//     },
  
//   ];

//   const dummyEditedData = [
//     {
//       id: 1,
//       img: "https://via.placeholder.com/100",
//       name: "Shaheen",
//       title: "Dubai eve",
//       role: "Organizer",
//       status: false,
//       date: "2025-01-16",
//       time: "10:00 PM",
//       eventLocation: "Dubai, UAE",
//     },
//   ];

//   return (
//     <div>
//       {/* Main container to display both columns */}
//       <div style={{ display: "flex", justifyContent: "space-between" }}>
//         {/* Displaying Current Data */}
//         <div style={{ flex: 1 }}>
//           <h4>Current Data</h4>
//           {dummyCurrentData.map((record) => (
//             <div
//               key={record.id}
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 marginBottom: "16px",
//                 border: "1px solid #ddd",
//                 padding: "15px",
//                 borderRadius: "8px",
//                 marginRight: "16px",
//               }}
//             >
//               {record.img ? (
//                 <img
//                   src={record.img}
//                   alt={record.name}
//                   style={{
//                     width: "50px",
//                     height: "50px",
//                     borderRadius: "50%",
//                     objectFit: "cover",
//                     marginRight: "16px",
//                   }}
//                 />
//               ) : (
//                 <UserOutlined
//                   style={{
//                     fontSize: "50px",
//                     color: "#aaa",
//                     marginRight: "16px",
//                   }}
//                 />
//               )}
//               <div>
//                 <h3 style={{ margin: 0 }}>{record.name}</h3>
//                 <p style={{ margin: 0, color: "#555" }}>{record.title}</p>
//                 <p style={{ margin: 0, color: "#888" }}>{record.role}</p>
//                 <p style={{ margin: 0, color: "#444" }}>Date: {record.date}</p>
//                 <p style={{ margin: 0, color: "#444" }}>Time: {record.time}</p>
//                 <p style={{ margin: 0, color: "#444" }}>Location: {record.eventLocation}</p>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Displaying Edited Data */}
//         <div style={{ flex: 1 }}>
//           <h4>Edited Data</h4>
//           {dummyEditedData.map((record) => (
//             <div
//               key={record.id}
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 marginBottom: "16px",
//                 border: "1px solid #ddd",
//                 padding: "15px",
//                 borderRadius: "8px",
//               }}
//             >
//               {record.img ? (
//                 <img
//                   src={record.img}
//                   alt={record.name}
//                   style={{
//                     width: "50px",
//                     height: "50px",
//                     borderRadius: "50%",
//                     objectFit: "cover",
//                     marginRight: "16px",
//                   }}
//                 />
//               ) : (
//                 <UserOutlined
//                   style={{
//                     fontSize: "50px",
//                     color: "#aaa",
//                     marginRight: "16px",
//                   }}
//                 />
//               )}
//               <div>
//                 <h3 style={{ margin: 0 }}>{record.name}</h3>
//                 <p style={{ margin: 0, color: "#555" }}>{record.title}</p>
//                 <p style={{ margin: 0, color: "#888" }}>{record.role}</p>
//                 <p style={{ margin: 0, color: "#444" }}>Date: {record.date}</p>
//                 <p style={{ margin: 0, color: "#444" }}>Time: {record.time}</p>
//                 <p style={{ margin: 0, color: "#444" }}>Location: {record.eventLocation}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Button container below both columns */}
//       <div style={{ display: "flex", justifyContent: "end", flexDirection: "row", marginTop: "20px" }}>
//         <Button
//           size="large"
//           className="text-primary"
//           onClick={() => setIsCommentModalVisible(true)}
//           style={{ marginBottom: "8px" }}
//         >
//           Comments
//         </Button>
//         <Button
//           size="large"
//           className="text-primary"
//           onClick={() => setIsRejectModalVisible(true)}
//           style={{ marginBottom: "8px", marginInline: "10px" }}
//         >
//           Reject
//         </Button>
//         <Button
//           size="large"
//           className="text-primary"
//           onClick={() => setIsApproveModalVisible(true)}
//           style={{ marginBottom: "8px" }}
//         >
//           Approve
//         </Button>
//       </div>

//       {/* Comment Modal */}
//       <div>
//         <CommentShowModal
//           visible={isCommentModalVisible}
//           onSubmit={handleSubmitComment}
//           onCancel={() => setIsCommentModalVisible(false)}
//           loading={false}
//           comment={comment}
//           setComment={setComment}
//           title={'Reassignment Comment'}
//           warningMessage={'Please provide a reason for reassigning the ticket.'}
//         />
//       </div>
//     </div>
//   );
// };

// export default DummyDataExample;
