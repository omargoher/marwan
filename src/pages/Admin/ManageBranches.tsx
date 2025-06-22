import React, { useState } from 'react';
import { Pencil, Trash2, Plus, X, MapPin } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager: string;
  status: 'active' | 'inactive';
  employeeCount: number;
}

export default function ManageBranches() {
  const [branches, setBranches] = useState<Branch[]>([
    {
      id: '1',
      name: 'Main Branch',
      address: '123 Main St, City, State 12345',
      phone: '(555) 123-4567',
      manager: 'John Smith',
      status: 'active',
      employeeCount: 15
    },
    {
      id: '2',
      name: 'North Branch',
      address: '456 North Ave, City, State 12345',
      phone: '(555) 234-5678',
      manager: 'Jane Doe',
      status: 'active',
      employeeCount: 10
    }
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    manager: '',
    status: 'active' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBranch) {
      setBranches((prev) => prev.map((branch) => {
        if (branch.id === editingBranch.id) {
          return { ...branch, ...formData };
        }
        return branch;
      }));
    } else {
      const newBranch: Branch = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        employeeCount: 0
      };
      setBranches((prev) => [...prev, newBranch]);
    }
    handleCloseForm();
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      manager: branch.manager,
      status: branch.status
    });
    setIsFormOpen(true);
  };

  const handleDelete = (branchId: string) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      setBranches((prev) => prev.filter((branch) => branch.id !== branchId));
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBranch(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      manager: '',
      status: 'active'
    });
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Manage Branches</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Branch
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{branch.name}</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-gray-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {branch.address}
                  </p>
                  <p className="text-gray-600">Phone: {branch.phone}</p>
                  <p className="text-gray-600">Manager: {branch.manager}</p>
                  <p className="text-gray-600">Employees: {branch.employeeCount}</p>
                </div>
                <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  branch.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {branch.status.charAt(0).toUpperCase() + branch.status.slice(1)}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(branch)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(branch.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={handleCloseForm}></div>

            <div className="relative bg-white rounded-lg max-w-md w-full">
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingBranch ? 'Edit Branch' : 'Add New Branch'}
                </h3>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Manager
                    </label>
                    <input
                      type="text"
                      value={formData.manager}
                      onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({
                        ...formData,
                        status: e.target.value as 'active' | 'inactive'
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {editingBranch ? 'Update Branch' : 'Add Branch'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}