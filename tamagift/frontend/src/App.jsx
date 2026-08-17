import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CreatePage from './pages/CreatePage';
import GiftPage from './pages/GiftPage';
import ArtCheck from './pages/ArtCheck';
import GlobalDefs from './components/GlobalDefs';

export default function App() {
  return (
    <BrowserRouter>
      <GlobalDefs />
      <Routes>
        <Route path="/" element={<Navigate to="/crear" replace />} />
        <Route path="/crear" element={<CreatePage />} />
        <Route path="/p/:slug" element={<GiftPage />} />
        {/* Página interna de revisión de arte (desarrollo) */}
        <Route path="/artcheck" element={<ArtCheck />} />
      </Routes>
    </BrowserRouter>
  );
}
