import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  LockOutlined,
  MailOutlined,
  UserOutlined,
  PhoneOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Alert, Upload, Space,
  Typography,
  Modal,
  Spin,
} from "antd";
import {
  signUp,
  showAuthMessage,
  showLoading,
  hideAuthMessage,
  verifyOtp,
  ResendOtp,
  TermsCondition,
} from "store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useParams, useLocation } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";

const { Text } = Typography;

const rules = {
  username: [
    {
      required: true,
      message: "Please input your username",
    },
  ],
  email: [
    {
      required: true,
      message: "Please input your email address",
    },
    {
      type: "email",
      message: "Please enter a valid email!",
    },
  ],
  password: [
    {
      required: true,
      message: "Please input your password",
    },
  ],
  confirm: [
    {
      required: true,
      message: "Please confirm your password!",
    },
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (!value || getFieldValue("password") === value) {
          return Promise.resolve();
        }
        return Promise.reject("Passwords do not match!");
      },
    }),
  ],
  phone: [
    {
      required: true,
      message: "Please input your phone number",
    },
  ],
  thumbnail_image: [
    {
      required: true,
      message: "Please upload your profile picture",
    },
  ],
  otp: [
    {
      required: true,
      message: "Please enter the 6-digit OTP",
    },
    {
      len: 6,
      message: "OTP must be 6 digits",
    },
    {
      pattern: /^[0-9]*$/,
      message: "OTP can only contain numbers",
    },
  ],
};

