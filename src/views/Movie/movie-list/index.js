import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Dropdown, Tag, Badge, Space } from "antd";
import { EditOutlined, EyeOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setDialogVisible, setSelectedItem } from 'store/slices/modalSlice';
import SearchBarWithStatus from 'components/util-components/Search/SearchBarWithStatus';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { editMovieStatus, fetchMoviesData, setEditMovieId } from 'store/slices/movieSlice';
import { DEFAULT_PAGE_SIZE } from 'constants/PageConstants';
import { setLocationDialogVisible, setLocationModalLoading } from 'store/slices/locationSlice';
import WarningModal from 'components/util-components/ModalItems/WarningModal';
import { TextConstants } from 'constants/TextConstant';
import Utils from 'utils';
import StatusSubmitAndConfirmModal from 'components/util-components/ModalItems/StatusSubmitModal';
import UpdateStatusModal from 'components/util-components/ModalItems/UpdateStatusModal';
import usePaginationHook from 'utils/hooks/usePaginationHandler';

const Index = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formattedData, setFormattedData] = useState([]);
    const { pagination, loading, movieResponse, movieEditId, editResponse, message, editable_status } = useSelector((state) => state.movie)
    const {
        dialogVisible,
        modalLoading,
    } = useSelector((state) => state.locations);
    const handlePagination = usePaginationHook(fetchMoviesData);

    useEffect(() => {
        dispatch(fetchMoviesData(DEFAULT_PAGE_SIZE))
    }, [dispatch]);

    useEffect(() => {
        console.warn("Movie Response", movieResponse)
        if (movieResponse) {
            const processedData = movieResponse?.items?.map(detail => ({
                id: detail?.id,
                title: detail?.title,
                description: detail?.description,
                thumbnail_image: detail?.thumbnail_image,
                genre: detail?.genres?.map((genr) => genr?.name),
                language: detail?.languages?.map((lang) => lang?.name),
                country: detail?.country,
                director: detail?.director,
                released: detail?.released,
                rating: detail?.rating,
                runtime: detail?.runtime,
                media_items: detail?.media_items,
                casts: detail?.casts,
                awards: detail?.awards,
                box_office: detail?.box_office,
                box_office_currency: detail?.box_office_currency,
                budget: detail?.budget,
                budget_currency: detail?.budget_currency,
                production_company: detail?.production_company,
                status: detail?.status,
            })
            );
            setFormattedData(processedData)
        }
        console.log("Formatted Data", movieResponse)
    }, [movieResponse]);
    const handleViewDetails = (movie) => {
        navigate(`${APP_PREFIX_PATH}/movie/details/${movie.id}`);
    };

    const handleEditMovie = (movie) => {
        dispatch(setEditMovieId(movie.id));
        dispatch(setLocationDialogVisible(true));
    };
    const handleModalSubmit = async () => {
        dispatch(setLocationModalLoading(true));
        navigate(`${APP_PREFIX_PATH}/movie/edit/${movieEditId}`);
        dispatch(setLocationDialogVisible(false));
        dispatch(setLocationModalLoading(false));
    };

    const handleModalCancel = () => {
        dispatch(setLocationDialogVisible(false));
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

    const handleUpdateStatus = (item) => {
        const newStatus = !item.status;
        const data = { status: newStatus, id: item.id };
        dispatch(setSelectedItem(data));
        dispatch(setDialogVisible(true));
    };

    // const handlePagination = (page, pageSize) => {
    //     dispatch(fetchMoviesData({ page: page, size: pageSize }));
    // };

    const tableColumns = [
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            render: (text) => text?.trim() ? text : "N/A"
        },
        {
            title: "Genre",
            dataIndex: "genre",
            key: "genre",
            render: (genres) =>
                Array.isArray(genres) && genres.length > 0
                    ? genres.map((genre) => <Tag key={genre}>{genre}</Tag>)
                    : <span>-</span>
        },
        {
            title: "Duration",
            dataIndex: "runtime",
            key: "duration",
            render: (duration) => {
                if (!duration || typeof duration !== 'number') return 'N/A';
                const hours = Math.floor(duration / 60);
                const minutes = duration % 60;
                return `${hours > 0 ? `${hours} hr ` : ''}${minutes > 0 ? `${minutes} min` : ''}`.trim();
            },
        },
        {
            title: "Language",
            dataIndex: "language",
            key: "language",
            render: (language) => language.map((language) => <Tag key={language}>{language}</Tag>)

        },
        {
            title: "Rating",
            dataIndex: "rating",
            key: "rating",
            render: (rating) => <Tag color={rating > 7 ? "green" : "red"}>{rating}/10</Tag>
        },
        Utils.statusColumnUtil(handleUpdateStatus),
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
                <SearchBarWithStatus placeholder="Search by title" fetchFunction={fetchMoviesData} />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(`${APP_PREFIX_PATH}/movie/add`)}>
                    Add Movie
                </Button>
            </Space>

            <Table
                columns={tableColumns}
                dataSource={formattedData}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    onChange: (page, pageSize) => handlePagination(page, pageSize),
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} movies`
                }}
            />

            <WarningModal
                mode="itemmodal"
                visible={dialogVisible}
                title="Edit Movie"
                details={TextConstants.DefaultEditContent3}
                warningMessage="Do you want to proceed to the edit page?"
                onSubmit={handleModalSubmit}
                onCancel={handleModalCancel}
                confirmText="Proceed to Edit"
                cancelText="Cancel"
                loading={modalLoading}
            />

            <UpdateStatusModal
                responseMessage={message}
                editFunction={editMovieStatus}
                getAllFunction={(pageData) => fetchMoviesData(pageData)}
                // tableConfig={{
                //     title: "Active Schedules",
                //     dataKey: "items",
                // }}
                editable_status={editable_status}
                responseData={editResponse}
                loading={loading}
            />

            <StatusSubmitAndConfirmModal
                editFunction={editMovieStatus}
                getAllFunction={fetchMoviesData}
                responseData={editResponse}
                responseMessage={message}
                pageData={DEFAULT_PAGE_SIZE}
                onSubmitMessage={TextConstants.StatusUpdatedSuccess}
                onCloseMessage={TextConstants.StatusUpdateCanceled}
            />
        </Card>
    );
}

export default Index