// usePagination.js
import { useDispatch, useSelector } from "react-redux";

const usePaginationHook = (actionCreator) => {
  const dispatch = useDispatch();
  const { searchValue, globalStatus } = useSelector((state) => state.filter);
  const { selectedDisplayName: filter_by_display_name } = useSelector((state) => state.permissions);

  const handlePagination = (page, size, event_type, activeTab) => {
    dispatch(
      actionCreator({
        page,
        size,
        search: searchValue,
        event_type,
        active: globalStatus,
        ...(activeTab === "events" && { events: true }),
        ...(activeTab === "movies" && { movies: true }),
        filter_by_display_name
      })
    );
  };

  return handlePagination;
};

export default usePaginationHook;
