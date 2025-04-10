import React, { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux';
import { 
	AUTH_PREFIX_PATH, 
	UNAUTHENTICATED_ENTRY, 
	REDIRECT_URL_KEY 
} from 'configs/AppConfig'

const ProtectedRoute = () => {
	const { token } = useSelector(state => state.auth);
	const location = useLocation();
  
	useEffect(() => {
	  // Add logging to debug the flow
	  console.log("ProtectedRoute check - Token exists:", !!token);
	}, [token]);
  
	if (!token) {
	  // Save the current location for later redirect if needed
	  const redirectUrl = location.pathname + location.search;
	  localStorage.setItem(REDIRECT_URL_KEY, redirectUrl);
	  
	  return <Navigate to={`${AUTH_PREFIX_PATH}${UNAUTHENTICATED_ENTRY}`} replace />;
	}
  
	return <Outlet />;
  };

export default ProtectedRoute