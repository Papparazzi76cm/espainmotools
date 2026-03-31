
-- 1. Enum de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'tester', 'agencia', 'agencia_xl', 'agente');

-- 2. Tabla de roles de usuario (siguiendo mejores prácticas)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Tabla de agencias
CREATE TABLE public.agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_email text,
  phone text,
  logo_url text,
  contract_start timestamptz NOT NULL DEFAULT now(),
  contract_end timestamptz,
  max_agents int NOT NULL DEFAULT 10,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

-- 4. Tabla de permisos
CREATE TABLE public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- 5. Tabla de permisos por usuario
CREATE TABLE public.user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  permission_id uuid REFERENCES public.permissions(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, permission_id)
);

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- 6. Ampliar profiles con campos de acceso y agencia
ALTER TABLE public.profiles
  ADD COLUMN agency_id uuid REFERENCES public.agencies(id) ON DELETE SET NULL,
  ADD COLUMN access_start timestamptz DEFAULT now(),
  ADD COLUMN access_end timestamptz,
  ADD COLUMN status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));

-- 7. Función security definer para verificar roles (evita recursión RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 8. Función para obtener el rol de un usuario
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- 9. Función para obtener agency_id de un usuario
CREATE OR REPLACE FUNCTION public.get_user_agency_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT agency_id
  FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- 10. RLS: user_roles
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 11. RLS: agencies
CREATE POLICY "Admins can manage all agencies"
  ON public.agencies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Agency owners can view own agency"
  ON public.agencies FOR SELECT TO authenticated
  USING (
    id = public.get_user_agency_id(auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- 12. RLS: permissions
CREATE POLICY "Admins can manage permissions"
  ON public.permissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can view permissions"
  ON public.permissions FOR SELECT TO authenticated
  USING (true);

-- 13. RLS: user_permissions
CREATE POLICY "Admins can manage user permissions"
  ON public.user_permissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own permissions"
  ON public.user_permissions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Agency managers can manage agent permissions"
  ON public.user_permissions FOR ALL TO authenticated
  USING (
    (public.has_role(auth.uid(), 'agencia') OR public.has_role(auth.uid(), 'agencia_xl'))
    AND user_id IN (
      SELECT p.user_id FROM public.profiles p
      WHERE p.agency_id = public.get_user_agency_id(auth.uid())
    )
  )
  WITH CHECK (
    (public.has_role(auth.uid(), 'agencia') OR public.has_role(auth.uid(), 'agencia_xl'))
    AND user_id IN (
      SELECT p.user_id FROM public.profiles p
      WHERE p.agency_id = public.get_user_agency_id(auth.uid())
    )
  );

-- 14. Insertar permisos base (uno por herramienta)
INSERT INTO public.permissions (name, description) VALUES
  ('home-staging', 'Acceso a Home Staging virtual'),
  ('consultor-legal', 'Acceso a Consultor Legal'),
  ('descripciones', 'Acceso a Generador de Textos'),
  ('informes', 'Acceso a Generador de Informes'),
  ('entorno', 'Acceso a Análisis de Entorno'),
  ('guiones', 'Acceso a Guiones de Captación'),
  ('captacion', 'Acceso a Análisis de Captación'),
  ('costes', 'Acceso a Calculadora de Costes'),
  ('rentabilidad', 'Acceso a Calculadora de Rentabilidad'),
  ('contratos', 'Acceso a Generador de Contratos'),
  ('roleplay', 'Acceso a Role Play Assistant');
