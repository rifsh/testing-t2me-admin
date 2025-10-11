const { User, Clock } = require("lucide-react");

const FoodCheckInItem = ({ mapped, onToggle }) => {
    const isConsumed = mapped.consumed || mapped.tempConsumed;
    const isEditable = mapped.editable;

    return (
        <div className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isConsumed ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                            <User className={`w-5 h-5 ${isConsumed ? 'text-green-600' : 'text-gray-400'
                                }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                                {mapped.user_data?.name || 'Unknown User'}
                            </p>
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="truncate">
                                    {mapped.slot_data?.name} • {mapped.slot_data?.start_time} - {mapped.slot_data?.end_time}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    disabled={!isEditable}
                    onClick={onToggle}
                    className={`
                        flex-shrink-0 px-5 py-2.5 rounded-lg font-medium text-sm
                        transition-all duration-200 transform active:scale-95
                        ${isConsumed
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md hover:shadow-lg'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }
                        ${!isEditable && 'opacity-50 cursor-not-allowed active:scale-100'}
                    `}
                >
                    {isConsumed ? '✓ Consumed' : 'Mark as Consumed'}
                </button>
            </div>
        </div>
    );
};

export default FoodCheckInItem;