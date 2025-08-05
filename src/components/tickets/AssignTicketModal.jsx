import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import ticketService from '../../services/ticketService';





const AssignTicketModal = ({ isOpen, onClose, ticketId, agents, onSuccess }) => {
    const [selectedAgent, setSelectedAgent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setSelectedAgent('');
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAgent) {
            setError('Please select an agent.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            const updatedTicket = await ticketService.assignAgent(ticketId, { agent_id: selectedAgent });
            onSuccess(updatedTicket);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Assign Ticket">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="agent" className="block text-sm font-medium text-gray-700">Select Agent</label>
                    <select id="agent" value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-400 focus:ring-orange-400 sm:text-sm">
                        <option value="">Select an agent</option>
                        {agents.map(agent => (
                            <option key={agent.id} value={agent.id}>{agent.name}</option>
                        ))}
                    </select>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="rounded-md border border-transparent bg-orange-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-400 disabled:bg-orange-300">{isSubmitting ? 'Assigning...' : 'Assign'}</button>
                </div>
            </form>
        </Modal>
    );
};

export default AssignTicketModal;