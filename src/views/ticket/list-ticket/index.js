import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Input,
  Button,
  Collapse,
  Menu,
  Modal,
  Row,
  Col,
  Divider,
} from "antd";
import Flex from "components/shared-components/Flex";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import {
  PlusCircleOutlined,
  SearchOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import {
  editTicket,
  fetchAllTickets,
  filterTickets,
  resetTicketSets,
  setEditItemId,
  setTicketDialogVisible,
  setTicketModalLoading,
  CheckTicketEditAvailability,
} from "store/slices/ticketSlice";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedItem } from "store/slices/modalSlice";
import Utils from "utils";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { TextConstants } from "constants/TextConstant";
import usePaginationHook from "utils/hooks/usePaginationHandler";
import usePermissions from "utils/hooks/usePermissions";
import { PERMISSIONS } from "constants/RolesPermissionConstants";
const { Panel } = Collapse;

const TicketList = () => {
  const dispatch = useDispatch();
  const {
    filteredTickets,
    pagination,
    editable_status,
    message,
    editItemId,
    dialogVisible,
    modalLoading,
  } = useSelector((state) => state.tickets);
  const handlePagination = usePaginationHook(fetchAllTickets);
  const { hasAnyPermission, hasPermission } = usePermissions();

  useEffect(() => {
    dispatch(resetTicketSets());
    dispatch(fetchAllTickets({ ...DEFAULT_PAGE_SIZE, }));
  }, [dispatch]);

  // const handlePagination = (page, pageSize) => {
  //   dispatch(fetchAllTickets({ page: page, size: pageSize }));
  // };

  const [selectedVenue, setSelectedVenue] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // const showDetails = (venue) => {
  //   setSelectedVenue(venue);
  //   setIsModalVisible(true);
  // };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleEditTicket = async (id) => {
    dispatch(setEditItemId(id));
    // dispatch(setTicketDialogVisible(true));
    try {
      const result = await dispatch(
        CheckTicketEditAvailability({ ticket_id: id })
      ).unwrap();

      if (result?.editable === true) {
        navigate(`${APP_PREFIX_PATH}/ticket/edit/${id}`);
      } else {
        Modal.error({
          content:
            "Sorry, this ticket already has bookings in all time slots. You cannot edit this ticket.",
        });
      }
    } catch (error) {
      console.error("Error checking schedule edit:", error);
      Modal.error({
        content: "Something went wrong while checking the schedule.",
      });
    }
  };
  const handleModalSubmit = async () => {
    dispatch(setTicketModalLoading(true));

    dispatch(setTicketDialogVisible(false));
    dispatch(setTicketModalLoading(false));
  };

  const handleModalCancel = () => {
    dispatch(setTicketDialogVisible(false));
  };
  const dropdownMenu = (row) => (
    <Menu>
      <Menu.Item onClick={() => handleEditTicket(row.id)}>
        <Flex alignItems="center">
          <EyeOutlined />
          <span className="ml-2">Edit Ticket</span>
        </Flex>
      </Menu.Item>
    </Menu>
  );

  const navigate = useNavigate();
  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };

    dispatch(setSelectedItem(data));
  };
  return (
    <Card style={{ padding: "20px" }}>
      <div
        className="header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <SearchBarWithStatus fetchFunction={fetchAllTickets} />
        {hasPermission(
          PERMISSIONS.APPLICATIONS.SERVICES.EVENT.TICKET.ADD_TICKET
        ) && (
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={() => navigate(`${APP_PREFIX_PATH}/ticket/add`)}
          >
            Add Ticket
          </Button>
        )}
      </div>

      <Table
        rowKey="id"
        dataSource={filteredTickets}
        pagination={{
          current: pagination.page,
          pageSize: pagination.size,
          total: pagination.total,
          onChange: handlePagination,
        }}
        columns={[
          {
            title: "Ticket Types",
            dataIndex: "name",
            render: (venue) => <strong>{venue}</strong>,
          },
          {
            title: "Venue",
            dataIndex: "venue",
            render: (venue) => <strong>{venue?.name}</strong>,
          },
          {
            title: "Number of Tickets",
            dataIndex: "number_of_tickets",
          },
          {
            title: "Base Price",
            dataIndex: "base_price",
            render: (price, record) => {
              if (price === null || price === undefined) {
                return "----";
              }

              const currencyCode = record?.venue?.place?.country?.currency_code;
              return `${currencyCode ? currencyCode : ""} ${price}`;
            },
          },

          {
            title: "Ticket Sub Types",
            dataIndex: "ticket_types",
            render: (_, record) => (
              <Collapse defaultActiveKey={[]} accordion>
                {record?.ticket_types && record.ticket_types?.length > 0 ? (
                  record.ticket_types.map((set, index) => (
                    <Panel
                      header={set.ticket_set}
                      key={index}
                      extra={<span>{set.tickets.length} Types</span>}
                    >
                      <ul style={{ paddingLeft: 20 }}>
                        {set.tickets.map((ticket, ticketIndex) => (
                          <li key={ticketIndex} style={{ padding: "10px 0" }}>
                            <div
                              style={{
                                // display: "flex",
                                justifyContent: "space-between",
                                // alignItems: "center",
                              }}
                            >
                              <Col>
                                <span style={{ fontWeight: "bold" }}>
                                  {ticket.name}
                                </span>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "lightblue",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Tickets : {ticket.number_of_tickets}
                                  </span>{" "}
                                  <span
                                    style={{
                                      color: "lightgreen",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Price:{" "}
                                    {ticket?.price != null
                                      ? `${
                                          record?.venue?.place?.country
                                            ?.currency_code || ""
                                        } ${ticket.price}`
                                      : "N/A"}
                                  </span>
                                </div>
                              </Col>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </Panel>
                  ))
                ) : (
                  <Panel
                    collapsible="disabled"
                    header={"No ticket types available"}
                  ></Panel>
                )}
              </Collapse>
            ),
          },
          Utils.statusColumnUtil(handleUpdateStatus),
          {
            title: "Actions",
            dataIndex: "actions",
            render: (_, elm) =>
              hasPermission(
                PERMISSIONS.APPLICATIONS.SERVICES.EVENT.TICKET
                  .EDIT_TICKET_STRUCTURE
              ) ? (
                <div className="text-right">
                  <EllipsisDropdown menu={dropdownMenu(elm)} />
                </div>
              ) : null,
          },
        ]}
      />
      {/* <WarningModal
        mode={"itemmodal"}
        visible={dialogVisible}
        title="Edit Ticket"
        details={TextConstants.DefaultEditContent1}
        warningMessage="Do you want to proceed to the edit page?"
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
        confirmText="Proceed to Edit"
        cancelText="Cancel"
        loading={modalLoading}
      /> */}
      <UpdateStatusModal
        responseMessage={message}
        editFunction={editTicket}
        getAllFunction={(pageData) => fetchAllTickets(pageData)}
        pageData={{ page: 1, size: 10 }}
        editable_status={editable_status}
      />
      <Modal
        title="Venue Details"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        {selectedVenue && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>Venue ID:</strong> {selectedVenue.venue.id}
              </Col>
              <Col span={12}>
                <strong>Base Price:</strong> ${selectedVenue.base_price}
              </Col>
            </Row>
            <Divider />

            {/* Dynamically Display Ticket Sections */}
            {selectedVenue.ticket_types.map((set, index) => (
              <div key={index}>
                <h4 style={{ fontSize: 16, fontWeight: 600 }}>
                  {set.ticket_set} Tickets
                </h4>
                <Row gutter={16}>
                  {set.tickets.map((ticket, ticketIndex) => (
                    <Col span={12} key={ticketIndex}>
                      <Card
                        title={ticket?.name}
                        bordered={false}
                        style={{
                          marginBottom: 16,
                          backgroundColor:
                            set.ticket_set === "Set1" ? "#f5f5f5" : "#e6f7ff",
                        }}
                      >
                        <p>
                          <strong>Price:</strong> ${ticket.price}
                        </p>
                        <p>
                          <strong>Available Tickets:</strong>{" "}
                          {ticket.number_of_tickets}
                        </p>
                      </Card>
                    </Col>
                  ))}
                </Row>
                <Divider />
              </div>
            ))}
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default TicketList;
