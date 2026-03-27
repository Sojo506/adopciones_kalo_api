BEGIN

    -- ============================================================
    -- FIDE_ESTADO_TB 
    -- ============================================================
    FIDE_ESTADO_INSERT_SP(  'Activo');
    FIDE_ESTADO_INSERT_SP(  'Inactivo');
    FIDE_ESTADO_INSERT_SP(  'Pendiente');
    FIDE_ESTADO_INSERT_SP(  'En proceso');
    FIDE_ESTADO_INSERT_SP(  'Completado');
    FIDE_ESTADO_INSERT_SP(  'Rechazado');
    FIDE_ESTADO_INSERT_SP(  'Cancelado');
    FIDE_ESTADO_INSERT_SP(  'En revisión');
    FIDE_ESTADO_INSERT_SP(  'Aprobado');
    FIDE_ESTADO_INSERT_SP( 'Archivado');
    FIDE_ESTADO_INSERT_SP( 'Suspendido');
    FIDE_ESTADO_INSERT_SP( 'En espera');
    FIDE_ESTADO_INSERT_SP( 'Vencido');
    FIDE_ESTADO_INSERT_SP( 'Devuelto');
    FIDE_ESTADO_INSERT_SP( 'Finalizado');

    -- ============================================================
    -- FIDE_TIPO_USUARIO_TB 
    -- ============================================================
    FIDE_TIPO_USUARIO_INSERT_SP( 'Administrador',   1);
    FIDE_TIPO_USUARIO_INSERT_SP( 'Cliente',         1);
    FIDE_TIPO_USUARIO_INSERT_SP( 'Adoptante',       1);
    FIDE_TIPO_USUARIO_INSERT_SP( 'Voluntario',      1);

    -- ============================================================
    -- FIDE_PAIS_TB
    -- ============================================================
    FIDE_PAIS_INSERT_SP(  'Costa Rica',        1);
    FIDE_PAIS_INSERT_SP(  'Panamá',            1);
    FIDE_PAIS_INSERT_SP(  'Nicaragua',         1);
    FIDE_PAIS_INSERT_SP(  'Honduras',          1);
    FIDE_PAIS_INSERT_SP(  'El Salvador',       1);
    FIDE_PAIS_INSERT_SP(  'Guatemala',         1);
    FIDE_PAIS_INSERT_SP(  'México',            1);
    FIDE_PAIS_INSERT_SP(  'Colombia',          1);
    FIDE_PAIS_INSERT_SP(  'Venezuela',         1);
    FIDE_PAIS_INSERT_SP( 'Ecuador',           1);

    -- ============================================================
    -- FIDE_PROVINCIA_TB
    -- ============================================================
    FIDE_PROVINCIA_INSERT_SP(  'San José',    1, 1);
    FIDE_PROVINCIA_INSERT_SP(  'Alajuela',    1, 1);
    FIDE_PROVINCIA_INSERT_SP(  'Cartago',     1, 1);
    FIDE_PROVINCIA_INSERT_SP(  'Heredia',     1, 1);
    FIDE_PROVINCIA_INSERT_SP(  'Guanacaste',  1, 1);
    FIDE_PROVINCIA_INSERT_SP(  'Puntarenas',  1, 1);
    FIDE_PROVINCIA_INSERT_SP(  'Limón',       1, 1);
    FIDE_PROVINCIA_INSERT_SP(  'Chiriquí',    2, 1);
    FIDE_PROVINCIA_INSERT_SP(  'Colón',       2, 1);
    FIDE_PROVINCIA_INSERT_SP( 'Managua',     3, 1);

    -- ============================================================
    -- FIDE_CANTON_TB  (12 existentes + nuevos)
    -- ============================================================
    FIDE_CANTON_INSERT_SP(  'San José',            1,  1);
    FIDE_CANTON_INSERT_SP(  'Escazú',              1,  1);
    FIDE_CANTON_INSERT_SP(  'Desamparados',        1,  1);
    FIDE_CANTON_INSERT_SP(  'Santa Ana',           1,  1);
    FIDE_CANTON_INSERT_SP(  'Alajuela Centro',     2,  1);
    FIDE_CANTON_INSERT_SP(  'San Ramón',           2,  1);
    FIDE_CANTON_INSERT_SP(  'Cartago Centro',      3,  1);
    FIDE_CANTON_INSERT_SP(  'Turrialba',           3,  1);
    FIDE_CANTON_INSERT_SP(  'Heredia Centro',      4,  1);
    FIDE_CANTON_INSERT_SP( 'Santo Domingo',       4,  1);
    FIDE_CANTON_INSERT_SP( 'Liberia',             5,  1);
    FIDE_CANTON_INSERT_SP( 'Nicoya',              5,  1);
    FIDE_CANTON_INSERT_SP( 'Puriscal',            1,  1);
    FIDE_CANTON_INSERT_SP( 'Aserrí',              1,  1);
    FIDE_CANTON_INSERT_SP( 'Moravia',             1,  1);
    FIDE_CANTON_INSERT_SP( 'Tibás',               1,  1);
    FIDE_CANTON_INSERT_SP( 'Goicoechea',          1,  1);
    FIDE_CANTON_INSERT_SP( 'La Unión',            3,  1);
    FIDE_CANTON_INSERT_SP( 'Oreamuno',            3,  1);
    FIDE_CANTON_INSERT_SP( 'Grecia',              2,  1);
    FIDE_CANTON_INSERT_SP( 'Naranjo',             2,  1);
    FIDE_CANTON_INSERT_SP( 'Palmares',            2,  1);
    FIDE_CANTON_INSERT_SP( 'Belén',               4,  1);
    FIDE_CANTON_INSERT_SP( 'Flores',              4,  1);
    FIDE_CANTON_INSERT_SP( 'Barva',               4,  1);

    -- ============================================================
    -- FIDE_DISTRITO_TB  (15 existentes + nuevos hasta 50+)
    -- ============================================================
    FIDE_DISTRITO_INSERT_SP(  'Carmen',              1,  1);
    FIDE_DISTRITO_INSERT_SP(  'Merced',              1,  1);
    FIDE_DISTRITO_INSERT_SP(  'Escazú Centro',       2,  1);
    FIDE_DISTRITO_INSERT_SP(  'San Antonio',         2,  1);
    FIDE_DISTRITO_INSERT_SP(  'Desamparados',        3,  1);
    FIDE_DISTRITO_INSERT_SP(  'Patarrá',             3,  1);
    FIDE_DISTRITO_INSERT_SP(  'Santa Ana Centro',    4,  1);
    FIDE_DISTRITO_INSERT_SP(  'Pozos',               4,  1);
    FIDE_DISTRITO_INSERT_SP(  'Alajuela Centro',     5,  1);
    FIDE_DISTRITO_INSERT_SP( 'San José',            5,  1);
    FIDE_DISTRITO_INSERT_SP( 'Heredia Centro',      9,  1);
    FIDE_DISTRITO_INSERT_SP( 'Ulloa',               9,  1);
    FIDE_DISTRITO_INSERT_SP( 'Liberia Centro',      11, 1);
    FIDE_DISTRITO_INSERT_SP( 'Nicoya Centro',       12, 1);
    FIDE_DISTRITO_INSERT_SP( 'Cartago Centro',      7,  1);
    FIDE_DISTRITO_INSERT_SP( 'Hospital',            1,  1);
    FIDE_DISTRITO_INSERT_SP( 'Catedral',            1,  1);
    FIDE_DISTRITO_INSERT_SP( 'Zapote',              1,  1);
    FIDE_DISTRITO_INSERT_SP( 'San Francisco',       1,  1);
    FIDE_DISTRITO_INSERT_SP( 'Uruca',               1,  1);
    FIDE_DISTRITO_INSERT_SP( 'Hatillo',             1,  1);
    FIDE_DISTRITO_INSERT_SP( 'San Sebastián',       1,  1);
    FIDE_DISTRITO_INSERT_SP( 'Guachipelín',         2,  1);
    FIDE_DISTRITO_INSERT_SP( 'San Rafael',          2,  1);
    FIDE_DISTRITO_INSERT_SP( 'San Ignacio',         3,  1);
    FIDE_DISTRITO_INSERT_SP( 'Frailes',             3,  1);
    FIDE_DISTRITO_INSERT_SP( 'Gravilias',           3,  1);
    FIDE_DISTRITO_INSERT_SP( 'Los Guido',           3,  1);
    FIDE_DISTRITO_INSERT_SP( 'Salitral',            4,  1);
    FIDE_DISTRITO_INSERT_SP( 'Brasil',              4,  1);
    FIDE_DISTRITO_INSERT_SP( 'La Trinidad',         5,  1);
    FIDE_DISTRITO_INSERT_SP( 'Desamparados (Alaj)', 5,  1);
    FIDE_DISTRITO_INSERT_SP( 'Santiago',            6,  1);
    FIDE_DISTRITO_INSERT_SP( 'Ángeles',             6,  1);
    FIDE_DISTRITO_INSERT_SP( 'San Nicolás',         7,  1);
    FIDE_DISTRITO_INSERT_SP( 'Aguacaliente',        7,  1);
    FIDE_DISTRITO_INSERT_SP( 'Carmen (Cartago)',    7,  1);
    FIDE_DISTRITO_INSERT_SP( 'San Francisco (Tur)', 8,  1);
    FIDE_DISTRITO_INSERT_SP( 'Chirripó',            8,  1);
    FIDE_DISTRITO_INSERT_SP( 'San Pablo',           9,  1);
    FIDE_DISTRITO_INSERT_SP( 'San Francisco (Her)', 9,  1);
    FIDE_DISTRITO_INSERT_SP( 'Santo Domingo',       10, 1);
    FIDE_DISTRITO_INSERT_SP( 'Santa Rosa',          10, 1);
    FIDE_DISTRITO_INSERT_SP( 'San Miguel',          10, 1);
    FIDE_DISTRITO_INSERT_SP( 'Nacascolo',           11, 1);
    FIDE_DISTRITO_INSERT_SP( 'Cañas Dulces',        11, 1);
    FIDE_DISTRITO_INSERT_SP( 'Mansion',             12, 1);
    FIDE_DISTRITO_INSERT_SP( 'San Antonio (Nic)',   12, 1);
    FIDE_DISTRITO_INSERT_SP( 'Quebrada Honda',      12, 1);
    FIDE_DISTRITO_INSERT_SP( 'Sámara',              12, 1);
    FIDE_DISTRITO_INSERT_SP( 'Nosara',              12, 1);
    FIDE_DISTRITO_INSERT_SP( 'Belén de Nosarita',   12, 1);

    -- ============================================================
    -- FIDE_DIRECCION_TB  
    -- ============================================================
    FIDE_DIRECCION_INSERT_SP(  1,  'Calle 3',              '125',  1);
    FIDE_DIRECCION_INSERT_SP(  2,  'Avenida 5',            '47',   1);
    FIDE_DIRECCION_INSERT_SP(  3,  'Calle del Cedro',      '200',  1);
    FIDE_DIRECCION_INSERT_SP(  4,  'Calle Las Palmas',     '88',   1);
    FIDE_DIRECCION_INSERT_SP(  5,  'Avenida Central',      '310',  1);
    FIDE_DIRECCION_INSERT_SP(  6,  'Calle 7',              '14',   1);
    FIDE_DIRECCION_INSERT_SP(  7,  'Calle Los Robles',     '55',   1);
    FIDE_DIRECCION_INSERT_SP(  8,  'Avenida 2',            '103',  1);
    FIDE_DIRECCION_INSERT_SP(  9,  'Calle Principal',      '270',  1);
    FIDE_DIRECCION_INSERT_SP( 10, 'Calle Vieja',          '39',   1);
    FIDE_DIRECCION_INSERT_SP( 11, 'Calle Real',           '180',  1);
    FIDE_DIRECCION_INSERT_SP( 12, 'Barrio Los Pinos',     '62',   1);
    FIDE_DIRECCION_INSERT_SP( 13, 'Calle del Guanacaste', '91',   1);
    FIDE_DIRECCION_INSERT_SP( 14, 'Avenida Nicoya',       '44',   1);
    FIDE_DIRECCION_INSERT_SP( 15, 'Calle Cartago',        '77',   1);
    FIDE_DIRECCION_INSERT_SP( 1,  'Avenida 8',            '221',  1);
    FIDE_DIRECCION_INSERT_SP( 3,  'Calle Los Ángeles',    '33',   1);
    FIDE_DIRECCION_INSERT_SP( 5,  'Avenida Alajuela',     '506',  1);
    FIDE_DIRECCION_INSERT_SP( 7,  'Calle Santa Ana',      '19',   1);
    FIDE_DIRECCION_INSERT_SP( 11, 'Avenida Heredia',      '412',  1);
    FIDE_DIRECCION_INSERT_SP( 16, 'Calle del Hospital',   '8',    1);
    FIDE_DIRECCION_INSERT_SP( 17, 'Avenida Catedral',     '305',  1);
    FIDE_DIRECCION_INSERT_SP( 18, 'Calle Zapote',         '76',   1);
    FIDE_DIRECCION_INSERT_SP( 19, 'Barrio Los Yoses',     '140',  1);
    FIDE_DIRECCION_INSERT_SP( 20, 'Residencial La Uruca', '22',   1);
    FIDE_DIRECCION_INSERT_SP( 21, 'Sector Hatillo 3',     '55',   1);
    FIDE_DIRECCION_INSERT_SP( 22, 'Calle Larga',          '300',  1);
    FIDE_DIRECCION_INSERT_SP( 23, 'Condominio Guachipelín','101', 1);
    FIDE_DIRECCION_INSERT_SP( 24, 'Calle de la Iglesia',  '17',   1);
    FIDE_DIRECCION_INSERT_SP( 25, 'Barrio San Ignacio',   '450',  1);
    FIDE_DIRECCION_INSERT_SP( 26, 'Finca Las Frailes',    '2',    1);
    FIDE_DIRECCION_INSERT_SP( 27, 'Residencias Gravilias','88',   1);
    FIDE_DIRECCION_INSERT_SP( 28, 'Condominios Los Guido','33',   1);
    FIDE_DIRECCION_INSERT_SP( 29, 'Calle Salitral',       '200',  1);
    FIDE_DIRECCION_INSERT_SP( 30, 'Residencial Brasil',   '119',  1);
    FIDE_DIRECCION_INSERT_SP( 31, 'Calle Trinidad',       '67',   1);
    FIDE_DIRECCION_INSERT_SP( 32, 'Avenida Norte',        '88',   1);
    FIDE_DIRECCION_INSERT_SP( 33, 'Barrio Nuevo Santiago', '14',  1);
    FIDE_DIRECCION_INSERT_SP( 34, 'Calle de los Ángeles', '505',  1);
    FIDE_DIRECCION_INSERT_SP( 35, 'Calle San Nicolás',    '39',   1);
    FIDE_DIRECCION_INSERT_SP( 36, 'Residencial Agua Caliente','77',1);
    FIDE_DIRECCION_INSERT_SP( 37, 'Barrio Carmen',        '100',  1);
    FIDE_DIRECCION_INSERT_SP( 38, 'Calle Turrialba Norte','210',  1);
    FIDE_DIRECCION_INSERT_SP( 39, 'Comunidad Chirripó',   '5',    1);
    FIDE_DIRECCION_INSERT_SP( 40, 'Calle San Pablo',      '143',  1);
    FIDE_DIRECCION_INSERT_SP( 41, 'Barrio Jesús',         '62',   1);
    FIDE_DIRECCION_INSERT_SP( 42, 'Calle Santo Domingo',  '88',   1);
    FIDE_DIRECCION_INSERT_SP( 43, 'Finca Santa Rosa',     '3',    1);
    FIDE_DIRECCION_INSERT_SP( 44, 'Calle San Miguel',     '37',   1);
    FIDE_DIRECCION_INSERT_SP( 45, 'Playa Nacascolo',      '1',    1);
    FIDE_DIRECCION_INSERT_SP( 46, 'Camino a Cañas Dulces','44',   1);
    FIDE_DIRECCION_INSERT_SP( 47, 'Barrio Mansion',       '20',   1);
    FIDE_DIRECCION_INSERT_SP( 48, 'Calle La Victoria',    '99',   1);
    FIDE_DIRECCION_INSERT_SP( 49, 'Finca Quebrada Honda', '6',    1);
    FIDE_DIRECCION_INSERT_SP( 50, 'Playa Sámara',         '1',    1);

    -- ============================================================
    -- FIDE_USUARIO_TB  
    -- ============================================================
    FIDE_USUARIO_INSERT_SP('107340892', 'Carlos',    'Mora',        'Vásquez',    1,  1,  1);
    FIDE_USUARIO_INSERT_SP('302560178', 'María',     'Jiménez',     'Solano',     2,  2,  1);
    FIDE_USUARIO_INSERT_SP('205870341', 'Andrés',    'Rodríguez',   'Fonseca',    3,  2,  1);
    FIDE_USUARIO_INSERT_SP('109421567', 'Sofía',     'Castro',      'Méndez',     4,  3,  1);
    FIDE_USUARIO_INSERT_SP('401230984', 'Luis',      'Herrera',     'Quesada',    5,  2,  1);
    FIDE_USUARIO_INSERT_SP('603780234', 'Diana',     'Ulate',       'Brenes',     6,  3,  1);
    FIDE_USUARIO_INSERT_SP('110234567', 'Roberto',   'Vargas',      'Ramírez',    7,  4,  1);
    FIDE_USUARIO_INSERT_SP('207891023', 'Valeria',   'Quirós',      'Hidalgo',    8,  2,  1);
    FIDE_USUARIO_INSERT_SP('504120678', 'Javier',    'Solís',       'Araya',      9,  2,  1);
    FIDE_USUARIO_INSERT_SP('306540219', 'Natalia',   'Alvarado',    'Mora',       10, 2,  1);
    FIDE_USUARIO_INSERT_SP('111780345', 'Federico',  'Campos',      'Navarro',    11, 4,  1);
    FIDE_USUARIO_INSERT_SP('702340891', 'Patricia',  'Núñez',       'Chávez',     12, 3,  1);
    FIDE_USUARIO_INSERT_SP('208670123', 'Eduardo',   'Blanco',      'Cordero',    13, 2,  1);
    FIDE_USUARIO_INSERT_SP('405310782', 'Daniela',   'Aguilar',     'Sánchez',    14, 2,  1);
    FIDE_USUARIO_INSERT_SP('112560489', 'José',      'Vega',        'Picado',     15, 5,  1);
    FIDE_USUARIO_INSERT_SP('309890234', 'Ana',       'Rojas',       'Elizondo',   16, 2,  1);
    FIDE_USUARIO_INSERT_SP('206450987', 'Miguel',    'Orozco',      'Gómez',      17, 3,  1);
    FIDE_USUARIO_INSERT_SP('601230456', 'Laura',     'Salas',       'Villalobos', 18, 2,  1);
    FIDE_USUARIO_INSERT_SP('113780621', 'Adrián',    'Chacón',      'Zamora',     19, 4,  1);
    FIDE_USUARIO_INSERT_SP('407120893', 'Camila',    'Ruiz',        'Flores',     20, 2,  1);
    FIDE_USUARIO_INSERT_SP('310450178', 'Santiago',  'Mora',        'Arias',      1,  2,  1);
    FIDE_USUARIO_INSERT_SP('114230567', 'Gabriela',  'Pérez',       'Sandoval',   2,  3,  1);
    FIDE_USUARIO_INSERT_SP('209780341', 'Marco',     'León',        'Espinoza',   3,  2,  1);
    FIDE_USUARIO_INSERT_SP('506340892', 'Isabela',   'Zúñiga',      'Ulate',      4,  2,  1);
    FIDE_USUARIO_INSERT_SP('115670234', 'David',     'Acosta',      'Obando',     5,  2,  1);
    FIDE_USUARIO_INSERT_SP('118890123', 'Fernanda',  'Bolaños',     'Mora',       21, 2,  1);
    FIDE_USUARIO_INSERT_SP('311230456', 'Rodrigo',   'Chavarría',   'Ulate',      22, 2,  1);
    FIDE_USUARIO_INSERT_SP('210670789', 'Alejandra', 'Durán',       'Jiménez',    23, 3,  1);
    FIDE_USUARIO_INSERT_SP('509010122', 'Esteban',   'Esquivel',    'Castro',     24, 2,  1);
    FIDE_USUARIO_INSERT_SP('116340455', 'Melissa',   'Fuentes',     'Rodríguez',  25, 2,  1);
    FIDE_USUARIO_INSERT_SP('412780788', 'Carlos',    'Gamboa',      'Araya',      26, 2,  1);
    FIDE_USUARIO_INSERT_SP('313121121', 'Paola',     'Hidalgo',     'Vega',       27, 2,  1);
    FIDE_USUARIO_INSERT_SP('211561454', 'Mauricio',  'Jiménez',     'Salas',      28, 4,  1);
    FIDE_USUARIO_INSERT_SP('119001787', 'Carolina',  'Leiva',       'Blanco',     29, 2,  1);
    FIDE_USUARIO_INSERT_SP('314442120', 'Ignacio',   'Madrigal',    'Quirós',     30, 2,  1);
    FIDE_USUARIO_INSERT_SP('212882453', 'Verónica',  'Naranjo',     'Herrera',    31, 3,  1);
    FIDE_USUARIO_INSERT_SP('120322786', 'Sebastián', 'Ortega',      'Campos',     32, 2,  1);
    FIDE_USUARIO_INSERT_SP('415763119', 'Daniella',  'Porras',      'Nuñez',      33, 2,  1);
    FIDE_USUARIO_INSERT_SP('316203452', 'Fernando',  'Quesada',     'Soto',       34, 2,  1);
    FIDE_USUARIO_INSERT_SP('213643785', 'Rebeca',    'Ramírez',     'Mora',       35, 2,  1);
    FIDE_USUARIO_INSERT_SP('121084118', 'Alejandro', 'Solano',      'Vargas',     36, 4,  1);
    FIDE_USUARIO_INSERT_SP('416524451', 'Natalie',   'Torres',      'León',       37, 2,  1);
    FIDE_USUARIO_INSERT_SP('317964784', 'Josué',     'Ureña',       'Alvarado',   38, 2,  1);
    FIDE_USUARIO_INSERT_SP('215405117', 'Karen',     'Valverde',    'Rojas',      39, 3,  1);
    FIDE_USUARIO_INSERT_SP('122845450', 'Andrés',    'Zamora',      'Orozco',     40, 2,  1);
    FIDE_USUARIO_INSERT_SP('418285783', 'María',     'Abarca',      'Picado',     41, 2,  1);
    FIDE_USUARIO_INSERT_SP('319726116', 'Julián',    'Barboza',     'Elizondo',   42, 2,  1);
    FIDE_USUARIO_INSERT_SP('217166449', 'Nicole',    'Calvo',       'Gómez',      43, 2,  1);
    FIDE_USUARIO_INSERT_SP('124606782', 'Diego',     'Delgado',     'Villalobos', 44, 4,  1);
    FIDE_USUARIO_INSERT_SP('421047115', 'Valentina', 'Espinoza',    'Zamora',     45, 2,  1);
    FIDE_USUARIO_INSERT_SP('321487448', 'Gustavo',   'Flores',      'Chacón',     46, 5,  1);
    FIDE_USUARIO_INSERT_SP('218927781', 'Priscila',  'González',    'Ruiz',       47, 2,  1);
    FIDE_USUARIO_INSERT_SP('126368114', 'Héctor',    'Hernández',   'Brenes',     48, 2,  1);
    FIDE_USUARIO_INSERT_SP('422808447', 'Silvia',    'Ibáñez',      'Navarro',    49, 3,  1);
    FIDE_USUARIO_INSERT_SP('323248780', 'Tomás',     'Jiménez',     'Cordero',    50, 2,  1);
    FIDE_USUARIO_INSERT_SP('220689113', 'Andrea',    'Klotz',       'Sánchez',    51, 2,  1);
    FIDE_USUARIO_INSERT_SP('128129446', 'Ricardo',   'Lobo',        'Arias',      52, 2,  1);

    -- ============================================================
    -- FIDE_CORREO_TB 
    -- ============================================================
    FIDE_CORREO_INSERT_SP('107340892', 'carlos.mora@gmail.com',            1);
    FIDE_CORREO_INSERT_SP('302560178', 'mjimenez.solano@hotmail.com',      1);
    FIDE_CORREO_INSERT_SP('205870341', 'arodriguez@gmail.com',             1);
    FIDE_CORREO_INSERT_SP('109421567', 'sofia.castro@yahoo.com',           1);
    FIDE_CORREO_INSERT_SP('401230984', 'luisherrera.cr@gmail.com',         1);
    FIDE_CORREO_INSERT_SP('603780234', 'diana.ulate@outlook.com',          1);
    FIDE_CORREO_INSERT_SP('110234567', 'roberto.vargas@ucr.ac.cr',         1);
    FIDE_CORREO_INSERT_SP('207891023', 'valeria.quiros@gmail.com',         1);
    FIDE_CORREO_INSERT_SP('504120678', 'javier.solis@hotmail.com',         1);
    FIDE_CORREO_INSERT_SP('306540219', 'natalia.alvarado@gmail.com',       1);
    FIDE_CORREO_INSERT_SP('111780345', 'fcampos.vet@gmail.com',            1);
    FIDE_CORREO_INSERT_SP('702340891', 'patricia.nunez@yahoo.com',         1);
    FIDE_CORREO_INSERT_SP('208670123', 'eduardo.blanco@gmail.com',         1);
    FIDE_CORREO_INSERT_SP('405310782', 'daniela.aguilar@hotmail.com',      1);
    FIDE_CORREO_INSERT_SP('112560489', 'jose.vega.casacuna@gmail.com',     1);
    FIDE_CORREO_INSERT_SP('309890234', 'ana.rojas@outlook.com',            1);
    FIDE_CORREO_INSERT_SP('206450987', 'miguel.orozco@gmail.com',          1);
    FIDE_CORREO_INSERT_SP('601230456', 'laura.salas@yahoo.com',            1);
    FIDE_CORREO_INSERT_SP('113780621', 'adrian.chacon.vet@gmail.com',      1);
    FIDE_CORREO_INSERT_SP('407120893', 'camila.ruiz@hotmail.com',          1);
    FIDE_CORREO_INSERT_SP('310450178', 'santiago.mora@gmail.com',          1);
    FIDE_CORREO_INSERT_SP('114230567', 'gabriela.perez@outlook.com',       1);
    FIDE_CORREO_INSERT_SP('209780341', 'marco.leon@gmail.com',             1);
    FIDE_CORREO_INSERT_SP('506340892', 'isabela.zuniga@hotmail.com',       1);
    FIDE_CORREO_INSERT_SP('115670234', 'david.acosta@gmail.com',           1);
    FIDE_CORREO_INSERT_SP('118890123', 'fernanda.bolanos@gmail.com',       1);
    FIDE_CORREO_INSERT_SP('311230456', 'rodrigo.chavarria@outlook.com',    1);
    FIDE_CORREO_INSERT_SP('210670789', 'alejandra.duran@gmail.com',        1);
    FIDE_CORREO_INSERT_SP('509010122', 'esteban.esquivel@yahoo.com',       1);
    FIDE_CORREO_INSERT_SP('116340455', 'melissa.fuentes@gmail.com',        1);
    FIDE_CORREO_INSERT_SP('412780788', 'carlos.gamboa@hotmail.com',        1);
    FIDE_CORREO_INSERT_SP('313121121', 'paola.hidalgo@gmail.com',          1);
    FIDE_CORREO_INSERT_SP('211561454', 'mauricio.jimenez.vet@gmail.com',   1);
    FIDE_CORREO_INSERT_SP('119001787', 'carolina.leiva@outlook.com',       1);
    FIDE_CORREO_INSERT_SP('314442120', 'ignacio.madrigal@gmail.com',       1);
    FIDE_CORREO_INSERT_SP('212882453', 'veronica.naranjo@yahoo.com',       1);
    FIDE_CORREO_INSERT_SP('120322786', 'sebastian.ortega@gmail.com',       1);
    FIDE_CORREO_INSERT_SP('415763119', 'daniella.porras@hotmail.com',      1);
    FIDE_CORREO_INSERT_SP('316203452', 'fernando.quesada@gmail.com',       1);
    FIDE_CORREO_INSERT_SP('213643785', 'rebeca.ramirez@outlook.com',       1);
    FIDE_CORREO_INSERT_SP('121084118', 'alejandro.solano.vet@gmail.com',   1);
    FIDE_CORREO_INSERT_SP('416524451', 'natalie.torres@gmail.com',         1);
    FIDE_CORREO_INSERT_SP('317964784', 'josue.urena@hotmail.com',          1);
    FIDE_CORREO_INSERT_SP('215405117', 'karen.valverde@gmail.com',         1);
    FIDE_CORREO_INSERT_SP('122845450', 'andres.zamora@yahoo.com',          1);
    FIDE_CORREO_INSERT_SP('418285783', 'maria.abarca@gmail.com',           1);
    FIDE_CORREO_INSERT_SP('319726116', 'julian.barboza@outlook.com',       1);
    FIDE_CORREO_INSERT_SP('217166449', 'nicole.calvo@gmail.com',           1);
    FIDE_CORREO_INSERT_SP('124606782', 'diego.delgado.vet@gmail.com',      1);
    FIDE_CORREO_INSERT_SP('421047115', 'valentina.espinoza@hotmail.com',   1);
    FIDE_CORREO_INSERT_SP('321487448', 'gustavo.flores.casacuna@gmail.com',1);
    FIDE_CORREO_INSERT_SP('218927781', 'priscila.gonzalez@gmail.com',      1);
    FIDE_CORREO_INSERT_SP('126368114', 'hector.hernandez@outlook.com',     1);
    FIDE_CORREO_INSERT_SP('422808447', 'silvia.ibanez@gmail.com',          1);
    FIDE_CORREO_INSERT_SP('323248780', 'tomas.jimenez@yahoo.com',          1);
    FIDE_CORREO_INSERT_SP('220689113', 'andrea.klotz@gmail.com',           1);
    FIDE_CORREO_INSERT_SP('128129446', 'ricardo.lobo@hotmail.com',         1);

    -- ============================================================
    -- FIDE_TELEFONO_TB 
    -- ============================================================
    FIDE_TELEFONO_INSERT_SP('107340892', '88234501', 1);
    FIDE_TELEFONO_INSERT_SP('302560178', '72341890', 1);
    FIDE_TELEFONO_INSERT_SP('205870341', '83456712', 1);
    FIDE_TELEFONO_INSERT_SP('109421567', '65782340', 1);
    FIDE_TELEFONO_INSERT_SP('401230984', '87901234', 1);
    FIDE_TELEFONO_INSERT_SP('603780234', '71234568', 1);
    FIDE_TELEFONO_INSERT_SP('110234567', '89045671', 1);
    FIDE_TELEFONO_INSERT_SP('207891023', '64523890', 1);
    FIDE_TELEFONO_INSERT_SP('504120678', '88671203', 1);
    FIDE_TELEFONO_INSERT_SP('306540219', '73489012', 1);
    FIDE_TELEFONO_INSERT_SP('111780345', '89123450', 1);
    FIDE_TELEFONO_INSERT_SP('702340891', '60781234', 1);
    FIDE_TELEFONO_INSERT_SP('208670123', '84561230', 1);
    FIDE_TELEFONO_INSERT_SP('405310782', '76234890', 1);
    FIDE_TELEFONO_INSERT_SP('112560489', '88901234', 1);
    FIDE_TELEFONO_INSERT_SP('309890234', '72345678', 1);
    FIDE_TELEFONO_INSERT_SP('206450987', '83901456', 1);
    FIDE_TELEFONO_INSERT_SP('601230456', '65123780', 1);
    FIDE_TELEFONO_INSERT_SP('113780621', '89234567', 1);
    FIDE_TELEFONO_INSERT_SP('407120893', '74561289', 1);
    FIDE_TELEFONO_INSERT_SP('310450178', '85672340', 1);
    FIDE_TELEFONO_INSERT_SP('114230567', '63781290', 1);
    FIDE_TELEFONO_INSERT_SP('209780341', '88890123', 1);
    FIDE_TELEFONO_INSERT_SP('506340892', '71234900', 1);
    FIDE_TELEFONO_INSERT_SP('115670234', '84560122', 1);
    FIDE_TELEFONO_INSERT_SP('118890123', '86781234', 1);
    FIDE_TELEFONO_INSERT_SP('311230456', '73892345', 1);
    FIDE_TELEFONO_INSERT_SP('210670789', '89003456', 1);
    FIDE_TELEFONO_INSERT_SP('509010122', '64114567', 1);
    FIDE_TELEFONO_INSERT_SP('116340455', '87225678', 1);
    FIDE_TELEFONO_INSERT_SP('412780788', '72336789', 1);
    FIDE_TELEFONO_INSERT_SP('313121121', '88447890', 1);
    FIDE_TELEFONO_INSERT_SP('211561454', '65558901', 1);
    FIDE_TELEFONO_INSERT_SP('119001787', '87669012', 1);
    FIDE_TELEFONO_INSERT_SP('314442120', '73770123', 1);
    FIDE_TELEFONO_INSERT_SP('212882453', '88881234', 1);
    FIDE_TELEFONO_INSERT_SP('120322786', '64992345', 1);
    FIDE_TELEFONO_INSERT_SP('415763119', '87103456', 1);
    FIDE_TELEFONO_INSERT_SP('316203452', '72214567', 1);
    FIDE_TELEFONO_INSERT_SP('213643785', '88325678', 1);
    FIDE_TELEFONO_INSERT_SP('121084118', '65436789', 1);
    FIDE_TELEFONO_INSERT_SP('416524451', '87547890', 1);
    FIDE_TELEFONO_INSERT_SP('317964784', '72658901', 1);
    FIDE_TELEFONO_INSERT_SP('215405117', '88769012', 1);
    FIDE_TELEFONO_INSERT_SP('122845450', '64870123', 1);
    FIDE_TELEFONO_INSERT_SP('418285783', '87981234', 1);
    FIDE_TELEFONO_INSERT_SP('319726116', '73092345', 1);
    FIDE_TELEFONO_INSERT_SP('217166449', '88203456', 1);
    FIDE_TELEFONO_INSERT_SP('124606782', '65314567', 1);
    FIDE_TELEFONO_INSERT_SP('421047115', '87425678', 1);
    FIDE_TELEFONO_INSERT_SP('321487448', '72536789', 1);
    FIDE_TELEFONO_INSERT_SP('218927781', '88647890', 1);
    FIDE_TELEFONO_INSERT_SP('126368114', '64758901', 1);
    FIDE_TELEFONO_INSERT_SP('422808447', '87869012', 1);
    FIDE_TELEFONO_INSERT_SP('323248780', '72970123', 1);
    FIDE_TELEFONO_INSERT_SP('220689113', '88081234', 1);
    FIDE_TELEFONO_INSERT_SP('128129446', '65192345', 1);

    -- ============================================================
    -- FIDE_CUENTA_TB 
    -- ============================================================
    FIDE_CUENTA_INSERT_SP(  '107340892', 'carlos.mora',      'Carlos#2024',   1);
    FIDE_CUENTA_INSERT_SP(  '302560178', 'maria.jimenez',    'Maria#2024',    1);
    FIDE_CUENTA_INSERT_SP(  '205870341', 'andres.rod',       'Andres#2024',   1);
    FIDE_CUENTA_INSERT_SP(  '109421567', 'sofia.castro',     'Sofia#2024',    1);
    FIDE_CUENTA_INSERT_SP(  '401230984', 'luis.herrera',     'Luis#2024',     1);
    FIDE_CUENTA_INSERT_SP(  '603780234', 'diana.ulate',      'Diana#2024',    1);
    FIDE_CUENTA_INSERT_SP(  '110234567', 'roberto.vargas',   'Roberto#2024',  1);
    FIDE_CUENTA_INSERT_SP(  '207891023', 'valeria.quiros',   'Valeria#2024',  1);
    FIDE_CUENTA_INSERT_SP(  '504120678', 'javier.solis',     'Javier#2024',   1);
    FIDE_CUENTA_INSERT_SP( '306540219', 'natalia.alv',      'Natalia#2024',  1);
    FIDE_CUENTA_INSERT_SP( '111780345', 'federico.cam',     'Federico#2024', 1);
    FIDE_CUENTA_INSERT_SP( '702340891', 'patricia.nz',      'Patricia#2024', 1);
    FIDE_CUENTA_INSERT_SP( '208670123', 'eduardo.bl',       'Eduardo#2024',  1);
    FIDE_CUENTA_INSERT_SP( '405310782', 'daniela.ag',       'Daniela#2024',  1);
    FIDE_CUENTA_INSERT_SP( '112560489', 'jose.vega',        'Jose#2024',     1);
    FIDE_CUENTA_INSERT_SP( '309890234', 'ana.rojas',        'Ana#2024',      1);
    FIDE_CUENTA_INSERT_SP( '206450987', 'miguel.oroz',      'Miguel#2024',   1);
    FIDE_CUENTA_INSERT_SP( '601230456', 'laura.salas',      'Laura#2024',    1);
    FIDE_CUENTA_INSERT_SP( '113780621', 'adrian.chacon',    'Adrian#2024',   1);
    FIDE_CUENTA_INSERT_SP( '407120893', 'camila.ruiz',      'Camila#2024',   1);
    FIDE_CUENTA_INSERT_SP( '310450178', 'santiago.mora',    'Santiago#2024', 1);
    FIDE_CUENTA_INSERT_SP( '114230567', 'gabriela.perez',   'Gabriela#2024', 1);
    FIDE_CUENTA_INSERT_SP( '209780341', 'marco.leon',       'Marco#2024',    1);
    FIDE_CUENTA_INSERT_SP( '506340892', 'isabela.zuniga',   'Isabela#2024',  1);
    FIDE_CUENTA_INSERT_SP( '115670234', 'david.acosta',     'David#2024',    1);
    FIDE_CUENTA_INSERT_SP( '118890123', 'fernanda.bol',     'Fernanda#2025', 1);
    FIDE_CUENTA_INSERT_SP( '311230456', 'rodrigo.chav',     'Rodrigo#2025',  1);
    FIDE_CUENTA_INSERT_SP( '210670789', 'alejandra.dur',    'Alej#2025',     1);
    FIDE_CUENTA_INSERT_SP( '509010122', 'esteban.esq',      'Esteban#2025',  1);
    FIDE_CUENTA_INSERT_SP( '116340455', 'melissa.fue',      'Melissa#2025',  1);
    FIDE_CUENTA_INSERT_SP( '412780788', 'carlos.gam',       'CarlosG#2025',  1);
    FIDE_CUENTA_INSERT_SP( '313121121', 'paola.hid',        'Paola#2025',    1);
    FIDE_CUENTA_INSERT_SP( '211561454', 'mauricio.jim',     'Mauricio#2025', 1);
    FIDE_CUENTA_INSERT_SP( '119001787', 'carolina.lei',     'Carolina#2025', 1);
    FIDE_CUENTA_INSERT_SP( '314442120', 'ignacio.mad',      'Ignacio#2025',  1);
    FIDE_CUENTA_INSERT_SP( '212882453', 'veronica.nar',     'Veronica#2025', 1);
    FIDE_CUENTA_INSERT_SP( '120322786', 'sebastian.ort',    'Sebas#2025',    1);
    FIDE_CUENTA_INSERT_SP( '415763119', 'daniella.por',     'Daniella#2025', 1);
    FIDE_CUENTA_INSERT_SP( '316203452', 'fernando.que',     'Fernando#2025', 1);
    FIDE_CUENTA_INSERT_SP( '213643785', 'rebeca.ram',       'Rebeca#2025',   1);
    FIDE_CUENTA_INSERT_SP( '121084118', 'alejandro.sol',    'AlejS#2025',    1);
    FIDE_CUENTA_INSERT_SP( '416524451', 'natalie.tor',      'Natalie#2025',  1);
    FIDE_CUENTA_INSERT_SP( '317964784', 'josue.uren',       'Josue#2025',    1);
    FIDE_CUENTA_INSERT_SP( '215405117', 'karen.valv',       'Karen#2025',    1);
    FIDE_CUENTA_INSERT_SP( '122845450', 'andres.zam',       'AndresZ#2025',  1);
    FIDE_CUENTA_INSERT_SP( '418285783', 'maria.aba',        'MariaA#2025',   1);
    FIDE_CUENTA_INSERT_SP( '319726116', 'julian.barb',      'Julian#2025',   1);
    FIDE_CUENTA_INSERT_SP( '217166449', 'nicole.calv',      'Nicole#2025',   1);
    FIDE_CUENTA_INSERT_SP( '124606782', 'diego.delg',       'Diego#2025',    1);
    FIDE_CUENTA_INSERT_SP( '421047115', 'valentina.esp',    'Valenti#2025',  1);
    FIDE_CUENTA_INSERT_SP( '321487448', 'gustavo.flo',      'Gustavo#2025',  1);
    FIDE_CUENTA_INSERT_SP( '218927781', 'priscila.gon',     'Prisci#2025',   1);
    FIDE_CUENTA_INSERT_SP( '126368114', 'hector.hern',      'Hector#2025',   1);
    FIDE_CUENTA_INSERT_SP( '422808447', 'silvia.iban',      'Silvia#2025',   1);
    FIDE_CUENTA_INSERT_SP( '323248780', 'tomas.jimen',      'Tomas#2025',    1);
    FIDE_CUENTA_INSERT_SP( '220689113', 'andrea.klotz',     'Andrea#2025',   1);
    FIDE_CUENTA_INSERT_SP( '128129446', 'ricardo.lobo',     'Ricardo#2025',  1);

    -- ============================================================
    -- FIDE_TIPO_OTP_TB
    -- ============================================================
    FIDE_TIPO_OTP_INSERT_SP( 'Verificación de correo',          1);
    FIDE_TIPO_OTP_INSERT_SP( 'Recuperación de contraseña',      1);
    FIDE_TIPO_OTP_INSERT_SP( 'Cambio de correo',                1);
    FIDE_TIPO_OTP_INSERT_SP( 'Cambio de contraseña',            1);
    FIDE_TIPO_OTP_INSERT_SP( 'Doble factor de autenticación',   1);
    FIDE_TIPO_OTP_INSERT_SP( 'Confirmación de operación',       1);
    FIDE_TIPO_OTP_INSERT_SP( 'Validación de nuevo dispositivo', 1);

    -- ============================================================
    -- FIDE_CODIGO_OTP_TB 
    -- ============================================================
    FIDE_CODIGO_OTP_INSERT_SP(  1,  1, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-01-15 09:30:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-01-15 09:25:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-01-15 09:20:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP(  2,  2, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-02-20 14:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-02-20 13:58:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-02-20 13:50:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP(  3,  1, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-03-05 10:15:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-03-05 10:13:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-03-05 10:10:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP(  4,  3, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-03-18 16:45:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-03-18 16:44:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-03-18 16:40:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP(  5,  2, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-04-10 08:20:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-04-10 08:18:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-04-10 08:15:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP(  6,  1, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-04-22 11:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-04-22 10:58:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-04-22 10:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP(  7,  3, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-05-01 09:30:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-05-01 09:28:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-05-01 09:25:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP(  8,  2, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-05-14 15:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-05-14 14:58:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-05-14 14:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP(  9,  1, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-05-28 10:15:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-05-28 10:13:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-05-28 10:10:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 10, 2, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-06-05 08:45:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-06-05 08:43:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-06-05 08:40:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 11, 3, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-06-18 13:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-06-18 12:58:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-06-18 12:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 12, 1, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-07-02 09:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-07-02 08:58:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-07-02 08:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 13, 2, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-07-15 14:30:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-07-15 14:28:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-07-15 14:25:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 14, 3, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-07-28 11:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-07-28 10:58:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-07-28 10:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 15, 1, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-08-10 08:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-08-10 07:58:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-08-10 07:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 16, 2, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-08-22 16:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-08-22 15:58:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-08-22 15:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 17, 1, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-09-04 10:30:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-09-04 10:28:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-09-04 10:25:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 18, 3, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-09-17 12:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-09-17 11:58:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-09-17 11:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 19, 2, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-09-30 09:15:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-09-30 09:13:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-09-30 09:10:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 20, 1, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-10-12 15:45:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-10-12 15:43:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-10-12 15:40:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 21, 2, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-10-25 08:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-10-25 07:58:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-10-25 07:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 22, 3, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-11-07 11:30:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-11-07 11:28:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-11-07 11:25:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 23, 1, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-11-20 14:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-11-20 13:58:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-11-20 13:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 24, 2, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-12-03 09:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-12-03 08:58:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-12-03 08:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 25, 1, DBMS_RANDOM.STRING('X', 8), TO_DATE('2025-12-16 16:30:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2025-12-16 16:28:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2025-12-16 16:25:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 26, 3, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-01-07 10:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-01-07 09:58:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2026-01-07 09:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 27, 2, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-01-20 12:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-01-20 11:58:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2026-01-20 11:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 28, 1, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-02-02 08:30:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-02-02 08:28:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2026-02-02 08:25:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 29, 2, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-02-15 15:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-02-15 14:58:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2026-02-15 14:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 30, 3, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-02-28 09:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-02-28 08:58:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2026-02-28 08:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 31, 1, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-05 11:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-05 10:58:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2026-03-05 10:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 32, 2, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-08 14:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-08 13:58:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2026-03-08 13:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 33, 1, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-09 08:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-09 07:58:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2026-03-09 07:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 34, 3, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-10 10:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-10 09:58:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2026-03-10 09:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 35, 2, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-11 12:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-11 11:58:00','YYYY-MM-DD HH24:MI:SS'), 1, TO_DATE('2026-03-11 11:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 36, 1, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-12 09:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-12 08:58:00','YYYY-MM-DD HH24:MI:SS'), 3, TO_DATE('2026-03-12 08:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 37, 2, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-12 10:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-12 09:58:00','YYYY-MM-DD HH24:MI:SS'), 3, TO_DATE('2026-03-12 09:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 38, 3, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-12 11:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-12 10:58:00','YYYY-MM-DD HH24:MI:SS'), 3, TO_DATE('2026-03-12 10:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 39, 1, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-12 13:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-12 12:58:00','YYYY-MM-DD HH24:MI:SS'), 3, TO_DATE('2026-03-12 12:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 40, 2, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-12 15:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-12 14:58:00','YYYY-MM-DD HH24:MI:SS'), 3, TO_DATE('2026-03-12 14:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 41, 1, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-12 16:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-12 15:58:00','YYYY-MM-DD HH24:MI:SS'), 3, TO_DATE('2026-03-12 15:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 42, 3, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-12 17:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-12 16:58:00','YYYY-MM-DD HH24:MI:SS'), 3, TO_DATE('2026-03-12 16:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 43, 2, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-12 18:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-12 17:58:00','YYYY-MM-DD HH24:MI:SS'), 3, TO_DATE('2026-03-12 17:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 44, 1, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-12 19:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-12 18:58:00','YYYY-MM-DD HH24:MI:SS'), 3, TO_DATE('2026-03-12 18:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 45, 2, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-12 20:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-12 19:58:00','YYYY-MM-DD HH24:MI:SS'), 3, TO_DATE('2026-03-12 19:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 46, 3, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-12 20:30:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-12 20:28:00','YYYY-MM-DD HH24:MI:SS'), 3, TO_DATE('2026-03-12 20:25:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 47, 1, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-12 21:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-12 20:58:00','YYYY-MM-DD HH24:MI:SS'), 3, TO_DATE('2026-03-12 20:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 48, 2, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-12 21:30:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-12 21:28:00','YYYY-MM-DD HH24:MI:SS'), 3, TO_DATE('2026-03-12 21:25:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 49, 3, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-12 22:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-12 21:58:00','YYYY-MM-DD HH24:MI:SS'), 3, TO_DATE('2026-03-12 21:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 50, 1, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-12 22:30:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-12 22:28:00','YYYY-MM-DD HH24:MI:SS'), 3, TO_DATE('2026-03-12 22:25:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 51, 2, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-12 23:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-12 22:58:00','YYYY-MM-DD HH24:MI:SS'), 3, TO_DATE('2026-03-12 22:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 52, 1, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-12 23:30:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-12 23:28:00','YYYY-MM-DD HH24:MI:SS'), 3, TO_DATE('2026-03-12 23:25:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 53, 3, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-13 00:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-12 23:58:00','YYYY-MM-DD HH24:MI:SS'), 3, TO_DATE('2026-03-12 23:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 54, 2, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-13 01:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-13 00:58:00','YYYY-MM-DD HH24:MI:SS'), 3, TO_DATE('2026-03-13 00:55:00','YYYY-MM-DD HH24:MI:SS'), 1);
    FIDE_CODIGO_OTP_INSERT_SP( 55, 1, DBMS_RANDOM.STRING('X', 8), TO_DATE('2026-03-13 02:00:00','YYYY-MM-DD HH24:MI:SS'), TO_DATE('2026-03-13 01:58:00','YYYY-MM-DD HH24:MI:SS'), 3, TO_DATE('2026-03-13 01:55:00','YYYY-MM-DD HH24:MI:SS'), 1);

    -- ============================================================
    -- FIDE_RAZA_TB 
    -- ============================================================
    FIDE_RAZA_INSERT_SP(  'Labrador Retriever',    1);
    FIDE_RAZA_INSERT_SP(  'Golden Retriever',      1);
    FIDE_RAZA_INSERT_SP(  'Beagle',                1);
    FIDE_RAZA_INSERT_SP(  'Bulldog Francés',       1);
    FIDE_RAZA_INSERT_SP(  'Poodle',                1);
    FIDE_RAZA_INSERT_SP(  'Pastor Alemán',         1);
    FIDE_RAZA_INSERT_SP(  'Chihuahua',             1);
    FIDE_RAZA_INSERT_SP(  'Mestizo',               1);
    FIDE_RAZA_INSERT_SP(  'Shih Tzu',              1);
    FIDE_RAZA_INSERT_SP( 'Dálmata',               1);
    FIDE_RAZA_INSERT_SP( 'Cocker Spaniel',        1);
    FIDE_RAZA_INSERT_SP( 'Boxer',                 1);
    FIDE_RAZA_INSERT_SP( 'Rottweiler',            1);
    FIDE_RAZA_INSERT_SP( 'Husky Siberiano',       1);
    FIDE_RAZA_INSERT_SP( 'Yorkshire Terrier',     1);
    FIDE_RAZA_INSERT_SP( 'Doberman',              1);
    FIDE_RAZA_INSERT_SP( 'Schnauzer',             1);
    FIDE_RAZA_INSERT_SP( 'Border Collie',         1);
    FIDE_RAZA_INSERT_SP( 'Pitbull Terrier',       1);
    FIDE_RAZA_INSERT_SP( 'Gran Danés',            1);
    FIDE_RAZA_INSERT_SP( 'Maltés',                1);
    FIDE_RAZA_INSERT_SP( 'Weimaraner',            1);
    FIDE_RAZA_INSERT_SP( 'Basset Hound',          1);
    FIDE_RAZA_INSERT_SP( 'Akita Inu',             1);
    FIDE_RAZA_INSERT_SP( 'Samoyedo',              1);

    -- ============================================================
    -- FIDE_SEXO_TB
    -- ============================================================
    FIDE_SEXO_INSERT_SP( 'Macho',  1);
    FIDE_SEXO_INSERT_SP( 'Hembra', 1);

    -- ============================================================
    -- FIDE_PERRITO_TB 
    -- ============================================================
    FIDE_PERRITO_INSERT_SP(  'Max',       TO_DATE('2024-01-10','YYYY-MM-DD'), 2,  28.5, 58, 1, 1,  1);
    FIDE_PERRITO_INSERT_SP(  'Luna',      TO_DATE('2024-02-15','YYYY-MM-DD'), 1,  7.2,  32, 2, 7,  1);
    FIDE_PERRITO_INSERT_SP(  'Rocky',     TO_DATE('2023-11-20','YYYY-MM-DD'), 4,  31.0, 62, 1, 6,  1);
    FIDE_PERRITO_INSERT_SP(  'Coco',      TO_DATE('2024-03-05','YYYY-MM-DD'), 3,  12.4, 45, 2, 3,  1);
    FIDE_PERRITO_INSERT_SP(  'Beto',      TO_DATE('2023-08-12','YYYY-MM-DD'), 5,  9.8,  38, 1, 5,  1);
    FIDE_PERRITO_INSERT_SP(  'Nala',      TO_DATE('2024-04-22','YYYY-MM-DD'), 1,  24.5, 55, 2, 2,  1);
    FIDE_PERRITO_INSERT_SP(  'Simba',     TO_DATE('2024-01-30','YYYY-MM-DD'), 2,  6.1,  29, 1, 4,  1);
    FIDE_PERRITO_INSERT_SP(  'Lola',      TO_DATE('2023-06-14','YYYY-MM-DD'), 6,  14.3, 47, 2, 8,  1);
    FIDE_PERRITO_INSERT_SP(  'Toby',      TO_DATE('2024-05-18','YYYY-MM-DD'), 3,  11.0, 42, 1, 11, 1);
    FIDE_PERRITO_INSERT_SP( 'Mia',       TO_DATE('2023-12-01','YYYY-MM-DD'), 2,  8.5,  35, 2, 9,  1);
    FIDE_PERRITO_INSERT_SP( 'Canelo',    TO_DATE('2024-06-09','YYYY-MM-DD'), 1,  35.2, 66, 1, 8,  1);
    FIDE_PERRITO_INSERT_SP( 'Princesa',  TO_DATE('2023-09-25','YYYY-MM-DD'), 4,  10.1, 40, 2, 5,  1);
    FIDE_PERRITO_INSERT_SP( 'Thor',      TO_DATE('2024-07-03','YYYY-MM-DD'), 3,  29.8, 60, 1, 6,  1);
    FIDE_PERRITO_INSERT_SP( 'Bella',     TO_DATE('2023-04-17','YYYY-MM-DD'), 7,  5.4,  27, 2, 7,  1);
    FIDE_PERRITO_INSERT_SP( 'Rex',       TO_DATE('2024-08-21','YYYY-MM-DD'), 2,  32.0, 63, 1, 12, 1);
    FIDE_PERRITO_INSERT_SP( 'Chispa',    TO_DATE('2023-05-30','YYYY-MM-DD'), 5,  4.9,  26, 2, 7,  1);
    FIDE_PERRITO_INSERT_SP( 'Bruno',     TO_DATE('2024-09-12','YYYY-MM-DD'), 1,  27.3, 57, 1, 1,  1);
    FIDE_PERRITO_INSERT_SP( 'Azul',      TO_DATE('2023-03-08','YYYY-MM-DD'), 6,  21.6, 52, 2, 10, 1);
    FIDE_PERRITO_INSERT_SP( 'Pepe',      TO_DATE('2024-10-05','YYYY-MM-DD'), 3,  6.8,  30, 1, 3,  1);
    FIDE_PERRITO_INSERT_SP( 'Kira',      TO_DATE('2023-07-19','YYYY-MM-DD'), 4,  18.2, 50, 2, 8,  1);
    FIDE_PERRITO_INSERT_SP( 'Zeus',      TO_DATE('2024-11-14','YYYY-MM-DD'), 5,  33.7, 65, 1, 6,  1);
    FIDE_PERRITO_INSERT_SP( 'Perla',     TO_DATE('2023-10-22','YYYY-MM-DD'), 2,  9.3,  36, 2, 2,  1);
    FIDE_PERRITO_INSERT_SP( 'Duke',      TO_DATE('2024-12-01','YYYY-MM-DD'), 1,  30.5, 61, 1, 1,  1);
    FIDE_PERRITO_INSERT_SP( 'Nina',      TO_DATE('2023-02-11','YYYY-MM-DD'), 3,  13.7, 46, 2, 11, 1);
    FIDE_PERRITO_INSERT_SP( 'Sparky',    TO_DATE('2025-01-07','YYYY-MM-DD'), 1,  15.0, 48, 1, 8,  1);
    FIDE_PERRITO_INSERT_SP( 'Hulk',      TO_DATE('2023-04-10','YYYY-MM-DD'), 6,  40.1, 68, 1, 13, 1);
    FIDE_PERRITO_INSERT_SP( 'Daisy',     TO_DATE('2025-02-14','YYYY-MM-DD'), 2,  22.0, 54, 2, 14, 1);
    FIDE_PERRITO_INSERT_SP( 'Cleo',      TO_DATE('2024-05-01','YYYY-MM-DD'), 7,  3.5,  24, 2, 15, 1);
    FIDE_PERRITO_INSERT_SP( 'Titan',     TO_DATE('2023-01-20','YYYY-MM-DD'), 1,  38.4, 70, 1, 16, 1);
    FIDE_PERRITO_INSERT_SP( 'Nube',      TO_DATE('2025-03-05','YYYY-MM-DD'), 4,  25.0, 56, 2, 17, 1);
    FIDE_PERRITO_INSERT_SP( 'Sombra',    TO_DATE('2023-07-11','YYYY-MM-DD'), 5,  26.5, 57, 1, 18, 1);
    FIDE_PERRITO_INSERT_SP( 'Mochi',     TO_DATE('2025-01-20','YYYY-MM-DD'), 3,  4.2,  23, 2, 9,  1);
    FIDE_PERRITO_INSERT_SP( 'Kaiser',    TO_DATE('2022-11-30','YYYY-MM-DD'), 2,  36.0, 67, 1, 19, 1);
    FIDE_PERRITO_INSERT_SP( 'Frida',     TO_DATE('2024-06-15','YYYY-MM-DD'), 5,  8.0,  34, 2, 5,  1);
    FIDE_PERRITO_INSERT_SP( 'Apolo',     TO_DATE('2023-09-08','YYYY-MM-DD'), 1,  31.5, 62, 1, 20, 1);
    FIDE_PERRITO_INSERT_SP( 'Mora',      TO_DATE('2024-03-22','YYYY-MM-DD'), 3,  10.5, 41, 2, 3,  1);
    FIDE_PERRITO_INSERT_SP( 'Pinto',     TO_DATE('2023-12-18','YYYY-MM-DD'), 6,  14.0, 47, 1, 8,  1);
    FIDE_PERRITO_INSERT_SP( 'Estrella',  TO_DATE('2025-02-01','YYYY-MM-DD'), 2,  7.8,  33, 2, 2,  1);
    FIDE_PERRITO_INSERT_SP( 'Oso',       TO_DATE('2022-08-25','YYYY-MM-DD'), 1,  42.0, 72, 1, 20, 1);
    FIDE_PERRITO_INSERT_SP( 'Rocío',     TO_DATE('2024-08-08','YYYY-MM-DD'), 4,  11.8, 44, 2, 4,  1);
    FIDE_PERRITO_INSERT_SP( 'Loki',      TO_DATE('2024-01-15','YYYY-MM-DD'), 5,  28.0, 58, 1, 19, 1);
    FIDE_PERRITO_INSERT_SP( 'Cinta',     TO_DATE('2023-06-01','YYYY-MM-DD'), 7,  3.8,  22, 2, 7,  1);
    FIDE_PERRITO_INSERT_SP( 'Rayo',      TO_DATE('2024-11-01','YYYY-MM-DD'), 1,  29.0, 59, 1, 1,  1);
    FIDE_PERRITO_INSERT_SP( 'Paloma',    TO_DATE('2023-03-14','YYYY-MM-DD'), 2,  19.5, 51, 2, 22, 1);
    FIDE_PERRITO_INSERT_SP( 'Rufus',     TO_DATE('2025-01-15','YYYY-MM-DD'), 3,  12.0, 44, 1, 11, 1);
    FIDE_PERRITO_INSERT_SP( 'Violeta',   TO_DATE('2023-10-10','YYYY-MM-DD'), 4,  9.0,  37, 2, 5,  1);
    FIDE_PERRITO_INSERT_SP( 'Draco',     TO_DATE('2024-07-20','YYYY-MM-DD'), 6,  30.0, 62, 1, 6,  1);
    FIDE_PERRITO_INSERT_SP( 'Dulce',     TO_DATE('2023-02-28','YYYY-MM-DD'), 5,  5.5,  28, 2, 5,  1);
    FIDE_PERRITO_INSERT_SP( 'Hércules',  TO_DATE('2022-12-10','YYYY-MM-DD'), 1,  44.0, 74, 1, 13, 1);
    FIDE_PERRITO_INSERT_SP( 'Bambi',     TO_DATE('2025-02-28','YYYY-MM-DD'), 2,  8.8,  35, 2, 9,  1);
    FIDE_PERRITO_INSERT_SP( 'Atlas',     TO_DATE('2023-08-05','YYYY-MM-DD'), 1,  37.0, 69, 1, 16, 1);
    FIDE_PERRITO_INSERT_SP( 'Copas',     TO_DATE('2024-04-10','YYYY-MM-DD'), 3,  13.0, 45, 2, 8,  1);
    FIDE_PERRITO_INSERT_SP( 'Trueno',    TO_DATE('2024-10-25','YYYY-MM-DD'), 6,  32.5, 64, 1, 12, 1);
    FIDE_PERRITO_INSERT_SP( 'Isis',      TO_DATE('2023-05-12','YYYY-MM-DD'), 4,  10.8, 42, 2, 4,  1);
    FIDE_PERRITO_INSERT_SP( 'Olaf',      TO_DATE('2025-03-01','YYYY-MM-DD'), 5,  24.0, 55, 1, 25, 1);

    -- ============================================================
    -- FIDE_PERRITO_IMAGEN_TB
    -- ============================================================
    FIDE_PERRITO_IMAGEN_INSERT_SP(  1,  'https://storage.adopciones.cr/perritos/max_01.jpg',       1);
    FIDE_PERRITO_IMAGEN_INSERT_SP(  1,  'https://storage.adopciones.cr/perritos/max_02.jpg',       1);
    FIDE_PERRITO_IMAGEN_INSERT_SP(  2,  'https://storage.adopciones.cr/perritos/luna_01.jpg',      1);
    FIDE_PERRITO_IMAGEN_INSERT_SP(  3,  'https://storage.adopciones.cr/perritos/rocky_01.jpg',     1);
    FIDE_PERRITO_IMAGEN_INSERT_SP(  4,  'https://storage.adopciones.cr/perritos/coco_01.jpg',      1);
    FIDE_PERRITO_IMAGEN_INSERT_SP(  5,  'https://storage.adopciones.cr/perritos/beto_01.jpg',      1);
    FIDE_PERRITO_IMAGEN_INSERT_SP(  6,  'https://storage.adopciones.cr/perritos/nala_01.jpg',      1);
    FIDE_PERRITO_IMAGEN_INSERT_SP(  6,  'https://storage.adopciones.cr/perritos/nala_02.jpg',      1);
    FIDE_PERRITO_IMAGEN_INSERT_SP(  7,  'https://storage.adopciones.cr/perritos/simba_01.jpg',     1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 8,  'https://storage.adopciones.cr/perritos/lola_01.jpg',      1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 9,  'https://storage.adopciones.cr/perritos/toby_01.jpg',      1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 10, 'https://storage.adopciones.cr/perritos/mia_01.jpg',       1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 11, 'https://storage.adopciones.cr/perritos/canelo_01.jpg',    1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 12, 'https://storage.adopciones.cr/perritos/princesa_01.jpg',  1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 13, 'https://storage.adopciones.cr/perritos/thor_01.jpg',      1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 14, 'https://storage.adopciones.cr/perritos/bella_01.jpg',     1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 15, 'https://storage.adopciones.cr/perritos/rex_01.jpg',       1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 16, 'https://storage.adopciones.cr/perritos/chispa_01.jpg',    1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 17, 'https://storage.adopciones.cr/perritos/bruno_01.jpg',     1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 18, 'https://storage.adopciones.cr/perritos/azul_01.jpg',      1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 19, 'https://storage.adopciones.cr/perritos/pepe_01.jpg',      1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 20, 'https://storage.adopciones.cr/perritos/kira_01.jpg',      1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 21, 'https://storage.adopciones.cr/perritos/zeus_01.jpg',      1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 22, 'https://storage.adopciones.cr/perritos/perla_01.jpg',     1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 23, 'https://storage.adopciones.cr/perritos/duke_01.jpg',      1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 26, 'https://storage.adopciones.cr/perritos/hulk_01.jpg',      1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 26, 'https://storage.adopciones.cr/perritos/hulk_02.jpg',      1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 27, 'https://storage.adopciones.cr/perritos/daisy_01.jpg',     1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 28, 'https://storage.adopciones.cr/perritos/cleo_01.jpg',      1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 29, 'https://storage.adopciones.cr/perritos/titan_01.jpg',     1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 30, 'https://storage.adopciones.cr/perritos/nube_01.jpg',      1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 31, 'https://storage.adopciones.cr/perritos/sombra_01.jpg',    1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 32, 'https://storage.adopciones.cr/perritos/mochi_01.jpg',     1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 33, 'https://storage.adopciones.cr/perritos/kaiser_01.jpg',    1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 34, 'https://storage.adopciones.cr/perritos/frida_01.jpg',     1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 35, 'https://storage.adopciones.cr/perritos/apolo_01.jpg',     1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 36, 'https://storage.adopciones.cr/perritos/mora_01.jpg',      1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 37, 'https://storage.adopciones.cr/perritos/pinto_01.jpg',     1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 38, 'https://storage.adopciones.cr/perritos/estrella_01.jpg',  1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 39, 'https://storage.adopciones.cr/perritos/oso_01.jpg',       1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 39, 'https://storage.adopciones.cr/perritos/oso_02.jpg',       1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 40, 'https://storage.adopciones.cr/perritos/rocio_01.jpg',     1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 41, 'https://storage.adopciones.cr/perritos/loki_01.jpg',      1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 42, 'https://storage.adopciones.cr/perritos/cinta_01.jpg',     1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 43, 'https://storage.adopciones.cr/perritos/rayo_01.jpg',      1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 44, 'https://storage.adopciones.cr/perritos/paloma_01.jpg',    1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 45, 'https://storage.adopciones.cr/perritos/rufus_01.jpg',     1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 46, 'https://storage.adopciones.cr/perritos/violeta_01.jpg',   1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 47, 'https://storage.adopciones.cr/perritos/draco_01.jpg',     1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 48, 'https://storage.adopciones.cr/perritos/dulce_01.jpg',     1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 49, 'https://storage.adopciones.cr/perritos/hercules_01.jpg',  1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 49, 'https://storage.adopciones.cr/perritos/hercules_02.jpg',  1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 50, 'https://storage.adopciones.cr/perritos/bambi_01.jpg',     1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 51, 'https://storage.adopciones.cr/perritos/atlas_01.jpg',     1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 52, 'https://storage.adopciones.cr/perritos/copas_01.jpg',     1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 53, 'https://storage.adopciones.cr/perritos/trueno_01.jpg',    1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 54, 'https://storage.adopciones.cr/perritos/isis_01.jpg',      1);
    FIDE_PERRITO_IMAGEN_INSERT_SP( 55, 'https://storage.adopciones.cr/perritos/olaf_01.jpg',      1);

    -- ============================================================
    -- FIDE_TIPO_RESPUESTA_TB
    -- ============================================================
    FIDE_TIPO_RESPUESTA_INSERT_SP( 'Sí / No',         1);
    FIDE_TIPO_RESPUESTA_INSERT_SP( 'Texto libre',      1);
    FIDE_TIPO_RESPUESTA_INSERT_SP( 'Opción múltiple',  1);
    FIDE_TIPO_RESPUESTA_INSERT_SP( 'Numérico',         1);

    -- ============================================================
    -- FIDE_PREGUNTA_TB  
    -- ============================================================
    FIDE_PREGUNTA_INSERT_SP(  '¿Tiene espacio exterior como patio o jardín?',             1, 1);
    FIDE_PREGUNTA_INSERT_SP(  '¿Convive con otros animales en el hogar?',                 1, 1);
    FIDE_PREGUNTA_INSERT_SP(  '¿Hay niños menores de 10 años en su hogar?',               1, 1);
    FIDE_PREGUNTA_INSERT_SP(  'Describa su estilo de vida (activo, sedentario, etc.)',     2, 1);
    FIDE_PREGUNTA_INSERT_SP(  '¿Ha tenido mascotas anteriormente?',                       1, 1);
    FIDE_PREGUNTA_INSERT_SP(  '¿Cuántas horas al día pasa fuera de casa?',                4, 1);
    FIDE_PREGUNTA_INSERT_SP(  '¿Está dispuesto a cubrir gastos veterinarios regulares?',  1, 1);
    FIDE_PREGUNTA_INSERT_SP(  'Indique el tipo de vivienda (casa, apartamento, finca)',    3, 1);
    FIDE_PREGUNTA_INSERT_SP(  '¿Tiene experiencia con razas grandes?',                    1, 1);
    FIDE_PREGUNTA_INSERT_SP( '¿Por qué desea adoptar un perrito?',                       2, 1);
    FIDE_PREGUNTA_INSERT_SP( '¿Cuenta con red de apoyo para cuidar al perrito?',         1, 1);
    FIDE_PREGUNTA_INSERT_SP( '¿El perrito tendrá acceso a veterinario cercano?',         1, 1);
    FIDE_PREGUNTA_INSERT_SP( '¿Tiene vehículo para traslados veterinarios?',             1, 1);
    FIDE_PREGUNTA_INSERT_SP( '¿Algún miembro del hogar es alérgico a animales?',         1, 1);
    FIDE_PREGUNTA_INSERT_SP( '¿Está de acuerdo con los términos del contrato de adopción?', 1, 1);
    FIDE_PREGUNTA_INSERT_SP( '¿Cuántos adultos viven en el hogar?',                      4, 1);
    FIDE_PREGUNTA_INSERT_SP( '¿Con qué frecuencia haría paseos al perrito?',             3, 1);
    FIDE_PREGUNTA_INSERT_SP( '¿El perrito dormirá dentro o fuera de la casa?',           3, 1);
    FIDE_PREGUNTA_INSERT_SP( '¿Planea esterilizar al perrito si no lo está?',            1, 1);
    FIDE_PREGUNTA_INSERT_SP( 'Describa su experiencia general con perros',               2, 1);

    -- ============================================================
    -- FIDE_TIPO_SOLICITUD_TB
    -- ============================================================
    FIDE_TIPO_SOLICITUD_INSERT_SP( 'Adopción',       1);
    FIDE_TIPO_SOLICITUD_INSERT_SP( 'Casa Cuna',      1);
    FIDE_TIPO_SOLICITUD_INSERT_SP( 'Voluntariado',   1);

    -- ============================================================
    -- FIDE_SOLICITUD_TB  
    -- ============================================================
    FIDE_SOLICITUD_INSERT_SP(  '302560178', 1, 1);
    FIDE_SOLICITUD_INSERT_SP(  '205870341', 1, 1);
    FIDE_SOLICITUD_INSERT_SP(  '109421567', 1, 1);
    FIDE_SOLICITUD_INSERT_SP(  '401230984', 1, 1);
    FIDE_SOLICITUD_INSERT_SP(  '603780234', 1, 1);
    FIDE_SOLICITUD_INSERT_SP(  '207891023', 1, 1);
    FIDE_SOLICITUD_INSERT_SP(  '504120678', 1, 1);
    FIDE_SOLICITUD_INSERT_SP(  '306540219', 1, 1);
    FIDE_SOLICITUD_INSERT_SP(  '702340891', 2, 1);
    FIDE_SOLICITUD_INSERT_SP( '208670123', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '405310782', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '309890234', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '206450987', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '601230456', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '407120893', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '310450178', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '114230567', 2, 1);
    FIDE_SOLICITUD_INSERT_SP( '209780341', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '506340892', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '115670234', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '118890123', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '311230456', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '210670789', 1, 3);
    FIDE_SOLICITUD_INSERT_SP( '509010122', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '116340455', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '412780788', 1, 3);
    FIDE_SOLICITUD_INSERT_SP( '313121121', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '119001787', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '314442120', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '212882453', 1, 3);
    FIDE_SOLICITUD_INSERT_SP( '120322786', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '415763119', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '316203452', 2, 1);
    FIDE_SOLICITUD_INSERT_SP( '213643785', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '121084118', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '416524451', 1, 3);
    FIDE_SOLICITUD_INSERT_SP( '317964784', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '215405117', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '122845450', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '418285783', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '319726116', 1, 3);
    FIDE_SOLICITUD_INSERT_SP( '217166449', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '124606782', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '421047115', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '321487448', 2, 1);
    FIDE_SOLICITUD_INSERT_SP( '218927781', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '126368114', 1, 3);
    FIDE_SOLICITUD_INSERT_SP( '422808447', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '323248780', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '220689113', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '128129446', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '118890123', 3, 1);
    FIDE_SOLICITUD_INSERT_SP( '311230456', 1, 3);
    FIDE_SOLICITUD_INSERT_SP( '210670789', 1, 1);
    FIDE_SOLICITUD_INSERT_SP( '509010122', 1, 1);

    -- ============================================================
    -- FIDE_TIPO_SOLICITUD_PREGUNTA_TB
    -- ============================================================
    FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(1, 1, 1);
    FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(1, 2, 1);
    FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(1, 3, 1);
    FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(1, 4, 1);
    FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(1, 5, 1);
    FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(1, 6, 1);
    FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(1, 7, 1);
    FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(1, 8, 1);
    FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(1, 10, 1);
    FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(1, 11, 1);
    FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(1, 12, 1);
    FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(1, 13, 1);
    FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(1, 14, 1);
    FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(2, 1, 1);
    FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(2, 4, 1);
    FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(2, 6, 1);
    FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(2, 9, 1);
    FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(2, 11, 1);
    FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(3, 1, 1);
    FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(3, 3, 1);
    FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(3, 7, 1);
    FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(3, 8, 1);
    FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(3, 10, 1);

    -- ============================================================
    -- FIDE_RESPUESTA_TB 
    -- ============================================================
    FIDE_RESPUESTA_INSERT_SP(  1,  1,  'Sí',                                        1);
    FIDE_RESPUESTA_INSERT_SP(  1,  2,  'No',                                        1);
    FIDE_RESPUESTA_INSERT_SP(  1,  3,  'Sí',                                        1);
    FIDE_RESPUESTA_INSERT_SP(  1,  4,  'Vida activa, salgo a correr cada mañana',   1);
    FIDE_RESPUESTA_INSERT_SP(  1,  5,  'Sí',                                        1);
    FIDE_RESPUESTA_INSERT_SP(  1,  6,  '6',                                         1);
    FIDE_RESPUESTA_INSERT_SP(  2,  1,  'No',                                        1);
    FIDE_RESPUESTA_INSERT_SP(  2,  2,  'Sí, tengo un gato',                         1);
    FIDE_RESPUESTA_INSERT_SP(  2,  4,  'Estilo tranquilo, trabajo desde casa',      1);
    FIDE_RESPUESTA_INSERT_SP( 2,  6,  '3',                                         1);
    FIDE_RESPUESTA_INSERT_SP( 3,  1,  'Sí',                                        1);
    FIDE_RESPUESTA_INSERT_SP( 3,  3,  'No',                                        1);
    FIDE_RESPUESTA_INSERT_SP( 3,  7,  'Sí',                                        1);
    FIDE_RESPUESTA_INSERT_SP( 3,  8,  'Casa con jardín amplio',                    1);
    FIDE_RESPUESTA_INSERT_SP( 4,  1,  'No',                                        1);
    FIDE_RESPUESTA_INSERT_SP( 4,  4,  'Familia activa con niños',                  1);
    FIDE_RESPUESTA_INSERT_SP( 4,  9,  'Sí, tuve un pastor alemán',                1);
    FIDE_RESPUESTA_INSERT_SP( 4,  10, 'Quiero darle una familia amorosa',          1);
    FIDE_RESPUESTA_INSERT_SP( 5,  1,  'Sí',                                        1);
    FIDE_RESPUESTA_INSERT_SP( 5,  5,  'No',                                        1);
    FIDE_RESPUESTA_INSERT_SP( 5,  11, 'Sí, mi madre puede ayudar',                 1);
    FIDE_RESPUESTA_INSERT_SP( 5,  12, 'Sí',                                        1);
    FIDE_RESPUESTA_INSERT_SP( 6,  1,  'No, apartamento',                           1);
    FIDE_RESPUESTA_INSERT_SP( 6,  2,  'No',                                        1);
    FIDE_RESPUESTA_INSERT_SP( 6,  7,  'Sí, tengo seguro para mascotas',            1);
    FIDE_RESPUESTA_INSERT_SP( 7,  1,  'Sí',                                        1);
    FIDE_RESPUESTA_INSERT_SP( 7,  3,  'Sí, dos niños de 5 y 8 años',              1);
    FIDE_RESPUESTA_INSERT_SP( 7,  6,  '8',                                         1);
    FIDE_RESPUESTA_INSERT_SP( 7,  7,  'Sí',                                        1);
    FIDE_RESPUESTA_INSERT_SP( 7,  10, 'Compañía para mis hijos',                   1);
    FIDE_RESPUESTA_INSERT_SP( 8,  1,  'Sí',                                        1);
    FIDE_RESPUESTA_INSERT_SP( 8,  5,  'Sí, tuve un beagle',                        1);
    FIDE_RESPUESTA_INSERT_SP( 8,  8,  'Casa sin jardín',                           1);
    FIDE_RESPUESTA_INSERT_SP( 8,  12, 'Sí',                                        1);
    FIDE_RESPUESTA_INSERT_SP( 9,  1,  'No',                                        1);
    FIDE_RESPUESTA_INSERT_SP( 9,  4,  'Estilo activo, corro fines de semana',      1);
    FIDE_RESPUESTA_INSERT_SP( 9,  6,  '5',                                         1);
    FIDE_RESPUESTA_INSERT_SP( 9,  11, 'Sí',                                        1);
    FIDE_RESPUESTA_INSERT_SP( 10, 2,  'No',                                        1);
    FIDE_RESPUESTA_INSERT_SP( 10, 5,  'No',                                        1);
    FIDE_RESPUESTA_INSERT_SP( 10, 7,  'Sí',                                        1);
    FIDE_RESPUESTA_INSERT_SP( 10, 14, 'No',                                        1);
    FIDE_RESPUESTA_INSERT_SP( 11, 1,  'Sí',                                        1);
    FIDE_RESPUESTA_INSERT_SP( 11, 6,  '4',                                         1);
    FIDE_RESPUESTA_INSERT_SP( 11, 9,  'No',                                        1);
    FIDE_RESPUESTA_INSERT_SP( 11, 13, 'Sí',                                        1);
    FIDE_RESPUESTA_INSERT_SP( 12, 1,  'Sí',                                        1);
    FIDE_RESPUESTA_INSERT_SP( 12, 3,  'No',                                        1);
    FIDE_RESPUESTA_INSERT_SP( 12, 8,  'Apartamento',                               1);
    FIDE_RESPUESTA_INSERT_SP( 12, 12, 'Sí',                                        1);
    FIDE_RESPUESTA_INSERT_SP( 13, 4,  'Muy activo, trabajo en campo',              1);
    FIDE_RESPUESTA_INSERT_SP( 13, 9,  'Sí, crecí con pastores alemanes',           1);
    FIDE_RESPUESTA_INSERT_SP( 13, 10, 'Rescatar un animal callejero',              1);
    FIDE_RESPUESTA_INSERT_SP( 14, 2,  'Sí, tengo dos gatos',                       1);
    FIDE_RESPUESTA_INSERT_SP( 14, 7,  'Sí',                                        1);

    -- ============================================================
    -- FIDE_CASA_CUNA_TB  
    -- ============================================================
    FIDE_CASA_CUNA_INSERT_SP(  'Hogar Amigo Animal Escazú',       3,  '112560489', 9,    1);
    FIDE_CASA_CUNA_INSERT_SP(  'Refugio Las Palmas Heredia',      11, '310450178', 17,   1);
    FIDE_CASA_CUNA_INSERT_SP(  'Casa Cuna Desamparados',          5,  '114230567', NULL, 1);
    FIDE_CASA_CUNA_INSERT_SP(  'Hogar Peludos Felices SJ',        1,  '115670234', NULL, 1);
    FIDE_CASA_CUNA_INSERT_SP(  'Refugio Cielo Abierto Nicoya',    14, '209780341', NULL, 1);
    FIDE_CASA_CUNA_INSERT_SP(  'Casa Peluditos Alajuela',         9,  '321487448', NULL, 1);
    FIDE_CASA_CUNA_INSERT_SP(  'Refugio Verde Heredia',           12, '128129446', NULL, 1);
    FIDE_CASA_CUNA_INSERT_SP(  'Hogar Canino Liberia',            13, '422808447', NULL, 1);
    FIDE_CASA_CUNA_INSERT_SP(  'Casa Temporal Cartago',           15, '323248780', NULL, 1);
    FIDE_CASA_CUNA_INSERT_SP( 'Refugio Amor Animal Tibás',       16, '220689113', NULL, 1);

    -- ============================================================
    -- FIDE_CASA_PERRITO_TB  
    -- ============================================================
    FIDE_CASA_PERRITO_INSERT_SP(1,  8,  1);
    FIDE_CASA_PERRITO_INSERT_SP(1,  16, 1);
    FIDE_CASA_PERRITO_INSERT_SP(1,  20, 1);
    FIDE_CASA_PERRITO_INSERT_SP(2,  14, 1);
    FIDE_CASA_PERRITO_INSERT_SP(2,  22, 1);
    FIDE_CASA_PERRITO_INSERT_SP(3,  10, 1);
    FIDE_CASA_PERRITO_INSERT_SP(3,  24, 1);
    FIDE_CASA_PERRITO_INSERT_SP(4,  2,  1);
    FIDE_CASA_PERRITO_INSERT_SP(4,  19, 1);
    FIDE_CASA_PERRITO_INSERT_SP(5,  25, 1);
    FIDE_CASA_PERRITO_INSERT_SP(6,  32, 1);
    FIDE_CASA_PERRITO_INSERT_SP(6,  42, 1);
    FIDE_CASA_PERRITO_INSERT_SP(6,  48, 1);
    FIDE_CASA_PERRITO_INSERT_SP(7,  28, 1);
    FIDE_CASA_PERRITO_INSERT_SP(7,  38, 1);
    FIDE_CASA_PERRITO_INSERT_SP(7,  50, 1);
    FIDE_CASA_PERRITO_INSERT_SP(8,  26, 1);
    FIDE_CASA_PERRITO_INSERT_SP(8,  29, 1);
    FIDE_CASA_PERRITO_INSERT_SP(8,  39, 1);
    FIDE_CASA_PERRITO_INSERT_SP(8,  49, 1);
    FIDE_CASA_PERRITO_INSERT_SP(9,  30, 1);
    FIDE_CASA_PERRITO_INSERT_SP(9,  46, 1);
    FIDE_CASA_PERRITO_INSERT_SP(9,  54, 1);
    FIDE_CASA_PERRITO_INSERT_SP(10, 33, 1);
    FIDE_CASA_PERRITO_INSERT_SP(10, 41, 1);
    FIDE_CASA_PERRITO_INSERT_SP(10, 55, 1);

    -- ============================================================
    -- FIDE_ADOPCION_TB 
    -- ============================================================
    FIDE_ADOPCION_INSERT_SP(  '302560178', 1, 1,  TO_DATE('2025-02-01','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP(  '205870341', 3, 2,  TO_DATE('2025-02-14','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP(  '109421567', 5, 3,  TO_DATE('2025-03-05','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP(  '401230984', 7, 4,  TO_DATE('2025-03-20','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP(  '603780234', 9, 5,  TO_DATE('2025-04-02','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP(  '207891023', 2, 6,  TO_DATE('2025-04-18','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP(  '504120678', 4, 7,  TO_DATE('2025-05-03','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP(  '306540219', 6, 8,  TO_DATE('2025-05-21','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP(  '208670123', 10, 10, TO_DATE('2025-06-07','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '405310782', 11, 11, TO_DATE('2025-06-25','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '309890234', 12, 12, TO_DATE('2025-07-10','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '206450987', 13, 13, TO_DATE('2025-07-28','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '601230456', 14, 14, TO_DATE('2025-08-14','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '407120893', 15, 15, TO_DATE('2025-09-01','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '310450178', 16, 16, TO_DATE('2025-09-19','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '118890123', 17, 17, TO_DATE('2025-10-05','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '311230456', 18, 18, TO_DATE('2025-10-22','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '509010122', 19, 19, TO_DATE('2025-11-08','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '116340455', 20, 20, TO_DATE('2025-11-25','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '412780788', 26, 21, TO_DATE('2025-12-12','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '313121121', 27, 22, TO_DATE('2025-12-29','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '314442120', 28, 23, TO_DATE('2026-01-08','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '120322786', 29, 24, TO_DATE('2026-01-15','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '415763119', 30, 25, TO_DATE('2026-01-22','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '316203452', 32, 27, TO_DATE('2026-01-29','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '213643785', 36, 31, TO_DATE('2026-02-05','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '416524451', 39, 34, TO_DATE('2026-02-12','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '317964784', 40, 35, TO_DATE('2026-02-19','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '215405117', 41, 36, TO_DATE('2026-02-26','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '122845450', 42, 37, TO_DATE('2026-03-01','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '418285783', 45, 40, TO_DATE('2026-03-03','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '319726116', 48, 43, TO_DATE('2026-03-05','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '217166449', 49, 44, TO_DATE('2026-03-06','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '421047115', 50, 45, TO_DATE('2026-03-07','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '218927781', 52, 47, TO_DATE('2026-03-08','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '126368114', 26, 51, TO_DATE('2026-03-09','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '422808447', 27, 52, TO_DATE('2026-03-10','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '323248780', 33, 53, TO_DATE('2026-03-11','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '220689113', 8, 9,  TO_DATE('2026-03-11','YYYY-MM-DD'), 1);
    FIDE_ADOPCION_INSERT_SP( '128129446', 33, 28, TO_DATE('2026-03-12','YYYY-MM-DD'), 1);

    -- ============================================================
    -- FIDE_TIPO_SEGUIMIENTO  
    -- ============================================================
    FIDE_TIPO_SEGUIMIENTO_INSERT_SP( 'Visita domiciliar',       1);
    FIDE_TIPO_SEGUIMIENTO_INSERT_SP( 'Llamada telefónica',      1);
    FIDE_TIPO_SEGUIMIENTO_INSERT_SP( 'Seguimiento veterinario', 1);
    FIDE_TIPO_SEGUIMIENTO_INSERT_SP( 'Reporte fotográfico',     1);
    FIDE_TIPO_SEGUIMIENTO_INSERT_SP( 'Videollamada',            1);
    FIDE_TIPO_SEGUIMIENTO_INSERT_SP( 'Encuesta digital',        1);

    -- ============================================================
    -- FIDE_SEGUIMIENTO_TB
    -- ============================================================
    FIDE_SEGUIMIENTO_INSERT_SP(  1,  1, TO_DATE('2025-02-15','YYYY-MM-DD'), TO_DATE('2025-02-15','YYYY-MM-DD'), 'Max se adapta bien al hogar, come y juega con normalidad.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP(  1,  2, TO_DATE('2025-03-01','YYYY-MM-DD'), TO_DATE('2025-03-01','YYYY-MM-DD'), 'Llamada confirmando bienestar, sin problemas de salud.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP(  2,  1, TO_DATE('2025-03-01','YYYY-MM-DD'), TO_DATE('2025-03-01','YYYY-MM-DD'), 'Luna ya conoce su espacio y tiene buena relación con el gato.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP(  3,  3, TO_DATE('2025-03-20','YYYY-MM-DD'), TO_DATE('2025-03-20','YYYY-MM-DD'), 'Coco asistió a vacuna anual, todo en orden.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP(  4,  2, TO_DATE('2025-04-05','YYYY-MM-DD'), TO_DATE('2025-04-05','YYYY-MM-DD'), 'Familia reporta excelente comportamiento de Rocky.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP(  5,  4, TO_DATE('2025-04-18','YYYY-MM-DD'), TO_DATE('2025-04-18','YYYY-MM-DD'), 'Fotos enviadas muestran perrito feliz y activo.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP(  6,  1, TO_DATE('2025-05-05','YYYY-MM-DD'), TO_DATE('2025-05-05','YYYY-MM-DD'), 'Beto convive bien con los demás animales del hogar.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP(  7,  2, TO_DATE('2025-05-20','YYYY-MM-DD'), TO_DATE('2025-05-20','YYYY-MM-DD'), 'Simba sin novedades, adoptante muy satisfecho.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP(  8,  3, TO_DATE('2025-06-10','YYYY-MM-DD'), TO_DATE('2025-06-10','YYYY-MM-DD'), 'Lola revisada por veterinario, peso ideal.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 9,  1, TO_DATE('2025-06-25','YYYY-MM-DD'), TO_DATE('2025-06-25','YYYY-MM-DD'), 'Toby juega constantemente con los niños del hogar.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 10, 2, TO_DATE('2025-07-15','YYYY-MM-DD'), TO_DATE('2025-07-15','YYYY-MM-DD'), 'Mia sana y activa, duerme en la cama del adoptante.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 11, 4, TO_DATE('2025-07-30','YYYY-MM-DD'), TO_DATE('2025-07-30','YYYY-MM-DD'), 'Fotos de Canelo corriendo en el jardín enviadas.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 12, 1, TO_DATE('2025-08-18','YYYY-MM-DD'), TO_DATE('2025-08-18','YYYY-MM-DD'), 'Princesa tímida al principio, ya se adapta bien.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 13, 3, TO_DATE('2025-08-28','YYYY-MM-DD'), TO_DATE('2025-08-28','YYYY-MM-DD'), 'Thor revisado, desparasitado y al día en vacunas.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 14, 2, TO_DATE('2025-09-12','YYYY-MM-DD'), TO_DATE('2025-09-12','YYYY-MM-DD'), 'Bella muy querida por familia, sin problemas.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 15, 1, TO_DATE('2025-10-01','YYYY-MM-DD'), TO_DATE('2025-10-01','YYYY-MM-DD'), 'Rex convive bien con adolescentes del hogar.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 15, 4, TO_DATE('2025-10-20','YYYY-MM-DD'), TO_DATE('2025-10-20','YYYY-MM-DD'), 'Fotos de Rex jugando en el jardín, en buen estado.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 16, 2, TO_DATE('2025-11-05','YYYY-MM-DD'), TO_DATE('2025-11-05','YYYY-MM-DD'), 'Bruno sano, adoptante confirma buena adaptación.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 17, 3, TO_DATE('2025-11-15','YYYY-MM-DD'), TO_DATE('2025-11-15','YYYY-MM-DD'), 'Chispa revisada, al día en vacunas y desparasitación.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 18, 1, TO_DATE('2025-11-25','YYYY-MM-DD'), TO_DATE('2025-11-25','YYYY-MM-DD'), 'Pepe juguetón, hogar con niños, adaptación excelente.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 19, 2, TO_DATE('2025-12-05','YYYY-MM-DD'), TO_DATE('2025-12-05','YYYY-MM-DD'), 'Kira duerme y come bien, sin incidentes.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 20, 4, TO_DATE('2025-12-15','YYYY-MM-DD'), TO_DATE('2025-12-15','YYYY-MM-DD'), 'Fotos de Zeus jugando con el adoptante en parque.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 21, 1, TO_DATE('2025-12-22','YYYY-MM-DD'), TO_DATE('2025-12-22','YYYY-MM-DD'), 'Perla se adapta, convive bien con otro perro.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 22, 2, TO_DATE('2026-01-02','YYYY-MM-DD'), TO_DATE('2026-01-02','YYYY-MM-DD'), 'Duke activo, paseado a diario según adoptante.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 23, 3, TO_DATE('2026-01-10','YYYY-MM-DD'), TO_DATE('2026-01-10','YYYY-MM-DD'), 'Nina revisada por veterinario, peso ideal y sana.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 24, 1, TO_DATE('2026-01-20','YYYY-MM-DD'), TO_DATE('2026-01-20','YYYY-MM-DD'), 'Sparky energético, le encanta el jardín del hogar.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 25, 5, TO_DATE('2026-02-01','YYYY-MM-DD'), TO_DATE('2026-02-01','YYYY-MM-DD'), 'Videollamada: Daisy sana, cariñosa y bien integrada.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 26, 2, TO_DATE('2026-02-08','YYYY-MM-DD'), TO_DATE('2026-02-08','YYYY-MM-DD'), 'Sombra come bien, sin problema de conducta.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 27, 4, TO_DATE('2026-02-15','YYYY-MM-DD'), TO_DATE('2026-02-15','YYYY-MM-DD'), 'Frida juega en el patio, fotos enviadas.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 28, 3, TO_DATE('2026-02-22','YYYY-MM-DD'), TO_DATE('2026-02-22','YYYY-MM-DD'), 'Apolo revisado, vacunas al día.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 29, 1, TO_DATE('2026-02-28','YYYY-MM-DD'), TO_DATE('2026-02-28','YYYY-MM-DD'), 'Mora adaptada, convive con gatos del hogar.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 30, 6, TO_DATE('2026-03-01','YYYY-MM-DD'), TO_DATE('2026-03-01','YYYY-MM-DD'), 'Encuesta completada: adoptante muy satisfecho con Pinto.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 31, 2, TO_DATE('2026-03-03','YYYY-MM-DD'), TO_DATE('2026-03-03','YYYY-MM-DD'), 'Rocío activa, hogar reporta buena conducta.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 32, 1, TO_DATE('2026-03-05','YYYY-MM-DD'), TO_DATE('2026-03-05','YYYY-MM-DD'), 'Loki en perfectas condiciones, paseos diarios.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 33, 4, TO_DATE('2026-03-07','YYYY-MM-DD'), TO_DATE('2026-03-07','YYYY-MM-DD'), 'Fotos de Paloma durmiendo en su nueva cama.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 34, 2, TO_DATE('2026-03-08','YYYY-MM-DD'), TO_DATE('2026-03-08','YYYY-MM-DD'), 'Rufus sano, adoptante encantado.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 35, 3, TO_DATE('2026-03-09','YYYY-MM-DD'), TO_DATE('2026-03-09','YYYY-MM-DD'), 'Draco revisado, se recupera bien de castración.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 36, 5, TO_DATE('2026-03-10','YYYY-MM-DD'), TO_DATE('2026-03-10','YYYY-MM-DD'), 'Videollamada: Trueno feliz y bien integrado.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 37, 1, TO_DATE('2026-03-11','YYYY-MM-DD'), TO_DATE('2026-03-11','YYYY-MM-DD'), 'Atlas convive con niños, sin incidentes.', 1);
    FIDE_SEGUIMIENTO_INSERT_SP( 38, 2, TO_DATE('2026-03-12','YYYY-MM-DD'), TO_DATE('2026-03-12','YYYY-MM-DD'), 'Copas activa, familia satisfecha.', 1);

    -- ============================================================
    -- FIDE_TIPO_EVENTO_TB  
    -- ============================================================
    FIDE_TIPO_EVENTO_INSERT_SP( 'Desparasitación',    1);
    FIDE_TIPO_EVENTO_INSERT_SP( 'Vacunación',         1);
    FIDE_TIPO_EVENTO_INSERT_SP( 'Esterilización',     1);
    FIDE_TIPO_EVENTO_INSERT_SP( 'Consulta médica',    1);
    FIDE_TIPO_EVENTO_INSERT_SP( 'Baño y peluquería',  1);
    FIDE_TIPO_EVENTO_INSERT_SP( 'Microchip',          1);
    FIDE_TIPO_EVENTO_INSERT_SP( 'Cirugía',            1);
    FIDE_TIPO_EVENTO_INSERT_SP( 'Limpieza dental',    1);
    FIDE_TIPO_EVENTO_INSERT_SP( 'Análisis de sangre', 1);

    -- ============================================================
    -- FIDE_EVENTO_PERRITO_TB
    -- ============================================================
    FIDE_EVENTO_PERRITO_INSERT_SP(  1,  2, TO_DATE('2024-01-25','YYYY-MM-DD'), 'Vacuna antirrábica y cuádruple aplicada.',                  45000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP(  1,  1, TO_DATE('2024-02-10','YYYY-MM-DD'), 'Desparasitación interna y externa.',                        12500,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP(  2,  6, TO_DATE('2024-02-28','YYYY-MM-DD'), 'Microchip implantado, código 941000023847561.',              35000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP(  3,  3, TO_DATE('2023-12-05','YYYY-MM-DD'), 'Esterilización exitosa, recuperación sin complicaciones.',  95000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP(  4,  4, TO_DATE('2024-03-15','YYYY-MM-DD'), 'Consulta por desnutrición leve al ingreso.',                30000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP(  5,  2, TO_DATE('2023-08-25','YYYY-MM-DD'), 'Vacuna quíntuple al ingreso al centro.',                    42000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP(  6,  1, TO_DATE('2024-05-01','YYYY-MM-DD'), 'Desparasitación rutinaria mensual.',                        12500,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP(  7,  3, TO_DATE('2024-02-20','YYYY-MM-DD'), 'Castración realizada sin inconvenientes.',                  80000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP(  8,  4, TO_DATE('2023-06-30','YYYY-MM-DD'), 'Revisión general: dientes, oídos y piel en buen estado.',   25000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 9,  5, TO_DATE('2024-05-28','YYYY-MM-DD'), 'Baño, corte y limpieza de oídos.',                          18000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 10, 2, TO_DATE('2024-01-05','YYYY-MM-DD'), 'Vacuna antirrábica aplicada.',                              22000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 11, 6, TO_DATE('2024-06-20','YYYY-MM-DD'), 'Microchip implantado, código 941000023901234.',              35000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 12, 4, TO_DATE('2023-10-10','YYYY-MM-DD'), 'Consulta por rasquiña, diagnóstico: alergia alimentaria.',  30000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 13, 3, TO_DATE('2024-07-15','YYYY-MM-DD'), 'Esterilización hembra sin complicaciones.',                 95000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 14, 1, TO_DATE('2023-05-01','YYYY-MM-DD'), 'Desparasitación al ingreso al centro.',                     12500,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 15, 7, TO_DATE('2024-08-30','YYYY-MM-DD'), 'Cirugía por fractura leve en pata delantera, exitosa.',     150000, 1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 16, 2, TO_DATE('2023-06-10','YYYY-MM-DD'), 'Vacuna triple felina aplicada.',                            22000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 17, 4, TO_DATE('2024-09-18','YYYY-MM-DD'), 'Revisión general al ingreso, estado de salud bueno.',       25000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 18, 5, TO_DATE('2023-03-20','YYYY-MM-DD'), 'Baño medicado por dermatitis leve.',                        20000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 19, 1, TO_DATE('2024-10-12','YYYY-MM-DD'), 'Desparasitación interna preventiva.',                       12500,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 20, 2, TO_DATE('2023-08-01','YYYY-MM-DD'), 'Vacuna antirrábica y cuádruple.',                           45000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 21, 3, TO_DATE('2024-11-20','YYYY-MM-DD'), 'Castración sin incidentes, alta al día siguiente.',         80000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 22, 6, TO_DATE('2023-11-05','YYYY-MM-DD'), 'Microchip aplicado al ingreso.',                            35000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 23, 4, TO_DATE('2024-12-10','YYYY-MM-DD'), 'Consulta de rutina, todo en orden.',                        25000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 24, 2, TO_DATE('2023-02-20','YYYY-MM-DD'), 'Vacuna quíntuple al ingreso.',                              42000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 25, 8, TO_DATE('2025-01-20','YYYY-MM-DD'), 'Limpieza dental profesional, tartar moderado.',             55000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 26, 2, TO_DATE('2023-04-20','YYYY-MM-DD'), 'Vacuna antirrábica Hulk al ingreso.',                       45000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 26, 1, TO_DATE('2023-05-05','YYYY-MM-DD'), 'Desparasitación Hulk, parásitos externos.',                 12500,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 27, 9, TO_DATE('2025-03-01','YYYY-MM-DD'), 'Análisis de sangre rutinario, resultados normales.',        38000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 28, 3, TO_DATE('2024-05-15','YYYY-MM-DD'), 'Esterilización Cleo sin complicaciones.',                   95000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 29, 6, TO_DATE('2023-02-01','YYYY-MM-DD'), 'Microchip Titan código 941000024012345.',                   35000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 30, 2, TO_DATE('2025-03-10','YYYY-MM-DD'), 'Vacuna Nube al ingreso al centro.',                         42000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 31, 4, TO_DATE('2023-08-01','YYYY-MM-DD'), 'Consulta por cojera leve, sin fractura.',                   30000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 32, 5, TO_DATE('2025-02-01','YYYY-MM-DD'), 'Baño y corte de pelo para Mochi.',                          18000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 33, 2, TO_DATE('2022-12-15','YYYY-MM-DD'), 'Vacuna quíntuple Kaiser al rescate.',                       42000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 34, 1, TO_DATE('2024-06-20','YYYY-MM-DD'), 'Desparasitación preventiva Frida.',                         12500,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 35, 6, TO_DATE('2023-09-15','YYYY-MM-DD'), 'Microchip Apolo código 941000024023456.',                   35000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 36, 4, TO_DATE('2024-04-01','YYYY-MM-DD'), 'Consulta por tos, diagnóstico: resfriado leve.',            30000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 37, 3, TO_DATE('2024-01-05','YYYY-MM-DD'), 'Castración Pinto exitosa.',                                 80000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 38, 2, TO_DATE('2025-02-10','YYYY-MM-DD'), 'Vacuna antirrábica Estrella al ingreso.',                   22000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 39, 7, TO_DATE('2022-09-05','YYYY-MM-DD'), 'Cirugía extracción de cuerpo extraño ingerido.',            180000, 1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 40, 1, TO_DATE('2024-08-15','YYYY-MM-DD'), 'Desparasitación preventiva Rocío.',                         12500,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 41, 2, TO_DATE('2024-01-20','YYYY-MM-DD'), 'Vacuna cuádruple Loki.',                                    45000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 42, 3, TO_DATE('2023-06-10','YYYY-MM-DD'), 'Esterilización Cinta sin complicaciones.',                  95000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 43, 4, TO_DATE('2024-11-10','YYYY-MM-DD'), 'Consulta general Rayo al ingreso.',                         25000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 44, 8, TO_DATE('2023-04-01','YYYY-MM-DD'), 'Limpieza dental Paloma, acumulación moderada.',             55000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 45, 2, TO_DATE('2025-01-20','YYYY-MM-DD'), 'Vacuna quíntuple Rufus al ingreso.',                        42000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 46, 9, TO_DATE('2023-10-20','YYYY-MM-DD'), 'Análisis de sangre Violeta, hemograma normal.',             38000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 47, 6, TO_DATE('2024-07-25','YYYY-MM-DD'), 'Microchip Draco código 941000024034567.',                   35000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 48, 1, TO_DATE('2023-03-05','YYYY-MM-DD'), 'Desparasitación Dulce al ingreso.',                         12500,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 49, 2, TO_DATE('2022-12-20','YYYY-MM-DD'), 'Vacuna antirrábica Hércules al ingreso.',                   45000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 50, 5, TO_DATE('2025-03-05','YYYY-MM-DD'), 'Baño y peluquería Bambi primera visita.',                   18000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 51, 3, TO_DATE('2023-09-01','YYYY-MM-DD'), 'Castración Atlas exitosa.',                                 80000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 52, 4, TO_DATE('2024-04-15','YYYY-MM-DD'), 'Consulta Copas por pérdida de apetito, resuelta.',          30000,  1);
    FIDE_EVENTO_PERRITO_INSERT_SP( 53, 2, TO_DATE('2024-11-01','YYYY-MM-DD'), 'Vacuna cuádruple Trueno.',                                  45000,  1);

    -- ============================================================
    -- FIDE_DETALLE_EVENTO_TB  
    -- ============================================================
    FIDE_DETALLE_EVENTO_INSERT_SP(  1,  'https://docs.adopciones.cr/comprobantes/evt_001.pdf', 'Comprobante pago clínica San Pedro',             45000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP(  2,  'https://docs.adopciones.cr/comprobantes/evt_002.pdf', 'Comprobante desparasitación interna',             12500,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP(  3,  'https://docs.adopciones.cr/comprobantes/evt_003.pdf', 'Factura microchip y registro',                    35000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP(  4,  'https://docs.adopciones.cr/comprobantes/evt_004.pdf', 'Factura cirugía esterilización Rocky',            95000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP(  5,  'https://docs.adopciones.cr/comprobantes/evt_005.pdf', 'Comprobante consulta desnutrición Coco',          30000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP(  6,  'https://docs.adopciones.cr/comprobantes/evt_006.pdf', 'Factura vacunas Beto',                            42000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP(  7,  'https://docs.adopciones.cr/comprobantes/evt_007.pdf', 'Recibo desparasitación Nala',                     12500,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP(  8,  'https://docs.adopciones.cr/comprobantes/evt_008.pdf', 'Factura castración Simba',                        80000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP(  9,  'https://docs.adopciones.cr/comprobantes/evt_009.pdf', 'Recibo consulta general Lola',                    25000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 10, 'https://docs.adopciones.cr/comprobantes/evt_010.pdf', 'Comprobante baño y peluquería Toby',              18000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 11, 'https://docs.adopciones.cr/comprobantes/evt_011.pdf', 'Factura vacuna Mia',                              22000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 12, 'https://docs.adopciones.cr/comprobantes/evt_012.pdf', 'Recibo microchip Canelo',                         35000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 13, 'https://docs.adopciones.cr/comprobantes/evt_013.pdf', 'Comprobante consulta alergia Princesa',           30000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 14, 'https://docs.adopciones.cr/comprobantes/evt_014.pdf', 'Factura esterilización Thor',                     95000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 15, 'https://docs.adopciones.cr/comprobantes/evt_015.pdf', 'Recibo desparasitación Bella',                    12500,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 16, 'https://docs.adopciones.cr/comprobantes/evt_016.pdf', 'Factura cirugía fractura Rex, honorarios',        150000, 1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 17, 'https://docs.adopciones.cr/comprobantes/evt_017.pdf', 'Comprobante vacuna Chispa',                       22000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 18, 'https://docs.adopciones.cr/comprobantes/evt_018.pdf', 'Recibo consulta ingreso Bruno',                   25000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 19, 'https://docs.adopciones.cr/comprobantes/evt_019.pdf', 'Comprobante baño medicado Azul',                  20000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 20, 'https://docs.adopciones.cr/comprobantes/evt_020.pdf', 'Recibo desparasitación Pepe',                     12500,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 21, 'https://docs.adopciones.cr/comprobantes/evt_021.pdf', 'Factura vacunas Kira',                            45000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 22, 'https://docs.adopciones.cr/comprobantes/evt_022.pdf', 'Recibo castración Zeus',                          80000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 23, 'https://docs.adopciones.cr/comprobantes/evt_023.pdf', 'Factura microchip Perla',                         35000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 24, 'https://docs.adopciones.cr/comprobantes/evt_024.pdf', 'Comprobante consulta Duke',                       25000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 25, 'https://docs.adopciones.cr/comprobantes/evt_025.pdf', 'Factura vacunas Nina',                            42000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 26, 'https://docs.adopciones.cr/comprobantes/evt_026.pdf', 'Factura limpieza dental Sparky',                  55000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 27, 'https://docs.adopciones.cr/comprobantes/evt_027.pdf', 'Factura vacuna Hulk ingreso',                     45000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 28, 'https://docs.adopciones.cr/comprobantes/evt_028.pdf', 'Recibo desparasitación Hulk',                     12500,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 29, 'https://docs.adopciones.cr/comprobantes/evt_029.pdf', 'Factura análisis sangre Daisy',                   38000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 30, 'https://docs.adopciones.cr/comprobantes/evt_030.pdf', 'Factura esterilización Cleo',                     95000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 31, 'https://docs.adopciones.cr/comprobantes/evt_031.pdf', 'Recibo microchip Titan',                          35000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 32, 'https://docs.adopciones.cr/comprobantes/evt_032.pdf', 'Factura vacunas Nube',                            42000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 33, 'https://docs.adopciones.cr/comprobantes/evt_033.pdf', 'Comprobante consulta cojera Sombra',              30000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 34, 'https://docs.adopciones.cr/comprobantes/evt_034.pdf', 'Recibo baño Mochi',                               18000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 35, 'https://docs.adopciones.cr/comprobantes/evt_035.pdf', 'Factura vacunas Kaiser rescate',                  42000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 36, 'https://docs.adopciones.cr/comprobantes/evt_036.pdf', 'Recibo desparasitación Frida',                    12500,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 37, 'https://docs.adopciones.cr/comprobantes/evt_037.pdf', 'Factura microchip Apolo',                         35000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 38, 'https://docs.adopciones.cr/comprobantes/evt_038.pdf', 'Comprobante consulta tos Mora',                   30000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 39, 'https://docs.adopciones.cr/comprobantes/evt_039.pdf', 'Factura castración Pinto',                        80000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 40, 'https://docs.adopciones.cr/comprobantes/evt_040.pdf', 'Recibo vacuna Estrella',                          22000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 41, 'https://docs.adopciones.cr/comprobantes/evt_041.pdf', 'Factura cirugía cuerpo extraño Oso',              180000, 1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 42, 'https://docs.adopciones.cr/comprobantes/evt_042.pdf', 'Recibo desparasitación Rocío',                    12500,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 43, 'https://docs.adopciones.cr/comprobantes/evt_043.pdf', 'Factura vacuna Loki',                             45000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 44, 'https://docs.adopciones.cr/comprobantes/evt_044.pdf', 'Factura esterilización Cinta',                    95000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 45, 'https://docs.adopciones.cr/comprobantes/evt_045.pdf', 'Comprobante consulta Rayo ingreso',               25000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 46, 'https://docs.adopciones.cr/comprobantes/evt_046.pdf', 'Factura limpieza dental Paloma',                  55000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 47, 'https://docs.adopciones.cr/comprobantes/evt_047.pdf', 'Factura vacunas Rufus',                           42000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 48, 'https://docs.adopciones.cr/comprobantes/evt_048.pdf', 'Comprobante análisis sangre Violeta',             38000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 49, 'https://docs.adopciones.cr/comprobantes/evt_049.pdf', 'Recibo microchip Draco',                          35000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 50, 'https://docs.adopciones.cr/comprobantes/evt_050.pdf', 'Recibo desparasitación Dulce',                    12500,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 51, 'https://docs.adopciones.cr/comprobantes/evt_051.pdf', 'Factura vacuna Hércules',                         45000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 52, 'https://docs.adopciones.cr/comprobantes/evt_052.pdf', 'Recibo baño Bambi',                               18000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 53, 'https://docs.adopciones.cr/comprobantes/evt_053.pdf', 'Factura castración Atlas',                        80000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 54, 'https://docs.adopciones.cr/comprobantes/evt_054.pdf', 'Comprobante consulta Copas',                      30000,  1);
    FIDE_DETALLE_EVENTO_INSERT_SP( 55, 'https://docs.adopciones.cr/comprobantes/evt_055.pdf', 'Factura vacuna Trueno',                           45000,  1);

    -- ============================================================
    -- FIDE_CATEGORIA_TB  
    -- ============================================================
    FIDE_CATEGORIA_INSERT_SP( 'Alimentos',          1);
    FIDE_CATEGORIA_INSERT_SP( 'Accesorios',         1);
    FIDE_CATEGORIA_INSERT_SP( 'Medicamentos',       1);
    FIDE_CATEGORIA_INSERT_SP( 'Juguetes',           1);
    FIDE_CATEGORIA_INSERT_SP( 'Higiene y cuidado',  1);
    FIDE_CATEGORIA_INSERT_SP( 'Camas y descanso',   1);
    FIDE_CATEGORIA_INSERT_SP( 'Transporte',         1);
    FIDE_CATEGORIA_INSERT_SP( 'Entrenamiento',      1);

    -- ============================================================
    -- FIDE_PRODUCTO_TB  
    -- ============================================================
    FIDE_PRODUCTO_INSERT_SP(  'Alimento seco adulto 15kg',       'Formulación premium para perros adultos razas medianas y grandes', 18900, 1, 1);
    FIDE_PRODUCTO_INSERT_SP(  'Alimento seco cachorro 5kg',      'Fórmula especial para cachorros con alto contenido proteico',      9500,  1, 1);
    FIDE_PRODUCTO_INSERT_SP(  'Correa retráctil 5m',             'Correa retráctil de nylon para perros hasta 30kg',                 7800,  2, 1);
    FIDE_PRODUCTO_INSERT_SP(  'Collar ajustable talla M',        'Collar de nylon reflectivo, ajustable talla mediana',              2900,  2, 1);
    FIDE_PRODUCTO_INSERT_SP(  'Antipulgas Frontline Plus',       'Pipeta antipulgas mensual para perros de 10-20kg',                 6500,  3, 1);
    FIDE_PRODUCTO_INSERT_SP(  'Desparasitante Drontal Plus',     'Comprimidos desparasitantes internos para perros',                 3200,  3, 1);
    FIDE_PRODUCTO_INSERT_SP(  'Juguete Kong clásico talla M',    'Juguete de goma natural resistente para estimulación mental',      5600,  4, 1);
    FIDE_PRODUCTO_INSERT_SP(  'Pelota de tenis pack x3',         'Pelotas de tenis resistentes para perros activos',                 2400,  4, 1);
    FIDE_PRODUCTO_INSERT_SP(  'Shampoo hipoalergénico 500ml',    'Shampoo dermatológico sin perfume para pieles sensibles',          4800,  5, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Cepillo deslanador FURminator',   'Cepillo profesional para control de muda de pelo',                 12500, 5, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Cama ortopédica talla L',         'Cama de espuma de memoria para perros grandes',                    24000, 6, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Colchoneta impermeable talla M',  'Colchoneta lavable y resistente al agua para uso interior',        9800,  6, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Alimento húmedo lata 400g',       'Comida húmeda para perros adultos con pollo y vegetales',          2800,  1, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Snacks dental sticks x28',        'Galletas dentales para control de sarro y mal aliento',            4500,  1, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Alimento senior 7kg',             'Dieta especial para perros mayores de 7 años',                     12000, 1, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Premio natural pollo deshidratado','Tiras de pollo natural sin conservantes, ideal como premio',      3900,  1, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Arnés reflectivo talla S',        'Arnés de seguridad reflectivo para perros pequeños',               5800,  2, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Arnés acolchado talla L',         'Arnés ergonómico con relleno suave para razas grandes',            8900,  2, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Comedero acero inoxidable',       'Comedero antideslizante de acero, apto para lavavajillas',         3500,  2, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Bebedero automático 2L',          'Bebedero de gravedad con reserva de agua de 2 litros',             4200,  2, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Vitaminas multivitamínicas x60',  'Suplemento vitamínico diario para perros adultos',                 6800,  3, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Omega 3 perros 250ml',            'Aceite de pescado para pelaje brillante y articulaciones',         5200,  3, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Antibacterial heridas 100ml',     'Spray antiséptico para heridas superficiales en mascotas',         3100,  3, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Pastillas para calmante viaje',   'Suplemento natural relajante para viajes largos',                  4600,  3, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Cuerda de jalar grande',          'Juguete de cuerda trenzada resistente para perros medianos',       2100,  4, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Frisbee perros talla M',          'Frisbee flexible de caucho natural apto para perros',              3300,  4, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Juguete interactivo puzle',       'Juguete de estimulación mental con niveles de dificultad',         7800,  4, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Peluche chirrión mediano',        'Peluche con chirrión interior, resistente para uso moderado',      2600,  4, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Cortaúñas profesional',           'Cortaúñas de acero inoxidable con tope de seguridad',              4400,  5, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Cepillo de dientes + pasta',      'Kit dental canino con cepillo angular y pasta sabor pollo',        3200,  5, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Toallas absorbentes mascotas x5', 'Toallas microfibra súper absorbentes para secado rápido',          5600,  5, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Pañuelos húmedos mascotas x80',   'Toallitas limpiadoras sin alcohol para patas y pelaje',            2800,  5, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Cama lavable talla S',            'Cama con cubierta removible y lavable a máquina',                  14500, 6, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Casita interior perros medianos', 'Casita de madera MDF para uso interior, talla mediana',            35000, 6, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Cojín desmontable talla XL',      'Cojín con forro impermeable para camas y sofás',                   11000, 6, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Transportadora rígida talla M',   'Jaula de transporte rígida homologada para viajes en avión',       28000, 7, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Bolso de tela transportadora S',  'Bolso portamascotas tela para perros hasta 6kg',                   14000, 7, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Cinturón seguridad auto mascotas','Cinturón de seguridad para mascotas, compatible todos los autos',   3900,  7, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Rampa auto plegable',             'Rampa plegable para facilitar subida/bajada de perros mayores',    22000, 7, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Clicker de entrenamiento',        'Clicker con botón suave para entrenamiento positivo',              1200,  8, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Kit iniciación adiestramiento',   'Kit con clicker, bolsita premios y guía de entrenamiento',         8500,  8, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Alimento seco raza pequeña 3kg',  'Croquetas especiales para razas pequeñas y miniatura',             7200,  1, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Alimento grain-free adulto 8kg',  'Alimento sin granos, alto en proteína animal',                     21500, 1, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Collar anti-pulgas ultrasónico',  'Collar de ultrasonido repelente de pulgas y garrapatas',           9800,  3, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Colchoneta outdoor impermeable',  'Colchoneta para exterior, resistente al agua y a la intemperie',   13500, 6, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Dispensador bolsas fecales x3',   'Dispensador con 3 rollos de bolsas biodegradables',                2200,  2, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Placa identificación grabada',    'Placa metálica con grabado de nombre y teléfono para collar',      1800,  2, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Bozal ajustable talla M',         'Bozal de tela suave ajustable para adiestramiento',                3500,  2, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Piscina inflable mascotas',       'Piscina portátil de PVC para refrescarse en verano',               8900,  4, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Lanzapelotas automático',         'Lanzador automático de pelotas de tenis, alcance 10m',             24500, 4, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Escalera 3 peldaños cama',        'Escalera de acceso a cama o sofá para perros con movilidad reducida',18000,7, 1);
    FIDE_PRODUCTO_INSERT_SP( 'Spray repelente muebles 300ml',   'Spray disuasorio sin alcohol para proteger muebles',               3800,  3, 1);

    -- ============================================================
    -- FIDE_VENTA_TB  
    -- ============================================================
    FIDE_VENTA_INSERT_SP(  'FAC-2025-001', 2,  28700,  TO_DATE('2025-02-03','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP(  'FAC-2025-002', 3,  18900,  TO_DATE('2025-02-18','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP(  'FAC-2025-003', 4,  9700,   TO_DATE('2025-03-07','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP(  'FAC-2025-004', 5,  6500,   TO_DATE('2025-03-22','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP(  'FAC-2025-005', 6,  14300,  TO_DATE('2025-04-05','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP(  'FAC-2025-006', 8,  24000,  TO_DATE('2025-04-20','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP(  'FAC-2025-007', 9,  9500,   TO_DATE('2025-05-08','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP(  'FAC-2025-008', 10, 18700,  TO_DATE('2025-05-25','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP(  'FAC-2025-009', 11, 4800,   TO_DATE('2025-06-10','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2025-010', 13, 34500,  TO_DATE('2025-06-28','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2025-011', 14, 12300,  TO_DATE('2025-07-12','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2025-012', 15, 7800,   TO_DATE('2025-07-30','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2025-013', 16, 6500,   TO_DATE('2025-08-15','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2025-014', 17, 28700,  TO_DATE('2025-09-02','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2025-015', 18, 9800,   TO_DATE('2025-09-20','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2025-016', 19, 3500,   TO_DATE('2025-10-05','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2025-017', 20, 4200,   TO_DATE('2025-10-18','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2025-018', 21, 6800,   TO_DATE('2025-10-30','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2025-019', 22, 5200,   TO_DATE('2025-11-10','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2025-020', 23, 3100,   TO_DATE('2025-11-22','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2025-021', 24, 4600,   TO_DATE('2025-12-03','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2025-022', 25, 2100,   TO_DATE('2025-12-15','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2025-023', 26, 3300,   TO_DATE('2025-12-27','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2025-024', 27, 7800,   TO_DATE('2026-01-07','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2025-025', 28, 2600,   TO_DATE('2026-01-15','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-001', 29, 4400,   TO_DATE('2026-01-22','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-002', 30, 3200,   TO_DATE('2026-01-29','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-003', 31, 5600,   TO_DATE('2026-02-05','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-004', 32, 2800,   TO_DATE('2026-02-12','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-005', 33, 14500,  TO_DATE('2026-02-19','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-006', 34, 35000,  TO_DATE('2026-02-25','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-007', 35, 11000,  TO_DATE('2026-03-01','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-008', 36, 28000,  TO_DATE('2026-03-03','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-009', 37, 14000,  TO_DATE('2026-03-04','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-010', 38, 3900,   TO_DATE('2026-03-05','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-011', 39, 22000,  TO_DATE('2026-03-06','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-012', 40, 1200,   TO_DATE('2026-03-07','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-013', 41, 8500,   TO_DATE('2026-03-08','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-014', 42, 7200,   TO_DATE('2026-03-09','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-015', 43, 21500,  TO_DATE('2026-03-09','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-016', 44, 9800,   TO_DATE('2026-03-10','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-017', 45, 13500,  TO_DATE('2026-03-10','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-018', 46, 2200,   TO_DATE('2026-03-11','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-019', 47, 1800,   TO_DATE('2026-03-11','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-020', 48, 3500,   TO_DATE('2026-03-11','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-021', 49, 8900,   TO_DATE('2026-03-12','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-022', 50, 24500,  TO_DATE('2026-03-12','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-023', 51, 18000,  TO_DATE('2026-03-12','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-024', 52, 3800,   TO_DATE('2026-03-12','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-025', 1,  18900,  TO_DATE('2026-03-12','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-026', 2,  9500,   TO_DATE('2026-03-12','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-027', 11, 24000,  TO_DATE('2026-03-12','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-028', 7,  5600,   TO_DATE('2026-03-12','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-029', 10, 12500,  TO_DATE('2026-03-12','YYYY-MM-DD'), 1);
    FIDE_VENTA_INSERT_SP( 'FAC-2026-030', 5,  6500,   TO_DATE('2026-03-12','YYYY-MM-DD'), 1);

    -- ============================================================
    -- FIDE_PAGO_PAYPAL_TB 
    -- ============================================================
    FIDE_PAGO_PAYPAL_INSERT_SP(  'FAC-2025-001', '8BC91234XY0123456', '5HT67890AB1234567', TO_DATE('2025-02-03','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP(  'FAC-2025-002', '7AB23456ZW9876543', '4GR56789CD0123456', TO_DATE('2025-02-18','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP(  'FAC-2025-003', '6EF34567YX8765432', '3FS45678EF9012345', TO_DATE('2025-03-07','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP(  'FAC-2025-004', '5CD45678XW7654321', '2EP34567GH8901234', TO_DATE('2025-03-22','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP(  'FAC-2025-005', '4BC56789WV6543210', '1DO23456IJ7890123', TO_DATE('2025-04-05','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP(  'FAC-2025-006', '3AB67890VU5432109', '0CN12345KL6789012', TO_DATE('2025-04-20','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP(  'FAC-2025-007', '2ZY78901UT4321098', '9BM01234MN5678901', TO_DATE('2025-05-08','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP(  'FAC-2025-008', '1YX89012TS3210987', '8AL90123OP4567890', TO_DATE('2025-05-25','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP(  'FAC-2025-009', '0XW90123SR2109876', '7ZK89012QR3456789', TO_DATE('2025-06-10','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2025-010', '9WV01234RQ1098765', '6YJ78901ST2345678', TO_DATE('2025-06-28','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2025-011', '8VU12345QP0987654', '5XI67890UV1234567', TO_DATE('2025-07-12','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2025-012', '7UT23456PO9876543', '4WH56789WX0123456', TO_DATE('2025-07-30','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2025-013', '6TS34567ON8765432', '3VG45678YZ9012345', TO_DATE('2025-08-15','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2025-014', '5SR45678NM7654321', '2UF34567AB8901234', TO_DATE('2025-09-02','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2025-015', '4RQ56789ML6543210', '1TE23456CD7890123', TO_DATE('2025-09-20','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2025-016', '3QP67890LK5432109', '0SD12345EF6789012', TO_DATE('2025-10-05','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2025-017', '2PO78901KJ4321098', '9RC01234GH5678901', TO_DATE('2025-10-18','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2025-018', '1ON89012JI3210987', '8QB90123IJ4567890', TO_DATE('2025-10-30','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2025-019', '0NM90123IH2109876', '7PA89012KL3456789', TO_DATE('2025-11-10','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2025-020', '9ML01234HG1098765', '6OZ78901MN2345678', TO_DATE('2025-11-22','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2025-021', '8LK12345GF0987654', '5NY67890OP1234567', TO_DATE('2025-12-03','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2025-022', '7KJ23456FE9876543', '4MX56789QR0123456', TO_DATE('2025-12-15','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2025-023', '6JI34567ED8765432', '3LW45678ST9012345', TO_DATE('2025-12-27','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2025-024', '5IH45678DC7654321', '2KV34567UV8901234', TO_DATE('2026-01-07','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2025-025', '4HG56789CB6543210', '1JU23456WX7890123', TO_DATE('2026-01-15','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-001', '3GF67890BA5432109', '0IT12345YZ6789012', TO_DATE('2026-01-22','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-002', '2FE78901AZ4321098', '9HS01234AB5678901', TO_DATE('2026-01-29','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-003', '1ED89012ZY3210987', '8GR90123CD4567890', TO_DATE('2026-02-05','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-004', '0DC90123YX2109876', '7FQ89012EF3456789', TO_DATE('2026-02-12','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-005', '9CB01234XW1098765', '6EP78901GH2345678', TO_DATE('2026-02-19','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-006', '8BA12345WV0987654', '5DO67890IJ1234567', TO_DATE('2026-02-25','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-007', '7AZ23456VU9876543', '4CN56789KL0123456', TO_DATE('2026-03-01','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-008', '6ZY34567UT8765432', '3BM45678MN9012345', TO_DATE('2026-03-03','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-009', '5YX45678TS7654321', '2AL34567OP8901234', TO_DATE('2026-03-04','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-010', '4XW56789SR6543210', '1ZK23456QR7890123', TO_DATE('2026-03-05','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-011', '3WV67890RQ5432109', '0YJ12345ST6789012', TO_DATE('2026-03-06','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-012', '2VU78901QP4321098', '9XI01234UV5678901', TO_DATE('2026-03-07','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-013', '1UT89012PO3210987', '8WH90123WX4567890', TO_DATE('2026-03-08','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-014', '0TS90123ON2109876', '7VG89012YZ3456789', TO_DATE('2026-03-09','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-015', '9SR01234NM1098765', '6UF78901AB2345678', TO_DATE('2026-03-09','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-016', '8RQ12345ML0987654', '5TE67890CD1234567', TO_DATE('2026-03-10','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-017', '7QP23456LK9876543', '4SD56789EF0123456', TO_DATE('2026-03-10','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-018', '6PO34567KJ8765432', '3RC45678GH9012345', TO_DATE('2026-03-11','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-019', '5ON45678JI7654321', '2QB34567IJ8901234', TO_DATE('2026-03-11','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-020', '4NM56789IH6543210', '1PA23456KL7890123', TO_DATE('2026-03-11','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-021', '3ML67890HG5432109', '0OZ12345MN6789012', TO_DATE('2026-03-12','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-022', '2LK78901GF4321098', '9NY01234OP5678901', TO_DATE('2026-03-12','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-023', '1KJ89012FE3210987', '8MX90123QR4567890', TO_DATE('2026-03-12','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-024', '0JI90123ED2109876', '7LW89012ST3456789', TO_DATE('2026-03-12','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-025', '9IH01234DC1098765', '6KV78901UV2345678', TO_DATE('2026-03-12','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-026', '8HG12345CB0987654', '5JU67890WX1234567', TO_DATE('2026-03-12','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-027', '7GF23456BA9876543', '4IT56789YZ0123456', TO_DATE('2026-03-12','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-028', '6FE34567AZ8765432', '3HS45678AB9012345', TO_DATE('2026-03-12','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-029', '5ED45678ZY7654321', '2GR34567CD8901234', TO_DATE('2026-03-12','YYYY-MM-DD'), 1);
    FIDE_PAGO_PAYPAL_INSERT_SP( 'FAC-2026-030', '4DC56789YX6543210', '1FQ23456EF7890123', TO_DATE('2026-03-12','YYYY-MM-DD'), 1);

BEGIN

    -- ============================================================
    -- FIDE_DONACION_FACTURA_TB
    -- ============================================================

    -- Donaciones 2025
    FIDE_DONACION_FACTURA_INSERT_SP(1,  'DON-2025-001', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(2,  'DON-2025-002', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(3,  'DON-2025-003', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(4,  'DON-2025-004', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(5,  'DON-2025-005', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(6,  'DON-2025-006', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(7,  'DON-2025-007', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(8,  'DON-2025-008', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(9,  'DON-2025-009', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(10, 'DON-2025-010', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(11, 'DON-2025-011', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(12, 'DON-2025-012', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(13, 'DON-2025-013', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(14, 'DON-2025-014', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(15, 'DON-2025-015', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(16, 'DON-2025-016', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(17, 'DON-2025-017', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(18, 'DON-2025-018', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(19, 'DON-2025-019', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(20, 'DON-2025-020', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(21, 'DON-2025-021', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(22, 'DON-2025-022', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(23, 'DON-2025-023', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(24, 'DON-2025-024', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(25, 'DON-2025-025', 1);

    -- Donaciones 2026
    FIDE_DONACION_FACTURA_INSERT_SP(26, 'DON-2026-001', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(27, 'DON-2026-002', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(28, 'DON-2026-003', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(29, 'DON-2026-004', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(30, 'DON-2026-005', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(31, 'DON-2026-006', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(32, 'DON-2026-007', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(33, 'DON-2026-008', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(34, 'DON-2026-009', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(35, 'DON-2026-010', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(36, 'DON-2026-011', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(37, 'DON-2026-012', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(38, 'DON-2026-013', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(39, 'DON-2026-014', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(40, 'DON-2026-015', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(41, 'DON-2026-016', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(42, 'DON-2026-017', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(43, 'DON-2026-018', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(44, 'DON-2026-019', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(45, 'DON-2026-020', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(46, 'DON-2026-021', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(47, 'DON-2026-022', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(48, 'DON-2026-023', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(49, 'DON-2026-024', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(50, 'DON-2026-025', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(51, 'DON-2026-026', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(52, 'DON-2026-027', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(53, 'DON-2026-028', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(54, 'DON-2026-029', 1);
    FIDE_DONACION_FACTURA_INSERT_SP(55, 'DON-2026-030', 1);

    -- ============================================================
    -- FIDE_VENTA_FACTURA_TB
    -- ============================================================

    FIDE_VENTA_FACTURA_INSERT_SP(1,  'FAC-2025-001', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(2,  'FAC-2025-002', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(3,  'FAC-2025-003', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(4,  'FAC-2025-004', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(5,  'FAC-2025-005', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(6,  'FAC-2025-006', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(7,  'FAC-2025-007', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(8,  'FAC-2025-008', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(9,  'FAC-2025-009', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(10, 'FAC-2025-010', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(11, 'FAC-2025-011', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(12, 'FAC-2025-012', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(13, 'FAC-2025-013', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(14, 'FAC-2025-014', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(15, 'FAC-2025-015', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(16, 'FAC-2025-016', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(17, 'FAC-2025-017', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(18, 'FAC-2025-018', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(19, 'FAC-2025-019', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(20, 'FAC-2025-020', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(21, 'FAC-2025-021', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(22, 'FAC-2025-022', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(23, 'FAC-2025-023', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(24, 'FAC-2025-024', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(25, 'FAC-2025-025', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(26, 'FAC-2026-001', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(27, 'FAC-2026-002', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(28, 'FAC-2026-003', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(29, 'FAC-2026-004', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(30, 'FAC-2026-005', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(31, 'FAC-2026-006', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(32, 'FAC-2026-007', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(33, 'FAC-2026-008', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(34, 'FAC-2026-009', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(35, 'FAC-2026-010', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(36, 'FAC-2026-011', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(37, 'FAC-2026-012', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(38, 'FAC-2026-013', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(39, 'FAC-2026-014', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(40, 'FAC-2026-015', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(41, 'FAC-2026-016', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(42, 'FAC-2026-017', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(43, 'FAC-2026-018', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(44, 'FAC-2026-019', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(45, 'FAC-2026-020', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(46, 'FAC-2026-021', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(47, 'FAC-2026-022', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(48, 'FAC-2026-023', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(49, 'FAC-2026-024', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(50, 'FAC-2026-025', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(51, 'FAC-2026-026', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(52, 'FAC-2026-027', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(53, 'FAC-2026-028', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(54, 'FAC-2026-029', 1);
    FIDE_VENTA_FACTURA_INSERT_SP(55, 'FAC-2026-030', 1);
END;
/
