import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Dropdown, Tag, Badge, Space } from "antd";
import { EditOutlined, EyeOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// import { fetchMovies, setMovieEditItemId, editMovieStatus } from 'store/slices/movieSlice';
import { setDialogVisible, setSelectedItem } from 'store/slices/modalSlice';
import WarningModal from 'components/util-components/ModalItems/WarningModal';
import StatusSubmitAndConfirmModal from 'components/util-components/ModalItems/StatusSubmitModal';
import SearchBarWithStatus from 'components/util-components/Search/SearchBarWithStatus';
import { DEFAULT_PAGE_SIZE } from 'constants/PageConstants';
import { moviesMockData } from './MockData';

const Index = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(moviesMockData);
    const [filteredData, setFilteredData] = useState([]);

    // const { dialogVisible, modalLoading } = useSelector((state) => state.modal);

    useEffect(() => {
        // dispatch(fetchMovies(DEFAULT_PAGE_SIZE));
    }, [dispatch]);

    useEffect(() => {
        // if (response && response.items) {
        //     const formattedData = response.items.map((movie) => ({
        //         key: movie.id,
        //         ...movie
        //     }));
        //     setData(formattedData);
        //     setFilteredData(formattedData);
        // }
    }, []);

    const handleViewDetails = (movie) => {
        navigate(`/movies/detail/${movie.id}`);
    };

    const handleEditMovie = (movie) => {
        // dispatch(setMovieEditItemId(movie.id));
        // dispatch(setDialogVisible(true));
    };

    const handleModalSubmit = () => {
        // navigate(`/movies/edit/${movie.id}`);
        // dispatch(setDialogVisible(false));
    };

    const handleModalCancel = () => {
        // dispatch(setDialogVisible(false));
    };

    const handlePagination = (page, pageSize) => {
        // dispatch(fetchMovies({ page, size: pageSize }));
    };

    const getDropdownMenu = (movie) => [
        {
            key: "edit",
            label: (
                <Space>
                    <EditOutlined />
                    <span>Edit</span>
                </Space>
            ),
            onClick: () => handleEditMovie(movie),
        },
        {
            key: "view",
            label: (
                <Space>
                    <EyeOutlined />
                    <span>View Details</span>
                </Space>
            ),
            onClick: () => handleViewDetails(movie),
        },
    ];

    const getStatusBadge = (isActive) => (
        isActive ? <Badge status="success" text="Active" /> : <Badge status="error" text="Inactive" />
    );

    const handleUpdateStatus = (movie) => {
        const newStatus = !movie.status;
        dispatch(setSelectedItem({ status: newStatus, id: movie.id }));
        // dispatch(setDialogVisible(true));
    };

    const tableColumns = [
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
        },
        {
            title: "Genre",
            dataIndex: "genre",
            key: "genre",
            render: (genres) => genres.map((genre) => <Tag key={genre}>{genre}</Tag>)
        },
        {
            title: "Duration",
            dataIndex: "duration",
            key: "duration",
            render: (duration) => `${duration} min`,
        },
        {
            title: "Language",
            dataIndex: "language",
            key: "language",
        },
        {
            title: "Rating",
            dataIndex: "rating",
            key: "rating",
            render: (rating) => <Tag color={rating > 7 ? "green" : "red"}>{rating}/10</Tag>
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => getStatusBadge(status),
        },
        {
            title: "Actions",
            dataIndex: "actions",
            render: (_, movie) => (
                <Dropdown menu={{ items: getDropdownMenu(movie) }} trigger={["click"]}>
                    <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
            ),
        },
    ];

    return (
        <Card>
            <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: "10px" }}>
                <SearchBarWithStatus placeholder="Search by title or genre" />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/movies/add')}>
                    Add Movie
                </Button>
            </Space>

            <Table
                columns={tableColumns}
                dataSource={moviesMockData}
                rowKey="id"
                // loading={movieLoader || loading}
                // pagination={{
                //     current: pagination.current,
                //     pageSize: pagination.pageSize,
                //     total: pagination.total,
                //     onChange: handlePagination,
                //     showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} movies`
                // }}
            />

            {/* <WarningModal
                mode="itemmodal"
                visible={dialogVisible}
                title="Edit Movie"
                warningMessage="Do you want to proceed to the edit page?"
                onSubmit={handleModalSubmit}
                onCancel={handleModalCancel}
                confirmText="Proceed to Edit"
                cancelText="Cancel"
                loading={modalLoading}
            />

            <StatusSubmitAndConfirmModal
                editFunction={editMovieStatus}
                // getAllFunction={fetchMovies}
                responseData={response}
                responseMessage={message}
                pageData={DEFAULT_PAGE_SIZE}
            /> */}
        </Card>
    );
}

export default Index