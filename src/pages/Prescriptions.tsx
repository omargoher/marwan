import React from 'react';
import { Upload, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function Prescriptions() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Prescription Management</h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload New Prescription</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Drag and drop your prescription here or{' '}
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              browse files
            </button>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Supported formats: JPG, PNG, PDF (Max size: 5MB)
          </p>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Prescriptions</h3>
      <div className="space-y-4">
        {[
          {
            id: 1,
            date: '2024-03-15',
            status: 'approved',
            medication: 'Amoxicillin 500mg',
            doctor: 'Dr. Sarah Johnson'
          },
          {
            id: 2,
            date: '2024-03-10',
            status: 'pending',
            medication: 'Lisinopril 10mg',
            doctor: 'Dr. Michael Chen'
          }
        ].map((prescription) => (
          <div
            key={prescription.id}
            className="bg-white rounded-lg shadow-md p-4 flex items-center"
          >
            {prescription.status === 'approved' ? (
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
            ) : (
              <Clock className="h-6 w-6 text-yellow-500 flex-shrink-0" />
            )}
            <div className="ml-4 flex-1">
              <h4 className="font-medium text-gray-900">{prescription.medication}</h4>
              <p className="text-sm text-gray-500">
                Prescribed by {prescription.doctor} on{' '}
                {new Date(prescription.date).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                prescription.status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 rounded-lg p-4 flex items-start">
        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="ml-3 text-sm text-blue-700">
          All prescriptions are reviewed by licensed pharmacists within 24 hours.
          We'll notify you once your prescription is approved.
        </p>
      </div>
    </main>
  );
}