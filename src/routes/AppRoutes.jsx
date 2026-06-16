import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Forgot from "../pages/Forgot";
import Dashboard from "../pages/Dashboard";
import useAuth from "../hooks/useAuth";
import TakeQuiz from "../pages/TakeQuiz";
import Join from "../pages/Join";
import Result from "../pages/Result";
import AdminPanel from "../pages/AdminPanel";
import TeacherQuizzes from "../pages/TeacherQuizzes";
import Courses from "../pages/Courses";
import CourseDetail from "../pages/CourseDetail";
import Teachers from "../pages/Teachers";
import ManageQuestions from "../pages/ManageQuestions";
import QuizEditor from "../pages/QuizEditor";
import LiveMonitor from "../pages/LiveMonitor";
import ResultsHistory from "../pages/ResultsHistory";
import Reports from "../pages/Reports";
import StudentLobby from "../pages/StudentLobby";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";

export default function AppRoutes() {
  const AuthRedirect = () => {
    const auth = useAuth();
    const user = auth?.user || null;
    if (user && user.role === "teacher")
      return <Navigate to="/dashboard/teacher" replace />;
    return <Navigate to="/dashboard/student" replace />;
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot" element={<Forgot />} />
      <Route path="/register" element={<Register />} />
      <Route path="/join" element={<Join />} />
      <Route path="/lobby" element={<StudentLobby />} />
      <Route path="/dashboard" element={<AuthRedirect />} />
      <Route path="/dashboard/teacher" element={<Dashboard />} />
      <Route path="/dashboard/student" element={<Dashboard />} />
      <Route path="/quiz/:id" element={<TakeQuiz />} />
      <Route path="/take/:id" element={<TakeQuiz />} />
      <Route path="/result" element={<Result />} />
      <Route path="/results" element={<ResultsHistory />} />
      <Route path="/teacher" element={<AdminPanel />} />
      <Route path="/teachers" element={<Teachers />} />
      <Route path="/teacher/quizzes" element={<TeacherQuizzes />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/courses/:id" element={<CourseDetail />} />
      <Route path="/students/courses" element={<Courses />} />
      <Route path="/students/courses/:id" element={<CourseDetail />} />
      <Route path="/teacher/courses" element={<Courses />} />
      <Route path="/teacher/courses/:id" element={<CourseDetail />} />
      <Route path="/teacher/create" element={<QuizEditor />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/teacher/monitor/:id" element={<LiveMonitor />} />
      <Route path="/teacher/quiz/:id" element={<ManageQuestions />} />
      <Route path="/teacher/quiz/:id/edit" element={<QuizEditor />} />
      <Route path="/teacher/reports/:quizId" element={<Reports />} />
    </Routes>
  );
}
