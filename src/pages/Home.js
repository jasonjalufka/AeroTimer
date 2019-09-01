import React from 'react';
import { Link } from 'react-router-dom';
import recipeData from '../recipes';
import styled from 'styled-components';
import { Section, theme } from '../styles';
import { IconLogo } from '../components/icons';

const HeroSection = styled(Section)`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-height: 40vh;
`;

const Title = styled.h1`
  font-weight: 700;
  margin-bottom: 10px;
`;

const RecipeSection = styled(Section)``;

const RecipeTitle = styled.h2`
  padding-left: 20px;
  margin-bottom: 0;
`;

const RecipeList = styled.ul`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const RecipeListItem = styled.li`
  margin: 5px 20px;
  padding: 20px 30px;
  border-radius: ${theme.borderRadius};
  font-size: 28px;
  font-weight: 300;
  text-transform: capitalize;
  box-shadow: 0 2px 10px 0 rgba(167, 167, 167, 0.5);
  background-color: ${theme.colors.blue};
  color: ${theme.colors.white};
`;

const Home = props => {
  return (
    <div>
      <HeroSection>
        <Title>AeroTimer</Title>
        <IconLogo />
      </HeroSection>
      <RecipeSection>
        <RecipeTitle>Recipes</RecipeTitle>
        <RecipeList>
          {Object.keys(recipeData).map((recipe, i) => {
            return (
              <RecipeListItem key={i} method={recipeData[recipe].method}>
                <Link
                  style={{ color: 'white' }}
                  onClick={() => props.setRecipe(props.allRecipes[recipe].name)}
                  to='/recipe/'
                >
                  {recipeData[recipe].name}
                </Link>
              </RecipeListItem>
            );
          })}
        </RecipeList>
      </RecipeSection>
    </div>
  );
};

export default Home;
