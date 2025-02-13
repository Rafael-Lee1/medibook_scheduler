
import { useNavigate } from "react-router-dom";
import { Calendar, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const NavBar = () => {
  const navigate = useNavigate();

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
            <Button 
              variant="outline"
              className="flex items-center space-x-2"
              onClick={() => navigate("/profile")}
            >
              <User size={18} />
              <span className="hidden md:inline">Sign In</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
