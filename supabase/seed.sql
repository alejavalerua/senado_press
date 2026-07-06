-- Seed: Senadores Colombia 2022-2026 y usuarios iniciales
-- Las contraseñas se hashean en la app; aquí van placeholders.
-- Ejecutar el script de seed de usuarios desde la app o usar los hashes generados.

INSERT INTO senators (full_name, party, caucus) VALUES
-- Pacto Histórico
('Gustavo Bolívar', 'Pacto Histórico', 'Pacto Histórico'),
('Aída Avella', 'Pacto Histórico', 'Pacto Histórico'),
('Alexander López Maya', 'Pacto Histórico', 'Pacto Histórico'),
('Antonio Sanguino', 'Pacto Histórico', 'Pacto Histórico'),
('Ariel Ávila', 'Pacto Histórico', 'Pacto Histórico'),
('Catalina del Socorro Pérez', 'Pacto Histórico', 'Pacto Histórico'),
('Feliciano Valencia', 'Pacto Histórico', 'Pacto Histórico'),
('Gloria Inés Flórez', 'Pacto Histórico', 'Pacto Histórico'),
('Gustavo Petro', 'Pacto Histórico', 'Pacto Histórico'),
('Humberto de la Calle', 'Pacto Histórico', 'Pacto Histórico'),
('Iván Cepeda', 'Pacto Histórico', 'Pacto Histórico'),
('María José Pizarro', 'Pacto Histórico', 'Pacto Histórico'),
('Nadia Blel Scaff', 'Pacto Histórico', 'Pacto Histórico'),
('Sandra Ramírez', 'Pacto Histórico', 'Pacto Histórico'),
('Sor Berenice Bedoya', 'Pacto Histórico', 'Pacto Histórico'),
-- Centro Democrático
('Carlos Fernando Motoa', 'Centro Democrático', 'Centro Democrático'),
('Efraín Cepeda', 'Centro Democrático', 'Centro Democrático'),
('Miguel Uribe Turbay', 'Centro Democrático', 'Centro Democrático'),
('Paloma Valencia', 'Centro Democrático', 'Centro Democrático'),
('Santiago Valencia', 'Centro Democrático', 'Centro Democrático'),
-- Partido Liberal
('Juan Diego Gómez', 'Partido Liberal', 'Partido Liberal'),
('Juan Manuel Galán', 'Partido Liberal', 'Partido Liberal'),
('Rodrigo Lara Restrepo', 'Partido Liberal', 'Partido Liberal'),
('Sor Berenice Bedoya', 'Partido Liberal', 'Partido Liberal'),
-- Partido Conservador
('Efraín Cepeda Sarabia', 'Partido Conservador', 'Partido Conservador'),
('Hugo Alfredo Estupiñán', 'Partido Conservador', 'Partido Conservador'),
('Sor Berenice Bedoya', 'Partido Conservador', 'Partido Conservador'),
-- Cambio Radical
('David Luna', 'Cambio Radical', 'Cambio Radical'),
('Germán Varón', 'Cambio Radical', 'Cambio Radical'),
('Rodrigo Lara Restrepo', 'Cambio Radical', 'Cambio Radical'),
-- Otros / Independientes
('Angélica Lozano', 'Independiente', 'Verdes'),
('Antonio Sanguino', 'Independiente', 'Alianza Verde'),
('Catalina del Socorro Pérez', 'Independiente', 'MIRA'),
('Feliciano Valencia', 'Independiente', 'Comunes'),
('Gloria Inés Flórez', 'Alianza Verde', 'Alianza Verde'),
('Humberto de la Calle', 'Independiente', 'Coalición Centro Esperanza'),
('Iván Cepeda', 'Polo Democrático', 'Polo Democrático'),
('María José Pizarro', 'Independiente', 'Sin Partido'),
('Nadia Blel Scaff', 'Partido Conservador', 'Partido Conservador'),
('Paloma Valencia', 'Centro Democrático', 'Centro Democrático'),
('Sandra Ramírez', 'Comunes', 'Comunes'),
('Sor Berenice Bedoya', 'ASI', 'ASI');

-- Nota: Los usuarios (periodistas y admin) se crean con:
-- npm run seed  (script incluido en el proyecto)
-- Contraseñas por defecto documentadas en README