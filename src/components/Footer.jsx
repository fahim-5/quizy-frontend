import { Link } from "react-router-dom";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import logo from "../assets/images/logo.png";

const Footer = () => {
  return (
    <footer className="bg-white text-black border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Grid - 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1 - Logo & Social */}
          <div className="space-y-4">
            <Link to="/" className="block">
              <img src={logo} alt="Quizy logo" className="h-20 -mt-2 w-auto" />
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed">
              An Online Quiz Platform for creating, taking, and reviewing timed
              quizzes with automatic scoring.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="https://github.com/fahim-5/Quizy-Private-Code"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-black transition-colors"
                aria-label="GitHub"
              >
                <FaGithub size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-black transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-black transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={18} />
              </a>
            </div>
          </div>

          {/* Column 2 - Platform */}
          <div>
            <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-4">
              Platform
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 hover:text-black transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/take-quiz"
                  className="text-gray-600 hover:text-black transition-colors text-sm"
                >
                  Take Quiz
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-black transition-colors text-sm"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-black transition-colors text-sm"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Explore */}
          <div>
            <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-4">
              Explore
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/teachers"
                  className="text-gray-600 hover:text-black transition-colors text-sm"
                >
                  Teacher Panel
                </Link>
              </li>
              <li>
                <Link
                  to="/quizzes"
                  className="text-gray-600 hover:text-black transition-colors text-sm"
                >
                  All Quizzes
                </Link>
              </li>
              <li>
                <Link
                  to="/README.md"
                  className="text-gray-600 hover:text-black transition-colors text-sm"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  to="/results"
                  className="text-gray-600 hover:text-black transition-colors text-sm"
                >
                  My Results
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Support */}
          <div>
            <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/faq"
                  className="text-gray-600 hover:text-black transition-colors text-sm"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-600 hover:text-black transition-colors text-sm"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-600 hover:text-black transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-600 hover:text-black transition-colors text-sm"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} Quizy. All rights reserved.
            </p>
            <p className="text-sm text-gray-600">
              Built with ❤️ by{" "}
              <a
                href="https://iamfaysal.netlify.app/"
                className="text-gray-400 hover:text-black-italic transition-colors font-bold italic"
              >
                Bafu
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
