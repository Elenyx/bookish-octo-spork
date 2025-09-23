class NameGenerator {
  private readonly spacePrefixes = [
    'Astro', 'Cosmic', 'Galactic', 'Nebula', 'Stellar', 'Void', 'Quantum', 'Nova',
    'Plasma', 'Ion', 'Hyper', 'Nano', 'Mega', 'Ultra', 'Cyber', 'Neo'
  ];

  private readonly spaceSuffixes = [
    'Prime', 'Core', 'Matrix', 'Nexus', 'Forge', 'Gate', 'Haven', 'Station',
    'Base', 'Outpost', 'Colony', 'Expanse', 'Sector', 'System', 'Cluster'
  ];

  private readonly shipNames = [
    'Dagger', 'Falcon', 'Thunder', 'Lightning', 'Phoenix', 'Eagle', 'Hawk', 'Raven',
    'Viper', 'Cobra', 'Serpent', 'Dragon', 'Wolf', 'Lion', 'Tiger', 'Shark',
    'Storm', 'Tempest', 'Hurricane', 'Typhoon', 'Cyclone', 'Blizzard'
  ];

  private readonly alienNames = [
    'Zyx', 'Keth', 'Varn', 'Thex', 'Quin', 'Raze', 'Blyx', 'Nox',
    'Zara', 'Xel', 'Vex', 'Trix', 'Syn', 'Ryx', 'Pex', 'Nyx'
  ];

  private readonly planetTypes = [
    'Terra', 'Aqua', 'Ignis', 'Glacies', 'Ventus', 'Lux', 'Umbra', 'Crysta',
    'Magna', 'Silva', 'Desert', 'Ocean', 'Arctic', 'Volcanic', 'Gas'
  ];

  generate(type: string): string {
    switch (type.toLowerCase()) {
      case 'ship':
        return this.generateShipName();
      case 'planet':
        return this.generatePlanetName();
      case 'alien':
      case 'character':
        return this.generateAlienName();
      case 'station':
      case 'base':
        return this.generateStationName();
      case 'sector':
        return this.generateSectorName();
      default:
        return this.generateGenericName();
    }
  }

  private generateShipName(): string {
    const prefix = this.spacePrefixes[Math.floor(Math.random() * this.spacePrefixes.length)];
    const name = this.shipNames[Math.floor(Math.random() * this.shipNames.length)];
    return `${prefix} ${name}`;
  }

  private generatePlanetName(): string {
    const type = this.planetTypes[Math.floor(Math.random() * this.planetTypes.length)];
    const number = Math.floor(Math.random() * 9999) + 1;
    const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
                   String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return `${type}-${letters}-${number}`;
  }

  private generateAlienName(): string {
    const first = this.alienNames[Math.floor(Math.random() * this.alienNames.length)];
    const second = this.alienNames[Math.floor(Math.random() * this.alienNames.length)];
    const suffix = ['ar', 'on', 'ix', 'ul', 'en', 'ak'][Math.floor(Math.random() * 6)];
    return `${first}${second}${suffix}`;
  }

  private generateStationName(): string {
    const prefix = this.spacePrefixes[Math.floor(Math.random() * this.spacePrefixes.length)];
    const suffix = this.spaceSuffixes[Math.floor(Math.random() * this.spaceSuffixes.length)];
    const number = Math.floor(Math.random() * 99) + 1;
    return `${prefix} ${suffix} ${number}`;
  }

  private generateSectorName(): string {
    const prefix = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'][Math.floor(Math.random() * 8)];
    const suffix = ['Centauri', 'Proxima', 'Vega', 'Sirius', 'Rigel', 'Arcturus'][Math.floor(Math.random() * 6)];
    const number = Math.floor(Math.random() * 999) + 1;
    return `${prefix}-${suffix}-${number}`;
  }

  private generateGenericName(): string {
    const prefix = this.spacePrefixes[Math.floor(Math.random() * this.spacePrefixes.length)];
    const suffix = this.spaceSuffixes[Math.floor(Math.random() * this.spaceSuffixes.length)];
    return `${prefix} ${suffix}`;
  }

  generateCallsign(): string {
    const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
                   String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const numbers = Math.floor(Math.random() * 999) + 1;
    return `${letters}-${numbers}`;
  }

  generateCrewName(): string {
    const firstNames = [
      'Commander', 'Captain', 'Admiral', 'Colonel', 'Major', 'Pilot', 'Navigator',
      'Engineer', 'Medic', 'Gunner', 'Scout', 'Operative'
    ];
    const lastName = this.generate('alien');
    const rank = firstNames[Math.floor(Math.random() * firstNames.length)];
    return `${rank} ${lastName}`;
  }
}

export const nameGenerator = new NameGenerator();
