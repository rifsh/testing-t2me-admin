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
    message,
    Divider,
} from "antd";
import { ROLE_METHODS, ROLE_NAMES_ARRAY } from "constants/RolesPermissionConstants";
import { useDispatch, useSelector } from "react-redux";
import { addhPermissionsAccess, fetchPermissions, fetchPermissionsDisplayNames, setSelectedDisplayIndex, setSelectedDisplayName } from "store/slices/permissionSlice";
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
    const [selectedRole, setSelectedRole] = useState(2);
    const [SelectedMethod, setSelectedMethod] = useState('');
    const [searchText, setSearchText] = useState("");
    const [activeTab, setActiveTab] = useState("modules");
    const [expandedModules, setExpandedModules] = useState([]);
    const dispatch = useDispatch();
    const [permissions, setPermissions] = useState({});
    const [rolePermissions, setRolePermissions] = useState({
        role_position_id: selectedRole, // Initialize with default role ID
        permissions: []     // Empty array for permissions
    });
    const handlePagination = usePaginationHook(fetchPermissionsDisplayNames);
    const { loading, displayNamePagination, response: apiPermissions, displayNames, selectedDisplayName, selectedDisplayIndex, pagination } = useSelector((state) => state.permissions);
    const { searchValue } = useSelector((state) => state.filter);

    useEffect(() => {
        if (selectedDisplayName) {
            dispatch(fetchPermissions({
                filter_by_display_name: selectedDisplayName,
                filter_by_method: SelectedMethod,
                role_id: selectedRole,
                status: true
            }));
        }
    }, [dispatch, selectedDisplayName, selectedRole, SelectedMethod]);

    const getPermissionsDisplayNames = async () => {
        try {
            const actionResult = await dispatch(
                fetchPermissionsDisplayNames(DEFAULT_PAGE_SIZE)
            ).unwrap();
            if (!actionResult?.items || actionResult.items.length === 0) {
                console.error("No display names found in the response");
                dispatch(setSelectedDisplayName(""));
                return;
            }
            const firstDisplayName = actionResult.items[0]?.display_name;
            if (!firstDisplayName) {
                console.error("First item has no display_name");
                dispatch(setSelectedDisplayName(""));
                return;
            }
            dispatch(setSelectedDisplayName(firstDisplayName));

        } catch (error) {
            console.error("Failed to fetch display names:", error);
            dispatch(setSelectedDisplayName(""));
        }
    };

    useEffect(() => {
        getPermissionsDisplayNames()
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
                    id: perm.id,
                    url: perm.url,
                    method: perm.method,
                    enabled: perm.status ? true : false
                };
            });
            setPermissions(permissionsMap);
            setExpandedModules(Object.keys(permissionsMap));
        }
    }, [apiPermissions]);

    useEffect(() => {
        if (apiPermissions) {
            const permissionsMap = {};
            const apiPermissionsList = [];

            apiPermissions?.forEach(perm => {
                // 1. Build UI permissions structure
                if (!permissionsMap[perm.module]) {
                    permissionsMap[perm.module] = {
                        displayName: perm.display_name,
                        methods: {}
                    };
                }

                permissionsMap[perm.module].methods[perm.codename] = {
                    id: perm.id,
                    url: perm.url,
                    method: perm.method,
                    enabled: perm.status ? true : false
                };

                // 2. Build API permissions structure simultaneously
                apiPermissionsList.push({
                    method: perm.method,
                    permission_id: perm.id,
                    action: perm.status ? "add" : ""
                });
            });
            setRolePermissions(prev => ({
                ...prev,
                permissions: apiPermissionsList
            }));
            console.log("UI permissions structure:", permissionsMap);
            console.log("API-ready permissions:", {
                role_position_id: selectedRole,
                permissions: apiPermissionsList
            });
        }
    }, [apiPermissions, selectedRole]);


    const handlePermissionChange = (module, codename, method, permissionId, enabled) => {
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
        setRolePermissions(prev => {
            const filteredPermissions = prev.permissions.filter(
                perm => perm.permission_id !== permissionId
            );

            return {
                role_position_id: selectedRole,
                permissions: [
                    ...filteredPermissions,
                    {
                        method,
                        permission_id: permissionId,
                        action: enabled ? "add" : "remove"
                    }
                ]
            };
        });
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

    const savePermissions = async () => {
        message.loading('Saving permissions...', 0);

        try {
            await dispatch(addhPermissionsAccess(rolePermissions));
            console.log("Permission data", rolePermissions);
            message.destroy();
            message.success('Permissions saved successfully!', 3);
        } catch (error) {
            console.error('Error saving permissions:', error);
            message.destroy();
            message.error(error.message || 'Failed to save permissions', 3);
        }
    };

    const handleChange = (event, page) => {
        handlePagination(page, 10)
    };

    const handlePermissionsPagination = (page, pageSize) => {
        dispatch(fetchPermissions({
            filter_by_display_name: selectedDisplayName,
            filter_by_method: SelectedMethod,
            role_id: selectedRole,
            page: page,
            size: pageSize,
            search: searchValue,
            status: true
        }));
    }

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
                        selectedKeys={selectedDisplayName}
                        onClick={({ key }) => {
                            const selectedModule = displayNames.find(
                                (module) => module.display_name === key
                            );
                            if (selectedModule) {
                                const selectedIndex = displayNames.findIndex(
                                    (module) => module.display_name === key
                                );

                                dispatch(setSelectedDisplayIndex(selectedIndex));
                                dispatch(setSelectedDisplayName(selectedModule.display_name));
                            }
                        }}
                        style={{ borderRight: 0 }}
                    >
                        {displayNames?.map((names) => (
                            <Menu.Item
                                key={names.display_name}
                                icon={<SafetyOutlined />}
                            >
                                {names.display_name}
                            </Menu.Item>
                        ))}
                    </Menu>
                    <div className="p-2 flex justify-center border-t border-gray-200">
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
                                                placeholder="Search..."
                                                fetchFunction={fetchPermissions}
                                                isStatus={false}
                                                isPermission={true}
                                                displayName={selectedDisplayName}
                                                roleId={selectedRole}
                                                method={SelectedMethod}
                                            />
                                        </div>

                                        <div className="flex items-center gap-4 my-3">
                                            <Text strong>Select Role to give access:</Text>
                                            <Select
                                                defaultValue={ROLE_NAMES_ARRAY[1].id}
                                                style={{ width: 200 }}
                                                onChange={(selectedId) => {
                                                    setSelectedRole(selectedId);
                                                }}
                                            >
                                                {ROLE_NAMES_ARRAY.filter(role => role.id !== 1).map((role) => (
                                                    <Option
                                                        key={role.id}
                                                        value={role.id}
                                                    >
                                                        {role.name}
                                                    </Option>
                                                ))}
                                            </Select>
                                            <Text strong>Filter by Method: </Text>
                                            <Select
                                                defaultValue={ROLE_METHODS[0].value}
                                                style={{ width: 200 }}
                                                onChange={(selectedValue) => {
                                                    setSelectedMethod(selectedValue);
                                                }}
                                            >
                                                {ROLE_METHODS.map((method) => (
                                                    <Option
                                                        key={method.id}
                                                        value={method.value}
                                                    >
                                                        <Tag color={
                                                            method.name === 'GET' ? 'green' :
                                                                method.name === 'POST' ? 'blue' :
                                                                    method.name === 'PUT' ? 'orange' :
                                                                        method.name === 'DELETE' ? 'red' : 'default'
                                                        }>
                                                            {method.name}
                                                        </Tag>
                                                    </Option>
                                                ))}
                                            </Select>
                                        </div>
                                        <Divider />

                                        {filteredModules.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <FolderOutlined style={{ fontSize: '48px', color: '#bfbfbf', marginBottom: '16px' }} />
                                                <Title level={4} type="secondary">No Permissions Found</Title>
                                                <Text type="secondary">
                                                    {searchText ?
                                                        "No permissions match your search criteria" :
                                                        "No permissions available for the selected filters"}
                                                </Text>
                                            </div>
                                        ) : (
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
                                                                                handlePermissionChange(module, record.codename, record.method, record.id, checked)
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
                                        )}
                                    </div>
                                </TabPane>
                            </Tabs>
                        </div>

                        {filteredModules.length > 0 && (
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
                        )}
                    </Card>
                </Content>
            </Layout>
            <LoadingOverlay loading={loading} />
        </Layout>
    );
};

export default AccessControlDashboard;