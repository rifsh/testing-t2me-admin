import React, { useEffect, useState } from "react";
import { Dropdown, Avatar } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import NavItem from "./NavItem";
import Flex from "components/shared-components/Flex";
import { getUserdata, signOut } from "store/slices/authSlice";
import styled from "@emotion/styled";
import {
  FONT_WEIGHT,
  MEDIA_QUERIES,
  SPACER,
  FONT_SIZES,
} from "constants/ThemeConstant";
import { getUserRole } from "configs/UserAccessConfig";
import Utils from "utils";
import { fetchSingleUsers } from "store/slices/userSlice";
import { useLocation } from "react-router-dom";

const Icon = styled.div(() => ({
  fontSize: FONT_SIZES.LG,
}));

const Profile = styled.div(() => ({
  display: "flex",
  alignItems: "center",
}));

const UserInfo = styled("div")`
  padding-left: ${SPACER[2]};

  @media ${MEDIA_QUERIES.MOBILE} {
    display: none;
  }
`;

const Name = styled.div(() => ({
  fontWeight: FONT_WEIGHT.SEMIBOLD,
}));

const Title = styled.span(() => ({
  opacity: 0.8,
}));

// const MenuItem = (props) => (
// 	<Flex as="a" href={props.path} alignItems="center" gap={SPACER[2]}>
// 		<Icon>{props.icon}</Icon>
// 		<span>{props.label}</span>
// 	</Flex>
// )

const MenuItemSignOut = (props) => {
  const dispatch = useDispatch();
  const pathName = useLocation();

  const handleSignOut = async () => {
    console.log("_____________LOGGING OUT ");
    await dispatch(signOut());
    await Utils.clearAllBrowserData();
  };

  return (
    <div onClick={handleSignOut}>
      <Flex alignItems="center" gap={SPACER[2]}>
        <Icon>
          <LogoutOutlined />
        </Icon>
        <span>{props.label}</span>
      </Flex>
    </div>
  );
};

const items = [
  {
    key: "Sign Out",
    label: <MenuItemSignOut label="Sign Out" />,
  },
];

export const NavProfile = ({ mode }) => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.auth);
  const { singleUser } = useSelector((state) => state.users);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    if (!userData) {
      dispatch(getUserdata());

    } else {
      dispatch(fetchSingleUsers({ "user_id": userData.id }));
      //  console.log(userData,'fghjkhghjkjh');
      console.log(singleUser, 'fghjkhghjkjh');
      const role = getUserRole(userData);
      setUserRole(role);
    }
  }, [userData, dispatch]);
  return (
    <Dropdown placement="bottomRight" menu={{ items }} trigger={["click"]}>
      <NavItem mode={mode}>
        <Profile>
          <Avatar
            style={{
              backgroundColor: "#87d068",
            }}
            src={singleUser && singleUser.thumbnail_image && singleUser.thumbnail_image !== 'images' ? singleUser.thumbnail_image : null}
            icon={!singleUser || !singleUser.thumbnail_image || singleUser.thumbnail_image === 'images' ? <UserOutlined /> : null}
          />


          <UserInfo className="profile-text">
            <Name>{userData && userData.email}</Name>
            <Title>{userRole}</Title>
          </UserInfo>
        </Profile>
      </NavItem>
    </Dropdown>
  );
};

export default NavProfile;
