import React from 'react';
import { Check, X, User, Mail, Clock, CheckCircle2, Lock } from 'lucide-react';

const UserCard = ({ user, bookingIndex, userIndex, toggleAttendance }) => {
    const isLocked = user.consumed === true; // permanent from API
    const isPresent = isLocked ? true : !!user.tempConsumed; // show temp if not locked

    return (
        <div
            className={`border-2 rounded-xl p-4 transition-all duration-200 shadow-md ${isPresent
                ? 'border-green-300 bg-green-100'
                : 'border-gray-200 bg-gray-50 hover:border-blue-100'
                } ${isLocked ? 'opacity-80' : ''}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${isPresent
                            ? 'bg-green-500'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                            }`}
                    >
                        {isLocked ? (
                            <Lock className="w-5 h-5 text-white" />
                        ) : (
                            <User className="w-6 h-6 text-white" />
                        )}
                    </div>

                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 capitalize">
                            {user.name}
                            {isLocked && (
                                <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                    Verified
                                </span>
                            )}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>{user.age} years • {user.sex}</span>
                            {user.email && (
                                <div className="flex items-center space-x-1">
                                    <Mail className="w-4 h-4" />
                                    <span>{user.email}</span>
                                </div>
                            )}
                        </div>
                        {/* {user.user_id && (
                            <div className="text-xs text-gray-500 mt-1">
                                User ID: {user.user_id}
                            </div>
                        )} */}
                    </div>
                </div>

                {/* Button / Status */}
                {isLocked ? (
                    <div className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-green-500 text-white">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verified</span>
                    </div>
                ) : (
                    <button
                        onClick={() => toggleAttendance(bookingIndex, userIndex)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isPresent
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:brightness-110'
                            }`}
                    >
                        {isPresent ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Present</span>
                            </>
                        ) : (
                            <>
                                <Clock className="w-4 h-4" />
                                <span>Mark Present</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {isLocked && (
                <div className="mt-2 text-xs text-green-600 flex items-center">
                    <Lock className="w-3 h-3 mr-1" />
                    This has been verified and cannot be modified
                </div>
            )}
        </div>
    );
};


export default UserCard;