-- MindUp gameplay persistence migration
-- Run AFTER database/001_mindup.sql in Supabase SQL Editor.

-- Compatibility for projects created with the first schema.
alter table public.profiles add column if not exists gems integer not null default 2450;
alter table public.profiles add column if not exists tickets integer not null default 8;
alter table public.profiles add column if not exists skill_points integer not null default 3;
alter table public.user_quests add column if not exists progress integer not null default 0;
alter table public.quests add column if not exists slug text;
alter table public.quests add column if not exists hero_bg text;
alter table public.quests add column if not exists icon text default '⚔️';
alter table public.skills add column if not exists icon text default '🧠';
alter table public.equipment add column if not exists icon text default '🛡️';

update public.quests set slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')) where slug is null;
create unique index if not exists quests_slug_uidx on public.quests(slug);

-- ---------- Helper: achievements ----------
create or replace function public.refresh_achievements(p_user_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare
  p public.profiles%rowtype;
  completed integer;
  streak integer;
  equipment_count integer;
  category_completed integer;
  a record;
  requirement jsonb;
  ok boolean;
begin
  select * into p from public.profiles where id=p_user_id;
  if not found then return; end if;
  select count(*) into completed from public.user_quests where user_id=p_user_id and status='completed';
  streak := p.streak_days;
  select coalesce(sum(quantity),0) into equipment_count from public.user_equipment where user_id=p_user_id;

  for a in select * from public.achievements loop
    requirement := a.requirement;
    ok := true;
    if requirement ? 'quests_completed' then ok := ok and completed >= (requirement->>'quests_completed')::integer; end if;
    if requirement ? 'streak_days' then ok := ok and streak >= (requirement->>'streak_days')::integer; end if;
    if requirement ? 'equipment' then ok := ok and equipment_count >= (requirement->>'equipment')::integer; end if;
    if requirement ? 'level' then ok := ok and p.level >= (requirement->>'level')::integer; end if;
    if requirement ? 'xp' then ok := ok and p.total_xp >= (requirement->>'xp')::integer; end if;
    if requirement ? 'category' then
      select count(*) into category_completed
      from public.user_quests uq join public.quests q on q.id=uq.quest_id
      where uq.user_id=p_user_id and uq.status='completed' and q.category=requirement->>'category';
      ok := ok and category_completed >= coalesce((requirement->>'quests_completed')::integer,1);
    end if;
    if ok then
      insert into public.user_achievements(user_id,achievement_id) values(p_user_id,a.id) on conflict do nothing;
    end if;
  end loop;
end; $$;

-- ---------- Quest completion: XP + level + streak + attribute + achievements ----------
create or replace function public.complete_quest(p_quest_id bigint)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  uid uuid := auth.uid();
  q public.quests%rowtype;
  existing public.user_quests%rowtype;
  p public.profiles%rowtype;
  new_total integer;
  new_in_level integer;
  new_level integer;
  next_cost integer;
  leveled boolean := false;
  new_streak integer;
  new_rate numeric(5,2);
  attr_name text;
  unlocked integer := 0;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  select * into q from public.quests where id=p_quest_id and active=true;
  if not found then raise exception 'Quest not found'; end if;
  select * into existing from public.user_quests where user_id=uid and quest_id=p_quest_id;
  if found and existing.status='completed' then raise exception 'Quest already completed'; end if;
  select * into p from public.profiles where id=uid for update;

  new_total := p.total_xp + q.xp_reward;
  new_in_level := p.xp_in_level + q.xp_reward;
  new_level := p.level;
  next_cost := p.xp_to_next_level;
  while new_in_level >= next_cost loop
    new_in_level := new_in_level - next_cost;
    new_level := new_level + 1;
    next_cost := greatest(500, round(next_cost * 1.15));
    leveled := true;
  end loop;

  -- A completion counts toward the current streak once per calendar day.
  if not exists (
    select 1 from public.user_quests
    where user_id=uid and status='completed' and completed_at::date=current_date
  ) then
    new_streak := p.streak_days + 1;
  else
    new_streak := p.streak_days;
  end if;

  select coalesce(round(100.0 * count(*) filter (where status='completed') / nullif(count(*),0),2),0)
  into new_rate from public.user_quests where user_id=uid;

  update public.profiles
  set level=new_level,total_xp=new_total,xp_in_level=new_in_level,xp_to_next_level=next_cost,
      streak_days=new_streak,completion_rate=new_rate,updated_at=now()
  where id=uid;

  insert into public.user_quests(user_id,quest_id,status,progress,started_at,completed_at,xp_earned)
  values(uid,p_quest_id,'completed',100,coalesce(existing.started_at,now()),now(),q.xp_reward)
  on conflict(user_id,quest_id) do update set status='completed',progress=100,completed_at=now(),xp_earned=q.xp_reward;

  attr_name := q.category;
  update public.attributes
  set percentage=least(100, percentage + greatest(1, round(q.xp_reward/20.0))::integer),
      level=greatest(level, 1 + floor((least(100, percentage + greatest(1, round(q.xp_reward/20.0))::integer))/10)::integer),
      updated_at=now()
  where user_id=uid and name=attr_name;

  perform public.refresh_achievements(uid);
  select count(*) into unlocked from public.user_achievements where user_id=uid;

  return jsonb_build_object(
    'xpEarned',q.xp_reward,'totalXp',new_total,'xpInLevel',new_in_level,
    'xpToNextLevel',next_cost,'level',new_level,'leveledUp',leveled,
    'streakDays',new_streak,'completionRate',new_rate,'achievementCount',unlocked
  );
end; $$;

grant execute on function public.complete_quest(bigint) to authenticated;

-- ---------- Skills ----------
create or replace function public.unlock_skill(p_skill_id bigint)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  uid uuid := auth.uid(); p public.profiles%rowtype; s public.skills%rowtype;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  select * into p from public.profiles where id=uid for update;
  select * into s from public.skills where id=p_skill_id;
  if not found then raise exception 'Skill not found'; end if;
  if p.level < s.required_level then raise exception 'Level % required', s.required_level; end if;
  if p.skill_points < s.cost then raise exception 'Not enough skill points'; end if;
  if exists(select 1 from public.user_skills where user_id=uid and skill_id=p_skill_id) then raise exception 'Skill already unlocked'; end if;
  insert into public.user_skills(user_id,skill_id,skill_level) values(uid,p_skill_id,1);
  update public.profiles set skill_points=skill_points-s.cost,updated_at=now() where id=uid;
  return jsonb_build_object('skillId',p_skill_id,'skillPointsLeft',p.skill_points-s.cost);
end; $$;
grant execute on function public.unlock_skill(bigint) to authenticated;

-- ---------- Equipment acquisition/equip ----------
create or replace function public.equip_item(p_equipment_id bigint)
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); e public.equipment%rowtype; u public.user_equipment%rowtype; begin
  if uid is null then raise exception 'Not authenticated'; end if;
  select * into e from public.equipment where id=p_equipment_id;
  if not found then raise exception 'Equipment not found'; end if;
  select * into u from public.user_equipment where user_id=uid and equipment_id=p_equipment_id for update;
  if not found then raise exception 'Equipment not owned'; end if;
  update public.user_equipment set equipped=false where user_id=uid and equipment_id<>p_equipment_id and equipped=true and (select type from public.equipment where id=equipment_id)=e.type;
  update public.user_equipment set equipped=true where id=u.id;
  perform public.refresh_achievements(uid);
  return jsonb_build_object('equipmentId',p_equipment_id,'equipped',true);
