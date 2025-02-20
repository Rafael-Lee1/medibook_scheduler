
import { Search as SearchIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ExamType } from "@/types/exam";

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedType: ExamType | null;
  setSelectedType: (value: ExamType | null) => void;
  selectedCity: string | null;
  setSelectedCity: (value: string | null) => void;
  cities: string[];
  onReset: () => void;
}

const SearchFilters = ({
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
  selectedCity,
  setSelectedCity,
  cities,
  onReset,
}: SearchFiltersProps) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[2fr,1fr,1fr,auto]">
        <div>
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <SearchIcon className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search exams by name..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="type">Exam Type</Label>
          <Select
            value={selectedType || "all_types"}
            onValueChange={(value) => {
              setSelectedType(value === "all_types" ? null : value as ExamType);
            }}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_types">All Types</SelectItem>
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
            value={selectedCity || "all_cities"}
            onValueChange={(value) => setSelectedCity(value === "all_cities" ? null : value)}
          >
            <SelectTrigger id="city">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_cities">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button
            variant="outline"
            size="icon"
            onClick={onReset}
            className="h-10 w-10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
