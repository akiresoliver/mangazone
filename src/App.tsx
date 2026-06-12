import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { MangaDetails } from './pages/MangaDetails';
import { Favorites } from './pages/Favorites';
import { Search } from './pages/Search';
import { MangaReader } from './components/MangaReader';
import { Profile } from './pages/Profile';
import { VIP } from './pages/VIP';
import { Novels } from './pages/Novels';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './hooks/useTheme';
import './App.css';

type Route = 'home' | 'manga-details' | 'favorites' | 'search' | 'reader' | 'profile' | 'vip' | 'novels';

function App() {
  const [route, setRoute] = useState<Route>('home');
  const [params, setParams] = useState<Record<string, string>>({});
  
  // Initialize theme globally
  useTheme();
  const { isVip } = useAuth();

  useEffect(() => {
    if (isVip) {
      document.body.classList.add('vip-theme');
    } else {
      document.body.classList.remove('vip-theme');
    }
  }, [isVip]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/';
      
      if (hash.startsWith('#/manga/')) {
        const id = hash.substring(8); // get id after '#/manga/'
        setRoute('manga-details');
        setParams({ mangaId: id });
      } else if (hash.startsWith('#/chapter/')) {
        const id = hash.substring(10); // get id after '#/chapter/'
        setRoute('reader');
        setParams({ chapterId: id });
      } else if (hash.startsWith('#/search')) {
        // Parse search query
        // Expected format: #/search?q=query_string
        const queryPart = hash.split('?')[1] || '';
        const searchParams = new URLSearchParams(queryPart);
        const query = searchParams.get('q') || '';
        setRoute('search');
        setParams({ query });
      } else if (hash === '#/favorites') {
        setRoute('favorites');
        setParams({});
      } else if (hash.startsWith('#/perfil')) {
        setRoute('profile');
        setParams({});
      } else if (hash.startsWith('#/vip')) {
        setRoute('vip');
        setParams({});
      } else if (hash.startsWith('#/novels')) {
        setRoute('novels');
        setParams({});
      } else {
        setRoute('home');
        setParams({});
      }
      
      // Auto scroll to top when route changes
      window.scrollTo({ top: 0, behavior: 'instant' as any });
    };

    // Initialize routing on load
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Render current page based on active route
  const renderPage = () => {
    switch (route) {
      case 'manga-details':
        return <MangaDetails mangaId={params.mangaId} />;
      case 'reader':
        return <MangaReader chapterId={params.chapterId} />;
      case 'profile':
        return <Profile />;
      case 'vip':
        return <VIP />;
      case 'novels':
        return <Novels />;
      case 'favorites':
        return <Favorites />;
      case 'search':
        return <Search query={params.query} />;
      case 'home':
      default:
        return <Home />;
    }
  };

  // We don't render standard header/footer if the reader mode is open, to keep the screen 100% focused on reading!
  // This is a premium touch used by many top manga reader sites (the reader has its own simple custom toolbar).
  const isReaderOpen = route === 'reader';

  return (
    <>
      {!isReaderOpen && <Header />}
      
      <main style={mainContentStyle}>
        {renderPage()}
      </main>

      {!isReaderOpen && <Footer />}
    </>
  );
}

const mainContentStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
};

export default App;
