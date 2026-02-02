import React, { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import './index.css'
import MainLayout from './routes/layouts/mainLayout';
import AdminLayout from './routes/layouts/adminLayout';
import { AuthContextProvider } from "./context/AuthContext";
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const Homepage = React.lazy(() => import("./routes/homePage/homePage"));
const CreatePage = React.lazy(() => import("./routes/createPage/createPage"));
const PostPage = React.lazy(() => import("./routes/postPage/postPage"));
const ProfilePage = React.lazy(() => import("./routes/profilePage/profilePage"));
const WeatherPage = React.lazy(() => import("./routes/weatherPage/weatherPage"));
const ContestPage = React.lazy(() => import("./routes/contestPage/contestPage"));
const ContestParticipatePage = React.lazy(() =>
  import("./routes/contestPage/ContestParticipatePage")
);
const SettingsPage = React.lazy(() => import("./routes/settingsPage/settingsPage"));
const SearchPage = React.lazy(() => import("./routes/searchPage/searchPage"));
const AuthPage = React.lazy(() => import("./routes/authPage/authPage"));

const AdminPage = React.lazy(() => import("./routes/adminPage/adminPage"));
const AdminUserPage = React.lazy(() => import("./routes/adminPage/adminUserPage"));
const AdminPinPage = React.lazy(() => import("./routes/adminPage/adminPinPage"));
const AdminTagsPage = React.lazy(() => import("./routes/adminPage/adminTagPage"));
const AdminBoardsPage = React.lazy(() => import("./routes/adminPage/adminBoardPage"));
const AdminShopReq = React.lazy(() => import("./routes/adminPage/adminShopReq"));

const ShopStatsPage = React.lazy(() => import("./routes/shopStats/shopStats"));

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <BrowserRouter>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Homepage />} />
                <Route path="/create" element={<CreatePage />} />
                <Route path="/pin/:id" element={<PostPage />} />

                {/* ruta noua: pagina de participare la concurs */}
                <Route path="/contest/:id/participate" element={<ContestParticipatePage />} />

                <Route path="/profile/:username" element={<ProfilePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/weather" element={<WeatherPage />} />
                <Route path="/contests" element={<ContestPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/shop/stats" element={<ShopStatsPage />} />
              </Route>

              <Route path="/auth" element={<AuthPage />} />

              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/users" element={<AdminUserPage />} />
                <Route path="/admin/requests" element={<AdminShopReq />} />
                <Route path="/admin/pins" element={<AdminPinPage />} />
                <Route path="/admin/tags" element={<AdminTagsPage />} />
                <Route path="/admin/boards" element={<AdminBoardsPage />} />
                <Route path="/admin/stats" element={<div>Pagina de Statistici (În lucru)</div>} />
              </Route>

              {/* optional: fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthContextProvider>
    </QueryClientProvider>
  </StrictMode>
)