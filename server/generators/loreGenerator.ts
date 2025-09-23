import { nameGenerator } from './nameGenerator';

interface LoreEntry {
  title: string;
  type: 'history' | 'legend' | 'species' | 'technology' | 'location' | 'event';
  content: string;
  era: string;
  significance: 'minor' | 'major' | 'critical' | 'legendary';
  related_entities: string[];
  tags: string[];
}

class LoreGenerator {
  private readonly eras = [
    'The First Expansion', 'Age of Discovery', 'The Great War', 'Time of Silence',
    'The Nexus Awakening', 'Era of Reconstruction', 'The Quantum Renaissance',
    'The Void Incursion', 'The Unity Period', 'The Current Era'
  ];

  private readonly speciesTemplates = [
    'The ancient {species} were known for their mastery of {technology}. They built great {structures} across {location} before mysteriously vanishing during {event}.',
    '{species} are a proud warrior race from the {location} system. Their culture revolves around {concept} and they are feared throughout the galaxy for their {ability}.',
    'The enigmatic {species} exist primarily as {form} beings. They communicate through {method} and possess an innate understanding of {science}.'
  ];

  private readonly technologyTemplates = [
    'The {technology} was first developed by the {species} during {era}. This revolutionary advancement allowed for {capability} and changed the course of galactic civilization.',
    '{technology} remains one of the most mysterious inventions ever created. Found in ancient {location} ruins, it operates on principles that modern science still cannot fully explain.',
    'The discovery of {technology} led to the {event}, fundamentally altering how species interact with {concept}.'
  ];

  private readonly eventTemplates = [
    'The {event} occurred during {era} when {species} attempted to {action}. The consequences of this event are still felt today as {result}.',
    'Few remember the true cause of {event}. Some say it was triggered by {cause}, while others believe {alternative_cause}. What is certain is that {outcome}.',
    '{event} marked the beginning of {era}. The {species} archives describe it as {description}, though many details have been lost to time.'
  ];

  private readonly concepts = [
    'honor', 'knowledge', 'power', 'harmony', 'survival', 'transcendence',
    'unity', 'freedom', 'order', 'chaos', 'balance', 'evolution'
  ];

  private readonly technologies = [
    'Quantum Tunneling', 'Neural Interface Technology', 'Dimensional Manipulation',
    'Time Dilation Fields', 'Consciousness Transfer', 'Matter Conversion',
    'Gravity Wells', 'Plasma Forging', 'Bioengineering', 'AI Synthesis'
  ];

  private readonly abilities = [
    'telepathic communication', 'energy manipulation', 'phase shifting',
    'precognitive abilities', 'molecular control', 'reality warping',
    'dimensional sight', 'time perception', 'quantum entanglement'
  ];

  generate(type?: string): LoreEntry {
    const loreType = type as LoreEntry['type'] || this.getRandomType();
    
    switch (loreType) {
      case 'species':
        return this.generateSpeciesLore();
      case 'technology':
        return this.generateTechnologyLore();
      case 'history':
        return this.generateHistoryLore();
      case 'legend':
        return this.generateLegendLore();
      case 'location':
        return this.generateLocationLore();
      case 'event':
        return this.generateEventLore();
      default:
        return this.generateRandomLore();
    }
  }

