create extension if not exists pgcrypto;

create table if not exists site_config (
  id integer primary key default 1 check (id = 1),
  name text not null default 'Akiyoshi Yapa',
  full_name text not null default 'Akiyoshi Hikaru Yapa',
  short_name text not null default 'Akiyoshi',
  role text not null default 'Software Engineer',
  tagline text not null default 'Software Engineer & Full-Stack Developer',
  description text not null default '',
  hero_copy text not null default 'I build resilient web products, polished interfaces, and practical systems that make complex work feel effortless.',
  location text not null default 'Ragama, Western Province, Sri Lanka',
  timezone_label text not null default '(UTC+5:30)',
  email text not null default 'akiyoshiyapa@gmail.com',
  site_url text not null default 'https://akiyoshiyapa.netlify.app',
  locale text not null default 'en-US',
  theme_color text not null default '#050810',
  start_year integer not null default 2026,
  open_to_work boolean not null default true,
  typewriter_roles text[] not null default '{}',
  focus_lately text[] not null default '{}',
  social_github text,
  social_linkedin text,
  social_x text,
  social_instagram text,
  social_facebook text,
  social_mastodon text,
  social_youtube text,
  updated_at timestamptz not null default now()
);

alter table if exists site_config
  add column if not exists hero_copy text not null default 'I build resilient web products, polished interfaces, and practical systems that make complex work feel effortless.';

create table if not exists about_content (
  id integer primary key default 1 check (id = 1),
  bio_paragraph_1 text not null default '',
  bio_paragraph_2 text not null default '',
  profile_image_url text,
  chips text[] not null default '{}',
  stat_featured_projects integer not null default 4,
  stat_years_coding integer not null default 4,
  stat_technologies integer not null default 20,
  stat_skill_domains integer not null default 6,
  updated_at timestamptz not null default now()
);

alter table if exists about_content
  add column if not exists profile_image_url text;

create table if not exists education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  period text not null,
  degree text not null,
  logo_path text,
  logo_type text not null default 'wide' check (logo_type in ('crest','wide')),
  logo_width integer not null default 0,
  logo_height integer not null default 0,
  tags text[] not null default '{}',
  sort_order integer not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists skill_categories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sort_order integer not null default 50,
  created_at timestamptz not null default now()
);

create table if not exists skill_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references skill_categories(id) on delete cascade,
  name text not null,
  icon_slug text not null default '',
  brand_hex text not null default '#ffffff',
  fallback text,
  sort_order integer not null default 50,
  created_at timestamptz not null default now()
);

create index if not exists skill_items_category_id_idx
  on skill_items (category_id);

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  name text not null,
  title text not null,
  company text not null,
  initials text not null check (char_length(initials) between 1 and 2),
  avatar_url text,
  sort_order integer not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists testimonials
  add column if not exists avatar_url text;

create table if not exists work_experience (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  logo text not null check (char_length(logo) between 1 and 4),
  logo_url text,
  title text not null,
  date_range text not null,
  bullets text[] not null default '{}',
  tags text[] not null default '{}',
  sort_order integer not null default 50,
  url text,
  body text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists work_experience
  add column if not exists logo_url text;

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  tagline text not null,
  description text not null,
  category text not null default 'web' check (category in ('web','api','mobile','open-source','other')),
  stack text[] not null default '{}',
  year integer not null check (year between 2000 and 2100),
  featured boolean not null default false,
  wide boolean not null default false,
  theme_from text not null default '#00f5d4',
  theme_to text not null default '#7b2fff',
  stars integer,
  forks integer,
  cover_url text,
  cover_alt text,
  media_items jsonb not null default '[]'::jsonb,
  link_live text,
  link_repo text,
  link_case_study text,
  draft boolean not null default false,
  sort_order integer not null default 50,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists projects
  add column if not exists media_items jsonb not null default '[]'::jsonb;

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  pub_date date not null,
  updated_date date,
  tags text[] not null default '{}',
  cover_url text,
  cover_alt text,
  draft boolean not null default false,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uses_groups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sort_order integer not null default 50,
  created_at timestamptz not null default now()
);

