import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import SignupPage from "./pages/auth/signup/SignupPage";
import LoginPage from "./pages/auth/login/LoginPage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import { Toaster } from 'react-hot-toast';
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {
  const {data:authUser, isLoading, error, isError} = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if(!res.ok) throw new Error (data.error || 'Something went wrong');
        console.log('auth user is here', data);
        return data;
      } catch (error) {
        throw new Error (error)
      }
    }
  })
  console.log('auth user is here', authUser);
  if(isLoading) {
    return <div className="h-screen flex justify-center items-center"><LoadingSpinner /></div>
  }
  return (
    <div className="flex max-w-6xl mx-auto">
      <Sidebar />
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to = "/login" />} />
        <Route path="/signup" element={!authUser ? <SignupPage /> : <Navigate to = "/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to = "/" />} />
        <Route path="/notifications" element={authUser ? <NotificationPage />  : <Navigate to = "/" />} />
        <Route path="/profile/:username" element={authUser ? <ProfilePage />  : <Navigate to = "/" />} />
      </Routes>
      <RightPanel />
      <Toaster />
    </div>
  );
}

export default App;
