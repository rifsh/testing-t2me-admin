import React from 'react';
import {
    Card,
    CardContent,
    Avatar,
    Typography,
    Chip,
    Divider,
    Box
} from '@mui/material';
import {
    CheckCircle,
    Person,
    Cancel,
    Pending,
    Warning,
    Info
} from '@mui/icons-material';

const statusConfig = {
    approved: {
        icon: <CheckCircle fontSize="small" />,
        color: "success",
        label: "Approved"
    },
    rejected: {
        icon: <Cancel fontSize="small" />,
        color: "error",
        label: "Rejected"
    },
    pending: {
        icon: <Pending fontSize="small" />,
        color: "warning",
        label: "Pending"
    },
    requested_changes: {
        icon: <Warning fontSize="small" />,
        color: "warning",
        label: "Changes Requested"
    },
    default: {
        icon: <Info fontSize="small" />,
        color: "info",
        label: "Commented"
    }
};

export const CommentListRender = ({ comment }) => {
    const statusKey = comment?.comment?.toLowerCase().replace(/\s+/g, '_') || 'default';
    const status = statusConfig[statusKey] || statusConfig.default;

    return (
        <Card className="my-4 shadow-md rounded-lg overflow-hidden">
            <CardContent className="p-4">
                <Box className="flex items-start gap-3">
                    {/* User Avatar */}
                    <Avatar className="bg-blue-100 text-blue-600">
                        {comment?.user?.username?.charAt(0)?.toUpperCase() || <Person />}
                    </Avatar>

                    <Box className="flex-1">
                        {/* User Info and Status */}
                        <Box className="flex justify-between items-start">
                            <Box>
                                <Typography variant="subtitle1" className="font-semibold">
                                    {comment?.user?.username || "Unknown User"}
                                </Typography>
                                <Typography variant="caption" className="text-gray-500">
                                    {comment?.user?.role?.name || "No Role"}
                                </Typography>
                            </Box>

                            {/* <Chip
                                icon={status.icon}
                                label={status.label}
                                size="small"
                                color={status.color}
                                className="ml-2"
                            /> */}
                        </Box>

                        {/* Comment Text (if not just a status) */}
                            <Typography variant="body2" className="mt-2 text-gray-700">
                                {comment?.comment}
                            </Typography>

                        {/* Timestamps */}
                        <Box className="flex flex-wrap gap-4 mt-3">
                            {comment?.created_at && (
                                <Typography variant="caption" className="text-gray-400">
                                    Created: {new Date(comment.created_at).toLocaleString()}
                                </Typography>
                            )}
                            {comment?.updated_at && comment.updated_at !== comment.created_at && (
                                <Typography variant="caption" className="text-gray-400">
                                    Updated: {new Date(comment.updated_at).toLocaleString()}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};
