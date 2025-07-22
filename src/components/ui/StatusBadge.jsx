const StatusBadge = ({ type, value }) => {
    const statusColors = {
        'Open': 'bg-orange-100 text-orange-600',
        'In Progress': 'bg-blue-100 text-blue-600',
        'Resolved': 'bg-green-100 text-green-600',
    };
    
    const priorityColors = {
        'High': 'bg-red-100 text-red-600',
        'Medium': 'bg-yellow-100 text-yellow-600',
        'Low': 'bg-green-100 text-green-600',
    };

    const colors = type === 'status' ? statusColors : priorityColors;
    
    return (
        <span className={`px-2 py-1 rounded-full text-sm font-semibold ${colors[value]}`}>
            {value}
        </span>
    );
};

export default StatusBadge;