import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import ticketService from '../../services/ticketService';
import { toast } from 'react-toastify'; // Importation de react-toastify

const AssignTicketModal = ({ isOpen, onClose, ticketId, agents, onSuccess }) => {
    const [selectedAgent, setSelectedAgent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // On retire l'état d'erreur local, car les toasts vont le gérer
    useEffect(() => {
        if (!isOpen) {
            setSelectedAgent('');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAgent) {
            toast.warn('Veuillez sélectionner un agent.');
            return;
        }

        setIsSubmitting(true);
        const assigningToast = toast.loading("Assignation en cours...");

        try {
            // Le service s'occupe de l'appel API
            await ticketService.assignAgent(ticketId, { agent_id: selectedAgent });
            
            toast.update(assigningToast, { 
                render: "Agent assigné avec succès !", 
                type: "success", 
                isLoading: false, 
                autoClose: 5000 
            });

            // On appelle la fonction de succès passée en props
            if (onSuccess) {
                onSuccess();
            }
            onClose(); // Ferme la modale

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Une erreur est survenue lors de l'assignation.";
            toast.update(assigningToast, { 
                render: errorMessage, 
                type: "error", 
                isLoading: false, 
                autoClose: 5000 
            });
            console.error("Erreur d'assignation:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Assigner le Ticket">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="agent" className="block text-sm font-medium text-gray-700 mb-1">
                        Sélectionner un agent
                    </label>
                    <select 
                        id="agent" 
                        value={selectedAgent} 
                        onChange={(e) => setSelectedAgent(e.target.value)} 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                    >
                        <option value="" disabled>Choisir un agent...</option>
                        {agents.map(agent => (
                            <option key={agent.id} value={agent.id}>{agent.name}</option>
                        ))}
                    </select>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    >
                        Annuler
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="rounded-md border border-transparent bg-orange-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-orange-300 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Assignation...' : 'Assigner'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AssignTicketModal;
