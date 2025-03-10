
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import NavBar from "@/components/NavBar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import SearchFilters from "@/components/search/SearchFilters";
import ExamResults from "@/components/search/ExamResults";
import type { ExamType } from "@/types/exam";

const Search = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<ExamType | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth", { replace: true });
    }
  }, [user, navigate]);

  const { data: examResults = [], isLoading } = useQuery({
    queryKey: ["exams", searchTerm, selectedType, selectedCity],
    queryFn: async () => {
      let query = supabase
        .from("laboratory_exams")
        .select(`
          id,
          laboratories (
            id,
            name,
            address,
            city,
            state
          ),
          exams (
            id,
            name,
            type,
            description,
            price
          )
        `);

      // Build search conditions for name OR description
      if (searchTerm) {
        query = query.or(`exams.name.ilike.%${searchTerm}%,exams.description.ilike.%${searchTerm}%`);
      }

      // Apply exam type filter
      if (selectedType) {
        query = query.eq('exams.type', selectedType);
      }

      // Apply city filter
      if (selectedCity) {
        query = query.eq('laboratories.city', selectedCity);
      }

      // Add console.log to debug the query
      console.log('Query parameters:', { searchTerm, selectedType, selectedCity });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching exams:", error);
        throw error;
      }

      // Add console.log to see the raw data returned
      console.log('Raw query results:', data);

      const mappedResults = data?.map((item: any) => ({
        exam_id: item.exams.id,
        exam_name: item.exams.name,
        exam_type: item.exams.type,
        exam_description: item.exams.description,
        exam_price: item.exams.price,
        laboratory_id: item.laboratories.id,
        laboratory_name: item.laboratories.name,
        laboratory_address: item.laboratories.address,
        laboratory_city: item.laboratories.city,
        laboratory_state: item.laboratories.state,
      })) ?? [];

      // Add console.log to see the mapped results
      console.log('Mapped results:', mappedResults);

      return mappedResults;
    },
    enabled: !!user,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("laboratories")
        .select("city")
        .order("city");

      if (error) {
        console.error("Error fetching cities:", error);
        throw error;
      }

      return [...new Set(data.map((item) => item.city))].sort();
    },
    enabled: !!user,
  });

  if (!user) {
    return null;
  }

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedType(null);
    setSelectedCity(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/20">
      <NavBar />
      <main className="container mx-auto px-4 pt-32">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{t("search.title")}</h1>
          <SearchFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            cities={cities}
            onReset={handleResetFilters}
          />
        </div>
        <ExamResults 
          isLoading={isLoading} 
          examResults={examResults} 
          hasFilters={!!(searchTerm || selectedType || selectedCity)}
        />
      </main>
    </div>
  );
};

export default Search;
