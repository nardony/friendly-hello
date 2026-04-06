UPDATE public.homepage_settings 
SET value = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(value::jsonb, '{title}', '"Gerador de Créditos Lovable"'),
          '{title_highlight}', '"de 680 por 350"'
        ),
        '{subtitle}', '"Use nosso painel exclusivo e gere créditos ilimitados para seus projetos Lovable e revenda créditos."'
      ),
      '{price_original}', '680'
    ),
    '{price_current}', '350'
  ),
  '{daily_renewal_text}', '""'
)
WHERE key = 'hero';