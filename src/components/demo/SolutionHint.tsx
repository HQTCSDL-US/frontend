import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Shield, Database, Lock } from 'lucide-react';
import { ERROR_TYPE_INFO } from '@/types/concurrency';

interface SolutionHintProps {
  errorType: keyof typeof ERROR_TYPE_INFO;
}

const SolutionHint = ({ errorType }: SolutionHintProps) => {
  const info = ERROR_TYPE_INFO[errorType];

  return (
    <Card className="border-green-500/50 bg-green-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="w-5 h-5" />
          Cách ngăn chặn {info.name} ({info.name})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Database className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">Isolation Level đề xuất</p>
              <p className="text-sm text-muted-foreground">{info.isolationLevel}</p>
            </div>
          </div>

          <ul className="space-y-2 text-sm">
            {info.solution.map((solution, index) => (
              <li key={index} className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{solution}</span>
              </li>
            ))}
          </ul>

          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <span className="font-medium text-sm text-amber-700">SQL Server Lock Types</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><code className="bg-muted px-1 rounded">S (Shared)</code> - Đọc dữ liệu, nhiều transaction có thể đọc cùng lúc</p>
              <p><code className="bg-muted px-1 rounded">X (Exclusive)</code> - Ghi dữ liệu, chặn mọi truy cập khác</p>
              <p><code className="bg-muted px-1 rounded">U (Update)</code> - Đọc với ý định ghi, ngăn deadlock</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SolutionHint;
