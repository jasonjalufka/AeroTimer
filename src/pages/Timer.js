import React, { useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Section, theme } from '../styles';
import { Redirect } from 'react-router-dom';

const TimerContainer = styled.section`
  margin: 0;
  height: 100vh;
  max-height: 100vh;
  width: 100%;
  background-color: ${theme.colors.black};
`;

const TotalTimeSection = styled(Section)`
  display: flex;
  justify-content: flex-end;
  height: 10vh;
  padding: 10px;
  font-size: 1.953em;
  font-weight: 700;
  color: ${theme.colors.lightGray};
`;

const StepSection = styled(Section)`
  padding: 80px 0 0 0;
  display: flex;
  flex-direction: column;
  height: 50vh;
  align-items: center;
  justify-content: center;
`;

const StepTime = styled.h1`
  font-size: 8em;
  margin: 0;
  color: ${theme.colors.darkYellow};
  font-weight: 700;
`;

const StepDirections = styled.h2`
  display: flex;
  flex-direction: column;
  margin-top: 0;
  align-items: center;
  color: ${theme.colors.white};
  font-weight: 700;
  text-transform: uppercase;
`;

const StepAmount = styled.p`
  text-align: center;
  font-weight: 100;
  font-size: 0.6em;
  text-transform: lowercase;
`;

const RemainingStepsSection = styled(Section)`
  margin: 0px 30px;
  font-size: 1.4em;
  font-weight: 700;
  text-transform: uppercase;
`;

const RemainingStepsList = styled.ul``;

const RemainingStepsListItem = styled.li`
  color: ${theme.colors.lightGray};
  letter-spacing: 1px;
`;

const Timer = props => {
  let { totalTime, steps } = props.selectedRecipe;

  const [remainingTime, setRemainingTime] = useState(totalTime);
  const [currentStepTime, setCurrentStepTime] = useState(steps[1].duration);
  const [currentStep, setCurrentStep] = useState(1);
  const [isTimerDone, setIsTimerDone] = useState(false);

  const getStepsLength = useCallback(() => {
    return Object.keys(steps).length;
  }, [steps]);

  const getRemainingSteps = () => {
    let stepsArr = [];
    for (let i = currentStep + 1; i <= getStepsLength(); i++) {
      stepsArr.push(steps[i].type);
    }
    return stepsArr;
  };

  useEffect(() => {
    let interval = null;
    // clear interval when remainingTime reaches zero
    if (!remainingTime) {
      setIsTimerDone(true);
      return () => clearInterval(interval);
    }

    interval = setInterval(() => {
      setRemainingTime(remainingTime => remainingTime - 1);
      if (currentStepTime === 1 && currentStep !== getStepsLength()) {
        setCurrentStep(currentStep + 1);
        setCurrentStepTime(steps[currentStep + 1].duration);
      } else {
        setCurrentStepTime(currentStepTime => currentStepTime - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime, currentStep, getStepsLength, steps, currentStepTime]);

  return isTimerDone ? (
    <Redirect to='/' />
  ) : (
    // <TimerContainer>
    //   <StepSection>
    //     <IconLogo />
    //     <StepDirections style={{ marginTop: '20px' }}>All Done!</StepDirections>
    //   </StepSection>
    // </TimerContainer>
    <TimerContainer>
      <TotalTimeSection>{remainingTime}</TotalTimeSection>
      <StepSection>
        <StepTime>{currentStepTime}</StepTime>
        <StepDirections>
          {steps[currentStep].type}
          {steps[currentStep].amount && (
            <StepAmount>{steps[currentStep].amount} grams</StepAmount>
          )}
        </StepDirections>
      </StepSection>
      <RemainingStepsSection>
        <RemainingStepsList>
          {getRemainingSteps().map((step, i) => (
            <RemainingStepsListItem key={i}>{step}</RemainingStepsListItem>
          ))}
        </RemainingStepsList>
      </RemainingStepsSection>
    </TimerContainer>
  );
};

export default Timer;
