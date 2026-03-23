import { useState } from 'react';
import { Shield, BookOpen, FlaskConical, Code, TrendingUp, Menu, X, Trophy } from 'lucide-react';
import { TheoryView } from './components/TheoryView';
import { LabsList } from './components/LabsList';
import { PayloadPlayground } from './components/PayloadPlayground';
import { ProgressDashboard } from './components/ProgressDashboard';
import CTFSection from './components/CTFSection';

type View = 'theory' | 'labs' | 'playground' | 'progress' | 'ctf';

function App() {
  const [currentView, setCurrentView] = useState<View>('theory');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { id: 'theory', label: 'Teoría', icon: BookOpen },
    { id: 'labs', label: 'Laboratorios', icon: FlaskConical },
    { id: 'playground', label: 'Playground', icon: Code },
    { id: 'progress', label: 'Progreso', icon: TrendingUp },
    { id: 'ctf', label: 'CTF', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <nav className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-500" />
              <div>
                <h1 className="text-xl font-bold text-white">XSS Academy</h1>
                <p className="text-xs text-gray-400">Cross-Site Scripting Training Platform</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as View)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>


            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700 bg-gray-900">
            <div className="px-4 py-3 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id as View);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      <main className={currentView === 'ctf' ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {currentView === 'theory' && <TheoryView />}
        {currentView === 'labs' && <LabsList />}
        {currentView === 'playground' && <PayloadPlayground />}
        {currentView === 'progress' && <ProgressDashboard />}
        {currentView === 'ctf' && <CTFSection />}
      </main>

      <footer className="bg-gray-900 border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-6 h-6 text-red-500" />
                <h3 className="text-white font-bold">XSS Academy</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Plataforma educativa para aprender Cross-Site Scripting de forma segura y profesional.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Recursos</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="https://owasp.org/www-community/attacks/xss/" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    OWASP XSS Guide
                  </a>
                </li>
                <li>
                  <a href="https://portswigger.net/web-security/cross-site-scripting" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    PortSwigger XSS
                  </a>
                </li>
                <li>
                  <a href="https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    XSS Prevention Cheat Sheet
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Advertencia Legal</h3>
              <p className="text-gray-400 text-sm">
                Este contenido es solo para fines educativos. No uses estas técnicas en sistemas
                sin autorización explícita. El uso no autorizado es ilegal.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 XSS Academy. Todos los derechos reservados. Hecho con fines educativos.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
