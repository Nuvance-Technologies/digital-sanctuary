
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Admin whitelist (emails allowed to be made admin upon signup)
CREATE TABLE public.admin_whitelist (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_whitelist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read whitelist" ON public.admin_whitelist FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage whitelist" ON public.admin_whitelist FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Seed initial whitelisted admin email
INSERT INTO public.admin_whitelist (email) VALUES ('admin@meeramai.org') ON CONFLICT DO NOTHING;

-- Auto-grant admin role on signup if email is whitelisted
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.admin_whitelist WHERE lower(email) = lower(NEW.email)) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Gallery
CREATE TYPE public.gallery_category AS ENUM ('utsavs', 'darshan', 'meera_mai');
CREATE TYPE public.media_type AS ENUM ('image', 'video');

CREATE TABLE public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category gallery_category NOT NULL,
  type media_type NOT NULL DEFAULT 'image',
  title_en TEXT NOT NULL,
  title_hi TEXT,
  description_en TEXT,
  description_hi TEXT,
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published gallery" ON public.gallery_items FOR SELECT USING (published = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage gallery" ON public.gallery_items FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Events / Dharmic calendar
CREATE TYPE public.event_type AS ENUM ('utsav','purnima','amavasya','ekadashi','other');

CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_hi TEXT,
  description_en TEXT,
  description_hi TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  type event_type NOT NULL DEFAULT 'other',
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published events" ON public.events FOR SELECT USING (published = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage events" ON public.events FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- RSVPs
CREATE TABLE public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  guests INT NOT NULL DEFAULT 1,
  device_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, email)
);
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can rsvp" ON public.rsvps FOR INSERT WITH CHECK (true);
CREATE POLICY "rsvp lookup by email" ON public.rsvps FOR SELECT USING (true);
CREATE POLICY "admins manage rsvps" ON public.rsvps FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Donations
CREATE TYPE public.donation_cause AS ENUM ('annakshetra','maintenance','goshala','general');
CREATE TYPE public.donation_status AS ENUM ('pending','paid','failed');

CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id TEXT NOT NULL UNIQUE DEFAULT ('DAAN-' || upper(substr(md5(random()::text),1,10))),
  cause donation_cause NOT NULL DEFAULT 'general',
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  dedication TEXT,
  status donation_status NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone create donation" ON public.donations FOR INSERT WITH CHECK (true);
CREATE POLICY "donation lookup by reference" ON public.donations FOR SELECT USING (true);
CREATE POLICY "admins manage donations" ON public.donations FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Seed sample published gallery + events so the site looks alive
INSERT INTO public.events (title_en, title_hi, description_en, description_hi, event_date, type, featured) VALUES
  ('Narmada Jayanti', 'नर्मदा जयंती', 'Celebrating the descent of Maa Narmada', 'माँ नर्मदा के अवतरण का उत्सव', (CURRENT_DATE + INTERVAL '15 days')::date, 'utsav', true),
  ('Purnima Satsang', 'पूर्णिमा सत्संग', 'Full moon devotional gathering', 'पूर्णिमा भक्ति सभा', (CURRENT_DATE + INTERVAL '7 days')::date, 'purnima', false),
  ('Guru Purnima', 'गुरु पूर्णिमा', 'Honouring Shri Meera Mai and lineage', 'श्री मीरा माई एवं गुरु परम्परा का सम्मान', (CURRENT_DATE + INTERVAL '45 days')::date, 'utsav', true);
