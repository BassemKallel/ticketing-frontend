import React from 'react';
import Modal from '../ui/Modal';
import { PaperClipIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import ticketService from '../../services/ticketService';


const CreateTicketModal = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categorie, setCategorie] = useState('Question'); // 'categorie' comme attendu par le backend
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('categorie', categorie);
        if (file) {
            formData.append('fichier', file);
        }

        try {
            await ticketService.create(formData);
            alert('Ticket created successfully!'); // Remplacer par un toast plus tard
            onClose(); // Ferme la modale
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Ticket">
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                    <input type="text" id="subject" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Brief description of the issue" required />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea id="description" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Detailed explanation of your issue" required></textarea>
                </div>
                <div>
                    <label htmlFor="categorie" className="block text-sm font-medium text-gray-700">Categorie</label>
                    <select id="categorie" value={categorie} onChange={(e) => setCategorie(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                        <option value="Question">Question</option>
                        <option value="Demande">Demande</option>
                        <option value="Bloquant">Bloquant</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Attachments</label>
                    <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                        <div className="space-y-1 text-center">
                            <PaperClipIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500">
                                    <span>Upload a file</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                            {file && <p className="text-sm text-green-600 mt-2">{file.name}</p>}
                        </div>
                    </div>
                </div>
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="rounded-md border border-transparent bg-orange-400 py-2 px-4 text-sm font-medium text-white shadow-sm transition-colors duration-100  hover:bg-orange-300 disabled:bg-orange-200">
                        {isSubmitting ? 'Creating...' : 'Create Ticket'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateTicketModal;