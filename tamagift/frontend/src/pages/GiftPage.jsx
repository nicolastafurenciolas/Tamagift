import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TamagiftGame from '../components/TamagiftGame';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function GiftPage() {
  const { slug } = useParams();

  useEffect(() => {
    if (!slug) return;
    // Apunta el manifest de ESTA página al manifest dinámico del backend, para
    // que "Agregar a inicio" instale esta mascota con su propio ícono y nombre
    // en vez del genérico de la app. El nombre para iOS se fija aparte, dentro
    // de TamagiftGame, en cuanto carga el nombre real de la mascota.
    let link = document.querySelector('link[rel="manifest"]');
    const original = link ? link.getAttribute('href') : null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    }
    link.setAttribute('href', `${API_BASE}/api/pets/${slug}/manifest.json`);

    let appleCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
    if (!appleCapable) {
      appleCapable = document.createElement('meta');
      appleCapable.name = 'apple-mobile-web-app-capable';
      appleCapable.content = 'yes';
      document.head.appendChild(appleCapable);
    }

    return () => {
      if (link && original) link.setAttribute('href', original);
    };
  }, [slug]);

  return <TamagiftGame slug={slug} />;
}
