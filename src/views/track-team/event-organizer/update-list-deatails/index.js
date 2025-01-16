import React from "react";
import { UserOutlined } from "@ant-design/icons";

const DummyDataExample = () => {
  const dummyData = [
    {
      id: 1,
      img: "https://via.placeholder.com/100",
      name: "John Doe",
      title: "Software Engineer",
      role: "Frontend Developer",
    },
    {
      id: 2,
      img: null, // No image for this user
      name: "Jane Smith",
      title: "Project Manager",
      role: "Team Lead",
    },
    {
      id: 3,
      img: "https://via.placeholder.com/100",
      name: "Alice Brown",
      title: "UI/UX Designer",
      role: "Creative Head",
    },
  ];

  return (
    <div>
      {dummyData.map((record) => (
        <div
          key={record.id}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "16px",
            border: "1px solid #ddd",
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          {record.img ? (
            <img
              src={record.img}
              alt={record.name}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                objectFit: "cover",
                marginRight: "16px",
              }}
            />
          ) : (
            <UserOutlined
              style={{
                fontSize: "50px",
                color: "#aaa",
                marginRight: "16px",
              }}
            />
          )}
          <div>
            <h3 style={{ margin: 0 }}>{record.name}</h3>
            <p style={{ margin: 0, color: "#555" }}>{record.title}</p>
            <p style={{ margin: 0, color: "#888" }}>{record.role}</p>
          </div>
        </div>
      ))}
      
    </div>
  );
};

export default DummyDataExample;

//        <CommentShowModal 
//       title= "Comments"
//       warningMessage="gwdhufbhjdnkfkjads"
//       visible={}
//       onSubmit={}
//       onCancel={}
//       comment={}
//       setComment={}
//       loading={}

      
//       /> 