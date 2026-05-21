import React, { useState } from 'react';
import type { Manga } from '../api/mangadex';
import { Star, BookOpen } from 'lucide-react';

interface MangaCardProps {
  manga: Manga;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

export const MangaCard: React.FC<MangaCardProps> = ({ 
  manga, 
  isFavorite = false,
  onToggleFavorite 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleClick = () => {
    window.location.hash = `#/manga/${manga.id}`;
  };

  return (
    <div style={cardStyle} onClick={handleClick} className="fade-in">
      <div style={imageContainerStyle}>
        {!imageLoaded && <div className="skeleton" style={imagePlaceholderStyle} />}
        <img
          src={manga.coverUrl}
          alt={manga.title}
          style={{ 
            ...imageStyle, 
            opacity: imageLoaded ? 1 : 0,
            transform: imageLoaded ? 'scale(1)' : 'scale(1.05)'
          }}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        {/* Hover overlay with a quick read action */}
        <div style={overlayStyle} className="card-overlay">
          <button style={quickReadBtnStyle}>
            <BookOpen size={18} />
            Ler Agora
          </button>
        </div>
        
        {onToggleFavorite && (
          <button 
            style={{ 
              ...favoriteBtnStyle, 
              color: isFavorite ? 'var(--accent-pink)' : 'rgba(255, 255, 255, 0.7)' 
            }} 
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(e);
            }}
          >
            <Star size={16} fill={isFavorite ? 'var(--accent-pink)' : 'none'} />
          </button>
        )}
      </div>

      <div style={contentStyle}>
        <h3 style={titleStyle} title={manga.title}>{manga.title}</h3>
        <p style={authorStyle}>{manga.author}</p>
        
        <div style={metaStyle}>
          {manga.status && (
            <span className={`badge ${manga.status === 'ongoing' ? 'badge-cyan' : 'badge-success'}`}>
              {manga.status === 'ongoing' ? 'Lançando' : 'Finalizado'}
            </span>
          )}
          {manga.year && (
            <span style={yearStyle}>{manga.year}</span>
          )}
        </div>
      </div>

      {/* Styled JSX for card hovering effects */}
      <style>{`
        .card-overlay {
          opacity: 0;
          transition: all 0.3s ease;
        }
        div[onClick]:hover .card-overlay {
          opacity: 1;
        }
        div[onClick]:hover img {
          transform: scale(1.05) !important;
          filter: brightness(0.6);
        }
        div[onClick] {
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        div[onClick]:hover {
          transform: translateY(-5px);
          border-color: var(--accent-purple) !important;
          box-shadow: var(--glow-purple), 0 12px 24px rgba(0, 0, 0, 0.6);
        }
      `}</style>
    </div>
  );
};

// Styles
const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-color)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  height: '370px',
  position: 'relative',
};

const imageContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '250px',
  position: 'relative',
  overflow: 'hidden',
  background: '#090d16',
};

const imagePlaceholderStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
};

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), filter 0.3s ease, opacity 0.3s ease',
};

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(8, 12, 20, 0.4)',
  pointerEvents: 'none', // let clicks pass through to card
};

const quickReadBtnStyle: React.CSSProperties = {
  background: 'var(--accent-gradient)',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  color: 'white',
  padding: '0.5rem 1rem',
  fontSize: '0.85rem',
  fontWeight: '700',
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  boxShadow: 'var(--shadow-md)',
};

const favoriteBtnStyle: React.CSSProperties = {
  position: 'absolute',
  top: '8px',
  right: '8px',
  width: '32px',
  height: '32px',
  borderRadius: 'var(--radius-sm)',
  background: 'rgba(8, 12, 20, 0.75)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  zIndex: 10,
  transition: 'all 0.2s',
};

const contentStyle: React.CSSProperties = {
  padding: '0.75rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
  flex: 1,
};

const titleStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  lineHeight: 1.3,
};

const authorStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--text-secondary)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const metaStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 'auto',
  paddingTop: '0.25rem',
};

const yearStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  fontWeight: '600',
};
