import { useState, useEffect, useCallback } from 'react';

// Slider that only saves on release (prevents page jump)
const DeferredSlider = ({ value, onCommit, label, hint, min = 0, max = 100 }: {
  value: number; onCommit: (v: number) => void; label: string; hint?: string; min?: number; max?: number;
}) => {
  const [local, setLocal] = useState(value);
  useEffect(() => { setLocal(value); }, [value]);
  return (
    <div className="space-y-2">
      <Label>{label}: {local}%</Label>
      <input
        type="range"
        min={min}
        max={max}
        value={local}
        onChange={(e) => setLocal(Number(e.target.value))}
        onMouseUp={() => onCommit(local)}
        onTouchEnd={() => onCommit(local)}
        className="w-full accent-primary"
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
};
import { ExternalLink, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Save, Loader2, Star, CreditCard, MessageSquare, ShoppingCart, Bell, Eye, Menu, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useHomepageSettings, HeroSettings, CheckoutSettings, SocialProofSettings, SocialProofCustomer, CustomPackageOption, GuaranteeSettings, FAQSettings, FAQItem, SectionsVisibility, MenuVisibility, TrackingSettings } from '@/hooks/useHomepageSettings';
import { PricingTier } from '@/components/PricingTiersSection';
import { ImageUpload } from '@/components/ImageUpload';

export const HomepageEditor = () => {
  const { settings, loading, updateSetting, refetch } = useHomepageSettings();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  
  // Local state for editing
  const [hero, setHero] = useState<HeroSettings>(settings.hero);
  const [tiers, setTiers] = useState<PricingTier[]>(settings.pricing_tiers);
  const [pixKey, setPixKey] = useState(settings.pix_key);
  const [pixName, setPixName] = useState(settings.pix_name);
  const [whatsappNumber, setWhatsappNumber] = useState(() => {
    const num = settings.whatsapp_number;
    const codes = ['55','1','44','351','34','49','33','39','81','91','61','52','54','56','57'];
    for (const c of codes.sort((a, b) => b.length - a.length)) {
      if (num.startsWith(c)) return num.slice(c.length);
    }
    return num;
  });
  const [whatsappCountryCode, setWhatsappCountryCode] = useState(() => {
    const num = settings.whatsapp_number;
    const codes = ['55','1','44','351','34','49','33','39','81','91','61','52','54','56','57'];
    for (const c of codes.sort((a, b) => b.length - a.length)) {
      if (num.startsWith(c)) return `+${c}`;
    }
    return '+55';
  });
  const [checkout, setCheckout] = useState<CheckoutSettings>(settings.checkout);
  const [socialProof, setSocialProof] = useState<SocialProofSettings>(settings.social_proof);
  const [socialProofCreditsInput, setSocialProofCreditsInput] = useState(settings.social_proof.credit_options.join(', '));
  const [customPackageOptions, setCustomPackageOptions] = useState<CustomPackageOption[]>(settings.custom_package_options);
  const [guarantee, setGuarantee] = useState<GuaranteeSettings>(settings.guarantee);
  const [faq, setFaq] = useState<FAQSettings>(settings.faq);
  const [sectionsVisibility, setSectionsVisibility] = useState<SectionsVisibility>(settings.sections_visibility);
  const [menuVisibility, setMenuVisibility] = useState<MenuVisibility>(settings.menu_visibility);
  const [tracking, setTracking] = useState<TrackingSettings>(settings.tracking);

  useEffect(() => {
    setHero(settings.hero);
    setTiers(settings.pricing_tiers);
    setPixKey(settings.pix_key);
    setPixName(settings.pix_name);
    {
      const num = settings.whatsapp_number;
      const codes = ['55','1','44','351','34','49','33','39','81','91','61','52','54','56','57'];
      let found = false;
      for (const c of codes.sort((a, b) => b.length - a.length)) {
        if (num.startsWith(c)) {
          setWhatsappCountryCode(`+${c}`);
          setWhatsappNumber(num.slice(c.length));
          found = true;
          break;
        }
      }
      if (!found) {
        setWhatsappCountryCode('+55');
        setWhatsappNumber(num);
      }
    }
    setCheckout(settings.checkout);
    setSocialProof(settings.social_proof);
    setSocialProofCreditsInput(settings.social_proof.credit_options.join(', '));
    setCustomPackageOptions(settings.custom_package_options);
    setGuarantee(settings.guarantee);
    setFaq(settings.faq);
    setSectionsVisibility(settings.sections_visibility);
    setMenuVisibility(settings.menu_visibility);
    setTracking(settings.tracking);
  }, [settings]);

  const handleSaveHero = async () => {
    setSaving(true);
    const result = await updateSetting('hero', hero);
    if (result.success) {
      toast.success('Hero atualizado com sucesso!');
    } else {
      toast.error('Erro ao salvar: ' + result.error);
    }
    setSaving(false);
  };

  const handleSaveTiers = async () => {
    setSaving(true);
    const result = await updateSetting('pricing_tiers', tiers);
    await updateSetting('custom_package_options', customPackageOptions);
    if (result.success) {
      toast.success('Pacotes atualizados com sucesso!');
    } else {
      toast.error('Erro ao salvar: ' + result.error);
    }
    setSaving(false);
  };

  const handleSavePayment = async () => {
    setSaving(true);
    await updateSetting('pix_key', pixKey);
    await updateSetting('pix_name', pixName);
    const fullNumber = `${whatsappCountryCode.replace('+', '')}${whatsappNumber}`;
    const result = await updateSetting('whatsapp_number', fullNumber);
    if (result.success) {
      toast.success('Configurações de pagamento salvas!');
    } else {
      toast.error('Erro ao salvar: ' + result.error);
    }
    setSaving(false);
  };

  const addTier = () => {
    const newTier: PricingTier = {
      id: `tier-${Date.now()}`,
      name: 'Novo Pacote',
      credits: 1000,
      price_original: 100,
      price_current: 49.99,
      available: 50,
      sales: 0,
      checkout_link: '/checkout',
      highlight: false
    };
    setTiers([...tiers, newTier]);
  };

  const removeTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, field: keyof PricingTier, value: any) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setTiers(newTiers);
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Página Principal</h2>
          <p className="text-muted-foreground">Edite o conteúdo da homepage</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open('/', '_blank')}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Página
          </Button>
          <Button variant="outline" onClick={refetch}>
            Atualizar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="sections">Seções</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="tiers">Pacotes</TabsTrigger>
          <TabsTrigger value="checkout">Checkout</TabsTrigger>
          <TabsTrigger value="social">Prova Social</TabsTrigger>
          <TabsTrigger value="guarantee">Garantia</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="payment">Pagamento</TabsTrigger>
          <TabsTrigger value="tracking">Rastreamento</TabsTrigger>
          <TabsTrigger value="meta-pixel">Meta Pixel</TabsTrigger>
        </TabsList>

        {/* Sections Visibility Tab */}
        <TabsContent value="sections" className="space-y-4">
          {/* Logo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Logo do Site
              </CardTitle>
              <CardDescription>Altere a logo exibida no cabeçalho do site</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                label="Logo"
                value={settings.logo_url}
                onChange={async (url) => {
                  const result = await updateSetting('logo_url', url);
                  if (result.success) {
                    toast.success('Logo atualizada com sucesso!');
                  } else {
                    toast.error('Erro ao salvar logo');
                  }
                }}
                folder="logos"
                aspectRatio="aspect-[4/1]"
                placeholder="Cole a URL da logo ou faça upload"
              />
            </CardContent>
          </Card>

          {/* Background Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Fundo do Site
              </CardTitle>
              <CardDescription>Escolha entre imagem de fundo ou gradiente com texto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Toggle: text bg mode */}
              <div className="flex items-center justify-between">
                <Label>Usar gradiente com texto (ao invés de imagem)</Label>
                <Switch
                  checked={settings.background_text.enabled}
                  onCheckedChange={async (checked) => {
                    const updated = { ...settings.background_text, enabled: checked };
                    const result = await updateSetting('background_text', updated);
                    if (result.success) toast.success(checked ? 'Fundo com texto ativado!' : 'Fundo com imagem ativado!');
                  }}
                />
              </div>

              {settings.background_text.enabled ? (
                <div className="space-y-4 border rounded-lg p-4 border-border">
                  <div className="space-y-2">
                    <Label>Texto do Fundo (use Enter para pular linha)</Label>
                    <Textarea
                      value={settings.background_text.text}
                      onChange={async (e) => {
                        const updated = { ...settings.background_text, text: e.target.value };
                        await updateSetting('background_text', updated);
                      }}
                      placeholder="CRÉDITOS INFINITOS"
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fonte</Label>
                      <select
                        value={settings.background_text.font_family || 'Inter'}
                        onChange={async (e) => {
                          const updated = { ...settings.background_text, font_family: e.target.value };
                          await updateSetting('background_text', updated);
                        }}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Arial">Arial</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Impact">Impact</option>
                        <option value="Comic Sans MS">Comic Sans MS</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tamanho</Label>
                      <select
                        value={settings.background_text.font_size || '4xl'}
                        onChange={async (e) => {
                          const updated = { ...settings.background_text, font_size: e.target.value };
                          await updateSetting('background_text', updated);
                        }}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="xl">Pequeno</option>
                        <option value="2xl">Médio</option>
                        <option value="3xl">Grande</option>
                        <option value="4xl">Extra Grande</option>
                        <option value="5xl">Enorme</option>
                        <option value="6xl">Gigante</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Cor da Fonte</Label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={settings.background_text.font_color || '#ffffff'}
                          onChange={async (e) => {
                            const updated = { ...settings.background_text, font_color: e.target.value };
                            await updateSetting('background_text', updated);
                          }}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <Input
                          value={settings.background_text.font_color || '#ffffff'}
                          onChange={async (e) => {
                            const updated = { ...settings.background_text, font_color: e.target.value };
                            await updateSetting('background_text', updated);
                          }}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <DeferredSlider
                    value={settings.background_text.opacity ?? 100}
                    onCommit={async (val) => {
                      const updated = { ...settings.background_text, opacity: val };
                      await updateSetting('background_text', updated);
                    }}
                    label="Opacidade do Texto"
                    hint="0% = invisível • 100% = totalmente visível"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cor Gradiente (início)</Label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={settings.background_text.gradient_from}
                          onChange={async (e) => {
                            const updated = { ...settings.background_text, gradient_from: e.target.value };
                            await updateSetting('background_text', updated);
                          }}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <Input
                          value={settings.background_text.gradient_from}
                          onChange={async (e) => {
                            const updated = { ...settings.background_text, gradient_from: e.target.value };
                            await updateSetting('background_text', updated);
                          }}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Cor Gradiente (fim)</Label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={settings.background_text.gradient_to}
                          onChange={async (e) => {
                            const updated = { ...settings.background_text, gradient_to: e.target.value };
                            await updateSetting('background_text', updated);
                          }}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <Input
                          value={settings.background_text.gradient_to}
                          onChange={async (e) => {
                            const updated = { ...settings.background_text, gradient_to: e.target.value };
                            await updateSetting('background_text', updated);
                          }}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <ImageUpload
                    label="Imagem de Fundo"
                    value={settings.background_url}
                    onChange={async (url) => {
                      const result = await updateSetting('background_url', url);
                      if (result.success) toast.success('Fundo atualizado com sucesso!');
                      else toast.error('Erro ao salvar fundo');
                    }}
                    folder="backgrounds"
                    aspectRatio="aspect-video"
                    placeholder="Cole a URL do fundo ou faça upload"
                  />
                </>
              )}

              <DeferredSlider
                value={settings.background_overlay}
                onCommit={async (val) => {
                  await updateSetting('background_overlay', val);
                }}
                label="Filtro Escuro (Overlay)"
                hint="0% = sem filtro (natural) • 100% = totalmente escuro"
              />
            </CardContent>
          </Card>

          {/* Tool Progress Bar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Barra de Progresso (Nova Ferramenta)
              </CardTitle>
              <CardDescription>Exiba uma barra de progresso fixa no topo do site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Ativar barra de progresso</Label>
                <Switch
                  checked={settings.tool_progress.enabled}
                  onCheckedChange={async (checked) => {
                    const updated = { ...settings.tool_progress, enabled: checked };
                    const result = await updateSetting('tool_progress', updated);
                    if (result.success) {
                      toast.success(checked ? 'Barra ativada!' : 'Barra desativada!');
                    } else {
                      toast.error('Erro ao salvar');
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Texto / Label</Label>
                <Input
                  value={settings.tool_progress.label}
                  onChange={async (e) => {
                    const updated = { ...settings.tool_progress, label: e.target.value };
                    await updateSetting('tool_progress', updated);
                  }}
                  placeholder="🚀 Nova Ferramenta"
                />
              </div>
              <DeferredSlider
                value={settings.tool_progress.percentage}
                onCommit={async (val) => {
                  const updated = { ...settings.tool_progress, percentage: val };
                  await updateSetting('tool_progress', updated);
                }}
                label="Porcentagem"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Visibilidade das Seções
              </CardTitle>
              <CardDescription>Ative ou desative as seções exibidas na página principal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {([
                { key: 'hero' as const, label: '🏠 Hero (Créditos Infinitos)' },
                { key: 'hero_prices' as const, label: '💲 Preços no Hero (Revenda)' },
                { key: 'pricing' as const, label: '💰 Pacotes de Preços' },
                { key: 'features' as const, label: '✨ Funcionalidades' },
                { key: 'why_choose' as const, label: '✅ Por que Escolher' },
                { key: 'how_it_works' as const, label: '🔧 Como Funciona' },
                { key: 'video' as const, label: '🎬 Vídeo' },
                { key: 'video_hide_controls' as const, label: '🎮 Ocultar Comandos do Vídeo' },
                { key: 'secure_purchase' as const, label: '🛡️ Compra Segura' },
                { key: 'testimonials' as const, label: '💬 Depoimentos' },
                { key: 'guarantee' as const, label: '🏅 Garantia' },
                { key: 'stats' as const, label: '📊 Estatísticas' },
                { key: 'faq' as const, label: '❓ FAQ' },
                { key: 'final_cta' as const, label: '🎯 CTA Final' },
              ]).map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <Label className="text-sm font-medium">{label}</Label>
                  <Switch
                    checked={sectionsVisibility[key]}
                    onCheckedChange={async (checked) => {
                      const updated = { ...sectionsVisibility, [key]: checked };
                      setSectionsVisibility(updated);
                      const result = await updateSetting('sections_visibility', updated);
                      if (result.success) {
                        toast.success(`${label} ${checked ? 'ativado' : 'desativado'}!`);
                      } else {
                        toast.error('Erro ao salvar');
                        setSectionsVisibility(sectionsVisibility);
                      }
                    }}
                  />
                </div>
              ))}


            </CardContent>
          </Card>

          {/* Menu Buttons Visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Menu className="w-5 h-5" />
                Visibilidade dos Botões do Menu
              </CardTitle>
              <CardDescription>Ative ou desative os botões exibidos no menu de navegação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {([
                { key: 'painel_gerador' as const, label: '🟣 Painel Gerador' },
                { key: 'entrar_conta' as const, label: '🔑 Entrar na Conta / Sair' },
                { key: 'compra_creditos' as const, label: '💚 Compra de Créditos' },
                { key: 'como_funciona' as const, label: '🔧 Como Funciona' },
                { key: 'faq' as const, label: '❓ FAQ' },
                { key: 'install' as const, label: '📥 Instalar App' },
                { key: 'idioma' as const, label: '🌐 Idioma' },
              ]).map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <Label className="text-sm font-medium">{label}</Label>
                  <Switch
                    checked={menuVisibility[key]}
                    onCheckedChange={async (checked) => {
                      const updated = { ...menuVisibility, [key]: checked };
                      setMenuVisibility(updated);
                      const result = await updateSetting('menu_visibility', updated);
                      if (result.success) {
                        toast.success(`${label} ${checked ? 'ativado' : 'desativado'}!`);
                      } else {
                        toast.error('Erro ao salvar');
                        setMenuVisibility(menuVisibility);
                      }
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Button
            onClick={async () => {
              setSaving(true);
              const r1 = await updateSetting('sections_visibility', sectionsVisibility);
              const r2 = await updateSetting('menu_visibility', menuVisibility);
              if (r1.success && r2.success) {
                toast.success('Seções salvas com sucesso!');
              } else {
                toast.error('Erro ao salvar seções');
              }
              setSaving(false);
            }}
            className="w-full"
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar Seções
          </Button>
        </TabsContent>

        {/* Hero Tab */}
        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seção Hero</CardTitle>
              <CardDescription>Configure o título, subtítulo e preços do topo da página</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Título Principal</Label>
                  <Input
                    value={hero.title}
                    onChange={(e) => setHero({ ...hero, title: e.target.value })}
                    placeholder="Créditos Infinitos na Lovable."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Título em Destaque (Gradiente)</Label>
                  <Input
                    value={hero.title_highlight}
                    onChange={(e) => setHero({ ...hero, title_highlight: e.target.value })}
                    placeholder="Simples. Rápido. Automático."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subtítulo</Label>
                <Textarea
                  value={hero.subtitle}
                  onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                  placeholder="Use nosso painel exclusivo..."
                  rows={2}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Preço Original (De)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={hero.price_original}
                    onChange={(e) => setHero({ ...hero, price_original: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço Atual (Por)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={hero.price_current}
                    onChange={(e) => setHero({ ...hero, price_current: Number(e.target.value) })}
                  />
                </div>
                 <div className="space-y-2">
                  <Label>Texto do Botão</Label>
                  <Input
                    value={hero.cta_text}
                    onChange={(e) => setHero({ ...hero, cta_text: e.target.value })}
                    placeholder="Comprar Agora"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Texto do Badge (ex: Oferta Limitada)</Label>
                  <Input
                    value={hero.badge_text || ''}
                    onChange={(e) => setHero({ ...hero, badge_text: e.target.value })}
                    placeholder="Oferta Limitada"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Texto de Renovação Diária (deixe vazio para ocultar)</Label>
                  <Input
                    value={hero.daily_renewal_text || ''}
                    onChange={(e) => setHero({ ...hero, daily_renewal_text: e.target.value })}
                    placeholder="🔄 Renovação diária de 5k créditos!"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Texto do Banner de Promoção (exibido acima do cronômetro)</Label>
                  <Input
                    value={(hero as any).promo_banner_text || ''}
                    onChange={(e) => setHero({ ...hero, promo_banner_text: e.target.value } as any)}
                    placeholder="🔥 PROMOÇÃO DE CRÉDITOS 🔥"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Modo do Cronômetro</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm"
                    value={(hero as any).countdown_mode || 'end_of_day'}
                    onChange={(e) => setHero({ ...hero, countdown_mode: e.target.value as any } as any)}
                  >
                    <option value="end_of_day">Até o fim do dia (meia-noite)</option>
                    <option value="custom">Data/hora personalizada</option>
                  </select>
                </div>
                {(hero as any).countdown_mode === 'custom' && (
                  <div className="space-y-2">
                    <Label>Data/Hora limite da promoção</Label>
                    <Input
                      type="datetime-local"
                      value={(hero as any).countdown_deadline || ''}
                      onChange={(e) => setHero({ ...hero, countdown_deadline: e.target.value } as any)}
                    />
                  </div>
                )}
              </div>

              {/* Extra Prices */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Preços Extras (exibidos abaixo do principal)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setHero({
                      ...hero,
                      extra_prices: [...(hero.extra_prices || []), { price_original: 0, price_current: 0, label: '' }]
                    })}
                  >
                    + Adicionar Preço
                  </Button>
                </div>
                {(hero.extra_prices || []).map((ep, idx) => (
                  <div key={idx} className="grid gap-3 md:grid-cols-4 items-end bg-muted/30 p-3 rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-xs">Rótulo (opcional)</Label>
                      <Input
                        value={ep.label || ''}
                        onChange={(e) => {
                          const arr = [...(hero.extra_prices || [])];
                          arr[idx] = { ...arr[idx], label: e.target.value };
                          setHero({ ...hero, extra_prices: arr });
                        }}
                        placeholder="Ex: Plano Mensal"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Preço Original</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={ep.price_original}
                        onChange={(e) => {
                          const arr = [...(hero.extra_prices || [])];
                          arr[idx] = { ...arr[idx], price_original: Number(e.target.value) };
                          setHero({ ...hero, extra_prices: arr });
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Preço Atual</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={ep.price_current}
                        onChange={(e) => {
                          const arr = [...(hero.extra_prices || [])];
                          arr[idx] = { ...arr[idx], price_current: Number(e.target.value) };
                          setHero({ ...hero, extra_prices: arr });
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const arr = (hero.extra_prices || []).filter((_, i) => i !== idx);
                        setHero({ ...hero, extra_prices: arr });
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                ))}
              </div>

              {/* Extra Renewals */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Renovações Extras</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setHero({
                      ...hero,
                      extra_renewals: [...(hero.extra_renewals || []), { text: '' }]
                    })}
                  >
                    + Adicionar Renovação
                  </Button>
                </div>
                {(hero.extra_renewals || []).map((er, idx) => (
                  <div key={idx} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Texto da Renovação</Label>
                      <Input
                        value={er.text}
                        onChange={(e) => {
                          const arr = [...(hero.extra_renewals || [])];
                          arr[idx] = { ...arr[idx], text: e.target.value };
                          setHero({ ...hero, extra_renewals: arr });
                        }}
                        placeholder="🔄 Renovação diária de 10k créditos!"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const arr = (hero.extra_renewals || []).filter((_, i) => i !== idx);
                        setHero({ ...hero, extra_renewals: arr });
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                ))}
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-muted-foreground line-through">{formatPrice(hero.price_original)}</span>
                  <span className="text-2xl font-bold text-accent">{formatPrice(hero.price_current)}</span>
                  {hero.price_original > hero.price_current && (
                    <span className="bg-accent/20 text-accent text-xs px-2 py-1 rounded">
                      Economia de {Math.round(((hero.price_original - hero.price_current) / hero.price_original) * 100)}%
                    </span>
                  )}
                </div>
                {(hero.extra_prices || []).map((ep, idx) => (
                  <div key={idx} className="flex items-center gap-3 flex-wrap mt-2">
                    {ep.label && <span className="text-xs text-muted-foreground">{ep.label}:</span>}
                    <span className="text-muted-foreground line-through text-sm">{formatPrice(ep.price_original)}</span>
                    <span className="text-lg font-bold text-accent">{formatPrice(ep.price_current)}</span>
                  </div>
                ))}
              </div>

              <Button onClick={handleSaveHero} disabled={saving} className="w-full">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Hero
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tiers Tab */}
        <TabsContent value="tiers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pacotes de Créditos</span>
                <Button onClick={addTier} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Pacote
                </Button>
              </CardTitle>
              <CardDescription>Configure os pacotes de créditos exibidos na página principal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tiers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum pacote configurado. Clique em "Adicionar Pacote" para começar.
                </div>
              ) : (
                <div className="space-y-4">
                  {tiers.map((tier, index) => (
                    <Card key={tier.id} className={tier.highlight ? 'ring-2 ring-primary' : ''}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 space-y-4">
                            <div className="grid gap-4 md:grid-cols-4">
                              <div className="space-y-2">
                                <Label>Nome do Pacote</Label>
                                <Input
                                  value={tier.name}
                                  onChange={(e) => updateTier(index, 'name', e.target.value)}
                                  placeholder="Pacote Básico"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Créditos</Label>
                                <Input
                                  type="number"
                                  value={tier.credits}
                                  onChange={(e) => updateTier(index, 'credits', Number(e.target.value))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Bônus de Créditos</Label>
                                <Input
                                  type="number"
                                  value={tier.bonus_credits || 0}
                                  onChange={(e) => updateTier(index, 'bonus_credits', Number(e.target.value))}
                                  placeholder="0"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Renovação Diária</Label>
                                <Input
                                  type="number"
                                  value={tier.daily_renewal || 0}
                                  onChange={(e) => updateTier(index, 'daily_renewal', Number(e.target.value))}
                                  placeholder="0 = sem renovação"
                                />
                              </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-4">
                              <div className="space-y-2">
                                <Label>Preço Original (De)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={tier.price_original}
                                  onChange={(e) => updateTier(index, 'price_original', Number(e.target.value))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Preço Atual (Por)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={tier.price_current}
                                  onChange={(e) => updateTier(index, 'price_current', Number(e.target.value))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Disponíveis</Label>
                                <Input
                                  type="number"
                                  value={tier.available}
                                  onChange={(e) => updateTier(index, 'available', Number(e.target.value))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Vendas</Label>
                                <Input
                                  type="number"
                                  value={tier.sales}
                                  onChange={(e) => updateTier(index, 'sales', Number(e.target.value))}
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={tier.highlight}
                                  onCheckedChange={(checked) => updateTier(index, 'highlight', checked)}
                                />
                                <Label className="flex items-center gap-1">
                                  <Star className="w-4 h-4" />
                                  Destacar (Mais Popular)
                                </Label>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeTier(index)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remover
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Custom Package Options */}
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Pacote Personalizado (Opções)</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setCustomPackageOptions([...customPackageOptions, { credits: 100, price: 10 }])}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Opção
                    </Button>
                  </CardTitle>
                  <CardDescription>Configure os valores de créditos e preços disponíveis no card personalizado</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {customPackageOptions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhuma opção configurada. O card personalizado não será exibido.</p>
                  ) : (
                    <div className="space-y-2">
                      {customPackageOptions.map((opt, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="flex-1 space-y-1">
                            <Label className="text-xs">Créditos</Label>
                            <Input
                              type="number"
                              value={opt.credits}
                              onChange={(e) => {
                                const updated = [...customPackageOptions];
                                updated[index] = { ...updated[index], credits: Number(e.target.value) };
                                setCustomPackageOptions(updated);
                              }}
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <Label className="text-xs">Preço (R$)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={opt.price}
                              onChange={(e) => {
                                const updated = [...customPackageOptions];
                                updated[index] = { ...updated[index], price: Number(e.target.value) };
                                setCustomPackageOptions(updated);
                              }}
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <Label className="text-xs">Bônus</Label>
                            <Input
                              type="number"
                              value={opt.bonus_credits || 0}
                              onChange={(e) => {
                                const updated = [...customPackageOptions];
                                updated[index] = { ...updated[index], bonus_credits: Number(e.target.value) };
                                setCustomPackageOptions(updated);
                              }}
                              placeholder="0"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="mt-5"
                            onClick={() => setCustomPackageOptions(customPackageOptions.filter((_, i) => i !== index))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button onClick={handleSaveTiers} disabled={saving} className="w-full">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Pacotes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings Tab */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Configurações PIX
              </CardTitle>
              <CardDescription>Configure sua chave PIX para receber pagamentos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Chave PIX 🔒</Label>
                  <Input
                    value={pixKey ? pixKey.replace(/(.{3}).*(.{3})/, '$1•••••$2') : ''}
                    readOnly
                    disabled
                    className="opacity-60 cursor-not-allowed"
                    title="Campo protegido — não pode ser alterado"
                  />
                  <p className="text-xs text-muted-foreground">🔒 Protegido — entre em contato com o administrador para alterações</p>
                </div>

                <div>
                  <Label>Nome do Beneficiário 🔒</Label>
                  <Input
                    value={pixName ? pixName.replace(/(.{3}).*(.{3})/, '$1•••••$2') : ''}
                    readOnly
                    disabled
                    className="opacity-60 cursor-not-allowed"
                    title="Campo protegido — não pode ser alterado"
                  />
                  <p className="text-xs text-muted-foreground">🔒 Protegido — entre em contato com o administrador para alterações</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                WhatsApp
              </CardTitle>
              <CardDescription>Configure o número para receber pedidos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Número do WhatsApp</Label>
                <div className="flex gap-2">
                  <select
                    value={whatsappCountryCode}
                    onChange={(e) => setWhatsappCountryCode(e.target.value)}
                    className="bg-background border border-border rounded-md px-2 py-2 text-sm text-foreground w-[110px] flex-shrink-0"
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
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="48999999999"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Selecione o país e digite o número sem o código do país
                </p>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSavePayment} disabled={saving} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar Configurações de Pagamento
          </Button>
        </TabsContent>

        {/* Social Proof Tab */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Prova Social
              </CardTitle>
              <CardDescription>Configure as notificações de compras recentes exibidas na página</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Ativar Prova Social</Label>
                  <p className="text-xs text-muted-foreground">Exibir notificações de compras recentes</p>
                </div>
                <Switch
                  checked={socialProof.enabled}
                  onCheckedChange={(checked) => setSocialProof({ ...socialProof, enabled: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Nome do Produto</Label>
                <Input
                  value={socialProof.product_name}
                  onChange={(e) => setSocialProof({ ...socialProof, product_name: e.target.value })}
                  placeholder="o Gerador"
                />
                <p className="text-xs text-muted-foreground">Ex: "Carlos M. adquiriu <strong>o Gerador</strong>"</p>
              </div>

              <div className="space-y-2">
                <Label>Opções de Créditos (separados por vírgula)</Label>
                <Input
                  value={socialProofCreditsInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSocialProofCreditsInput(value);

                    const parsed = value
                      .split(',')
                      .map((v) => Number(v.trim()))
                      .filter((v) => !Number.isNaN(v) && v > 0);

                    if (parsed.length > 0 || value.trim() === '') {
                      setSocialProof({ ...socialProof, credit_options: parsed });
                    }
                  }}
                  placeholder="200, 500, 1000, 2000"
                />
                <p className="text-xs text-muted-foreground">Valores que aparecerão aleatoriamente nas notificações</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Clientes (Nomes Fictícios)</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSocialProof({
                      ...socialProof,
                      customers: [...socialProof.customers, { name: '', city: '', state: '', product: 'gerador' }]
                    })}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
                {socialProof.customers.map((customer, index) => (
                  <div key={index} className="grid grid-cols-[1fr_1fr_80px_100px_auto] gap-2 items-center">
                    <Input
                      value={customer.name}
                      onChange={(e) => {
                        const updated = [...socialProof.customers];
                        updated[index] = { ...updated[index], name: e.target.value };
                        setSocialProof({ ...socialProof, customers: updated });
                      }}
                      placeholder="Nome"
                    />
                    <Input
                      value={customer.city}
                      onChange={(e) => {
                        const updated = [...socialProof.customers];
                        updated[index] = { ...updated[index], city: e.target.value };
                        setSocialProof({ ...socialProof, customers: updated });
                      }}
                      placeholder="Cidade"
                    />
                    <Input
                      value={customer.state}
                      onChange={(e) => {
                        const updated = [...socialProof.customers];
                        updated[index] = { ...updated[index], state: e.target.value };
                        setSocialProof({ ...socialProof, customers: updated });
                      }}
                      placeholder="UF"
                    />
                    <select
                      value={customer.product || 'gerador'}
                      onChange={(e) => {
                        const updated = [...socialProof.customers];
                        updated[index] = { ...updated[index], product: e.target.value as 'gerador' | 'creditos' };
                        setSocialProof({ ...socialProof, customers: updated });
                      }}
                      className="h-10 rounded-md border border-input bg-background px-2 text-sm"
                    >
                      <option value="gerador">Gerador</option>
                      <option value="creditos">Créditos</option>
                    </select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSocialProof({
                          ...socialProof,
                          customers: socialProof.customers.filter((_, i) => i !== index)
                        });
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button 
                onClick={async () => {
                  setSaving(true);
                  const result = await updateSetting('social_proof', socialProof);
                  if (result.success) {
                    toast.success('Prova social atualizada com sucesso!');
                  } else {
                    toast.error('Erro ao salvar: ' + result.error);
                  }
                  setSaving(false);
                }} 
                disabled={saving} 
                className="w-full"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Prova Social
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Checkout Tab */}
        <TabsContent value="checkout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Página de Checkout
              </CardTitle>
              <CardDescription>Edite os textos e benefícios exibidos na página de checkout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Subtítulo do Produto</Label>
                  <Input
                    value={checkout.product_subtitle}
                    onChange={(e) => setCheckout({ ...checkout, product_subtitle: e.target.value })}
                    placeholder="Acesso Completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição do Produto</Label>
                  <Input
                    value={checkout.product_description}
                    onChange={(e) => setCheckout({ ...checkout, product_description: e.target.value })}
                    placeholder="Acesso vitalício • Sem mensalidades"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Texto do Badge</Label>
                  <Input
                    value={checkout.badge_text}
                    onChange={(e) => setCheckout({ ...checkout, badge_text: e.target.value })}
                    placeholder="Oferta Limitada"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Texto do Botão</Label>
                  <Input
                    value={checkout.button_text}
                    onChange={(e) => setCheckout({ ...checkout, button_text: e.target.value })}
                    placeholder="COMPRAR AGORA"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Benefícios (um por linha)</Label>
                <Textarea
                  value={checkout.benefits.join('\n')}
                  onChange={(e) => setCheckout({ ...checkout, benefits: e.target.value.split('\n').filter(b => b.trim()) })}
                  placeholder={"Acesso Vitalício ao Painel\nGerador de Créditos Ilimitado\nSuporte Premium 24/7"}
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  Cada linha será exibida como um item com ícone ✓
                </p>
              </div>

              <Button 
                onClick={async () => {
                  setSaving(true);
                  const result = await updateSetting('checkout', checkout);
                  if (result.success) {
                    toast.success('Checkout atualizado com sucesso!');
                  } else {
                    toast.error('Erro ao salvar: ' + result.error);
                  }
                  setSaving(false);
                }} 
                disabled={saving} 
                className="w-full"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Checkout
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guarantee Tab */}
        <TabsContent value="guarantee" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seção de Garantia</CardTitle>
              <CardDescription>Configure o título e os itens da seção de garantia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={guarantee.title}
                  onChange={(e) => setGuarantee({ ...guarantee, title: e.target.value })}
                  placeholder="Garantia"
                />
              </div>

              <div className="space-y-2">
                <Label>Itens da Garantia</Label>
                <p className="text-xs text-muted-foreground">Cada item será exibido como um bullet point na seção</p>
                {guarantee.items.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Textarea
                      value={item}
                      onChange={(e) => {
                        const updated = [...guarantee.items];
                        updated[index] = e.target.value;
                        setGuarantee({ ...guarantee, items: updated });
                      }}
                      rows={2}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const updated = guarantee.items.filter((_, i) => i !== index);
                        setGuarantee({ ...guarantee, items: updated });
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGuarantee({ ...guarantee, items: [...guarantee.items, ''] })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>

              <Button
                onClick={async () => {
                  setSaving(true);
                  const result = await updateSetting('guarantee', guarantee);
                  if (result.success) {
                    toast.success('Garantia atualizada com sucesso!');
                  } else {
                    toast.error('Erro ao salvar: ' + result.error);
                  }
                  setSaving(false);
                }}
                disabled={saving}
                className="w-full"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Garantia
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seção FAQ</CardTitle>
              <CardDescription>Configure as perguntas e respostas frequentes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Título da Seção</Label>
                  <Input
                    value={faq.title}
                    onChange={(e) => setFaq({ ...faq, title: e.target.value })}
                    placeholder="Por que escolher o painel?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtítulo</Label>
                  <Input
                    value={faq.subtitle}
                    onChange={(e) => setFaq({ ...faq, subtitle: e.target.value })}
                    placeholder="Tudo você precisa..."
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Perguntas e Respostas</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFaq({ ...faq, items: [...faq.items, { question: '', answer: '' }] })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar FAQ
                  </Button>
                </div>
                {faq.items.map((item, index) => (
                  <Card key={index} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <Input
                          value={item.question}
                          onChange={(e) => {
                            const updated = [...faq.items];
                            updated[index] = { ...updated[index], question: e.target.value };
                            setFaq({ ...faq, items: updated });
                          }}
                          placeholder="Pergunta..."
                        />
                        <Textarea
                          value={item.answer}
                          onChange={(e) => {
                            const updated = [...faq.items];
                            updated[index] = { ...updated[index], answer: e.target.value };
                            setFaq({ ...faq, items: updated });
                          }}
                          placeholder="Resposta..."
                          rows={2}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const updated = faq.items.filter((_, i) => i !== index);
                          setFaq({ ...faq, items: updated });
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <Button
                onClick={async () => {
                  setSaving(true);
                  const result = await updateSetting('faq', faq);
                  if (result.success) {
                    toast.success('FAQ atualizado com sucesso!');
                  } else {
                    toast.error('Erro ao salvar: ' + result.error);
                  }
                  setSaving(false);
                }}
                disabled={saving}
                className="w-full"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar FAQ
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tracking Tab */}
        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Rastreamento e Pixels
              </CardTitle>
              <CardDescription>
                Configure o Google Tag Manager (GTM) para centralizar todos os seus pixels de rastreamento. 
                Com o GTM, você gerencia Meta/Facebook Pixel, Google Ads, TikTok Pixel e outros sem precisar editar o código.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Google Tag Manager (GTM ID)</Label>
                <Input
                  value={tracking.google_tag_manager}
                  onChange={(e) => setTracking({ ...tracking, google_tag_manager: e.target.value })}
                  placeholder="GTM-XXXXXXX"
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: Use o GTM para gerenciar todos os pixels em um só lugar. Crie tags no GTM para Meta, Google Ads, TikTok, etc.
                </p>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium text-muted-foreground mb-4">
                  Ou configure pixels individuais (caso não use GTM):
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Facebook / Meta Pixel ID</Label>
                    <Input
                      value={tracking.facebook_pixel}
                      onChange={(e) => setTracking({ ...tracking, facebook_pixel: e.target.value })}
                      placeholder="123456789012345"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Google Analytics (GA4 Measurement ID)</Label>
                    <Input
                      value={tracking.google_analytics}
                      onChange={(e) => setTracking({ ...tracking, google_analytics: e.target.value })}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>TikTok Pixel ID</Label>
                    <Input
                      value={tracking.tiktok_pixel}
                      onChange={(e) => setTracking({ ...tracking, tiktok_pixel: e.target.value })}
                      placeholder="CXXXXXXXXXXXXXXXXX"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={async () => {
                  setSaving(true);
                  const result = await updateSetting('tracking', tracking);
                  if (result.success) {
                    toast.success('Configurações de rastreamento salvas!');
                  } else {
                    toast.error('Erro ao salvar: ' + result.error);
                  }
                  setSaving(false);
                }}
                disabled={saving}
                className="w-full"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Rastreamento
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meta Pixel Tab */}
        <TabsContent value="meta-pixel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Meta Pixel (Facebook)
              </CardTitle>
              <CardDescription>
                O Pixel da Meta é um trecho de código que permite rastrear conversões, criar públicos e otimizar anúncios no Facebook e Instagram.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Meta Pixel ID</Label>
                <Input
                  value={tracking.facebook_pixel}
                  onChange={(e) => setTracking({ ...tracking, facebook_pixel: e.target.value })}
                  placeholder="882765034647458"
                />
                <p className="text-xs text-muted-foreground">
                  Encontre seu Pixel ID no Gerenciador de Eventos da Meta: business.facebook.com
                </p>
              </div>

              {tracking.facebook_pixel && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Código instalado automaticamente</Label>
                  <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">{`<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${tracking.facebook_pixel}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${tracking.facebook_pixel}&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->`}</pre>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
                    <span className="text-accent text-sm">✅ Pixel ativo — o código acima é injetado automaticamente em todas as páginas do site.</span>
                  </div>
                </div>
              )}

              <Button
                onClick={async () => {
                  setSaving(true);
                  const result = await updateSetting('tracking', tracking);
                  if (result.success) {
                    toast.success('Meta Pixel salvo com sucesso!');
                  } else {
                    toast.error('Erro ao salvar: ' + result.error);
                  }
                  setSaving(false);
                }}
                disabled={saving}
                className="w-full"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Meta Pixel
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
