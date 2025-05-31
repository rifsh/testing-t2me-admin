import React, { useEffect, useState, useMemo } from "react";
import {
    LockOutlined,
    UserOutlined,
    TeamOutlined,
    AppstoreOutlined,
    SafetyOutlined,
    SearchOutlined,
    FolderOutlined,
    ApiOutlined
} from "@ant-design/icons";
import {
    Layout,
    Menu,
    Card,
    Table,
    Switch,
    Button,
    Select,
    Typography,
    Input,
    Tabs,
    Collapse,
    Tag,
    Space,
    Alert,
} from "antd";
import { ROLE_NAMES_ARRAY } from "constants/RolesPermissionConstants";
import { useDispatch, useSelector } from "react-redux";
import { fetchPermissions, fetchPermissionsDisplayNames, setSelectedDisplayIndex, setSelectedDisplayName } from "store/slices/permissionSlice";
import LoadingOverlay from "components/util-components/Loader";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import { Pagination } from "@mui/material";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import usePaginationHook from "utils/hooks/usePaginationHandler";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Search } = Input;

const AccessControlDashboard = () => {
    const [selectedRole, setSelectedRole] = useState("admin");
    const [searchText, setSearchText] = useState("");
    const [activeTab, setActiveTab] = useState("modules");
    const [expandedModules, setExpandedModules] = useState([]);
    const dispatch = useDispatch();
    const [permissions, setPermissions] = useState({});
    const handlePagination = usePaginationHook(fetchPermissionsDisplayNames);
    const handlePermissionsPagination = usePaginationHook(fetchPermissions);
    const { loading, displayNamePagination, response: apiPermissions, displayNames, selectedDisplayName, selectedDisplayIndex, pagination } = useSelector((state) => state.permissions);

    useEffect(() => {
        dispatch(fetchPermissions({ filter_by_display_name: selectedDisplayName }));
    }, [dispatch, selectedDisplayName]);

    useEffect(() => {
        dispatch(fetchPermissionsDisplayNames(DEFAULT_PAGE_SIZE));
    }, [dispatch]);

    useEffect(() => {
        if (apiPermissions) {
            const permissionsMap = {};
            apiPermissions?.forEach(perm => {
                if (!permissionsMap[perm.module]) {
                    permissionsMap[perm.module] = {
                        displayName: perm.display_name,
                        methods: {}
                    };
                }

                permissionsMap[perm.module].methods[perm.codename] = {
                    url: perm.url,
                    method: perm.method,
                    enabled: perm.status ? true : false
                };
            });
            setPermissions(permissionsMap);
            setExpandedModules(Object.keys(permissionsMap));
        }
    }, [apiPermissions]);

    const handlePermissionChange = (module, codename, enabled) => {
        setPermissions(prev => ({
            ...prev,
            [module]: {
                ...prev[module],
                methods: {
                    ...prev[module].methods,
                    [codename]: {
                        ...prev[module].methods[codename],
                        enabled
                    }
                }
            }
        }));
    };

    const filteredModules = useMemo(() => {
        if (!searchText) return Object.entries(permissions);

        return Object.entries(permissions).filter(([module, data]) => {
            const moduleMatch = module.toLowerCase().includes(searchText.toLowerCase());
            const displayMatch = data.displayName.toLowerCase().includes(searchText.toLowerCase());

            // Check if any method matches
            const methodMatch = Object.entries(data.methods).some(([codename, methodData]) => {
                return codename.toLowerCase().includes(searchText.toLowerCase()) ||
                    methodData.url.toLowerCase().includes(searchText.toLowerCase());
            });

            return moduleMatch || displayMatch || methodMatch;
        });
    }, [permissions, searchText]);

    const savePermissions = () => {
        // Transform permissions back to API format and save
        console.log("Saving permissions:", selectedRole);
        // Add your save logic here
    };

    const handleChange = (event, page) => {
        handlePagination(page, 10)
    };

    return (
        <Layout className="min-h-screen">
            <Sider
                width={250}
                theme="light"
                className="shadow-md h-full" // Changed to h-full to match parent height
                style={{
                    overflow: 'auto',
                    height: '70%',
                    position: 'sticky',
                    top: '80px',
                    left: 0
                }}
            >
                <div className="p-4">
                    <Title level={4} className="flex items-center gap-2">
                        <FolderOutlined />
                        Modules
                    </Title>
                </div>
                <div className="p-[6px]">
                    <SearchBarWithStatus
                        placeholder="Search with Venue or Screen name"
                        fetchFunction={fetchPermissionsDisplayNames}
                        isStatus={false}
                    />
                </div>
                <div className="flex flex-col justify-between h-[calc(100%-110px)]">
                    <Menu
                        mode="inline"
                        defaultSelectedKeys={["0"]}
                        selectedKeys={[selectedDisplayIndex?.toString()]}
                        onClick={({ key }) => {
                            dispatch(setSelectedDisplayIndex(parseInt(key)));
                            const selectedModule = displayNames[parseInt(key)];
                            dispatch(setSelectedDisplayName(selectedModule.display_name));
                            console.log("Selected module:", selectedModule.display_name);
                        }}
                        style={{ borderRight: 0 }}
                    >
                        {displayNames?.map((names, index) => (
                            <Menu.Item
                                key={index.toString()}
                                icon={<SafetyOutlined />}
                            >
                                {names.display_name}
                            </Menu.Item>
                        ))}
                    </Menu>
                    <div className="p-2 flex justify-center border-t border-gray-200"> {/* Added border */}
                        <Pagination
                            count={displayNamePagination.pages}
                            page={displayNamePagination.page}
                            onChange={handleChange}
                            color="primary"
                            variant="outlined"
                            shape="rounded"
                            size="small"
                            showFirstButton
                            showLastButton
                            siblingCount={1}
                            boundaryCount={1}
                        />
                    </div>
                </div>
            </Sider>

            <Layout className="bg-white">
                <Content className="p-6">
                    <Card className="shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <Tabs
                                activeKey={activeTab}
                                onChange={setActiveTab}
                                className="w-full"
                            >
                                <TabPane tab={<span><FolderOutlined /> Sections</span>} key="modules">
                                    <div className="mb-4">
                                        <div className="p-[6px]">
                                            <SearchBarWithStatus
                                                placeholder="Search with Venue or Screen name"
                                                fetchFunction={fetchPermissions}
                                                isStatus={false}
                                                displayName={selectedDisplayName}
                                            />
                                        </div>

                                        <div className="flex items-center gap-4 my-3">
                                            <Text strong>Select Role to give access:</Text>
                                            <Select
                                                defaultValue={ROLE_NAMES_ARRAY[1].name}
                                                style={{ width: 200 }}
                                                onChange={setSelectedRole}
                                            >
                                                {ROLE_NAMES_ARRAY.filter(role => role.id !== 1).map((role) => (
                                                    <Option
                                                        key={role.id}
                                                        value={role.name}

                                                    >
                                                        {role.label}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </div>

                                        <Collapse
                                            activeKey={expandedModules}
                                            onChange={setExpandedModules}
                                            ghost
                                        >
                                            {filteredModules.map(([module, moduleData]) => (
                                                <Panel
                                                    key={module}
                                                    header={
                                                        <div className="flex justify-between items-center">
                                                            <Space>
                                                                <Text strong>{moduleData.displayName}</Text>
                                                                <Tag color="blue">{module}</Tag>
                                                            </Space>
                                                        </div>
                                                    }
                                                >
                                                    <Table
                                                        dataSource={Object.entries(moduleData.methods).map(([codename, methodData]) => ({
                                                            key: codename,
                                                            codename,
                                                            ...methodData
                                                        }))}
                                                        pagination={{
                                                            current: pagination.current,
                                                            pageSize: pagination.pageSize,
                                                            total: pagination.total,
                                                            onChange: (page, pageSize) => handlePermissionsPagination(page, pageSize),
                                                            position: ['bottomRight']
                                                        }}
                                                        showHeader={false}
                                                        size="small"
                                                        className="permission-methods-table"
                                                        columns={[
                                                            {
                                                                dataIndex: "codename",
                                                                render: (codename) => (
                                                                    <div className="flex items-center gap-2">
                                                                        <ApiOutlined />
                                                                        <Text code>{codename}</Text>
                                                                    </div>
                                                                ),
                                                                width: '30%'
                                                            },
                                                            {
                                                                dataIndex: "method",
                                                                render: (method) => (
                                                                    <Tag color={
                                                                        method === 'GET' ? 'green' :
                                                                            method === 'POST' ? 'blue' :
                                                                                method === 'PUT' ? 'orange' :
                                                                                    method === 'DELETE' ? 'red' : 'default'
                                                                    }>
                                                                        {method}
                                                                    </Tag>
                                                                ),
                                                                width: '15%'
                                                            },
                                                            {
                                                                dataIndex: "url",
                                                                render: (url) => <Text type="secondary">{url}</Text>,
                                                                width: '40%'
                                                            },
                                                            {
                                                                dataIndex: "enabled",
                                                                render: (_, record) => (
                                                                    <Switch
                                                                        checked={record.enabled}
                                                                        onChange={(checked) =>
                                                                            handlePermissionChange(module, record.codename, checked)
                                                                        }
                                                                    />
                                                                ),
                                                                width: '15%',
                                                                align: 'right'
                                                            }
                                                        ]}
                                                    />
                                                </Panel>
                                            ))}
                                        </Collapse>
                                    </div>
                                </TabPane>
                            </Tabs>
                        </div>

                        <div className="flex justify-end mt-6">
                            <Button
                                type="primary"
                                icon={<AppstoreOutlined />}
                                onClick={savePermissions}
                                size="large"
                            >
                                Save Permissions
                            </Button>
                        </div>
                    </Card>
                </Content>
            </Layout>
            <LoadingOverlay loading={loading} />
        </Layout>
    );
};

export default AccessControlDashboard;