// usePagination.js
import { useDispatch, useSelector } from 'react-redux';

const usePaginationHook = (actionCreator) => {
    const dispatch = useDispatch();
    const { searchValue, globalStatus } = useSelector((state) => state.filter);

    const handlePagination = (page, size, event_type) => {
        dispatch(actionCreator({ page, size, search: searchValue, event_type, active: globalStatus }));
    };

    return handlePagination;
};

export default usePaginationHook;
