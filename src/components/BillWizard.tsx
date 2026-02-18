import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { usePeople, useItems, useAssignments } from '@/stores/billStore';
import { PeopleStep, canProceedFromPeople } from '@/components/PeopleStep';
import { ItemsStep, canProceedFromItems } from '@/components/ItemsStep';
import { AssignmentStep, canProceedFromAssignment } from '@/components/AssignmentStep';
import { TaxTipStep } from '@/components/TaxTipStep';
import { ResultsStep } from '@/components/ResultsStep';
import { Progress } from '@/components/ui/progress';

type WizardStep = 'people' | 'items' | 'assignment' | 'taxtip' | 'results';

const STEPS: readonly WizardStep[] = ['people', 'items', 'assignment', 'taxtip', 'results'] as const;

const stepLabels: Record<WizardStep, string> = {
  people: 'People',
  items: 'Items',
  assignment: 'Assign Items',
  taxtip: 'Tax & Tip',
  results: 'Results',
};

// Slide variants: custom(dir) = direction (1=forward, -1=back)
const stepVariants = {
  enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -40, opacity: 0 }),
};

export function BillWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('people');
  const [direction, setDirection] = useState(1); // 1=forward, -1=backward
  const people = usePeople();
  const items = useItems();
  const assignments = useAssignments();

  // Compute validation gates
  const canProceed: Record<WizardStep, boolean> = {
    people: canProceedFromPeople(people),
    items: canProceedFromItems(items),
    assignment: canProceedFromAssignment(items, assignments),
    taxtip: true,
    results: true,
  };

  // Auto-advance on mount to furthest incomplete step
  useEffect(() => {
    const hasAssignments = items.some(item => {
      const assignment = assignments[item.id];
      return assignment && assignment.personIds.length > 0;
    });

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
      setDirection(1);
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const currentIndex = STEPS.indexOf(currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === STEPS.length - 1;
  const progressValue = ((currentIndex + 1) / STEPS.length) * 100;

  return (
    <div>
      {/* Progress bar replacing text step indicator */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Step {currentIndex + 1} of {STEPS.length}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            {stepLabels[currentStep]}
          </span>
        </div>
        <Progress value={progressValue} className="h-1.5" />
      </div>

      {/* Animated step content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {currentStep === 'people' && <PeopleStep />}
          {currentStep === 'items' && <ItemsStep />}
          {currentStep === 'assignment' && <AssignmentStep />}
          {currentStep === 'taxtip' && <TaxTipStep />}
          {currentStep === 'results' && <ResultsStep />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={handleBack}
          disabled={isFirstStep}
          className="min-w-[100px] px-4 py-3 text-base rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-95"
        >
          Back
        </button>
        {!isLastStep && (
          <button
            onClick={handleNext}
            disabled={!canProceed[currentStep]}
            className="min-w-[100px] px-4 py-3 text-base rounded-md bg-brand text-white hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-95"
          >
            {currentStep === 'taxtip' ? 'See Results' : 'Next'}
          </button>
        )}
      </div>
    </div>
  );
}
