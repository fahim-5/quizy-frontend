import React from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function QuizCard({ quiz = {}, onStart }) {
  const title = quiz.title || quiz.name || "Untitled Quiz";
  const description = quiz.description || "Test your knowledge";
  const duration = quiz.durationMinutes || quiz.duration || 10;
  const questionsCount = Array.isArray(quiz.questions)
    ? quiz.questions.length
    : quiz.questionsCount || 0;
  const totalPoints =
    quiz.totalPoints ??
    quiz.points ??
    questionsCount * (quiz.pointsPerQuestion || 1);

  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacher = user && user.role === "teacher";

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm flex flex-col justify-between hover:shadow-lg transform hover:-translate-y-1 transition duration-200 border border-transparent hover:border-gray-200">
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm text-gray-600 mt-2">{description}</p>

        <div className="flex items-center text-sm text-gray-500 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3"
              />
            </svg>
            <span>{duration} min</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
              />
            </svg>
            <span>{questionsCount} questions</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-3">
          Total Points: {totalPoints}
        </p>
        {quiz.createdBy && (
          <p className="text-xs text-gray-400 mt-2">
            Owner: {quiz.createdBy.name || quiz.createdBy.identifier}
          </p>
        )}
      </div>

      <div className="mt-6">
        {isTeacher ? (
          <button
            onClick={() => navigate(`/teacher/quiz/${quiz._id || quiz.id}`)}
            className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-2 rounded-md hover:opacity-95 flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Manage Quiz
          </button>
        ) : (
          <button
            onClick={onStart}
            className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-2 rounded-md hover:opacity-95 flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-6.518-3.76A1 1 0 006 8.291v7.418a1 1 0 001.234.97l6.518-1.894a1 1 0 00.744-.97v-1.576a1 1 0 00-.244-.661z"
              />
            </svg>
            Start Quiz
          </button>
        )}
      </div>
    </div>
  );
}
