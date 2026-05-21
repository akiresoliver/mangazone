import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Search, Star, Home, Loader2, X } from 'lucide-react';
import { searchManga, type Manga } from '../api/mangadex';

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Manga[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLFormElement>(null);
  
  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced API Search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setShowDropdown(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const results = await searchManga(searchQuery, 6);
        setSearchResults(results);
      } catch (err) {
        console.error('Erro na busca:', err);
      } finally {
        setIsSearching(false);
      }
    }, 450); // 450ms debounce delay

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleResultClick = (mangaId: string) => {
    window.location.hash = `#/manga/${mangaId}`;
    setSearchQuery('');
    setShowDropdown(false);
    setIsMobileSearchOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.hash = `#/search?q=${encodeURIComponent(searchQuery)}`;
      setShowDropdown(false);
      setIsMobileSearchOpen(false);
    }
  };

  return (
    <header className="glass" style={headerStyle}>
      <div className="container" style={headerContainerStyle}>
        
        {/* Logo */}
        <a href="#/" style={logoStyle} onClick={() => { setSearchQuery(''); }}>
          <div style={logoIconStyle}>
            <BookOpen size={24} color="#f8fafc" />
          </div>
          <span style={logoTextStyle}>
            Manga<span style={logoStopStyle}>Zone</span>
          </span>
        </a>

        {/* Desktop Search Bar */}
        <form onSubmit={handleSearchSubmit} style={searchFormStyle} ref={dropdownRef} className="desktop-search">
          <div style={searchContainerStyle}>
            <Search size={18} style={searchIconStyle} />
            <input
              type="text"
              placeholder="Buscar mangá..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length >= 2 && setShowDropdown(true)}
              style={searchInputStyle}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} style={clearButtonStyle}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && (
            <div style={dropdownStyle} className="glass">
              {isSearching ? (
                <div style={dropdownStatusStyle}>
                  <Loader2 size={18} className="animate-spin" style={{ color: 'var(--accent-purple)' }} />
                  <span>Buscando obras...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div style={dropdownListStyle}>
                  {searchResults.map((manga) => (
                    <div
                      key={manga.id}
                      onClick={() => handleResultClick(manga.id)}
                      style={dropdownItemStyle}
                      className="dropdown-item"
                    >
                      <img src={manga.coverUrl} alt={manga.title} style={dropdownCoverStyle} />
                      <div style={dropdownMetaStyle}>
                        <div style={dropdownTitleStyle}>{manga.title}</div>
                        <div style={dropdownAuthorStyle}>{manga.author}</div>
                        <div style={dropdownTagsStyle}>
                          {manga.tags.slice(0, 2).map((t, idx) => (
                            <span key={idx} className="badge badge-purple" style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem' }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="submit" style={viewAllResultsBtnStyle} className="view-all-results">
                    Ver todos os resultados para "{searchQuery}"
                  </button>
                </div>
              ) : (
                <div style={dropdownStatusStyle}>Nenhum mangá encontrado.</div>
              )}
            </div>
          )}
        </form>

        {/* Navigation Actions */}
        <nav style={navStyle}>
          <a href="#/" style={navLinkStyle} className="nav-link">
            <Home size={18} />
            <span className="desktop-text">Início</span>
          </a>
          <a href="#/favorites" style={navLinkStyle} className="nav-link">
            <Star size={18} />
            <span className="desktop-text">Biblioteca</span>
          </a>
          
          {/* Mobile search toggle */}
          <button 
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)} 
            style={mobileSearchToggleStyle} 
            className="mobile-search-toggle"
          >
            <Search size={20} />
          </button>
        </nav>
      </div>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div style={mobileSearchOverlayStyle} className="glass fade-in">
          <form onSubmit={handleSearchSubmit} style={{ width: '100%' }}>
            <div style={mobileSearchContainerStyle}>
              <Search size={18} style={{ color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Buscar mangá..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={mobileSearchInputStyle}
              />
              <button 
                type="button" 
                onClick={() => {
                  setSearchQuery('');
                  setIsMobileSearchOpen(false);
                }} 
                style={closeSearchButtonStyle}
              >
                <X size={20} />
              </button>
            </div>
          </form>
          
          {/* Mobile Results list directly in overlay */}
          {searchQuery.trim().length >= 2 && (
            <div style={mobileResultsContainerStyle}>
              {isSearching ? (
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', padding: '2rem' }}>
                  <Loader2 className="animate-spin" style={{ color: 'var(--accent-purple)' }} />
                  Carregando...
                </div>
              ) : searchResults.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', marginTop: '1rem' }}>
                  {searchResults.map((manga) => (
                    <div 
                      key={manga.id} 
                      onClick={() => handleResultClick(manga.id)}
                      style={mobileResultItemStyle}
                    >
                      <img src={manga.coverUrl} alt={manga.title} style={mobileResultCoverStyle} />
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{manga.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{manga.author}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Nenhum resultado.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Styled JSX for local animations and responsive header styles */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .nav-link {
          transition: all 0.2s;
        }
        .nav-link:hover {
          color: var(--accent-purple) !important;
        }
        .dropdown-item {
          transition: background 0.2s;
        }
        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .view-all-results {
          transition: background 0.2s, color 0.2s;
        }
        .view-all-results:hover {
          background: rgba(139, 92, 246, 0.1);
          color: var(--text-primary);
        }
        
        /* Responsive Media Queries */
        @media (max-width: 768px) {
          .desktop-search {
            display: none !important;
          }
          .desktop-text {
            display: none;
          }
          .mobile-search-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};

// Styles
const headerStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  left: 0,
  width: '100%',
  height: 'var(--header-height)',
  zIndex: 100,
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  alignItems: 'center',
};

const headerContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '100%',
};

const logoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  textDecoration: 'none',
};

const logoIconStyle: React.CSSProperties = {
  width: '38px',
  height: '38px',
  borderRadius: 'var(--radius-md)',
  background: 'var(--accent-gradient)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: 'var(--glow-purple)',
};

const logoTextStyle: React.CSSProperties = {
  fontSize: '1.4rem',
  fontWeight: '800',
  letterSpacing: '-0.02em',
  color: 'var(--text-primary)',
};

const logoStopStyle: React.CSSProperties = {
  background: 'var(--accent-gradient)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const searchFormStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: '450px',
  margin: '0 1.5rem',
};

const searchContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  background: 'rgba(8, 12, 20, 0.6)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  padding: '0 0.75rem',
  height: '42px',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const searchIconStyle: React.CSSProperties = {
  color: 'var(--text-muted)',
  marginRight: '0.5rem',
};

const searchInputStyle: React.CSSProperties = {
  flex: 1,
  fontSize: '0.9rem',
  color: 'var(--text-primary)',
  background: 'transparent',
  border: 'none',
  outline: 'none',
  width: '100%',
};

const clearButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  padding: '0.2rem',
};

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: '52px',
  left: 0,
  width: '100%',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-color)',
  boxShadow: 'var(--shadow-lg)',
  overflow: 'hidden',
  zIndex: 101,
};

const dropdownStatusStyle: React.CSSProperties = {
  padding: '1.5rem',
  textAlign: 'center',
  color: 'var(--text-secondary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.75rem',
  fontSize: '0.9rem',
};

const dropdownListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  padding: '0.4rem 0',
};

const dropdownItemStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.75rem',
  padding: '0.6rem 1rem',
  cursor: 'pointer',
  borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
};

const dropdownCoverStyle: React.CSSProperties = {
  width: '42px',
  height: '60px',
  objectFit: 'cover',
  borderRadius: '4px',
  border: '1px solid var(--border-color)',
};

const dropdownMetaStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '0.15rem',
  overflow: 'hidden',
};

const dropdownTitleStyle: React.CSSProperties = {
  fontWeight: '600',
  fontSize: '0.88rem',
  color: 'var(--text-primary)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const dropdownAuthorStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--text-secondary)',
};

const dropdownTagsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.25rem',
  marginTop: '0.1rem',
};

const viewAllResultsBtnStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  background: 'transparent',
  border: 'none',
  borderTop: '1px solid var(--border-color)',
  color: 'var(--accent-purple)',
  fontSize: '0.85rem',
  fontWeight: '700',
  cursor: 'pointer',
  textAlign: 'center',
  width: '100%',
};

const navStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};

const navLinkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 0.75rem',
  borderRadius: 'var(--radius-sm)',
  fontSize: '0.95rem',
  fontWeight: '600',
  color: 'var(--text-secondary)',
  textDecoration: 'none',
};

const mobileSearchToggleStyle: React.CSSProperties = {
  display: 'none', // hidden by default on desktop, block on mobile
  width: '40px',
  height: '40px',
  borderRadius: 'var(--radius-md)',
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-color)',
  color: 'var(--text-primary)',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

// Mobile Search Overlay Styles
const mobileSearchOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100vh',
  padding: '1.5rem',
  zIndex: 110,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const mobileSearchContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  height: '48px',
  background: 'rgba(8, 12, 20, 0.9)',
  border: '1px solid var(--accent-purple)',
  borderRadius: 'var(--radius-md)',
  padding: '0 1rem',
  boxShadow: 'var(--glow-purple)',
};

const mobileSearchInputStyle: React.CSSProperties = {
  flex: 1,
  marginLeft: '0.75rem',
  fontSize: '1rem',
  color: 'var(--text-primary)',
};

const closeSearchButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  padding: '0.2rem',
};

const mobileResultsContainerStyle: React.CSSProperties = {
  width: '100%',
  overflowY: 'auto',
  flex: 1,
  paddingBottom: '2rem',
};

const mobileResultItemStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  padding: '0.75rem',
  background: 'rgba(255, 255, 255, 0.02)',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  border: '1px solid var(--border-color)',
};

const mobileResultCoverStyle: React.CSSProperties = {
  width: '45px',
  height: '65px',
  objectFit: 'cover',
  borderRadius: '4px',
};
