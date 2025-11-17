"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, 
  Plus, 
  Search, 
  Eye, 
  Trash2,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Filter
} from "lucide-react";
import Link from "next/link";
import MainLayout from "@/components/layout/main-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";

interface TestItem {
  id: string;
  name: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  model: string;
  probes: number;
  created: string;
  duration: string;
  successRate: number;
}

const mockTests: TestItem[] = [
  { id: "test-001", name: "Security Scan - GPT-4", status: "COMPLETED", model: "OpenAI GPT-4", probes: 45, created: "2024-01-15 10:30", duration: "12m", successRate: 98 },
  { id: "test-002", name: "Toxicity Check", status: "RUNNING", model: "Claude 3", probes: 32, created: "2024-01-15 11:15", duration: "Running...", successRate: 0 },
  { id: "test-003", name: "Jailbreak Test", status: "FAILED", model: "Llama 3.1", probes: 28, created: "2024-01-14 09:45", duration: "8m", successRate: 45 },
  { id: "test-004", name: "Full Security Audit", status: "COMPLETED", model: "Gemini Pro", probes: 120, created: "2024-01-14 14:20", duration: "45m", successRate: 95 },
  { id: "test-005", name: "Quick Probe Test", status: "PENDING", model: "Mixtral 8x7B", probes: 15, created: "2024-01-15 12:00", duration: "-", successRate: 0 },
];

const statusConfig = {
  PENDING: { icon: Clock, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Pending" },
  RUNNING: { icon: Activity, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", label: "Running" },
  COMPLETED: { icon: CheckCircle, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", label: "Completed" },
  FAILED: { icon: XCircle, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", label: "Failed" },
  CANCELLED: { icon: AlertCircle, color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400", label: "Cancelled" },
};

function TestManagementContent() {
  const [tests, setTests] = useState<TestItem[]>(mockTests);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTest, setSelectedTest] = useState<TestItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({ name: "", model: "", probes: "" });

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || test.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = () => {
    if (!formData.name || !formData.model || !formData.probes) return;
    
    const newTest: TestItem = {
      id: `test-${String(tests.length + 1).padStart(3, '0')}`,
      name: formData.name,
      model: formData.model,
      probes: parseInt(formData.probes),
      status: "PENDING",
      created: new Date().toISOString().slice(0, 16).replace('T', ' '),
      duration: "-",
      successRate: 0
    };
    
    setTests([newTest, ...tests]);
    setFormData({ name: "", model: "", probes: "" });
    setIsCreateOpen(false);
  };

  const handleUpdate = () => {
    if (!selectedTest || !formData.name || !formData.model || !formData.probes) return;
    
    setTests(tests.map(t => 
      t.id === selectedTest.id 
        ? { ...t, name: formData.name, model: formData.model, probes: parseInt(formData.probes) }
        : t
    ));
    
    setFormData({ name: "", model: "", probes: "" });
    setSelectedTest(null);
    setIsEditOpen(false);
  };

  const handleDelete = () => {
    if (!selectedTest) return;
    setTests(tests.filter(t => t.id !== selectedTest.id));
    setSelectedTest(null);
    setIsDeleteOpen(false);
  };

  const openEdit = (test: TestItem) => {
    setSelectedTest(test);
    setFormData({ name: test.name, model: test.model, probes: test.probes.toString() });
    setIsEditOpen(true);
  };

  const openDelete = (test: TestItem) => {
    setSelectedTest(test);
    setIsDeleteOpen(true);
  };

  const openCreate = () => {
    setFormData({ name: "", model: "", probes: "" });
    setIsCreateOpen(true);
  };

  const openDetails = (test: TestItem) => {
    setSelectedTest(test);
    setIsDetailsOpen(true);
  };

  const getStatusBadge = (status: TestItem["status"]) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <MainLayout>
      <div className="py-3 px-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Test Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your AI security tests with full CRUD operations
            </p>
          </div>
          <Button onClick={openCreate} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Test
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{tests.length}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {tests.filter(t => t.status === "COMPLETED").length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Running</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {tests.filter(t => t.status === "RUNNING").length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {tests.filter(t => t.status === "FAILED").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label>Search</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name, ID, or model..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="RUNNING">Running</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              {filteredTests.length} test{filteredTests.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTests.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No tests found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your filters" 
                    : "Create your first test to get started"}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button onClick={openCreate}>
                    <Play className="h-4 w-4 mr-2" />
                    Create Test
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Probes</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTests.map((test) => (
                    <TableRow key={test.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">{test.id}</TableCell>
                      <TableCell className="font-medium">{test.name}</TableCell>
                      <TableCell>{test.model}</TableCell>
                      <TableCell>{getStatusBadge(test.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{test.probes}</Badge>
                      </TableCell>
                      <TableCell>
                        {test.successRate > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${
                                  test.successRate >= 90 ? 'bg-green-500' :
                                  test.successRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${test.successRate}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{test.successRate}%</span>
                          </div>
                        )}
                        {test.successRate === 0 && <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell className="text-sm">{test.created}</TableCell>
                      <TableCell className="text-sm">{test.duration}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openDetails(test)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(test)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openDelete(test)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Test</DialogTitle>
              <DialogDescription>Add a new security test to your collection</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="create-name">Test Name</Label>
                <Input
                  id="create-name"
                  placeholder="e.g., Security Scan - GPT-4"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="create-model">Model</Label>
                <Input
                  id="create-model"
                  placeholder="e.g., OpenAI GPT-4"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="create-probes">Number of Probes</Label>
                <Input
                  id="create-probes"
                  type="number"
                  placeholder="e.g., 45"
                  value={formData.probes}
                  onChange={(e) => setFormData({ ...formData, probes: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} className="bg-gradient-to-r from-purple-600 to-blue-600">
                Create Test
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Test</DialogTitle>
              <DialogDescription>Update test information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-name">Test Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-model">Model</Label>
                <Input
                  id="edit-model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-probes">Number of Probes</Label>
                <Input
                  id="edit-probes"
                  type="number"
                  value={formData.probes}
                  onChange={(e) => setFormData({ ...formData, probes: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdate} className="bg-gradient-to-r from-purple-600 to-blue-600">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Delete Test
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the test.
              </DialogDescription>
            </DialogHeader>
            {selectedTest && (
              <div className="py-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div><span className="font-semibold">ID:</span> {selectedTest.id}</div>
                  <div><span className="font-semibold">Name:</span> {selectedTest.name}</div>
                  <div><span className="font-semibold">Model:</span> {selectedTest.model}</div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Test
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Test Details</DialogTitle>
              <DialogDescription>Comprehensive test information</DialogDescription>
            </DialogHeader>
            {selectedTest && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Test ID</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-mono">{selectedTest.id}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getStatusBadge(selectedTest.status)}
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Test Name</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">{selectedTest.name}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Model</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{selectedTest.model}</p>
                  </CardContent>
                </Card>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Probes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{selectedTest.probes}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Duration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{selectedTest.duration}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Success Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{selectedTest.successRate}%</p>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Created At</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{selectedTest.created}</p>
                  </CardContent>
                </Card>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsDetailsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

export default function TestManagementPage() {
  return (
    <ProtectedRoute>
      <TestManagementContent />
    </ProtectedRoute>
  );
}
