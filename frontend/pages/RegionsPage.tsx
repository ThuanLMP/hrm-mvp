import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import RegionForm from '@/components/regions/RegionForm';
import { useAuthenticatedBackend } from '../hooks/useAuthenticatedBackend';
import backend from '~backend/client';
import type { Region, CreateRegionRequest, UpdateRegionRequest } from '~backend/region/types';

export default function RegionsPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const authBackend = useAuthenticatedBackend();

  const loadRegions = async () => {
    try {
      const data = await backend.region.list();
      setRegions(data.regions);
    } catch (error) {
      console.error('Failed to load regions:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách khu vực",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegions();
  }, []);

  const handleCreate = async (data: CreateRegionRequest) => {
    setSubmitting(true);
    try {
      await authBackend.region.create(data);
      toast({
        title: "Thành công",
        description: "Tạo khu vực thành công",
      });
      setShowForm(false);
      loadRegions();
    } catch (error: any) {
      console.error('Failed to create region:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo khu vực",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data: UpdateRegionRequest) => {
    if (!editingRegion) return;
    
    setSubmitting(true);
    try {
      await authBackend.region.update({ id: editingRegion.id }, data);
      toast({
        title: "Thành công",
        description: "Cập nhật khu vực thành công",
      });
      setEditingRegion(null);
      loadRegions();
    } catch (error: any) {
      console.error('Failed to update region:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật khu vực",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (region: Region) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa khu vực "${region.name}"?`)) {
      return;
    }

    try {
      await authBackend.region.deleteRegion({ id: region.id });
      toast({
        title: "Thành công",
        description: "Xóa khu vực thành công",
      });
      loadRegions();
    } catch (error: any) {
      console.error('Failed to delete region:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa khu vực",
        variant: "destructive",
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRegion(null);
  };

  const handleSubmit = async (data: CreateRegionRequest | UpdateRegionRequest) => {
    if (editingRegion) {
      await handleUpdate(data as UpdateRegionRequest);
    } else {
      await handleCreate(data as CreateRegionRequest);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Khu vực</h1>
          <p className="text-muted-foreground">Quản lý các khu vực hoạt động</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Thêm khu vực
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regions.map((region) => (
          <Card key={region.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{region.name}</CardTitle>
                </div>
                <Badge variant={region.isActive ? "default" : "secondary"}>
                  {region.code}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {region.description && (
                <p className="text-sm text-muted-foreground">{region.description}</p>
              )}
              
              <div className="text-sm">
                <span className="font-medium">Múi giờ: </span>
                <span className="text-muted-foreground">{region.timezone}</span>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant={region.isActive ? "default" : "secondary"}>
                  {region.isActive ? "Hoạt động" : "Không hoạt động"}
                </Badge>
                
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingRegion(region)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(region)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground pt-2 border-t">
                Tạo: {new Date(region.createdAt).toLocaleDateString('vi-VN')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {regions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Chưa có khu vực nào</h3>
            <p className="text-muted-foreground text-center mb-4">
              Bắt đầu bằng cách tạo khu vực đầu tiên
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm khu vực
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={showForm || !!editingRegion} onOpenChange={handleCloseForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingRegion ? 'Chỉnh sửa khu vực' : 'Thêm khu vực mới'}
            </DialogTitle>
          </DialogHeader>
          <RegionForm
            region={editingRegion || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={submitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}