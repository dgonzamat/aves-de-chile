import React from 'react';
import { Globe2 } from 'lucide-react';
import { COUNTRIES } from '../constants';

interface CountryFilterProps {
  selectedCountry: number;
  onCountryChange: (countryId: number) => void;
}

export function CountryFilter({ selectedCountry, onCountryChange }: CountryFilterProps) {
  return (
    <div className="flex items-center space-x-2">
      <Globe2 className="w-5 h-5 text-gray-500" />
      <select
        value={selectedCountry}
        onChange={(e) => onCountryChange(Number(e.target.value))}
        className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {COUNTRIES.map(country => (
          <option key={country.id} value={country.id}>
            {country.name}
          </option>
        ))}
      </select>
    </div>
  );
}