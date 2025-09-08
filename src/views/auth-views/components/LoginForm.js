import React, { useEffect } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { Button, Form, Input, Divider, Alert } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { GoogleSVG, FacebookSVG } from "assets/svg/icon";
import CustomIcon from "components/util-components/CustomIcon";
import {
  signIn,
  showLoading,
  showAuthMessage,
  hideAuthMessage,
  signInWithGoogle,
  signInWithFacebook,
  getUserdata,
} from "store/slices/authSlice";
import { getTenantCoutry } from "store/slices/locationSlice";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  APP_CURRENT_VERSION,
  BUILD_TIMESTAMP,
  BUILD_COMMIT,
} from "configs/VersionConfig";
import GenericDropdown from "views/theater/components/GenericDropdown";
import { TENANT_SCHEMA } from "constants/AuthConstant";

export const LoginForm = (props) => {
  const navigate = useNavigate();

  const { tenant_country } = useSelector((state) => state.locations);
  const {
    otherSignIn,
    showForgetPassword,
    hideAuthMessage,
    onForgetPasswordClick,
    showLoading,
    signInWithGoogle,
    signInWithFacebook,
    extra,
    signIn,
    token,
    loading,
    redirect,
    showMessage,
    message,
    allowRedirect = true,
  } = props;

  // const initialCredential = {
  // 	username: 'shamil707@gmail.com',
  // 	password: 'admin@321'
  // }
  const dispatch = useDispatch();
  const onLogin = (values) => {
    console.log(values, "values,");
    const schema = tenant_country.find(
      (schema) => schema.id == values.country_id
    ).schema_name;
    localStorage.setItem(TENANT_SCHEMA, schema);
    showLoading();
    signIn(values);
    dispatch(getUserdata());
    // signInSuccess()
  };

  const onGoogleLogin = () => {
    showLoading();
    signInWithGoogle();
  };

  const onFacebookLogin = () => {
    showLoading();
    signInWithFacebook();
  };

  useEffect(() => {
    if (token !== null && allowRedirect) {
      navigate(redirect);
    }
    if (showMessage) {
      const timer = setTimeout(() => hideAuthMessage(), 3000);
      return () => {
        clearTimeout(timer);
      };
    }
  });

  useEffect(() => {
    console.warn(tenant_country);
  }, [tenant_country]);

  const renderOtherSignIn = (
    <div>
      <Divider>
        <span className="text-muted font-size-base font-weight-normal">
          or connect with
        </span>
      </Divider>
      <div className="d-flex justify-content-center">
        <Button
          onClick={() => onGoogleLogin()}
          className="mr-2"
          disabled={loading}
          icon={<CustomIcon svg={GoogleSVG} />}
        >
          Google
        </Button>
        <Button
          onClick={() => onFacebookLogin()}
          icon={<CustomIcon svg={FacebookSVG} />}
          disabled={loading}
        >
          Facebook
        </Button>
      </div>
    </div>
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
      <Form
        layout="vertical"
        name="login-form"
        // initialValues={initialCredential}
        onFinish={onLogin}
      >
        <Form.Item
          name="username"
          label="Email"
          rules={[
            {
              required: true,
              message: "Please input your username",
            },
            {
              type: "username",
              message: "Please enter a validate username!",
            },
          ]}
        >
          <Input
            prefix={<MailOutlined className="text-primary" />}
            placeholder="Username"
          />
        </Form.Item>
        <Form.Item
          name="password"
          label={
            <div
              className={`${
                showForgetPassword
                  ? "d-flex justify-content-between w-100 align-items-center"
                  : ""
              }`}
            >
              <span>Password</span>
              {showForgetPassword && (
                <span
                  onClick={() => onForgetPasswordClick}
                  className="cursor-pointer font-size-sm font-weight-normal text-muted"
                >
                  Forget Password?
                </span>
              )}
            </div>
          }
          rules={[
            {
              required: true,
              message: "Please input your password",
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-primary" />}
            placeholder="Password"
          />
        </Form.Item>
        <div className="my-10">
          <GenericDropdown
            name="country_id"
            label="Country"
            mode="single"
            rules={[{ required: true, message: "Please select your Country!" }]}
            fetchOptions={getTenantCoutry}
            optionsData={tenant_country}
            loading={loading}
            optionLabelKey="name"
            optionExtraLabel=""
            optionValueKey="id"
            searchParamKey="search"
            isInfoVisible={true}
            hasFeedback={true}
          />
        </div>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Sign In
          </Button>
        </Form.Item>
        <span>
          {APP_CURRENT_VERSION} - {BUILD_TIMESTAMP} - {BUILD_COMMIT}{" "}
        </span>
        {/* {otherSignIn ? renderOtherSignIn : null} */}
        {extra}
      </Form>
    </>
  );
};

LoginForm.propTypes = {
  otherSignIn: PropTypes.bool,
  showForgetPassword: PropTypes.bool,
  extra: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};

LoginForm.defaultProps = {
  otherSignIn: true,
  showForgetPassword: false,
};

const mapStateToProps = ({ auth }) => {
  const { loading, message, showMessage, token, redirect } = auth;
  return { loading, message, showMessage, token, redirect };
};

const mapDispatchToProps = {
  signIn,
  showAuthMessage,
  showLoading,
  hideAuthMessage,
  signInWithGoogle,
  signInWithFacebook,
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
