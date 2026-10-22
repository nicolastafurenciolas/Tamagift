import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CreatePage from './pages/CreatePage';
import GiftPage from './pages/GiftPage';
import GlobalDefs from './components/GlobalDefs';
import { StyleProvider } from './styles/StyleContext';

// Páginas internas de revisión de arte: solo existen en desarrollo, así
// no pesan ni quedan expuestas en el sitio publicado.
const StyleLab = import.meta.env.DEV ? lazy(() => import('./pages/StyleLab')) : null;
const DevGame = import.meta.env.DEV ? lazy(() => import('./pages/DevGame')) : null;
const SpriteSheet = import.meta.env.DEV ? lazy(() => import('./pages/SpriteSheet')) : null;
const Randomizer = import.meta.env.DEV ? lazy(() => import('./pages/Randomizer')) : null;
const ArtLab = import.meta.env.DEV ? lazy(() => import('./pages/ArtLab')) : null;

export default function App() {
  return (
    <StyleProvider>
      <BrowserRouter>
        <GlobalDefs />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Navigate to="/crear" replace />} />
            <Route path="/crear" element={<CreatePage />} />
            <Route path="/p/:slug" element={<GiftPage />} />
            {StyleLab && <Route path="/estilos" element={<StyleLab />} />}
            {DevGame && <Route path="/dev/:pantalla" element={<DevGame />} />}
            {SpriteSheet && <Route path="/hoja" element={<SpriteSheet />} />}
            {Randomizer && <Route path="/aleatorio" element={<Randomizer />} />}
            {ArtLab && <Route path="/arte" element={<ArtLab />} />}
          </Routes>
        </Suspense>
      </BrowserRouter>
    </StyleProvider>
  );
}
