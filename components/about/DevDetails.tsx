import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DevDetails() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Developer Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Student Number
            </span>
            <span className="text-lg font-medium">
              21533031
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Name
            </span>
            <span className="text-lg font-medium">
              Lesandu Hettiarachchi
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}