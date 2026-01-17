import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DemoScenario, ERROR_TYPE_INFO } from '@/types/concurrency';
import { AlertTriangle, ChevronRight } from 'lucide-react';

interface ScenarioSelectorProps {
  scenarios: DemoScenario[];
  selectedScenario: DemoScenario | null;
  onSelect: (scenario: DemoScenario) => void;
  filterType?: string;
}

const errorTypeColors = {
  'lost-update': 'bg-red-500',
  'dirty-read': 'bg-orange-500',
  'unrepeatable-read': 'bg-yellow-500',
  'phantom': 'bg-purple-500',
};

const ScenarioSelector = ({ scenarios, selectedScenario, onSelect, filterType }: ScenarioSelectorProps) => {
  const filteredScenarios = filterType 
    ? scenarios.filter(s => s.errorType === filterType)
    : scenarios;

  const groupedScenarios = filteredScenarios.reduce((acc, scenario) => {
    if (!acc[scenario.errorType]) {
      acc[scenario.errorType] = [];
    }
    acc[scenario.errorType].push(scenario);
    return acc;
  }, {} as Record<string, DemoScenario[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="w-4 h-4" />
          Select Simulation Scenario
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedScenarios).map(([errorType, scenarios]) => (
          <div key={errorType}>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={errorTypeColors[errorType as keyof typeof errorTypeColors]}>
                {ERROR_TYPE_INFO[errorType as keyof typeof ERROR_TYPE_INFO].name}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {/* Changed from nameVi to name or a general label if applicable */}
                {ERROR_TYPE_INFO[errorType as keyof typeof ERROR_TYPE_INFO].name}
              </span>
            </div>
            <div className="space-y-1">
              {scenarios.map((scenario) => (
                <Button
                  key={scenario.id}
                  variant={selectedScenario?.id === scenario.id ? 'secondary' : 'ghost'}
                  className="w-full justify-between text-left h-auto py-2 px-3"
                  onClick={() => onSelect(scenario)}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sm">{scenario.name}</span>
                    <span className="text-xs text-muted-foreground">{scenario.description}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ScenarioSelector;