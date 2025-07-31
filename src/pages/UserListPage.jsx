import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth'; 
import userService from '../services/userService';

import UserTable from '../components/users/UserTable';
import UserFilters from '../components/users/UserFilters'; 
import ConfirmationModal from '../components/tickets/ConfirmationModal';

const UsersListPage = () => {
    const [allUsers, setAllUsers] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user: currentUser } = useAuth();
    
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [filters, setFilters] = useState({ search: '', role: '' });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                const usersData = await userService.getAllUsers();
                setAllUsers(usersData);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

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

    const handleDeleteRequest = (userId) => {
        setUserToDelete(userId);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        try {
            await userService.deleteUser(userToDelete);
            setAllUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete));
        } catch (err) {
            console.error("Erreur lors de la suppression de l'utilisateur:", err);
            // Gérer l'erreur (ex: toast)
        } finally {
            setIsDeleting(false);
            setUserToDelete(null);
        }
    };
    
    const handleViewUser = (userId) => console.log("Voir l'utilisateur:", userId);
    const handleEditUser = (userId) => console.log("Modifier l'utilisateur:", userId);
    
    if (isLoading){

        return(
        <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-400"></div>
        </div>);
    } 
    if (error) return <div className="text-center p-8 text-red-500">Erreur: {error}</div>;

    return (
        <div className="container mx-auto p-5 max-w-7xl">
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
                onEditUser={handleEditUser}
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
        </div>
    );
};

export default UsersListPage;
