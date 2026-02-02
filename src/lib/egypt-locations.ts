// Egypt locations data for branch management

export interface District {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
  districts: District[];
}

export const EGYPT_CITIES: City[] = [
  {
    id: 'cairo',
    name: 'Cairo',
    districts: [
      { id: 'cairo-downtown', name: 'Downtown' },
      { id: 'cairo-maadi', name: 'Maadi' },
      { id: 'cairo-nasr-city', name: 'Nasr City' },
      { id: 'cairo-heliopolis', name: 'Heliopolis' },
      { id: 'cairo-zamalek', name: 'Zamalek' },
      { id: 'cairo-mohandessin', name: 'Mohandessin' },
      { id: 'cairo-dokki', name: 'Dokki' },
      { id: 'cairo-new-cairo', name: 'New Cairo' },
      { id: 'cairo-shubra', name: 'Shubra' },
      { id: 'cairo-el-rehab', name: 'El Rehab' },
    ],
  },
  {
    id: 'giza',
    name: 'Giza',
    districts: [
      { id: 'giza-6october', name: '6th of October' },
      { id: 'giza-sheikh-zayed', name: 'Sheikh Zayed' },
      { id: 'giza-haram', name: 'Haram' },
      { id: 'giza-faisal', name: 'Faisal' },
      { id: 'giza-smart-village', name: 'Smart Village' },
    ],
  },
  {
    id: 'alexandria',
    name: 'Alexandria',
    districts: [
      { id: 'alex-sidi-gaber', name: 'Sidi Gaber' },
      { id: 'alex-smouha', name: 'Smouha' },
      { id: 'alex-stanley', name: 'Stanley' },
      { id: 'alex-miami', name: 'Miami' },
      { id: 'alex-el-montazah', name: 'El Montazah' },
      { id: 'alex-downtown', name: 'Downtown Alexandria' },
    ],
  },
  {
    id: 'mansoura',
    name: 'Mansoura',
    districts: [
      { id: 'mansoura-center', name: 'City Center' },
      { id: 'mansoura-toreel', name: 'Toreel' },
      { id: 'mansoura-gedida', name: 'Mansoura Gedida' },
    ],
  },
  {
    id: 'tanta',
    name: 'Tanta',
    districts: [
      { id: 'tanta-center', name: 'City Center' },
      { id: 'tanta-industrial', name: 'Industrial Zone' },
    ],
  },
  {
    id: 'aswan',
    name: 'Aswan',
    districts: [
      { id: 'aswan-center', name: 'City Center' },
      { id: 'aswan-corniche', name: 'Corniche' },
    ],
  },
  {
    id: 'luxor',
    name: 'Luxor',
    districts: [
      { id: 'luxor-east-bank', name: 'East Bank' },
      { id: 'luxor-west-bank', name: 'West Bank' },
    ],
  },
  {
    id: 'sharm-el-sheikh',
    name: 'Sharm El Sheikh',
    districts: [
      { id: 'sharm-naama-bay', name: 'Naama Bay' },
      { id: 'sharm-old-market', name: 'Old Market' },
      { id: 'sharm-hadaba', name: 'Hadaba' },
    ],
  },
  {
    id: 'hurghada',
    name: 'Hurghada',
    districts: [
      { id: 'hurghada-downtown', name: 'Downtown' },
      { id: 'hurghada-sahl-hasheesh', name: 'Sahl Hasheesh' },
      { id: 'hurghada-el-gouna', name: 'El Gouna' },
    ],
  },
  {
    id: 'port-said',
    name: 'Port Said',
    districts: [
      { id: 'port-said-center', name: 'City Center' },
      { id: 'port-said-east', name: 'East Port Said' },
    ],
  },
];

export function getCityById(cityId: string): City | undefined {
  return EGYPT_CITIES.find(c => c.id === cityId);
}

export function getCityByName(cityName: string): City | undefined {
  return EGYPT_CITIES.find(c => c.name.toLowerCase() === cityName.toLowerCase());
}

export function getDistrictsByCity(cityId: string): District[] {
  const city = getCityById(cityId);
  return city?.districts || [];
}
