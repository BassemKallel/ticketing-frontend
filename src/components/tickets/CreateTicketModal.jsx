import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { PaperClipIcon } from '@heroicons/react/24/outline';
import ticketService from '../../services/ticketService';
import { toast } from 'react-toastify'; // Importation de react-toastify

const CreateTicketModal = ({ isOpen, onClose, onTicketCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categorie, setCategorie] = useState('Question');
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fonction pour réinitialiser le formulaire
    const resetForm = () => {
        setTitle('');
        setDescription('');
        setCategorie('Question');
        setFile(null);
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const creatingToast = toast.loading("Création du ticket en cours...");

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('categorie', categorie);
        if (file) {
            formData.append('fichier', file);
        }

        try {
            const response = await ticketService.create(formData);
            toast.update(creatingToast, { 
                render: response.message || "Ticket créé avec succès !", 
                type: "success", 
                isLoading: false, 
                autoClose: 5000 
            });
            
            if(onTicketCreated) {
                onTicketCreated(); // Rafraîchit la liste des tickets
            }

            resetForm();
            onClose(); // Ferme la modale

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Une erreur est survenue lors de la création du ticket.";
            toast.update(creatingToast, { 
                render: errorMessage, 
                type: "error", 
                isLoading: false, 
                autoClose: 5000 
            });
            console.error("Erreur de création de ticket:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Créer un Nouveau Ticket">
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Sujet</label>
                    <input type="text" id="subject" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm" placeholder="Brève description du problème" required />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea id="description" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm" placeholder="Explication détaillée de votre problème" required></textarea>
                </div>
                <div>
                    <label htmlFor="categorie" className="block text-sm font-medium text-gray-700">Catégorie</label>
                    <select id="categorie" value={categorie} onChange={(e) => setCategorie(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm">
                        <option value="Question">Question</option>
                        <option value="Demande">Demande</option>
                        <option value="Bloquant">Bloquant</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Pièces jointes</label>
                    <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                        <div className="space-y-1 text-center">
                            <PaperClipIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-medium text-orange-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 hover:text-orange-500">
                                    <span>Télécharger un fichier</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                </label>
                                <p className="pl-1">ou glisser-déposer</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, PDF jusqu'à 10MB</p>
                            {file && <p className="text-sm text-green-600 mt-2">{file.name}</p>}
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">Annuler</button>
                    <button type="submit" disabled={isSubmitting} className="rounded-md border border-transparent bg-orange-500 py-2 px-4 text-sm font-medium text-white shadow-sm transition-colors duration-100 hover:bg-orange-600 disabled:bg-orange-300">
                        {isSubmitting ? 'Création...' : 'Créer le Ticket'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateTicketModal;
