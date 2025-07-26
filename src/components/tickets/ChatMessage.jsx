const ChatMessage = ({ message, currentUser }) => {
    if (!message || !message.auteur) return null;
    const isCurrentUser = message.auteur.id === currentUser?.id;

    return (
        <div className={`flex gap-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            {!isCurrentUser && (
                <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-600">
                    {message.auteur.name.charAt(0)}
                </div>
            )}
            <div className={`w-full max-w-lg p-4 rounded-lg ${isCurrentUser ? 'bg-[#F28C38] text-white' : 'bg-gray-100'}`}>
                <div className={`flex items-baseline space-x-2 ${isCurrentUser ? 'justify-end' : ''}`}>
                    <p className="font-bold">{message.auteur.name}</p>
                    <p className={`text-xs ${isCurrentUser ? 'text-orange-200' : 'text-gray-500'}`}>{new Date(message.created_at).toLocaleTimeString()}</p>
                </div>
                <p className="mt-1 whitespace-pre-wrap">{message.contenu}</p>
            </div>
            {isCurrentUser && (
                <div className="h-10 w-10 rounded-full bg-[#F28C38] flex-shrink-0 flex items-center justify-center font-bold text-white">
                    {message.auteur.name.charAt(0)}
                </div>
            )}
        </div>
    );
};

export default ChatMessage;