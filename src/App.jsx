import React from 'react';
import AppRoutes from './routes/index'
import { ToastContainer } from 'react-toastify';


function App() {
    return (
        <div>
            <AppRoutes />
            <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
        />
        </div>
    );
}

export default App;
