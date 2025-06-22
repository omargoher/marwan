import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Phone, MapPin, Building2, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { signUpClient, signUpCompany } from '../../services/auth';
import { UserDTO, UserCompanyDTO } from '../../types';

const Signup = ({ onSignIn }: any) => {
    const [isCompany, setIsCompany] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        companyName: '',
        companyEmail: '',
        companyPhone: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsCompany(e.target.value === 'company');
        setFormData({
            ...formData,
            companyName: '',
            companyEmail: '',
            companyPhone: '',
            phone: '',
            address: '',
            city: ''
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            if (isCompany) {
                const companyData: UserCompanyDTO = {
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName || formData.email.split('@')[0],
                    lastName: formData.lastName,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    companyName: formData.companyName,
                    companyEmail: formData.companyEmail,
                    companyPhone: formData.companyPhone
                };

                const response = await signUpCompany(companyData);
                setMessage('Company signup successful! Redirecting to login...');
            } else {
                const clientData: UserDTO = {
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName || formData.email.split('@')[0],
                    lastName: formData.lastName,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city
                };

                const response = await signUpClient(clientData);
                setMessage('Client signup successful! Redirecting to login...');
            }

            setTimeout(() => {
                navigate('/signin');
            }, 2000);
        } catch (error: any) {
            console.error('Signup error:', error);
            setMessage('Signup failed: ' + (error.message || 'Something went wrong'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or {' '}
                        <Link to="/signin" className="font-medium text-blue-600 hover:text-blue-500">
                            sign in to your existing account
                        </Link>
                    </p>
                </div>

                {message && (
                    <div className={`rounded-md p-3 flex items-center ${message.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <p className="text-sm font-medium">{message}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="flex justify-center space-x-6 mb-4">
                        <label className="flex items-center cursor-pointer p-3 border border-gray-300 rounded-md shadow-sm flex-1 justify-center transition-colors duration-200 ease-in-out hover:border-blue-500" style={{ backgroundColor: !isCompany ? 'rgb(220 238 255)' : 'white', borderColor: !isCompany ? '#3b82f6' : '#d1d5db' }}>
                            <input
                                type="radio"
                                value="client"
                                checked={!isCompany}
                                onChange={handleRadioChange}
                                className="hidden"
                            />
                            <User className="h-5 w-5 mr-2 text-gray-600" />
                            <span className="text-sm font-medium text-gray-800">Client</span>
                        </label>
                        <label className="flex items-center cursor-pointer p-3 border border-gray-300 rounded-md shadow-sm flex-1 justify-center transition-colors duration-200 ease-in-out hover:border-blue-500" style={{ backgroundColor: isCompany ? 'rgb(220 238 255)' : 'white', borderColor: isCompany ? '#3b82f6' : '#d1d5db' }}>
                            <input
                                type="radio"
                                value="company"
                                checked={isCompany}
                                onChange={handleRadioChange}
                                className="hidden"
                            />
                            <Building2 className="h-5 w-5 mr-2 text-gray-600" />
                            <span className="text-sm font-medium text-gray-800">Company</span>
                        </label>
                    </div>

                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">Email address</label>
                            <div className="relative mt-1">
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="janedoe@mail.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="relative mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                                    placeholder="********"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                            <div className="relative mt-1">
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    autoComplete="given-name"
                                    className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Jane"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                            <div className="relative mt-1">
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    autoComplete="family-name"
                                    className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {!isCompany ? (
                        <div className="space-y-4 mt-4">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone number</label>
                                <div className="relative mt-1">
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        autoComplete="tel"
                                        className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="+1 (555) 123-4567"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                                <div className="relative mt-1">
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        autoComplete="street-address"
                                        className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="123 Main St"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                                <div className="relative mt-1">
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        autoComplete="address-level2"
                                        className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="New York"
                                        value={formData.city}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 mt-4">
                            <div>
                                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                                <div className="relative mt-1">
                                    <input
                                        type="text"
                                        id="companyName"
                                        name="companyName"
                                        required
                                        className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Acme Corporation"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700">Company Email</label>
                                <div className="relative mt-1">
                                    <input
                                        type="email"
                                        id="companyEmail"
                                        name="companyEmail"
                                        required
                                        className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="contact@acme.com"
                                        value={formData.companyEmail}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="companyPhone" className="block text-sm font-medium text-gray-700">Company Phone</label>
                                <div className="relative mt-1">
                                    <input
                                        type="tel"
                                        id="companyPhone"
                                        name="companyPhone"
                                        required
                                        className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="+1 (555) 123-4567"
                                        value={formData.companyPhone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