create table if not exists uses_items (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references uses_groups(id) on delete cascade,
  name text not null,
  description text not null,
  sort_order integer not null default 50
);

create index if not exists uses_items_group_id_idx
  on uses_items (group_id);

create table if not exists now_page (
  id integer primary key default 1 check (id = 1),
  location text not null default '',
  working_on text not null default '',
  studying text not null default '',
  learning text not null default '',
  open_to text not null default '',
  last_updated date not null default current_date,
  updated_at timestamptz not null default now()
);

insert into site_config (
  id, name, full_name, short_name, role, tagline, description, hero_copy,
  location, timezone_label, email, site_url, locale, theme_color,
  start_year, open_to_work, typewriter_roles, focus_lately,
  social_github, social_linkedin, social_x, social_instagram, social_facebook
) values (
  1, 'Akiyoshi Yapa', 'Akiyoshi Hikaru Yapa', 'Akiyoshi',
  'Software Engineer', 'Software Engineer & Full-Stack Developer',
  'Portfolio of Akiyoshi Yapa, a software engineering undergraduate and full-stack developer building practical, AI-powered web products from Sri Lanka.',
  'I build resilient web products, polished interfaces, and practical systems that make complex work feel effortless.',
  'Ragama, Western Province, Sri Lanka', '(UTC+5:30)',
  'akiyoshiyapa@gmail.com', 'https://akiyoshiyapa.netlify.app', 'en-US', '#050810',
  2026, true,
  array['Full-Stack Developer','AI Enthusiast','Web Developer','Backend Developer','Problem Solver','Tech Enthusiast','UI/UX Focused','Open to Opportunities'],
  array['Agentic AI','MCP tooling','RAG products'],
  'https://github.com/Akiyoshi02',
  'https://www.linkedin.com/in/akiyoshi-yapa',
  'https://x.com/akiyapax',
  'https://www.instagram.com/_.akiya_/',
  'https://www.facebook.com/Akiyoshi.Yapa'
) on conflict (id) do nothing;

insert into about_content (
  id, bio_paragraph_1, bio_paragraph_2, profile_image_url, chips,
  stat_featured_projects, stat_years_coding, stat_technologies, stat_skill_domains
) values (
  1,
  'I am a Software Engineering undergraduate with a strong foundation in web development, backend systems, databases, and modern AI-powered applications. I enjoy creating practical, user-focused digital solutions that combine clean design, reliable functionality, and emerging technologies.',
  'I am passionate about software engineering, artificial intelligence, and problem-solving, with a strong interest in building systems that are meaningful, efficient, and impactful. My goal is to continue growing as a developer while applying technology to solve real-world challenges.',
  null,
  array['Full-Stack Developer','AI Enthusiast','Web Developer','Backend Developer','Problem Solver','Tech Enthusiast','UI/UX Focused','Open to Opportunities'],
  4, 4, 20, 6
) on conflict (id) do nothing;

insert into education (institution, period, degree, logo_path, logo_type, logo_width, logo_height, tags, sort_order)
select seed.*
from (
  values
    ('Thurstan College, Sri Lanka', '2008 - 2022', 'G.C.E. Ordinary Level', '/logos/thurstan.png', 'crest', 1254, 1254, array['G.C.E. O/L','Secondary Education','Academic Foundation','Leadership','Teamwork'], 10),
    ('SLIIT City University, Sri Lanka', '2022 - 2025', 'Foundation Certificate + HND in Information Technology', '/logos/sliit.png', 'wide', 864, 466, array['Programming','Web Dev','Databases','Server-side','Dean''s List 2024'], 20),
    ('University of Bedfordshire, UK', '2025 - Present', 'BSc (Hons) Software Engineering', '/logos/bedfordshire.png', 'wide', 1234, 492, array['Software Engineering','Software Development','Databases','Project Execution'], 30)
) as seed(institution, period, degree, logo_path, logo_type, logo_width, logo_height, tags, sort_order)
where not exists (
  select 1
  from education
  where education.institution = seed.institution
    and education.degree = seed.degree
);

do $$
declare
  cat_lang uuid; cat_fe uuid; cat_be uuid; cat_db uuid; cat_ai uuid; cat_devops uuid;
