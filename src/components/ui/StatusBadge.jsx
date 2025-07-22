const StatusBadge = ({ type, value }) => {
    const statusColors = {
        'Ouvert': 'bg-orange-100 text-orange-600',
        'En_cours': 'bg-blue-100 text-blue-600',
        'Resolu': 'bg-green-100 text-green-600',
        'Ferme': 'bg-red-100 text-red-600'
    };
    
    const priorityColors = {
        'Bloquant': 'bg-red-100 text-red-600',
        'Question': 'bg-yellow-100 text-yellow-600',
        'Demande': 'bg-green-100 text-green-600',
    };

    const colors = type === 'status' ? statusColors : priorityColors;
    
    return (
        <span className={`px-2 py-1 rounded-full text-sm font-semibold ${colors[value]}`}>
            {value}
        </span>
    );
};

export default StatusBadge;