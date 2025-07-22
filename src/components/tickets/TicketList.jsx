import StatusBadge from '../ui/StatusBadge';
import { useNavigate } from 'react-router-dom';


const TicketList = ({ tickets, isLoading, error }) => {
    const navigate = useNavigate();

    const handleTicketClick = (ticketId) => {
        navigate(`/tickets/${ticketId}`);
    };

    if (isLoading) {
        return <div className="text-center p-8">Chargement des tickets...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Erreur: {error}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 uppercase text-xs">
                            <th className="px-4 py-3">Ticket ID</th>
                            <th className="px-4 py-3">Subject</th>
                            <th className="px-4 py-3">Created By</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Categorie</th>
                            <th className="px-4 py-3">Assigned To</th>
                            <th className="px-4 py-3">Created</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {tickets.length > 0 ? tickets.map(ticket => (
                            <tr key={ticket.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleTicketClick(ticket.id)}>
                                <td className="px-4 py-4 font-semibold text-gray-800">TKT-{ticket.id}</td>
                                <td className="px-4 py-4">{ticket.title}</td>
                                <td className="px-4 py-4">{ticket.createur.name}</td>
                                <td className="px-4 py-4"><StatusBadge type="status" value={ticket.statut} /></td>
                                <td className="px-4 py-4"><StatusBadge value={ticket.categorie} /></td>
                                <td className="px-4 py-4">{ticket.agent?.name || 'Unassigned'}</td>
                                <td className="px-4 py-4 text-gray-600">{new Date(ticket.created_at).toLocaleDateString()}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" className="text-center py-8 text-gray-500">Aucun ticket à afficher.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TicketList;