import React from 'react';
import { useFavorites } from '../hooks/useLocalStorage';
import { MangaCard } from '../components/MangaCard';
import { Star, BookOpen } from 'lucide-react';

export const Favorites: React.FC = () => {
  const { favorites, toggleFavorite } = useFavorites();

  return (
    <div style={containerStyle} className="fade-in container">
      
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          <Star size={28} fill="var(--accent-pink)" color="var(--accent-pink)" />
          Minha Biblioteca
        </h1>
        <p style={subtitleStyle}>Mangás favoritados salvos localmente no seu navegador.</p>
      </div>

      {favorites.length === 0 ? (
        <div style={emptyContainerStyle} className="slide-up">
          <div style={emptyIconStyle}>
            <BookOpen size={48} color="var(--text-muted)" />
          </div>
          <h3>Sua biblioteca está vazia</h3>
          <p style={emptyTextStyle}>
            Você ainda não adicionou nenhum mangá aos seus favoritos. Navegue na página inicial e salve as suas obras preferidas!
          </p>
          <button 
            onClick={() => window.location.hash = '#/'} 
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
          >
            Explorar Mangás
          </button>
        </div>
      ) : (
        <div style={gridStyle}>
          {favorites.map((manga) => (
            <MangaCard
              key={manga.id}
              manga={manga}
              isFavorite={true}
              onToggleFavorite={() => toggleFavorite(manga)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  paddingTop: '2rem',
  paddingBottom: '4rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
  flex: 1,
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '1rem',
};

const titleStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: '800',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  margin: 0,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  color: 'var(--text-secondary)',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '1.5rem',
};

const emptyContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '300px',
  textAlign: 'center',
  maxWidth: '450px',
  margin: '3rem auto 0 auto',
  gap: '0.75rem',
  padding: '2rem',
  background: 'var(--bg-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--border-color)',
  boxShadow: 'var(--shadow-md)',
};

const emptyIconStyle: React.CSSProperties = {
  width: '80px',
  height: '80px',
  borderRadius: 'var(--radius-full)',
  background: 'rgba(255, 255, 255, 0.02)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '0.5rem',
};

const emptyTextStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: 'var(--text-secondary)',
  lineHeight: 1.5,
};
