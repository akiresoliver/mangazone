import React, { useEffect, useState } from 'react';
import { getMangaDetails, getMangaChapters, type Manga, type Chapter } from '../api/mangadex';
import { MangaDetailsSkeleton } from '../components/Skeleton';
import { useFavorites, useHistory, useRatings } from '../hooks/useLocalStorage';
import { Comments } from '../components/Comments';
import { Star, Play, ChevronDown, ChevronUp, Search, Calendar, Globe, BookOpen, Check } from 'lucide-react';

interface MangaDetailsProps {
  mangaId: string;
}

export const MangaDetails: React.FC<MangaDetailsProps> = ({ mangaId }) => {
  const [manga, setManga] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedLang, setSelectedLang] = useState<string>('pt-br');
  const [availableLangs, setAvailableLangs] = useState<string[]>([]);
  const [chapterQuery, setChapterQuery] = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [readChapters, setReadChapters] = useState<string[]>([]);

  const { isFavorite, toggleFavorite } = useFavorites();
  const { getMangaProgress } = useHistory();
  const { getRating, saveRating } = useRatings();

  // Load Manga details and chapters
  useEffect(() => {
    async function loadManga() {
      try {
        setLoading(true);
        setError(null);
        const data = await getMangaDetails(mangaId);
        setManga(data);
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar os detalhes deste mangá.');
      } finally {
        setLoading(false);
      }
    }

    async function loadChapters() {
      try {
        setLoadingChapters(true);
        const list = await getMangaChapters(mangaId);
        setChapters(list);
        
        // Find languages available in chapters
        const langs = Array.from(new Set(list.map((c) => c.language)));
        setAvailableLangs(langs);
        
        // Auto-select language: PT-BR if available, otherwise English, otherwise first available
        if (langs.includes('pt-br')) {
          setSelectedLang('pt-br');
        } else if (langs.includes('en')) {
          setSelectedLang('en');
        } else if (langs.length > 0) {
          setSelectedLang(langs[0]);
        }
      } catch (err) {
        console.error('Erro ao buscar capítulos:', err);
      } finally {
        setLoadingChapters(false);
      }
    }

    loadManga();
    loadChapters();

    // Fetch read chapters list
    const storedRead = localStorage.getItem('mangastop_read_chapters');
    if (storedRead) {
      try {
        setReadChapters(JSON.parse(storedRead));
      } catch (e) {
        console.error(e);
      }
    }
  }, [mangaId]);

  // Apply filters, search and sorting to chapters list
  useEffect(() => {
    let result = chapters.filter((c) => c.language === selectedLang);

    if (chapterQuery.trim()) {
      const q = chapterQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.chapterNum.includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.scanGroup.toLowerCase().includes(q)
      );
    }

    // Sort chapters
    result.sort((a, b) => {
      const aNum = parseFloat(a.chapterNum) || 0;
      const bNum = parseFloat(b.chapterNum) || 0;
      return sortAsc ? aNum - bNum : bNum - aNum;
    });

    setFilteredChapters(result);
  }, [chapters, selectedLang, chapterQuery, sortAsc]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <MangaDetailsSkeleton />
      </div>
    );
  }

  if (error || !manga) {
    return (
      <div className="container" style={errorContainerStyle}>
        <h2>Ops! Algum erro ocorreu</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{error || 'Mangá não encontrado.'}</p>
        <button onClick={() => window.location.hash = '#/'} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Voltar para o Início
        </button>
      </div>
    );
  }

  const progress = getMangaProgress(manga.id);

  const handleStartReading = () => {
    if (progress) {
      // Continue reading saved progress
      window.location.hash = `#/chapter/${progress.chapterId}`;
    } else if (filteredChapters.length > 0) {
      // Start reading first chapter (which is the last element if sorted descending, or first if sorted ascending)
      // Since sorted list is standard descending, the first chapter is at the end of the array. Let's find it.
      const firstChapter = [...filteredChapters].sort((a, b) => (parseFloat(a.chapterNum) || 0) - (parseFloat(b.chapterNum) || 0))[0];
      if (firstChapter) {
        window.location.hash = `#/chapter/${firstChapter.id}`;
      }
    }
  };

  const handleChapterClick = (chapter: Chapter) => {
    // Navigate to chapter page
    window.location.hash = `#/chapter/${chapter.id}`;
  };

  return (
    <div style={detailsContainerStyle} className="fade-in">
      
      {/* Blurred cover banner background */}
      <div style={bannerContainerStyle}>
        <div style={bannerOverlayStyle(manga.coverUrl)} />
        <div style={bannerFadeStyle} />
      </div>

      <div className="container" style={contentWrapperStyle}>
        
        {/* Manga Meta Details */}
        <div style={infoGridStyle}>
          <div style={coverWrapperStyle}>
            <img src={manga.coverUrl} alt={manga.title} style={coverStyle} />
          </div>
          
          <div style={metaStyle}>
            <h1 style={titleStyle}>{manga.title}</h1>
            
            <p style={authorStyle}>
              Por <strong>{manga.author}</strong> {manga.artist !== manga.author && <>e <strong>{manga.artist}</strong></>}
            </p>

            <div style={tagsContainerStyle}>
              {manga.status && (
                <span className={`badge ${manga.status === 'ongoing' ? 'badge-cyan' : 'badge-success'}`}>
                  {manga.status === 'ongoing' ? 'Lançando' : 'Finalizado'}
                </span>
              )}
              {manga.year && (
                <span className="badge badge-purple" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>
                  {manga.year}
                </span>
              )}
              {manga.tags.slice(0, 5).map((t, idx) => (
                <span key={idx} className="badge badge-purple">{t}</span>
              ))}
            </div>

            {/* Rating System */}
            <div style={ratingContainerStyle}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sua Avaliação:</span>
              <div style={{ display: 'flex', gap: '0.2rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => saveRating(manga.id, star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.2rem',
                    }}
                    title={`Avaliar com ${star} estrelas`}
                  >
                    <Star 
                      size={20} 
                      fill={star <= getRating(manga.id) ? '#ffd700' : 'none'} 
                      color={star <= getRating(manga.id) ? '#ffd700' : 'var(--border-color)'} 
                      style={{ transition: 'all 0.2s' }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Synopsis */}
            <div style={descriptionContainerStyle}>
              <p style={{ 
                ...descriptionStyle, 
                maxHeight: isDescExpanded ? 'none' : '90px' 
              }}>
                {manga.description}
              </p>
              {manga.description.length > 250 && (
                <button onClick={() => setIsDescExpanded(!isDescExpanded)} style={expandBtnStyle}>
                  {isDescExpanded ? (
                    <>Ver Menos <ChevronUp size={16} /></>
                  ) : (
                    <>Ler Sinopse Completa <ChevronDown size={16} /></>
                  )}
                </button>
              )}
            </div>

            {/* Detail Buttons */}
            <div style={actionButtonsStyle}>
              <button 
                onClick={handleStartReading} 
                disabled={filteredChapters.length === 0}
                className="btn btn-primary"
                style={readBtnStyle}
              >
                <Play size={18} fill="currentColor" />
                {progress ? `Continuar Cap. ${progress.chapterNum}` : 'Começar a Ler'}
              </button>
              
              <button 
                onClick={() => toggleFavorite(manga)} 
                className="btn btn-secondary"
                style={{ 
                  color: isFavorite(manga.id) ? 'var(--accent-pink)' : 'var(--text-primary)',
                  borderColor: isFavorite(manga.id) ? 'var(--accent-pink)' : 'var(--border-color)',
                }}
              >
                <Star size={18} fill={isFavorite(manga.id) ? 'var(--accent-pink)' : 'none'} />
                {isFavorite(manga.id) ? 'Favoritado' : 'Adicionar aos Favoritos'}
              </button>
            </div>
          </div>
        </div>

        {/* Chapters Section */}
        <section style={chaptersSectionStyle} className="glass">
          <div style={chaptersHeaderStyle}>
            <h3 style={chaptersTitleStyle}>
              <BookOpen size={20} style={{ color: 'var(--accent-purple)' }} />
              Lista de Capítulos
            </h3>
            
            {/* Language filter tabs */}
            {availableLangs.length > 1 && (
              <div style={langSelectorStyle}>
                {availableLangs.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    style={{
                      ...langTabStyle,
                      borderBottom: selectedLang === lang ? '2px solid var(--accent-purple)' : 'none',
                      color: selectedLang === lang ? 'var(--text-primary)' : 'var(--text-muted)'
                    }}
                  >
                    <Globe size={14} />
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chapter controls (Search and Order) */}
          <div style={chapterControlsStyle}>
            <div style={chapterSearchStyle}>
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Filtrar por número ou título..."
                value={chapterQuery}
                onChange={(e) => setChapterQuery(e.target.value)}
                style={chapterSearchInputStyle}
              />
            </div>

            <button onClick={() => setSortAsc(!sortAsc)} style={sortBtnStyle}>
              {sortAsc ? 'Mais Antigos Primeiro' : 'Mais Recentes Primeiro'}
            </button>
          </div>

          {/* Chapters Feed Container */}
          {loadingChapters ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Carregando lista de capítulos...
            </div>
          ) : filteredChapters.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              {chapterQuery.trim() 
                ? 'Nenhum capítulo corresponde à sua busca.' 
                : `Nenhum capítulo disponível em ${selectedLang.toUpperCase()} no momento.`}
            </div>
          ) : (
            <div style={chaptersListStyle}>
              {filteredChapters.map((chapter) => {
                const isRead = readChapters.includes(chapter.id);
                return (
                  <div
                    key={chapter.id}
                    onClick={() => handleChapterClick(chapter)}
                    style={{
                      ...chapterRowStyle,
                      background: isRead ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.03)',
                      opacity: isRead ? 0.65 : 1
                    }}
                    className="chapter-row"
                  >
                    <div style={chapterInfoLeftStyle}>
                      <span style={{ 
                        ...chapterNumberStyle,
                        color: isRead ? 'var(--text-muted)' : 'var(--accent-purple)'
                      }}>
                        Capítulo {chapter.chapterNum}
                      </span>
                      {chapter.title && <span style={chapterTitleTextStyle}>{chapter.title}</span>}
                    </div>

                    <div style={chapterInfoRightStyle}>
                      <span style={chapterScanStyle} title="Scanlation Group">{chapter.scanGroup}</span>
                      
                      <div style={chapterMetaDateStyle}>
                        <Calendar size={12} />
                        <span>{new Date(chapter.publishAt).toLocaleDateString('pt-BR')}</span>
                      </div>

                      {isRead && (
                        <div style={readStatusBadgeStyle} title="Lido">
                          <Check size={14} color="var(--success)" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {manga && (
          <Comments 
            url={`https://mangazone-demo.com/manga/${manga.id}`} 
            identifier={manga.id} 
            title={manga.title} 
          />
        )}
      </div>

      <style>{`
        .chapter-row {
          transition: all 0.2s ease;
          border: 1px solid var(--border-color);
        }
        .chapter-row:hover {
          background: var(--bg-surface-hover) !important;
          border-color: var(--accent-purple);
          cursor: pointer;
          transform: translateX(4px);
          opacity: 1 !important;
        }
        
        /* Details layout responsiveness */
        @media (max-width: 768px) {
          .details-info-grid {
            grid-template-columns: 1fr !important;
            margin-top: -150px !important;
            padding: 0 1rem !important;
            text-align: center;
          }
          .details-cover-wrapper {
            margin: 0 auto !important;
            width: 180px !important;
            height: 250px !important;
          }
          .details-meta {
            align-items: center !important;
          }
          .details-tags {
            justify-content: center !important;
          }
          .details-actions {
            justify-content: center !important;
            width: 100%;
          }
          .details-action-btn {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

// Styles
const errorContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  textAlign: 'center',
};

const detailsContainerStyle: React.CSSProperties = {
  width: '100%',
  position: 'relative',
  paddingBottom: '4rem',
};

const bannerContainerStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '350px',
  overflow: 'hidden',
  zIndex: 1,
};

const bannerOverlayStyle = (coverUrl: string): React.CSSProperties => ({
  width: '100%',
  height: '100%',
  backgroundImage: `url(${coverUrl})`,
  backgroundPosition: 'center 20%',
  backgroundSize: 'cover',
  filter: 'blur(30px) brightness(0.35)',
  transform: 'scale(1.1)',
});

const bannerFadeStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  height: '150px',
  background: 'linear-gradient(to top, var(--bg-base) 0%, transparent 100%)',
};

const contentWrapperStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 2,
  paddingTop: '120px',
  display: 'flex',
  flexDirection: 'column',
  gap: '3rem',
};

const infoGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '240px 1fr',
  gap: '2.5rem',
  alignItems: 'end',
};

const coverWrapperStyle: React.CSSProperties = {
  width: '240px',
  height: '340px',
  borderRadius: 'var(--radius-md)',
  overflow: 'hidden',
  boxShadow: 'var(--shadow-lg)',
  border: '2px solid rgba(255, 255, 255, 0.1)',
  background: '#090d16',
};

const coverStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const metaStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  paddingBottom: '0.5rem',
};

const titleStyle: React.CSSProperties = {
  fontSize: '2.5rem',
  fontWeight: '800',
  lineHeight: 1.15,
  color: 'white',
  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
};

const authorStyle: React.CSSProperties = {
  fontSize: '1rem',
  color: 'var(--text-secondary)',
};

const tagsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  flexWrap: 'wrap',
  margin: '0.25rem 0',
};

const ratingContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  background: 'rgba(255,255,255,0.02)',
  padding: '0.5rem 1rem',
  borderRadius: 'var(--radius-md)',
  width: 'fit-content',
  border: '1px solid var(--border-color)',
};

const descriptionContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  marginTop: '0.5rem',
};

const descriptionStyle: React.CSSProperties = {
  fontSize: '0.92rem',
  color: 'var(--text-secondary)',
  lineHeight: 1.6,
  overflow: 'hidden',
  transition: 'max-height 0.3s ease',
};

const expandBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--accent-purple)',
  fontSize: '0.85rem',
  fontWeight: '700',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  width: 'fit-content',
  padding: '0.25rem 0',
};

const actionButtonsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  marginTop: '1rem',
  flexWrap: 'wrap',
};

const readBtnStyle: React.CSSProperties = {
  background: 'var(--accent-gradient)',
  color: 'white',
  padding: '0.85rem 1.8rem',
  fontWeight: '700',
  boxShadow: 'var(--glow-purple)',
};

const chaptersSectionStyle: React.CSSProperties = {
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--border-color)',
  padding: '2rem',
};

const chaptersHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '1rem',
  flexWrap: 'wrap',
  gap: '1rem',
};

const chaptersTitleStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: '800',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const langSelectorStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  background: 'rgba(8, 12, 20, 0.4)',
  padding: '0.25rem',
  borderRadius: 'var(--radius-sm)',
};

const langTabStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: '0.4rem 0.8rem',
  fontSize: '0.78rem',
  fontWeight: '700',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  borderRadius: '4px',
};

const chapterControlsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '1.5rem 0',
  flexWrap: 'wrap',
  gap: '1rem',
};

const chapterSearchStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: 'rgba(8, 12, 20, 0.5)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  padding: '0 0.75rem',
  height: '38px',
  width: '100%',
  maxWidth: '300px',
};

const chapterSearchInputStyle: React.CSSProperties = {
  flex: 1,
  fontSize: '0.85rem',
  background: 'transparent',
  border: 'none',
  outline: 'none',
};

const sortBtnStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid var(--border-color)',
  color: 'var(--text-secondary)',
  padding: '0.5rem 1rem',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.85rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const chaptersListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  maxHeight: '700px',
  overflowY: 'auto',
  paddingRight: '0.5rem',
};

const chapterRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 1.25rem',
  borderRadius: 'var(--radius-md)',
  flexWrap: 'wrap',
  gap: '0.75rem',
};

const chapterInfoLeftStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
  flexWrap: 'wrap',
};

const chapterNumberStyle: React.CSSProperties = {
  fontSize: '0.98rem',
  fontWeight: '800',
};

const chapterTitleTextStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: 'var(--text-secondary)',
};

const chapterInfoRightStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
  flexWrap: 'wrap',
  marginLeft: 'auto',
};

const chapterScanStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: 'var(--text-secondary)',
  background: 'rgba(255,255,255,0.03)',
  padding: '0.2rem 0.5rem',
  borderRadius: 'var(--radius-sm)',
  maxWidth: '150px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const chapterMetaDateStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  fontSize: '0.78rem',
  color: 'var(--text-muted)',
};

const readStatusBadgeStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '22px',
  height: '22px',
  borderRadius: 'var(--radius-full)',
  background: 'rgba(16, 185, 129, 0.1)',
  border: '1px solid rgba(16, 185, 129, 0.2)',
};
