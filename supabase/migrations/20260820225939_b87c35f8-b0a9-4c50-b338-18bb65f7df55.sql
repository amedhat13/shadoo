UPDATE public.missions m
SET questions = (
  SELECT jsonb_agg(
    CASE
      WHEN q->>'id' = 'q-recommend' THEN q || '{"metric_key":"nps"}'::jsonb
      WHEN q->>'id' = 'q-satisfaction' THEN q || '{"metric_key":"csat"}'::jsonb
      WHEN q->>'id' IN ('q-taste','q-cleanliness') THEN q || '{"metric_key":"top_2_box"}'::jsonb
      WHEN q->>'type' = 'rating' THEN q || '{"metric_key":"overall_score"}'::jsonb
      WHEN q->>'type' = 'yes_no' THEN q || '{"metric_key":"compliance"}'::jsonb
      ELSE q
    END
    ORDER BY ord
  )
  FROM jsonb_array_elements(m.questions) WITH ORDINALITY AS t(q, ord)
)
WHERE jsonb_typeof(m.questions) = 'array' AND jsonb_array_length(m.questions) > 0;