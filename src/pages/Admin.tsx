import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCategories, Category } from '@/hooks/useCategories';
import { useResources, Resource } from '@/hooks/useResources';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useQueryClient } from '@tanstack/react-query';

type Tab = 'dashboard' | 'categories' | 'resources' | 'requests' | 'settings';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast: _toast } = useToast();
  const _queryClient = useQueryClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin-login');
      return;
    }

    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (!adminData) {
      await supabase.auth.signOut();
      navigate('/admin-login');
      return;
    }

    setIsLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin-login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard' as Tab, label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'categories' as Tab, label: 'الأقسام', icon: FolderOpen },
    { id: 'resources' as Tab, label: 'الموارد', icon: FileText },
    { id: 'requests' as Tab, label: 'الطلبات', icon: MessageSquare },
    { id: 'settings' as Tab, label: 'الإعدادات', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-l border-border bg-card p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-primary">لوحة التحكم</h1>
          <p className="text-xs text-muted-foreground">آفاق قرآنية</p>
        </div>

        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'categories' && <CategoriesTab />}
          {activeTab === 'resources' && <ResourcesTab />}
          {activeTab === 'requests' && <RequestsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </motion.div>
      </main>
    </div>
  );
}

function DashboardTab() {
  const { data: categories } = useCategories();
  const { data: resources } = useResources();
  const [requestsCount, setRequestsCount] = useState(0);

  useEffect(() => {
    const fetchRequestsCount = async () => {
      const { count } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      setRequestsCount(count || 0);
    };
    fetchRequestsCount();
  }, []);

  const stats = [
    { label: 'الأقسام', value: categories?.length || 0 },
    { label: 'الموارد', value: resources?.length || 0 },
    { label: 'الطلبات المعلقة', value: requestsCount },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-8">مرحباً بك!</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-xl border border-border p-6"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-3xl font-bold text-primary mt-2">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoriesTab() {
  const { data: categories, refetch } = useCategories();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    slug: '',
    icon: 'folder',
    sort_order: 0,
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await supabase
          .from('categories')
          .update(formData)
          .eq('id', editingCategory.id);
        toast({ title: 'تم تحديث القسم بنجاح' });
      } else {
        await supabase.from('categories').insert(formData);
        toast({ title: 'تم إضافة القسم بنجاح' });
      }
      refetch();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
    try {
      await supabase.from('categories').delete().eq('id', id);
      toast({ title: 'تم حذف القسم بنجاح' });
      refetch();
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', name_ar: '', slug: '', icon: 'folder', sort_order: 0 });
    setEditingCategory(null);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      name_ar: category.name_ar,
      slug: category.slug,
      icon: category.icon,
      sort_order: category.sort_order,
    });
    setIsDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-foreground">الأقسام</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة قسم
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'تعديل القسم' : 'إضافة قسم جديد'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>الاسم بالعربية</Label>
                <Input
                  value={formData.name_ar}
                  onChange={(e) =>
                    setFormData({ ...formData, name_ar: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>الاسم بالإنجليزية</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>الرابط (slug)</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  required
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>الأيقونة</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  placeholder="folder"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>الترتيب</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({ ...formData, sort_order: Number(e.target.value) })
                  }
                  dir="ltr"
                />
              </div>
              <Button type="submit" className="w-full">
                {editingCategory ? 'تحديث' : 'إضافة'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr>
              <th className="px-4 py-3 text-right text-sm font-medium">الاسم</th>
              <th className="px-4 py-3 text-right text-sm font-medium">الرابط</th>
              <th className="px-4 py-3 text-right text-sm font-medium">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories?.map((category) => (
              <tr key={category.id} className="hover:bg-secondary/30">
                <td className="px-4 py-3">{category.name_ar}</td>
                <td className="px-4 py-3 text-muted-foreground">{category.slug}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResourcesTab() {
  const { data: resources, refetch } = useResources();
  const { data: categories } = useCategories();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    thumbnail_url: '',
    mega_link: '',
    category_id: '',
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingResource) {
        await supabase
          .from('resources')
          .update(formData)
          .eq('id', editingResource.id);
        toast({ title: 'تم تحديث المورد بنجاح' });
      } else {
        await supabase.from('resources').insert(formData);
        toast({ title: 'تم إضافة المورد بنجاح' });
      }
      refetch();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المورد؟')) return;
    try {
      await supabase.from('resources').delete().eq('id', id);
      toast({ title: 'تم حذف المورد بنجاح' });
      refetch();
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      title_ar: '',
      thumbnail_url: '',
      mega_link: '',
      category_id: '',
    });
    setEditingResource(null);
  };

  const openEditDialog = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      title_ar: resource.title_ar,
      thumbnail_url: resource.thumbnail_url || '',
      mega_link: resource.mega_link,
      category_id: resource.category_id,
    });
    setIsDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-foreground">الموارد</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة مورد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingResource ? 'تعديل المورد' : 'إضافة مورد جديد'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>العنوان بالعربية</Label>
                <Input
                  value={formData.title_ar}
                  onChange={(e) =>
                    setFormData({ ...formData, title_ar: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>العنوان بالإنجليزية</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>القسم</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name_ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>رابط الصورة المصغرة</Label>
                <Input
                  value={formData.thumbnail_url}
                  onChange={(e) =>
                    setFormData({ ...formData, thumbnail_url: e.target.value })
                  }
                  placeholder="https://..."
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>رابط Mega</Label>
                <Input
                  value={formData.mega_link}
                  onChange={(e) =>
                    setFormData({ ...formData, mega_link: e.target.value })
                  }
                  required
                  placeholder="https://mega.nz/..."
                  dir="ltr"
                />
              </div>
              <Button type="submit" className="w-full">
                {editingResource ? 'تحديث' : 'إضافة'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr>
              <th className="px-4 py-3 text-right text-sm font-medium">العنوان</th>
              <th className="px-4 py-3 text-right text-sm font-medium">القسم</th>
              <th className="px-4 py-3 text-right text-sm font-medium">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {resources?.map((resource) => (
              <tr key={resource.id} className="hover:bg-secondary/30">
                <td className="px-4 py-3">{resource.title_ar}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {categories?.find((c) => c.id === resource.category_id)?.name_ar}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(resource)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(resource.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RequestsTab() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests(data || []);
    setIsLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('requests').update({ status }).eq('id', id);
    toast({ title: 'تم تحديث الحالة' });
    fetchRequests();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    await supabase.from('requests').delete().eq('id', id);
    toast({ title: 'تم حذف الطلب' });
    fetchRequests();
  };

  if (isLoading) {
    return <div className="text-muted-foreground">جاري التحميل...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-8">طلبات المستخدمين</h2>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr>
              <th className="px-4 py-3 text-right text-sm font-medium">الطلب</th>
              <th className="px-4 py-3 text-right text-sm font-medium">التاريخ</th>
              <th className="px-4 py-3 text-right text-sm font-medium">الحالة</th>
              <th className="px-4 py-3 text-right text-sm font-medium">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-secondary/30">
                <td className="px-4 py-3">{request.search_query}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(request.created_at).toLocaleDateString('ar-EG')}
                </td>
                <td className="px-4 py-3">
                  <Select
                    value={request.status}
                    onValueChange={(value) => updateStatus(request.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">معلق</SelectItem>
                      <SelectItem value="completed">مكتمل</SelectItem>
                      <SelectItem value="rejected">مرفوض</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(request.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsTab() {
  const { data: settings, refetch } = useSiteSettings();
  const [formData, setFormData] = useState({
    telegram: '',
    whatsapp: '',
    email: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    if (settings) {
      setFormData({
        telegram: settings.telegram || '',
        whatsapp: settings.whatsapp || '',
        email: settings.email || '',
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      for (const [key, value] of Object.entries(formData)) {
        await supabase
          .from('site_settings')
          .update({ value })
          .eq('key', key);
      }
      toast({ title: 'تم حفظ الإعدادات بنجاح' });
      refetch();
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-8">إعدادات الموقع</h2>

      <div className="bg-card rounded-xl border border-border p-6 max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>رابط تيليجرام</Label>
            <Input
              value={formData.telegram}
              onChange={(e) =>
                setFormData({ ...formData, telegram: e.target.value })
              }
              placeholder="https://t.me/..."
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label>رابط واتساب</Label>
            <Input
              value={formData.whatsapp}
              onChange={(e) =>
                setFormData({ ...formData, whatsapp: e.target.value })
              }
              placeholder="https://wa.me/..."
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="contact@example.com"
              dir="ltr"
            />
          </div>
          <Button type="submit" className="w-full">
            حفظ الإعدادات
          </Button>
        </form>
      </div>
    </div>
  );
}
