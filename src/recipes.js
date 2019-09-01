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
  abby: {
    name: 'abby',
    method: 'inverted',
    coffeeVolume: 18,
    grindSize: 'medium',
    waterVolume: 220,
    temperature: 200,
    totalTime: 90,
    steps: {
      1: {
        type: 'pour',
        amount: 220,
        duration: 10
      },
      2: {
        type: 'stir',
        duration: 20
      },
      3: {
        type: 'steep',
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
  }
};

export default recipeData;
