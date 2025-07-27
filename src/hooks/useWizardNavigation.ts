import { useState, useCallback } from "react";

export function useWizardNavigation() {
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(1, Math.min(step, 4)));
  }, []);

  const resetWizard = useCallback(() => {
    setCurrentStep(1);
  }, []);

  return {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    resetWizard,
  };
}