  private getRandomType(): LoreEntry['type'] {
    const types: LoreEntry['type'][] = ['history', 'legend', 'species', 'technology', 'location', 'event'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private generateSpeciesLore(): LoreEntry {
    const species = nameGenerator.generate('alien');
    const technology = this.technologies[Math.floor(Math.random() * this.technologies.length)];
    const location = nameGenerator.generate('planet');
    const ability = this.abilities[Math.floor(Math.random() * this.abilities.length)];
    const concept = this.concepts[Math.floor(Math.random() * this.concepts.length)];
    const era = this.eras[Math.floor(Math.random() * this.eras.length)];

    const template = this.speciesTemplates[Math.floor(Math.random() * this.speciesTemplates.length)];
    const content = template
      .replace(/{species}/g, species)
      .replace(/{technology}/g, technology)
      .replace(/{location}/g, location)
      .replace(/{ability}/g, ability)
      .replace(/{concept}/g, concept)
      .replace(/{era}/g, era);

    return {
      title: `The ${species}`,
      type: 'species',
      content,
      era,
      significance: this.getRandomSignificance(),
      related_entities: [species, location, technology],
      tags: ['alien species', 'civilization', concept]
    };
  }

  private generateTechnologyLore(): LoreEntry {
    const technology = this.technologies[Math.floor(Math.random() * this.technologies.length)];
    const species = nameGenerator.generate('alien');
    const location = nameGenerator.generate('planet');
    const era = this.eras[Math.floor(Math.random() * this.eras.length)];
    const concept = this.concepts[Math.floor(Math.random() * this.concepts.length)];

    const template = this.technologyTemplates[Math.floor(Math.random() * this.technologyTemplates.length)];
    const content = template
      .replace(/{technology}/g, technology)
      .replace(/{species}/g, species)
      .replace(/{location}/g, location)
      .replace(/{era}/g, era)
      .replace(/{concept}/g, concept);

    return {
      title: technology,
      type: 'technology',
      content,
      era,
      significance: this.getRandomSignificance(),
      related_entities: [technology, species, location],
      tags: ['technology', 'innovation', 'science']
    };
  }

  private generateHistoryLore(): LoreEntry {
    const era = this.eras[Math.floor(Math.random() * this.eras.length)];
    const species1 = nameGenerator.generate('alien');
    const species2 = nameGenerator.generate('alien');
    const location = nameGenerator.generate('planet');
    const event = `The ${nameGenerator.generate('station')} Incident`;

    const historicalEvents = [
      `During ${era}, the ${species1} and ${species2} formed an unprecedented alliance that would shape galactic politics for millennia. This union was forged in the aftermath of the devastating conflict at ${location}, where both species nearly faced extinction.`,
      `${era} marked the golden age of exploration, with ${species1} vessels reaching the farthest corners of known space. The discovery of ${location} during this period led to revolutionary advances in quantum physics and interdimensional travel.`,
      `The fall of the ${species1} Empire during ${era} was swift and unexpected. Historical records suggest that their overreliance on ${this.technologies[0]} technology may have been their downfall, though the exact cause remains disputed among scholars.`
    ];

    const content = historicalEvents[Math.floor(Math.random() * historicalEvents.length)];

    return {
      title: `Chronicles of ${era}`,
      type: 'history',
      content,
      era,
      significance: 'major',
      related_entities: [species1, species2, location],
      tags: ['historical', 'galactic events', 'civilization']
    };
  }

  private generateLegendLore(): LoreEntry {
    const hero = nameGenerator.generate('character');
    const artifact = `${nameGenerator.generate('ship')} Crystal`;
    const location = nameGenerator.generate('planet');
    const ability = this.abilities[Math.floor(Math.random() * this.abilities.length)];

    const legends = [
      `Legend speaks of ${hero}, the mythical warrior who wielded the ${artifact} to defend ${location} from an unspeakable cosmic horror. It is said that ${hero} possessed the rare gift of ${ability}, allowing them to perceive threats across multiple dimensions.`,
      `The tale of ${hero} and the Lost Expedition to ${location} has been told across countless worlds. According to legend, ${hero} discovered the secret of ${ability} within the ancient vaults beneath ${location}'s surface, but at a terrible cost.`,
      `Few believe the stories of ${hero}, the dimension-walker who supposedly used the ${artifact} to seal away an entity of pure chaos. The legend claims that ${hero} still wanders the galaxy, watching for signs of the entity's return.`
    ];

    const content = legends[Math.floor(Math.random() * legends.length)];

    return {
      title: `The Legend of ${hero}`,
      type: 'legend',
      content,
      era: 'Time of Silence', // Legends are often from mysterious eras
      significance: 'legendary',
      related_entities: [hero, artifact, location],
      tags: ['mythology', 'heroes', 'artifacts', 'legends']
    };
  }

  private generateLocationLore(): LoreEntry {
    const location = nameGenerator.generate('planet');
    const species = nameGenerator.generate('alien');
    const phenomenon = `${this.technologies[0]} Storms`;

    const locationTypes = [
      `${location} is a world of perpetual twilight, where the ${phenomenon} create spectacular auroras that can be seen from orbit. The ${species} who once inhabited this world built their cities to harness the energy from these phenomena, creating architectural marvels that still function centuries after their disappearance.`,
      `The space station known as ${location} serves as a neutral meeting ground for diplomats from across the galaxy. Its unique position at the intersection of three major hyperspace routes makes it invaluable, while its ancient ${species} construction techniques ensure it remains impregnable to attack.`,
      `${location} appears to exist in a state of temporal flux, with different regions of the planet experiencing time at varying rates. Scientists theorize that the ${species} conducted temporal experiments here, leaving behind a legacy of chronological anomalies that continue to puzzle researchers.`
    ];

    const content = locationTypes[Math.floor(Math.random() * locationTypes.length)];

    return {
      title: location,
      type: 'location',
      content,
      era: 'The Current Era',
      significance: this.getRandomSignificance(),
      related_entities: [location, species],
      tags: ['locations', 'worlds', 'phenomena', 'mysteries']
    };
  }

  private generateEventLore(): LoreEntry {
    const event = `The ${nameGenerator.generate('station')} Convergence`;
    const species = nameGenerator.generate('alien');
    const era = this.eras[Math.floor(Math.random() * this.eras.length)];
    const technology = this.technologies[Math.floor(Math.random() * this.technologies.length)];

    const template = this.eventTemplates[Math.floor(Math.random() * this.eventTemplates.length)];
    const content = template
      .replace(/{event}/g, event)
      .replace(/{era}/g, era)
      .replace(/{species}/g, species)
      .replace(/{action}/g, `harness the power of ${technology}`)
      .replace(/{result}/g, 'fundamental changes to the fabric of space-time')
      .replace(/{cause}/g, 'experimental quantum technology')
      .replace(/{alternative_cause}/g, 'intervention by unknown entities')
      .replace(/{outcome}/g, 'the emergence of new forms of space travel')
      .replace(/{description}/g, 'a turning point in galactic history');

    return {
      title: event,
      type: 'event',
      content,
      era,
      significance: 'critical',
      related_entities: [event, species, technology],
      tags: ['major events', 'galactic history', 'consequences']
    };
  }

  private generateRandomLore(): LoreEntry {
    return this.generate(this.getRandomType());
  }

  private getRandomSignificance(): LoreEntry['significance'] {
    const significances: LoreEntry['significance'][] = ['minor', 'major', 'critical', 'legendary'];
    const weights = [0.4, 0.3, 0.2, 0.1]; // More common entries are less significant
    
    const random = Math.random();
    let total = 0;
    for (let i = 0; i < weights.length; i++) {
      total += weights[i];
      if (random <= total) {
        return significances[i];
      }
    }
    return 'minor';
  }

  generateCodex(entries: number = 10): LoreEntry[] {
    const codex: LoreEntry[] = [];
    const types: LoreEntry['type'][] = ['history', 'legend', 'species', 'technology', 'location', 'event'];
    
    for (let i = 0; i < entries; i++) {
      const type = types[i % types.length];
      codex.push(this.generate(type));
    }
    
    return codex.sort((a, b) => {
      const significanceOrder = { 'legendary': 0, 'critical': 1, 'major': 2, 'minor': 3 };
      return significanceOrder[a.significance] - significanceOrder[b.significance];
    });
  }

  generateQuestLore(questType: string, location: string): LoreEntry {
    const questLore = {
      title: `Mission Briefing: ${questType}`,
      type: 'history' as const,
      content: `Intelligence reports indicate unusual activity in the ${location} sector. This mission requires careful analysis of local conditions and historical context to ensure success.`,
      era: 'The Current Era',
      significance: 'minor' as const,
      related_entities: [location, questType],
      tags: ['mission', 'current events', 'briefing']
    };

    return questLore;
  }
}

export const loreGenerator = new LoreGenerator();
