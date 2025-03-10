
import { useNavigate } from "react-router-dom";
import { Calendar, LogOut, Search, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { useQuery } from "@tanstack/react-query";

const NavBar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Fetch user profile data to get the avatar URL
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url, full_name")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

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
                <span>{t("nav.findExams")}</span>
              </Button>
              <Button 
                variant="ghost"
                className="flex items-center space-x-2"
                onClick={() => navigate("/schedule")}
              >
                <Calendar size={18} />
                <span>{t("nav.schedule")}</span>
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
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
                    {profile?.avatar_url ? (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={profile.avatar_url} alt={profile?.full_name || "User"} />
                        <AvatarFallback>
                          {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <User size={18} />
                    )}
                    <span className="hidden md:inline">{t("nav.account")}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    {t("nav.profile")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/my-exams")}>
                    <Clock className="mr-2 h-4 w-4" />
                    {t("nav.myExams")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("nav.signOut")}
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
                <span className="hidden md:inline">{t("nav.signIn")}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
