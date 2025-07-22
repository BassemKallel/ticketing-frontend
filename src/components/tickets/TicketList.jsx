import React from 'react';
import StatusBadge from '../ui/StatusBadge';
import { useNavigate } from 'react-router-dom';


const TicketList = ({ title, tickets }) => {
    const navigate = useNavigate();

    const handleTicketClick = (ticketId) => {
        // Vérification de sécurité pour s'assurer que l'ID est valide
        if (!ticketId || !ticketId.includes('-')) {
            console.error("Format d'ID de ticket invalide:", ticketId);
            return;
        }
        // Enlève "TKT-" pour ne garder que le numéro
        const numericId = ticketId.split('-')[1];
        const path = `/tickets/${numericId}`;
        
        // Log pour le débogage : vérifiez la console de votre navigateur
        console.log(`Navigation vers : ${path}`);
        
        navigate(path);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                <button className="text-sm text-white bg-blue-500 hover:bg-blue-600 font-semibold px-4 py-2 rounded-lg transition-colors">
                    View All
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 uppercase text-xs">
                            <th className="px-4 py-3">Ticket ID</th>
                            <th className="px-4 py-3">Subject</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Priority</th>
                            <th className="px-4 py-3">Created</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {tickets.map(ticket => (
                            <tr key={ticket.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleTicketClick(ticket.id)}>
                                <td className="px-4 py-4 font-semibold text-gray-800">{ticket.id}</td>
                                <td className="px-4 py-4">{ticket.subject}</td>
                                <td className="px-4 py-4"><StatusBadge type="status" value={ticket.status} /></td>
                                <td className="px-4 py-4"><StatusBadge type="priority" value={ticket.priority} /></td>
                                <td className="px-4 py-4 text-gray-600">{ticket.created}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TicketList;