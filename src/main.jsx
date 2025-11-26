import React, { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import './index.css'
import MainLayout from './routes/layouts/mainLayout';
import AdminLayout from './routes/layouts/adminLayout';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const Homepage = React.lazy(() => import("./routes/homePage/homePage"));
const CreatePage = React.lazy(() => import("./routes/createPage/createPage"));
const PostPage = React.lazy(() => import("./routes/postPage/postPage"));
const ProfilePage = React.lazy(() =>
  import("./routes/profilePage/profilePage")
);
const WeatherPage = React.lazy(() => import("./routes/weatherPage/weatherPage"));
const SettingsPage = React.lazy(() => import("./routes/settingsPage/settingsPage"));
const SearchPage = React.lazy(() => import("./routes/searchPage/searchPage"));
const AuthPage = React.lazy(() => import("./routes/authPage/authPage"));

const AdminUserPage = React.lazy(() => import("./routes/adminPage/adminUserPage"));
const AdminPinPage = React.lazy(() => import("./routes/adminPage/adminPinPage"));
const AdminTagsPage = React.lazy(() => import("./routes/adminPage/adminTagPage"));

const AdminBoardsPage = React.lazy(() => import("./routes/adminPage/adminBoardPage"));

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Homepage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/pin/:id" element={<PostPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/weather" element={<WeatherPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<div>Pagina de intrare in lucru</div>} />
            <Route path="/admin/users" element={<AdminUserPage />} /> 
            <Route path="/admin/pins" element={<AdminPinPage/>}/>
            <Route path="/admin/tags" element={<AdminTagsPage/>} />
            <Route path="/admin/boards" element={<AdminBoardsPage/>} />
            <Route path="/admin/stats" element={<div>Pagina de Statistici (În lucru)</div>} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)