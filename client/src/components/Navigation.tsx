import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Rocket, Home, Map, Users, Store, Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navigation() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Fleet", href: "/fleet", icon: Rocket },
    { name: "Explore", href: "/explore", icon: Map },
    { name: "Guild", href: "/guild", icon: Users },
    { name: "Market", href: "/market", icon: Store },
  ];

  const NavLinks = ({ mobile = false, onClose = () => {} }) => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href;
        
        return (
          <Link key={item.name} href={item.href}>
            <Button
              variant={isActive ? "default" : "ghost"}
              className={`${mobile ? 'w-full justify-start' : ''} ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-foreground hover:text-primary hover:bg-primary/10'
              }`}
              onClick={onClose}
              data-testid={`nav-${item.name.toLowerCase()}`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {item.name}
            </Button>
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center space-x-4 cursor-pointer" data-testid="nav-logo">
              <Rocket className="h-8 w-8 text-primary glow-text" />
              <h1 className="text-2xl font-orbitron font-bold text-primary glow-text">
                STELLAR NEXUS
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <NavLinks />
          </nav>

          {/* Mobile Navigation */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" data-testid="nav-mobile-menu">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                <div className="flex items-center space-x-2 mb-6">
                  <Rocket className="h-6 w-6 text-primary" />
                  <span className="font-orbitron font-bold text-primary">STELLAR NEXUS</span>
                </div>
                <NavLinks mobile={true} onClose={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
