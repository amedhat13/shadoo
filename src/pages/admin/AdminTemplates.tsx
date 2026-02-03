import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileQuestion, Plus, Edit2, Eye, Copy, Trash2 } from 'lucide-react';

const mockTemplates = [
  { id: '1', name: 'NPS Score Template', category: 'NPS', questions: 3, usage: 45, public: true },
  { id: '2', name: 'Customer Satisfaction (CSAT)', category: 'CSAT', questions: 5, usage: 67, public: true },
  { id: '3', name: 'Store Cleanliness Check', category: 'Custom', questions: 8, usage: 23, public: true },
  { id: '4', name: 'Staff Behavior Assessment', category: 'Custom', questions: 10, usage: 34, public: true },
  { id: '5', name: 'Product Availability Audit', category: 'Custom', questions: 6, usage: 18, public: true },
];

export default function AdminTemplatesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Question Templates"
          description="Manage pre-built question templates for client missions."
          actions={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          }
        />

        {/* Category Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">NPS Templates</p>
                  <p className="text-2xl font-black">2</p>
                </div>
                <FileQuestion className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">CSAT Templates</p>
                  <p className="text-2xl font-black">3</p>
                </div>
                <FileQuestion className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Custom Templates</p>
                  <p className="text-2xl font-black">12</p>
                </div>
                <FileQuestion className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Total Usage</p>
                  <p className="text-2xl font-black">187</p>
                </div>
                <FileQuestion className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Templates Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase">All Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{template.category}</Badge>
                    </TableCell>
                    <TableCell>{template.questions} questions</TableCell>
                    <TableCell>{template.usage} missions</TableCell>
                    <TableCell>
                      <Badge variant={template.public ? 'default' : 'secondary'}>
                        {template.public ? 'Public' : 'Private'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
