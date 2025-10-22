import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import MainLayout from './routes/layouts/mainLayout';
import Homepage from './routes/homepage/homepage';
import Authpage from './routes/authpage/authpage';
import Createpage from './routes/createpage/createpage';
import Postpage from './routes/postpage/postpage';
import Profilepage from './routes/profilePage/profilePage';
import Searchpage from './routes/searchpage/searchPage';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/create" element={<Createpage />} />
        <Route path="/pin/:id" element={<Postpage />} />
        <Route path="/:username" element={<Profilepage />} />
        <Route path="/search" element={<Searchpage />} />
        </Route>
        <Route path="/authentication" element={<Authpage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