end; $$;
grant execute on function public.equip_item(bigint) to authenticated;

create or replace function public.acquire_equipment(p_equipment_id bigint, p_quantity integer default 1)
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); e public.equipment%rowtype; qty integer; begin
  if uid is null then raise exception 'Not authenticated'; end if;
  if p_quantity<1 then raise exception 'Quantity must be positive'; end if;
  select * into e from public.equipment where id=p_equipment_id;
  if not found then raise exception 'Equipment not found'; end if;
  insert into public.user_equipment(user_id,equipment_id,quantity) values(uid,p_equipment_id,p_quantity)
  on conflict(user_id,equipment_id) do update set quantity=public.user_equipment.quantity+excluded.quantity;
  select quantity into qty from public.user_equipment where user_id=uid and equipment_id=p_equipment_id;
  perform public.refresh_achievements(uid);
  return jsonb_build_object('equipmentId',p_equipment_id,'quantity',qty);
end; $$;
grant execute on function public.acquire_equipment(bigint,integer) to authenticated;

-- ---------- Gacha: weighted server-side reward + ticket deduction + inventory/history ----------
create or replace function public.open_gacha()
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  uid uuid:=auth.uid(); p public.profiles%rowtype; item public.gacha_items%rowtype; total_weight numeric; roll numeric; cursor_weight numeric:=0; eq public.equipment%rowtype; history_id bigint; remaining integer;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  select * into p from public.profiles where id=uid for update;
  if p.tickets < 1 then raise exception 'No tickets available'; end if;
  select coalesce(sum(weight),0) into total_weight from public.gacha_items;
  if total_weight<=0 then raise exception 'Gacha is not configured'; end if;
  roll := random()*total_weight;
  for item in select * from public.gacha_items order by id loop
    cursor_weight := cursor_weight + item.weight;
    if roll <= cursor_weight then exit; end if;
  end loop;
  update public.profiles set tickets=tickets-1,updated_at=now() where id=uid returning tickets into remaining;
  insert into public.gacha_history(user_id,gacha_item_id) values(uid,item.id) returning id into history_id;

  select * into eq from public.equipment where lower(name)=lower(item.name) or lower(name)=lower(replace(item.name,'Blade','Focus Blade')) limit 1;
  if found then perform public.acquire_equipment(eq.id,1); end if;
  perform public.refresh_achievements(uid);
  return jsonb_build_object('id',item.id,'name',item.name,'description',item.description,'icon',item.icon,'rarity',item.rarity,'color',item.color,'ticketsLeft',remaining,'historyId',history_id);
end; $$;
grant execute on function public.open_gacha() to authenticated;

-- ---------- Write policies for server functions ----------
drop policy if exists "own skills insert" on public.user_skills;
create policy "own skills insert" on public.user_skills for insert to authenticated with check(auth.uid()=user_id);

-- The game mutations are intentionally performed through SECURITY DEFINER RPCs.
-- Keep direct client UPDATE/INSERT access restrictive.
drop policy if exists "own user quests insert" on public.user_quests;
drop policy if exists "own user quests update" on public.user_quests;

-- Recompute existing users' achievements after applying this migration.
do $$ declare r record; begin for r in select id from public.profiles loop perform public.refresh_achievements(r.id); end loop; end $$;
