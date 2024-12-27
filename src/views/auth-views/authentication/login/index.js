import React, { useEffect } from "react";
import LoginForm from "../../components/LoginForm";
import { Card, Row, Col } from "antd";
import { useDispatch, useSelector } from "react-redux";
import Utils from "utils";
const backgroundStyle = {
  backgroundImage: "url(/img/others/img-17.jpg)",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
};

const Login = (props) => {
  const dispatch = useDispatch();
  useEffect(() => {
    Utils.clearAllBrowserData();
  }, [dispatch]);

  const theme = useSelector((state) => state.theme.currentTheme);
  return (
    <div className="h-100" style={backgroundStyle}>
      <div className="container d-flex flex-column justify-content-center h-100">
        <Row justify="center">
          <Col xs={20} sm={20} md={20} lg={7}>
            <Card>
              <div className="my-4">
                <div className="text-center">
                  <img
                    className="img-fluid"
                    src={`/img/${
                      theme === "light" ? "logo.png" : "logo-white.png"
                    }`}
                    alt=""
                    width={"200px"}
                  />
                  <p>
                    Don't have an account yet?{" "}
                    <a href="/auth/register">Sign Up</a>
                  </p>
                </div>
                <Row justify="center">
                  <Col xs={24} sm={24} md={20} lg={20}>
                    <LoginForm {...props} />
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Login;
