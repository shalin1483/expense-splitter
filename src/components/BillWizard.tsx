import { useState, useEffect } from 'react';
import { usePeople, useItems } from '@/stores/billStore';
import { PeopleStep, canProceedFromPeople } from '@/components/PeopleStep';
import { ItemsStep, canProceedFromItems } from '@/components/ItemsStep';

type WizardStep = 'people' | 'items';

const STEPS: readonly WizardStep[] = ['people', 'items'] as const;

const stepLabels: Record<WizardStep, string> = {
  people: 'People',
  items: 'Items',
};

export function BillWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('people');
  const people = usePeople();
  const items = useItems();

  // Compute validation gates
  const canProceed: Record<WizardStep, boolean> = {
    people: canProceedFromPeople(people),
    items: canProceedFromItems(items),
  };

  // Auto-advance on mount if people step already completed
  useEffect(() => {
    if (currentStep === 'people' && people.length >= 2) {
      setCurrentStep('items');
    }
  }, []);

  const handleNext = () => {
    if (!canProceed[currentStep]) return;

    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const currentIndex = STEPS.indexOf(currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === STEPS.length - 1;

  return (
    <div>
      <div className="wizard-progress">
        Step {currentIndex + 1} of {STEPS.length}: {stepLabels[currentStep]}
      </div>

      <div>
        {currentStep === 'people' && <PeopleStep />}
        {currentStep === 'items' && <ItemsStep />}
      </div>

      <div className="wizard-nav">
        <button onClick={handleBack} disabled={isFirstStep}>
          Back
        </button>
        <button onClick={handleNext} disabled={!canProceed[currentStep] || isLastStep}>
          Next
        </button>
      </div>
    </div>
  );
}
