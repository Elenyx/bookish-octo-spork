import { nameGenerator } from './nameGenerator';

class PlanetGenerator {
  private readonly planetTypes = [
    'Terrestrial', 'Gas Giant', 'Ice World', 'Desert World', 'Ocean World',
    'Volcanic', 'Crystalline', 'Metal Rich', 'Toxic', 'Artificial'
  ];

  private readonly atmospheres = [
    'Oxygen-Rich', 'Nitrogen-Heavy', 'Methane', 'Carbon Dioxide', 'Toxic Gas',
    'No Atmosphere', 'Hydrogen', 'Noble Gas Mix', 'Corrosive', 'Unknown Composition'
  ];

  private readonly climates = [
    'Tropical', 'Temperate', 'Arctic', 'Desert', 'Variable',
    'Extreme Heat', 'Extreme Cold', 'Constant Storm', 'Calm', 'Chaotic'
  ];

  generate() {
    const name = nameGenerator.generate('planet');
    const type = this.planetTypes[Math.floor(Math.random() * this.planetTypes.length)];
    const atmosphere = this.atmospheres[Math.floor(Math.random() * this.atmospheres.length)];
    const climate = this.climates[Math.floor(Math.random() * this.climates.length)];
    
    const gravity = Math.round((Math.random() * 2 + 0.3) * 100) / 100; // 0.3 to 2.3 G
    const dayLength = Math.floor(Math.random() * 48) + 12; // 12 to 60 hours
    const temperature = Math.floor(Math.random() * 400) - 100; // -100 to 300°C
    
    const habitability = this.calculateHabitability(type, atmosphere, climate, gravity, temperature);
    const resources = this.generateResources(type);
    const dangers = this.generateDangers(type, climate);
    
    return {
      name,
      type,
      atmosphere,
      climate,
      gravity,
      dayLength,
      temperature,
      habitability,
      resources,
      dangers,
      population: this.generatePopulation(habitability),
      points_of_interest: this.generatePointsOfInterest(),
      exploration_difficulty: Math.floor(Math.random() * 5) + 1
    };
  }

  private calculateHabitability(type: string, atmosphere: string, climate: string, gravity: number, temperature: number): number {
    let score = 50;

    // Type modifiers
    if (type === 'Terrestrial') score += 30;
    else if (type === 'Ocean World') score += 20;
    else if (type === 'Desert World') score += 10;
    else if (type === 'Gas Giant') score -= 40;
    else if (type === 'Toxic') score -= 30;

    // Atmosphere modifiers
    if (atmosphere === 'Oxygen-Rich') score += 25;
    else if (atmosphere === 'Nitrogen-Heavy') score += 15;
    else if (atmosphere === 'No Atmosphere') score -= 30;
    else if (atmosphere === 'Toxic Gas') score -= 25;

    // Climate modifiers
    if (climate === 'Temperate') score += 20;
    else if (climate === 'Tropical') score += 10;
    else if (climate === 'Extreme Heat' || climate === 'Extreme Cold') score -= 20;

    // Gravity modifiers
    if (gravity >= 0.8 && gravity <= 1.2) score += 15;
    else if (gravity < 0.5 || gravity > 2.0) score -= 15;

    // Temperature modifiers
    if (temperature >= 0 && temperature <= 30) score += 15;
    else if (temperature < -50 || temperature > 50) score -= 15;

    return Math.max(0, Math.min(100, score));
  }

  private generateResources(type: string) {
    const commonResources = ['Iron Ore', 'Silicon', 'Carbon', 'Water Ice'];
    const rareResources = ['Nexium Crystal', 'Quantum Matter', 'Rare Metals', 'Energy Crystals'];
    const uniqueResources = ['Ancient Artifacts', 'Alien Technology', 'Exotic Matter', 'Time Crystals'];

    const resources = [];
    
    // Common resources (always present)
    const numCommon = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numCommon; i++) {
      const resource = commonResources[Math.floor(Math.random() * commonResources.length)];
      resources.push({
        name: resource,
        abundance: Math.random(),
        extraction_difficulty: Math.floor(Math.random() * 3) + 1
      });
    }

    // Rare resources (50% chance)
    if (Math.random() > 0.5) {
      const resource = rareResources[Math.floor(Math.random() * rareResources.length)];
      resources.push({
        name: resource,
        abundance: Math.random() * 0.5,
        extraction_difficulty: Math.floor(Math.random() * 3) + 3
      });
    }

    // Unique resources (10% chance)
    if (Math.random() > 0.9) {
      const resource = uniqueResources[Math.floor(Math.random() * uniqueResources.length)];
      resources.push({
        name: resource,
        abundance: Math.random() * 0.2,
        extraction_difficulty: 5
      });
    }

    return resources;
  }

  private generateDangers(type: string, climate: string) {
    const dangers = [];
    
    if (type === 'Volcanic') {
      dangers.push('Volcanic Activity', 'Toxic Gas Vents', 'Extreme Heat');
    }
    
    if (type === 'Toxic') {
      dangers.push('Poisonous Atmosphere', 'Corrosive Environment', 'Radiation');
    }
    
    if (climate === 'Constant Storm') {
      dangers.push('Severe Weather', 'Lightning Storms', 'High Winds');
    }
    
    if (Math.random() > 0.7) {
      const additionalDangers = [
        'Hostile Wildlife', 'Ancient Guardians', 'Unstable Terrain',
        'Magnetic Anomalies', 'Gravitational Disturbances', 'Energy Storms'
      ];
      dangers.push(additionalDangers[Math.floor(Math.random() * additionalDangers.length)]);
    }

    return dangers;
  }

  private generatePopulation(habitability: number) {
    if (habitability < 20) return 'Uninhabited';
    if (habitability < 40) return 'Research Outpost';
    if (habitability < 60) return 'Small Colony';
    if (habitability < 80) return 'Established Settlement';
    return 'Major Population Center';
  }

  private generatePointsOfInterest() {
    const poi = [
      'Ancient Ruins', 'Crashed Starship', 'Natural Wonder', 'Mining Operation',
      'Research Facility', 'Alien Monolith', 'Energy Anomaly', 'Hidden Cave System',
      'Orbital Debris', 'Strange Formation', 'Underground Lake', 'Crystal Caverns'
    ];

    const interests: string[] = [];
    const numPOI = Math.floor(Math.random() * 4);
    
    for (let i = 0; i < numPOI; i++) {
      const interest = poi[Math.floor(Math.random() * poi.length)];
      if (!interests.includes(interest)) {
        interests.push(interest);
      }
    }

    return interests;
  }
}

export const planetGenerator = new PlanetGenerator();
