import React, { useEffect, useState } from 'react';
import { getLatestManga, getPopularManga, type Manga } from '../api/mangadex';
import { MangaCard } from '../components/MangaCard';
import { MangaGridSkeleton } from '../components/Skeleton';
import { useHistory, useFavorites } from '../hooks/useLocalStorage';
import { Play, Clock, TrendingUp, Sparkles } from 'lucide-react';

export const Home: React.FC = () => {
  const [latestManga, setLatestManga] = useState<Manga[]>([]);
  const [heroManga, setHeroManga] = useState<Manga | null>(null);
  
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const { history } = useHistory();
  const { isFavorite, toggleFavorite } = useFavorites();

  // Fetch Popular Manga for Hero
  useEffect(() => {
    async function loadPopular() {
      try {
        const popular = await getPopularManga(6);
        if (popular.length > 0) {
          // Select a random popular manga for hero, or just the first one
          setHeroManga(popular[0]);
        }
      } catch (err) {
        console.error('Erro ao buscar mangás populares:', err);
      } finally {
        setLoadingPopular(false);
      }
    }
    loadPopular();
  }, []);

  // Fetch Latest Manga Updates
  useEffect(() => {
    async function loadLatest() {
      try {
        setLoadingLatest(true);
        const latest = await getLatestManga(0, 18);
        setLatestManga(latest);
      } catch (err: any) {
        console.error('Erro ao buscar atualizações recentes:', err);
        setError('Não foi possível conectar ao servidor de mangás. Se você usa AdBlocker (Brave, uBlock), tente desativá-lo para este site.');
      } finally {
        setLoadingLatest(false);
      }
    }
    loadLatest();
  }, []);

  // Load more function
  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const more = await getLatestManga(nextPage, 18);
      if (more.length > 0) {
        setLatestManga((prev) => [...prev, ...more]);
        setPage(nextPage);
      }
    } catch (err) {
      console.error('Erro ao carregar mais mangás:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleHeroReadClick = () => {
    if (heroManga) {
      window.location.hash = `#/manga/${heroManga.id}`;
    }
  };

  return (
    <div style={homeContainerStyle} className="fade-in">
      
      {/* Hero Banner */}
      <section style={heroSectionStyle}>
        {error ? (
          <div style={errorBannerStyle}>
            <h3>Oops! Erro de Conexão</h3>
            <p>{error}</p>
          </div>
        ) : loadingPopular ? (
          <div className="skeleton" style={heroSkeletonStyle} />
        ) : heroManga ? (
          <div style={heroWrapperStyle(heroManga.coverUrl)} className="slide-up">
            <div style={heroOverlayStyle} />
            <div style={heroContentStyle}>
              <div style={heroBadgeStyle}>
                <Sparkles size={14} />
                <span>Recomendado de Hoje</span>
              </div>
              <h1 style={heroTitleStyle}>{heroManga.title}</h1>
              <p style={heroMetaStyle}>
                <span>Autor: <strong>{heroManga.author}</strong></span>
                <span>•</span>
                <span className={`badge ${heroManga.status === 'ongoing' ? 'badge-cyan' : 'badge-success'}`}>
                  {heroManga.status === 'ongoing' ? 'Lançando' : 'Finalizado'}
                </span>
                {heroManga.year && (
                  <>
                    <span>•</span>
                    <span>Ano: {heroManga.year}</span>
                  </>
                )}
              </p>
              <p style={heroDescStyle}>
                {heroManga.description.length > 250 
                  ? `${heroManga.description.substring(0, 250)}...` 
                  : heroManga.description}
              </p>
              
              <div style={heroTagsStyle}>
                {heroManga.tags.slice(0, 4).map((tag, i) => (
                  <span key={i} className="badge badge-purple" style={{ textTransform: 'capitalize' }}>
                    {tag}
                  </span>
                ))}
              </div>
              
              <div style={heroActionsStyle}>
                <button onClick={handleHeroReadClick} className="btn btn-primary" style={heroBtnStyle}>
                  <Play size={18} fill="currentColor" />
                  Começar a Ler
                </button>
                <button 
                  onClick={() => toggleFavorite(heroManga)} 
                  className="btn btn-secondary" 
                  style={{ 
                    ...heroBtnStyle, 
                    borderColor: isFavorite(heroManga.id) ? 'var(--accent-pink)' : 'var(--border-color)',
                    color: isFavorite(heroManga.id) ? 'var(--accent-pink)' : 'var(--text-primary)' 
                  }}
                >
                  <Sparkles size={16} />
                  {isFavorite(heroManga.id) ? 'Favoritado' : 'Salvar na Biblioteca'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <div className="container" style={sectionsWrapperStyle}>
        
        {/* Continue Reading Section */}
        {history.length > 0 && (
          <section style={sectionStyle} className="slide-up">
            <h2 style={sectionTitleStyle}>
              <Clock size={22} style={{ color: 'var(--accent-cyan)' }} />
              Continuar Lendo
            </h2>
            <div style={historyScrollStyle}>
              {history.map((entry) => (
                <div 
                  key={entry.mangaId} 
                  onClick={() => window.location.hash = `#/chapter/${entry.chapterId}`}
                  style={historyCardStyle}
                  className="history-card"
                >
                  <img src={entry.mangaCover} alt={entry.mangaTitle} style={historyCoverStyle} />
                  <div style={historyInfoStyle}>
                    <h4 style={historyTitleStyle} title={entry.mangaTitle}>{entry.mangaTitle}</h4>
                    <span style={historyChapterStyle}>Capítulo {entry.chapterNum}</span>
                    {entry.chapterTitle && (
                      <p style={historySubStyle} title={entry.chapterTitle}>{entry.chapterTitle}</p>
                    )}
                    <span style={historyTimeStyle}>
                      Lido {new Date(entry.timestamp).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Latest Updates Section */}
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h2 style={sectionTitleStyle}>
              <TrendingUp size={22} style={{ color: 'var(--accent-purple)' }} />
              Atualizações Recentes
            </h2>
          </div>
          
          {loadingLatest && latestManga.length === 0 ? (
            <MangaGridSkeleton count={12} />
          ) : (
            <>
              <div style={gridStyle}>
                {latestManga.map((manga) => (
                  <MangaCard 
                    key={manga.id} 
                    manga={manga} 
                    isFavorite={isFavorite(manga.id)}
                    onToggleFavorite={() => toggleFavorite(manga)}
                  />
                ))}
              </div>
              
              <div style={loadMoreContainerStyle}>
                <button 
                  onClick={handleLoadMore} 
                  disabled={loadingMore} 
                  className="btn btn-secondary"
                  style={loadMoreButtonStyle}
                >
                  {loadingMore ? 'Carregando mais...' : 'Ver Mais Mangás'}
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      <style>{`
        .history-card {
          transition: all 0.25s ease;
          border: 1px solid var(--border-color);
        }
        .history-card:hover {
          transform: translateY(-3px);
          border-color: var(--accent-cyan);
          background: var(--bg-surface-hover);
          cursor: pointer;
        }
        
        /* Smooth Scrollbar for History horizontal slider */
        div::-webkit-scrollbar {
          height: 6px;
        }
        div::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: var(--accent-cyan);
        }
      `}</style>
    </div>
  );
};

// Styles
const errorBannerStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '200px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  borderRadius: 'var(--radius-lg)',
  color: 'var(--text-primary)',
  textAlign: 'center',
  padding: '2rem',
  marginTop: '1rem',
};
const homeContainerStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: '3rem',
};

const heroSectionStyle: React.CSSProperties = {
  width: '100%',
  padding: '0 0 2rem 0',
  position: 'relative',
};

const heroSkeletonStyle: React.CSSProperties = {
  width: '100%',
  height: '500px',
  borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
};

const heroWrapperStyle = (coverUrl: string): React.CSSProperties => ({
  width: '100%',
  minHeight: '520px',
  background: `url(${coverUrl}) no-repeat center center`,
  backgroundSize: 'cover',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
  overflow: 'hidden',
  boxShadow: 'var(--shadow-lg)',
});

const heroOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'linear-gradient(to right, rgba(8, 12, 20, 0.95) 30%, rgba(8, 12, 20, 0.7) 60%, rgba(8, 12, 20, 0.3) 100%), linear-gradient(to top, rgba(8, 12, 20, 1) 0%, transparent 40%)',
  zIndex: 1,
};

const heroContentStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 2,
  maxWidth: '700px',
  padding: '3rem 4rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const heroBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  background: 'rgba(139, 92, 246, 0.25)',
  border: '1px solid rgba(139, 92, 246, 0.5)',
  color: '#c084fc',
  padding: '0.4rem 0.8rem',
  borderRadius: 'var(--radius-sm)',
  fontSize: '0.8rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  width: 'fit-content',
};

const heroTitleStyle: React.CSSProperties = {
  fontSize: '3rem',
  fontWeight: '800',
  lineHeight: 1.15,
  letterSpacing: '-0.02em',
  color: 'white',
  textShadow: '0 4px 12px rgba(0,0,0,0.5)',
};

const heroMetaStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  fontSize: '0.9rem',
  color: 'var(--text-secondary)',
  flexWrap: 'wrap',
};

const heroDescStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  color: 'var(--text-secondary)',
  lineHeight: 1.6,
  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
};

const heroTagsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  flexWrap: 'wrap',
};

const heroActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  marginTop: '1rem',
  flexWrap: 'wrap',
};

const heroBtnStyle: React.CSSProperties = {
  padding: '0.9rem 1.8rem',
  fontSize: '1rem',
};

const sectionsWrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3rem',
  marginTop: '1rem',
};

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
};

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: '800',
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  color: 'var(--text-primary)',
};

const historyScrollStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  overflowX: 'auto',
  paddingBottom: '0.75rem',
  scrollSnapType: 'x mandatory',
};

const historyCardStyle: React.CSSProperties = {
  display: 'flex',
  minWidth: '280px',
  maxWidth: '320px',
  height: '110px',
  background: 'var(--bg-surface)',
  borderRadius: 'var(--radius-md)',
  padding: '0.5rem',
  gap: '0.75rem',
  alignItems: 'center',
  scrollSnapAlign: 'start',
  flexShrink: 0,
};

const historyCoverStyle: React.CSSProperties = {
  width: '65px',
  height: '90px',
  objectFit: 'cover',
  borderRadius: 'var(--radius-sm)',
};

const historyInfoStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '0.2rem',
  flex: 1,
  overflow: 'hidden',
};

const historyTitleStyle: React.CSSProperties = {
  fontSize: '0.88rem',
  fontWeight: '700',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  color: 'var(--text-primary)',
};

const historyChapterStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  fontWeight: '800',
  color: 'var(--accent-cyan)',
  textTransform: 'uppercase',
};

const historySubStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--text-secondary)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const historyTimeStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  color: 'var(--text-muted)',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '1.5rem',
};

const loadMoreContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  marginTop: '2rem',
};

const loadMoreButtonStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '240px',
  fontWeight: '700',
  background: 'rgba(255, 255, 255, 0.02)',
};