begin
  if not exists (select 1 from skill_categories) then
    insert into skill_categories (title, sort_order) values ('Languages', 10) returning id into cat_lang;
    insert into skill_categories (title, sort_order) values ('Frontend', 20) returning id into cat_fe;
    insert into skill_categories (title, sort_order) values ('Backend', 30) returning id into cat_be;
    insert into skill_categories (title, sort_order) values ('Database', 40) returning id into cat_db;
    insert into skill_categories (title, sort_order) values ('AI / ML', 50) returning id into cat_ai;
    insert into skill_categories (title, sort_order) values ('DevOps & Tools', 60) returning id into cat_devops;

    insert into skill_items (category_id, name, icon_slug, brand_hex, fallback, sort_order) values
      (cat_lang, 'Java', 'openjdk', '#ED8B00', null, 10),
      (cat_lang, 'JavaScript', 'javascript', '#F7DF1E', null, 20),
      (cat_lang, 'TypeScript', 'typescript', '#3178C6', null, 30),
      (cat_lang, 'Python', 'python', '#3776AB', null, 40),
      (cat_lang, 'PHP', 'php', '#777BB4', null, 50),
      (cat_lang, 'HTML5', 'html5', '#E34F26', null, 60),
      (cat_lang, 'CSS3', 'devicon:css3', '#1572B6', null, 70),
      (cat_fe, 'React', 'react', '#61DAFB', null, 10),
      (cat_fe, 'Vite', 'vite', '#646CFF', null, 20),
      (cat_fe, 'Tailwind CSS', 'tailwindcss', '#06B6D4', null, 30),
      (cat_fe, 'React Router', 'reactrouter', '#CA4245', null, 40),
      (cat_fe, 'Headless UI', 'headlessui', '#66E3FF', null, 50),
      (cat_fe, 'PWA', 'pwa', '#5A0FC8', null, 60),
      (cat_be, 'Node.js', 'nodedotjs', '#5FA04E', null, 10),
      (cat_be, 'Express', 'express', '#000000', null, 20),
      (cat_be, 'REST APIs', 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/openapi/openapi-original.svg', '#6BA539', null, 30),
      (cat_be, 'JWT', 'jsonwebtokens', '#000000', 'JWT', 40),
      (cat_be, 'Socket.IO', 'socketdotio', '#010101', null, 50),
      (cat_be, 'SendGrid', 'simple-icons:sendgrid', '#1A82E2', null, 60),
      (cat_db, 'MySQL', 'mysql', '#4479A1', null, 10),
      (cat_db, 'Firebase', 'firebase', '#DD2C00', null, 20),
      (cat_db, 'Supabase', 'supabase', '#3FCF8E', null, 30),
      (cat_db, 'IndexedDB', 'mozilla', '#005A9C', null, 40),
      (cat_ai, 'Ollama', 'ollama', '#000000', null, 10),
      (cat_ai, 'Whisper STT', 'https://upload.wikimedia.org/wikipedia/commons/6/66/OpenAI_logo_2025_%28symbol%29.svg', '#10A37F', null, 20),
      (cat_ai, 'MediaPipe', 'mediapipe', '#00f5d4', null, 30),
      (cat_ai, 'Hugging Face', 'huggingface', '#FFD21E', null, 40),
      (cat_devops, 'Docker', 'docker', '#2496ED', null, 10),
      (cat_devops, 'GitHub Actions', 'githubactions', '#2088FF', null, 20),
      (cat_devops, 'Git', 'git', '#F05032', null, 30),
      (cat_devops, 'GitHub', 'github', '#181717', null, 40),
      (cat_devops, 'Azure', 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg', '#0078D4', null, 50),
      (cat_devops, 'WordPress', 'wordpress', '#21759B', null, 60);
  end if;
end $$;

update skill_items
set icon_slug = 'devicon:css3'
where name = 'CSS3'
  and (
    lower(icon_slug) in ('css', 'sicss')
    or icon_slug = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg'
  );

update skill_items
set icon_slug = 'simple-icons:sendgrid',
    brand_hex = '#1A82E2'
where name = 'SendGrid'
  and (
    lower(icon_slug) in ('sendgrid', 'devicon:sendgrid', 'sisendgrid')
    or icon_slug = 'https://www.vectorlogo.zone/logos/sendgrid/sendgrid-icon.svg'
  );

insert into testimonials (text, name, title, company, initials, sort_order)
select seed.*
from (
  values
    ('CleanOps Pro was for one of our client. Scheduling, attendance, proof, and invoicing in one app instead of spreadsheets everywhere. The team got how cleaners work on site and kept us in the loop without the usual back-and-forth.', 'Dylan Rodrigo', 'Operations Manager', 'Cynectex (Pvt) Ltd', 'DR', 10)
) as seed(text, name, title, company, initials, sort_order)
where not exists (
  select 1
  from testimonials
  where testimonials.name = seed.name
    and testimonials.company = seed.company
);

insert into work_experience (company, logo, title, date_range, bullets, tags, sort_order, url)
select seed.*
from (
  values
    (
      'Cynectex (Pvt) Ltd',
      'CX',
      'Junior Web Developer',
      'Nov 2025 - Present',
      array[
        'Ship and maintain full-stack web apps: responsive UI, integrations, and quarterly releases.',
        'Standardize API validation and error handling for reliable client-facing flows.',
        'Tune WordPress and web apps for faster loads, stability, and responsiveness.'
      ],
      array['Web Development','Mobile UI','API Integration','WordPress','Performance'],
      50,
      'https://cynectex.com/'
    )
) as seed(company, logo, title, date_range, bullets, tags, sort_order, url)
where not exists (
  select 1
  from work_experience
  where work_experience.company = seed.company
    and work_experience.title = seed.title
);

insert into projects (title, slug, tagline, description, category, stack, year, featured, wide, theme_from, theme_to, link_live, link_repo, sort_order, body) values
('InterviewAI Pro', 'interviewai-pro', 'AI-powered interview practice and candidate screening platform.', 'An AI-driven platform for interview preparation and candidate screening: real-time AI interviewer, candidate and organization dashboards, job postings, applications, scheduling, role-based access, moderation, and automated notifications.', 'web', array['React','Vite','Tailwind CSS','Node.js','Express','Firebase','Socket.IO','JWT','PWA','Ollama','Whisper','Python','MediaPipe','SendGrid','GitHub Actions'], 2025, true, true, '#7b2fff', '#ff4ecd', null, 'https://github.com/Akiyoshi02/InterviewAI_Pro', 10, E'## Context\n\nInterviewAI Pro started as an experiment in turning the interview loop into something more interactive and structured.\n\n## What''s in it\n\n- Real-time AI interviewer\n- Candidate and organization dashboards\n- Role-based access control\n\n## Decisions\n\n- Local-first AI with Ollama\n- PWA shell\n- Socket.IO for real-time state'),
('CleanOps Pro', 'cleanops-pro', 'Offline-first operations platform for scheduling, attendance, proof tracking, and invoicing.', 'A commercial cleaning operations platform built for Admin, Supervisor, and Cleaner workflows: scheduling, QR/selfie attendance, proof uploads, issue reporting, timesheets, invoice generation, and audit tracking.', 'web', array['React','Vite','Tailwind CSS','Node.js','Express','Supabase','IndexedDB','PWA','Docker','Ollama','Whisper'], 2025, true, false, '#00f5d4', '#20e080', null, 'https://github.com/Tehan-Hewage/CleanOps_Pro', 20, E'## Context\n\nField operations do not have the luxury of a stable network.\n\n## Three workflows, one app\n\n- Cleaner\n- Supervisor\n- Admin\n\n## Decisions\n\n- IndexedDB-backed sync layer\n- PWA install\n- Audit-first design'),
('FoneCove Mobile Store', 'fonecove-mobile-store', 'Responsive frontend e-commerce platform for a mobile phone retailer.', 'A frontend-only e-commerce site for a mobile phone retailer: public storefront with filtering, search, product pages, and dark/light themes, plus an admin panel UI.', 'web', array['React','TypeScript','Vite','Tailwind CSS','React Router','Headless UI'], 2025, true, false, '#ff8a3c', '#ff4ecd', null, 'https://github.com/Tehan-Hewage/FoneCove_Mobile_Store', 30, E'## Context\n\nA pure-frontend retail surface designed to look and behave like a finished storefront before any backend exists.\n\n## What''s in it\n\n- Storefront\n- Admin panel\n- Typed end-to-end\n\n## Decisions\n\n- Headless UI\n- React Router\n- CSS variables'),
('Banana Blitz', 'banana-blitz', 'Browser puzzle game with multiplayer and daily challenges.', 'A browser-based puzzle game where players guess banana counts across multiple modes: classic levels, timed challenges, daily puzzles, achievements, customization, and real-time multiplayer.', 'web', array['HTML','CSS','JavaScript','Firebase','Tailwind CSS'], 2024, false, true, '#ffc857', '#ff8a3c', 'https://akiyoshi02.github.io/BananaBlitz_Game/', 'https://github.com/Akiyoshi02/BananaBlitz_Game', 40, E'## Context\n\nBanana Blitz started as a small bet: how much real game can you build with plain HTML, CSS, and JavaScript?\n\n## Modes\n\n- Classic\n- Timed\n- Daily challenge\n- Multiplayer\n\n## Decisions\n\n- Firebase for realtime\n- No build step\n- Achievements and customization')
on conflict (slug) do nothing;

insert into blog_posts (title, slug, description, pub_date, tags, body) values
('Hello, World', 'hello-world', 'First post on the new site: what''s here, what''s coming, and how it was built.', '2026-05-21', array['meta','astro'], E'This is the first post on the new portfolio. The site is built with **Astro**, deployed as a fully static bundle, and ships effectively no JavaScript on content pages by default.\n\nPlans from here:\n\n- Project case studies under /projects/<slug>\n- Engineering notes\n- A /uses page\n\nIf you spotted something you want to talk about, the contact link in the nav goes straight to my inbox.')
on conflict (slug) do nothing;

do $$
declare g1 uuid; g2 uuid; g3 uuid; g4 uuid;
begin
  if not exists (select 1 from uses_groups) then
    insert into uses_groups (title, sort_order) values ('Editor', 10) returning id into g1;
    insert into uses_groups (title, sort_order) values ('Terminal', 20) returning id into g2;
    insert into uses_groups (title, sort_order) values ('Languages & Runtimes', 30) returning id into g3;
    insert into uses_groups (title, sort_order) values ('Hardware', 40) returning id into g4;

    insert into uses_items (group_id, name, description, sort_order) values
      (g1, 'VS Code', 'Primary editor with extensions for TypeScript, Astro, and Git.', 10),
      (g1, 'JetBrains Mono', 'Editor font, weights 400/500/700.', 20),
      (g1, 'GitHub Dark Default', 'Color theme: easy on the eyes for long sessions.', 30),
      (g2, 'Windows Terminal', 'Tabs, profiles, and decent rendering.', 10),
      (g2, 'PowerShell 7', 'Default shell on Windows.', 20),
      (g2, 'Starship', 'Cross-shell prompt with git status.', 30),
      (g3, 'Node.js 22 LTS', 'JavaScript / TypeScript runtime.', 10),
      (g3, 'Python 3.12', 'Tooling, scripts, and backend utilities.', 20),
      (g3, 'Go 1.22+', 'Small services and CLIs.', 30),
      (g4, '27" monitor', '1440p, the productivity sweet spot.', 10),
      (g4, 'Mechanical keyboard', 'Brown switches.', 20),
      (g4, 'Wired mouse', 'Latency over wireless.', 30);
  end if;
end $$;

insert into now_page (id, location, working_on, studying, learning, open_to, last_updated) values
(1, 'Ragama, Western Province, Sri Lanka',
 'Junior Web Developer at Cynectex, shipping client web apps and API work, while pushing forward on two personal builds: InterviewAI Pro and CleanOps Pro.',
 'BSc (Hons) Software Engineering at the University of Bedfordshire, UK.',
 'Backend engineering depth, AI integration patterns (local LLMs, retrieval, speech I/O), and system design fundamentals for production-ready software.',
 'Software engineering opportunities: remote, hybrid, or relocation-friendly. Junior to mid-level roles where careful engineering and ownership matter.',
 '2026-05-21')
on conflict (id) do nothing;

create table if not exists admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table admin_users enable row level security;

insert into admin_users (email)
values ('akiyoshiyapa@gmail.com')
on conflict (email) do nothing;

create index if not exists admin_users_lower_email_idx
  on admin_users (lower(email));

revoke all on table admin_users from public, anon, authenticated;
grant select on table admin_users to anon, authenticated;

drop policy if exists "Authenticated users can read own admin row" on admin_users;
create policy "Authenticated users can read own admin row"
on admin_users
for select
to authenticated
using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

alter table site_config enable row level security;
alter table about_content enable row level security;
alter table education enable row level security;
alter table skill_categories enable row level security;
alter table skill_items enable row level security;
alter table testimonials enable row level security;
alter table work_experience enable row level security;
alter table projects enable row level security;
alter table blog_posts enable row level security;
alter table uses_groups enable row level security;
alter table uses_items enable row level security;
alter table now_page enable row level security;

grant usage on schema public to anon, authenticated;
grant select on
  site_config,
  about_content,
  education,
  skill_categories,
  skill_items,
  testimonials,
  work_experience,
  projects,
  blog_posts,
  uses_groups,
  uses_items,
  now_page
to anon, authenticated;
grant insert, update, delete on
  site_config,
  about_content,
  education,
  skill_categories,
  skill_items,
  testimonials,
  work_experience,
  projects,
  blog_posts,
  uses_groups,
  uses_items,
  now_page
to authenticated;

do $$
declare
  table_name text;
  admin_check text := 'exists (select 1 from public.admin_users where lower(email) = lower(coalesce(auth.jwt() ->> ''email'', '''')))';
begin
  foreach table_name in array array[
    'site_config','about_content','education','skill_categories','skill_items',
    'testimonials','work_experience','projects','blog_posts','uses_groups',
    'uses_items','now_page'
  ]
  loop
    execute format('drop policy if exists "Public can read %1$s" on %1$I', table_name);
    execute format('drop policy if exists "Authenticated can read %1$s" on %1$I', table_name);
    execute format('drop policy if exists "Portfolio admins can read all %1$s" on %1$I', table_name);
    execute format('drop policy if exists "Portfolio admins can insert %1$s" on %1$I', table_name);
    execute format('drop policy if exists "Portfolio admins can update %1$s" on %1$I', table_name);
    execute format('drop policy if exists "Portfolio admins can delete %1$s" on %1$I', table_name);
    execute format('drop policy if exists "Authenticated full access %1$s" on %1$I', table_name);
    execute format('drop policy if exists "Portfolio admins can manage %1$s" on %1$I', table_name);

    if table_name in ('projects', 'blog_posts') then
      execute format('create policy "Public can read %1$s" on %1$I for select to anon, authenticated using (draft = false or %2$s)', table_name, admin_check);
    else
      execute format('create policy "Public can read %1$s" on %1$I for select to anon, authenticated using (true)', table_name);
    end if;

    execute format('create policy "Portfolio admins can insert %1$s" on %1$I for insert to authenticated with check (%2$s)', table_name, admin_check);
    execute format('create policy "Portfolio admins can update %1$s" on %1$I for update to authenticated using (%2$s) with check (%2$s)', table_name, admin_check);
    execute format('create policy "Portfolio admins can delete %1$s" on %1$I for delete to authenticated using (%2$s)', table_name, admin_check);
  end loop;
end $$;

insert into storage.buckets (id, name, public)
values ('portfolio-assets', 'portfolio-assets', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can read portfolio assets" on storage.objects;
drop policy if exists "Authenticated can manage portfolio assets" on storage.objects;
drop policy if exists "Portfolio admins can manage portfolio assets" on storage.objects;

drop function if exists public.is_portfolio_admin();

create policy "Portfolio admins can manage portfolio assets"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'portfolio-assets'
  and exists (
    select 1
    from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
)
with check (
  bucket_id = 'portfolio-assets'
  and exists (
    select 1
    from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

notify pgrst, 'reload schema';
