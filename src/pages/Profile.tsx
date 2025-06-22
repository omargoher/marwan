import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Shield, Bell, CreditCard, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

interface HealthFormData {
  allergies: string[];
  currentMedications: string[];
  conditions: string[];
  bloodType: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export default function Profile() {
  const navigate = useNavigate();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingHealth, setIsEditingHealth] = useState(false);
  const [profileData, setProfileData] = useState<ProfileFormData>(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        }
      };
    }
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      }
    };
  });

  const [healthData, setHealthData] = useState<HealthFormData>({
    allergies: ['Penicillin'],
    currentMedications: [],
    conditions: [],
    bloodType: 'O+',
    emergencyContact: {
      name: 'Jane Doe',
      phone: '(555) 987-6543',
      relationship: 'Spouse'
    }
  });

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    navigate('/signin');
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save profile changes to backend
    setIsEditingProfile(false);
  };

  const handleHealthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save health information to backend
    setIsEditingHealth(false);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-blue-600 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center">
                  <User className="h-12 w-12 text-blue-600" />
                </div>
                <div className="ml-6">
                  <h1 className="text-2xl font-bold text-white">
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                  <p className="text-blue-100">Member since January 2024</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-6">
            <div className="grid gap-6">
              {/* Personal Information */}
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {isEditingProfile ? 'Cancel' : 'Edit Personal Information'}
                  </button>
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Street Address</label>
                      <input
                        type="text"
                        value={profileData.address.street}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          address: { ...profileData.address, street: e.target.value }
                        })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input
                          type="text"
                          value={profileData.address.city}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            address: { ...profileData.address, city: e.target.value }
                          })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <input
                          type="text"
                          value={profileData.address.state}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            address: { ...profileData.address, state: e.target.value }
                          })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                        <input
                          type="text"
                          value={profileData.address.zipCode}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            address: { ...profileData.address, zipCode: e.target.value }
                          })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <span className="ml-3 text-gray-600">{profileData.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span className="ml-3 text-gray-600">{profileData.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span className="ml-3 text-gray-600">
                        {profileData.address.street}, {profileData.address.city}, {profileData.address.state} {profileData.address.zipCode}
                      </span>
                    </div>
                  </div>
                )}
              </section>

              {/* Health Information */}
              <section className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Health Information</h2>
                  <button
                    onClick={() => setIsEditingHealth(!isEditingHealth)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {isEditingHealth ? 'Cancel' : 'Update Health Information'}
                  </button>
                </div>

                {isEditingHealth ? (
                  <form onSubmit={handleHealthSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Allergies</label>
                      <input
                        type="text"
                        value={healthData.allergies.join(', ')}
                        onChange={(e) => setHealthData({
                          ...healthData,
                          allergies: e.target.value.split(',').map(item => item.trim())
                        })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="Enter allergies separated by commas"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Medications</label>
                      <input
                        type="text"
                        value={healthData.currentMedications.join(', ')}
                        onChange={(e) => setHealthData({
                          ...healthData,
                          currentMedications: e.target.value.split(',').map(item => item.trim())
                        })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="Enter medications separated by commas"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
                      <input
                        type="text"
                        value={healthData.conditions.join(', ')}
                        onChange={(e) => setHealthData({
                          ...healthData,
                          conditions: e.target.value.split(',').map(item => item.trim())
                        })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="Enter conditions separated by commas"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                      <select
                        value={healthData.bloodType}
                        onChange={(e) => setHealthData({ ...healthData, bloodType: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-700">Emergency Contact</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                          type="text"
                          value={healthData.emergencyContact.name}
                          onChange={(e) => setHealthData({
                            ...healthData,
                            emergencyContact: { ...healthData.emergencyContact, name: e.target.value }
                          })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                          type="tel"
                          value={healthData.emergencyContact.phone}
                          onChange={(e) => setHealthData({
                            ...healthData,
                            emergencyContact: { ...healthData.emergencyContact, phone: e.target.value }
                          })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Relationship</label>
                        <input
                          type="text"
                          value={healthData.emergencyContact.relationship}
                          onChange={(e) => setHealthData({
                            ...healthData,
                            emergencyContact: { ...healthData.emergencyContact, relationship: e.target.value }
                          })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900">Allergies</h3>
                      <p className="text-gray-600 mt-1">
                        {healthData.allergies.length > 0 ? healthData.allergies.join(', ') : 'None listed'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900">Current Medications</h3>
                      <p className="text-gray-600 mt-1">
                        {healthData.currentMedications.length > 0 ? healthData.currentMedications.join(', ') : 'None listed'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900">Medical Conditions</h3>
                      <p className="text-gray-600 mt-1">
                        {healthData.conditions.length > 0 ? healthData.conditions.join(', ') : 'None listed'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900">Blood Type</h3>
                      <p className="text-gray-600 mt-1">{healthData.bloodType}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900">Emergency Contact</h3>
                      <div className="mt-1 space-y-1 text-gray-600">
                        <p>Name: {healthData.emergencyContact.name}</p>
                        <p>Phone: {healthData.emergencyContact.phone}</p>
                        <p>Relationship: {healthData.emergencyContact.relationship}</p>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}