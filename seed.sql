INSERT INTO empleados (nombre, uid_rfid, activo) VALUES
('Juan Perez', '11:22:33:44', 1),
('Maria Gomez', 'AA:BB:CC:DD', 1),
('Carlos Rodriguez', '12:34:56:78', 1),
('Ana Martinez', '04:11:22:33', 1),
('Luis Fernandez', 'AB:CD:EF:12', 1),
('Sofia Lopez', '98:76:54:32', 1),
('Pedro Sanchez', '10:20:30:40', 0),
('Lucia Torres', 'F1:E2:D3:C4', 1),
('Martin Ruiz', '55:66:77:88', 1),
('Valentina Castro', '01:02:03:04', 1);

INSERT INTO registro_accesos (
    empleado_id,
    uid_rfid,
    acceso_permitido,
    fecha_hora
)
VALUES
(1, '11:22:33:44', 1, NOW()),
(2, 'AA:BB:CC:DD', 1, NOW()),
(NULL, '99:99:99:99', 0, NOW()),
(4, '04:11:22:33', 1, NOW()),
(NULL, '00:00:00:00', 0, NOW());