
INSERT INTO public.permissions (name, description) VALUES
  ('home-staging', 'Home Staging IA'),
  ('descripciones', 'Generador de Textos'),
  ('consultor-legal', 'Consultor Jurídico'),
  ('costes', 'Calculadora de Costes'),
  ('rentabilidad', 'Calculadora de Rentabilidad'),
  ('informes', 'Informes de Valoración'),
  ('entorno', 'Descripción de Entorno'),
  ('guiones', 'Guiones de Vídeo'),
  ('captacion', 'Asistente de Captación'),
  ('contratos', 'Generador de Contratos'),
  ('roleplay', 'Asistente de Role Play')
ON CONFLICT DO NOTHING;
