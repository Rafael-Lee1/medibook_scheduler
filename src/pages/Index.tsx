
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NavBar from "@/components/NavBar";
import { useNavigate } from "react-router-dom";

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
            Book Your Medical Imaging
            <br />
            <span className="text-primary">Appointment Today</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Fast and easy scheduling for all your medical imaging needs.
            Find the nearest facility and book your appointment in minutes.
          </p>
          
          <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2">
            <Input
              type="text"
              placeholder="Search for exams or labs..."
              className="h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" size="lg" className="h-12">
              <Search className="mr-2" />
              Search
            </Button>
          </form>
        </section>

        {/* Featured Exams */}
        <section className="py-20">
          <h2 className="text-3xl font-semibold text-center mb-12">
            Available Diagnostic Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ExamCard
              title="MRI Scan"
              description="High-resolution magnetic resonance imaging for detailed internal body examination."
              icon={Search}
            />
            <ExamCard
              title="CT Scan"
              description="Advanced computed tomography scanning for cross-sectional body imaging."
              icon={Search}
            />
            <ExamCard
              title="X-Ray"
              description="Quick and efficient diagnostic imaging for bones and chest examinations."
              icon={Search}
            />
          </div>
          <div className="text-center mt-12">
            <Button size="lg" onClick={() => navigate("/search")}>
              View All Services
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
