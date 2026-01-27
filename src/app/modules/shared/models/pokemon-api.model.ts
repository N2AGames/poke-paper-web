export interface PokemonSprites {
  front_default: string;
  front_shiny: string;
  front_female?: string;
  front_shiny_female?: string;
  back_default: string;
  back_shiny: string;
  back_female?: string;
  back_shiny_female?: string;
  other?: {
    dream_world?: {
      front_default: string;
      front_female?: string;
    };
    home?: {
      front_default: string;
      front_female?: string;
      front_shiny: string;
      front_shiny_female?: string;
    };
    'official-artwork'?: {
      front_default: string;
      front_shiny: string;
    };
  };
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonAbility {
  is_hidden: boolean;
  slot: number;
  ability: {
    name: string;
    url: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonMove {
  move: {
    name: string;
    url: string;
  };
  version_group_details: Array<{
    level_learned_at: number;
    move_learn_method: {
      name: string;
      url: string;
    };
    version_group: {
      name: string;
      url: string;
    };
  }>;
}

export interface PokemonSpecies {
  name: string;
  url: string;
}

export interface PokemonGameIndex {
  game_index: number;
  version: {
    name: string;
    url: string;
  };
}

export interface PokemonApiResponse {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  weight: number;
  is_default: boolean;
  order: number;
  abilities: PokemonAbility[];
  forms: Array<{
    name: string;
    url: string;
  }>;
  game_indices: PokemonGameIndex[];
  held_items: Array<any>;
  location_area_encounters: string;
  moves: PokemonMove[];
  species: PokemonSpecies;
  sprites: PokemonSprites;
  stats: PokemonStat[];
  types: PokemonType[];
  cries: {
    latest: string;
    legacy: string;
  };
}
