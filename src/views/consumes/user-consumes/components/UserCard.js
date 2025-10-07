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
                    </div>
                </div>

                {/* Checkbox / Status */}
                {isLocked ? (
                    <div className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-green-600 text-white">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Consumed</span>
                    </div>
                ) : (
                    <label className="relative flex items-center cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={isPresent}
                            onChange={() => toggleAttendance(bookingIndex, userIndex)}
                            className="absolute opacity-0 w-0 h-0"
                            disabled={isLocked}
                        />
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 ${isPresent
                                    ? 'bg-green-500 shadow-lg shadow-green-500/30'
                                    : ' border-2 border-[#8c0a1f]'
                                }`}
                        >
                            {isPresent ? (
                                <Check className="w-5 h-5 text-white font-bold" />
                            ) : (
                                <div className="w-5 h-5 bg-white/20 rounded-md flex items-center justify-center">
                                    <div className="w-3 h-3 bg-white rounded-sm opacity-80"></div>
                                </div>
                            )}
                        </div>

                        {/* Tooltip */}
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                            {isPresent ? 'Mark Absent' : 'Mark Present'}
                        </div>
                    </label>
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