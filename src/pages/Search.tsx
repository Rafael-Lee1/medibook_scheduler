
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import NavBar from "@/components/NavBar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import SearchFilters from "@/components/search/SearchFilters";
import ExamResults from "@/components/search/ExamResults";
import type { ExamType } from "@/types/exam";

const Search = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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

      // Apply search filter for name and description
      if (searchTerm) {
        query = query.filter('exams.name', 'ilike', `%${searchTerm}%`);
      }

      // Apply exam type filter
      if (selectedType) {
        query = query.filter('exams.type', 'eq', selectedType);
      }

      // Apply city filter
      if (selectedCity) {
        query = query.filter('laboratories.city', 'eq', selectedCity);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching exams:", error);
        throw error;
      }

      return data?.map((item: any) => ({
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

      // Remove duplicates and sort alphabetically
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
          <h1 className="text-3xl font-bold mb-4">Find Medical Exams</h1>
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
