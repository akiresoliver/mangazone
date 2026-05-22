import React, { useEffect, useState } from 'react';
import { searchManga, type Manga } from '../api/mangadex';
import { MangaCard } from '../components/MangaCard';
import { MangaGridSkeleton } from '../components/Skeleton';
import { useFavorites } from '../hooks/useLocalStorage';
import { Search as SearchIcon } from 'lucide-react';

interface SearchProps {
  query: string;
}

export const Search: React.FC<SearchProps> = ({ query }) => {
  const [results, setResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const searchResults = await searchManga(query, 24);
        setResults(searchResults);
      } catch (err) {
        console.error(err);
        setError('Houve um erro ao realizar a busca. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [query]);

  return (
    <div style={containerStyle} className="fade-in container">
      
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          <SearchIcon size={28} style={{ color: 'var(--accent-purple)' }} />
          {query.trim() ? 'Resultados da Busca' : 'Descobrir Mangás'}
        </h1>
        <p style={subtitleStyle}>
          {query.trim() ? `Exibindo resultados para: "${query}"` : 'Busque por um título ou escolha uma categoria abaixo:'}
        </p>
      </div>

      {!query.trim() ? (
        <div style={categoriesContainerStyle}>
          {['Ação', 'Romance', 'Comédia', 'Isekai', 'Terror', 'Ficção Científica', 'Mistério', 'Drama', 'Aventura', 'Fantasia'].map(cat => (
            <button 
              key={cat} 
              onClick={() => window.location.hash = `#/search?q=${cat}`}
              style={categoryBtnStyle}
              className="category-btn"
            >
              {cat}
            </button>
          ))}
        </div>
      ) : loading ? (
        <MangaGridSkeleton count={12} />
      ) : error ? (
        <div style={errorContainerStyle}>
          <h3>Erro na busca</h3>
          <p>{error}</p>
        </div>
      ) : results.length === 0 ? (
        <div style={emptyContainerStyle}>
          <h3>Nenhum resultado encontrado</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Não encontramos nenhum mangá com o nome "{query}". Tente buscar com termos diferentes ou verifique a grafia.
          </p>
          <button 
            onClick={() => window.location.hash = '#/'} 
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
          >
            Voltar para o Início
          </button>
        </div>
      ) : (
        <div style={gridStyle}>
          {results.map((manga) => (
            <MangaCard
              key={manga.id}
              manga={manga}
              isFavorite={isFavorite(manga.id)}
              onToggleFavorite={() => toggleFavorite(manga)}
            />
          ))}
        </div>
      )}
      
      <style>{`
        .category-btn:hover {
          background: var(--accent-purple) !important;
          color: white !important;
          transform: translateY(-2px);
          box-shadow: var(--glow-purple);
        }
      `}</style>
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

const errorContainerStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '3rem',
  background: 'var(--bg-surface)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-color)',
};

const emptyContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '260px',
  textAlign: 'center',
  maxWidth: '450px',
  margin: '2rem auto',
  gap: '0.75rem',
  padding: '2rem',
  background: 'var(--bg-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--border-color)',
};

const categoriesContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem',
  marginTop: '2rem',
};

const categoryBtnStyle: React.CSSProperties = {
  padding: '1rem 2rem',
  borderRadius: 'var(--radius-full)',
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-color)',
  color: 'var(--text-primary)',
  fontWeight: '700',
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  flex: '1 1 calc(20% - 1rem)',
  minWidth: '150px',
  textAlign: 'center',
};
