
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
import { useLanguage } from "@/context/LanguageContext";

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
  const { t } = useLanguage();
  
  const examTypes: { value: "all_types" | ExamType; label: string }[] = [
    { value: "all_types", label: t("examType.all_types") },
    { value: "blood_test", label: t("examType.blood_test") },
    { value: "x_ray", label: t("examType.x_ray") },
    { value: "mri", label: t("examType.mri") },
    { value: "ct_scan", label: t("examType.ct_scan") },
    { value: "ultrasound", label: t("examType.ultrasound") },
    { value: "endoscopy", label: t("examType.endoscopy") },
    { value: "colonoscopy", label: t("examType.colonoscopy") },
    { value: "mammogram", label: t("examType.mammogram") },
    { value: "other", label: t("examType.other") },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[2fr,1fr,1fr,auto]">
        <div>
          <Label htmlFor="search">{t("search.label")}</Label>
          <div className="relative">
            <SearchIcon className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder={t("search.placeholder")}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="type">{t("search.examType")}</Label>
          <Select
            value={selectedType || "all_types"}
            onValueChange={(value) => {
              setSelectedType(value === "all_types" ? null : value as ExamType);
            }}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder={t("search.allTypes")} />
            </SelectTrigger>
            <SelectContent>
              {examTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="city">{t("search.city")}</Label>
          <Select
            value={selectedCity || "all_cities"}
            onValueChange={(value) => setSelectedCity(value === "all_cities" ? null : value)}
          >
            <SelectTrigger id="city">
              <SelectValue placeholder={t("search.allCities")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_cities">{t("search.allCities")}</SelectItem>
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
