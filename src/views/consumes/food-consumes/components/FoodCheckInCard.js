import FoodCheckInItem from "./FoodCheckInItem";

const { Utensils } = require("lucide-react");

const FoodCheckInCard = ({ addon, addonIndex, toggleAttendance }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="bg-attendance-gradient px-6 py-4">
                <div className="flex items-center gap-2 text-white">
                    <Utensils className="w-5 h-5" />
                    <h2 className="text-lg font-semibold text-white">
                        Food Add-on #{addon.food_add_on_id}
                    </h2>
                </div>
            </div>

            <div className="divide-y divide-gray-100">
                {addon.mapped_data.map((mapped, userIndex) => (
                    <FoodCheckInItem
                        key={mapped.mapping_id}
                        mapped={mapped}
                        onToggle={() => toggleAttendance(addonIndex, userIndex)}
                    />
                ))}
            </div>
        </div>
    );
};

export default FoodCheckInCard;