import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import userService from '../../services/userService';
import { toast } from 'react-toastify';

const EditUserModal = ({ isOpen, onClose, userToEdit, onSuccess }) => {
    const [formData, setFormData] = useState({ name: '', email: '', role: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cet useEffect est essentiel : il pré-remplit le formulaire
    // chaque fois que vous cliquez sur un nouvel utilisateur à éditer.
    useEffect(() => {
        if (userToEdit) {
            setFormData({
                name: userToEdit.name || '',
                email: userToEdit.email || '',
                role: userToEdit.role || '',
            });
        }
    }, [userToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const toastId = toast.loading("Mise à jour de l'utilisateur...");

        try {
            await userService.updateUser(userToEdit.id, formData);
            toast.update(toastId, { render: "Utilisateur mis à jour avec succès !", type: "success", isLoading: false, autoClose: 5000 });
            onSuccess(); // Pour rafraîchir la liste dans la page parente
            onClose();   // Ferme la modale
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Une erreur est survenue.";
            toast.update(toastId, { render: errorMessage, type: "error", isLoading: false, autoClose: 5000 });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Empêche d'afficher la modale si aucune donnée n'est prête
    if (!userToEdit) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Modifier ${userToEdit.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm" required />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm" required />
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rôle</label>
                    <select name="role" id="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm" required>
                        <option value="client">Client</option>
                        <option value="agent">Agent</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                        Annuler
                    </button>
                    <button type="submit" disabled={isSubmitting} className="rounded-md border border-transparent bg-orange-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-600 disabled:bg-orange-300">
                        {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditUserModal;
