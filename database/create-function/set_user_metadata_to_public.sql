create or replace function public.set_user_metadata_to_public()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if strpos(new.raw_user_meta_data ->> 'iss', 'twitter') > 0 then
    insert into public.users_public (user_id, display_name, avatar, avatar_thumb, avatar_stored, x_username)
    values (
      new.id,
      new.raw_user_meta_data ->> 'full_name',
      case 
        when strpos(new.raw_user_meta_data ->> 'avatar_url', '_normal') > 0 then
          replace(new.raw_user_meta_data ->> 'avatar_url', '_normal', '')
        else
          new.raw_user_meta_data ->> 'avatar_url'
      end,
      new.raw_user_meta_data ->> 'avatar_url',
      false,
      new.raw_user_meta_data ->> 'user_name'
    ) on conflict (user_id) do update
    set
      display_name = new.raw_user_meta_data ->> 'full_name',
      avatar = case 
        when strpos(new.raw_user_meta_data ->> 'avatar_url', '_normal') > 0 then
          replace(new.raw_user_meta_data ->> 'avatar_url', '_normal', '')
        else
          new.raw_user_meta_data ->> 'avatar_url'
      end,
      avatar_thumb = new.raw_user_meta_data ->> 'avatar_url',
      avatar_stored = false,
      x_username = new.raw_user_meta_data ->> 'user_name';
  else
    insert into public.users_public (user_id, display_name, avatar, avatar_thumb, avatar_stored)
    values (
      new.id,
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'avatar_url',
      false
    ) on conflict (user_id) do update
    set
      display_name = new.raw_user_meta_data ->> 'full_name',
      avatar = new.raw_user_meta_data ->> 'avatar_url',
      avatar_thumb = new.raw_user_meta_data ->> 'avatar_url',
      avatar_stored = false;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.set_user_metadata_to_public();

create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.set_user_metadata_to_public();
