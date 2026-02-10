import { useState, useEffect } from 'react';
import { usePeople, useItems, useAssignments } from '@/stores/billStore';
import { PeopleStep, canProceedFromPeople } from '@/components/PeopleStep';
import { ItemsStep, canProceedFromItems } from '@/components/ItemsStep';
import { AssignmentStep, canProceedFromAssignment } from '@/components/AssignmentStep';
import { TaxTipStep } from '@/components/TaxTipStep';
import { ResultsStep } from '@/components/ResultsStep';

type WizardStep = 'people' | 'items' | 'assignment' | 'taxtip' | 'results';

const STEPS: readonly WizardStep[] = ['people', 'items', 'assignment', 'taxtip', 'results'] as const;

const stepLabels: Record<WizardStep, string> = {
  people: 'People',
  items: 'Items',
  assignment: 'Assign Items',
  taxtip: 'Tax & Tip',
  results: 'Results',
};

export function BillWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('people');
  const people = usePeople();
  const items = useItems();
  const assignments = useAssignments();

  // Compute validation gates
  const canProceed: Record<WizardStep, boolean> = {
    people: canProceedFromPeople(people),
    items: canProceedFromItems(items),
    assignment: canProceedFromAssignment(items, assignments),
    taxtip: true, // Tax/tip always has valid defaults: null tax + 18% tip
    results: true, // Results is always valid (final display step)
  };

  // Auto-advance on mount to furthest incomplete step
  useEffect(() => {
    // Check if at least one item is assigned
    const hasAssignments = items.some(item => {
      const assignment = assignments[item.id];
      return assignment && assignment.personIds.length > 0;
    });

    // Auto-advance to furthest valid step
    // Note: we don't auto-advance to results, user must click "See Results"
    if (people.length >= 2 && items.length >= 1 && hasAssignments) {
      setCurrentStep('taxtip');
    } else if (people.length >= 2 && items.length >= 1) {
      setCurrentStep('assignment');
    } else if (people.length >= 2) {
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
        {currentStep === 'assignment' && <AssignmentStep />}
        {currentStep === 'taxtip' && <TaxTipStep />}
        {currentStep === 'results' && <ResultsStep />}
      </div>

      <div className="wizard-nav">
        <button onClick={handleBack} disabled={isFirstStep}>
          Back
        </button>
        {!isLastStep && (
          <button onClick={handleNext} disabled={!canProceed[currentStep]}>
            {currentStep === 'taxtip' ? 'See Results' : 'Next'}
          </button>
        )}
      </div>
    </div>
  );
}
