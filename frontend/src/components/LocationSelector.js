import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LocationSelector = ({ value, onChange, required = false }) => {
  const [locations, setLocations] = useState({});
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    // Parse initial value if provided
    if (value && typeof value === 'object') {
      setSelectedCountry(value.country || '');
      setSelectedRegion(value.region || '');
      setSelectedCity(value.city || '');
      setSelectedDistrict(value.district || '');
    }
  }, [value]);

  useEffect(() => {
    // Notify parent of changes
    const locationObj = {
      country: selectedCountry,
      region: selectedRegion,
      city: selectedCity,
      district: selectedDistrict
    };
    onChange(locationObj);
  }, [selectedCountry, selectedRegion, selectedCity, selectedDistrict]);

  const fetchLocations = async () => {
    try {
      const response = await axios.get(`${API}/locations`);
      setLocations(response.data);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
  };

  const countries = Object.keys(locations);
  const regions = selectedCountry ? Object.keys(locations[selectedCountry] || {}) : [];
  const cities = selectedCountry && selectedRegion ? Object.keys(locations[selectedCountry][selectedRegion] || {}) : [];
  const districts = selectedCountry && selectedRegion && selectedCity ? locations[selectedCountry][selectedRegion][selectedCity] || [] : [];

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setSelectedRegion('');
    setSelectedCity('');
    setSelectedDistrict('');
  };

  const handleRegionChange = (region) => {
    setSelectedRegion(region);
    setSelectedCity('');
    setSelectedDistrict('');
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setSelectedDistrict('');
  };

  return (
    <div className="space-y-4" data-testid="location-selector">
      {/* Country */}
      <div>
        <Label className="text-gray-300">Country {required && <span className="text-red-500">*</span>}</Label>
        <Select value={selectedCountry} onValueChange={handleCountryChange}>
          <SelectTrigger className="bg-black/20 border-white/10 text-white mt-2" data-testid="country-select">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-white/10">
            {countries.map((country) => (
              <SelectItem key={country} value={country} className="text-white">
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Region/State */}
      {selectedCountry && regions.length > 0 && (
        <div>
          <Label className="text-gray-300">Region/State</Label>
          <Select value={selectedRegion} onValueChange={handleRegionChange}>
            <SelectTrigger className="bg-black/20 border-white/10 text-white mt-2" data-testid="region-select">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-white/10">
              {regions.map((region) => (
                <SelectItem key={region} value={region} className="text-white">
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* City */}
      {selectedRegion && cities.length > 0 && (
        <div>
          <Label className="text-gray-300">City</Label>
          <Select value={selectedCity} onValueChange={handleCityChange}>
            <SelectTrigger className="bg-black/20 border-white/10 text-white mt-2" data-testid="city-select">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-white/10">
              {cities.map((city) => (
                <SelectItem key={city} value={city} className="text-white">
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* District */}
      {selectedCity && districts.length > 0 && (
        <div>
          <Label className="text-gray-300">District</Label>
          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger className="bg-black/20 border-white/10 text-white mt-2" data-testid="district-select">
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-white/10">
              {districts.map((district) => (
                <SelectItem key={district} value={district} className="text-white">
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Display selected location */}
      {selectedCountry && (
        <div className="text-sm text-gray-400">
          Selected: {selectedCountry}
          {selectedRegion && ` > ${selectedRegion}`}
          {selectedCity && ` > ${selectedCity}`}
          {selectedDistrict && ` > ${selectedDistrict}`}
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
