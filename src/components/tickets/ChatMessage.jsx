import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

const ChatMessage = ({ message, currentUser, onDeleteRequest }) => {
    if (!message || !message.auteur) return null;

    const isCurrentUser = String(message.auteur.id) === String(currentUser.id);
    const isTeamMember = ['admin', 'agent'].includes(message.auteur.role);
    const isDeletable = !message.id.toString().startsWith('desc-');
    const canDelete = isDeletable && (isCurrentUser || currentUser.role === 'admin');

    const formattedDate = message.created_at ? new Date(message.created_at).toLocaleString() : 'Date invalide';

    // Si l'utilisateur connecté est admin/agent : lui + autres admin/agent à droite
    // Si l'utilisateur connecté est client : seul lui à droite
    const currentUserIsTeamMember = ['admin', 'agent'].includes(currentUser.role);
    const isRightAligned = isCurrentUser || (currentUserIsTeamMember && isTeamMember);

    return (
        <div className={`group flex w-full max-w-lg items-start gap-3 ${isRightAligned ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}>
            {!isRightAligned && (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-600">
                    {message.auteur.name?.charAt(0) || '?'}
                </div>
            )}

            <div className={`relative w-full rounded-lg p-3 ${isRightAligned ? 'bg-[#F28C38] text-white' : 'bg-gray-100 text-gray-800'}`}>
                <div className="flex items-baseline gap-2 text-xs mb-1">
                    <p className="font-bold">{message.auteur.name}</p>
                    <p className={`${isRightAligned ? 'text-orange-200' : 'text-gray-500'}`}>{formattedDate}</p>
                </div>
                <p className="whitespace-pre-wrap text-sm">{message.contenu}</p>
                {canDelete && (
                    <button
                        onClick={() => onDeleteRequest('commentaire', message.id)}
                        title="Supprimer ce commentaire"
                        className={`absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${isRightAligned ? 'text-orange-100 hover:text-white' : 'text-gray-400 hover:text-red-500'}`}
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                )}
            </div>
            {isRightAligned && (
                <div className="h-8 w-8 rounded-full bg-orange-400 flex-shrink-0 flex items-center justify-center font-bold text-white">
                    {message.auteur.name?.charAt(0) || '?'}
                </div>
            )}
        </div>
    );
};

export default ChatMessage;