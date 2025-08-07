import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Monitor, Upload, Calendar, CreditCard, User, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  return <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-foreground rounded-sm"></div>
            </div>
            <span className="text-xl font-bold text-foreground">RedSquare Broadcast</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="/production-plan" className="text-muted-foreground hover:text-foreground transition-colors">
              Production Road Map
            </a>
            <a href="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="/discover" className="text-muted-foreground hover:text-foreground transition-colors">
              Discover Screens
            </a>
            {user ? (
              <>
                <Button variant="outline" asChild>
                  <a href="/discover">Find Screens</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/register-screen">Register Screen</a>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">Account</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <a href="/auth">Sign In</a>
                </Button>
                <Button className="bg-gradient-primary hover:shadow-[var(--shadow-red)] transition-all duration-300" asChild>
                  <a href="/auth">Get Started</a>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How It Works (Detailed)
              </a>
              <a href="/discover" className="text-muted-foreground hover:text-foreground transition-colors">
                Discover Screens
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                {user ? (
                  <Button onClick={signOut} variant="outline">
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" asChild>
                      <a href="/auth">Sign In</a>
                    </Button>
                    <Button className="bg-gradient-primary" asChild>
                      <a href="/auth">Get Started</a>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>}
      </div>
    </nav>;
};
