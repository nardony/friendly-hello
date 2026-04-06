import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { 
  ShoppingCart, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Phone,
  Loader2,
  TrendingUp,
  Check,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_whatsapp: string;
  tier_name: string;
  credits: number;
  price: number;
  status: string;
  created_at: string;
  coupon_code: string | null;
}

interface SalesPanelProps {
  pageId: string;
  pageTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ConfirmAction {
  orderId: string;
  customerName: string;
  action: 'approved' | 'rejected';
}

export const SalesPanel = ({ pageId, pageTitle, open, onOpenChange }: SalesPanelProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    revenue: 0
  });

  const normalizeStatus = (status: string) => {
    const s = (status || '').toLowerCase().trim();
    if (s === 'pendente') return 'pending';
    if (s === 'aprovado') return 'approved';
    if (s === 'rejeitado') return 'rejected';
    return s;
  };

  useEffect(() => {
    if (open && pageId) {
      fetchOrders();
    }
  }, [open, pageId]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('landing_page_id', pageId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const normalizedOrders = (data || []).map((o) => ({
        ...o,
        status: normalizeStatus(o.status),
      }));

      setOrders(normalizedOrders);

      const totalOrders = normalizedOrders.length;
      const pendingOrders = normalizedOrders.filter((o) => o.status === 'pending').length;
      const approvedOrders = normalizedOrders.filter((o) => o.status === 'approved').length;
      const totalRevenue = normalizedOrders
        .filter((o) => o.status === 'approved')
        .reduce((acc, o) => acc + o.price, 0);

      setStats({
        total: totalOrders,
        pending: pendingOrders,
        approved: approvedOrders,
        revenue: totalRevenue
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      ));

      const updatedOrders = orders.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      );
      const pendingOrders = updatedOrders.filter(o => o.status === 'pending').length;
      const approvedOrders = updatedOrders.filter(o => o.status === 'approved').length;
      const totalRevenue = updatedOrders.filter(o => o.status === 'approved').reduce((acc, o) => acc + o.price, 0);

      setStats(prev => ({
        ...prev,
        pending: pendingOrders,
        approved: approvedOrders,
        revenue: totalRevenue
      }));

      toast.success(newStatus === 'approved' ? 'Pedido aprovado com sucesso!' : 'Pedido rejeitado.');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Erro ao atualizar pedido');
    } finally {
      setUpdating(false);
      setConfirmAction(null);
    }
  };

  const handleConfirmAction = () => {
    if (confirmAction) {
      handleUpdateStatus(confirmAction.orderId, confirmAction.action);
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const getStatusBadge = (status: string) => {
    switch (normalizeStatus(status)) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Aprovado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Pendente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-5 h-5 text-primary" />
              Vendas - {pageTitle}
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <ShoppingCart className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total de Pedidos</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Clock className="w-5 h-5 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <CheckCircle className="w-5 h-5 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">{stats.approved}</p>
                  <p className="text-xs text-muted-foreground">Aprovados</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <DollarSign className="w-5 h-5 mx-auto mb-2 text-accent" />
                  <p className="text-2xl font-bold">{formatPrice(stats.revenue)}</p>
                  <p className="text-xs text-muted-foreground">Faturamento</p>
                </div>
              </div>

              {/* Orders Table */}
              {orders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum pedido encontrado para esta página.</p>
                </div>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead>Cliente</TableHead>
                        <TableHead>Pacote</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-muted/20">
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{order.customer_name}</p>
                              <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{order.tier_name}</p>
                              <p className="text-xs text-muted-foreground">{order.credits} créditos</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{formatPrice(order.price)}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {normalizeStatus(order.status) === 'pending' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setConfirmAction({
                                      orderId: order.id,
                                      customerName: order.customer_name,
                                      action: 'approved'
                                    })}
                                    className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
                                    title="Aprovar pedido"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setConfirmAction({
                                      orderId: order.id,
                                      customerName: order.customer_name,
                                      action: 'rejected'
                                    })}
                                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                    title="Rejeitar pedido"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const msg = `Olá ${order.customer_name}!`;
                                  window.open(`https://wa.me/${order.customer_whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
                                }}
                                className="text-green-500 hover:text-green-400"
                                title="Enviar WhatsApp"
                              >
                                <Phone className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {confirmAction?.action === 'approved' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Aprovar Pedido
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  Rejeitar Pedido
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.action === 'approved' ? (
                <>
                  Tem certeza que deseja <strong className="text-green-500">aprovar</strong> o pedido de{' '}
                  <strong>{confirmAction?.customerName}</strong>?
                  <br />
                  <span className="text-xs text-muted-foreground mt-2 block">
                    Os créditos serão adicionados automaticamente ao saldo do cliente.
                  </span>
                </>
              ) : (
                <>
                  Tem certeza que deseja <strong className="text-red-500">rejeitar</strong> o pedido de{' '}
                  <strong>{confirmAction?.customerName}</strong>?
                  <br />
                  <span className="text-xs text-muted-foreground mt-2 block">
                    Esta ação pode ser revertida alterando o status manualmente.
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={updating}
              className={confirmAction?.action === 'approved' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
              }
            >
              {updating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : confirmAction?.action === 'approved' ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              {confirmAction?.action === 'approved' ? 'Aprovar' : 'Rejeitar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
