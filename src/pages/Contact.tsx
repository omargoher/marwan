import React from 'react';
import { Phone, Mail, MapPin, MessageSquare } from 'lucide-react';

export default function Contact() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Contact Us</h2>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Get in Touch</h3>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <Phone className="h-6 w-6 text-blue-600 mt-1" />
                <div className="ml-4">
                  <p className="font-medium">Phone</p>
                  <p className="text-gray-600">1-800-MEDCARE</p>
                  <p className="text-gray-600">Available 24/7</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="h-6 w-6 text-blue-600 mt-1" />
                <div className="ml-4">
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">support@medcare.com</p>
                  <p className="text-gray-600">Response within 24 hours</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-blue-600 mt-1" />
                <div className="ml-4">
                  <p className="font-medium">Address</p>
                  <p className="text-gray-600">123 Health Street</p>
                  <p className="text-gray-600">Medical District, MD 12345</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Emergency Support</h3>
            <div className="flex items-start">
              <MessageSquare className="h-6 w-6 text-red-600 mt-1" />
              <div className="ml-4">
                <p className="text-gray-600">
                  For medical emergencies, please call 911 or visit your nearest emergency room.
                  Our support team is available 24/7 for urgent medication-related inquiries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}