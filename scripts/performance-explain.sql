-- Run only on the isolated fixture database after seeding.
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, display_name, email, team_id FROM participants
WHERE tournament_institution_id='institution-0'
ORDER BY display_name,id LIMIT 100;

EXPLAIN (ANALYZE, BUFFERS)
SELECT x.id,x.name,i.name FROM teams x JOIN tournament_institutions i
ON i.id=x.tournament_institution_id WHERE i.tournament_id='fixture-tournament'
ORDER BY i.name,i.id,x.name,x.id LIMIT 100;

EXPLAIN (ANALYZE, BUFFERS)
SELECT id,name FROM tournament_institutions WHERE tournament_id='fixture-tournament'
ORDER BY name,id LIMIT 100;

EXPLAIN (ANALYZE, BUFFERS)
SELECT id,display_name FROM adjudicators WHERE tournament_id='fixture-tournament'
AND status='WITHDRAWN' ORDER BY status,display_name,id LIMIT 100;
