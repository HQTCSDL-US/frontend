import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Lock, Unlock } from 'lucide-react';

interface TableData {
  columns: string[];
  rows: Record<string, string | number | boolean>[];
  highlightedColumn?: string;
  lockedBy?: 'T1' | 'T2' | null;
  lockType?: 'S' | 'X' | 'U';
}

interface DatabaseStateProps {
  tableName: string;
  description: string;
  data: TableData;
  showLockIndicator?: boolean;
}

const DatabaseState = ({ tableName, description, data, showLockIndicator = true }: DatabaseStateProps) => {
  return (
    <Card className="border-2">
      <CardHeader className="bg-muted py-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              🗃️ {tableName}
            </CardTitle>
            <CardDescription className="text-xs">{description}</CardDescription>
          </div>
          {showLockIndicator && data.lockedBy && (
            <Badge 
              variant="outline" 
              className={
                data.lockedBy === 'T1' 
                  ? 'border-blue-500 text-blue-500' 
                  : 'border-purple-500 text-purple-500'
              }
            >
              <Lock className="w-3 h-3 mr-1" />
              {data.lockType || 'X'}-Lock by {data.lockedBy}
            </Badge>
          )}
          {showLockIndicator && !data.lockedBy && (
            <Badge variant="outline" className="text-muted-foreground">
              <Unlock className="w-3 h-3 mr-1" />
              No Lock
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {data.columns.map((col) => (
                <TableHead 
                  key={col} 
                  className={`text-xs ${col === data.highlightedColumn ? 'bg-yellow-500/20 font-bold' : ''}`}
                >
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row, i) => (
              <TableRow key={i}>
                {data.columns.map((col) => (
                  <TableCell 
                    key={col} 
                    className={`text-xs py-2 ${col === data.highlightedColumn ? 'bg-yellow-500/10 font-medium' : ''}`}
                  >
                    {typeof row[col] === 'boolean' 
                      ? row[col] ? '✓' : '✗'
                      : String(row[col] ?? '-')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DatabaseState;
