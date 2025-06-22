import React, { useState } from 'react';
import { Building2, Pencil, Trash2, Plus, X, CheckCircle, XCircle } from 'lucide-react';
import { Company } from '../../types';
import CompanySignUpForm from '../../components/CompanySignUpForm';

export default function ManageCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);

  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);

  const handleDelete = (companyId: string) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      setCompanies(prev => prev.filter(company => company.id !== companyId));
    }
  };

  const handleCloseAddCompanyModal = () => {
    setIsAddCompanyModalOpen(false);
  };

  const handleCompanySignUpSuccess = () => {
    handleCloseAddCompanyModal();
    // In a real application, you would re-fetch companies here to show the newly added one
    // For now, it will just close the modal.
  };

  return (
    <div className="mx-auto max-w-7xl mt-8 py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Manage Companies</h2>
        <button
          onClick={() => setIsAddCompanyModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Company
        </button>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No companies found. Click "Add Company" to create a new one.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <Building2 className="h-6 w-6 text-gray-400" />
                    <h3 className="ml-2 text-lg font-semibold text-gray-900">{company.name}</h3>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-600">Email: {company.email}</p>
                    <p className="text-sm text-gray-600">Phone: {company.phone}</p>
                    <p className="text-sm text-gray-600">
                      Address: {company.address.street}, {company.address.city}, {company.address.state} {company.address.zipCode}
                    </p>
                    <p className="text-sm text-gray-600">License: {company.licenseNumber}</p>
                    <p className="text-sm text-gray-600">Employees: {company.employeeCount}</p>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">Type:</span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {company.type.charAt(0).toUpperCase() + company.type.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">Status:</span>
                      {company.status === 'active' ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600">
                          <XCircle className="h-4 w-4 mr-1" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => handleDelete(company.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Company Modal */}
      {isAddCompanyModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6 m-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Add New Company</h3>
              <button
                onClick={handleCloseAddCompanyModal}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <CompanySignUpForm onSignIn={handleCompanySignUpSuccess} />
          </div>
        </div>
      )}
    </div>
  );
}