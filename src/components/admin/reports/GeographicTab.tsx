import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

interface GeographicTabProps {
  geographicData: { city: string; branches: number; visits: number; missions: number }[];
  branchStatusDist: { name: string; value: number; color: string }[];
}

export function GeographicTab({ geographicData, branchStatusDist }: GeographicTabProps) {
  const chartData = geographicData.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase">Branches by City</CardTitle>
            <CardDescription>Distribution of branches, missions, and visits across cities</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer config={{
                branches: { label: 'Branches', color: '#F97316' },
                missions: { label: 'Missions', color: '#0EA5E9' },
                visits: { label: 'Visits', color: '#22C55E' },
              }} className="h-[300px] w-full">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" fontSize={11} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="branches" fill="#F97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="missions" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="visits" fill="#22C55E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">No branch data yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase">Branch Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            {branchStatusDist.length > 0 ? (
              <ChartContainer config={{}} className="h-[300px] w-full">
                <PieChart>
                  <Pie data={branchStatusDist} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {branchStatusDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">No branches yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* City Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold uppercase">City Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>City</TableHead>
                  <TableHead className="text-center">Branches</TableHead>
                  <TableHead className="text-center">Missions</TableHead>
                  <TableHead className="text-center">Visits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {geographicData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No geographic data yet</TableCell>
                  </TableRow>
                ) : geographicData.map(row => (
                  <TableRow key={row.city}>
                    <TableCell className="font-medium">{row.city}</TableCell>
                    <TableCell className="text-center">{row.branches}</TableCell>
                    <TableCell className="text-center">{row.missions}</TableCell>
                    <TableCell className="text-center">{row.visits}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
