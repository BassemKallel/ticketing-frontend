import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== passwordConfirmation) {
            setError("Passwords do not match.");
            return;
        }
        try {
            await authService.register({ name, email, password, password_confirmation: passwordConfirmation });
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <section className="min-h-screen my-10 bg-gradient-to-b from-white to-[#F5F5F5]">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <a href="#" className="flex items-center mb-6 text-3xl font-semibold text-gray-900">
                    <img
                        className="w-20 h-20 mr-2 transition-transform duration-300 hover:scale-105"
                        src="src/assets/Logo-tiktak.png"
                        alt="logo"
                    />
                    TikTak Pro Support 
                </a>
                <div className="w-full bg-white rounded-lg shadow-md md:mt-0 sm:max-w-md xl:p-0 hover:shadow-lg transition-shadow duration-300">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                            Create your account
                        </h1>
                        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-white border border-[#F4C430] text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F28C38] focus:border-[#F28C38] block w-full p-2.5 transition-colors duration-300"
                                    placeholder="Your Name"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-white border border-[#F4C430] text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F28C38] focus:border-[#F28C38] block w-full p-2.5 transition-colors duration-300"
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-white border border-[#F4C430] text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F28C38] focus:border-[#F28C38] block w-full p-2.5 transition-colors duration-300"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="confirm-password" className="block mb-2 text-sm font-medium text-gray-900">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    id="confirm-password"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    className="bg-white border border-[#F4C430] text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F28C38] focus:border-[#F28C38] block w-full p-2.5 transition-colors duration-300"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="terms"
                                    id="terms"
                                    className="w-4 h-4 border border-[#F4C430] rounded bg-white focus:ring-3 focus:ring-[#F4C430] transition-colors duration-300"
                                    required
                                />
                                <label htmlFor="terms" className="ml-3 text-sm text-gray-500">
                                    I agree to the{" "}
                                    <a href="#" className="text-[#F28C38] hover:text-[#FFE4B5] transition-colors duration-300">
                                        Terms and Conditions
                                    </a>
                                </label>
                            </div>
                            <button
                                type="submit"
                                className="w-full text-white bg-[#F28C38] hover:bg-[#F4C430] focus:ring-4 focus:outline-none focus:ring-[#F4C430] font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors duration-300"
                            >
                                Sign up
                            </button>
                            <div className="bg-[#FFF3E0] p-4 rounded-lg text-center transition-colors duration-300 hover:bg-[#FFE4B5]">
                                <p className="text-sm font-light text-gray-900">
                                    Already have an account?{" "}
                                    <Link
                                        to="/login"
                                        className="font-medium text-[#F28C38] text-sm hover:text-[#FFE4B5] transition-colors duration-300"
                                    >
                                        Sign in
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

export default Signup;