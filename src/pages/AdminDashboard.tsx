import { useEffect, useState } from 'react';
import { getDisplayUrl } from '@/lib/urls';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppSettings } from '@/hooks/useAppSettings';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  FileText, 
  ArrowLeft,
  Loader2,
  Shield,
  Calendar,
  Mail,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Search,
  Filter,
  DollarSign,
  Phone,
  Clock,
  RefreshCw,
  Settings,
  MessageCircle,
  Save,
  Download,
  Wallet,
  Plus,
  Minus,
  UserPlus
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HomepageEditor } from '@/components/HomepageEditor';
import { CustomersTab } from '@/components/CustomersTab';
import logoPainel from '@/assets/logo-dashboard.png';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  created_at: string;
  email?: string;
  role?: string;
  landing_pages_count?: number;
  balance?: number;
}

interface UserBalance {
  user_id: string;
  balance: number;
}

interface LandingPageAdmin {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  created_at: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
}

interface Order {
  id: string;
  tier_name: string;
  credits: number;
  price: number;
  customer_name: string;
  customer_whatsapp: string;
  customer_email: string;
  invite_link: string | null;
  coupon_code: string | null;
  status: string;
  landing_page_id: string | null;
  created_at: string;
  landing_page_title?: string;
}

const AdminDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { settings: appSettings, updateSetting, loading: settingsLoading } = useAppSettings();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pages, setPages] = useState<LandingPageAdmin[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deletePageId, setDeletePageId] = useState<string | null>(null);
  
  // ID da primeira landing page (matriz) - não pode ser excluída
  const MAIN_LANDING_PAGE_ID = '11f96cef-351c-4758-bf41-9ef4b03d915c';
  
  // Order filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderPageFilter, setOrderPageFilter] = useState<string>('all');

  // Settings form
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappCountryCode, setWhatsappCountryCode] = useState('+55');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [showRefreshButton, setShowRefreshButton] = useState(false);
  
  // Balance management
  const [balanceModalUser, setBalanceModalUser] = useState<UserProfile | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceType, setBalanceType] = useState<'credit' | 'debit'>('credit');
  const [balanceDescription, setBalanceDescription] = useState('');
  const [savingBalance, setSavingBalance] = useState(false);
  
  // Create user
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPages: 0,
    publishedPages: 0,
    newUsersToday: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });

  // Sync settings form when loaded
  useEffect(() => {
    if (!settingsLoading) {
      const num = appSettings.whatsapp_number || '';
      // Detect country code from stored number
      const knownCodes = ['55','1','44','351','34','49','33','39','81','91','61','52','54','56','57'];
      let detectedCode = '+55';
      let localNum = num;
      for (const c of knownCodes.sort((a, b) => b.length - a.length)) {
        if (num.startsWith(c)) {
          detectedCode = `+${c}`;
          localNum = num.slice(c.length);
          break;
        }
      }
      setWhatsappCountryCode(detectedCode);
      setWhatsappNumber(localNum);
      setWhatsappMessage(appSettings.whatsapp_message || '');
    }
  }, [appSettings, settingsLoading]);

  // Fetch refresh button setting
  useEffect(() => {
    const fetchRefreshSetting = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'show_refresh_button')
        .maybeSingle();
      setShowRefreshButton(data?.value === 'true');
    };
    fetchRefreshSetting();
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user]);

  const checkAdminRole = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (data?.role === 'admin') {
        setIsAdmin(true);
        await fetchData();
      } else {
        toast.error('Acesso negado: você não é administrador');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
      toast.error('Erro ao verificar permissões');
      navigate('/dashboard');
    } finally {
      setCheckingAdmin(false);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Fetch user balances
      const { data: balances, error: balancesError } = await supabase
        .from('user_balances')
        .select('user_id, balance');

      if (balancesError) console.error('Error fetching balances:', balancesError);

      // Create balance map
      const balanceMap: Record<string, number> = {};
      balances?.forEach(b => {
        balanceMap[b.user_id] = b.balance;
      });

      // Fetch all landing pages
      const { data: landingPages, error: pagesError } = await supabase
        .from('landing_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (pagesError) throw pagesError;

      // Fetch all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Map landing page titles
      const pageMap: Record<string, string> = {};
      landingPages?.forEach(p => {
        pageMap[p.id] = p.title;
      });

      const enrichedOrders = ordersData?.map(order => ({
        ...order,
        landing_page_title: order.landing_page_id ? pageMap[order.landing_page_id] || 'Página removida' : 'N/A'
      })) || [];

      setOrders(enrichedOrders);

      // Count pages per user
      const pagesPerUser: Record<string, number> = {};
      landingPages?.forEach(page => {
        pagesPerUser[page.user_id] = (pagesPerUser[page.user_id] || 0) + 1;
      });

      // Map roles to users
      const roleMap: Record<string, string> = {};
      roles?.forEach(r => {
        roleMap[r.user_id] = r.role;
      });

      // Enrich user data with roles and balances
      const enrichedUsers = profiles?.map(profile => ({
        ...profile,
        role: roleMap[profile.user_id] || 'user',
        landing_pages_count: pagesPerUser[profile.user_id] || 0,
        balance: balanceMap[profile.user_id] || 0
      })) || [];

      // Map user names to landing pages
      const userMap: Record<string, { name: string }> = {};
      profiles?.forEach(p => {
        userMap[p.user_id] = { name: p.full_name || 'Sem nome' };
      });

      const enrichedPages = landingPages?.map(page => ({
        ...page,
        user_name: userMap[page.user_id]?.name || 'Desconhecido'
      })) || [];

      setUsers(enrichedUsers);
      setPages(enrichedPages);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const newUsersToday = profiles?.filter(p => {
        const createdAt = new Date(p.created_at);
        return createdAt >= today;
      }).length || 0;

      const totalRevenue = ordersData?.reduce((sum, o) => sum + (o.price || 0), 0) || 0;
      const pendingOrders = ordersData?.filter(o => o.status === 'pending').length || 0;

      setStats({
        totalUsers: profiles?.length || 0,
        totalPages: landingPages?.length || 0,
        publishedPages: landingPages?.filter(p => p.is_published).length || 0,
        newUsersToday,
        totalOrders: ordersData?.length || 0,
        pendingOrders,
        totalRevenue
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    // Protect main admin
    if (deleteUserId === '1633e23a-6a48-42b7-92cf-21cd3ec33ca4') {
      toast.error('Não é permitido excluir a conta do administrador principal');
      setDeleteUserId(null);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-delete-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ user_id: deleteUserId }),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erro ao excluir usuário');

      toast.success('Usuário excluído com sucesso!');
      setDeleteUserId(null);
      await fetchData();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Erro ao excluir usuário');
      setDeleteUserId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.filter(o => o.id !== orderId));
      setStats(prev => ({
        ...prev,
        totalOrders: prev.totalOrders - 1
      }));
      toast.success('Pedido excluído com sucesso');
    } catch (error: any) {
      console.error('Error deleting order:', error);
      toast.error('Erro ao excluir pedido');
    }
  };

  const handleDeletePage = async () => {
    if (!deletePageId) return;

    // Proteção extra no frontend
    if (deletePageId === MAIN_LANDING_PAGE_ID) {
      toast.error('Não é permitido excluir a página principal (matriz)');
      setDeletePageId(null);
      return;
    }

    try {
      const { error } = await supabase
        .from('landing_pages')
        .delete()
        .eq('id', deletePageId);

      if (error) throw error;

      setPages(prev => prev.filter(p => p.id !== deletePageId));
      setStats(prev => ({
        ...prev,
        totalPages: prev.totalPages - 1,
        publishedPages: prev.publishedPages - (pages.find(p => p.id === deletePageId)?.is_published ? 1 : 0)
      }));
      toast.success('Landing page excluída com sucesso');
    } catch (error: any) {
      console.error('Error deleting landing page:', error);
      toast.error('Erro ao excluir landing page');
    } finally {
      setDeletePageId(null);
    }
  };

  const handleTogglePublish = async (pageId: string, currentlyPublished: boolean) => {
    try {
      const { error } = await supabase
        .from('landing_pages')
        .update({ is_published: !currentlyPublished })
        .eq('id', pageId);

      if (error) throw error;

      setPages(prev => prev.map(p => p.id === pageId ? { ...p, is_published: !currentlyPublished } : p));
      setStats(prev => ({
        ...prev,
        publishedPages: prev.publishedPages + (currentlyPublished ? -1 : 1)
      }));
      toast.success(currentlyPublished ? 'Página despublicada' : 'Página aprovada e publicada!');
    } catch (error: any) {
      console.error('Error toggling publish:', error);
      toast.error('Erro ao alterar status da página');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      ));

      // Update stats
      setStats(prev => ({
        ...prev,
        pendingOrders: orders.filter(o => o.id === orderId ? newStatus === 'pending' : o.status === 'pending').length
      }));

      // If approved, refetch data to update balances
      if (newStatus === 'approved') {
        await fetchData();
        toast.success('Pedido aprovado! Créditos adicionados ao saldo do usuário.');
      } else {
        toast.success(`Status atualizado para "${newStatus}"`);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Erro ao atualizar pedido');
    }
  };

  const handleUpdateBalance = async () => {
    if (!balanceModalUser || !balanceAmount) return;
    
    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Informe um valor válido');
      return;
    }

    setSavingBalance(true);
    try {
      const { error } = await supabase.rpc('update_user_balance', {
        _user_id: balanceModalUser.user_id,
        _amount: amount,
        _type: balanceType,
        _description: balanceDescription || (balanceType === 'credit' ? 'Créditos adicionados pelo admin' : 'Créditos removidos pelo admin'),
        _admin_id: user?.id
      });

      if (error) throw error;

      toast.success(balanceType === 'credit' 
        ? `${amount} créditos adicionados com sucesso!` 
        : `${amount} créditos removidos com sucesso!`
      );
      
      setBalanceModalUser(null);
      setBalanceAmount('');
      setBalanceDescription('');
      await fetchData();
    } catch (error) {
      console.error('Error updating balance:', error);
      toast.error('Erro ao atualizar saldo');
    } finally {
      setSavingBalance(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      toast.error('Email e senha são obrigatórios');
      return;
    }
    if (newUserPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setCreatingUser(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            email: newUserEmail,
            password: newUserPassword,
            full_name: newUserName || null,
          }),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erro ao criar usuário');

      toast.success('Usuário cadastrado com sucesso!');
      setShowCreateUser(false);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      await fetchData();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Erro ao criar usuário');
    } finally {
      setCreatingUser(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = orderSearch === '' || 
      order.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.customer_whatsapp.includes(orderSearch) ||
      order.tier_name.toLowerCase().includes(orderSearch.toLowerCase());
    
    const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    const matchesPage = orderPageFilter === 'all' || order.landing_page_id === orderPageFilter;

    return matchesSearch && matchesStatus && matchesPage;
  });

  // Get unique landing pages for filter
  const uniquePages = pages.filter(p => orders.some(o => o.landing_page_id === p.id));

  if (authLoading || checkingAdmin || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <img src={logoPainel} alt="Logo" className="h-14 object-contain" />
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-lg">Painel Admin</h1>
                <Badge variant="destructive" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Gerenciamento de usuários e páginas</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={async () => {
              setLoading(true);
              await fetchData();
              toast.success('Dados atualizados com sucesso!');
            }}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-card/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Usuários</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.totalPages}</p>
                  <p className="text-xs text-muted-foreground">Páginas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-orange-500/10">
                  <ShoppingCart className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.totalOrders}</p>
                  <p className="text-xs text-muted-foreground">Pedidos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-yellow-500/10">
                  <Clock className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.pendingOrders}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500/10">
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xl font-bold">{formatPrice(stats.totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground">Faturamento</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-500/10">
                  <Eye className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.publishedPages}</p>
                  <p className="text-xs text-muted-foreground">Publicadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              Pedidos ({stats.totalOrders})
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Usuários ({stats.totalUsers})
            </TabsTrigger>
            <TabsTrigger value="pages" className="gap-2">
              <FileText className="w-4 h-4" />
              Páginas ({stats.totalPages})
            </TabsTrigger>
            <TabsTrigger value="homepage" className="gap-2">
              <Eye className="w-4 h-4" />
              Página Principal
            </TabsTrigger>
            <TabsTrigger value="customers" className="gap-2">
              <Phone className="w-4 h-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="bg-card/50">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Pedidos</CardTitle>
                    <CardDescription>Gerencie todos os pedidos da plataforma</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        // Export filtered orders to CSV
                        const headers = ['ID', 'Cliente', 'Email', 'WhatsApp', 'Pacote', 'Créditos', 'Valor', 'Status', 'Página', 'Cupom', 'Link Convite', 'Data'];
                        const csvData = filteredOrders.map(order => [
                          order.id,
                          order.customer_name,
                          order.customer_email,
                          order.customer_whatsapp,
                          order.tier_name,
                          order.credits,
                          order.price,
                          order.status,
                          order.landing_page_title || 'N/A',
                          order.coupon_code || '',
                          order.invite_link || '',
                          formatDate(order.created_at)
                        ]);
                        
                        const csvContent = [
                          headers.join(';'),
                          ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
                        ].join('\n');
                        
                        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = `pedidos_${new Date().toISOString().split('T')[0]}.csv`;
                        link.click();
                        URL.revokeObjectURL(link.href);
                        
                        toast.success(`${filteredOrders.length} pedidos exportados!`);
                      }}
                      disabled={filteredOrders.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => fetchData()}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Atualizar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, email, WhatsApp..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="pl-10 bg-background/50"
                    />
                  </div>
                  <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[160px] bg-background/50">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos Status</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="approved">Aprovado</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={orderPageFilter} onValueChange={setOrderPageFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-background/50">
                      <SelectValue placeholder="Landing Page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas Páginas</SelectItem>
                      {uniquePages.map(page => (
                        <SelectItem key={page.id} value={page.id}>
                          {page.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Orders Table */}
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Pacote</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Página</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="w-[120px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Nenhum pedido encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-medium text-sm">{order.customer_name}</p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Mail className="w-3 h-3" />
                                  {order.customer_email}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Phone className="w-3 h-3" />
                                  {order.customer_whatsapp}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{order.tier_name}</p>
                                <p className="text-xs text-muted-foreground">{order.credits.toLocaleString('pt-BR')} créditos</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-green-500">{formatPrice(order.price)}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">{order.landing_page_title}</span>
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={order.status} 
                                onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                              >
                                <SelectTrigger className={`w-[120px] h-8 text-xs ${
                                  order.status === 'approved' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                                  order.status === 'completed' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' :
                                  order.status === 'cancelled' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
                                  'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
                                }`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pendente</SelectItem>
                                  <SelectItem value="approved">Aprovado ✓</SelectItem>
                                  <SelectItem value="completed">Concluído</SelectItem>
                                  <SelectItem value="cancelled">Cancelado</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(order.created_at)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    const msg = `Olá ${order.customer_name}! Seu pedido de ${order.tier_name} foi recebido.`;
                                    window.open(`https://wa.me/${order.customer_whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
                                  }}
                                  className="text-green-500 hover:text-green-400"
                                >
                                  <Phone className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="text-red-500 hover:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {filteredOrders.length > 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Mostrando {filteredOrders.length} de {orders.length} pedidos
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-card/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Usuários Cadastrados</CardTitle>
                    <CardDescription>Lista de todos os usuários da plataforma</CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateUser(true)} className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Cadastrar Usuário
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Saldo</TableHead>
                        <TableHead>Landing Pages</TableHead>
                        <TableHead>Data de Cadastro</TableHead>
                        <TableHead className="w-[140px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Nenhum usuário encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((profile) => (
                          <TableRow key={profile.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary">
                                    {(profile.full_name || 'U').charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">{profile.full_name || 'Sem nome'}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={profile.role === 'admin' ? 'destructive' : 'secondary'}>
                                {profile.role === 'admin' ? (
                                  <><Shield className="w-3 h-3 mr-1" /> Admin</>
                                ) : (
                                  'Usuário'
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Wallet className="w-4 h-4 text-green-500" />
                                <span className="font-semibold text-green-500">
                                  {(profile.balance || 0).toLocaleString('pt-BR')}
                                </span>
                                <span className="text-xs text-muted-foreground">créditos</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {profile.landing_pages_count} páginas
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                {formatDate(profile.created_at)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setBalanceModalUser(profile);
                                    setBalanceType('credit');
                                  }}
                                  className="text-green-500 hover:text-green-400"
                                  title="Adicionar créditos"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setBalanceModalUser(profile);
                                    setBalanceType('debit');
                                  }}
                                  className="text-orange-500 hover:text-orange-400"
                                  title="Remover créditos"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setDeleteUserId(profile.user_id)}
                                  className="text-destructive hover:text-destructive"
                                  disabled={profile.role === 'admin'}
                                  title="Excluir usuário"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pages Tab */}
          <TabsContent value="pages">
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle>Todas as Landing Pages</CardTitle>
                <CardDescription>Visualize todas as páginas criadas na plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Criador</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Criada em</TableHead>
                        <TableHead className="w-[100px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pages.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Nenhuma página encontrada
                          </TableCell>
                        </TableRow>
                      ) : (
                        pages.map((page) => (
                          <TableRow key={page.id}>
                            <TableCell className="font-medium">{page.title}</TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px] inline-block">
                                {getDisplayUrl(page.slug)}
                              </code>
                            </TableCell>
                            <TableCell>{page.user_name}</TableCell>
                            <TableCell>
                              {page.is_published ? (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Publicada
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Rascunho
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(page.created_at)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {!page.is_published ? (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleTogglePublish(page.id, false)}
                                    className="text-green-400 hover:text-green-300"
                                    title="Aprovar e publicar"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleTogglePublish(page.id, true)}
                                    className="text-yellow-400 hover:text-yellow-300"
                                    title="Despublicar"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => window.open(`/p/${page.slug}?preview=true`, '_blank')}
                                  title="Visualizar página"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setDeletePageId(page.id)}
                                  className="text-destructive hover:text-destructive"
                                  disabled={page.id === MAIN_LANDING_PAGE_ID}
                                  title={page.id === MAIN_LANDING_PAGE_ID ? 'Página principal (matriz) - não pode ser excluída' : 'Excluir página'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <CustomersTab userId={user?.id || ''} pages={pages.map(p => ({ id: p.id, title: p.title }))} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-card/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-whatsapp/10">
                    <MessageCircle className="w-5 h-5 text-whatsapp" />
                  </div>
                  <div>
                    <CardTitle>Botão Flutuante WhatsApp</CardTitle>
                    <CardDescription>Configure o botão de contato que aparece em todas as páginas</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 max-w-lg">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-number">Número do WhatsApp</Label>
                    <div className="flex gap-2">
                      <select
                        value={whatsappCountryCode}
                        onChange={(e) => setWhatsappCountryCode(e.target.value)}
                        className="bg-background/50 border border-border rounded-md px-2 py-2 text-sm text-foreground w-[110px] flex-shrink-0"
                      >
                        {[
                          { code: '+55', flag: '🇧🇷' },
                          { code: '+1', flag: '🇺🇸' },
                          { code: '+44', flag: '🇬🇧' },
                          { code: '+351', flag: '🇵🇹' },
                          { code: '+34', flag: '🇪🇸' },
                          { code: '+49', flag: '🇩🇪' },
                          { code: '+33', flag: '🇫🇷' },
                          { code: '+39', flag: '🇮🇹' },
                          { code: '+81', flag: '🇯🇵' },
                          { code: '+91', flag: '🇮🇳' },
                          { code: '+61', flag: '🇦🇺' },
                          { code: '+52', flag: '🇲🇽' },
                          { code: '+54', flag: '🇦🇷' },
                          { code: '+56', flag: '🇨🇱' },
                          { code: '+57', flag: '🇨🇴' },
                        ].map((c) => (
                          <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                        ))}
                      </select>
                      <Input
                        id="whatsapp-number"
                        placeholder="48999999999"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                        className="bg-background/50 flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Selecione o país e digite o número sem o código do país
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-message">Mensagem Padrão</Label>
                    <Textarea
                      id="whatsapp-message"
                      placeholder="Olá! Gostaria de mais informações..."
                      value={whatsappMessage}
                      onChange={(e) => setWhatsappMessage(e.target.value)}
                      className="bg-background/50 min-h-[100px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Mensagem que será pré-preenchida ao clicar no botão
                    </p>
                  </div>

                  <Button 
                    onClick={async () => {
                      setSavingSettings(true);
                      try {
                        const fullNumber = `${whatsappCountryCode.replace('+', '')}${whatsappNumber}`;
                        const result1 = await updateSetting('whatsapp_number', fullNumber);
                        const result2 = await updateSetting('whatsapp_message', whatsappMessage);
                        
                        if (result1.success && result2.success) {
                          toast.success('Configurações salvas com sucesso!');
                        } else {
                          toast.error('Erro ao salvar configurações');
                        }
                      } finally {
                        setSavingSettings(false);
                      }
                    }}
                    disabled={savingSettings}
                    className="w-fit"
                  >
                    {savingSettings ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Salvar Configurações
                  </Button>
                </div>

                {/* Refresh Button Toggle */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between max-w-lg">
                    <div>
                      <h4 className="text-sm font-medium">Botão "Atualizar Página"</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Exibe o botão de atualizar no rodapé da página de revenda
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        const newValue = !showRefreshButton;
                        setShowRefreshButton(newValue);
                        await updateSetting('show_refresh_button', String(newValue));
                        toast.success(newValue ? 'Botão ativado' : 'Botão desativado');
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showRefreshButton ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showRefreshButton ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium mb-3">Preview do Botão</h4>
                  <div className="relative bg-muted/30 rounded-lg p-8 h-32">
                    <div className="absolute bottom-4 right-4 w-12 h-12 bg-whatsapp rounded-full flex items-center justify-center shadow-lg">
                      <MessageCircle className="w-6 h-6 text-foreground" fill="currentColor" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      O botão aparecerá no canto inferior direito de todas as páginas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Homepage Tab */}
          <TabsContent value="homepage">
            <HomepageEditor />
          </TabsContent>
        </Tabs>
      </main>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O usuário e todas as suas landing pages serão permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Page Dialog */}
      <AlertDialog open={!!deletePageId} onOpenChange={() => setDeletePageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Landing Page?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A landing page e todos os pedidos associados a ela serão permanentemente afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePage} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Balance Management Modal */}
      <AlertDialog open={!!balanceModalUser} onOpenChange={() => {
        setBalanceModalUser(null);
        setBalanceAmount('');
        setBalanceDescription('');
      }}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              {balanceType === 'credit' ? 'Adicionar Créditos' : 'Remover Créditos'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {balanceModalUser && (
                <div className="space-y-3 mt-2">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Usuário:</span>
                    <span className="font-medium text-foreground">{balanceModalUser.full_name || 'Sem nome'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Saldo atual:</span>
                    <span className="font-semibold text-green-500">{(balanceModalUser.balance || 0).toLocaleString('pt-BR')} créditos</span>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="balance-amount">Quantidade de Créditos</Label>
              <Input
                id="balance-amount"
                type="number"
                placeholder="Ex: 500"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="balance-description">Descrição (opcional)</Label>
              <Input
                id="balance-description"
                placeholder="Ex: Recarga manual, Bônus, etc."
                value={balanceDescription}
                onChange={(e) => setBalanceDescription(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button 
              onClick={handleUpdateBalance}
              disabled={savingBalance || !balanceAmount}
              className={balanceType === 'credit' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}
            >
              {savingBalance ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : balanceType === 'credit' ? (
                <Plus className="w-4 h-4 mr-2" />
              ) : (
                <Minus className="w-4 h-4 mr-2" />
              )}
              {balanceType === 'credit' ? 'Adicionar' : 'Remover'} Créditos
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create User Modal */}
      <AlertDialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Cadastrar Novo Usuário
            </AlertDialogTitle>
            <AlertDialogDescription>
              Crie uma conta para o usuário acessar a plataforma e o gerador de créditos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome completo</Label>
              <Input
                placeholder="Nome do usuário"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Senha *</Label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setNewUserEmail('');
              setNewUserPassword('');
              setNewUserName('');
            }}>
              Cancelar
            </AlertDialogCancel>
            <Button onClick={handleCreateUser} disabled={creatingUser}>
              {creatingUser ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              Cadastrar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
