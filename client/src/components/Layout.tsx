import { ReactNode } from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export default function Layout({ children, showNav = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {showNav && <Navigation />}
      <main className={showNav ? 'pb-20 md:pt-20' : ''}>
        {children}
      </main>
    </div>
  );
}