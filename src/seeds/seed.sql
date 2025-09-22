-- cria tabelas via migrations (se não usar migrations, ativar synchronize=true temporariamente)


-- departamentos
INSERT INTO "department" (name) VALUES ('Humanidades'), ('Matemática'), ('Física');


-- titulos
INSERT INTO "title" (name) VALUES ('Professor'), ('Assistente');


-- professores
INSERT INTO "professor" (name, departmentId, titleId, isDirector) VALUES
('Profesor Girafales', 1, 1, true),
('Dona Clotilde', 1, 2, false);


-- predemos blocos/rooms/buildings
INSERT INTO "building" (name) VALUES ('Prédio A'), ('Prédio B');
INSERT INTO "room" (name, buildingId) VALUES ('Sala 101', 1), ('Sala 102', 1), ('Sala 201', 2);


-- subjects
INSERT INTO "subject" (subject_id, code, name) VALUES ('SUB001','MAT101','Matemática Básica'), ('SUB002','FIS101','Física I');


-- prerequisite
INSERT INTO "subject_prerequisite" ("subjectId", "prerequisiteId") VALUES (2,1);


-- classes
INSERT INTO "class" ("subjectId", year, semester, code) VALUES (1,2025,'1','MAT101-A');


-- schedules
INSERT INTO "class_schedule" ("classId","roomId", day_of_week, start_time, end_time) VALUES (1,1,'MON','08:00:00','10:00:00');



-- SELECT p.id, p.name, SUM(EXTRACT(EPOCH FROM (cs.end_time - cs.start_time))/3600) as hours_per_week
-- FROM professor p
-- LEFT JOIN subject s ON s.taught_byId = p.id
-- LEFT JOIN class c ON c."subjectId" = s.id
-- LEFT JOIN class_schedule cs ON cs."classId" = c.id
-- GROUP BY p.id, p.name;