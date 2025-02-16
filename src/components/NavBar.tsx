
import { useNavigate } from "react-router-dom";
import { Calendar, LogOut, Search, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const NavBar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 
              onClick={() => navigate("/")}
              className="text-2xl font-semibold cursor-pointer hover:text-primary transition-colors"
            >
              MediBook
            </h1>
            <div className="hidden md:flex items-center space-x-6">
              <Button 
                variant="ghost"
                className="flex items-center space-x-2"
                onClick={() => navigate("/search")}
              >
                <Search size={18} />
                <span>Find Exams</span>
              </Button>
              <Button 
                variant="ghost"
                className="flex items-center space-x-2"
                onClick={() => navigate("/schedule")}
              >
                <Calendar size={18} />
                <span>Schedule</span>
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => navigate("/search")}
            >
              <Search size={20} />
            </Button>
            <Button 
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => navigate("/schedule")}
            >
              <Calendar size={20} />
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <User size={18} />
                    <span className="hidden md:inline">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/my-exams")}>
                    <Clock className="mr-2 h-4 w-4" />
                    My Scheduled Exams
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline"
                className="flex items-center space-x-2"
                onClick={() => navigate("/auth")}
              >
                <User size={18} />
                <span className="hidden md:inline">Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
