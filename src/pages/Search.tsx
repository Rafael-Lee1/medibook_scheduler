
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import NavBar from "@/components/NavBar";
import { supabase } from "@/integrations/supabase/client";

type ExamType = "blood_test" | "x_ray" | "mri" | "ct_scan" | "ultrasound" | "endoscopy" | "colonoscopy" | "mammogram" | "other";

type ExamResult = {
  exam_id: string;
  exam_name: string;
  exam_type: ExamType;
  exam_description: string;
  exam_price: number;
  laboratory_id: string;
  laboratory_name: string;
  laboratory_address: string;
  laboratory_city: string;
  laboratory_state: string;
};

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<ExamType | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

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

      if (searchTerm) {
        query = query.or([
          `exams.name.ilike.%${searchTerm}%`,
          `exams.description.ilike.%${searchTerm}%`
        ].join(','));
      }

      if (selectedType) {
        query = query.eq("exams.type", selectedType);
      }

      if (selectedCity) {
        query = query.eq("laboratories.city", selectedCity);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map((item: any) => ({
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
      }));
    },
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("laboratories")
        .select("city")
        .order("city");

      if (error) throw error;
      return [...new Set(data.map((item) => item.city))];
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/20">
      <NavBar />
      <main className="container mx-auto px-4 pt-32">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Find Medical Exams</h1>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <SearchIcon className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search exams..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="type">Exam Type</Label>
              <Select
                value={selectedType || undefined}
                onValueChange={(value: ExamType) => setSelectedType(value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blood_test">Blood Test</SelectItem>
                  <SelectItem value="x_ray">X-Ray</SelectItem>
                  <SelectItem value="mri">MRI</SelectItem>
                  <SelectItem value="ct_scan">CT Scan</SelectItem>
                  <SelectItem value="ultrasound">Ultrasound</SelectItem>
                  <SelectItem value="endoscopy">Endoscopy</SelectItem>
                  <SelectItem value="colonoscopy">Colonoscopy</SelectItem>
                  <SelectItem value="mammogram">Mammogram</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Select
                value={selectedCity || undefined}
                onValueChange={setSelectedCity}
              >
                <SelectTrigger id="city">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <p>Loading exams...</p>
          ) : examResults.length === 0 ? (
            <p>No exams found. Try adjusting your search criteria.</p>
          ) : (
            examResults.map((result: ExamResult) => (
              <Card
                key={`${result.exam_id}-${result.laboratory_id}`}
                className="p-4"
              >
                <h3 className="text-xl font-semibold mb-2">
                  {result.exam_name}
                </h3>
                <p className="text-muted-foreground mb-2">
                  {result.exam_description}
                </p>
                <p className="text-primary font-semibold mb-4">
                  ${result.exam_price.toFixed(2)}
                </p>
                <div className="border-t pt-4">
                  <h4 className="font-semibold">{result.laboratory_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {result.laboratory_address}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {result.laboratory_city}, {result.laboratory_state}
                  </p>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={() =>
                    window.location.href = `/schedule?exam=${result.exam_id}&laboratory=${result.laboratory_id}`
                  }
                >
                  Schedule Exam
                </Button>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Search;
