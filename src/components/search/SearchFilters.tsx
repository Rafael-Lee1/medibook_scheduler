
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ExamType } from "@/types/exam";

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedType: ExamType | null;
  setSelectedType: (value: ExamType) => void;
  selectedCity: string | null;
  setSelectedCity: (value: string) => void;
  cities: string[];
}

const SearchFilters = ({
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
  selectedCity,
  setSelectedCity,
  cities,
}: SearchFiltersProps) => {
  return (
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
  );
};

export default SearchFilters;
