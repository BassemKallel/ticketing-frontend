import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import userService from '../services/userService';

// Importation des composants
import UserTable from '../components/users/UserTable';
import UserFilters from '../components/users/UserFilters';
import ConfirmationModal from '../components/tickets/ConfirmationModal';
import EditUserModal from '../components/users/EditUserModal'; // Importer la modale d'édition

const UsersListPage = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user: currentUser } = useAuth();

    // États pour la suppression
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // États pour la modale d'édition
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);

    const [filters, setFilters] = useState({ search: '', role: '' });

    // Fonction pour récupérer les utilisateurs
    const fetchUsers = async () => {
        try {
            // Pas besoin de setIsLoading(true) ici si on l'appelle depuis useEffect
            const usersData = await userService.getAllUsers();
            setAllUsers(usersData);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Logique de filtrage
    const filteredUsers = useMemo(() => {
        let users = [...allUsers];
        const searchTerm = filters.search.toLowerCase().trim();
        if (searchTerm) {
            users = users.filter(user =>
                user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm)
            );
        }
        if (filters.role) {
            users = users.filter(user => user.role === filters.role);
        }
        return users;
    }, [allUsers, filters]);

    // Ouvre la modale de suppression
    const handleDeleteRequest = (userId) => {
        setUserToDelete(userId);
    };

    // Ouvre la modale d'édition et passe les données de l'utilisateur
    const handleEditRequest = (user) => {
        setUserToEdit(user);
        setIsEditModalOpen(true);
    };

    // Confirme la suppression
    const confirmDelete = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        try {
            await userService.deleteUser(userToDelete);
            setAllUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete));
        } catch (err) {
            console.error("Erreur lors de la suppression de l'utilisateur:", err);
        } finally {
            setIsDeleting(false);
            setUserToDelete(null);
        }
    };
    
    const handleViewUser = (userId) => console.log("Voir l'utilisateur:", userId);

    if (isLoading) return <div className="text-center p-8">Chargement des utilisateurs...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4 max-w-7xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
            </div>

            <UserFilters 
                filters={filters}
                setFilters={setFilters}
                onReset={() => setFilters({ search: '', role: '' })}
            />

            <UserTable
                users={filteredUsers}
                currentUser={currentUser}
                onViewUser={handleViewUser}
                onEditUser={handleEditRequest}
                onDeleteUser={handleDeleteRequest}
            />

            <ConfirmationModal
                isOpen={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                onConfirm={confirmDelete}
                title="Supprimer l'Utilisateur"
                message="Êtes-vous sûr de vouloir supprimer cet utilisateur? Cette action est irréversible."
                isConfirming={isDeleting}
            />
            
            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                userToEdit={userToEdit}
                onSuccess={fetchUsers} // Rafraîchit la liste après une mise à jour réussie
            />
        </div>
    );
};

export default UsersListPage;
