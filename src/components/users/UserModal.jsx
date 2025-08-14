import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from '../ui/Modal';
import userService from '../../services/userService';

const UserModal = ({ isOpen, onClose, userToEdit, onSuccess }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // --- 1. AJOUT : État pour la confirmation du mot de passe ---
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [role, setRole] = useState('client');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const isEditMode = Boolean(userToEdit);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setName(userToEdit.name);
                setEmail(userToEdit.email);
                setRole(userToEdit.role);
                setPassword('');
                setPasswordConfirmation(''); // On réinitialise aussi ce champ
            } else {
                setName('');
                setEmail('');
                setPassword('');
                setPasswordConfirmation(''); // On réinitialise aussi ce champ
                setRole('client');
            }
            setErrors({});
        }
    }, [isOpen, userToEdit, isEditMode]);

    const validateForm = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = "Le nom est requis.";
        if (!email.trim()) {
            newErrors.email = "L'email est requis.";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "L'adresse email est invalide.";
        }
        if (!isEditMode && !password) {
            newErrors.password = "Le mot de passe est requis pour un nouvel utilisateur.";
        }
        // --- 2. AJOUT : Validation de la confirmation ---
        if (password && password !== passwordConfirmation) {
            newErrors.password_confirmation = "Les mots de passe ne correspondent pas.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        // --- 3. AJOUT : On inclut la confirmation dans les données envoyées ---
        const userData = { name, email, role };
        if (password) {
            userData.password = password;
            userData.password_confirmation = passwordConfirmation;
        }

        try {
            let response;
            if (isEditMode) {
                response = await userService.updateUser(userToEdit.id, userData);
                toast.success(`Utilisateur "${response.user.name}" mis à jour avec succès.`);
            } else {
                response = await userService.createUser(userData);
                toast.success(`Utilisateur "${response.user.name}" créé avec succès.`);
            }
            onSuccess(response);
            onClose();
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setErrors(err.response.data.errors);
                toast.error("Veuillez corriger les erreurs dans le formulaire.");
            } else {
                toast.error(err.message || "Une erreur s'est produite.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500" />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>}
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500" />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>}
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isEditMode ? "Laisser vide pour ne pas changer" : ""} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500" />
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password[0]}</p>}
                </div>
                <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                    <input type="password" id="password_confirmation" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500" />
                    {errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation[0] || errors.password_confirmation}</p>}
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rôle</label>
                    <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500">
                        <option value="client">Client</option>
                        <option value="agent">Agent</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                        Annuler
                    </button>
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-md shadow-sm hover:bg-orange-600 disabled:bg-orange-300">
                        {isSubmitting ? 'Sauvegarde...' : (isEditMode ? 'Mettre à jour' : 'Créer')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default UserModal;
