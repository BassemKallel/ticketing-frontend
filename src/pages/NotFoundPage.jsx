import React from 'react';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const NotFoundPage = () => {
    const handleGoBack = () => {
        window.history.back();
    };

    const handleGoHome = () => {
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* 404 */}
                <div className="mb-8">
                    <h1 className="text-8xl font-bold text-orange-500 mb-4">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        Page introuvable
                    </h2>
                    <p className="text-gray-600">
                        La page que vous cherchez n'existe pas.
                    </p>
                </div>

                {/* Boutons */}
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={handleGoBack}
                        className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Retour
                    </button>
                    <button
                        onClick={handleGoHome}
                        className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                        <HomeIcon className="h-4 w-4 mr-2" />
                        Accueil
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;