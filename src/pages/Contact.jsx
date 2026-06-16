import React from "react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-white text-black">
      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <section className="text-center py-16">
          <div className="inline-block mb-4 px-4 py-1 border border-black rounded-full text-sm font-medium">
            Let's Connect
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Have a question, feedback, or need support? We're here to help.
            Reach out to the Quizy team and we'll get back to you within 24 hours.
          </p>
        </section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-12">
          {/* Left Column - Contact Info */}
          <div className="space-y-8">
            {/* Contact Card */}
            <div className="border border-gray-200 rounded-lg p-8 bg-gray-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 border border-black rounded-full flex items-center justify-center">
                  <span className="text-lg">📬</span>
                </div>
                <h2 className="text-2xl font-semibold">Get in Touch</h2>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                For support inquiries, partnership opportunities, or general feedback about Quizy, 
                please use the contact form or reach out through any of the channels below.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-black font-bold mt-0.5">→</span>
                  <div>
                    <p className="font-medium text-black">Email Us</p>
                    <a href="mailto:support@quizy.example.com" className="text-gray-600 hover:text-black transition-colors">
                      support@quizy.example.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-black font-bold mt-0.5">→</span>
                  <div>
                    <p className="font-medium text-black">Response Time</p>
                    <p className="text-gray-600">Within 24 hours on business days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-black font-bold mt-0.5">→</span>
                  <div>
                    <p className="font-medium text-black">Support Hours</p>
                    <p className="text-gray-600">Monday — Friday, 9:00 AM — 5:00 PM (Local Time)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Frequently Asked Questions */}
            <div className="border border-gray-200 rounded-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 border border-black rounded-full flex items-center justify-center">
                  <span className="text-lg">❓</span>
                </div>
                <h2 className="text-2xl font-semibold">Quick Answers</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-black mb-1">How do I reset my password?</p>
                  <p className="text-sm text-gray-500">Use the "Forgot Password" link on the login page to receive reset instructions.</p>
                </div>
                <div>
                  <p className="font-medium text-black mb-1">Can I export quiz results?</p>
                  <p className="text-sm text-gray-500">Yes, instructors can export results as CSV files from the quiz dashboard.</p>
                </div>
                <div>
                  <p className="font-medium text-black mb-1">Is Quizy free to use?</p>
                  <p className="text-sm text-gray-500">Quizy offers both free and premium plans. Contact us for pricing details.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="border border-gray-200 rounded-lg p-8 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 border border-black rounded-full flex items-center justify-center">
                <span className="text-lg">✉️</span>
              </div>
              <h2 className="text-2xl font-semibold">Send a Message</h2>
            </div>
            
            <form className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Full Name <span className="text-gray-400">*</span>
                </label>
                <input
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:border-black transition-colors text-gray-800"
                  type="text"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Email Address <span className="text-gray-400">*</span>
                </label>
                <input
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:border-black transition-colors text-gray-800"
                  type="email"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Subject
                </label>
                <input
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:border-black transition-colors text-gray-800"
                  type="text"
                  placeholder="What is this regarding?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Message <span className="text-gray-400">*</span>
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 h-36 focus:outline-none focus:border-black transition-colors text-gray-800 resize-none"
                  placeholder="Tell us how we can help..."
                />
              </div>

              <button
                type="button"
                className="w-full bg-black text-white font-medium py-3 rounded-md hover:bg-gray-800 transition-colors"
              >
                Send Message
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                This is a demonstration form. In production, messages will be sent to our support team.
              </p>
            </form>
          </div>
        </div>

        {/* Additional Info Section */}
        <section className="border-t border-gray-200 mt-12 pt-12 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold mb-3">Prefer to reach us directly?</h3>
            <p className="text-gray-600 mb-6">
              For urgent matters or partnership inquiries, please email our team directly at 
              <a href="mailto:partners@quizy.example.com" className="text-black underline ml-1">partners@quizy.example.com</a>
            </p>
            <div className="inline-flex gap-6 text-sm text-gray-500">
              <span>⚡ Average response: &lt;24h</span>
              <span>🔒 Secure & confidential</span>
              <span>🌍 Global support</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}