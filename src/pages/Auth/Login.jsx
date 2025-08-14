import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login({ email, password });
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <section className="min-h-screen bg-gradient-to-b from-white to-[#F5F5F5]">
            <div className="flex flex-col items-center justify-center px-4 py-8 mx-auto md:h-screen lg:py-0">
                <a href="#" className="flex items-center mb-6 text-3xl font-semibold text-gray-900">
                    <img
                        className="w-20 h-20 font-extrabold mr-1 transition-transform duration-200 hover:scale-105"
                        src="src/assets/Logo-tiktak.png" // Assurez-vous que ce chemin est correct
                        alt="logo"
                    />
                    TikTak Pro Support
                </a>
                <div className="w-full bg-white rounded-lg shadow-md md:mt-0 sm:max-w-md xl:p-0 hover:shadow-lg transition-shadow duration-200">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                            Sign in to your account
                        </h1>
                        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block mb-2 text-sm font-medium text-gray-900"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-orange-400 focus:border-orange-400 block w-full p-2.5 transition-colors duration-200 focus:ring-2"
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block mb-2 text-sm font-medium text-gray-900"
                                >
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-orange-400 focus:border-orange-400 block w-full p-2.5 transition-colors duration-200 focus:ring-2"
                                    required
                                />
                            </div>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <div className="flex items-center justify-between">
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="remember"
                                            aria-describedby="remember"
                                            type="checkbox"
                                            className="w-4 h-4 border border-[#F4C430] rounded bg-white focus:ring-3 focus:ring-[#F4C430] transition-colors duration-200"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label
                                            htmlFor="remember"
                                            className="text-gray-500"
                                        >
                                            Remember me
                                        </label>
                                    </div>
                                </div>
                                <a
                                    href="#"
                                    className="text-sm font-medium text-[#F28C38] hover:text-[#F4C430] transition-colors duration-200"
                                >
                                    Forgot password?
                                </a>
                            </div>
                            <button
                                type="submit"
                                className="w-full text-white bg-[#F28C38] hover:bg-[#F4C430] focus:ring-4 focus:outline-none focus:ring-[#F4C430] font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors duration-200"
                            >
                                Sign in
                            </button>
                            <div className="bg-[#FFF3E0] p-4 rounded-lg text-center">
                                <p className="text-sm font-light text-gray-700">
                                    Don’t have an account yet?{" "}
                                    <Link
                                        to="/register"
                                        className="font-medium text-[#F28C38] text-sm hover:text-[#F4C430] transition-colors duration-200"
                                    >
                                        Sign up
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Login;