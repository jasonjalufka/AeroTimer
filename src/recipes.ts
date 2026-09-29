export interface BrewStep {
  readonly type: 'pour' | 'stir' | 'steep' | 'flip' | 'plunge';
  readonly amount?: number;
  readonly duration: number;
}

export interface BrewRecipe {
  readonly id: string;
  readonly name: string;
  readonly method: 'traditional' | 'inverted';
  readonly coffeeVolume: number;
  readonly grindSize: string;
  readonly waterVolume: number;
  /** Water temperature in degrees Fahrenheit. */
  readonly temperature: number;
  readonly steps: readonly [BrewStep, ...BrewStep[]];
}

export const recipes: readonly BrewRecipe[] = [
  {
    "id": "verve",
    "name": "verve",
    "method": "inverted",
    "coffeeVolume": 15,
    "grindSize": "medium fine",
    "waterVolume": 200,
    "temperature": 200,
    "steps": [
      {
        "type": "pour",
        "amount": 200,
        "duration": 10
      },
      {
        "type": "stir",
        "duration": 20
      },
      {
        "type": "steep",
        "duration": 30
      },
      {
        "type": "flip",
        "duration": 5
      },
      {
        "type": "plunge",
        "duration": 30
      }
    ]
  },
  {
    "id": "the-charger",
    "name": "The Charger",
    "method": "traditional",
    "coffeeVolume": 17,
    "grindSize": "medium fine",
    "waterVolume": 250,
    "temperature": 200,
    "steps": [
      {
        "type": "pour",
        "amount": 250,
        "duration": 10
      },
      {
        "type": "stir",
        "duration": 10
      },
      {
        "type": "steep",
        "duration": 70
      },
      {
        "type": "stir",
        "duration": 10
      },
      {
        "type": "plunge",
        "duration": 20
      }
    ]
  },
  {
    "id": "tonx",
    "name": "tonx",
    "method": "inverted",
    "coffeeVolume": 15,
    "grindSize": "coarse",
    "waterVolume": 225,
    "temperature": 200,
    "steps": [
      {
        "type": "pour",
        "amount": 150,
        "duration": 10
      },
      {
        "type": "stir",
        "duration": 10
      },
      {
        "type": "steep",
        "duration": 90
      },
      {
        "type": "pour",
        "amount": 75,
        "duration": 10
      },
      {
        "type": "flip",
        "duration": 5
      },
      {
        "type": "plunge",
        "duration": 25
      }
    ]
  },
  {
    "id": "clive",
    "name": "clive",
    "method": "inverted",
    "coffeeVolume": 30,
    "grindSize": "medium",
    "waterVolume": 135,
    "temperature": 200,
    "steps": [
      {
        "type": "pour",
        "amount": 65,
        "duration": 10
      },
      {
        "type": "stir",
        "duration": 15
      },
      {
        "type": "pour",
        "amount": 70,
        "duration": 10
      },
      {
        "type": "steep",
        "duration": 50
      },
      {
        "type": "flip",
        "duration": 5
      },
      {
        "type": "plunge",
        "duration": 30
      }
    ]
  },
  {
    "id": "seeds",
    "name": "seeds",
    "method": "inverted",
    "coffeeVolume": 18,
    "grindSize": "medium",
    "waterVolume": 225,
    "temperature": 200,
    "steps": [
      {
        "type": "pour",
        "amount": 75,
        "duration": 10
      },
      {
        "type": "stir",
        "duration": 30
      },
      {
        "type": "pour",
        "amount": 150,
        "duration": 30
      },
      {
        "type": "steep",
        "duration": 20
      },
      {
        "type": "plunge",
        "duration": 30
      }
    ]
  }
];

export function findRecipe(id: string | undefined): BrewRecipe | undefined {
  return recipes.find(recipe => recipe.id === id);
}

export function getTotalTime(recipe: BrewRecipe): number {
  return recipe.steps.reduce((total, step) => total + step.duration, 0);
}
