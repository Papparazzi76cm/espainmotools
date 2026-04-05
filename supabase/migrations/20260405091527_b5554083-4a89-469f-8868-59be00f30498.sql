
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title_es TEXT NOT NULL,
  title_en TEXT NOT NULL,
  excerpt_es TEXT NOT NULL DEFAULT '',
  excerpt_en TEXT NOT NULL DEFAULT '',
  content_es TEXT NOT NULL DEFAULT '',
  content_en TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  author TEXT NOT NULL DEFAULT 'Ace-Inmotools',
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Anyone can view published posts"
  ON public.blog_posts FOR SELECT
  USING (is_published = true);

-- Admins can do everything
CREATE POLICY "Admins can manage blog posts"
  ON public.blog_posts FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert some seed articles
INSERT INTO public.blog_posts (slug, title_es, title_en, excerpt_es, excerpt_en, content_es, content_en, category, is_published, published_at, cover_image) VALUES
(
  'como-captar-mas-exclusivas-inmobiliarias',
  'Cómo captar más exclusivas inmobiliarias con IA',
  'How to Win More Exclusive Listings with AI',
  'Descubre las estrategias más efectivas para conseguir exclusivas en el mercado inmobiliario actual usando herramientas de inteligencia artificial.',
  'Discover the most effective strategies to win exclusive listings in today''s real estate market using AI tools.',
  '## La captación de exclusivas: el reto principal del agente

La captación de propiedades en exclusiva sigue siendo uno de los mayores desafíos para cualquier agente inmobiliario. En un mercado cada vez más competitivo, diferenciarse es clave.

### ¿Por qué la IA marca la diferencia?

Las herramientas de inteligencia artificial permiten:

- **Análisis de mercado automatizado**: Conoce el precio óptimo de cada propiedad al instante.
- **Informes profesionales**: Genera valoraciones con datos reales del entorno.
- **Presentaciones impactantes**: Crea materiales de captación que impresionan al propietario.

### Estrategias prácticas

1. **Prepara un informe de valoración** antes de la primera visita usando herramientas de análisis de costes y rentabilidad.
2. **Muestra el potencial** de la propiedad con home staging virtual.
3. **Diferénciate** con descripciones profesionales generadas por IA.

La tecnología no sustituye la relación personal, pero te da una ventaja competitiva decisiva.',
  '## Exclusive listings: the main agent challenge

Winning exclusive property listings remains one of the biggest challenges for any real estate agent. In an increasingly competitive market, differentiation is key.

### Why does AI make the difference?

Artificial intelligence tools allow you to:

- **Automated market analysis**: Know the optimal price for each property instantly.
- **Professional reports**: Generate valuations with real neighborhood data.
- **Impactful presentations**: Create listing materials that impress property owners.

### Practical strategies

1. **Prepare a valuation report** before the first visit using cost and profitability analysis tools.
2. **Show the potential** of the property with virtual home staging.
3. **Stand out** with AI-generated professional descriptions.

Technology doesn''t replace personal relationships, but it gives you a decisive competitive advantage.',
  'captacion',
  true,
  now(),
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'
),
(
  'tendencias-inmobiliarias-2025',
  'Tendencias inmobiliarias 2025: lo que todo agente debe saber',
  'Real Estate Trends 2025: What Every Agent Should Know',
  'Las claves del mercado inmobiliario para 2025: digitalización, sostenibilidad y nuevas formas de trabajar.',
  'Key real estate market trends for 2025: digitalization, sustainability, and new ways of working.',
  '## El mercado inmobiliario en transformación

El sector inmobiliario está viviendo una revolución tecnológica sin precedentes. En 2025, estas son las tendencias que marcarán la diferencia.

### 1. Digitalización total del proceso

Desde la captación hasta el cierre, cada fase se beneficia de herramientas digitales. Los agentes que adopten tecnología IA tendrán una ventaja significativa.

### 2. Sostenibilidad como factor clave

Los compradores valoran cada vez más la eficiencia energética. Incluir esta información en tus informes y descripciones es fundamental.

### 3. Home staging virtual

El home staging virtual se ha convertido en herramienta imprescindible. Permite mostrar el potencial de cualquier espacio sin coste de reforma.

### 4. Marketing inmobiliario con IA

La generación automática de anuncios, guiones de vídeo y descripciones optimizadas ahorra horas de trabajo diario.

### Conclusión

Los agentes que integren estas tendencias en su práctica diaria no solo sobrevivirán, sino que liderarán el mercado.',
  '## The real estate market in transformation

The real estate sector is experiencing an unprecedented technological revolution. In 2025, these are the trends that will make the difference.

### 1. Full digitalization of the process

From lead generation to closing, every phase benefits from digital tools. Agents who adopt AI technology will have a significant advantage.

### 2. Sustainability as a key factor

Buyers increasingly value energy efficiency. Including this information in your reports and descriptions is essential.

### 3. Virtual home staging

Virtual home staging has become an indispensable tool. It allows you to show the potential of any space without renovation costs.

### 4. AI-powered real estate marketing

Automatic generation of ads, video scripts, and optimized descriptions saves hours of daily work.

### Conclusion

Agents who integrate these trends into their daily practice will not only survive but lead the market.',
  'marketing',
  true,
  now() - interval '2 days',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'
),
(
  'guia-analisis-legal-contratos-alquiler',
  'Guía de análisis legal de contratos de alquiler con IA',
  'Guide to AI-Powered Legal Analysis of Rental Contracts',
  'Cómo utilizar la inteligencia artificial para revisar contratos de alquiler y detectar cláusulas abusivas automáticamente.',
  'How to use artificial intelligence to review rental contracts and automatically detect abusive clauses.',
  '## La revisión legal: un proceso crítico

Revisar un contrato de alquiler requiere conocimientos legales específicos. La Ley de Arrendamientos Urbanos (LAU) establece requisitos que todo contrato debe cumplir.

### ¿Qué puede hacer la IA por ti?

- **Detectar cláusulas abusivas** que contravengan la LAU.
- **Verificar requisitos legales** obligatorios.
- **Sugerir mejoras** para proteger a ambas partes.
- **Analizar la fianza** y depósitos según normativa vigente.

### Aspectos clave a revisar

1. **Duración del contrato**: Mínimo 5 años (7 si el arrendador es persona jurídica).
2. **Actualización de renta**: Limitada al índice de referencia vigente.
3. **Fianza legal**: Un mes de renta para vivienda habitual.
4. **Gastos de gestión**: A cargo del arrendador si es persona jurídica.

### La ventaja del consultor legal IA

Un consultor legal basado en IA te permite revisar contratos en minutos, no en horas, manteniendo la precisión y el rigor jurídico necesarios.',
  '## Legal review: a critical process

Reviewing a rental contract requires specific legal knowledge. Spain''s Urban Leasing Law (LAU) establishes requirements that every contract must comply with.

### What can AI do for you?

- **Detect abusive clauses** that contravene the LAU.
- **Verify mandatory legal requirements**.
- **Suggest improvements** to protect both parties.
- **Analyze the deposit** according to current regulations.

### Key aspects to review

1. **Contract duration**: Minimum 5 years (7 if the landlord is a legal entity).
2. **Rent updates**: Limited to the current reference index.
3. **Legal deposit**: One month''s rent for primary residence.
4. **Management fees**: Borne by the landlord if a legal entity.

### The advantage of AI legal consulting

An AI-based legal consultant allows you to review contracts in minutes, not hours, maintaining the necessary precision and legal rigor.',
  'legal',
  true,
  now() - interval '5 days',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80'
);
