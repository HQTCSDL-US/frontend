import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { TransactionState, TransactionStep } from '@/types/concurrency';

interface TransactionPanelProps {
  title: string;
  role: string;
  action: string;
  state: TransactionState;
  steps: {
    label: string;
    enabledWhen: TransactionStep;
    onClick: () => void;
  }[];
  isAutoRunning: boolean;
  colorScheme: 'blue' | 'purple' | 'green' | 'orange';
  resultMessage?: {
    success: string;
    failure: string;
  };
  isSuccess?: boolean;
}

const colorClasses = {
  blue: {
    border: 'border-blue-500/50',
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
  },
  purple: {
    border: 'border-purple-500/50',
    bg: 'bg-purple-500/10',
    text: 'text-purple-500',
  },
  green: {
    border: 'border-green-500/50',
    bg: 'bg-green-500/10',
    text: 'text-green-500',
  },
  orange: {
    border: 'border-orange-500/50',
    bg: 'bg-orange-500/10',
    text: 'text-orange-500',
  },
};

const getStepBadge = (step: TransactionStep) => {
  switch (step) {
    case 'idle':
      return <Badge variant="outline">Idle</Badge>;
    case 'begin':
      return <Badge className="bg-gray-500">Begin</Badge>;
    case 'read':
    case 'read2':
      return <Badge className="bg-blue-500">Reading</Badge>;
    case 'modify':
      return <Badge className="bg-yellow-500">Processing</Badge>;
    case 'write':
      return <Badge className="bg-orange-500">Writing</Badge>;
    case 'waiting':
      return <Badge className="bg-amber-500">Waiting</Badge>;
    case 'committed':
      return <Badge className="bg-green-500">Committed</Badge>;
    case 'rollback':
      return <Badge className="bg-red-500">Rollback</Badge>;
    case 'error':
      return <Badge variant="destructive">Error</Badge>;
    default:
      return null;
  }
};

const TransactionPanel = ({
  title,
  role,
  action,
  state,
  steps,
  isAutoRunning,
  colorScheme,
  resultMessage,
  isSuccess,
}: TransactionPanelProps) => {
  const colors = colorClasses[colorScheme];

  return (
    <Card className={colors.border}>
      <CardHeader className={colors.bg}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2">{title}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {role} - {action}
            </span>
          </div>
          {getStepBadge(state.step)}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {steps.map((step, index) => (
          <Button
            key={index}
            size="sm"
            variant="outline"
            className="w-full justify-start"
            onClick={step.onClick}
            disabled={state.step !== step.enabledWhen || isAutoRunning}
          >
            {state.step === 'waiting' && step.enabledWhen === state.step && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {index + 1}. {step.label}
          </Button>
        ))}

        {(state.committed || state.rolledBack) && resultMessage && (
          <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
            {state.rolledBack ? (
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="w-4 h-4" />
                Transaction rolled back
              </div>
            ) : isSuccess ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                {resultMessage.success}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="w-4 h-4" />
                {resultMessage.failure}
              </div>
            )}
          </div>
        )}

        {state.readValue !== null && (
          <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
            <Clock className="w-3 h-3 inline mr-1" />
            Read value: <code className="bg-muted px-1 rounded">{String(state.readValue)}</code>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionPanel;