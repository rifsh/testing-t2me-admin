import React from 'react';
import { Check, Loader } from 'lucide-react';

const AttendanceFooter = ({ total, isDisabled, present, handleSubmit, loading }) => {
    return (
        <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center">
                <div className="text-gray-600">
                    <span className="font-medium">{present}</span> out of{' '}
                    <span className="font-medium">{total}</span> participants marked as consumed
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={isDisabled || loading}
                    className={`
                        relative px-4 py-2 rounded-full font-semibold transition-all duration-200 
                        flex items-center space-x-2 min-w-[140px] justify-center
                        ${loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : isDisabled
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-[#f20c32] hover:bg-[#d50a2b] text-white shadow-md hover:shadow-lg'
                        }
                    `}
                >
                    {loading ? (
                        <>
                            <Loader className="w-5 h-5 animate-spin" />
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <Check className="w-5 h-5" />
                            <span>Consume Users</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AttendanceFooter;