export const RegisterForm = (props) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments[pathSegments.length - 1];

  useEffect(() => {
    console.log("Extracted User ID from URL:", id); // Debugging
  }, [id]);

  const {
    signUp,
    showLoading,
    token,
    loading,
    redirect,
    message,
    showMessage,
    hideAuthMessage,
    allowRedirect = true,
  } = props;
  const {
    termsConditionData,
    termsLoading,
  } = useSelector((state) => state.auth) || {};
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [showOtpField, setShowOtpField] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [formValues, setFormValues] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsLoadError, setTermsLoadError] = useState(false);

  const navigate = useNavigate();


  useEffect(() => {
    dispatch(TermsCondition())
    .unwrap()
    .catch(() => {
      setTermsLoadError(true);
    });
  }, [dispatch]);

  console.log(
    termsConditionData,
    "THIS IS THE DATA IN UI ><><><><><><><><><><><>"
  );

  const handleSignUpClick = () => {
    form
      .validateFields()
      .then((values) => {
        setFormValues(values);

        // If terms haven't been loaded yet, try loading them again
        if (!termsConditionData && !termsLoading) {
          console.log("CALED AGAIN >>>>>>>>>>>>>>>>> ");

          dispatch(TermsCondition())
          .unwrap()
          .catch(() => {
            setTermsLoadError(true);
          });
        }

        setTermsModalVisible(true);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleTermsModalOk = () => {
    setTermsModalVisible(false);
    setTermsAccepted(true);


    if (formValues) {
      processRegistration(formValues);
    }
  };

  const handleTermsModalCancel = () => {
    setTermsModalVisible(false);
  };

  const processRegistration = (values) => {
    const { confirm, ...registrationData } = values;

    showLoading();
    
    const updatedRegistrationData = {
      ...registrationData,
      lead_uid: id,
      term: true,
    };

    setRegisteredUser(updatedRegistrationData);

    console.log("Sending registration data:", updatedRegistrationData); // Debug log

    signUp(updatedRegistrationData)
      .then((response) => {
        console.log("Registration response:", response); // Debug log

        if (response && response.payload && response.payload.status) {
          // Registration was successful
          setShowOtpField(true);
          startResendTimer();
        } else {
          // Handle unexpected response structure
          console.log("Unexpected response structure:", response);
          showAuthMessage(
            "Registration failed due to an unexpected response format."
          );
        }
      })
      .catch((error) => {
        console.log("Registration failed:", error);
        showAuthMessage("Registration failed. Please try again.");
      });
  };

  const verifyotp = () => {
    form.validateFields(["otp"]).then((values) => {
      showLoading();

      dispatch(
        verifyOtp({
          email: registeredUser.email,
          otp: values.otp,
          phone: registeredUser.phone,
          terms_accepted: termsAccepted,
        })
      )
        .unwrap()
        .then((response) => {
          console.log("OTP verified successfully:", response);
          navigate(`${APP_PREFIX_PATH}/login`);
        })
        .catch((error) => {
          console.error("OTP verification failed:", error);
          showAuthMessage("Invalid OTP. Please try again.");
        });
    });
  };

  const startResendTimer = () => {
    setOtpResendTimer(60); // 60 seconds countdown
  };

  const handleResendOtp = () => {
    dispatch(
      ResendOtp({
        email: registeredUser.email,
        terms_accepted: termsAccepted,
      })
    )
      .unwrap()
      .then(() => {
        startResendTimer(); // Start the resend timer
      })
      .catch((error) => {
        console.error("Failed to resend OTP:", error);
        showAuthMessage("Failed to resend OTP. Please try again.");
      });
  };

  useEffect(() => {
    let timerId;
    if (otpResendTimer > 0) {
      timerId = setTimeout(() => setOtpResendTimer(otpResendTimer - 1), 1000);
    }
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [otpResendTimer]);

  useEffect(() => {
    if (token !== null && allowRedirect && !showOtpField) {
      navigate(redirect);
    }
    if (showMessage) {
      const timer = setTimeout(() => hideAuthMessage(), 3000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [
    token,
    allowRedirect,
    redirect,
    showMessage,
    navigate,
    hideAuthMessage,
    showOtpField,
  ]);
  console.log("=========compomemt==========================");
  console.log(
    "=========compomemt==========================",
    termsConditionData
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, marginBottom: 0 }}
        animate={{
          opacity: showMessage ? 1 : 0,
          marginBottom: showMessage ? 20 : 0,
        }}
      >
        <Alert type="error" showIcon message={message}></Alert>
      </motion.div>

      {!showOtpField ? (
        // Initial Registration Form
        <Form form={form} layout="vertical" name="register-form">
          <Form.Item
            name="username"
            label="Username"
            rules={rules.username}
            hasFeedback
          >
            <Input prefix={<UserOutlined className="text-primary" />} />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={rules.email} hasFeedback>
            <Input prefix={<MailOutlined className="text-primary" />} />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={rules.password}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined className="text-primary" />}
            />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="Confirm Password"
            rules={rules.confirm}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined className="text-primary" />}
            />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={rules.phone}
            hasFeedback
          >
            <Input prefix={<PhoneOutlined className="text-primary" />} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              onClick={handleSignUpClick}
              block
              loading={loading}
            >
              Sign Up
            </Button>
          </Form.Item>
        </Form>
      ) : (
        // OTP Verification Form
        <Form
          form={form}
          layout="vertical"
          name="otp-verification-form"
          onFinish={verifyotp}
        >
          <Alert
            message="Verification Required"
            description={`A 6-digit OTP has been sent to your phone number ${registeredUser?.phone} and email ${registeredUser?.email}. Please enter it below to verify your account.`}
            type="info"
            showIcon
            style={{ marginBottom: 20 }}
          />
          <Form.Item
            name="otp"
            label="Enter 6-digit OTP"
            rules={rules.otp}
            hasFeedback
          >
            <Input maxLength={6} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="link"
                disabled={otpResendTimer > 0}
                onClick={handleResendOtp}
              >
                Resend OTP
              </Button>
              {otpResendTimer > 0 && (
                <Text type="secondary">
                  Resend available in {otpResendTimer}s
                </Text>
              )}
            </Space>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Verify & Complete Registration
            </Button>
          </Form.Item>
        </Form>
      )}

      {/* Terms and Conditions Modal */}
      <Modal
        title="Terms and Conditions"
        open={termsModalVisible}
        onOk={handleTermsModalOk}
        onCancel={handleTermsModalCancel}
        footer={[
          <Button key="cancel" onClick={handleTermsModalCancel}>
            Cancel
          </Button>,
          <Button key="accept" type="primary" onClick={handleTermsModalOk}>
            I Accept
          </Button>,
        ]}
      >
        <div style={{ maxHeight: "300px", overflow: "auto" }}>
          {termsLoading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spin tip="Loading terms and conditions..." />
            </div>
          ) : termsLoadError ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Alert
                message="Error"
                description="Failed to load terms and conditions. Please try again later."
                type="error"
                showIcon
              />
            </div>
          ) : termsConditionData ? (
            <div>
              {/* Render the introduction */}
              <p>{termsConditionData.introduction}</p>

              {/* Render each section */}
              {termsConditionData.sections.map((section, index) => (
                <div key={index}>
                  <h4>{section.title}</h4>
                  <p>{section.content}</p>
                </div>
              ))}

              {/* Render the contact information */}
              <p>{termsConditionData.contact}</p>
            </div>
          ) : (
            <div>
              <h3>Terms of Service</h3>
              <p>
                Terms and conditions are currently unavailable. Please try again
                later.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

const mapStateToProps = ({ auth }) => {
  const { loading, message, showMessage, token, redirect } = auth;
  return { loading, message, showMessage, token, redirect };
};

const mapDispatchToProps = {
  signUp,
  showAuthMessage,
  hideAuthMessage,
  showLoading,
};

export default connect(mapStateToProps, mapDispatchToProps)(RegisterForm);
