import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Phone, Search, Plus, Loader2, AlertTriangle, Trash2, Edit, Download, RefreshCw, Users
} from 'lucide-react';
import { toast } from 'sonner';

interface Customer {
  id: string;
  name: string;
  whatsapp: string;
  email: string | null;
  credits_purchased: number;
  purchase_type: string;
  status: string;
  landing_page_id: string | null;
  order_id: string | null;
  notes: string | null;
  purchased_at: string;
  created_at: string;
}

interface CustomersTabProps {
  userId: string;
  pages: { id: string; title: string }[];
}

const LOW_CREDITS_THRESHOLD = 100;

export const CustomersTab = ({ userId, pages }: CustomersTabProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '', whatsapp: '', email: '', credits_purchased: '',
    purchase_type: 'painel', status: 'active', landing_page_id: '',
    notes: '', purchased_at: new Date().toISOString().split('T')[0],
  });

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCustomers(data || []);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '', whatsapp: '', email: '', credits_purchased: '',
      purchase_type: 'painel', status: 'active', landing_page_id: '',
      notes: '', purchased_at: new Date().toISOString().split('T')[0],
    });
    setEditingCustomer(null);
  };

  const openEdit = (c: Customer) => {
    setEditingCustomer(c);
    setForm({
      name: c.name, whatsapp: c.whatsapp, email: c.email || '',
      credits_purchased: String(c.credits_purchased),
      purchase_type: c.purchase_type, status: c.status,
      landing_page_id: c.landing_page_id || '',
      notes: c.notes || '',
      purchased_at: c.purchased_at ? c.purchased_at.split('T')[0] : '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.whatsapp) {
      toast.error('Nome e WhatsApp são obrigatórios');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        whatsapp: form.whatsapp,
        email: form.email || null,
        credits_purchased: parseInt(form.credits_purchased) || 0,
        purchase_type: form.purchase_type,
        status: form.status,
        landing_page_id: form.landing_page_id || null,
        notes: form.notes || null,
        purchased_at: form.purchased_at ? new Date(form.purchased_at).toISOString() : new Date().toISOString(),
        created_by: userId,
      };

      if (editingCustomer) {
        const { error } = await supabase
          .from('customers')
          .update(payload)
          .eq('id', editingCustomer.id);
        if (error) throw error;
        toast.success('Cliente atualizado!');
      } else {
        const { error } = await supabase
          .from('customers')
          .insert(payload);
        if (error) throw error;
        toast.success('Cliente cadastrado!');
      }

      setShowForm(false);
      resetForm();
      await fetchCustomers();
    } catch (e) {
      console.error(e);
      toast.error('Erro ao salvar cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('customers').delete().eq('id', deleteId);
      if (error) throw error;
      setCustomers(prev => prev.filter(c => c.id !== deleteId));
      toast.success('Cliente removido');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao remover cliente');
    } finally {
      setDeleteId(null);
    }
  };

  const exportCSV = () => {
    const headers = ['Nome', 'WhatsApp', 'Email', 'Créditos', 'Tipo', 'Status', 'Página', 'Data Compra', 'Observações'];
    const rows = filtered.map(c => [
      c.name, c.whatsapp, c.email || '', c.credits_purchased,
      c.purchase_type === 'painel' ? 'Painel' : 'Créditos',
      c.status, getPageName(c.landing_page_id),
      formatDate(c.purchased_at), c.notes || ''
    ]);
    const csv = [headers.join(';'), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success(`${filtered.length} clientes exportados!`);
  };

  const getPageName = (id: string | null) => {
    if (!id) return 'Manual';
    return pages.find(p => p.id === id)?.title || 'Página removida';
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const filtered = customers.filter(c => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.whatsapp.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchType = typeFilter === 'all' || c.purchase_type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const lowCreditCustomers = customers.filter(c => c.credits_purchased <= LOW_CREDITS_THRESHOLD && c.status === 'active');

  return (
    <Card className="bg-card/50">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Clientes ({customers.length})
            </CardTitle>
            <CardDescription>Cadastro e controle de clientes compradores</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV} disabled={filtered.length === 0}>
              <Download className="w-4 h-4 mr-2" />Exportar
            </Button>
            <Button variant="outline" size="sm" onClick={fetchCustomers}>
              <RefreshCw className="w-4 h-4 mr-2" />Atualizar
            </Button>
            <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />Novo Cliente
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Low credit alert */}
        {lowCreditCustomers.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-500">
                {lowCreditCustomers.length} cliente(s) com créditos baixos (≤{LOW_CREDITS_THRESHOLD})
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {lowCreditCustomers.slice(0, 3).map(c => c.name).join(', ')}
                {lowCreditCustomers.length > 3 && ` e mais ${lowCreditCustomers.length - 3}...`}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input placeholder="Buscar por nome, WhatsApp ou email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="painel">Painel</SelectItem>
              <SelectItem value="creditos">Créditos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum cliente encontrado</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>Cliente</TableHead>
                  <TableHead>Créditos</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Página</TableHead>
                  <TableHead>Data Compra</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(c => (
                  <TableRow key={c.id} className={`hover:bg-muted/20 ${c.credits_purchased <= LOW_CREDITS_THRESHOLD && c.status === 'active' ? 'bg-yellow-500/5' : ''}`}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email || c.whatsapp}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{c.credits_purchased}</span>
                        {c.credits_purchased <= LOW_CREDITS_THRESHOLD && c.status === 'active' && (
                          <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {c.purchase_type === 'painel' ? 'Painel' : 'Créditos'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        c.status === 'active' ? 'bg-green-500/20 text-green-500 border-green-500/30' :
                        c.status === 'inactive' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                        'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
                      }>
                        {c.status === 'active' ? 'Ativo' : c.status === 'inactive' ? 'Inativo' : 'Pendente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{getPageName(c.landing_page_id)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(c.purchased_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(c)} title="Editar">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="WhatsApp" className="text-green-500 hover:text-green-400"
                          onClick={() => {
                            const msg = `Olá ${c.name}! Tudo bem? Vi que seus créditos estão acabando, gostaria de renovar?`;
                            window.open(`https://wa.me/${c.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
                          }}>
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(c.id)} className="text-red-500 hover:text-red-400" title="Excluir">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={o => { if (!o) { setShowForm(false); resetForm(); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nome completo" />
            </div>
            <div>
              <Label>WhatsApp *</Label>
              <Input value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} placeholder="5511999999999" />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@exemplo.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Créditos Comprados</Label>
                <Input type="number" value={form.credits_purchased} onChange={e => setForm(p => ({ ...p, credits_purchased: e.target.value }))} />
              </div>
              <div>
                <Label>Tipo de Compra</Label>
                <Select value={form.purchase_type} onValueChange={v => setForm(p => ({ ...p, purchase_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="painel">Painel</SelectItem>
                    <SelectItem value="creditos">Créditos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data da Compra</Label>
                <Input type="date" value={form.purchased_at} onChange={e => setForm(p => ({ ...p, purchased_at: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Página Associada</Label>
              <Select value={form.landing_page_id} onValueChange={v => setForm(p => ({ ...p, landing_page_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma (Manual)</SelectItem>
                  {pages.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Anotações sobre o cliente..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingCustomer ? 'Salvar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
