import React from 'react';
import { PaperClipIcon, TrashIcon } from '@heroicons/react/24/outline';

const AttachmentMessage = ({ attachment, currentUser, agents, onDeleteRequest }) => {
    if (!attachment || !attachment.auteur) return null;

    // --- LOGIQUE CORRIGÉE ---
    const authorRole = attachment.auteur.role;
    // Un message est considéré comme "staff" si l'auteur est un agent OU un admin.
    const isStaffMessage = authorRole === 'agent' || authorRole === 'admin';

    const isCurrentUser = String(attachment.auteur.id) === String(currentUser.id);
    const canDelete = isCurrentUser || currentUser.role === 'admin';

    return (
        <div className={`group flex w-full max-w-lg items-start gap-3 ${isStaffMessage ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}>
            {/* Avatar pour les clients */}
            {!isStaffMessage && (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-600">
                    {attachment.auteur.name?.charAt(0) || '?'}
                </div>
            )}

            {/* Bulle de message */}
            <div className={`relative w-full rounded-lg p-3 ${isStaffMessage ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <div className="flex items-baseline gap-2 text-xs mb-2">
                    <p className="font-bold">{attachment.auteur.name}</p>
                    <p className={`${isStaffMessage ? 'text-orange-100' : 'text-gray-500'}`}>{new Date(attachment.created_at).toLocaleString()}</p>
                </div>

                <a
                    href={`http://127.0.0.1:8000/storage/${attachment.chemin}`} // Assurez-vous que le backend envoie bien la propriété 'url'
                    target="_blank"
                    rel="noopener noreferrer"
                    title={attachment.chemin ? `Ouvrir ${attachment.nom_fichier}` : 'URL non disponible'}
                    className={`flex items-center gap-3 p-2 rounded-md transition-colors ${attachment.chemin
                            ? (isStaffMessage ? 'bg-orange-400 hover:bg-orange-300' : 'bg-gray-200 hover:bg-gray-300')
                            : 'cursor-not-allowed text-gray-400'
                        }`}
                >
                    <PaperClipIcon className={`h-6 w-6 flex-shrink-0 ${isStaffMessage ? 'text-orange-100' : 'text-gray-600'}`} />
                    <div className="flex-grow text-left">
                        <p className={`text-sm font-medium break-all ${isStaffMessage ? 'text-white' : 'text-gray-800'}`}>{attachment.nom_fichier}</p>
                        <p className={`text-xs ${isStaffMessage ? 'text-orange-100' : 'text-gray-500'}`}>
                            {attachment.taille ? `${(attachment.taille / 1024).toFixed(1)} KB` : ''}
                        </p>
                    </div>
                </a>

                {/* Bouton de suppression */}
                {canDelete && (
                    <button
                        onClick={() => onDeleteRequest('pièce jointe', attachment.id)}
                        title="Supprimer cette pièce jointe"
                        className={`absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${isStaffMessage ? 'text-orange-100 hover:text-white' : 'text-gray-400 hover:text-red-500'}`}
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Avatar pour l'équipe (admin/agent) */}
            {isStaffMessage && (
                <div className="h-8 w-8 rounded-full bg-orange-400 flex-shrink-0 flex items-center justify-center font-bold text-white">
                    {attachment.auteur.name?.charAt(0) || '?'}
                </div>
            )}
        </div>
    );
};

export default AttachmentMessage;
