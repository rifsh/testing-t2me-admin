import { useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";

export const usePagination = ({
  fetchAction,
  setCurrentPageAction,
  setPageSizeAction,
  currentPage,
  pageSize,
  extraParams = {},
}) => {
  const dispatch = useDispatch();
  const isInitialMount = useRef(true);
  const shouldFetch = useRef(false);

  // Separate effect for initial load
  useEffect(() => {
    if (isInitialMount.current) {
      dispatch(fetchAction({ page: currentPage, size: pageSize, ...extraParams }));
      isInitialMount.current = false;
    }
  }, []); // Empty dependency array for mount only

  // Memoized handlers to prevent recreation on each render
  const handlePageChange = useCallback((page) => {
    if (page !== currentPage) {
      dispatch(setCurrentPageAction(page));
      shouldFetch.current = true;
    }
  }, [currentPage, dispatch, setCurrentPageAction]);

  const handlePageSizeChange = useCallback((newPageSize) => {
    if (newPageSize !== pageSize) {
      dispatch(setPageSizeAction(newPageSize));
      dispatch(setCurrentPageAction(1));
      shouldFetch.current = true;
    }
  }, [pageSize, dispatch, setPageSizeAction, setCurrentPageAction]);

  // Effect for handling pagination changes
  useEffect(() => {
    if (!isInitialMount.current && shouldFetch.current) {
      dispatch(fetchAction({ page: currentPage, size: pageSize, ...extraParams }));
      shouldFetch.current = false;
    }
  }, [currentPage, pageSize]);

  return {
    handlePageChange,
    handlePageSizeChange,
  };
};