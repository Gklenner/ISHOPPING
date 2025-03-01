export function Steps({
  steps,
  currentStep,
}: {
  steps: Array<{ id: string; title: string }>
  currentStep: string
}) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={`
            flex items-center justify-center w-8 h-8 rounded-full
            ${currentStep === step.id ? "bg-primary text-white" : "bg-gray-100 text-gray-400"}
          `}
          >
            {index + 1}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`
              h-0.5 w-full mx-2
              ${steps.findIndex((s) => s.id === currentStep) > index ? "bg-primary" : "bg-gray-200"}
            `}
            />
          )}
        </div>
      ))}
    </div>
  )
}

