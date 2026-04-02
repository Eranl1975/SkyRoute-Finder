export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

export const AIRPORTS: Airport[] = [
  // Israel
  { iata: 'TLV', name: 'Ben Gurion', city: 'Tel Aviv', country: 'Israel' },
  { iata: 'VDA', name: 'Ramon', city: 'Eilat/Arava', country: 'Israel' },
  { iata: 'ETH', name: 'Eilat', city: 'Eilat', country: 'Israel' },
  { iata: 'HFA', name: 'Haifa', city: 'Haifa', country: 'Israel' },

  // United Kingdom
  { iata: 'LHR', name: 'Heathrow', city: 'London', country: 'United Kingdom' },
  { iata: 'LGW', name: 'Gatwick', city: 'London', country: 'United Kingdom' },
  { iata: 'STN', name: 'Stansted', city: 'London', country: 'United Kingdom' },
  { iata: 'LTN', name: 'Luton', city: 'London', country: 'United Kingdom' },
  { iata: 'MAN', name: 'Manchester', city: 'Manchester', country: 'United Kingdom' },
  { iata: 'EDI', name: 'Edinburgh', city: 'Edinburgh', country: 'United Kingdom' },
  { iata: 'BHX', name: 'Birmingham', city: 'Birmingham', country: 'United Kingdom' },
  { iata: 'GLA', name: 'Glasgow', city: 'Glasgow', country: 'United Kingdom' },
  { iata: 'BRS', name: 'Bristol', city: 'Bristol', country: 'United Kingdom' },
  { iata: 'NCL', name: 'Newcastle', city: 'Newcastle', country: 'United Kingdom' },

  // France
  { iata: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France' },
  { iata: 'ORY', name: 'Orly', city: 'Paris', country: 'France' },
  { iata: 'NCE', name: 'Côte d\'Azur', city: 'Nice', country: 'France' },
  { iata: 'LYS', name: 'Saint-Exupéry', city: 'Lyon', country: 'France' },
  { iata: 'MRS', name: 'Provence', city: 'Marseille', country: 'France' },
  { iata: 'TLS', name: 'Blagnac', city: 'Toulouse', country: 'France' },
  { iata: 'BOD', name: 'Mérignac', city: 'Bordeaux', country: 'France' },
  { iata: 'NTE', name: 'Atlantique', city: 'Nantes', country: 'France' },

  // Germany
  { iata: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Germany' },
  { iata: 'MUC', name: 'Munich', city: 'Munich', country: 'Germany' },
  { iata: 'BER', name: 'Brandenburg', city: 'Berlin', country: 'Germany' },
  { iata: 'HAM', name: 'Hamburg', city: 'Hamburg', country: 'Germany' },
  { iata: 'DUS', name: 'Düsseldorf', city: 'Düsseldorf', country: 'Germany' },
  { iata: 'CGN', name: 'Cologne Bonn', city: 'Cologne', country: 'Germany' },
  { iata: 'STR', name: 'Stuttgart', city: 'Stuttgart', country: 'Germany' },
  { iata: 'NUE', name: 'Nuremberg', city: 'Nuremberg', country: 'Germany' },

  // Italy
  { iata: 'FCO', name: 'Fiumicino', city: 'Rome', country: 'Italy' },
  { iata: 'CIA', name: 'Ciampino', city: 'Rome', country: 'Italy' },
  { iata: 'MXP', name: 'Malpensa', city: 'Milan', country: 'Italy' },
  { iata: 'LIN', name: 'Linate', city: 'Milan', country: 'Italy' },
  { iata: 'BGY', name: 'Bergamo', city: 'Milan', country: 'Italy' },
  { iata: 'VCE', name: 'Marco Polo', city: 'Venice', country: 'Italy' },
  { iata: 'NAP', name: 'Capodichino', city: 'Naples', country: 'Italy' },
  { iata: 'BLQ', name: 'Marconi', city: 'Bologna', country: 'Italy' },
  { iata: 'FLR', name: 'Peretola', city: 'Florence', country: 'Italy' },
  { iata: 'PSA', name: 'Galileo Galilei', city: 'Pisa', country: 'Italy' },
  { iata: 'CTA', name: 'Fontanarossa', city: 'Catania', country: 'Italy' },
  { iata: 'PMO', name: 'Falcone Borsellino', city: 'Palermo', country: 'Italy' },
  { iata: 'BRI', name: 'Karol Wojtyła', city: 'Bari', country: 'Italy' },

  // Spain
  { iata: 'MAD', name: 'Barajas', city: 'Madrid', country: 'Spain' },
  { iata: 'BCN', name: 'El Prat', city: 'Barcelona', country: 'Spain' },
  { iata: 'AGP', name: 'Costa del Sol', city: 'Málaga', country: 'Spain' },
  { iata: 'ALC', name: 'Alicante-Elche', city: 'Alicante', country: 'Spain' },
  { iata: 'PMI', name: 'Son Sant Joan', city: 'Palma de Mallorca', country: 'Spain' },
  { iata: 'IBZ', name: 'Ibiza', city: 'Ibiza', country: 'Spain' },
  { iata: 'VLC', name: 'Manises', city: 'Valencia', country: 'Spain' },
  { iata: 'SVQ', name: 'San Pablo', city: 'Seville', country: 'Spain' },
  { iata: 'BIO', name: 'Loiu', city: 'Bilbao', country: 'Spain' },
  { iata: 'LPA', name: 'Gran Canaria', city: 'Las Palmas', country: 'Spain' },
  { iata: 'TFS', name: 'Tenerife South', city: 'Tenerife', country: 'Spain' },
  { iata: 'ACE', name: 'Lanzarote', city: 'Lanzarote', country: 'Spain' },
  { iata: 'FUE', name: 'Fuerteventura', city: 'Fuerteventura', country: 'Spain' },

  // Netherlands
  { iata: 'AMS', name: 'Schiphol', city: 'Amsterdam', country: 'Netherlands' },
  { iata: 'EIN', name: 'Eindhoven', city: 'Eindhoven', country: 'Netherlands' },
  { iata: 'RTM', name: 'Rotterdam', city: 'Rotterdam', country: 'Netherlands' },

  // Belgium
  { iata: 'BRU', name: 'Brussels', city: 'Brussels', country: 'Belgium' },
  { iata: 'CRL', name: 'Charleroi', city: 'Charleroi', country: 'Belgium' },

  // Switzerland
  { iata: 'ZRH', name: 'Zurich', city: 'Zurich', country: 'Switzerland' },
  { iata: 'GVA', name: 'Cointrin', city: 'Geneva', country: 'Switzerland' },
  { iata: 'BSL', name: 'EuroAirport', city: 'Basel', country: 'Switzerland' },

  // Austria
  { iata: 'VIE', name: 'Vienna', city: 'Vienna', country: 'Austria' },
  { iata: 'SZG', name: 'Salzburg', city: 'Salzburg', country: 'Austria' },
  { iata: 'INN', name: 'Innsbruck', city: 'Innsbruck', country: 'Austria' },

  // Portugal
  { iata: 'LIS', name: 'Humberto Delgado', city: 'Lisbon', country: 'Portugal' },
  { iata: 'OPO', name: 'Sá Carneiro', city: 'Porto', country: 'Portugal' },
  { iata: 'FAO', name: 'Faro', city: 'Faro', country: 'Portugal' },
  { iata: 'FNC', name: 'Madeira', city: 'Funchal', country: 'Portugal' },

  // Scandinavia
  { iata: 'CPH', name: 'Kastrup', city: 'Copenhagen', country: 'Denmark' },
  { iata: 'OSL', name: 'Gardermoen', city: 'Oslo', country: 'Norway' },
  { iata: 'ARN', name: 'Arlanda', city: 'Stockholm', country: 'Sweden' },
  { iata: 'GOT', name: 'Landvetter', city: 'Gothenburg', country: 'Sweden' },
  { iata: 'HEL', name: 'Helsinki-Vantaa', city: 'Helsinki', country: 'Finland' },
  { iata: 'KEF', name: 'Keflavik', city: 'Reykjavik', country: 'Iceland' },

  // Eastern Europe
  { iata: 'WAW', name: 'Chopin', city: 'Warsaw', country: 'Poland' },
  { iata: 'KRK', name: 'Kraków', city: 'Kraków', country: 'Poland' },
  { iata: 'PRG', name: 'Václav Havel', city: 'Prague', country: 'Czech Republic' },
  { iata: 'BUD', name: 'Liszt Ferenc', city: 'Budapest', country: 'Hungary' },
  { iata: 'OTP', name: 'Henri Coandă', city: 'Bucharest', country: 'Romania' },
  { iata: 'SOF', name: 'Sofia', city: 'Sofia', country: 'Bulgaria' },
  { iata: 'BEG', name: 'Nikola Tesla', city: 'Belgrade', country: 'Serbia' },
  { iata: 'ZAG', name: 'Zagreb', city: 'Zagreb', country: 'Croatia' },
  { iata: 'LJU', name: 'Jože Pučnik', city: 'Ljubljana', country: 'Slovenia' },
  { iata: 'RIX', name: 'Riga', city: 'Riga', country: 'Latvia' },
  { iata: 'TLL', name: 'Tallinn', city: 'Tallinn', country: 'Estonia' },
  { iata: 'VNO', name: 'Vilnius', city: 'Vilnius', country: 'Lithuania' },

  // Greece
  { iata: 'ATH', name: 'Eleftherios Venizelos', city: 'Athens', country: 'Greece' },
  { iata: 'SKG', name: 'Makedonia', city: 'Thessaloniki', country: 'Greece' },
  { iata: 'HER', name: 'Heraklion', city: 'Heraklion', country: 'Greece' },
  { iata: 'CFU', name: 'Ioannis Kapodistrias', city: 'Corfu', country: 'Greece' },
  { iata: 'RHO', name: 'Diagoras', city: 'Rhodes', country: 'Greece' },
  { iata: 'JMK', name: 'Mykonos', city: 'Mykonos', country: 'Greece' },
  { iata: 'JTR', name: 'Santorini', city: 'Santorini', country: 'Greece' },
  { iata: 'CHQ', name: 'Daskalogiannis', city: 'Chania', country: 'Greece' },
  { iata: 'ZTH', name: 'Zakynthos', city: 'Zakynthos', country: 'Greece' },

  // Turkey
  { iata: 'IST', name: 'Istanbul', city: 'Istanbul', country: 'Turkey' },
  { iata: 'SAW', name: 'Sabiha Gökçen', city: 'Istanbul', country: 'Turkey' },
  { iata: 'ADB', name: 'Adnan Menderes', city: 'Izmir', country: 'Turkey' },
  { iata: 'AYT', name: 'Antalya', city: 'Antalya', country: 'Turkey' },
  { iata: 'DLM', name: 'Dalaman', city: 'Dalaman', country: 'Turkey' },
  { iata: 'BJV', name: 'Milas-Bodrum', city: 'Bodrum', country: 'Turkey' },
  { iata: 'ESB', name: 'Esenboğa', city: 'Ankara', country: 'Turkey' },

  // Middle East
  { iata: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
  { iata: 'AUH', name: 'Zayed International', city: 'Abu Dhabi', country: 'UAE' },
  { iata: 'SHJ', name: 'Sharjah', city: 'Sharjah', country: 'UAE' },
  { iata: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar' },
  { iata: 'KWI', name: 'Kuwait International', city: 'Kuwait City', country: 'Kuwait' },
  { iata: 'BAH', name: 'Bahrain International', city: 'Manama', country: 'Bahrain' },
  { iata: 'RUH', name: 'King Khalid', city: 'Riyadh', country: 'Saudi Arabia' },
  { iata: 'JED', name: 'King Abdulaziz', city: 'Jeddah', country: 'Saudi Arabia' },
  { iata: 'AMM', name: 'Queen Alia', city: 'Amman', country: 'Jordan' },
  { iata: 'BEY', name: 'Rafic Hariri', city: 'Beirut', country: 'Lebanon' },
  { iata: 'TBS', name: 'Shota Rustaveli', city: 'Tbilisi', country: 'Georgia' },
  { iata: 'EVN', name: 'Zvartnots', city: 'Yerevan', country: 'Armenia' },
  { iata: 'GYD', name: 'Heydar Aliyev', city: 'Baku', country: 'Azerbaijan' },

  // Egypt / North Africa
  { iata: 'CAI', name: 'Cairo International', city: 'Cairo', country: 'Egypt' },
  { iata: 'HRG', name: 'Hurghada', city: 'Hurghada', country: 'Egypt' },
  { iata: 'SSH', name: 'Sharm El Sheikh', city: 'Sharm el-Sheikh', country: 'Egypt' },
  { iata: 'LXR', name: 'Luxor', city: 'Luxor', country: 'Egypt' },
  { iata: 'CMN', name: 'Mohammed V', city: 'Casablanca', country: 'Morocco' },
  { iata: 'RAK', name: 'Marrakesh Menara', city: 'Marrakesh', country: 'Morocco' },
  { iata: 'TUN', name: 'Tunis-Carthage', city: 'Tunis', country: 'Tunisia' },
  { iata: 'ALG', name: 'Houari Boumediene', city: 'Algiers', country: 'Algeria' },

  // Sub-Saharan Africa
  { iata: 'JNB', name: 'O.R. Tambo', city: 'Johannesburg', country: 'South Africa' },
  { iata: 'CPT', name: 'Cape Town', city: 'Cape Town', country: 'South Africa' },
  { iata: 'NBO', name: 'Jomo Kenyatta', city: 'Nairobi', country: 'Kenya' },
  { iata: 'ADD', name: 'Bole', city: 'Addis Ababa', country: 'Ethiopia' },
  { iata: 'LOS', name: 'Murtala Muhammed', city: 'Lagos', country: 'Nigeria' },
  { iata: 'ACC', name: 'Kotoka', city: 'Accra', country: 'Ghana' },

  // Russia / CIS
  { iata: 'SVO', name: 'Sheremetyevo', city: 'Moscow', country: 'Russia' },
  { iata: 'DME', name: 'Domodedovo', city: 'Moscow', country: 'Russia' },
  { iata: 'LED', name: 'Pulkovo', city: 'St. Petersburg', country: 'Russia' },
  { iata: 'KBP', name: 'Boryspil', city: 'Kyiv', country: 'Ukraine' },
  { iata: 'MSQ', name: 'Minsk National', city: 'Minsk', country: 'Belarus' },
  { iata: 'ALA', name: 'Almaty', city: 'Almaty', country: 'Kazakhstan' },
  { iata: 'TAS', name: 'Islam Karimov', city: 'Tashkent', country: 'Uzbekistan' },

  // USA — Northeast
  { iata: 'JFK', name: 'John F. Kennedy', city: 'New York', country: 'USA' },
  { iata: 'LGA', name: 'LaGuardia', city: 'New York', country: 'USA' },
  { iata: 'EWR', name: 'Newark Liberty', city: 'New York', country: 'USA' },
  { iata: 'BOS', name: 'Logan', city: 'Boston', country: 'USA' },
  { iata: 'PHL', name: 'Philadelphia', city: 'Philadelphia', country: 'USA' },
  { iata: 'DCA', name: 'Reagan National', city: 'Washington DC', country: 'USA' },
  { iata: 'IAD', name: 'Dulles', city: 'Washington DC', country: 'USA' },
  { iata: 'BWI', name: 'Baltimore', city: 'Baltimore', country: 'USA' },

  // USA — Southeast
  { iata: 'ATL', name: 'Hartsfield-Jackson', city: 'Atlanta', country: 'USA' },
  { iata: 'MIA', name: 'Miami', city: 'Miami', country: 'USA' },
  { iata: 'FLL', name: 'Fort Lauderdale', city: 'Fort Lauderdale', country: 'USA' },
  { iata: 'MCO', name: 'Orlando', city: 'Orlando', country: 'USA' },
  { iata: 'TPA', name: 'Tampa', city: 'Tampa', country: 'USA' },
  { iata: 'CLT', name: 'Charlotte Douglas', city: 'Charlotte', country: 'USA' },
  { iata: 'RDU', name: 'Raleigh-Durham', city: 'Raleigh', country: 'USA' },
  { iata: 'MSY', name: 'Louis Armstrong', city: 'New Orleans', country: 'USA' },
  { iata: 'BNA', name: 'Nashville', city: 'Nashville', country: 'USA' },

  // USA — Midwest
  { iata: 'ORD', name: 'O\'Hare', city: 'Chicago', country: 'USA' },
  { iata: 'MDW', name: 'Midway', city: 'Chicago', country: 'USA' },
  { iata: 'DTW', name: 'Detroit Metropolitan', city: 'Detroit', country: 'USA' },
  { iata: 'MSP', name: 'Minneapolis-Saint Paul', city: 'Minneapolis', country: 'USA' },
  { iata: 'STL', name: 'St. Louis Lambert', city: 'St. Louis', country: 'USA' },
  { iata: 'MCI', name: 'Kansas City', city: 'Kansas City', country: 'USA' },

  // USA — South/Southwest
  { iata: 'DFW', name: 'Dallas/Fort Worth', city: 'Dallas', country: 'USA' },
  { iata: 'DAL', name: 'Love Field', city: 'Dallas', country: 'USA' },
  { iata: 'IAH', name: 'George Bush', city: 'Houston', country: 'USA' },
  { iata: 'HOU', name: 'Hobby', city: 'Houston', country: 'USA' },
  { iata: 'PHX', name: 'Sky Harbor', city: 'Phoenix', country: 'USA' },
  { iata: 'DEN', name: 'Denver', city: 'Denver', country: 'USA' },
  { iata: 'LAS', name: 'Harry Reid', city: 'Las Vegas', country: 'USA' },
  { iata: 'AUS', name: 'Austin-Bergstrom', city: 'Austin', country: 'USA' },
  { iata: 'SAT', name: 'San Antonio', city: 'San Antonio', country: 'USA' },

  // USA — West Coast
  { iata: 'LAX', name: 'Los Angeles', city: 'Los Angeles', country: 'USA' },
  { iata: 'SFO', name: 'San Francisco', city: 'San Francisco', country: 'USA' },
  { iata: 'OAK', name: 'Oakland', city: 'Oakland', country: 'USA' },
  { iata: 'SJC', name: 'San Jose', city: 'San Jose', country: 'USA' },
  { iata: 'SEA', name: 'Seattle-Tacoma', city: 'Seattle', country: 'USA' },
  { iata: 'PDX', name: 'Portland', city: 'Portland', country: 'USA' },
  { iata: 'SAN', name: 'San Diego', city: 'San Diego', country: 'USA' },
  { iata: 'HNL', name: 'Daniel K. Inouye', city: 'Honolulu', country: 'USA' },

  // Canada
  { iata: 'YYZ', name: 'Pearson', city: 'Toronto', country: 'Canada' },
  { iata: 'YVR', name: 'Vancouver', city: 'Vancouver', country: 'Canada' },
  { iata: 'YUL', name: 'Trudeau', city: 'Montreal', country: 'Canada' },
  { iata: 'YYC', name: 'Calgary', city: 'Calgary', country: 'Canada' },
  { iata: 'YEG', name: 'Edmonton', city: 'Edmonton', country: 'Canada' },
  { iata: 'YOW', name: 'Ottawa', city: 'Ottawa', country: 'Canada' },

  // Mexico & Caribbean
  { iata: 'MEX', name: 'Benito Juárez', city: 'Mexico City', country: 'Mexico' },
  { iata: 'CUN', name: 'Cancún', city: 'Cancún', country: 'Mexico' },
  { iata: 'GDL', name: 'Don Miguel Hidalgo', city: 'Guadalajara', country: 'Mexico' },
  { iata: 'MTY', name: 'Mariano Escobedo', city: 'Monterrey', country: 'Mexico' },
  { iata: 'PUJ', name: 'Punta Cana', city: 'Punta Cana', country: 'Dominican Republic' },
  { iata: 'HAV', name: 'José Martí', city: 'Havana', country: 'Cuba' },
  { iata: 'SJU', name: 'Luis Muñoz Marín', city: 'San Juan', country: 'Puerto Rico' },
  { iata: 'MBJ', name: 'Sangster', city: 'Montego Bay', country: 'Jamaica' },
  { iata: 'PTY', name: 'Tocumen', city: 'Panama City', country: 'Panama' },
  { iata: 'BOG', name: 'El Dorado', city: 'Bogotá', country: 'Colombia' },

  // South America
  { iata: 'GRU', name: 'Guarulhos', city: 'São Paulo', country: 'Brazil' },
  { iata: 'GIG', name: 'Galeão', city: 'Rio de Janeiro', country: 'Brazil' },
  { iata: 'BSB', name: 'Presidente Juscelino', city: 'Brasília', country: 'Brazil' },
  { iata: 'FOR', name: 'Pinto Martins', city: 'Fortaleza', country: 'Brazil' },
  { iata: 'EZE', name: 'Ministro Pistarini', city: 'Buenos Aires', country: 'Argentina' },
  { iata: 'SCL', name: 'Arturo Merino Benítez', city: 'Santiago', country: 'Chile' },
  { iata: 'LIM', name: 'Jorge Chávez', city: 'Lima', country: 'Peru' },
  { iata: 'UIO', name: 'Mariscal Sucre', city: 'Quito', country: 'Ecuador' },
  { iata: 'MVD', name: 'Carrasco', city: 'Montevideo', country: 'Uruguay' },

  // India
  { iata: 'BOM', name: 'Chhatrapati Shivaji Maharaj', city: 'Mumbai', country: 'India' },
  { iata: 'DEL', name: 'Indira Gandhi', city: 'New Delhi', country: 'India' },
  { iata: 'BLR', name: 'Kempegowda', city: 'Bengaluru', country: 'India' },
  { iata: 'MAA', name: 'Chennai', city: 'Chennai', country: 'India' },
  { iata: 'HYD', name: 'Rajiv Gandhi', city: 'Hyderabad', country: 'India' },
  { iata: 'CCU', name: 'Netaji Subhas Chandra Bose', city: 'Kolkata', country: 'India' },
  { iata: 'COK', name: 'Cochin', city: 'Kochi', country: 'India' },
  { iata: 'AMD', name: 'Sardar Vallabhbhai Patel', city: 'Ahmedabad', country: 'India' },

  // East Asia
  { iata: 'PEK', name: 'Capital', city: 'Beijing', country: 'China' },
  { iata: 'PKX', name: 'Daxing', city: 'Beijing', country: 'China' },
  { iata: 'PVG', name: 'Pudong', city: 'Shanghai', country: 'China' },
  { iata: 'SHA', name: 'Hongqiao', city: 'Shanghai', country: 'China' },
  { iata: 'CAN', name: 'Baiyun', city: 'Guangzhou', country: 'China' },
  { iata: 'SZX', name: 'Bao\'an', city: 'Shenzhen', country: 'China' },
  { iata: 'CTU', name: 'Tianfu', city: 'Chengdu', country: 'China' },
  { iata: 'HKG', name: 'Hong Kong', city: 'Hong Kong', country: 'Hong Kong' },
  { iata: 'NRT', name: 'Narita', city: 'Tokyo', country: 'Japan' },
  { iata: 'HND', name: 'Haneda', city: 'Tokyo', country: 'Japan' },
  { iata: 'KIX', name: 'Kansai', city: 'Osaka', country: 'Japan' },
  { iata: 'NGO', name: 'Chubu', city: 'Nagoya', country: 'Japan' },
  { iata: 'CTS', name: 'New Chitose', city: 'Sapporo', country: 'Japan' },
  { iata: 'OKA', name: 'Naha', city: 'Okinawa', country: 'Japan' },
  { iata: 'ICN', name: 'Incheon', city: 'Seoul', country: 'South Korea' },
  { iata: 'GMP', name: 'Gimpo', city: 'Seoul', country: 'South Korea' },
  { iata: 'CJU', name: 'Jeju', city: 'Jeju', country: 'South Korea' },
  { iata: 'TPE', name: 'Taoyuan', city: 'Taipei', country: 'Taiwan' },

  // Southeast Asia
  { iata: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', country: 'Thailand' },
  { iata: 'DMK', name: 'Don Mueang', city: 'Bangkok', country: 'Thailand' },
  { iata: 'HKT', name: 'Phuket', city: 'Phuket', country: 'Thailand' },
  { iata: 'CNX', name: 'Chiang Mai', city: 'Chiang Mai', country: 'Thailand' },
  { iata: 'SIN', name: 'Changi', city: 'Singapore', country: 'Singapore' },
  { iata: 'KUL', name: 'KLIA', city: 'Kuala Lumpur', country: 'Malaysia' },
  { iata: 'MNL', name: 'Ninoy Aquino', city: 'Manila', country: 'Philippines' },
  { iata: 'CGK', name: 'Soekarno-Hatta', city: 'Jakarta', country: 'Indonesia' },
  { iata: 'DPS', name: 'Ngurah Rai', city: 'Bali', country: 'Indonesia' },
  { iata: 'SGN', name: 'Tan Son Nhat', city: 'Ho Chi Minh City', country: 'Vietnam' },
  { iata: 'HAN', name: 'Noi Bai', city: 'Hanoi', country: 'Vietnam' },
  { iata: 'RGN', name: 'Yangon', city: 'Yangon', country: 'Myanmar' },
  { iata: 'REP', name: 'Siem Reap', city: 'Siem Reap', country: 'Cambodia' },

  // South Asia
  { iata: 'KTM', name: 'Tribhuvan', city: 'Kathmandu', country: 'Nepal' },
  { iata: 'DAC', name: 'Hazrat Shahjalal', city: 'Dhaka', country: 'Bangladesh' },
  { iata: 'CMB', name: 'Bandaranaike', city: 'Colombo', country: 'Sri Lanka' },
  { iata: 'MLE', name: 'Velana', city: 'Malé', country: 'Maldives' },

  // Australia & Pacific
  { iata: 'SYD', name: 'Kingsford Smith', city: 'Sydney', country: 'Australia' },
  { iata: 'MEL', name: 'Melbourne', city: 'Melbourne', country: 'Australia' },
  { iata: 'BNE', name: 'Brisbane', city: 'Brisbane', country: 'Australia' },
  { iata: 'PER', name: 'Perth', city: 'Perth', country: 'Australia' },
  { iata: 'ADL', name: 'Adelaide', city: 'Adelaide', country: 'Australia' },
  { iata: 'CNS', name: 'Cairns', city: 'Cairns', country: 'Australia' },
  { iata: 'AKL', name: 'Auckland', city: 'Auckland', country: 'New Zealand' },
  { iata: 'CHC', name: 'Christchurch', city: 'Christchurch', country: 'New Zealand' },
  { iata: 'WLG', name: 'Wellington', city: 'Wellington', country: 'New Zealand' },
  { iata: 'NAN', name: 'Nadi', city: 'Nadi', country: 'Fiji' },
];
