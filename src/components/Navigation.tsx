import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Monitor, Upload, Calendar, CreditCard, User, LogOut, Settings } from "lucide-react";
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
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="outline" asChild>
                  <a href="/discover">Find Screens</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/my-campaigns">My Dashboard</a>
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
                    <DropdownMenuItem asChild>
                      <a href="/profile" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Profile Settings
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="/dashboard" className="flex items-center">
                        <Monitor className="w-4 h-4 mr-2" />
                        Screen Management
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="/device-setup" className="flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Device Setup
                      </a>
                    </DropdownMenuItem>
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
                  <a href="/how-it-works">How It Works</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/discover">Find Screens</a>
                </Button>
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
            <div className="flex flex-col space-y-3">
              {user ? (
                <>
                  <Button variant="outline" asChild className="w-full justify-start">
                    <a href="/discover">Find Screens</a>
                  </Button>
                  <Button variant="outline" asChild className="w-full justify-start">
                    <a href="/my-campaigns">My Dashboard</a>
                  </Button>
                  <Button variant="outline" asChild className="w-full justify-start">
                    <a href="/profile">Profile Settings</a>
                  </Button>
                  <Button variant="outline" asChild className="w-full justify-start">
                    <a href="/dashboard">Screen Management</a>
                  </Button>
                  <Button variant="outline" asChild className="w-full justify-start">
                    <a href="/device-setup">Device Setup</a>
                  </Button>
                  <Button onClick={signOut} variant="outline" className="w-full justify-start">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full justify-start">
                    <a href="/how-it-works">How It Works</a>
                  </Button>
                  <Button variant="outline" asChild className="w-full justify-start">
                    <a href="/discover">Find Screens</a>
                  </Button>
                  <Button variant="outline" asChild className="w-full justify-start">
                    <a href="/auth">Sign In</a>
                  </Button>
                  <Button className="bg-gradient-primary w-full justify-start" asChild>
                    <a href="/auth">Get Started</a>
                  </Button>
                </>
              )}
            </div>
          </div>}
      </div>
    </nav>;
};
