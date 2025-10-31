import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { getTechIcon } from '../utils/techIcons';
import { AnimatedCard } from './ui/animated-card';
import { ExpandingCards } from './ui/expanding-cards';

const TechSelector = ({ 
  step, 
  selectedValue, 
  onSelect, 
  onNext, 
  onPrev, 
  isFirstStep, 
  isLastStep, 
  canProceed,
  onNavigateToTutorial,
  currentStep,
  totalSteps
}) => {
  return (
    <div 
      className="card fade-in"
      data-stagewise-element="tech-selector"
      data-stagewise-step={step.id}
      data-stagewise-step-title={step.title}
    >
      {/* Progress Indicator */}
      {currentStep !== undefined && totalSteps !== undefined && (
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-white/70 text-sm font-medium">Progress:</h3>
            <span className="text-white/70 text-sm">
              {currentStep + 1} of {totalSteps}
            </span>
          </div>
        </div>
      )}

      {/* Header and Options Layout */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Step Header - Left Side */}
        <div className="lg:w-1/3">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mr-3">
              {step.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{step.title}</h2>
              <p className="text-white/70 text-sm">{step.description}</p>
              {step.id === 'versionControl' && (
                <p className="text-yellow-400 text-xs mt-2 font-semibold">
                  💡 You can select multiple options (e.g., Git + GitHub + GitLab)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Options Grid - Right Side */}
        <div className="lg:w-2/3">
          <ExpandingCards
            items={step.options.map((option, index) => ({
              id: option.value,
              title: option.label,
              description: option.description,
              imgSrc: getTechIcon(option.value),
              icon: <img 
                src={getTechIcon(option.value)} 
                alt={`${option.label} icon`}
                className="w-6 h-6"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />,
              linkHref: "#",
              popularity: option.popularity,
              onClick: () => {
                onSelect(option.value);
                // Don't auto-advance for version control (multi-select) - let user manually click Next
                setTimeout(() => {
                  if (step.id !== 'versionControl' && !isLastStep) {
                    onNext();
                  }
                }, 300);
              }
            }))}
            defaultActiveIndex={
              Array.isArray(selectedValue) && selectedValue.length > 0
                ? step.options.findIndex(opt => selectedValue.includes(opt.value))
                : step.options.findIndex(opt => opt.value === selectedValue)
            }
            selectedItems={Array.isArray(selectedValue) ? selectedValue : (selectedValue ? [selectedValue] : [])}
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onPrev}
          disabled={isFirstStep}
          className={`btn-secondary flex items-center ${
            isFirstStep ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </button>

        <div className="flex gap-2">
          {!isLastStep && (
            <button
              onClick={onNext}
              disabled={!canProceed}
              className={`btn-primary flex items-center ${
                !canProceed ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          )}

          {isLastStep && selectedValue && (
            <button
              onClick={() => {
                // Navigate to tutorial/learning section
                if (onNavigateToTutorial) {
                  onNavigateToTutorial();
                } else if (window.onNavigateToTutorial) {
                  window.onNavigateToTutorial();
                } else {
                  window.location.href = '/tutorial';
                }
              }}
              className="btn-primary flex items-center"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start Learning Path
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechSelector;
