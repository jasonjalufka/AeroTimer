import React from 'react';
import styled from 'styled-components';
import { theme, Section } from '../styles';
import { Link } from 'react-router-dom';

const IngredientSection = styled(Section)`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-height: 50vh;
`;

const RecipeTitle = styled.h1`
  margin: 0px;
  text-transform: capitalize;
`;

const IngredientContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 120px);
  grid-template-rows: 120px 30px 120px 30px;
`;

const IngredientTile = styled.div`
  background-color: ${theme.colors.blue};
  color: white;
  border-radius: 5px;
  margin: 10px 10px;
`;

const TileDescription = styled.div`
  font-size: 16px;
  font-weight: 200;
  color: ${theme.colors.black};
  width: 100%;
  text-align: center;
  background: transparent;
`;

const IngredientTileText = styled.h5`
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
  font-weight: 500;
  color: ${theme.colors.white};
  background: transparent;
  margin: 0;
  text-align: center;
`;

const StepsSection = styled(Section)`
  padding-top: 0;
`;

const StepsTitle = styled.h3`
  margin-left: 15px;
  margin-bottom: 5px;
  margin-top: 0px;
`;

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 20px;
`;

const StepsList = styled.ul``;

const StepsListItem = styled.li`
  margin: 5px 0px;
  padding: 10px 20px;
  color: ${theme.colors.white};
  border-radius: ${theme.borderRadius};
  background-color: ${theme.colors.darkGray};
`;

const BrewButton = styled.button`
  font-family: 'Rubik';
  font-weight: 700;
  color: ${theme.colors.white};
  font-size: 1.953em;
  background-color: ${theme.colors.green};
  border-radius: 10px;
  margin: 20px auto 0 auto;
  padding: 10px 20px;
  width: 100%;
`;

const Recipe = props => {
  let {
    name,
    method,
    coffeeVolume,
    grindSize,
    waterVolume,
    temperature,
    totalTime,
    steps
  } = props.location.state.data;
  console.log('STEPS', steps);
  return (
    <div>
      <IngredientSection>
        <RecipeTitle>{name}</RecipeTitle>
        <IngredientContainer>
          <IngredientTile description='Brew Method'>
            <IngredientTileText>{method}</IngredientTileText>
          </IngredientTile>
          <IngredientTile description='Coffee Volume'>
            <IngredientTileText>{coffeeVolume}g</IngredientTileText>
          </IngredientTile>
          <IngredientTile description='Grind Size'>
            <IngredientTileText>{grindSize}</IngredientTileText>
          </IngredientTile>
          <TileDescription>Brew Method</TileDescription>
          <TileDescription>Coffee Volume</TileDescription>
          <TileDescription>Grind Size</TileDescription>
          <IngredientTile description='Water Volume'>
            <IngredientTileText>{waterVolume}g</IngredientTileText>
          </IngredientTile>
          <IngredientTile description='Temperature'>
            <IngredientTileText>{temperature}º</IngredientTileText>
          </IngredientTile>
          <IngredientTile description='Total Time'>
            <IngredientTileText>{totalTime}s</IngredientTileText>
          </IngredientTile>
          <TileDescription>Water Volume</TileDescription>
          <TileDescription>Temperature</TileDescription>
          <TileDescription>Total Time</TileDescription>
        </IngredientContainer>
      </IngredientSection>

      <StepsSection>
        <StepsTitle>Steps</StepsTitle>
        <StepsContainer>
          <StepsList>
            {Object.keys(steps).map((step, i) => (
              <StepsListItem key={i}>
                {steps[step].type}
                {steps[step].amount ? `/ ${steps[step].amount}` : ''} -{' '}
                {steps[step].duration}
              </StepsListItem>
            ))}
          </StepsList>
          <Link
            to={{
              pathname: '/timer/',
              state: {
                data: props.location.state.data
              }
            }}
          >
            <BrewButton>Let's Brew!</BrewButton>
          </Link>
        </StepsContainer>
      </StepsSection>
    </div>
  );
};

export default Recipe;
