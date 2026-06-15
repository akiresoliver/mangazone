import React, { useEffect, useState, useRef } from 'react';
import { getChapterPages, getChapterDetails, getMangaDetails, getMangaChapters, type Chapter, type Manga } from '../api/mangadex';
import { useHistory } from '../hooks/useLocalStorage';
import { useProfile } from '../hooks/useProfile';
import { Comments } from './Comments';
import { ChevronLeft, ChevronRight, Layout, Image as ImageIcon, ArrowLeft, Loader2 } from 'lucide-react';

interface MangaReaderProps {
  chapterId: string;
}

type ViewMode = 'cascade' | 'page';
type QualityMode = 'original' | 'saver';

export const MangaReader: React.FC<MangaReaderProps> = ({ chapterId }) => {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [manga, setManga] = useState<Manga | null>(null);
  const [chaptersList, setChaptersList] = useState<Chapter[]>([]);
  const [pages, setPages] = useState<string[]>([]);
  const [saverPages, setSaverPages] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Settings (defaulting to local storage or defaults)
  const [viewMode, setViewMode] = useState<ViewMode>(
    (localStorage.getItem('reader_view_mode') as ViewMode) || 'cascade'
  );
  const [quality, setQuality] = useState<QualityMode>(
    (localStorage.getItem('reader_quality') as QualityMode) || 'original'
  );
  
  // Reader state
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const readerTopRef = useRef<HTMLDivElement>(null);
  
  const { saveHistory, getMangaProgress } = useHistory();
  const { addXp } = useProfile();

  // Load Chapter and Manga details
  useEffect(() => {
    async function loadReaderData() {
      try {
        setLoading(true);
        setError(null);
        setCurrentPageIndex(0);
        
        // 1. Fetch chapter details
        const chapData = await getChapterDetails(chapterId);
        setChapter(chapData);

        // 2. Fetch manga details (need it for history details and cover)
        const mangaData = await getMangaDetails(chapData.mangaId);
        setManga(mangaData);

        // 3. Fetch chapter pages list
        const pagesData = await getChapterPages(chapterId);
        setPages(pagesData.pages);
        setSaverPages(pagesData.saverPages);

        // 4. Fetch list of chapters of this manga for the dropdown selector
        const chaps = await getMangaChapters(chapData.mangaId);
        // Only include chapters in the same language as the current chapter
        const sameLangChapters = chaps
          .filter((c) => c.language === chapData.language)
          .sort((a, b) => (parseFloat(a.chapterNum) || 0) - (parseFloat(b.chapterNum) || 0)); // Sort ascending for clean selection
        
        setChaptersList(sameLangChapters);

        // Initial progress restoration
        const progress = getMangaProgress(chapData.mangaId);
        let startPage = 0;
        if (progress && progress.chapterId === chapterId && progress.pageNumber) {
          startPage = progress.pageNumber;
          setCurrentPageIndex(startPage);
        } else {
          setCurrentPageIndex(0);
        }

        // Add this chapter to read chapters array in localStorage
        const storedRead = localStorage.getItem('mangastop_read_chapters');
        let readList: string[] = [];
        if (storedRead) {
          try {
            readList = JSON.parse(storedRead);
          } catch (e) {}
        }
        if (!readList.includes(chapterId)) {
          readList.push(chapterId);
          localStorage.setItem('mangastop_read_chapters', JSON.stringify(readList));
          // Grant XP for reading a new chapter
          addXp(50);
        }

        // Scroll to top or specific page
        if (startPage > 0 && viewMode === 'cascade') {
          setTimeout(() => {
            document.getElementById(`page-${startPage}`)?.scrollIntoView({ behavior: 'instant' });
          }, 200);
        } else {
          window.scrollTo({ top: 0, behavior: 'instant' as any });
        }
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar as páginas do capítulo.');
      } finally {
        setLoading(false);
      }
    }

    loadReaderData();
  }, [chapterId]);

  // Effect to save history whenever currentPageIndex changes
  useEffect(() => {
    if (!manga || !chapter || pages.length === 0) return;
    saveHistory(
      manga.id,
      manga.title,
      manga.coverUrl,
      chapter.id,
      chapter.chapterNum,
      chapter.title,
      currentPageIndex
    );
  }, [currentPageIndex, manga, chapter]);

  // Page mode keyboard controls
  useEffect(() => {
    if (viewMode !== 'page' || pages.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, currentPageIndex, pages, saverPages]);

  // Save Settings toggles to Local Storage
  const handleToggleViewMode = () => {
    const nextMode = viewMode === 'cascade' ? 'page' : 'cascade';
    setViewMode(nextMode);
    localStorage.setItem('reader_view_mode', nextMode);
    setCurrentPageIndex(0);
  };

  const handleToggleQuality = () => {
    const nextQuality = quality === 'original' ? 'saver' : 'original';
    setQuality(nextQuality);
    localStorage.setItem('reader_quality', nextQuality);
  };

  // Navigations between chapters
  const getPrevAndNextChapter = () => {
    if (!chapter || chaptersList.length === 0) return { prev: null, next: null };
    
    const currentIndex = chaptersList.findIndex((c) => c.id === chapter.id);
    if (currentIndex === -1) return { prev: null, next: null };

    return {
      prev: currentIndex > 0 ? chaptersList[currentIndex - 1] : null,
      next: currentIndex < chaptersList.length - 1 ? chaptersList[currentIndex + 1] : null
    };
  };

  const { prev: prevChapter, next: nextChapter } = getPrevAndNextChapter();

  const handleChapterSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newChapId = e.target.value;
    if (newChapId) {
      window.location.hash = `#/chapter/${newChapId}`;
    }
  };

  // Page by page controls
  const handleNextPage = () => {
    setIsZoomed(false); // Reset zoom on page change
    const currentPagesList = quality === 'original' ? pages : saverPages;
    if (currentPageIndex < currentPagesList.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (nextChapter) {
      // Go to next chapter if reached end of pages
      window.location.hash = `#/chapter/${nextChapter.id}`;
    }
  };

  const handlePrevPage = () => {
    setIsZoomed(false); // Reset zoom on page change
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (prevChapter) {
      // Go to prev chapter
      window.location.hash = `#/chapter/${prevChapter.id}`;
    }
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <Loader2 size={48} className="animate-spin" style={{ color: 'var(--accent-purple)' }} />
        <h3>Preparando as páginas...</h3>
      </div>
    );
  }

  if (error || !chapter || !manga) {
    return (
      <div className="container" style={errorContainerStyle}>
        <h2>Erro ao carregar o leitor</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{error || 'Informações inválidas.'}</p>
        <button onClick={() => window.location.hash = '#/'} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          Voltar para o Início
        </button>
      </div>
    );
  }

  const activePages = quality === 'original' ? pages : saverPages;
  const currentImage = activePages[currentPageIndex];

  return (
    <div style={readerContainerStyle} className="fade-in" ref={readerTopRef}>
      
      {/* Reader Toolbar / Header */}
      <div style={toolbarStyle} className="glass">
        <div className="container" style={toolbarContainerStyle}>
          {/* Back Action */}
          <button onClick={() => window.location.hash = `#/manga/${manga.id}`} style={backBtnStyle} className="back-btn">
            <ArrowLeft size={18} />
            <span className="desktop-only">Voltar</span>
          </button>
          
          {/* Manga Title & Chapter Info */}
          <div style={infoWrapperStyle}>
            <h4 style={mangaTitleStyle} title={manga.title}>{manga.title}</h4>
            <div style={chapterTitleStyle}>
              <span>Capítulo {chapter.chapterNum}</span>
              {chapter.title && <span className="desktop-only">• {chapter.title}</span>}
            </div>
          </div>

          {/* Chapter select dropdown */}
          <div style={dropdownWrapperStyle}>
            <select 
              value={chapter.id} 
              onChange={handleChapterSelect}
              style={{ ...selectStyle, backgroundColor: 'var(--bg-base)' }}
            >
              {chaptersList.map((c) => (
                <option key={c.id} value={c.id} style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                  Cap. {c.chapterNum} {c.title ? `- ${c.title.substring(0, 20)}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Settings Buttons */}
          <div style={actionsGroupStyle}>
            {/* View Mode Toggle */}
            <button 
              onClick={handleToggleViewMode} 
              style={settingsBtnStyle}
              title={viewMode === 'cascade' ? 'Mudar para modo Página Única' : 'Mudar para modo Cascata (Rolo)'}
            >
              <Layout size={18} color={viewMode === 'page' ? 'var(--accent-purple)' : 'var(--text-primary)'} />
              <span className="desktop-only">{viewMode === 'cascade' ? 'Cascata' : 'Página'}</span>
            </button>

            {/* Quality Toggle */}
            <button 
              onClick={handleToggleQuality} 
              style={settingsBtnStyle}
              title={quality === 'original' ? 'Mudar para Data Saver (Imagens mais leves)' : 'Mudar para Original (Alta qualidade)'}
            >
              <ImageIcon size={18} color={quality === 'saver' ? 'var(--accent-cyan)' : 'var(--text-primary)'} />
              <span className="desktop-only">{quality === 'original' ? 'Original' : 'Economia'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pages Container */}
      <div className="container" style={pagesAreaStyle}>
        
        {/* Cascade Mode */}
        {viewMode === 'cascade' ? (
          <div style={cascadePagesWrapperStyle}>
            {activePages.map((url, index) => (
              <div 
                key={index}
                id={`page-${index}`}
                style={cascadeImageWrapperStyle} 
                className="cascade-image-container"
                onDoubleClick={toggleZoom}
                ref={(el) => {
                  if (el) {
                    const observer = new IntersectionObserver((entries) => {
                      if (entries[0].isIntersecting) {
                        setCurrentPageIndex(index);
                      }
                    }, { threshold: 0.5 });
                    observer.observe(el);
                    // store observer to unobserve later if needed, but react handles unmounting ok here for simple cases
                  }
                }}
              >
                <img
                  src={url}
                  alt={`Página ${index + 1}`}
                  style={{
                    ...cascadeImageStyle,
                    transform: isZoomed ? 'scale(1.5)' : 'scale(1)',
                    cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                    transformOrigin: 'top center',
                    transition: 'transform 0.3s ease'
                  }}
                  loading="lazy"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (!img.src.includes('data-saver') && saverPages[index]) {
                      img.src = saverPages[index];
                    }
                  }}
                />
                <div style={pageNumberOverlayStyle}>
                  Página {index + 1} de {activePages.length}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Single Page Mode */
          <div style={singlePageWrapperStyle}>
            <div 
              style={{
                ...singlePageImageContainerStyle,
                overflow: isZoomed ? 'visible' : 'hidden'
              }}
              onDoubleClick={toggleZoom}
            >
              {/* Prev click zone */}
              {!isZoomed && <div onClick={handlePrevPage} style={leftNavZoneStyle} className="nav-zone" />}
              
              <img
                src={currentImage}
                alt={`Página ${currentPageIndex + 1}`}
                style={{
                  ...singlePageImageStyle,
                  transform: isZoomed ? 'scale(1.5)' : 'scale(1)',
                  cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                  transition: 'transform 0.3s ease',
                  maxHeight: isZoomed ? 'none' : '85vh'
                }}
              />
              
              {/* Next click zone */}
              {!isZoomed && <div onClick={handleNextPage} style={rightNavZoneStyle} className="nav-zone" />}
            </div>

            {/* Pagination Info & Controls */}
            <div style={pageNavigationControlsStyle}>
              <button 
                onClick={handlePrevPage} 
                disabled={currentPageIndex === 0 && !prevChapter}
                className="btn btn-secondary"
                style={pageNavBtnStyle}
              >
                <ChevronLeft size={20} />
                Anterior
              </button>
              
              <span style={pageNavInfoStyle}>
                Página <strong>{currentPageIndex + 1}</strong> de <strong>{activePages.length}</strong>
              </span>

              <button 
                onClick={handleNextPage} 
                className="btn btn-secondary"
                style={pageNavBtnStyle}
              >
                Próxima
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation between Chapters */}
        <div style={bottomChapterNavigationStyle}>
          <button
            onClick={() => prevChapter && (window.location.hash = `#/chapter/${prevChapter.id}`)}
            disabled={!prevChapter}
            className="btn btn-secondary"
            style={chapterNavBtnStyle}
          >
            <ChevronLeft size={18} />
            Capítulo Anterior
          </button>
          
          <button
            onClick={() => window.location.hash = `#/manga/${manga.id}`}
            className="btn btn-secondary"
            style={{ ...chapterNavBtnStyle, borderColor: 'var(--border-color)' }}
          >
            Lista de Capítulos
          </button>

          <button
            onClick={() => nextChapter && (window.location.hash = `#/chapter/${nextChapter.id}`)}
            disabled={!nextChapter}
            className="btn btn-primary"
            style={chapterNavBtnStyle}
          >
            Próximo Capítulo
            <ChevronRight size={18} />
          </button>
        </div>

        {chapter && manga && (
          <Comments 
            url={`https://mangazone-demo.com/chapter/${chapter.id}`} 
            identifier={chapter.id} 
            title={`${manga.title} - Capítulo ${chapter.chapterNum}`} 
          />
        )}

      </div>

      <style>{`
        .nav-zone {
          position: absolute;
          top: 0;
          height: 100%;
          width: 25%;
          cursor: pointer;
          z-index: 10;
          transition: background 0.2s;
        }
        .nav-zone:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .back-btn:hover {
          color: var(--accent-purple) !important;
        }
        .cascade-image-container img {
          box-shadow: 0 4px 20px rgba(0,0,0,0.6);
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        /* Toolbar and buttons responsiveness */
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

// Styles
const loadingContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '75vh',
  textAlign: 'center',
  gap: '1rem',
};

const errorContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '75vh',
  textAlign: 'center',
};

const readerContainerStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: '#04070d', // extra dark for reading focus
  minHeight: '100vh',
};

const toolbarStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '64px',
  zIndex: 100,
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  alignItems: 'center',
  background: 'var(--bg-base)', // solid background just in case
};

const toolbarContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
};

const backBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontSize: '0.9rem',
  fontWeight: '700',
};

const infoWrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  maxWidth: '30%',
  overflow: 'hidden',
};

const mangaTitleStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  fontWeight: '700',
  color: 'white',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const chapterTitleStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  color: 'var(--text-secondary)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'flex',
  gap: '0.25rem',
};

const dropdownWrapperStyle: React.CSSProperties = {
  background: 'rgba(8, 12, 20, 0.7)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-sm)',
  padding: '0 0.5rem',
  display: 'flex',
  alignItems: 'center',
};

const selectStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-primary)',
  fontSize: '0.85rem',
  fontWeight: '700',
  height: '34px',
  outline: 'none',
  cursor: 'pointer',
};

const actionsGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
};

const settingsBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--border-color)',
  color: 'var(--text-primary)',
  padding: '0.4rem 0.75rem',
  borderRadius: 'var(--radius-sm)',
  fontSize: '0.82rem',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  cursor: 'pointer',
  height: '34px',
};

const pagesAreaStyle: React.CSSProperties = {
  paddingTop: '2rem',
  paddingBottom: '5rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '900px', // standard reading width
};

const cascadePagesWrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  alignItems: 'center',
  gap: '0.75rem',
};

const cascadeImageWrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  position: 'relative',
};

const cascadeImageStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '100%',
  height: 'auto',
  display: 'block',
  objectFit: 'contain',
};

const pageNumberOverlayStyle: React.CSSProperties = {
  marginTop: '0.35rem',
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
};

const singlePageWrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  gap: '1.5rem',
};

const singlePageImageContainerStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  background: '#020408',
  boxShadow: 'var(--shadow-lg)',
  borderRadius: 'var(--radius-sm)',
  overflow: 'hidden',
};

const singlePageImageStyle: React.CSSProperties = {
  width: '100%',
  height: 'auto',
  maxHeight: '85vh',
  objectFit: 'contain',
  display: 'block',
};

const leftNavZoneStyle: React.CSSProperties = {
  left: 0,
};

const rightNavZoneStyle: React.CSSProperties = {
  right: 0,
};

const pageNavigationControlsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  maxWidth: '500px',
  gap: '1rem',
};

const pageNavBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: '0.6rem 1rem',
  fontSize: '0.88rem',
};

const pageNavInfoStyle: React.CSSProperties = {
  fontSize: '0.92rem',
  color: 'var(--text-secondary)',
  whiteSpace: 'nowrap',
};

const bottomChapterNavigationStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  borderTop: '1px solid var(--border-color)',
  paddingTop: '2.5rem',
  marginTop: '3rem',
  flexWrap: 'wrap',
  gap: '1rem',
};

const chapterNavBtnStyle: React.CSSProperties = {
  padding: '0.75rem 1.25rem',
  fontSize: '0.9rem',
  fontWeight: '700',
  flex: 1,
  maxWidth: '220px',
};
