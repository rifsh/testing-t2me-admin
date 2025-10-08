const { Utensils } = require("lucide-react");

const EmptyState = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Food Add-ons Found</h3>
            <p className="text-gray-500">There are no food check-ins available for this booking.</p>
        </div>
    );
};

export default EmptyState;