import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Users,
  Heart, 
  Search, 
  MessageCircle, 
  User, 
  LogOut
} from 'lucide-react';

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const { signOut } = useAuth();

  const navItems = [
    { path: '/community', icon: Users, label: 'Community' },
    { path: '/matches', icon: Heart, label: 'Matches' },
    { path: '/browse', icon: Search, label: 'Browse' },
    { path: '/messages', icon: MessageCircle, label: 'Messages' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const handleLogout = async () => {
    await signOut();
    setLocation('/');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-pink-500/20 backdrop-blur-lg z-50 md:top-0 md:bottom-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Desktop only */}
          <div className="hidden md:block">
            <h1
              className="text-2xl font-bold cursor-pointer"
              onClick={() => setLocation('/browse')}
              style={{
                background: 'linear-gradient(135deg, #ff1493, #ff69b4, #ff91a4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              SPICE
            </h1>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center justify-around md:justify-center flex-1 md:flex-none md:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className={`flex flex-col md:flex-row items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'text-pink-500'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs md:text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Logout - Desktop only */}
          <div className="hidden md:block">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white/60 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}