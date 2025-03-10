
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NavBar from "@/components/NavBar";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

const ExamCard = ({ title, description, icon: Icon }: { title: string; description: string; icon: any }) => (
  <div className="glass-panel rounded-2xl p-6 fade-up">
    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/20">
      <NavBar />
      
      <main className="container mx-auto px-4 pt-24">
        {/* Hero Section */}
        <section className="text-center py-20 md:py-32 fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t("home.title")}
            <br />
            <span className="text-primary">{t("home.subtitle")}</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("home.description")}
          </p>
          
          <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2">
            <Input
              type="text"
              placeholder={t("home.searchPlaceholder")}
              className="h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" size="lg" className="h-12">
              <Search className="mr-2" />
              {t("home.search")}
            </Button>
          </form>
        </section>

        {/* Featured Exams */}
        <section className="py-20">
          <h2 className="text-3xl font-semibold text-center mb-12">
            {t("home.services")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ExamCard
              title={t("exam.mri.title")}
              description={t("exam.mri.description")}
              icon={Search}
            />
            <ExamCard
              title={t("exam.ct.title")}
              description={t("exam.ct.description")}
              icon={Search}
            />
            <ExamCard
              title={t("exam.xray.title")}
              description={t("exam.xray.description")}
              icon={Search}
            />
          </div>
          <div className="text-center mt-12">
            <Button size="lg" onClick={() => navigate("/search")}>
              {t("home.viewAll")}
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
