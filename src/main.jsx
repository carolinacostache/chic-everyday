import React, { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import MainLayout from './routes/layouts/mainLayout';
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
const SearchPage = React.lazy(() => import("./routes/searchPage/searchPage"));
const AuthPage = React.lazy(() => import("./routes/authPage/authPage"));


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
          </Route>
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)