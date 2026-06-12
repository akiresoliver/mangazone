import React, { useEffect, useState } from 'react';
import { getLightNovels, type Manga } from '../api/mangadex';
import { BookOpen, Star, Clock } from 'lucide-react';

export function Novels() {
  const [novels, setNovels] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getLightNovels(20);
        setNovels(data);
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar as novels.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '4rem 1rem 2rem',
    background: 'linear-gradient(to bottom, rgba(3, 7, 18, 0.8), var(--bg-base))',
    marginBottom: '2rem',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '1.5rem',
    padding: '0 1rem 4rem',
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-elevated)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, border-color 0.2s ease',
  };

  const imgContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio: '2/3',
  };

  const imgStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const tagStyle: React.CSSProperties = {
    position: 'absolute',
    top: '0.5rem',
    left: '0.5rem',
    background: 'var(--accent-purple)',
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.7rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  };

  const infoStyle: React.CSSProperties = {
    padding: '0.75rem',
  };

  const mangaTitleStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
    color: 'var(--text-primary)',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    height: '2.6rem',
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '5rem', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem', minHeight: '60vh' }}>
        <h2>Erro</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={headerStyle}>
        <div className="container">
          <h1 style={titleStyle}>
            <BookOpen size={36} style={{ color: 'var(--accent-purple)' }} />
            Novels & Manhwas
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            As melhores adaptações em quadrinhos das suas Light Novels e Web Novels favoritas. Obras como Solo Leveling, Mushoku Tensei e muito mais!
          </p>
        </div>
      </div>

      <div className="container">
        <div style={gridStyle}>
          {novels.map((manga) => (
            <div 
              key={manga.id} 
              style={cardStyle}
              className="novel-card"
              onClick={() => window.location.hash = `#/manga/${manga.id}`}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = 'var(--accent-purple)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <div style={imgContainerStyle}>
                <img src={manga.coverUrl} alt={manga.title} style={imgStyle} loading="lazy" />
                <div style={tagStyle}>
                  <Star size={12} fill="currentColor" /> Novel
                </div>
              </div>
              <div style={infoStyle}>
                <h3 style={mangaTitleStyle} title={manga.title}>{manga.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <Clock size={12} />
                  <span>Atualizado recentemente</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
