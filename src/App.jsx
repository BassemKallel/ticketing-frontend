import React from 'react';
import AppRoutes from './routes/index'
import { ToastContainer , Bounce } from 'react-toastify';

function App() {
    return (
        <div>
            <AppRoutes />
            <ToastContainer
                position="bottom-right"
                autoClose={3000}          
                hideProgressBar={true}    
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable={false}          
                pauseOnHover
                theme="light"
                transition={Bounce}       
                limit={3}
            />
        </div>
    );
}

export default App;
