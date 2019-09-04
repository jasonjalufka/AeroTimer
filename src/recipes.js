const recipeData = {
  verve: {
    name: 'verve',
    method: 'inverted',
    coffeeVolume: 15,
    grindSize: 'medium fine',
    waterVolume: 200,
    temperature: 200,
    totalTime: 95,
    steps: {
      1: {
        type: 'pour',
        amount: 200,
        duration: 10
      },
      2: {
        type: 'stir',
        duration: 20
      },
      3: {
        type: 'steep',
        duration: 30
      },
      4: {
        type: 'flip',
        duration: 5
      },
      5: {
        type: 'plunge',
        duration: 30
      }
    }
  },
  tonx: {
    name: 'tonx',
    method: 'inverted',
    coffeeVolume: 15,
    grindSize: 'coarse',
    waterVolume: 225,
    temperature: 200,
    totalTime: 150,
    steps: {
      1: {
        type: 'pour',
        amount: 150,
        duration: 10
      },
      2: {
        type: 'stir',
        duration: 10
      },
      3: {
        type: 'steep',
        duration: 90
      },
      4: {
        type: 'pour',
        amount: 75,
        duration: 10
      },
      5: {
        type: 'flip',
        duration: 5
      },
      6: {
        type: 'plunge',
        duration: 25
      }
    }
  },
  clive: {
    name: 'clive',
    method: 'inverted',
    coffeeVolume: 30,
    grindSize: 'medium',
    waterVolume: 135,
    temperature: 200,
    totalTime: 122,
    steps: {
      1: {
        type: 'pour',
        amount: 65,
        duration: 10
      },
      2: {
        type: 'stir',
        duration: 15
      },
      3: {
        type: 'pour',
        amount: 70,
        duration: 10
      },
      4: {
        type: 'steep',
        duration: 50
      },
      5: {
        type: 'flip',
        duration: 5
      },
      6: {
        type: 'plunge',
        duration: 30
      }
    }
  },
  seeds: {
    name: 'seeds',
    method: 'inverted',
    coffeeVolume: 18,
    grindSize: 'medium',
    waterVolume: 225,
    temperature: 200,
    totalTime: 120,
    steps: {
      1: {
        type: 'pour',
        amount: 75,
        duration: 10
      },
      2: {
        type: 'stir',
        duration: 30
      },
      3: {
        type: 'pour',
        amount: 150,
        duration: 30
      },
      4: {
        type: 'steep',
        duration: 20
      },
      5: {
        type: 'plunge',
        duration: 30
      }
    }
  }
};

export default recipeData;
