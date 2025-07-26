import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';

import ticketService from '../../services/ticketService';



const ChangeStatusModal = ({ isOpen, onClose, ticket, onTicketUpdate }) => {
    const [newStatus, setNewStatus] = useState(ticket?.statut || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setNewStatus(ticket.statut);
            setError('');
        }
    }, [isOpen, ticket]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const updatedTicket = await ticketService.updateStatus(ticket.id, { statut: newStatus });
            onTicketUpdate(updatedTicket);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Change Ticket Status">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">New Status</label>
                    <select id="status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                        <option value="Ouvert">Open</option>
                        <option value="En_cours">In Progress</option>
                        <option value="Resolu">Resolved</option>
                        <option value="Ferme">Closed</option>
                    </select>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="rounded-md border border-transparent bg-orange-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-600 disabled:bg-orange-300">{isSubmitting ? 'Updating...' : 'Update Status'}</button>
                </div>
            </form>
        </Modal>
    );
};

export default ChangeStatusModal;
