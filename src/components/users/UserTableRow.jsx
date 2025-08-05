import React from 'react';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const UserTableRow = ({ user, currentUser, onView, onEdit, onDelete }) => (
    <tr className="hover:bg-gray-50">
        <td className="px-3 py-3">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex-shrink-0 flex items-center justify-center font-bold text-orange-500 text-base">
                    {user.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                </div>
            </div>
        </td>
        <td className="px-4 py-4">
            <span className={`px-2 py-1 text-sm font-semibold rounded-full ${
                user.role === 'admin' ? 'bg-red-100 text-red-700' :
                user.role === 'agent' ? 'bg-blue-100 text-blue-700' :
                'bg-green-100 text-green-700'
            }`}>
                {user.role}
            </span>
        </td>
        <td className="px-4 py-4 text-sm text-gray-600">
            {new Date(user.created_at).toLocaleDateString()}
        </td>
        <td className="px-4 py-4 text-center">
            {currentUser?.role === 'admin' && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => onView(user.id)}
                        className="p-2 text-gray-400 hover:text-green-600 rounded-full hover:bg-green-100"
                        title="Voir"
                    >
                        <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => onEdit(user.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-100"
                        title="Modifier"
                    >
                        <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => onDelete(user.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100"
                        title="Supprimer"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            )}
        </td>
    </tr>
);

export default UserTableRow;
