-- Delete the current daily key entry so it can regenerate with the new key/ format
DELETE FROM public.daily_keys WHERE date = CURRENT_DATE;