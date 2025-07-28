import React from 'react';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const UserTableRow = ({ user, currentUser, onViewUser, onEditUser, onDeleteUser }) => {
    
    // Logique pour déterminer les permissions
    const isAdmin = currentUser?.role === 'admin';
    const isSelf = String(currentUser?.id) === String(user.id);

    const canEdit = isAdmin;
    const canDelete = isAdmin && !isSelf;

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-700';
            case 'agent':
                return 'bg-blue-100 text-blue-700';
            case 'client':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex-shrink-0 flex items-center justify-center font-bold text-orange-500 text-sm">
                        {user.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                        <p className="font-semibold text-sm text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                </div>
            </td>

            {/* Colonne Rôle */}
            <td className="px-5 py-4">
                <span className={`px-2 py-1 text-sm font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                </span>
            </td>

            {/* Colonne Date de création */}
            <td className="px-5 py-4 text-sm text-gray-600">
                {new Date(user.created_at).toLocaleDateString()}
            </td>

            {/* Colonne Actions */}
            <td className="px-5 py-4">
                <div className="flex items-center justify-center gap-2">
                    {/* Bouton Voir */}
                    <button 
                        onClick={() => onViewUser(user.id)}
                        className="p-1.5 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        title="Voir les détails de l'utilisateur"
                    >
                        <EyeIcon className="h-5 w-5" />
                    </button>

                    {/* Bouton Modifier */}
                    <button 
                        onClick={() => onEditUser(user.id)}
                        className="p-1.5 text-gray-400 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent hover:bg-green-100 hover:text-green-700"
                        title={canEdit ? "Modifier cet utilisateur" : "Action non autorisée"}
                        disabled={!canEdit}
                    >
                        <PencilIcon className="h-5 w-5" />
                    </button>

                    {/* Bouton Supprimer */}
                    <button 
                        onClick={() => onDeleteUser(user.id)}
                        className="p-1.5 text-gray-400 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent hover:bg-red-100 hover:text-red-500"
                        title={canDelete ? "Supprimer cet utilisateur" : "Vous не pouvez pas vous supprimer"}
                        disabled={!canDelete}
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default UserTableRow;
