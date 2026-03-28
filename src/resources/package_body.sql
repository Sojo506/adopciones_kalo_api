CREATE OR REPLACE PACKAGE BODY FIDE_KALO_PKG IS

    /*
        FUNCIONES DE LECTURA PARA EL SITIO WEB
        Basadas exclusivamente en las tablas definidas en scheme.sql
    */

    /* ============================================================
       CATALOGOS Y UBICACIONES
       ============================================================ */

    FUNCTION FIDE_OBTENER_ESTADOS_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  ID_ESTADO,
                    NOMBRE_ESTADO
            FROM FIDE_ESTADO_TB
            ORDER BY ID_ESTADO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_ESTADOS_FN;

    FUNCTION FIDE_OBTENER_TIPOS_USUARIO_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  TU.ID_TIPO_USUARIO,
                    TU.NOMBRE,
                    TU.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TIPO_USUARIO_TB TU
            JOIN FIDE_ESTADO_TB E ON TU.ID_ESTADO = E.ID_ESTADO
            WHERE TU.ID_ESTADO = 1
            ORDER BY TU.ID_TIPO_USUARIO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_TIPOS_USUARIO_FN;

    FUNCTION FIDE_OBTENER_PAISES_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  P.ID_PAIS,
                    P.NOMBRE,
                    P.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_PAIS_TB P
            JOIN FIDE_ESTADO_TB E ON P.ID_ESTADO = E.ID_ESTADO
            WHERE P.ID_ESTADO = 1
            ORDER BY P.NOMBRE;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_PAISES_FN;

    FUNCTION FIDE_OBTENER_PROVINCIAS_POR_PAIS_FN(
        P_ID_PAIS IN FIDE_PROVINCIA_TB.ID_PAIS%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  PR.ID_PROVINCIA,
                    PR.NOMBRE,
                    PR.ID_PAIS,
                    PA.NOMBRE AS PAIS,
                    PR.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_PROVINCIA_TB PR
            JOIN FIDE_PAIS_TB PA ON PR.ID_PAIS = PA.ID_PAIS
            JOIN FIDE_ESTADO_TB E ON PR.ID_ESTADO = E.ID_ESTADO
            WHERE PR.ID_ESTADO = 1
              AND PR.ID_PAIS = P_ID_PAIS
            ORDER BY PR.NOMBRE;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_PROVINCIAS_POR_PAIS_FN;

    FUNCTION FIDE_OBTENER_CANTONES_POR_PROVINCIA_FN(
        P_ID_PROVINCIA IN FIDE_CANTON_TB.ID_PROVINCIA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  C.ID_CANTON,
                    C.NOMBRE,
                    C.ID_PROVINCIA,
                    PR.NOMBRE AS PROVINCIA,
                    C.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CANTON_TB C
            JOIN FIDE_PROVINCIA_TB PR ON C.ID_PROVINCIA = PR.ID_PROVINCIA
            JOIN FIDE_ESTADO_TB E ON C.ID_ESTADO = E.ID_ESTADO
            WHERE C.ID_ESTADO = 1
              AND C.ID_PROVINCIA = P_ID_PROVINCIA
            ORDER BY C.NOMBRE;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CANTONES_POR_PROVINCIA_FN;

    FUNCTION FIDE_OBTENER_DISTRITOS_POR_CANTON_FN(
        P_ID_CANTON IN FIDE_DISTRITO_TB.ID_CANTON%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  D.ID_DISTRITO,
                    D.NOMBRE,
                    D.ID_CANTON,
                    C.NOMBRE AS CANTON,
                    D.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_DISTRITO_TB D
            JOIN FIDE_CANTON_TB C ON D.ID_CANTON = C.ID_CANTON
            JOIN FIDE_ESTADO_TB E ON D.ID_ESTADO = E.ID_ESTADO
            WHERE D.ID_ESTADO = 1
              AND D.ID_CANTON = P_ID_CANTON
            ORDER BY D.NOMBRE;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_DISTRITOS_POR_CANTON_FN;

    FUNCTION FIDE_OBTENER_JERARQUIA_DISTRITO_FN(
        P_ID_PAIS      IN FIDE_PAIS_TB.ID_PAIS%TYPE,
        P_ID_PROVINCIA IN FIDE_PROVINCIA_TB.ID_PROVINCIA%TYPE,
        P_ID_CANTON    IN FIDE_CANTON_TB.ID_CANTON%TYPE,
        P_ID_DISTRITO  IN FIDE_DISTRITO_TB.ID_DISTRITO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  PA.ID_PAIS,
                    PA.NOMBRE AS PAIS,
                    PR.ID_PROVINCIA,
                    PR.NOMBRE AS PROVINCIA,
                    C.ID_CANTON,
                    C.NOMBRE AS CANTON,
                    D.ID_DISTRITO,
                    D.NOMBRE AS DISTRITO
            FROM FIDE_DISTRITO_TB D
            JOIN FIDE_CANTON_TB C ON D.ID_CANTON = C.ID_CANTON
            JOIN FIDE_PROVINCIA_TB PR ON C.ID_PROVINCIA = PR.ID_PROVINCIA
            JOIN FIDE_PAIS_TB PA ON PR.ID_PAIS = PA.ID_PAIS
            WHERE PA.ID_ESTADO = 1
              AND PR.ID_ESTADO = 1
              AND C.ID_ESTADO = 1
              AND D.ID_ESTADO = 1
              AND PA.ID_PAIS = P_ID_PAIS
              AND PR.ID_PROVINCIA = P_ID_PROVINCIA
              AND C.ID_CANTON = P_ID_CANTON
              AND D.ID_DISTRITO = P_ID_DISTRITO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_JERARQUIA_DISTRITO_FN;

    FUNCTION FIDE_OBTENER_TIPOS_OTP_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  T.ID_TIPO_OTP,
                    T.NOMBRE,
                    T.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TIPO_OTP_TB T
            JOIN FIDE_ESTADO_TB E ON T.ID_ESTADO = E.ID_ESTADO
            WHERE T.ID_ESTADO = 1
            ORDER BY T.ID_TIPO_OTP;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_TIPOS_OTP_FN;

    FUNCTION FIDE_OBTENER_CATEGORIAS_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  C.ID_CATEGORIA,
                    C.NOMBRE,
                    C.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CATEGORIA_TB C
            JOIN FIDE_ESTADO_TB E ON C.ID_ESTADO = E.ID_ESTADO
            WHERE C.ID_ESTADO = 1
            ORDER BY C.NOMBRE;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CATEGORIAS_FN;

    FUNCTION FIDE_OBTENER_MARCAS_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  M.ID_MARCA,
                    M.NOMBRE,
                    M.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_MARCA_TB M
            JOIN FIDE_ESTADO_TB E ON M.ID_ESTADO = E.ID_ESTADO
            WHERE M.ID_ESTADO = 1
            ORDER BY M.NOMBRE;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_MARCAS_FN;

    FUNCTION FIDE_OBTENER_TIPOS_MOVIMIENTO_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  TM.ID_TIPO_MOVIMIENTO,
                    TM.NOMBRE,
                    TM.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TIPO_MOVIMIENTO_TB TM
            JOIN FIDE_ESTADO_TB E ON TM.ID_ESTADO = E.ID_ESTADO
            WHERE TM.ID_ESTADO = 1
            ORDER BY TM.ID_TIPO_MOVIMIENTO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_TIPOS_MOVIMIENTO_FN;

    FUNCTION FIDE_OBTENER_CAMPANIAS_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  C.ID_CAMPANIA,
                    C.NOMBRE,
                    C.DESCRIPCION,
                    C.IMAGE_URL,
                    C.FECHA_INICIO,
                    C.FECHA_FIN,
                    C.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CAMPANIA_TB C
            JOIN FIDE_ESTADO_TB E ON C.ID_ESTADO = E.ID_ESTADO
            WHERE C.ID_ESTADO = 1
            ORDER BY C.FECHA_INICIO DESC, C.ID_CAMPANIA DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CAMPANIAS_FN;

    FUNCTION FIDE_OBTENER_MONEDAS_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  M.ID_MONEDA,
                    M.NOMBRE,
                    M.SIMBOLO,
                    M.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_MONEDA_TB M
            JOIN FIDE_ESTADO_TB E ON M.ID_ESTADO = E.ID_ESTADO
            WHERE M.ID_ESTADO = 1
            ORDER BY M.NOMBRE;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_MONEDAS_FN;

    FUNCTION FIDE_OBTENER_RAZAS_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  R.ID_RAZA,
                    R.NOMBRE,
                    R.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_RAZA_TB R
            JOIN FIDE_ESTADO_TB E ON R.ID_ESTADO = E.ID_ESTADO
            WHERE R.ID_ESTADO = 1
            ORDER BY R.NOMBRE;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_RAZAS_FN;

    FUNCTION FIDE_OBTENER_SEXOS_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  S.ID_SEXO,
                    S.NOMBRE,
                    S.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_SEXO_TB S
            JOIN FIDE_ESTADO_TB E ON S.ID_ESTADO = E.ID_ESTADO
            WHERE S.ID_ESTADO = 1
            ORDER BY S.ID_SEXO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_SEXOS_FN;

    FUNCTION FIDE_OBTENER_TIPOS_SOLICITUD_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  TS.ID_TIPO_SOLICITUD,
                    TS.NOMBRE,
                    TS.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TIPO_SOLICITUD_TB TS
            JOIN FIDE_ESTADO_TB E ON TS.ID_ESTADO = E.ID_ESTADO
            WHERE TS.ID_ESTADO = 1
            ORDER BY TS.ID_TIPO_SOLICITUD;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_TIPOS_SOLICITUD_FN;

    FUNCTION FIDE_OBTENER_TIPOS_RESPUESTA_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  TR.ID_TIPO_RESPUESTA,
                    TR.NOMBRE,
                    TR.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TIPO_RESPUESTA_TB TR
            JOIN FIDE_ESTADO_TB E ON TR.ID_ESTADO = E.ID_ESTADO
            WHERE TR.ID_ESTADO = 1
            ORDER BY TR.ID_TIPO_RESPUESTA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_TIPOS_RESPUESTA_FN;

    FUNCTION FIDE_OBTENER_TIPOS_SEGUIMIENTO_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  TS.ID_TIPO_SEGUIMIENTO,
                    TS.NOMBRE,
                    TS.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TIPO_SEGUIMIENTO_TB TS
            JOIN FIDE_ESTADO_TB E ON TS.ID_ESTADO = E.ID_ESTADO
            WHERE TS.ID_ESTADO = 1
            ORDER BY TS.ID_TIPO_SEGUIMIENTO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_TIPOS_SEGUIMIENTO_FN;

    FUNCTION FIDE_OBTENER_TIPOS_EVENTO_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  TE.ID_TIPO_EVENTO,
                    TE.NOMBRE,
                    TE.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TIPO_EVENTO_TB TE
            JOIN FIDE_ESTADO_TB E ON TE.ID_ESTADO = E.ID_ESTADO
            WHERE TE.ID_ESTADO = 1
            ORDER BY TE.ID_TIPO_EVENTO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_TIPOS_EVENTO_FN;

    /* ============================================================
       USUARIOS Y AUTENTICACION
       ============================================================ */

    FUNCTION FIDE_OBTENER_DIRECCION_POR_ID_FN(
        P_ID_DIRECCION IN FIDE_DIRECCION_TB.ID_DIRECCION%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  D.ID_DIRECCION,
                    D.ID_DISTRITO,
                    DIS.NOMBRE AS DISTRITO,
                    C.ID_CANTON,
                    C.NOMBRE AS CANTON,
                    PR.ID_PROVINCIA,
                    PR.NOMBRE AS PROVINCIA,
                    PA.ID_PAIS,
                    PA.NOMBRE AS PAIS,
                    D.CALLE,
                    D.NUMERO,
                    D.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_DIRECCION_TB D
            JOIN FIDE_DISTRITO_TB DIS ON D.ID_DISTRITO = DIS.ID_DISTRITO
            JOIN FIDE_CANTON_TB C ON DIS.ID_CANTON = C.ID_CANTON
            JOIN FIDE_PROVINCIA_TB PR ON C.ID_PROVINCIA = PR.ID_PROVINCIA
            JOIN FIDE_PAIS_TB PA ON PR.ID_PAIS = PA.ID_PAIS
            JOIN FIDE_ESTADO_TB E ON D.ID_ESTADO = E.ID_ESTADO
            WHERE D.ID_DIRECCION = P_ID_DIRECCION;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_DIRECCION_POR_ID_FN;

    FUNCTION FIDE_OBTENER_USUARIOS_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  U.IDENTIFICACION,
                    U.NOMBRE,
                    U.APELLIDO_PATERNO,
                    U.APELLIDO_MATERNO,
                    U.FECHA_REGISTRO,
                    U.ID_DIRECCION,
                    U.ID_TIPO_USUARIO,
                    TU.NOMBRE AS TIPO_USUARIO,
                    U.ID_ESTADO,
                    EU.NOMBRE_ESTADO AS ESTADO_USUARIO,
                    C.ID_CUENTA,
                    C.USUARIO,
                    COR.CORREO,
                    C.ID_ESTADO AS ID_ESTADO_CUENTA,
                    EC.NOMBRE_ESTADO AS ESTADO_CUENTA,
                    DIR.ID_DISTRITO,
                    DIR.CALLE,
                    DIR.NUMERO,
                    DIS.NOMBRE AS DISTRITO,
                    CAN.ID_CANTON,
                    CAN.NOMBRE AS CANTON,
                    PRO.ID_PROVINCIA,
                    PRO.NOMBRE AS PROVINCIA,
                    PA.ID_PAIS,
                    PA.NOMBRE AS PAIS
            FROM FIDE_USUARIO_TB U
            LEFT JOIN FIDE_CUENTA_TB C ON U.IDENTIFICACION = C.IDENTIFICACION
            LEFT JOIN (
                SELECT  IDENTIFICACION,
                        CORREO,
                        ID_ESTADO,
                        ROW_NUMBER() OVER (
                            PARTITION BY IDENTIFICACION
                            ORDER BY CASE WHEN ID_ESTADO = 1 THEN 0 ELSE 1 END, CORREO
                        ) AS RN
                FROM FIDE_CORREO_TB
            ) COR ON U.IDENTIFICACION = COR.IDENTIFICACION AND COR.RN = 1
            LEFT JOIN FIDE_TIPO_USUARIO_TB TU ON U.ID_TIPO_USUARIO = TU.ID_TIPO_USUARIO
            LEFT JOIN FIDE_ESTADO_TB EU ON U.ID_ESTADO = EU.ID_ESTADO
            LEFT JOIN FIDE_ESTADO_TB EC ON C.ID_ESTADO = EC.ID_ESTADO
            LEFT JOIN FIDE_DIRECCION_TB DIR ON U.ID_DIRECCION = DIR.ID_DIRECCION
            LEFT JOIN FIDE_DISTRITO_TB DIS ON DIR.ID_DISTRITO = DIS.ID_DISTRITO
            LEFT JOIN FIDE_CANTON_TB CAN ON DIS.ID_CANTON = CAN.ID_CANTON
            LEFT JOIN FIDE_PROVINCIA_TB PRO ON CAN.ID_PROVINCIA = PRO.ID_PROVINCIA
            LEFT JOIN FIDE_PAIS_TB PA ON PRO.ID_PAIS = PA.ID_PAIS
            ORDER BY U.IDENTIFICACION;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_USUARIOS_FN;

    FUNCTION FIDE_OBTENER_USUARIO_POR_IDENTIFICACION_FN(
        P_IDENTIFICACION IN FIDE_USUARIO_TB.IDENTIFICACION%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  U.IDENTIFICACION,
                    U.NOMBRE,
                    U.APELLIDO_PATERNO,
                    U.APELLIDO_MATERNO,
                    U.FECHA_REGISTRO,
                    U.ID_DIRECCION,
                    U.ID_TIPO_USUARIO,
                    TU.NOMBRE AS TIPO_USUARIO,
                    U.ID_ESTADO,
                    EU.NOMBRE_ESTADO AS ESTADO_USUARIO,
                    C.ID_CUENTA,
                    C.USUARIO,
                    COR.CORREO,
                    C.PASSWORD_HASH,
                    C.ID_ESTADO AS ID_ESTADO_CUENTA,
                    EC.NOMBRE_ESTADO AS ESTADO_CUENTA,
                    DIR.ID_DISTRITO,
                    DIR.CALLE,
                    DIR.NUMERO,
                    DIS.NOMBRE AS DISTRITO,
                    CAN.ID_CANTON,
                    CAN.NOMBRE AS CANTON,
                    PRO.ID_PROVINCIA,
                    PRO.NOMBRE AS PROVINCIA,
                    PA.ID_PAIS,
                    PA.NOMBRE AS PAIS
            FROM FIDE_USUARIO_TB U
            LEFT JOIN FIDE_CUENTA_TB C ON U.IDENTIFICACION = C.IDENTIFICACION
            LEFT JOIN (
                SELECT  IDENTIFICACION,
                        CORREO,
                        ID_ESTADO,
                        ROW_NUMBER() OVER (
                            PARTITION BY IDENTIFICACION
                            ORDER BY CASE WHEN ID_ESTADO = 1 THEN 0 ELSE 1 END, CORREO
                        ) AS RN
                FROM FIDE_CORREO_TB
            ) COR ON U.IDENTIFICACION = COR.IDENTIFICACION AND COR.RN = 1
            LEFT JOIN FIDE_TIPO_USUARIO_TB TU ON U.ID_TIPO_USUARIO = TU.ID_TIPO_USUARIO
            LEFT JOIN FIDE_ESTADO_TB EU ON U.ID_ESTADO = EU.ID_ESTADO
            LEFT JOIN FIDE_ESTADO_TB EC ON C.ID_ESTADO = EC.ID_ESTADO
            LEFT JOIN FIDE_DIRECCION_TB DIR ON U.ID_DIRECCION = DIR.ID_DIRECCION
            LEFT JOIN FIDE_DISTRITO_TB DIS ON DIR.ID_DISTRITO = DIS.ID_DISTRITO
            LEFT JOIN FIDE_CANTON_TB CAN ON DIS.ID_CANTON = CAN.ID_CANTON
            LEFT JOIN FIDE_PROVINCIA_TB PRO ON CAN.ID_PROVINCIA = PRO.ID_PROVINCIA
            LEFT JOIN FIDE_PAIS_TB PA ON PRO.ID_PAIS = PA.ID_PAIS
            WHERE U.IDENTIFICACION = P_IDENTIFICACION;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_USUARIO_POR_IDENTIFICACION_FN;

    FUNCTION FIDE_OBTENER_CORREOS_USUARIO_FN(
        P_IDENTIFICACION IN FIDE_CORREO_TB.IDENTIFICACION%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  C.IDENTIFICACION,
                    C.CORREO,
                    C.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CORREO_TB C
            JOIN FIDE_ESTADO_TB E ON C.ID_ESTADO = E.ID_ESTADO
            WHERE C.IDENTIFICACION = P_IDENTIFICACION
            ORDER BY C.CORREO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CORREOS_USUARIO_FN;

    FUNCTION FIDE_OBTENER_CORREO_POR_DIRECCION_FN(
        P_CORREO IN FIDE_CORREO_TB.CORREO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  C.IDENTIFICACION,
                    C.CORREO,
                    C.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CORREO_TB C
            JOIN FIDE_ESTADO_TB E ON C.ID_ESTADO = E.ID_ESTADO
            WHERE LOWER(C.CORREO) = LOWER(P_CORREO)
            ORDER BY C.IDENTIFICACION;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CORREO_POR_DIRECCION_FN;

    FUNCTION FIDE_OBTENER_TELEFONOS_USUARIO_FN(
        P_IDENTIFICACION IN FIDE_TELEFONO_TB.IDENTIFICACION%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  T.IDENTIFICACION,
                    T.TELEFONO,
                    T.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TELEFONO_TB T
            JOIN FIDE_ESTADO_TB E ON T.ID_ESTADO = E.ID_ESTADO
            WHERE T.IDENTIFICACION = P_IDENTIFICACION
            ORDER BY T.TELEFONO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_TELEFONOS_USUARIO_FN;

    FUNCTION FIDE_OBTENER_TELEFONO_POR_NUMERO_FN(
        P_TELEFONO IN FIDE_TELEFONO_TB.TELEFONO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  T.IDENTIFICACION,
                    T.TELEFONO,
                    T.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TELEFONO_TB T
            JOIN FIDE_ESTADO_TB E ON T.ID_ESTADO = E.ID_ESTADO
            WHERE T.TELEFONO = P_TELEFONO
            ORDER BY T.IDENTIFICACION;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_TELEFONO_POR_NUMERO_FN;

    FUNCTION FIDE_OBTENER_CUENTA_POR_CORREO_FN(
        P_USUARIO IN FIDE_CUENTA_TB.USUARIO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  C.ID_CUENTA,
                    C.IDENTIFICACION,
                    C.USUARIO,
                    C.PASSWORD_HASH,
                    C.FECHA_REGISTRO,
                    C.ID_ESTADO,
                    U.NOMBRE,
                    U.APELLIDO_PATERNO,
                    U.APELLIDO_MATERNO,
                    U.ID_TIPO_USUARIO,
                    TU.NOMBRE AS TIPO_USUARIO
            FROM FIDE_CUENTA_TB C
            JOIN FIDE_USUARIO_TB U ON C.IDENTIFICACION = U.IDENTIFICACION
            JOIN FIDE_TIPO_USUARIO_TB TU ON U.ID_TIPO_USUARIO = TU.ID_TIPO_USUARIO
            WHERE C.USUARIO = P_USUARIO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CUENTA_POR_CORREO_FN;

    FUNCTION FIDE_OBTENER_CUENTA_POR_ID_CUENTA_FN(
        P_ID_CUENTA IN FIDE_CUENTA_TB.ID_CUENTA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  C.ID_CUENTA,
                    C.IDENTIFICACION,
                    C.USUARIO,
                    C.PASSWORD_HASH,
                    C.FECHA_REGISTRO,
                    C.ID_ESTADO,
                    U.NOMBRE,
                    U.APELLIDO_PATERNO,
                    U.APELLIDO_MATERNO,
                    U.ID_TIPO_USUARIO,
                    TU.NOMBRE AS TIPO_USUARIO
            FROM FIDE_CUENTA_TB C
            JOIN FIDE_USUARIO_TB U ON C.IDENTIFICACION = U.IDENTIFICACION
            JOIN FIDE_TIPO_USUARIO_TB TU ON U.ID_TIPO_USUARIO = TU.ID_TIPO_USUARIO
            WHERE C.ID_CUENTA = P_ID_CUENTA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CUENTA_POR_ID_CUENTA_FN;

    FUNCTION FIDE_OBTENER_CUENTA_POR_IDENTIFICACION_FN(
        P_IDENTIFICACION IN FIDE_CUENTA_TB.IDENTIFICACION%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  C.ID_CUENTA,
                    C.IDENTIFICACION,
                    C.USUARIO,
                    C.PASSWORD_HASH,
                    C.FECHA_REGISTRO,
                    C.ID_ESTADO,
                    U.NOMBRE,
                    U.APELLIDO_PATERNO,
                    U.APELLIDO_MATERNO,
                    U.ID_TIPO_USUARIO,
                    TU.NOMBRE AS TIPO_USUARIO
            FROM FIDE_CUENTA_TB C
            JOIN FIDE_USUARIO_TB U ON C.IDENTIFICACION = U.IDENTIFICACION
            JOIN FIDE_TIPO_USUARIO_TB TU ON U.ID_TIPO_USUARIO = TU.ID_TIPO_USUARIO
            WHERE C.IDENTIFICACION = P_IDENTIFICACION;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CUENTA_POR_IDENTIFICACION_FN;

    FUNCTION FIDE_OBTENER_OTPS_ACTIVOS_POR_CUENTA_FN(
        P_ID_CUENTA   IN FIDE_CODIGO_OTP_TB.ID_CUENTA%TYPE,
        P_ID_TIPO_OTP IN FIDE_CODIGO_OTP_TB.ID_TIPO_OTP%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  O.ID_CODIGO_OTP,
                    O.ID_CUENTA,
                    O.ID_TIPO_OTP,
                    T.NOMBRE AS TIPO_OTP,
                    O.CODIGO_HASH,
                    O.FECHA_EXPIRACION,
                    O.FECHA_USO,
                    O.INTENTOS,
                    O.FECHA_CREACION,
                    O.ID_ESTADO
            FROM FIDE_CODIGO_OTP_TB O
            JOIN FIDE_TIPO_OTP_TB T ON O.ID_TIPO_OTP = T.ID_TIPO_OTP
            WHERE O.ID_CUENTA = P_ID_CUENTA
              AND O.ID_ESTADO = 1
              AND O.FECHA_EXPIRACION > SYSDATE
              AND O.INTENTOS < 5
              AND (O.ID_TIPO_OTP = P_ID_TIPO_OTP OR P_ID_TIPO_OTP IS NULL)
            ORDER BY O.FECHA_CREACION DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_OTPS_ACTIVOS_POR_CUENTA_FN;

    FUNCTION FIDE_OBTENER_REFRESH_TOKENS_POR_CUENTA_FN(
        P_ID_CUENTA IN FIDE_REFRESH_TOKEN_TB.ID_CUENTA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  RT.ID_REFRESH_TOKEN,
                    RT.ID_CUENTA,
                    RT.TOKEN_HASH,
                    RT.JTI,
                    RT.IP_ADDRESS,
                    RT.USER_AGENT,
                    RT.FECHA_EXPIRACION,
                    RT.FECHA_REVOCACION,
                    RT.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_REFRESH_TOKEN_TB RT
            JOIN FIDE_ESTADO_TB E ON RT.ID_ESTADO = E.ID_ESTADO
            WHERE RT.ID_CUENTA = P_ID_CUENTA
            ORDER BY RT.FECHA_EXPIRACION DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_REFRESH_TOKENS_POR_CUENTA_FN;

    FUNCTION FIDE_VERIFICAR_PERMISO_ADMIN_FN(
        P_IDENTIFICACION IN FIDE_USUARIO_TB.IDENTIFICACION%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  U.IDENTIFICACION,
                    U.ID_TIPO_USUARIO,
                    TU.NOMBRE AS TIPO_USUARIO,
                    CASE
                        WHEN U.ID_TIPO_USUARIO = 1 AND U.ID_ESTADO = 1 THEN 'SI'
                        ELSE 'NO'
                    END AS ES_ADMIN
            FROM FIDE_USUARIO_TB U
            JOIN FIDE_TIPO_USUARIO_TB TU ON U.ID_TIPO_USUARIO = TU.ID_TIPO_USUARIO
            WHERE U.IDENTIFICACION = P_IDENTIFICACION;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_VERIFICAR_PERMISO_ADMIN_FN;

    /* ============================================================
       PERFIL DEL USUARIO
       ============================================================ */

    FUNCTION FIDE_OBTENER_RESUMEN_PERFIL_CUENTA_FN(
        P_ID_CUENTA IN FIDE_CUENTA_TB.ID_CUENTA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  C.ID_CUENTA,
                    C.IDENTIFICACION,
                    U.NOMBRE,
                    U.APELLIDO_PATERNO,
                    U.APELLIDO_MATERNO,
                    U.FECHA_REGISTRO,
                    U.ID_DIRECCION,
                    U.ID_TIPO_USUARIO,
                    C.USUARIO,
                    C.PASSWORD_HASH,
                    U.ID_ESTADO,
                    EU.NOMBRE_ESTADO AS ESTADO_USUARIO,
                    C.ID_ESTADO AS ID_ESTADO_CUENTA,
                    EC.NOMBRE_ESTADO AS ESTADO_CUENTA,
                    COR.CORREO,
                    COR.ID_ESTADO AS ID_ESTADO_CORREO,
                    ECO.NOMBRE_ESTADO AS ESTADO_CORREO,
                    TEL.TELEFONO,
                    TEL.ID_ESTADO AS ID_ESTADO_TELEFONO,
                    ETE.NOMBRE_ESTADO AS ESTADO_TELEFONO,
                    DIR.ID_DISTRITO,
                    DIR.CALLE,
                    DIR.NUMERO,
                    DIS.NOMBRE AS DISTRITO,
                    CAN.ID_CANTON,
                    CAN.NOMBRE AS CANTON,
                    PRO.ID_PROVINCIA,
                    PRO.NOMBRE AS PROVINCIA,
                    PA.ID_PAIS,
                    PA.NOMBRE AS PAIS
            FROM FIDE_CUENTA_TB C
            JOIN FIDE_USUARIO_TB U ON C.IDENTIFICACION = U.IDENTIFICACION
            LEFT JOIN (
                SELECT  IDENTIFICACION,
                        CORREO,
                        ID_ESTADO,
                        ROW_NUMBER() OVER (
                            PARTITION BY IDENTIFICACION
                            ORDER BY CASE WHEN ID_ESTADO = 1 THEN 0 ELSE 1 END, CORREO
                        ) AS RN
                FROM FIDE_CORREO_TB
            ) COR ON C.IDENTIFICACION = COR.IDENTIFICACION AND COR.RN = 1
            LEFT JOIN FIDE_ESTADO_TB ECO ON COR.ID_ESTADO = ECO.ID_ESTADO
            LEFT JOIN (
                SELECT  IDENTIFICACION,
                        TELEFONO,
                        ID_ESTADO,
                        ROW_NUMBER() OVER (
                            PARTITION BY IDENTIFICACION
                            ORDER BY CASE WHEN ID_ESTADO = 1 THEN 0 ELSE 1 END, TELEFONO
                        ) AS RN
                FROM FIDE_TELEFONO_TB
            ) TEL ON C.IDENTIFICACION = TEL.IDENTIFICACION AND TEL.RN = 1
            LEFT JOIN FIDE_ESTADO_TB ETE ON TEL.ID_ESTADO = ETE.ID_ESTADO
            LEFT JOIN FIDE_DIRECCION_TB DIR ON U.ID_DIRECCION = DIR.ID_DIRECCION
            LEFT JOIN FIDE_DISTRITO_TB DIS ON DIR.ID_DISTRITO = DIS.ID_DISTRITO
            LEFT JOIN FIDE_CANTON_TB CAN ON DIS.ID_CANTON = CAN.ID_CANTON
            LEFT JOIN FIDE_PROVINCIA_TB PRO ON CAN.ID_PROVINCIA = PRO.ID_PROVINCIA
            LEFT JOIN FIDE_PAIS_TB PA ON PRO.ID_PAIS = PA.ID_PAIS
            JOIN FIDE_ESTADO_TB EU ON U.ID_ESTADO = EU.ID_ESTADO
            JOIN FIDE_ESTADO_TB EC ON C.ID_ESTADO = EC.ID_ESTADO
            WHERE C.ID_CUENTA = P_ID_CUENTA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_RESUMEN_PERFIL_CUENTA_FN;

    FUNCTION FIDE_OBTENER_SOLICITUDES_PERFIL_CUENTA_FN(
        P_ID_CUENTA IN FIDE_CUENTA_TB.ID_CUENTA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  S.ID_SOLICITUD,
                    S.IDENTIFICACION,
                    S.ID_TIPO_SOLICITUD,
                    TS.NOMBRE AS TIPO_SOLICITUD,
                    S.ID_ESTADO,
                    ES.NOMBRE_ESTADO AS ESTADO_SOLICITUD,
                    A.ID_ADOPCION,
                    A.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    A.FECHA_ADOPCION,
                    A.ID_ESTADO AS ID_ESTADO_PROCESO,
                    EA.NOMBRE_ESTADO AS ESTADO_PROCESO
            FROM FIDE_CUENTA_TB C
            JOIN FIDE_SOLICITUD_TB S ON C.IDENTIFICACION = S.IDENTIFICACION
            JOIN FIDE_TIPO_SOLICITUD_TB TS ON S.ID_TIPO_SOLICITUD = TS.ID_TIPO_SOLICITUD
            JOIN FIDE_ESTADO_TB ES ON S.ID_ESTADO = ES.ID_ESTADO
            LEFT JOIN FIDE_ADOPCION_TB A ON S.ID_SOLICITUD = A.ID_SOLICITUD
            LEFT JOIN FIDE_PERRITO_TB P ON A.ID_PERRITO = P.ID_PERRITO
            LEFT JOIN FIDE_ESTADO_TB EA ON A.ID_ESTADO = EA.ID_ESTADO
            WHERE C.ID_CUENTA = P_ID_CUENTA
            ORDER BY S.ID_SOLICITUD DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_SOLICITUDES_PERFIL_CUENTA_FN;

    FUNCTION FIDE_OBTENER_SEGUIMIENTOS_PERFIL_CUENTA_FN(
        P_ID_CUENTA IN FIDE_CUENTA_TB.ID_CUENTA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  SG.ID_SEGUIMIENTO,
                    SG.ID_ADOPCION,
                    A.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    SG.ID_TIPO_SEGUIMIENTO,
                    TS.NOMBRE AS TIPO_SEGUIMIENTO,
                    SG.FECHA_INICIO,
                    SG.FECHA_FIN,
                    SG.COMENTARIOS,
                    SG.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO,
                    NVL(EV.CANTIDAD_EVIDENCIAS, 0) AS CANTIDAD_EVIDENCIAS,
                    EV.ULTIMA_FECHA_EVIDENCIA
            FROM FIDE_CUENTA_TB C
            JOIN FIDE_ADOPCION_TB A ON C.IDENTIFICACION = A.IDENTIFICACION
            JOIN FIDE_SEGUIMIENTO_TB SG ON A.ID_ADOPCION = SG.ID_ADOPCION
            JOIN FIDE_PERRITO_TB P ON A.ID_PERRITO = P.ID_PERRITO
            JOIN FIDE_TIPO_SEGUIMIENTO_TB TS ON SG.ID_TIPO_SEGUIMIENTO = TS.ID_TIPO_SEGUIMIENTO
            JOIN FIDE_ESTADO_TB E ON SG.ID_ESTADO = E.ID_ESTADO
            LEFT JOIN (
                SELECT  EV.ID_SEGUIMIENTO,
                        COUNT(*) AS CANTIDAD_EVIDENCIAS,
                        MAX(EV.FECHA_EVIDENCIA) AS ULTIMA_FECHA_EVIDENCIA
                FROM FIDE_EVIDENCIA_TB EV
                WHERE EV.ID_ESTADO = 1
                GROUP BY EV.ID_SEGUIMIENTO
            ) EV ON SG.ID_SEGUIMIENTO = EV.ID_SEGUIMIENTO
            WHERE C.ID_CUENTA = P_ID_CUENTA
            ORDER BY NVL(EV.ULTIMA_FECHA_EVIDENCIA, SG.FECHA_FIN) DESC,
                     SG.FECHA_FIN DESC,
                     SG.ID_SEGUIMIENTO DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_SEGUIMIENTOS_PERFIL_CUENTA_FN;

    FUNCTION FIDE_OBTENER_EVIDENCIAS_PERFIL_CUENTA_FN(
        P_ID_CUENTA IN FIDE_CUENTA_TB.ID_CUENTA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  EV.ID_EVIDENCIA,
                    EV.ID_SEGUIMIENTO,
                    SG.ID_ADOPCION,
                    A.IDENTIFICACION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS ADOPTANTE,
                    A.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    SG.ID_TIPO_SEGUIMIENTO,
                    TS.NOMBRE AS TIPO_SEGUIMIENTO,
                    SG.FECHA_INICIO,
                    SG.FECHA_FIN,
                    EV.IMAGEN_URL,
                    EV.COMENTARIOS,
                    EV.FECHA_EVIDENCIA,
                    EV.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CUENTA_TB C
            JOIN FIDE_ADOPCION_TB A ON C.IDENTIFICACION = A.IDENTIFICACION
            JOIN FIDE_USUARIO_TB U ON A.IDENTIFICACION = U.IDENTIFICACION
            JOIN FIDE_PERRITO_TB P ON A.ID_PERRITO = P.ID_PERRITO
            JOIN FIDE_SEGUIMIENTO_TB SG ON A.ID_ADOPCION = SG.ID_ADOPCION
            JOIN FIDE_TIPO_SEGUIMIENTO_TB TS ON SG.ID_TIPO_SEGUIMIENTO = TS.ID_TIPO_SEGUIMIENTO
            JOIN FIDE_EVIDENCIA_TB EV ON SG.ID_SEGUIMIENTO = EV.ID_SEGUIMIENTO
            JOIN FIDE_ESTADO_TB E ON EV.ID_ESTADO = E.ID_ESTADO
            WHERE C.ID_CUENTA = P_ID_CUENTA
            ORDER BY EV.FECHA_EVIDENCIA DESC, EV.ID_EVIDENCIA DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_EVIDENCIAS_PERFIL_CUENTA_FN;

    FUNCTION FIDE_OBTENER_COMPRAS_PERFIL_CUENTA_FN(
        P_ID_CUENTA IN FIDE_CUENTA_TB.ID_CUENTA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  V.ID_VENTA,
                    V.IDENTIFICACION,
                    V.TOTAL_VENTA,
                    V.FECHA_VENTA,
                    V.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CUENTA_TB C
            JOIN FIDE_VENTA_TB V ON C.IDENTIFICACION = V.IDENTIFICACION
            JOIN FIDE_ESTADO_TB E ON V.ID_ESTADO = E.ID_ESTADO
            WHERE C.ID_CUENTA = P_ID_CUENTA
            ORDER BY V.FECHA_VENTA DESC, V.ID_VENTA DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_COMPRAS_PERFIL_CUENTA_FN;

    FUNCTION FIDE_OBTENER_PRODUCTOS_COMPRA_PERFIL_CUENTA_FN(
        P_ID_CUENTA IN FIDE_CUENTA_TB.ID_CUENTA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  V.ID_VENTA,
                    VP.ID_PRODUCTO,
                    P.NOMBRE AS PRODUCTO,
                    VP.ID_TIPO_MOVIMIENTO,
                    TM.NOMBRE AS TIPO_MOVIMIENTO,
                    VP.CANTIDAD,
                    VP.PRECIO_UNITARIO,
                    VP.TOTAL,
                    VP.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CUENTA_TB C
            JOIN FIDE_VENTA_TB V ON C.IDENTIFICACION = V.IDENTIFICACION
            JOIN FIDE_VENTA_PRODUCTO_TB VP ON V.ID_VENTA = VP.ID_VENTA
            JOIN FIDE_PRODUCTO_TB P ON VP.ID_PRODUCTO = P.ID_PRODUCTO
            LEFT JOIN FIDE_TIPO_MOVIMIENTO_TB TM ON VP.ID_TIPO_MOVIMIENTO = TM.ID_TIPO_MOVIMIENTO
            JOIN FIDE_ESTADO_TB E ON VP.ID_ESTADO = E.ID_ESTADO
            WHERE C.ID_CUENTA = P_ID_CUENTA
            ORDER BY V.FECHA_VENTA DESC, V.ID_VENTA DESC, VP.ID_PRODUCTO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_PRODUCTOS_COMPRA_PERFIL_CUENTA_FN;

    FUNCTION FIDE_OBTENER_FACTURAS_COMPRA_PERFIL_CUENTA_FN(
        P_ID_CUENTA IN FIDE_CUENTA_TB.ID_CUENTA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  V.ID_VENTA,
                    VF.ID_FACTURA,
                    F.ID_MONEDA,
                    M.NOMBRE AS MONEDA,
                    M.SIMBOLO,
                    F.TOTAL AS TOTAL_FACTURA,
                    F.FECHA_FACTURA,
                    VF.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CUENTA_TB C
            JOIN FIDE_VENTA_TB V ON C.IDENTIFICACION = V.IDENTIFICACION
            JOIN FIDE_VENTA_FACTURA_TB VF ON V.ID_VENTA = VF.ID_VENTA
            JOIN FIDE_FACTURA_TB F ON VF.ID_FACTURA = F.ID_FACTURA
            JOIN FIDE_MONEDA_TB M ON F.ID_MONEDA = M.ID_MONEDA
            JOIN FIDE_ESTADO_TB E ON VF.ID_ESTADO = E.ID_ESTADO
            WHERE C.ID_CUENTA = P_ID_CUENTA
            ORDER BY V.FECHA_VENTA DESC, V.ID_VENTA DESC, F.FECHA_FACTURA DESC, VF.ID_FACTURA DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_FACTURAS_COMPRA_PERFIL_CUENTA_FN;

    FUNCTION FIDE_OBTENER_CASAS_CUNA_PERFIL_CUENTA_FN(
        P_ID_CUENTA IN FIDE_CUENTA_TB.ID_CUENTA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  CC.ID_CASA_CUNA,
                    CC.NOMBRE,
                    CC.ID_DIRECCION,
                    CC.IDENTIFICACION,
                    CC.ID_SOLICITUD,
                    S.ID_TIPO_SOLICITUD,
                    TS.NOMBRE AS TIPO_SOLICITUD,
                    DIR.CALLE,
                    DIR.NUMERO,
                    DIR.ID_DISTRITO,
                    DIS.NOMBRE AS DISTRITO,
                    CAN.ID_CANTON,
                    CAN.NOMBRE AS CANTON,
                    PRO.ID_PROVINCIA,
                    PRO.NOMBRE AS PROVINCIA,
                    PA.ID_PAIS,
                    PA.NOMBRE AS PAIS,
                    NVL(CP.TOTAL_PERRITOS, 0) AS TOTAL_PERRITOS,
                    CC.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CUENTA_TB C
            JOIN FIDE_CASA_CUNA_TB CC ON C.IDENTIFICACION = CC.IDENTIFICACION
            JOIN FIDE_DIRECCION_TB DIR ON CC.ID_DIRECCION = DIR.ID_DIRECCION
            JOIN FIDE_DISTRITO_TB DIS ON DIR.ID_DISTRITO = DIS.ID_DISTRITO
            JOIN FIDE_CANTON_TB CAN ON DIS.ID_CANTON = CAN.ID_CANTON
            JOIN FIDE_PROVINCIA_TB PRO ON CAN.ID_PROVINCIA = PRO.ID_PROVINCIA
            JOIN FIDE_PAIS_TB PA ON PRO.ID_PAIS = PA.ID_PAIS
            LEFT JOIN FIDE_SOLICITUD_TB S ON CC.ID_SOLICITUD = S.ID_SOLICITUD
            LEFT JOIN FIDE_TIPO_SOLICITUD_TB TS ON S.ID_TIPO_SOLICITUD = TS.ID_TIPO_SOLICITUD
            LEFT JOIN (
                SELECT  ID_CASA_CUNA,
                        COUNT(*) AS TOTAL_PERRITOS
                FROM FIDE_CASA_PERRITO_TB
                WHERE ID_ESTADO = 1
                GROUP BY ID_CASA_CUNA
            ) CP ON CC.ID_CASA_CUNA = CP.ID_CASA_CUNA
            JOIN FIDE_ESTADO_TB E ON CC.ID_ESTADO = E.ID_ESTADO
            WHERE C.ID_CUENTA = P_ID_CUENTA
            ORDER BY CC.ID_CASA_CUNA DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CASAS_CUNA_PERFIL_CUENTA_FN;

    FUNCTION FIDE_OBTENER_PERRITOS_CASA_PERFIL_CUENTA_FN(
        P_ID_CUENTA IN FIDE_CUENTA_TB.ID_CUENTA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  CC.ID_CASA_CUNA,
                    CP.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    CP.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CUENTA_TB C
            JOIN FIDE_CASA_CUNA_TB CC ON C.IDENTIFICACION = CC.IDENTIFICACION
            JOIN FIDE_CASA_PERRITO_TB CP ON CC.ID_CASA_CUNA = CP.ID_CASA_CUNA
            JOIN FIDE_PERRITO_TB P ON CP.ID_PERRITO = P.ID_PERRITO
            JOIN FIDE_ESTADO_TB E ON CP.ID_ESTADO = E.ID_ESTADO
            WHERE C.ID_CUENTA = P_ID_CUENTA
              AND CP.ID_ESTADO = 1
            ORDER BY CC.ID_CASA_CUNA DESC, CP.ID_PERRITO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_PERRITOS_CASA_PERFIL_CUENTA_FN;

    /* ============================================================
       TIENDA, PRODUCTOS E INVENTARIO
       ============================================================ */

    FUNCTION FIDE_OBTENER_PRODUCTOS_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
        V_SQL              VARCHAR2(4000);
        V_TIENE_ID_MARCA   NUMBER;
        V_TIENE_PRODUCTO_IMAGEN NUMBER;
    BEGIN
        SELECT COUNT(*)
        INTO V_TIENE_ID_MARCA
        FROM USER_TAB_COLUMNS
        WHERE TABLE_NAME = 'FIDE_PRODUCTO_TB'
          AND COLUMN_NAME = 'ID_MARCA';

        SELECT COUNT(*)
        INTO V_TIENE_PRODUCTO_IMAGEN
        FROM USER_TABLES
        WHERE TABLE_NAME = 'FIDE_PRODUCTO_IMAGEN_TB';

        V_SQL := 'SELECT  P.ID_PRODUCTO,
                          P.NOMBRE,
                          P.DESCRIPCION,
                          P.PRECIO,
                          P.ID_CATEGORIA,
                          C.NOMBRE AS CATEGORIA, ';

        IF V_TIENE_ID_MARCA > 0 THEN
            V_SQL := V_SQL || 'P.ID_MARCA,
                               M.NOMBRE AS MARCA, ';
        ELSE
            V_SQL := V_SQL || 'CAST(NULL AS NUMBER) AS ID_MARCA,
                               CAST(NULL AS VARCHAR2(100)) AS MARCA, ';
        END IF;

        IF V_TIENE_PRODUCTO_IMAGEN > 0 THEN
            V_SQL := V_SQL || 'PI.IMAGE_URL, ';
        ELSE
            V_SQL := V_SQL || 'CAST(NULL AS VARCHAR2(500)) AS IMAGE_URL, ';
        END IF;

        V_SQL := V_SQL || 'NVL(I.CANTIDAD, 0) AS STOCK,
                           P.ID_ESTADO,
                           E.NOMBRE_ESTADO AS ESTADO
                    FROM FIDE_PRODUCTO_TB P
                    JOIN FIDE_CATEGORIA_TB C ON P.ID_CATEGORIA = C.ID_CATEGORIA ';

        IF V_TIENE_ID_MARCA > 0 THEN
            V_SQL := V_SQL || 'JOIN FIDE_MARCA_TB M ON P.ID_MARCA = M.ID_MARCA ';
        END IF;

        V_SQL := V_SQL || 'JOIN FIDE_ESTADO_TB E ON P.ID_ESTADO = E.ID_ESTADO ';

        IF V_TIENE_PRODUCTO_IMAGEN > 0 THEN
            V_SQL := V_SQL || 'LEFT JOIN (
                                   SELECT  ID_PRODUCTO,
                                           MIN(IMAGE_URL) AS IMAGE_URL
                                   FROM FIDE_PRODUCTO_IMAGEN_TB
                                   WHERE ID_ESTADO = 1
                                   GROUP BY ID_PRODUCTO
                               ) PI ON P.ID_PRODUCTO = PI.ID_PRODUCTO ';
        END IF;

        V_SQL := V_SQL || 'LEFT JOIN (
                               SELECT  ID_PRODUCTO,
                                       SUM(CANTIDAD) AS CANTIDAD
                               FROM FIDE_INVENTARIO_TB
                               WHERE ID_ESTADO = 1
                               GROUP BY ID_PRODUCTO
                           ) I ON P.ID_PRODUCTO = I.ID_PRODUCTO
                           WHERE P.ID_ESTADO = 1
                           ORDER BY P.ID_PRODUCTO';

        OPEN V_CURSOR_RESULTADO FOR V_SQL;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_PRODUCTOS_FN;

    FUNCTION FIDE_OBTENER_PRODUCTO_POR_ID_FN(
        P_ID_PRODUCTO IN FIDE_PRODUCTO_TB.ID_PRODUCTO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
        V_SQL              VARCHAR2(4000);
        V_TIENE_ID_MARCA   NUMBER;
        V_TIENE_PRODUCTO_IMAGEN NUMBER;
    BEGIN
        SELECT COUNT(*)
        INTO V_TIENE_ID_MARCA
        FROM USER_TAB_COLUMNS
        WHERE TABLE_NAME = 'FIDE_PRODUCTO_TB'
          AND COLUMN_NAME = 'ID_MARCA';

        SELECT COUNT(*)
        INTO V_TIENE_PRODUCTO_IMAGEN
        FROM USER_TABLES
        WHERE TABLE_NAME = 'FIDE_PRODUCTO_IMAGEN_TB';

        V_SQL := 'SELECT  P.ID_PRODUCTO,
                          P.NOMBRE,
                          P.DESCRIPCION,
                          P.PRECIO,
                          P.ID_CATEGORIA,
                          C.NOMBRE AS CATEGORIA, ';

        IF V_TIENE_ID_MARCA > 0 THEN
            V_SQL := V_SQL || 'P.ID_MARCA,
                               M.NOMBRE AS MARCA, ';
        ELSE
            V_SQL := V_SQL || 'CAST(NULL AS NUMBER) AS ID_MARCA,
                               CAST(NULL AS VARCHAR2(100)) AS MARCA, ';
        END IF;

        IF V_TIENE_PRODUCTO_IMAGEN > 0 THEN
            V_SQL := V_SQL || 'PI.IMAGE_URL, ';
        ELSE
            V_SQL := V_SQL || 'CAST(NULL AS VARCHAR2(500)) AS IMAGE_URL, ';
        END IF;

        V_SQL := V_SQL || 'NVL(I.CANTIDAD, 0) AS STOCK,
                           P.ID_ESTADO,
                           E.NOMBRE_ESTADO AS ESTADO
                    FROM FIDE_PRODUCTO_TB P
                    JOIN FIDE_CATEGORIA_TB C ON P.ID_CATEGORIA = C.ID_CATEGORIA ';

        IF V_TIENE_ID_MARCA > 0 THEN
            V_SQL := V_SQL || 'JOIN FIDE_MARCA_TB M ON P.ID_MARCA = M.ID_MARCA ';
        END IF;

        V_SQL := V_SQL || 'JOIN FIDE_ESTADO_TB E ON P.ID_ESTADO = E.ID_ESTADO ';

        IF V_TIENE_PRODUCTO_IMAGEN > 0 THEN
            V_SQL := V_SQL || 'LEFT JOIN (
                                   SELECT  ID_PRODUCTO,
                                           MIN(IMAGE_URL) AS IMAGE_URL
                                   FROM FIDE_PRODUCTO_IMAGEN_TB
                                   WHERE ID_ESTADO = 1
                                   GROUP BY ID_PRODUCTO
                               ) PI ON P.ID_PRODUCTO = PI.ID_PRODUCTO ';
        END IF;

        V_SQL := V_SQL || 'LEFT JOIN (
                               SELECT  ID_PRODUCTO,
                                       SUM(CANTIDAD) AS CANTIDAD
                               FROM FIDE_INVENTARIO_TB
                               WHERE ID_ESTADO = 1
                               GROUP BY ID_PRODUCTO
                           ) I ON P.ID_PRODUCTO = I.ID_PRODUCTO
                           WHERE P.ID_PRODUCTO = :P_ID_PRODUCTO';

        OPEN V_CURSOR_RESULTADO FOR V_SQL USING P_ID_PRODUCTO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_PRODUCTO_POR_ID_FN;

    FUNCTION FIDE_OBTENER_IMAGENES_PRODUCTO_FN(
        P_ID_PRODUCTO IN FIDE_PRODUCTO_IMAGEN_TB.ID_PRODUCTO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  PI.ID_IMAGEN,
                    PI.ID_PRODUCTO,
                    PI.IMAGE_URL,
                    PI.ID_ESTADO
            FROM FIDE_PRODUCTO_IMAGEN_TB PI
            WHERE PI.ID_PRODUCTO = P_ID_PRODUCTO
            ORDER BY PI.ID_IMAGEN;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_IMAGENES_PRODUCTO_FN;

    FUNCTION FIDE_OBTENER_INVENTARIO_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  I.ID_INVENTARIO,
                    I.ID_PRODUCTO,
                    P.NOMBRE AS PRODUCTO,
                    I.CANTIDAD,
                    I.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_INVENTARIO_TB I
            JOIN FIDE_PRODUCTO_TB P ON I.ID_PRODUCTO = P.ID_PRODUCTO
            JOIN FIDE_ESTADO_TB E ON I.ID_ESTADO = E.ID_ESTADO
            WHERE I.ID_ESTADO = 1
            ORDER BY I.ID_INVENTARIO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_INVENTARIO_FN;

    FUNCTION FIDE_OBTENER_INVENTARIOS_POR_PRODUCTO_FN(
        P_ID_PRODUCTO IN FIDE_INVENTARIO_TB.ID_PRODUCTO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  I.ID_INVENTARIO,
                    I.ID_PRODUCTO,
                    P.NOMBRE AS PRODUCTO,
                    I.CANTIDAD,
                    I.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_INVENTARIO_TB I
            JOIN FIDE_PRODUCTO_TB P ON I.ID_PRODUCTO = P.ID_PRODUCTO
            JOIN FIDE_ESTADO_TB E ON I.ID_ESTADO = E.ID_ESTADO
            WHERE I.ID_PRODUCTO = P_ID_PRODUCTO
            ORDER BY I.ID_INVENTARIO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_INVENTARIOS_POR_PRODUCTO_FN;

    FUNCTION FIDE_OBTENER_MOVIMIENTOS_INVENTARIO_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  MI.ID_MOVIMIENTO,
                    MI.ID_PRODUCTO,
                    P.NOMBRE AS PRODUCTO,
                    MI.ID_TIPO_MOVIMIENTO,
                    TM.NOMBRE AS TIPO_MOVIMIENTO,
                    MI.CANTIDAD,
                    MI.FECHA_MOVIMIENTO,
                    MI.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_MOVIMIENTO_INVENTARIO_TB MI
            JOIN FIDE_PRODUCTO_TB P ON MI.ID_PRODUCTO = P.ID_PRODUCTO
            JOIN FIDE_TIPO_MOVIMIENTO_TB TM ON MI.ID_TIPO_MOVIMIENTO = TM.ID_TIPO_MOVIMIENTO
            JOIN FIDE_ESTADO_TB E ON MI.ID_ESTADO = E.ID_ESTADO
            WHERE MI.ID_ESTADO = 1
            ORDER BY MI.FECHA_MOVIMIENTO DESC, MI.ID_MOVIMIENTO DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_MOVIMIENTOS_INVENTARIO_FN;

    FUNCTION FIDE_OBTENER_MOVIMIENTOS_INVENTARIO_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  MI.ID_MOVIMIENTO,
                    MI.ID_PRODUCTO,
                    P.NOMBRE AS PRODUCTO,
                    MI.ID_TIPO_MOVIMIENTO,
                    TM.NOMBRE AS TIPO_MOVIMIENTO,
                    MI.CANTIDAD,
                    MI.FECHA_MOVIMIENTO,
                    MI.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_MOVIMIENTO_INVENTARIO_TB MI
            JOIN FIDE_PRODUCTO_TB P ON MI.ID_PRODUCTO = P.ID_PRODUCTO
            JOIN FIDE_TIPO_MOVIMIENTO_TB TM ON MI.ID_TIPO_MOVIMIENTO = TM.ID_TIPO_MOVIMIENTO
            JOIN FIDE_ESTADO_TB E ON MI.ID_ESTADO = E.ID_ESTADO
            ORDER BY MI.FECHA_MOVIMIENTO DESC, MI.ID_MOVIMIENTO DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_MOVIMIENTOS_INVENTARIO_ADMIN_FN;

    FUNCTION FIDE_OBTENER_MOVIMIENTOS_PRODUCTO_FN(
        P_ID_PRODUCTO IN FIDE_MOVIMIENTO_INVENTARIO_TB.ID_PRODUCTO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  MI.ID_MOVIMIENTO,
                    MI.ID_PRODUCTO,
                    P.NOMBRE AS PRODUCTO,
                    MI.ID_TIPO_MOVIMIENTO,
                    TM.NOMBRE AS TIPO_MOVIMIENTO,
                    MI.CANTIDAD,
                    MI.FECHA_MOVIMIENTO,
                    MI.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_MOVIMIENTO_INVENTARIO_TB MI
            JOIN FIDE_PRODUCTO_TB P ON MI.ID_PRODUCTO = P.ID_PRODUCTO
            JOIN FIDE_TIPO_MOVIMIENTO_TB TM ON MI.ID_TIPO_MOVIMIENTO = TM.ID_TIPO_MOVIMIENTO
            JOIN FIDE_ESTADO_TB E ON MI.ID_ESTADO = E.ID_ESTADO
            WHERE MI.ID_PRODUCTO = P_ID_PRODUCTO
            ORDER BY MI.FECHA_MOVIMIENTO DESC, MI.ID_MOVIMIENTO DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_MOVIMIENTOS_PRODUCTO_FN;

    FUNCTION FIDE_VERIFICAR_STOCK_TIENDA_FN(
        P_ID_PRODUCTO          IN FIDE_INVENTARIO_TB.ID_PRODUCTO%TYPE,
        P_CANTIDAD_REQUERIDA   IN NUMBER
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  P.ID_PRODUCTO,
                    P.NOMBRE AS PRODUCTO,
                    NVL(I.CANTIDAD, 0) AS STOCK_ACTUAL,
                    P_CANTIDAD_REQUERIDA AS CANTIDAD_REQUERIDA,
                    CASE
                        WHEN NVL(I.CANTIDAD, 0) >= P_CANTIDAD_REQUERIDA THEN 'SI'
                        ELSE 'NO'
                    END AS HAY_STOCK
            FROM FIDE_PRODUCTO_TB P
            LEFT JOIN (
                SELECT  ID_PRODUCTO,
                        SUM(CANTIDAD) AS CANTIDAD
                FROM FIDE_INVENTARIO_TB
                WHERE ID_ESTADO = 1
                GROUP BY ID_PRODUCTO
            ) I ON P.ID_PRODUCTO = I.ID_PRODUCTO
            WHERE P.ID_PRODUCTO = P_ID_PRODUCTO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_VERIFICAR_STOCK_TIENDA_FN;

    /* ============================================================
       PREGUNTAS, SOLICITUDES Y CASAS CUNA
       ============================================================ */

    FUNCTION FIDE_OBTENER_PREGUNTAS_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  P.ID_PREGUNTA,
                    P.PREGUNTA,
                    P.ID_TIPO_RESPUESTA,
                    TR.NOMBRE AS TIPO_RESPUESTA,
                    P.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_PREGUNTA_TB P
            JOIN FIDE_TIPO_RESPUESTA_TB TR ON P.ID_TIPO_RESPUESTA = TR.ID_TIPO_RESPUESTA
            JOIN FIDE_ESTADO_TB E ON P.ID_ESTADO = E.ID_ESTADO
            WHERE P.ID_ESTADO = 1
            ORDER BY P.ID_PREGUNTA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_PREGUNTAS_FN;

    FUNCTION FIDE_OBTENER_SOLICITUDES_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  S.ID_SOLICITUD,
                    S.IDENTIFICACION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS SOLICITANTE,
                    A.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    S.ID_TIPO_SOLICITUD,
                    TS.NOMBRE AS TIPO_SOLICITUD,
                    S.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO_SOLICITUD
            FROM FIDE_SOLICITUD_TB S
            JOIN FIDE_USUARIO_TB U ON S.IDENTIFICACION = U.IDENTIFICACION
            LEFT JOIN FIDE_ADOPCION_TB A ON S.ID_SOLICITUD = A.ID_SOLICITUD
            LEFT JOIN FIDE_PERRITO_TB P ON A.ID_PERRITO = P.ID_PERRITO
            JOIN FIDE_TIPO_SOLICITUD_TB TS ON S.ID_TIPO_SOLICITUD = TS.ID_TIPO_SOLICITUD
            JOIN FIDE_ESTADO_TB E ON S.ID_ESTADO = E.ID_ESTADO
            ORDER BY S.ID_SOLICITUD DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_SOLICITUDES_FN;

    FUNCTION FIDE_OBTENER_SOLICITUD_POR_ID_FN(
        P_ID_SOLICITUD IN FIDE_SOLICITUD_TB.ID_SOLICITUD%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  S.ID_SOLICITUD,
                    S.IDENTIFICACION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS SOLICITANTE,
                    A.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    S.ID_TIPO_SOLICITUD,
                    TS.NOMBRE AS TIPO_SOLICITUD,
                    S.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO_SOLICITUD
            FROM FIDE_SOLICITUD_TB S
            JOIN FIDE_USUARIO_TB U ON S.IDENTIFICACION = U.IDENTIFICACION
            LEFT JOIN FIDE_ADOPCION_TB A ON S.ID_SOLICITUD = A.ID_SOLICITUD
            LEFT JOIN FIDE_PERRITO_TB P ON A.ID_PERRITO = P.ID_PERRITO
            JOIN FIDE_TIPO_SOLICITUD_TB TS ON S.ID_TIPO_SOLICITUD = TS.ID_TIPO_SOLICITUD
            JOIN FIDE_ESTADO_TB E ON S.ID_ESTADO = E.ID_ESTADO
            WHERE S.ID_SOLICITUD = P_ID_SOLICITUD;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_SOLICITUD_POR_ID_FN;

    FUNCTION FIDE_OBTENER_PREGUNTAS_POR_TIPO_SOLICITUD_FN(
        P_ID_TIPO_SOLICITUD IN FIDE_TIPO_SOLICITUD_PREGUNTA_TB.ID_TIPO_SOLICITUD%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  SP.ID_TIPO_SOLICITUD,
                    P.ID_PREGUNTA,
                    P.PREGUNTA,
                    P.ID_TIPO_RESPUESTA,
                    TR.NOMBRE AS TIPO_RESPUESTA,
                    SP.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TIPO_SOLICITUD_PREGUNTA_TB SP
            JOIN FIDE_PREGUNTA_TB P ON SP.ID_PREGUNTA = P.ID_PREGUNTA
            JOIN FIDE_TIPO_RESPUESTA_TB TR ON P.ID_TIPO_RESPUESTA = TR.ID_TIPO_RESPUESTA
            JOIN FIDE_ESTADO_TB E ON SP.ID_ESTADO = E.ID_ESTADO
            WHERE SP.ID_TIPO_SOLICITUD = P_ID_TIPO_SOLICITUD
              AND SP.ID_ESTADO = 1
              AND P.ID_ESTADO = 1
            ORDER BY P.ID_PREGUNTA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_PREGUNTAS_POR_TIPO_SOLICITUD_FN;

    FUNCTION FIDE_OBTENER_RESPUESTAS_POR_SOLICITUD_FN(
        P_ID_SOLICITUD IN FIDE_RESPUESTA_TB.ID_SOLICITUD%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  R.ID_RESPUESTA,
                    R.ID_SOLICITUD,
                    R.ID_PREGUNTA,
                    P.PREGUNTA,
                    P.ID_TIPO_RESPUESTA,
                    TR.NOMBRE AS TIPO_RESPUESTA,
                    R.RESPUESTA,
                    R.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_RESPUESTA_TB R
            JOIN FIDE_PREGUNTA_TB P ON R.ID_PREGUNTA = P.ID_PREGUNTA
            JOIN FIDE_TIPO_RESPUESTA_TB TR ON P.ID_TIPO_RESPUESTA = TR.ID_TIPO_RESPUESTA
            JOIN FIDE_ESTADO_TB E ON R.ID_ESTADO = E.ID_ESTADO
            WHERE R.ID_SOLICITUD = P_ID_SOLICITUD
            ORDER BY R.ID_RESPUESTA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_RESPUESTAS_POR_SOLICITUD_FN;

    FUNCTION FIDE_OBTENER_CASAS_CUNA_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  CC.ID_CASA_CUNA,
                    CC.NOMBRE,
                    CC.ID_DIRECCION,
                    CC.IDENTIFICACION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS ENCARGADO,
                    CC.ID_SOLICITUD,
                    A.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    DIR.CALLE,
                    DIR.NUMERO,
                    DIS.NOMBRE AS DISTRITO,
                    CAN.NOMBRE AS CANTON,
                    PRO.NOMBRE AS PROVINCIA,
                    PA.NOMBRE AS PAIS,
                    (
                        SELECT COUNT(*)
                        FROM FIDE_CASA_PERRITO_TB CP
                        WHERE CP.ID_CASA_CUNA = CC.ID_CASA_CUNA
                          AND CP.ID_ESTADO = 1
                ) AS TOTAL_PERRITOS,
                CC.ID_ESTADO,
                E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CASA_CUNA_TB CC
            JOIN FIDE_USUARIO_TB U ON CC.IDENTIFICACION = U.IDENTIFICACION
            LEFT JOIN FIDE_ADOPCION_TB A ON CC.ID_SOLICITUD = A.ID_SOLICITUD
            LEFT JOIN FIDE_PERRITO_TB P ON A.ID_PERRITO = P.ID_PERRITO
            JOIN FIDE_DIRECCION_TB DIR ON CC.ID_DIRECCION = DIR.ID_DIRECCION
            JOIN FIDE_DISTRITO_TB DIS ON DIR.ID_DISTRITO = DIS.ID_DISTRITO
            JOIN FIDE_CANTON_TB CAN ON DIS.ID_CANTON = CAN.ID_CANTON
            JOIN FIDE_PROVINCIA_TB PRO ON CAN.ID_PROVINCIA = PRO.ID_PROVINCIA
            JOIN FIDE_PAIS_TB PA ON PRO.ID_PAIS = PA.ID_PAIS
            JOIN FIDE_ESTADO_TB E ON CC.ID_ESTADO = E.ID_ESTADO
            ORDER BY CC.ID_CASA_CUNA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CASAS_CUNA_FN;

    FUNCTION FIDE_PERRITOS_EN_CASA_CUNA_FN(
        P_IDENTIFICACION IN FIDE_USUARIO_TB.IDENTIFICACION%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  P.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    P.EDAD,
                    P.PESO,
                    CC.ID_CASA_CUNA,
                    CC.NOMBRE AS NOMBRE_CASA_CUNA
            FROM FIDE_CASA_CUNA_TB CC
            JOIN FIDE_CASA_PERRITO_TB CP ON CC.ID_CASA_CUNA = CP.ID_CASA_CUNA
            JOIN FIDE_PERRITO_TB P ON CP.ID_PERRITO = P.ID_PERRITO
            WHERE CC.IDENTIFICACION = P_IDENTIFICACION
              AND CC.ID_ESTADO = 1
              AND CP.ID_ESTADO = 1
            ORDER BY CC.ID_CASA_CUNA, P.ID_PERRITO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_PERRITOS_EN_CASA_CUNA_FN;

    FUNCTION FIDE_OBTENER_PERRITOS_CASA_CUNA_FN(
        P_ID_CASA_CUNA IN FIDE_CASA_PERRITO_TB.ID_CASA_CUNA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  CP.ID_CASA_CUNA,
                    CC.NOMBRE AS CASA_CUNA,
                    P.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    P.EDAD,
                    P.PESO,
                    R.NOMBRE AS RAZA,
                    S.NOMBRE AS SEXO
            FROM FIDE_CASA_PERRITO_TB CP
            JOIN FIDE_CASA_CUNA_TB CC ON CP.ID_CASA_CUNA = CC.ID_CASA_CUNA
            JOIN FIDE_PERRITO_TB P ON CP.ID_PERRITO = P.ID_PERRITO
            JOIN FIDE_RAZA_TB R ON P.ID_RAZA = R.ID_RAZA
            JOIN FIDE_SEXO_TB S ON P.ID_SEXO = S.ID_SEXO
            WHERE CP.ID_CASA_CUNA = P_ID_CASA_CUNA
              AND CP.ID_ESTADO = 1
            ORDER BY P.ID_PERRITO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_PERRITOS_CASA_CUNA_FN;

    /* ============================================================
       PERRITOS Y EVENTOS
       ============================================================ */

    FUNCTION FIDE_OBTENER_PERRO_DISPONIBLES_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  P.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    P.FECHA_INGRESO,
                    P.EDAD,
                    P.PESO,
                    P.ESTATURA,
                    P.ID_RAZA,
                    R.NOMBRE AS RAZA,
                    P.ID_SEXO,
                    S.NOMBRE AS SEXO,
                    PI.IMAGE_URL
            FROM FIDE_PERRITO_TB P
            JOIN FIDE_RAZA_TB R ON P.ID_RAZA = R.ID_RAZA
            JOIN FIDE_SEXO_TB S ON P.ID_SEXO = S.ID_SEXO
            LEFT JOIN (
                SELECT  ID_PERRITO,
                        MIN(IMAGE_URL) AS IMAGE_URL
                FROM FIDE_PERRITO_IMAGEN_TB
                WHERE ID_ESTADO = 1
                GROUP BY ID_PERRITO
            ) PI ON P.ID_PERRITO = PI.ID_PERRITO
            WHERE P.ID_ESTADO = 1
            ORDER BY P.ID_PERRITO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_PERRO_DISPONIBLES_FN;

    FUNCTION FIDE_OBTENER_PERRO_POR_ID_FN(
        P_ID_PERRITO IN FIDE_PERRITO_TB.ID_PERRITO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  P.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    P.FECHA_INGRESO,
                    P.EDAD,
                    P.PESO,
                    P.ESTATURA,
                    P.ID_RAZA,
                    R.NOMBRE AS RAZA,
                    P.ID_SEXO,
                    S.NOMBRE AS SEXO,
                    P.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO,
                    PI.IMAGE_URL
            FROM FIDE_PERRITO_TB P
            JOIN FIDE_RAZA_TB R ON P.ID_RAZA = R.ID_RAZA
            JOIN FIDE_SEXO_TB S ON P.ID_SEXO = S.ID_SEXO
            JOIN FIDE_ESTADO_TB E ON P.ID_ESTADO = E.ID_ESTADO
            LEFT JOIN (
                SELECT  ID_PERRITO,
                        MIN(IMAGE_URL) AS IMAGE_URL
                FROM FIDE_PERRITO_IMAGEN_TB
                WHERE ID_ESTADO = 1
                GROUP BY ID_PERRITO
            ) PI ON P.ID_PERRITO = PI.ID_PERRITO
            WHERE P.ID_PERRITO = P_ID_PERRITO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_PERRO_POR_ID_FN;

    FUNCTION FIDE_OBTENER_IMAGENES_PERRO_FN(
        P_ID_PERRITO IN FIDE_PERRITO_IMAGEN_TB.ID_PERRITO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  PI.ID_IMAGEN,
                    PI.ID_PERRITO,
                    PI.IMAGE_URL,
                    PI.ID_ESTADO
            FROM FIDE_PERRITO_IMAGEN_TB PI
            WHERE PI.ID_PERRITO = P_ID_PERRITO
            ORDER BY PI.ID_IMAGEN;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_IMAGENES_PERRO_FN;

    FUNCTION FIDE_HISTORIAL_MEDICO_PERRITO_FN(
        P_ID_PERRITO IN FIDE_PERRITO_TB.ID_PERRITO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  EP.ID_EVENTO,
                    EP.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    EP.ID_TIPO_EVENTO,
                    TE.NOMBRE AS TIPO_EVENTO,
                    EP.FECHA_EVENTO,
                    EP.DETALLE,
                    EP.TOTAL_GASTO,
                    EP.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_EVENTO_PERRITO_TB EP
            JOIN FIDE_PERRITO_TB P ON EP.ID_PERRITO = P.ID_PERRITO
            JOIN FIDE_TIPO_EVENTO_TB TE ON EP.ID_TIPO_EVENTO = TE.ID_TIPO_EVENTO
            JOIN FIDE_ESTADO_TB E ON EP.ID_ESTADO = E.ID_ESTADO
            WHERE EP.ID_PERRITO = P_ID_PERRITO
            ORDER BY EP.FECHA_EVENTO DESC, EP.ID_EVENTO DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_HISTORIAL_MEDICO_PERRITO_FN;

    FUNCTION FIDE_OBTENER_DETALLES_EVENTO_FN(
        P_ID_EVENTO IN FIDE_DETALLE_EVENTO_TB.ID_EVENTO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  DE.ID_DETALLE_EVENTO,
                    DE.ID_EVENTO,
                    DE.COMPROBANTE_URL,
                    DE.DESCRIPCION,
                    DE.MONTO,
                    DE.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_DETALLE_EVENTO_TB DE
            JOIN FIDE_ESTADO_TB E ON DE.ID_ESTADO = E.ID_ESTADO
            WHERE DE.ID_EVENTO = P_ID_EVENTO
            ORDER BY DE.ID_DETALLE_EVENTO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_DETALLES_EVENTO_FN;

    FUNCTION FIDE_GASTOS_POR_PERRO_FN(
        P_ID_PERRITO IN FIDE_PERRITO_TB.ID_PERRITO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  P.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    NVL(SUM(EP.TOTAL_GASTO), 0) AS TOTAL_GASTOS
            FROM FIDE_PERRITO_TB P
            LEFT JOIN FIDE_EVENTO_PERRITO_TB EP
                   ON P.ID_PERRITO = EP.ID_PERRITO
                  AND EP.ID_ESTADO = 1
            WHERE P.ID_PERRITO = P_ID_PERRITO
            GROUP BY P.ID_PERRITO, P.NOMBRE;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_GASTOS_POR_PERRO_FN;

    FUNCTION FIDE_BUSCAR_PERROS_FILTROS_FN(
        P_EDAD_MAX IN NUMBER,
        P_PESO_MAX IN NUMBER,
        P_ID_SEXO  IN NUMBER
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  P.ID_PERRITO,
                    P.NOMBRE,
                    P.FECHA_INGRESO,
                    P.EDAD,
                    P.PESO,
                    P.ESTATURA,
                    R.NOMBRE AS RAZA,
                    S.NOMBRE AS SEXO
            FROM FIDE_PERRITO_TB P
            JOIN FIDE_RAZA_TB R ON P.ID_RAZA = R.ID_RAZA
            JOIN FIDE_SEXO_TB S ON P.ID_SEXO = S.ID_SEXO
            WHERE P.ID_ESTADO = 1
              AND (P.EDAD <= P_EDAD_MAX OR P_EDAD_MAX IS NULL)
              AND (P.PESO <= P_PESO_MAX OR P_PESO_MAX IS NULL)
              AND (P.ID_SEXO = P_ID_SEXO OR P_ID_SEXO IS NULL)
            ORDER BY P.ID_PERRITO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_BUSCAR_PERROS_FILTROS_FN;

    FUNCTION FIDE_CALCULAR_DIAS_ALBERGUE_FN(
        P_ID_PERRITO IN FIDE_PERRITO_TB.ID_PERRITO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  P.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    P.FECHA_INGRESO,
                    TRUNC(SYSDATE) - TRUNC(P.FECHA_INGRESO) AS DIAS_ALBERGUE
            FROM FIDE_PERRITO_TB P
            WHERE P.ID_PERRITO = P_ID_PERRITO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_CALCULAR_DIAS_ALBERGUE_FN;

    /* ============================================================
       DONACIONES, VENTAS Y FACTURACION
       ============================================================ */

    FUNCTION FIDE_OBTENER_DONACIONES_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  D.ID_DONACION,
                    D.IDENTIFICACION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS DONADOR,
                    D.ID_CAMPANIA,
                    C.NOMBRE AS CAMPANIA,
                    D.MONTO,
                    D.FECHA_DONACION,
                    D.MENSAJE,
                    D.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_DONACION_TB D
            JOIN FIDE_USUARIO_TB U ON D.IDENTIFICACION = U.IDENTIFICACION
            LEFT JOIN FIDE_CAMPANIA_TB C ON D.ID_CAMPANIA = C.ID_CAMPANIA
            JOIN FIDE_ESTADO_TB E ON D.ID_ESTADO = E.ID_ESTADO
            ORDER BY D.FECHA_DONACION DESC, D.ID_DONACION DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_DONACIONES_FN;

    FUNCTION FIDE_OBTENER_DONACIONES_POR_USUARIO_FN(
        P_IDENTIFICACION IN FIDE_DONACION_TB.IDENTIFICACION%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  D.ID_DONACION,
                    D.IDENTIFICACION,
                    D.ID_CAMPANIA,
                    C.NOMBRE AS CAMPANIA,
                    D.MONTO,
                    D.FECHA_DONACION,
                    D.MENSAJE,
                    D.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_DONACION_TB D
            LEFT JOIN FIDE_CAMPANIA_TB C ON D.ID_CAMPANIA = C.ID_CAMPANIA
            JOIN FIDE_ESTADO_TB E ON D.ID_ESTADO = E.ID_ESTADO
            WHERE D.IDENTIFICACION = P_IDENTIFICACION
            ORDER BY D.FECHA_DONACION DESC, D.ID_DONACION DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_DONACIONES_POR_USUARIO_FN;

    FUNCTION FIDE_OBTENER_DONACIONES_POR_CAMPANIA_FN(
        P_ID_CAMPANIA IN FIDE_DONACION_TB.ID_CAMPANIA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  D.ID_DONACION,
                    D.IDENTIFICACION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS DONADOR,
                    D.ID_CAMPANIA,
                    D.MONTO,
                    D.FECHA_DONACION,
                    D.MENSAJE,
                    D.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_DONACION_TB D
            JOIN FIDE_USUARIO_TB U ON D.IDENTIFICACION = U.IDENTIFICACION
            JOIN FIDE_ESTADO_TB E ON D.ID_ESTADO = E.ID_ESTADO
            WHERE D.ID_CAMPANIA = P_ID_CAMPANIA
            ORDER BY D.FECHA_DONACION DESC, D.ID_DONACION DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_DONACIONES_POR_CAMPANIA_FN;

    FUNCTION FIDE_TOTAL_DONACIONES_MES_FN(
        P_MES  IN NUMBER,
        P_YEAR IN NUMBER
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  P_MES AS MES,
                    P_YEAR AS ANIO,
                    NVL(SUM(D.MONTO), 0) AS TOTAL_DONACIONES
            FROM FIDE_DONACION_TB D
            WHERE EXTRACT(MONTH FROM D.FECHA_DONACION) = P_MES
              AND EXTRACT(YEAR FROM D.FECHA_DONACION) = P_YEAR
              AND D.ID_ESTADO = 1;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TOTAL_DONACIONES_MES_FN;

    FUNCTION FIDE_TOTAL_RECAUDADO_CAMPANIA_FN(
        P_ID_CAMPANIA IN FIDE_CAMPANIA_TB.ID_CAMPANIA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  C.ID_CAMPANIA,
                    C.NOMBRE AS CAMPANIA,
                    NVL(SUM(D.MONTO), 0) AS TOTAL_RECAUDADO
            FROM FIDE_CAMPANIA_TB C
            LEFT JOIN FIDE_DONACION_TB D
                   ON C.ID_CAMPANIA = D.ID_CAMPANIA
                  AND D.ID_ESTADO = 1
            WHERE C.ID_CAMPANIA = P_ID_CAMPANIA
            GROUP BY C.ID_CAMPANIA, C.NOMBRE;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_TOTAL_RECAUDADO_CAMPANIA_FN;

    FUNCTION FIDE_OBTENER_VENTAS_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  V.ID_VENTA,
                    V.IDENTIFICACION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS CLIENTE,
                    V.TOTAL_VENTA,
                    V.FECHA_VENTA,
                    V.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_VENTA_TB V
            JOIN FIDE_USUARIO_TB U ON V.IDENTIFICACION = U.IDENTIFICACION
            JOIN FIDE_ESTADO_TB E ON V.ID_ESTADO = E.ID_ESTADO
            ORDER BY V.FECHA_VENTA DESC, V.ID_VENTA DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_VENTAS_FN;

    FUNCTION FIDE_OBTENER_DETALLE_VENTA_FN(
        P_ID_VENTA IN FIDE_VENTA_PRODUCTO_TB.ID_VENTA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  VP.ID_VENTA,
                    VP.ID_PRODUCTO,
                    P.NOMBRE AS PRODUCTO,
                    VP.ID_TIPO_MOVIMIENTO,
                    TM.NOMBRE AS TIPO_MOVIMIENTO,
                    VP.CANTIDAD,
                    VP.PRECIO_UNITARIO,
                    VP.TOTAL,
                    VP.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_VENTA_PRODUCTO_TB VP
            JOIN FIDE_PRODUCTO_TB P ON VP.ID_PRODUCTO = P.ID_PRODUCTO
            LEFT JOIN FIDE_TIPO_MOVIMIENTO_TB TM ON VP.ID_TIPO_MOVIMIENTO = TM.ID_TIPO_MOVIMIENTO
            JOIN FIDE_ESTADO_TB E ON VP.ID_ESTADO = E.ID_ESTADO
            WHERE VP.ID_VENTA = P_ID_VENTA
            ORDER BY VP.ID_PRODUCTO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_DETALLE_VENTA_FN;

    FUNCTION FIDE_OBTENER_FACTURAS_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  F.ID_FACTURA,
                    F.ID_MONEDA,
                    M.NOMBRE AS MONEDA,
                    M.SIMBOLO,
                    F.TASA_IMPUESTO_APLICADA,
                    F.IMPUESTO,
                    F.SUBTOTAL,
                    F.TOTAL,
                    F.FECHA_FACTURA,
                    F.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_FACTURA_TB F
            JOIN FIDE_MONEDA_TB M ON F.ID_MONEDA = M.ID_MONEDA
            JOIN FIDE_ESTADO_TB E ON F.ID_ESTADO = E.ID_ESTADO
            ORDER BY F.FECHA_FACTURA DESC, F.ID_FACTURA DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_FACTURAS_FN;

    FUNCTION FIDE_OBTENER_FACTURA_POR_ID_FN(
        P_ID_FACTURA IN FIDE_FACTURA_TB.ID_FACTURA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  F.ID_FACTURA,
                    F.ID_MONEDA,
                    M.NOMBRE AS MONEDA,
                    M.SIMBOLO,
                    F.TASA_IMPUESTO_APLICADA,
                    F.IMPUESTO,
                    F.SUBTOTAL,
                    F.TOTAL,
                    F.FECHA_FACTURA,
                    F.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_FACTURA_TB F
            JOIN FIDE_MONEDA_TB M ON F.ID_MONEDA = M.ID_MONEDA
            JOIN FIDE_ESTADO_TB E ON F.ID_ESTADO = E.ID_ESTADO
            WHERE F.ID_FACTURA = P_ID_FACTURA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_FACTURA_POR_ID_FN;

    FUNCTION FIDE_OBTENER_FACTURAS_VENTA_FN(
        P_ID_VENTA IN FIDE_VENTA_FACTURA_TB.ID_VENTA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  VF.ID_VENTA,
                    VF.ID_FACTURA,
                    F.ID_MONEDA,
                    M.NOMBRE AS MONEDA,
                    F.TASA_IMPUESTO_APLICADA,
                    F.IMPUESTO,
                    F.SUBTOTAL,
                    F.TOTAL,
                    F.FECHA_FACTURA,
                    VF.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_VENTA_FACTURA_TB VF
            JOIN FIDE_FACTURA_TB F ON VF.ID_FACTURA = F.ID_FACTURA
            JOIN FIDE_MONEDA_TB M ON F.ID_MONEDA = M.ID_MONEDA
            JOIN FIDE_ESTADO_TB E ON VF.ID_ESTADO = E.ID_ESTADO
            WHERE VF.ID_VENTA = P_ID_VENTA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_FACTURAS_VENTA_FN;

    FUNCTION FIDE_OBTENER_FACTURAS_DONACION_FN(
        P_ID_DONACION IN FIDE_DONACION_FACTURA_TB.ID_DONACION%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  DF.ID_DONACION,
                    DF.ID_FACTURA,
                    F.ID_MONEDA,
                    M.NOMBRE AS MONEDA,
                    F.TASA_IMPUESTO_APLICADA,
                    F.IMPUESTO,
                    F.SUBTOTAL,
                    F.TOTAL,
                    F.FECHA_FACTURA,
                    DF.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_DONACION_FACTURA_TB DF
            JOIN FIDE_FACTURA_TB F ON DF.ID_FACTURA = F.ID_FACTURA
            JOIN FIDE_MONEDA_TB M ON F.ID_MONEDA = M.ID_MONEDA
            JOIN FIDE_ESTADO_TB E ON DF.ID_ESTADO = E.ID_ESTADO
            WHERE DF.ID_DONACION = P_ID_DONACION;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_FACTURAS_DONACION_FN;

    FUNCTION FIDE_OBTENER_PAGOS_PAYPAL_POR_FACTURA_FN(
        P_ID_FACTURA IN FIDE_PAGO_PAYPAL_TB.ID_FACTURA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  PP.ID_PAGO,
                    PP.ID_FACTURA,
                    PP.PAYPAL_ORDER_ID,
                    PP.PAYPAL_CAPTURE_ID,
                    PP.FECHA_PAGO,
                    PP.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_PAGO_PAYPAL_TB PP
            JOIN FIDE_ESTADO_TB E ON PP.ID_ESTADO = E.ID_ESTADO
            WHERE PP.ID_FACTURA = P_ID_FACTURA
            ORDER BY PP.FECHA_PAGO DESC, PP.ID_PAGO DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_PAGOS_PAYPAL_POR_FACTURA_FN;

    FUNCTION FIDE_BALANCE_FINANCIERO_MENSUAL_FN(
        P_MES  IN NUMBER,
        P_YEAR IN NUMBER
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  P_MES AS MES,
                    P_YEAR AS ANIO,
                    NVL((
                        SELECT SUM(D.MONTO)
                        FROM FIDE_DONACION_TB D
                        WHERE EXTRACT(MONTH FROM D.FECHA_DONACION) = P_MES
                          AND EXTRACT(YEAR FROM D.FECHA_DONACION) = P_YEAR
                          AND D.ID_ESTADO = 1
                    ), 0) AS TOTAL_DONACIONES,
                    NVL((
                        SELECT SUM(V.TOTAL_VENTA)
                        FROM FIDE_VENTA_TB V
                        WHERE EXTRACT(MONTH FROM V.FECHA_VENTA) = P_MES
                          AND EXTRACT(YEAR FROM V.FECHA_VENTA) = P_YEAR
                          AND V.ID_ESTADO = 1
                    ), 0) AS TOTAL_VENTAS,
                    NVL((
                        SELECT SUM(EP.TOTAL_GASTO)
                        FROM FIDE_EVENTO_PERRITO_TB EP
                        WHERE EXTRACT(MONTH FROM EP.FECHA_EVENTO) = P_MES
                          AND EXTRACT(YEAR FROM EP.FECHA_EVENTO) = P_YEAR
                          AND EP.ID_ESTADO = 1
                    ), 0) AS TOTAL_GASTOS,
                    NVL((
                        SELECT SUM(D.MONTO)
                        FROM FIDE_DONACION_TB D
                        WHERE EXTRACT(MONTH FROM D.FECHA_DONACION) = P_MES
                          AND EXTRACT(YEAR FROM D.FECHA_DONACION) = P_YEAR
                          AND D.ID_ESTADO = 1
                    ), 0)
                    +
                    NVL((
                        SELECT SUM(V.TOTAL_VENTA)
                        FROM FIDE_VENTA_TB V
                        WHERE EXTRACT(MONTH FROM V.FECHA_VENTA) = P_MES
                          AND EXTRACT(YEAR FROM V.FECHA_VENTA) = P_YEAR
                          AND V.ID_ESTADO = 1
                    ), 0)
                    -
                    NVL((
                        SELECT SUM(EP.TOTAL_GASTO)
                        FROM FIDE_EVENTO_PERRITO_TB EP
                        WHERE EXTRACT(MONTH FROM EP.FECHA_EVENTO) = P_MES
                          AND EXTRACT(YEAR FROM EP.FECHA_EVENTO) = P_YEAR
                          AND EP.ID_ESTADO = 1
                    ), 0) AS BALANCE_NETO
            FROM DUAL;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_BALANCE_FINANCIERO_MENSUAL_FN;

    /* ============================================================
       ADOPCIONES, SEGUIMIENTOS Y REPORTES
       ============================================================ */

    FUNCTION FIDE_ELEGIBILIDAD_ADOPTANTE_FN(
        P_IDENTIFICACION IN FIDE_USUARIO_TB.IDENTIFICACION%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  P_IDENTIFICACION AS IDENTIFICACION,
                    NVL((
                        SELECT COUNT(*)
                        FROM FIDE_ADOPCION_TB A
                        WHERE A.IDENTIFICACION = P_IDENTIFICACION
                    ), 0) AS TOTAL_ADOPCIONES,
                    NVL((
                        SELECT COUNT(*)
                        FROM FIDE_ADOPCION_TB A
                        JOIN FIDE_SEGUIMIENTO_TB S ON A.ID_ADOPCION = S.ID_ADOPCION
                        WHERE A.IDENTIFICACION = P_IDENTIFICACION
                          AND S.ID_ESTADO = 3
                    ), 0) AS SEGUIMIENTOS_CRITICOS,
                    CASE
                        WHEN NVL((
                            SELECT COUNT(*)
                            FROM FIDE_ADOPCION_TB A
                            JOIN FIDE_SEGUIMIENTO_TB S ON A.ID_ADOPCION = S.ID_ADOPCION
                            WHERE A.IDENTIFICACION = P_IDENTIFICACION
                              AND S.ID_ESTADO = 3
                        ), 0) > 0 THEN 'NO'
                        ELSE 'SI'
                    END AS ES_ELEGIBLE
            FROM DUAL;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_ELEGIBILIDAD_ADOPTANTE_FN;

    FUNCTION FIDE_OBTENER_ADOPCIONES_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  A.ID_ADOPCION,
                    A.IDENTIFICACION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS ADOPTANTE,
                    A.ID_SOLICITUD,
                    A.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    A.FECHA_ADOPCION,
                    A.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_ADOPCION_TB A
            JOIN FIDE_USUARIO_TB U ON A.IDENTIFICACION = U.IDENTIFICACION
            JOIN FIDE_PERRITO_TB P ON A.ID_PERRITO = P.ID_PERRITO
            JOIN FIDE_ESTADO_TB E ON A.ID_ESTADO = E.ID_ESTADO
            ORDER BY A.FECHA_ADOPCION DESC, A.ID_ADOPCION DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_ADOPCIONES_FN;

    FUNCTION FIDE_OBTENER_ADOPCION_POR_SOLICITUD_FN(
        P_ID_SOLICITUD IN FIDE_ADOPCION_TB.ID_SOLICITUD%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  A.ID_ADOPCION,
                    A.IDENTIFICACION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS ADOPTANTE,
                    A.ID_SOLICITUD,
                    A.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    A.FECHA_ADOPCION,
                    A.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_ADOPCION_TB A
            JOIN FIDE_USUARIO_TB U ON A.IDENTIFICACION = U.IDENTIFICACION
            JOIN FIDE_PERRITO_TB P ON A.ID_PERRITO = P.ID_PERRITO
            JOIN FIDE_ESTADO_TB E ON A.ID_ESTADO = E.ID_ESTADO
            WHERE A.ID_SOLICITUD = P_ID_SOLICITUD
            ORDER BY A.ID_ADOPCION DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_ADOPCION_POR_SOLICITUD_FN;

    FUNCTION FIDE_OBTENER_ADOPCION_ACTIVA_POR_PERRITO_FN(
        P_ID_PERRITO IN FIDE_ADOPCION_TB.ID_PERRITO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  A.ID_ADOPCION,
                    A.IDENTIFICACION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS ADOPTANTE,
                    A.ID_SOLICITUD,
                    A.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    A.FECHA_ADOPCION,
                    A.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_ADOPCION_TB A
            JOIN FIDE_USUARIO_TB U ON A.IDENTIFICACION = U.IDENTIFICACION
            JOIN FIDE_PERRITO_TB P ON A.ID_PERRITO = P.ID_PERRITO
            JOIN FIDE_ESTADO_TB E ON A.ID_ESTADO = E.ID_ESTADO
            WHERE A.ID_PERRITO = P_ID_PERRITO
              AND A.ID_ESTADO = 1
            ORDER BY A.ID_ADOPCION DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_ADOPCION_ACTIVA_POR_PERRITO_FN;

    FUNCTION FIDE_ESTADISTICAS_ADOPCION_ANUAL_FN(
        P_YEAR IN NUMBER
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  EXTRACT(MONTH FROM A.FECHA_ADOPCION) AS MES,
                    COUNT(A.ID_ADOPCION) AS TOTAL_ADOPCIONES
            FROM FIDE_ADOPCION_TB A
            WHERE EXTRACT(YEAR FROM A.FECHA_ADOPCION) = P_YEAR
              AND A.ID_ESTADO = 1
            GROUP BY EXTRACT(MONTH FROM A.FECHA_ADOPCION)
            ORDER BY MES;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_ESTADISTICAS_ADOPCION_ANUAL_FN;

    FUNCTION FIDE_OBTENER_SEGUIMIENTOS_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  SG.ID_SEGUIMIENTO,
                    SG.ID_ADOPCION,
                    A.IDENTIFICACION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS ADOPTANTE,
                    A.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    SG.ID_TIPO_SEGUIMIENTO,
                    TS.NOMBRE AS TIPO_SEGUIMIENTO,
                    SG.FECHA_INICIO,
                    SG.FECHA_FIN,
                    SG.COMENTARIOS,
                    SG.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_SEGUIMIENTO_TB SG
            JOIN FIDE_ADOPCION_TB A ON SG.ID_ADOPCION = A.ID_ADOPCION
            JOIN FIDE_USUARIO_TB U ON A.IDENTIFICACION = U.IDENTIFICACION
            JOIN FIDE_PERRITO_TB P ON A.ID_PERRITO = P.ID_PERRITO
            JOIN FIDE_TIPO_SEGUIMIENTO_TB TS ON SG.ID_TIPO_SEGUIMIENTO = TS.ID_TIPO_SEGUIMIENTO
            JOIN FIDE_ESTADO_TB E ON SG.ID_ESTADO = E.ID_ESTADO
            ORDER BY SG.FECHA_FIN DESC, SG.ID_SEGUIMIENTO DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_SEGUIMIENTOS_FN;

    FUNCTION FIDE_OBTENER_SEGUIMIENTOS_POR_ADOPCION_FN(
        P_ID_ADOPCION IN FIDE_SEGUIMIENTO_TB.ID_ADOPCION%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  SG.ID_SEGUIMIENTO,
                    SG.ID_ADOPCION,
                    SG.ID_TIPO_SEGUIMIENTO,
                    TS.NOMBRE AS TIPO_SEGUIMIENTO,
                    SG.FECHA_INICIO,
                    SG.FECHA_FIN,
                    SG.COMENTARIOS,
                    SG.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_SEGUIMIENTO_TB SG
            JOIN FIDE_TIPO_SEGUIMIENTO_TB TS ON SG.ID_TIPO_SEGUIMIENTO = TS.ID_TIPO_SEGUIMIENTO
            JOIN FIDE_ESTADO_TB E ON SG.ID_ESTADO = E.ID_ESTADO
            WHERE SG.ID_ADOPCION = P_ID_ADOPCION
            ORDER BY SG.FECHA_FIN DESC, SG.ID_SEGUIMIENTO DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_SEGUIMIENTOS_POR_ADOPCION_FN;

    FUNCTION FIDE_ALERTAS_SEGUIMIENTO_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  SG.ID_SEGUIMIENTO,
                    A.ID_ADOPCION,
                    A.FECHA_ADOPCION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS ADOPTANTE,
                    U.IDENTIFICACION,
                    SG.FECHA_FIN,
                    P.NOMBRE AS NOMBRE_PERRITO
            FROM FIDE_SEGUIMIENTO_TB SG
            JOIN FIDE_ADOPCION_TB A ON SG.ID_ADOPCION = A.ID_ADOPCION
            JOIN FIDE_USUARIO_TB U ON A.IDENTIFICACION = U.IDENTIFICACION
            JOIN FIDE_PERRITO_TB P ON A.ID_PERRITO = P.ID_PERRITO
            WHERE SG.ID_ESTADO = 1
              AND SG.FECHA_FIN BETWEEN TRUNC(SYSDATE) AND TRUNC(SYSDATE) + 7
            ORDER BY SG.FECHA_FIN ASC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_ALERTAS_SEGUIMIENTO_FN;

    FUNCTION FIDE_OBTENER_EVIDENCIAS_POR_SEGUIMIENTO_FN(
        P_ID_SEGUIMIENTO IN FIDE_EVIDENCIA_TB.ID_SEGUIMIENTO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  EV.ID_EVIDENCIA,
                    EV.ID_SEGUIMIENTO,
                    EV.IMAGEN_URL,
                    EV.COMENTARIOS,
                    EV.FECHA_EVIDENCIA,
                    EV.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_EVIDENCIA_TB EV
            JOIN FIDE_ESTADO_TB E ON EV.ID_ESTADO = E.ID_ESTADO
            WHERE EV.ID_SEGUIMIENTO = P_ID_SEGUIMIENTO
            ORDER BY EV.FECHA_EVIDENCIA DESC, EV.ID_EVIDENCIA DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_EVIDENCIAS_POR_SEGUIMIENTO_FN;

    /* ============================================================
       FUNCIONES COMPLEMENTARIAS PARA CRUD ADMIN
       CATALOGOS Y UBICACIONES
       ============================================================ */

    FUNCTION FIDE_OBTENER_TIPOS_USUARIO_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  TU.ID_TIPO_USUARIO,
                    TU.NOMBRE,
                    TU.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TIPO_USUARIO_TB TU
            JOIN FIDE_ESTADO_TB E ON TU.ID_ESTADO = E.ID_ESTADO
            ORDER BY TU.ID_TIPO_USUARIO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_TIPOS_USUARIO_ADMIN_FN;

    FUNCTION FIDE_OBTENER_ESTADO_POR_ID_FN(
        P_ID_ESTADO IN FIDE_ESTADO_TB.ID_ESTADO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
        V_SQL              VARCHAR2(2000);
        V_TIENE_ACCION     NUMBER;
    BEGIN
        SELECT COUNT(*)
        INTO V_TIENE_ACCION
        FROM USER_TAB_COLUMNS
        WHERE TABLE_NAME = 'FIDE_ESTADO_TB'
          AND COLUMN_NAME = 'ACCION';

        V_SQL := 'SELECT  ID_ESTADO,
                          NOMBRE_ESTADO,
                          FECHA_CREACION,
                          FECHA_MODIFICACION,
                          CREADO_POR,
                          MODIFICADO_POR, ';

        IF V_TIENE_ACCION > 0 THEN
            V_SQL := V_SQL || 'ACCION ';
        ELSE
            V_SQL := V_SQL || 'CAST(NULL AS VARCHAR2(100)) AS ACCION ';
        END IF;

        V_SQL := V_SQL || 'FROM FIDE_ESTADO_TB
                           WHERE ID_ESTADO = :P_ID_ESTADO';

        OPEN V_CURSOR_RESULTADO FOR V_SQL USING P_ID_ESTADO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_ESTADO_POR_ID_FN;

    FUNCTION FIDE_OBTENER_TIPO_USUARIO_POR_ID_FN(
        P_ID_TIPO_USUARIO IN FIDE_TIPO_USUARIO_TB.ID_TIPO_USUARIO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  TU.ID_TIPO_USUARIO,
                    TU.NOMBRE,
                    TU.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TIPO_USUARIO_TB TU
            JOIN FIDE_ESTADO_TB E ON TU.ID_ESTADO = E.ID_ESTADO
            WHERE TU.ID_TIPO_USUARIO = P_ID_TIPO_USUARIO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_TIPO_USUARIO_POR_ID_FN;

    FUNCTION FIDE_OBTENER_PAIS_POR_ID_FN(
        P_ID_PAIS IN FIDE_PAIS_TB.ID_PAIS%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  P.ID_PAIS,
                    P.NOMBRE,
                    P.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_PAIS_TB P
            JOIN FIDE_ESTADO_TB E ON P.ID_ESTADO = E.ID_ESTADO
            WHERE P.ID_PAIS = P_ID_PAIS;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_PAIS_POR_ID_FN;

    FUNCTION FIDE_OBTENER_PAISES_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  P.ID_PAIS,
                    P.NOMBRE,
                    P.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_PAIS_TB P
            JOIN FIDE_ESTADO_TB E ON P.ID_ESTADO = E.ID_ESTADO
            ORDER BY P.NOMBRE;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20001, 'NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20002, 'DATOS DUPLICADOS');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20003, 'ERROR ' || SQLERRM);
    END FIDE_OBTENER_PAISES_ADMIN_FN;

    FUNCTION FIDE_OBTENER_TIPOS_OTP_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  T.ID_TIPO_OTP,
                    T.NOMBRE,
                    T.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TIPO_OTP_TB T
            JOIN FIDE_ESTADO_TB E ON T.ID_ESTADO = E.ID_ESTADO
            ORDER BY T.ID_TIPO_OTP;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20001, 'NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20002, 'DATOS DUPLICADOS');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20003, 'ERROR ' || SQLERRM);
    END FIDE_OBTENER_TIPOS_OTP_ADMIN_FN;

    FUNCTION FIDE_OBTENER_CATEGORIAS_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  C.ID_CATEGORIA,
                    C.NOMBRE,
                    C.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CATEGORIA_TB C
            JOIN FIDE_ESTADO_TB E ON C.ID_ESTADO = E.ID_ESTADO
            ORDER BY C.NOMBRE;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20001, 'NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20002, 'DATOS DUPLICADOS');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20003, 'ERROR ' || SQLERRM);
    END FIDE_OBTENER_CATEGORIAS_ADMIN_FN;

    FUNCTION FIDE_OBTENER_MARCAS_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  M.ID_MARCA,
                    M.NOMBRE,
                    M.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_MARCA_TB M
            JOIN FIDE_ESTADO_TB E ON M.ID_ESTADO = E.ID_ESTADO
            ORDER BY M.NOMBRE;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20001, 'NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20002, 'DATOS DUPLICADOS');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20003, 'ERROR ' || SQLERRM);
    END FIDE_OBTENER_MARCAS_ADMIN_FN;

    FUNCTION FIDE_OBTENER_PRODUCTOS_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO     SYS_REFCURSOR;
        V_SQL                  VARCHAR2(4000);
        V_TIENE_ID_MARCA       NUMBER;
        V_TIENE_PRODUCTO_IMAGEN NUMBER;
    BEGIN
        SELECT COUNT(*)
        INTO V_TIENE_ID_MARCA
        FROM USER_TAB_COLUMNS
        WHERE TABLE_NAME = 'FIDE_PRODUCTO_TB'
          AND COLUMN_NAME = 'ID_MARCA';

        SELECT COUNT(*)
        INTO V_TIENE_PRODUCTO_IMAGEN
        FROM USER_TABLES
        WHERE TABLE_NAME = 'FIDE_PRODUCTO_IMAGEN_TB';

        V_SQL := 'SELECT  P.ID_PRODUCTO,
                          P.NOMBRE,
                          P.DESCRIPCION,
                          P.PRECIO,
                          P.ID_CATEGORIA,
                          C.NOMBRE AS CATEGORIA, ';

        IF V_TIENE_ID_MARCA > 0 THEN
            V_SQL := V_SQL || 'P.ID_MARCA,
                               M.NOMBRE AS MARCA, ';
        ELSE
            V_SQL := V_SQL || 'CAST(NULL AS NUMBER) AS ID_MARCA,
                               CAST(NULL AS VARCHAR2(100)) AS MARCA, ';
        END IF;

        V_SQL := V_SQL || 'NVL(I.CANTIDAD, 0) AS STOCK, ';

        IF V_TIENE_PRODUCTO_IMAGEN > 0 THEN
            V_SQL := V_SQL || 'PI.IMAGE_URL, ';
        ELSE
            V_SQL := V_SQL || 'CAST(NULL AS VARCHAR2(500)) AS IMAGE_URL, ';
        END IF;

        V_SQL := V_SQL || 'P.ID_ESTADO,
                           E.NOMBRE_ESTADO AS ESTADO
                    FROM FIDE_PRODUCTO_TB P
                    JOIN FIDE_CATEGORIA_TB C ON P.ID_CATEGORIA = C.ID_CATEGORIA ';

        IF V_TIENE_ID_MARCA > 0 THEN
            V_SQL := V_SQL || 'JOIN FIDE_MARCA_TB M ON P.ID_MARCA = M.ID_MARCA ';
        END IF;

        V_SQL := V_SQL || 'JOIN FIDE_ESTADO_TB E ON P.ID_ESTADO = E.ID_ESTADO
                           LEFT JOIN (
                               SELECT  ID_PRODUCTO,
                                       SUM(CANTIDAD) AS CANTIDAD
                               FROM FIDE_INVENTARIO_TB
                               WHERE ID_ESTADO = 1
                               GROUP BY ID_PRODUCTO
                           ) I ON P.ID_PRODUCTO = I.ID_PRODUCTO ';

        IF V_TIENE_PRODUCTO_IMAGEN > 0 THEN
            V_SQL := V_SQL || 'LEFT JOIN (
                                   SELECT  ID_PRODUCTO,
                                           MIN(IMAGE_URL) AS IMAGE_URL
                                   FROM FIDE_PRODUCTO_IMAGEN_TB
                                   WHERE ID_ESTADO = 1
                                   GROUP BY ID_PRODUCTO
                               ) PI ON P.ID_PRODUCTO = PI.ID_PRODUCTO ';
        END IF;

        V_SQL := V_SQL || 'ORDER BY P.ID_PRODUCTO';

        OPEN V_CURSOR_RESULTADO FOR V_SQL;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20001, 'NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20002, 'DATOS DUPLICADOS');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20003, 'ERROR ' || SQLERRM);
    END FIDE_OBTENER_PRODUCTOS_ADMIN_FN;

    FUNCTION FIDE_OBTENER_INVENTARIOS_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  I.ID_INVENTARIO,
                    I.ID_PRODUCTO,
                    P.NOMBRE AS PRODUCTO,
                    I.CANTIDAD,
                    I.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_INVENTARIO_TB I
            JOIN FIDE_PRODUCTO_TB P ON I.ID_PRODUCTO = P.ID_PRODUCTO
            JOIN FIDE_ESTADO_TB E ON I.ID_ESTADO = E.ID_ESTADO
            ORDER BY I.ID_INVENTARIO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20001, 'NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20002, 'DATOS DUPLICADOS');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20003, 'ERROR ' || SQLERRM);
    END FIDE_OBTENER_INVENTARIOS_ADMIN_FN;

    FUNCTION FIDE_OBTENER_TIPOS_MOVIMIENTO_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  TM.ID_TIPO_MOVIMIENTO,
                    TM.NOMBRE,
                    TM.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TIPO_MOVIMIENTO_TB TM
            JOIN FIDE_ESTADO_TB E ON TM.ID_ESTADO = E.ID_ESTADO
            ORDER BY TM.ID_TIPO_MOVIMIENTO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20001, 'NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20002, 'DATOS DUPLICADOS');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20003, 'ERROR ' || SQLERRM);
    END FIDE_OBTENER_TIPOS_MOVIMIENTO_ADMIN_FN;

    FUNCTION FIDE_OBTENER_MONEDAS_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  M.ID_MONEDA,
                    M.NOMBRE,
                    M.SIMBOLO,
                    M.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_MONEDA_TB M
            JOIN FIDE_ESTADO_TB E ON M.ID_ESTADO = E.ID_ESTADO
            ORDER BY M.NOMBRE;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20001, 'NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20002, 'DATOS DUPLICADOS');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20003, 'ERROR ' || SQLERRM);
    END FIDE_OBTENER_MONEDAS_ADMIN_FN;

    FUNCTION FIDE_OBTENER_RAZAS_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  R.ID_RAZA,
                    R.NOMBRE,
                    R.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_RAZA_TB R
            JOIN FIDE_ESTADO_TB E ON R.ID_ESTADO = E.ID_ESTADO
            ORDER BY R.NOMBRE;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20001, 'NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20002, 'DATOS DUPLICADOS');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20003, 'ERROR ' || SQLERRM);
    END FIDE_OBTENER_RAZAS_ADMIN_FN;

    FUNCTION FIDE_OBTENER_SEXOS_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  S.ID_SEXO,
                    S.NOMBRE,
                    S.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_SEXO_TB S
            JOIN FIDE_ESTADO_TB E ON S.ID_ESTADO = E.ID_ESTADO
            ORDER BY S.ID_SEXO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20001, 'NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20002, 'DATOS DUPLICADOS');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20003, 'ERROR ' || SQLERRM);
    END FIDE_OBTENER_SEXOS_ADMIN_FN;

    FUNCTION FIDE_OBTENER_TIPOS_SOLICITUD_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  TS.ID_TIPO_SOLICITUD,
                    TS.NOMBRE,
                    TS.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TIPO_SOLICITUD_TB TS
            JOIN FIDE_ESTADO_TB E ON TS.ID_ESTADO = E.ID_ESTADO
            ORDER BY TS.ID_TIPO_SOLICITUD;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20001, 'NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20002, 'DATOS DUPLICADOS');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20003, 'ERROR ' || SQLERRM);
    END FIDE_OBTENER_TIPOS_SOLICITUD_ADMIN_FN;

    FUNCTION FIDE_OBTENER_TIPOS_RESPUESTA_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  TR.ID_TIPO_RESPUESTA,
                    TR.NOMBRE,
                    TR.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TIPO_RESPUESTA_TB TR
            JOIN FIDE_ESTADO_TB E ON TR.ID_ESTADO = E.ID_ESTADO
            ORDER BY TR.ID_TIPO_RESPUESTA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20001, 'NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20002, 'DATOS DUPLICADOS');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20003, 'ERROR ' || SQLERRM);
    END FIDE_OBTENER_TIPOS_RESPUESTA_ADMIN_FN;

    FUNCTION FIDE_OBTENER_TIPOS_SEGUIMIENTO_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  TS.ID_TIPO_SEGUIMIENTO,
                    TS.NOMBRE,
                    TS.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TIPO_SEGUIMIENTO_TB TS
            JOIN FIDE_ESTADO_TB E ON TS.ID_ESTADO = E.ID_ESTADO
            ORDER BY TS.ID_TIPO_SEGUIMIENTO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20001, 'NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20002, 'DATOS DUPLICADOS');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20003, 'ERROR ' || SQLERRM);
    END FIDE_OBTENER_TIPOS_SEGUIMIENTO_ADMIN_FN;

    FUNCTION FIDE_OBTENER_TIPOS_EVENTO_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  TE.ID_TIPO_EVENTO,
                    TE.NOMBRE,
                    TE.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TIPO_EVENTO_TB TE
            JOIN FIDE_ESTADO_TB E ON TE.ID_ESTADO = E.ID_ESTADO
            ORDER BY TE.ID_TIPO_EVENTO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20001, 'NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20002, 'DATOS DUPLICADOS');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20003, 'ERROR ' || SQLERRM);
    END FIDE_OBTENER_TIPOS_EVENTO_ADMIN_FN;

    FUNCTION FIDE_OBTENER_PREGUNTAS_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  P.ID_PREGUNTA,
                    P.PREGUNTA,
                    P.ID_TIPO_RESPUESTA,
                    TR.NOMBRE AS TIPO_RESPUESTA,
                    P.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_PREGUNTA_TB P
            JOIN FIDE_TIPO_RESPUESTA_TB TR ON P.ID_TIPO_RESPUESTA = TR.ID_TIPO_RESPUESTA
            JOIN FIDE_ESTADO_TB E ON P.ID_ESTADO = E.ID_ESTADO
            ORDER BY P.ID_PREGUNTA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20001, 'NO SE ENCONTRO DATOS CON EL ID INDICADO');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20002, 'DATOS DUPLICADOS');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20003, 'ERROR ' || SQLERRM);
    END FIDE_OBTENER_PREGUNTAS_ADMIN_FN;

    FUNCTION FIDE_OBTENER_TIPOS_SOLICITUD_PREGUNTA_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  SP.ID_TIPO_SOLICITUD,
                    TS.NOMBRE AS TIPO_SOLICITUD,
                    TS.ID_ESTADO AS ID_ESTADO_TIPO_SOLICITUD,
                    ETS.NOMBRE_ESTADO AS ESTADO_TIPO_SOLICITUD,
                    SP.ID_PREGUNTA,
                    P.PREGUNTA,
                    P.ID_TIPO_RESPUESTA,
                    TR.NOMBRE AS TIPO_RESPUESTA,
                    P.ID_ESTADO AS ID_ESTADO_PREGUNTA,
                    EP.NOMBRE_ESTADO AS ESTADO_PREGUNTA,
                    SP.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO_RELACION
            FROM FIDE_TIPO_SOLICITUD_PREGUNTA_TB SP
            JOIN FIDE_TIPO_SOLICITUD_TB TS ON SP.ID_TIPO_SOLICITUD = TS.ID_TIPO_SOLICITUD
            JOIN FIDE_ESTADO_TB ETS ON TS.ID_ESTADO = ETS.ID_ESTADO
            JOIN FIDE_PREGUNTA_TB P ON SP.ID_PREGUNTA = P.ID_PREGUNTA
            JOIN FIDE_TIPO_RESPUESTA_TB TR ON P.ID_TIPO_RESPUESTA = TR.ID_TIPO_RESPUESTA
            JOIN FIDE_ESTADO_TB EP ON P.ID_ESTADO = EP.ID_ESTADO
            JOIN FIDE_ESTADO_TB E ON SP.ID_ESTADO = E.ID_ESTADO
            ORDER BY SP.ID_TIPO_SOLICITUD DESC, SP.ID_PREGUNTA ASC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_TIPOS_SOLICITUD_PREGUNTA_ADMIN_FN;

    FUNCTION FIDE_OBTENER_TIPO_SOLICITUD_PREGUNTA_ADMIN_POR_PK_FN(
        P_ID_TIPO_SOLICITUD IN FIDE_TIPO_SOLICITUD_PREGUNTA_TB.ID_TIPO_SOLICITUD%TYPE,
        P_ID_PREGUNTA       IN FIDE_TIPO_SOLICITUD_PREGUNTA_TB.ID_PREGUNTA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  SP.ID_TIPO_SOLICITUD,
                    TS.NOMBRE AS TIPO_SOLICITUD,
                    TS.ID_ESTADO AS ID_ESTADO_TIPO_SOLICITUD,
                    ETS.NOMBRE_ESTADO AS ESTADO_TIPO_SOLICITUD,
                    SP.ID_PREGUNTA,
                    P.PREGUNTA,
                    P.ID_TIPO_RESPUESTA,
                    TR.NOMBRE AS TIPO_RESPUESTA,
                    P.ID_ESTADO AS ID_ESTADO_PREGUNTA,
                    EP.NOMBRE_ESTADO AS ESTADO_PREGUNTA,
                    SP.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO_RELACION
            FROM FIDE_TIPO_SOLICITUD_PREGUNTA_TB SP
            JOIN FIDE_TIPO_SOLICITUD_TB TS ON SP.ID_TIPO_SOLICITUD = TS.ID_TIPO_SOLICITUD
            JOIN FIDE_ESTADO_TB ETS ON TS.ID_ESTADO = ETS.ID_ESTADO
            JOIN FIDE_PREGUNTA_TB P ON SP.ID_PREGUNTA = P.ID_PREGUNTA
            JOIN FIDE_TIPO_RESPUESTA_TB TR ON P.ID_TIPO_RESPUESTA = TR.ID_TIPO_RESPUESTA
            JOIN FIDE_ESTADO_TB EP ON P.ID_ESTADO = EP.ID_ESTADO
            JOIN FIDE_ESTADO_TB E ON SP.ID_ESTADO = E.ID_ESTADO
            WHERE SP.ID_TIPO_SOLICITUD = P_ID_TIPO_SOLICITUD
              AND SP.ID_PREGUNTA = P_ID_PREGUNTA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_TIPO_SOLICITUD_PREGUNTA_ADMIN_POR_PK_FN;

    FUNCTION FIDE_OBTENER_RESPUESTAS_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  R.ID_RESPUESTA,
                    R.ID_SOLICITUD,
                    S.IDENTIFICACION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS SOLICITANTE,
                    S.ID_TIPO_SOLICITUD,
                    TS.NOMBRE AS TIPO_SOLICITUD,
                    R.ID_PREGUNTA,
                    P.PREGUNTA,
                    P.ID_TIPO_RESPUESTA,
                    TR.NOMBRE AS TIPO_RESPUESTA,
                    R.RESPUESTA,
                    R.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO_RESPUESTA
            FROM FIDE_RESPUESTA_TB R
            JOIN FIDE_SOLICITUD_TB S ON R.ID_SOLICITUD = S.ID_SOLICITUD
            JOIN FIDE_USUARIO_TB U ON S.IDENTIFICACION = U.IDENTIFICACION
            JOIN FIDE_TIPO_SOLICITUD_TB TS ON S.ID_TIPO_SOLICITUD = TS.ID_TIPO_SOLICITUD
            JOIN FIDE_PREGUNTA_TB P ON R.ID_PREGUNTA = P.ID_PREGUNTA
            JOIN FIDE_TIPO_RESPUESTA_TB TR ON P.ID_TIPO_RESPUESTA = TR.ID_TIPO_RESPUESTA
            JOIN FIDE_ESTADO_TB E ON R.ID_ESTADO = E.ID_ESTADO
            ORDER BY R.ID_RESPUESTA DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_RESPUESTAS_ADMIN_FN;

    FUNCTION FIDE_OBTENER_RESPUESTA_ADMIN_POR_ID_FN(
        P_ID_RESPUESTA IN FIDE_RESPUESTA_TB.ID_RESPUESTA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  R.ID_RESPUESTA,
                    R.ID_SOLICITUD,
                    S.IDENTIFICACION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS SOLICITANTE,
                    S.ID_TIPO_SOLICITUD,
                    TS.NOMBRE AS TIPO_SOLICITUD,
                    R.ID_PREGUNTA,
                    P.PREGUNTA,
                    P.ID_TIPO_RESPUESTA,
                    TR.NOMBRE AS TIPO_RESPUESTA,
                    R.RESPUESTA,
                    R.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO_RESPUESTA
            FROM FIDE_RESPUESTA_TB R
            JOIN FIDE_SOLICITUD_TB S ON R.ID_SOLICITUD = S.ID_SOLICITUD
            JOIN FIDE_USUARIO_TB U ON S.IDENTIFICACION = U.IDENTIFICACION
            JOIN FIDE_TIPO_SOLICITUD_TB TS ON S.ID_TIPO_SOLICITUD = TS.ID_TIPO_SOLICITUD
            JOIN FIDE_PREGUNTA_TB P ON R.ID_PREGUNTA = P.ID_PREGUNTA
            JOIN FIDE_TIPO_RESPUESTA_TB TR ON P.ID_TIPO_RESPUESTA = TR.ID_TIPO_RESPUESTA
            JOIN FIDE_ESTADO_TB E ON R.ID_ESTADO = E.ID_ESTADO
            WHERE R.ID_RESPUESTA = P_ID_RESPUESTA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_RESPUESTA_ADMIN_POR_ID_FN;

    FUNCTION FIDE_OBTENER_CASAS_CUNA_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  CC.ID_CASA_CUNA,
                    CC.NOMBRE,
                    CC.ID_DIRECCION,
                    DIR.ID_DISTRITO,
                    DIS.NOMBRE AS DISTRITO,
                    CAN.ID_CANTON,
                    CAN.NOMBRE AS CANTON,
                    PRO.ID_PROVINCIA,
                    PRO.NOMBRE AS PROVINCIA,
                    PA.ID_PAIS,
                    PA.NOMBRE AS PAIS,
                    DIR.CALLE,
                    DIR.NUMERO,
                    CC.IDENTIFICACION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS ENCARGADO,
                    CC.ID_SOLICITUD,
                    S.ID_TIPO_SOLICITUD,
                    TS.NOMBRE AS TIPO_SOLICITUD,
                    (
                        SELECT COUNT(*)
                        FROM FIDE_CASA_PERRITO_TB CP
                        WHERE CP.ID_CASA_CUNA = CC.ID_CASA_CUNA
                          AND CP.ID_ESTADO = 1
                    ) AS TOTAL_PERRITOS,
                    CC.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CASA_CUNA_TB CC
            JOIN FIDE_DIRECCION_TB DIR ON CC.ID_DIRECCION = DIR.ID_DIRECCION
            JOIN FIDE_DISTRITO_TB DIS ON DIR.ID_DISTRITO = DIS.ID_DISTRITO
            JOIN FIDE_CANTON_TB CAN ON DIS.ID_CANTON = CAN.ID_CANTON
            JOIN FIDE_PROVINCIA_TB PRO ON CAN.ID_PROVINCIA = PRO.ID_PROVINCIA
            JOIN FIDE_PAIS_TB PA ON PRO.ID_PAIS = PA.ID_PAIS
            JOIN FIDE_USUARIO_TB U ON CC.IDENTIFICACION = U.IDENTIFICACION
            LEFT JOIN FIDE_SOLICITUD_TB S ON CC.ID_SOLICITUD = S.ID_SOLICITUD
            LEFT JOIN FIDE_TIPO_SOLICITUD_TB TS ON S.ID_TIPO_SOLICITUD = TS.ID_TIPO_SOLICITUD
            JOIN FIDE_ESTADO_TB E ON CC.ID_ESTADO = E.ID_ESTADO
            ORDER BY CC.ID_CASA_CUNA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CASAS_CUNA_ADMIN_FN;

    FUNCTION FIDE_OBTENER_CASA_CUNA_ADMIN_POR_ID_FN(
        P_ID_CASA_CUNA IN FIDE_CASA_CUNA_TB.ID_CASA_CUNA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  CC.ID_CASA_CUNA,
                    CC.NOMBRE,
                    CC.ID_DIRECCION,
                    DIR.ID_DISTRITO,
                    DIS.NOMBRE AS DISTRITO,
                    CAN.ID_CANTON,
                    CAN.NOMBRE AS CANTON,
                    PRO.ID_PROVINCIA,
                    PRO.NOMBRE AS PROVINCIA,
                    PA.ID_PAIS,
                    PA.NOMBRE AS PAIS,
                    DIR.CALLE,
                    DIR.NUMERO,
                    CC.IDENTIFICACION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS ENCARGADO,
                    CC.ID_SOLICITUD,
                    S.ID_TIPO_SOLICITUD,
                    TS.NOMBRE AS TIPO_SOLICITUD,
                    (
                        SELECT COUNT(*)
                        FROM FIDE_CASA_PERRITO_TB CP
                        WHERE CP.ID_CASA_CUNA = CC.ID_CASA_CUNA
                          AND CP.ID_ESTADO = 1
                    ) AS TOTAL_PERRITOS,
                    CC.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CASA_CUNA_TB CC
            JOIN FIDE_DIRECCION_TB DIR ON CC.ID_DIRECCION = DIR.ID_DIRECCION
            JOIN FIDE_DISTRITO_TB DIS ON DIR.ID_DISTRITO = DIS.ID_DISTRITO
            JOIN FIDE_CANTON_TB CAN ON DIS.ID_CANTON = CAN.ID_CANTON
            JOIN FIDE_PROVINCIA_TB PRO ON CAN.ID_PROVINCIA = PRO.ID_PROVINCIA
            JOIN FIDE_PAIS_TB PA ON PRO.ID_PAIS = PA.ID_PAIS
            JOIN FIDE_USUARIO_TB U ON CC.IDENTIFICACION = U.IDENTIFICACION
            LEFT JOIN FIDE_SOLICITUD_TB S ON CC.ID_SOLICITUD = S.ID_SOLICITUD
            LEFT JOIN FIDE_TIPO_SOLICITUD_TB TS ON S.ID_TIPO_SOLICITUD = TS.ID_TIPO_SOLICITUD
            JOIN FIDE_ESTADO_TB E ON CC.ID_ESTADO = E.ID_ESTADO
            WHERE CC.ID_CASA_CUNA = P_ID_CASA_CUNA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CASA_CUNA_ADMIN_POR_ID_FN;

    FUNCTION FIDE_OBTENER_CASAS_PERRITO_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  CP.ID_CASA_CUNA,
                    CC.NOMBRE AS CASA_CUNA,
                    CP.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    CP.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO_RELACION
            FROM FIDE_CASA_PERRITO_TB CP
            JOIN FIDE_CASA_CUNA_TB CC ON CP.ID_CASA_CUNA = CC.ID_CASA_CUNA
            JOIN FIDE_PERRITO_TB P ON CP.ID_PERRITO = P.ID_PERRITO
            JOIN FIDE_ESTADO_TB E ON CP.ID_ESTADO = E.ID_ESTADO
            ORDER BY CP.ID_CASA_CUNA DESC, CP.ID_PERRITO ASC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CASAS_PERRITO_ADMIN_FN;

    FUNCTION FIDE_OBTENER_CASA_PERRITO_ADMIN_POR_PK_FN(
        P_ID_CASA_CUNA IN FIDE_CASA_PERRITO_TB.ID_CASA_CUNA%TYPE,
        P_ID_PERRITO   IN FIDE_CASA_PERRITO_TB.ID_PERRITO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  CP.ID_CASA_CUNA,
                    CC.NOMBRE AS CASA_CUNA,
                    CP.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    CP.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO_RELACION
            FROM FIDE_CASA_PERRITO_TB CP
            JOIN FIDE_CASA_CUNA_TB CC ON CP.ID_CASA_CUNA = CC.ID_CASA_CUNA
            JOIN FIDE_PERRITO_TB P ON CP.ID_PERRITO = P.ID_PERRITO
            JOIN FIDE_ESTADO_TB E ON CP.ID_ESTADO = E.ID_ESTADO
            WHERE CP.ID_CASA_CUNA = P_ID_CASA_CUNA
              AND CP.ID_PERRITO = P_ID_PERRITO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CASA_PERRITO_ADMIN_POR_PK_FN;

    FUNCTION FIDE_OBTENER_CAMPANIAS_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  C.ID_CAMPANIA,
                    C.NOMBRE,
                    C.DESCRIPCION,
                    C.IMAGE_URL,
                    C.FECHA_INICIO,
                    C.FECHA_FIN,
                    C.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CAMPANIA_TB C
            JOIN FIDE_ESTADO_TB E ON C.ID_ESTADO = E.ID_ESTADO
            ORDER BY C.FECHA_INICIO DESC, C.ID_CAMPANIA DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CAMPANIAS_ADMIN_FN;

    FUNCTION FIDE_OBTENER_TIPO_OTP_POR_ID_FN(
        P_ID_TIPO_OTP IN FIDE_TIPO_OTP_TB.ID_TIPO_OTP%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  T.ID_TIPO_OTP,
                    T.NOMBRE,
                    T.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TIPO_OTP_TB T
            JOIN FIDE_ESTADO_TB E ON T.ID_ESTADO = E.ID_ESTADO
            WHERE T.ID_TIPO_OTP = P_ID_TIPO_OTP;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_TIPO_OTP_POR_ID_FN;

    FUNCTION FIDE_OBTENER_CATEGORIA_POR_ID_FN(
        P_ID_CATEGORIA IN FIDE_CATEGORIA_TB.ID_CATEGORIA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  C.ID_CATEGORIA,
                    C.NOMBRE,
                    C.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CATEGORIA_TB C
            JOIN FIDE_ESTADO_TB E ON C.ID_ESTADO = E.ID_ESTADO
            WHERE C.ID_CATEGORIA = P_ID_CATEGORIA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CATEGORIA_POR_ID_FN;

    FUNCTION FIDE_OBTENER_MARCA_POR_ID_FN(
        P_ID_MARCA IN FIDE_MARCA_TB.ID_MARCA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  M.ID_MARCA,
                    M.NOMBRE,
                    M.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_MARCA_TB M
            JOIN FIDE_ESTADO_TB E ON M.ID_ESTADO = E.ID_ESTADO
            WHERE M.ID_MARCA = P_ID_MARCA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_MARCA_POR_ID_FN;

    FUNCTION FIDE_OBTENER_TIPO_MOVIMIENTO_POR_ID_FN(
        P_ID_TIPO_MOVIMIENTO IN FIDE_TIPO_MOVIMIENTO_TB.ID_TIPO_MOVIMIENTO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  TM.ID_TIPO_MOVIMIENTO,
                    TM.NOMBRE,
                    TM.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TIPO_MOVIMIENTO_TB TM
            JOIN FIDE_ESTADO_TB E ON TM.ID_ESTADO = E.ID_ESTADO
            WHERE TM.ID_TIPO_MOVIMIENTO = P_ID_TIPO_MOVIMIENTO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_TIPO_MOVIMIENTO_POR_ID_FN;

    FUNCTION FIDE_OBTENER_CAMPANIA_POR_ID_FN(
        P_ID_CAMPANIA IN FIDE_CAMPANIA_TB.ID_CAMPANIA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  C.ID_CAMPANIA,
                    C.NOMBRE,
                    C.DESCRIPCION,
                    C.IMAGE_URL,
                    C.FECHA_INICIO,
                    C.FECHA_FIN,
                    C.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CAMPANIA_TB C
            JOIN FIDE_ESTADO_TB E ON C.ID_ESTADO = E.ID_ESTADO
            WHERE C.ID_CAMPANIA = P_ID_CAMPANIA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CAMPANIA_POR_ID_FN;

    FUNCTION FIDE_OBTENER_MONEDA_POR_ID_FN(
        P_ID_MONEDA IN FIDE_MONEDA_TB.ID_MONEDA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  M.ID_MONEDA,
                    M.NOMBRE,
                    M.SIMBOLO,
                    M.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_MONEDA_TB M
            JOIN FIDE_ESTADO_TB E ON M.ID_ESTADO = E.ID_ESTADO
            WHERE M.ID_MONEDA = P_ID_MONEDA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_MONEDA_POR_ID_FN;

    FUNCTION FIDE_OBTENER_RAZA_POR_ID_FN(
        P_ID_RAZA IN FIDE_RAZA_TB.ID_RAZA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  R.ID_RAZA,
                    R.NOMBRE,
                    R.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_RAZA_TB R
            JOIN FIDE_ESTADO_TB E ON R.ID_ESTADO = E.ID_ESTADO
            WHERE R.ID_RAZA = P_ID_RAZA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_RAZA_POR_ID_FN;

    FUNCTION FIDE_OBTENER_SEXO_POR_ID_FN(
        P_ID_SEXO IN FIDE_SEXO_TB.ID_SEXO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  S.ID_SEXO,
                    S.NOMBRE,
                    S.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_SEXO_TB S
            JOIN FIDE_ESTADO_TB E ON S.ID_ESTADO = E.ID_ESTADO
            WHERE S.ID_SEXO = P_ID_SEXO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_SEXO_POR_ID_FN;

    FUNCTION FIDE_OBTENER_TIPO_SOLICITUD_POR_ID_FN(
        P_ID_TIPO_SOLICITUD IN FIDE_TIPO_SOLICITUD_TB.ID_TIPO_SOLICITUD%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  TS.ID_TIPO_SOLICITUD,
                    TS.NOMBRE,
                    TS.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TIPO_SOLICITUD_TB TS
            JOIN FIDE_ESTADO_TB E ON TS.ID_ESTADO = E.ID_ESTADO
            WHERE TS.ID_TIPO_SOLICITUD = P_ID_TIPO_SOLICITUD;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_TIPO_SOLICITUD_POR_ID_FN;

    FUNCTION FIDE_OBTENER_TIPO_RESPUESTA_POR_ID_FN(
        P_ID_TIPO_RESPUESTA IN FIDE_TIPO_RESPUESTA_TB.ID_TIPO_RESPUESTA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  TR.ID_TIPO_RESPUESTA,
                    TR.NOMBRE,
                    TR.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TIPO_RESPUESTA_TB TR
            JOIN FIDE_ESTADO_TB E ON TR.ID_ESTADO = E.ID_ESTADO
            WHERE TR.ID_TIPO_RESPUESTA = P_ID_TIPO_RESPUESTA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_TIPO_RESPUESTA_POR_ID_FN;

    FUNCTION FIDE_OBTENER_TIPO_SEGUIMIENTO_POR_ID_FN(
        P_ID_TIPO_SEGUIMIENTO IN FIDE_TIPO_SEGUIMIENTO_TB.ID_TIPO_SEGUIMIENTO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  TS.ID_TIPO_SEGUIMIENTO,
                    TS.NOMBRE,
                    TS.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TIPO_SEGUIMIENTO_TB TS
            JOIN FIDE_ESTADO_TB E ON TS.ID_ESTADO = E.ID_ESTADO
            WHERE TS.ID_TIPO_SEGUIMIENTO = P_ID_TIPO_SEGUIMIENTO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_TIPO_SEGUIMIENTO_POR_ID_FN;

    FUNCTION FIDE_OBTENER_TIPO_EVENTO_POR_ID_FN(
        P_ID_TIPO_EVENTO IN FIDE_TIPO_EVENTO_TB.ID_TIPO_EVENTO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  TE.ID_TIPO_EVENTO,
                    TE.NOMBRE,
                    TE.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TIPO_EVENTO_TB TE
            JOIN FIDE_ESTADO_TB E ON TE.ID_ESTADO = E.ID_ESTADO
            WHERE TE.ID_TIPO_EVENTO = P_ID_TIPO_EVENTO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_TIPO_EVENTO_POR_ID_FN;

    FUNCTION FIDE_OBTENER_PROVINCIAS_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  PR.ID_PROVINCIA,
                    PR.NOMBRE,
                    PR.ID_PAIS,
                    PA.NOMBRE AS PAIS,
                    PR.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_PROVINCIA_TB PR
            JOIN FIDE_PAIS_TB PA ON PR.ID_PAIS = PA.ID_PAIS
            JOIN FIDE_ESTADO_TB E ON PR.ID_ESTADO = E.ID_ESTADO
            ORDER BY PR.ID_PROVINCIA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_PROVINCIAS_FN;

    FUNCTION FIDE_OBTENER_PROVINCIA_POR_ID_FN(
        P_ID_PROVINCIA IN FIDE_PROVINCIA_TB.ID_PROVINCIA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  PR.ID_PROVINCIA,
                    PR.NOMBRE,
                    PR.ID_PAIS,
                    PA.NOMBRE AS PAIS,
                    PR.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_PROVINCIA_TB PR
            JOIN FIDE_PAIS_TB PA ON PR.ID_PAIS = PA.ID_PAIS
            JOIN FIDE_ESTADO_TB E ON PR.ID_ESTADO = E.ID_ESTADO
            WHERE PR.ID_PROVINCIA = P_ID_PROVINCIA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_PROVINCIA_POR_ID_FN;

    FUNCTION FIDE_OBTENER_CANTONES_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  C.ID_CANTON,
                    C.NOMBRE,
                    C.ID_PROVINCIA,
                    PR.NOMBRE AS PROVINCIA,
                    C.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CANTON_TB C
            JOIN FIDE_PROVINCIA_TB PR ON C.ID_PROVINCIA = PR.ID_PROVINCIA
            JOIN FIDE_ESTADO_TB E ON C.ID_ESTADO = E.ID_ESTADO
            ORDER BY C.ID_CANTON;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CANTONES_FN;

    FUNCTION FIDE_OBTENER_CANTON_POR_ID_FN(
        P_ID_CANTON IN FIDE_CANTON_TB.ID_CANTON%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  C.ID_CANTON,
                    C.NOMBRE,
                    C.ID_PROVINCIA,
                    PR.NOMBRE AS PROVINCIA,
                    C.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CANTON_TB C
            JOIN FIDE_PROVINCIA_TB PR ON C.ID_PROVINCIA = PR.ID_PROVINCIA
            JOIN FIDE_ESTADO_TB E ON C.ID_ESTADO = E.ID_ESTADO
            WHERE C.ID_CANTON = P_ID_CANTON;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CANTON_POR_ID_FN;

    FUNCTION FIDE_OBTENER_DISTRITOS_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  D.ID_DISTRITO,
                    D.NOMBRE,
                    D.ID_CANTON,
                    C.NOMBRE AS CANTON,
                    D.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_DISTRITO_TB D
            JOIN FIDE_CANTON_TB C ON D.ID_CANTON = C.ID_CANTON
            JOIN FIDE_ESTADO_TB E ON D.ID_ESTADO = E.ID_ESTADO
            ORDER BY D.ID_DISTRITO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_DISTRITOS_FN;

    FUNCTION FIDE_OBTENER_DISTRITO_POR_ID_FN(
        P_ID_DISTRITO IN FIDE_DISTRITO_TB.ID_DISTRITO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  D.ID_DISTRITO,
                    D.NOMBRE,
                    D.ID_CANTON,
                    C.NOMBRE AS CANTON,
                    D.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_DISTRITO_TB D
            JOIN FIDE_CANTON_TB C ON D.ID_CANTON = C.ID_CANTON
            JOIN FIDE_ESTADO_TB E ON D.ID_ESTADO = E.ID_ESTADO
            WHERE D.ID_DISTRITO = P_ID_DISTRITO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_DISTRITO_POR_ID_FN;

    /* ============================================================
       FUNCIONES COMPLEMENTARIAS PARA CRUD ADMIN
       DIRECCIONES, USUARIOS Y AUTENTICACION
       ============================================================ */

    FUNCTION FIDE_OBTENER_DIRECCIONES_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  D.ID_DIRECCION,
                    D.ID_DISTRITO,
                    DIS.NOMBRE AS DISTRITO,
                    C.ID_CANTON,
                    C.NOMBRE AS CANTON,
                    PR.ID_PROVINCIA,
                    PR.NOMBRE AS PROVINCIA,
                    PA.ID_PAIS,
                    PA.NOMBRE AS PAIS,
                    D.CALLE,
                    D.NUMERO,
                    D.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_DIRECCION_TB D
            JOIN FIDE_DISTRITO_TB DIS ON D.ID_DISTRITO = DIS.ID_DISTRITO
            JOIN FIDE_CANTON_TB C ON DIS.ID_CANTON = C.ID_CANTON
            JOIN FIDE_PROVINCIA_TB PR ON C.ID_PROVINCIA = PR.ID_PROVINCIA
            JOIN FIDE_PAIS_TB PA ON PR.ID_PAIS = PA.ID_PAIS
            JOIN FIDE_ESTADO_TB E ON D.ID_ESTADO = E.ID_ESTADO
            ORDER BY D.ID_DIRECCION;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_DIRECCIONES_FN;

    FUNCTION FIDE_OBTENER_PREGUNTA_POR_ID_FN(
        P_ID_PREGUNTA IN FIDE_PREGUNTA_TB.ID_PREGUNTA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  P.ID_PREGUNTA,
                    P.PREGUNTA,
                    P.ID_TIPO_RESPUESTA,
                    TR.NOMBRE AS TIPO_RESPUESTA,
                    P.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_PREGUNTA_TB P
            JOIN FIDE_TIPO_RESPUESTA_TB TR ON P.ID_TIPO_RESPUESTA = TR.ID_TIPO_RESPUESTA
            JOIN FIDE_ESTADO_TB E ON P.ID_ESTADO = E.ID_ESTADO
            WHERE P.ID_PREGUNTA = P_ID_PREGUNTA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_PREGUNTA_POR_ID_FN;

    FUNCTION FIDE_OBTENER_CORREOS_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  C.IDENTIFICACION,
                    CU.USUARIO,
                    C.CORREO,
                    C.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CORREO_TB C
            JOIN FIDE_USUARIO_TB U ON C.IDENTIFICACION = U.IDENTIFICACION
            LEFT JOIN FIDE_CUENTA_TB CU ON C.IDENTIFICACION = CU.IDENTIFICACION
            JOIN FIDE_ESTADO_TB E ON C.ID_ESTADO = E.ID_ESTADO
            ORDER BY C.IDENTIFICACION, C.CORREO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CORREOS_FN;

    FUNCTION FIDE_OBTENER_CORREO_POR_PK_FN(
        P_IDENTIFICACION IN FIDE_CORREO_TB.IDENTIFICACION%TYPE,
        P_CORREO         IN FIDE_CORREO_TB.CORREO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  C.IDENTIFICACION,
                    C.CORREO,
                    C.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CORREO_TB C
            JOIN FIDE_ESTADO_TB E ON C.ID_ESTADO = E.ID_ESTADO
            WHERE C.IDENTIFICACION = P_IDENTIFICACION
              AND C.CORREO = P_CORREO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CORREO_POR_PK_FN;

    FUNCTION FIDE_OBTENER_TELEFONOS_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  T.IDENTIFICACION,
                    CU.USUARIO,
                    T.TELEFONO,
                    T.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TELEFONO_TB T
            JOIN FIDE_USUARIO_TB U ON T.IDENTIFICACION = U.IDENTIFICACION
            LEFT JOIN FIDE_CUENTA_TB CU ON T.IDENTIFICACION = CU.IDENTIFICACION
            JOIN FIDE_ESTADO_TB E ON T.ID_ESTADO = E.ID_ESTADO
            ORDER BY T.IDENTIFICACION, T.TELEFONO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_TELEFONOS_FN;

    FUNCTION FIDE_OBTENER_TELEFONO_POR_PK_FN(
        P_IDENTIFICACION IN FIDE_TELEFONO_TB.IDENTIFICACION%TYPE,
        P_TELEFONO       IN FIDE_TELEFONO_TB.TELEFONO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  T.IDENTIFICACION,
                    T.TELEFONO,
                    T.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_TELEFONO_TB T
            JOIN FIDE_ESTADO_TB E ON T.ID_ESTADO = E.ID_ESTADO
            WHERE T.IDENTIFICACION = P_IDENTIFICACION
              AND T.TELEFONO = P_TELEFONO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_TELEFONO_POR_PK_FN;

    FUNCTION FIDE_OBTENER_CUENTAS_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  C.ID_CUENTA,
                    C.IDENTIFICACION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS USUARIO_NOMBRE,
                    C.USUARIO,
                    C.PASSWORD_HASH,
                    C.FECHA_REGISTRO,
                    C.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CUENTA_TB C
            JOIN FIDE_USUARIO_TB U ON C.IDENTIFICACION = U.IDENTIFICACION
            JOIN FIDE_ESTADO_TB E ON C.ID_ESTADO = E.ID_ESTADO
            ORDER BY C.ID_CUENTA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CUENTAS_FN;

    FUNCTION FIDE_OBTENER_OTPS_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  O.ID_CODIGO_OTP,
                    O.ID_CUENTA,
                    C.USUARIO,
                    O.ID_TIPO_OTP,
                    T.NOMBRE AS TIPO_OTP,
                    O.CODIGO_HASH,
                    O.FECHA_EXPIRACION,
                    O.FECHA_USO,
                    O.INTENTOS,
                    O.FECHA_CREACION,
                    O.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CODIGO_OTP_TB O
            JOIN FIDE_CUENTA_TB C ON O.ID_CUENTA = C.ID_CUENTA
            JOIN FIDE_TIPO_OTP_TB T ON O.ID_TIPO_OTP = T.ID_TIPO_OTP
            JOIN FIDE_ESTADO_TB E ON O.ID_ESTADO = E.ID_ESTADO
            ORDER BY O.ID_CODIGO_OTP DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_OTPS_FN;

    FUNCTION FIDE_OBTENER_OTP_POR_ID_FN(
        P_ID_CODIGO_OTP IN FIDE_CODIGO_OTP_TB.ID_CODIGO_OTP%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  O.ID_CODIGO_OTP,
                    O.ID_CUENTA,
                    C.USUARIO,
                    O.ID_TIPO_OTP,
                    T.NOMBRE AS TIPO_OTP,
                    O.CODIGO_HASH,
                    O.FECHA_EXPIRACION,
                    O.FECHA_USO,
                    O.INTENTOS,
                    O.FECHA_CREACION,
                    O.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CODIGO_OTP_TB O
            JOIN FIDE_CUENTA_TB C ON O.ID_CUENTA = C.ID_CUENTA
            JOIN FIDE_TIPO_OTP_TB T ON O.ID_TIPO_OTP = T.ID_TIPO_OTP
            JOIN FIDE_ESTADO_TB E ON O.ID_ESTADO = E.ID_ESTADO
            WHERE O.ID_CODIGO_OTP = P_ID_CODIGO_OTP;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_OTP_POR_ID_FN;

    FUNCTION FIDE_OBTENER_REFRESH_TOKENS_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  RT.ID_REFRESH_TOKEN,
                    RT.ID_CUENTA,
                    C.USUARIO,
                    RT.TOKEN_HASH,
                    RT.JTI,
                    RT.IP_ADDRESS,
                    RT.USER_AGENT,
                    RT.FECHA_EXPIRACION,
                    RT.FECHA_REVOCACION,
                    RT.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_REFRESH_TOKEN_TB RT
            JOIN FIDE_CUENTA_TB C ON RT.ID_CUENTA = C.ID_CUENTA
            JOIN FIDE_ESTADO_TB E ON RT.ID_ESTADO = E.ID_ESTADO
            ORDER BY RT.ID_REFRESH_TOKEN DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_REFRESH_TOKENS_FN;

    FUNCTION FIDE_OBTENER_REFRESH_TOKEN_POR_ID_FN(
        P_ID_REFRESH_TOKEN IN FIDE_REFRESH_TOKEN_TB.ID_REFRESH_TOKEN%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  RT.ID_REFRESH_TOKEN,
                    RT.ID_CUENTA,
                    C.USUARIO,
                    RT.TOKEN_HASH,
                    RT.JTI,
                    RT.IP_ADDRESS,
                    RT.USER_AGENT,
                    RT.FECHA_EXPIRACION,
                    RT.FECHA_REVOCACION,
                    RT.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_REFRESH_TOKEN_TB RT
            JOIN FIDE_CUENTA_TB C ON RT.ID_CUENTA = C.ID_CUENTA
            JOIN FIDE_ESTADO_TB E ON RT.ID_ESTADO = E.ID_ESTADO
            WHERE RT.ID_REFRESH_TOKEN = P_ID_REFRESH_TOKEN;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_REFRESH_TOKEN_POR_ID_FN;

    /* ============================================================
       FUNCIONES COMPLEMENTARIAS PARA CRUD ADMIN
       TRANSACCIONALES, PIVOTES Y DETALLES
       ============================================================ */

    FUNCTION FIDE_OBTENER_VENTA_POR_ID_FN(
        P_ID_VENTA IN FIDE_VENTA_TB.ID_VENTA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  V.ID_VENTA,
                    V.IDENTIFICACION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS CLIENTE,
                    V.TOTAL_VENTA,
                    V.FECHA_VENTA,
                    V.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_VENTA_TB V
            JOIN FIDE_USUARIO_TB U ON V.IDENTIFICACION = U.IDENTIFICACION
            JOIN FIDE_ESTADO_TB E ON V.ID_ESTADO = E.ID_ESTADO
            WHERE V.ID_VENTA = P_ID_VENTA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_VENTA_POR_ID_FN;

    FUNCTION FIDE_OBTENER_DONACION_POR_ID_FN(
        P_ID_DONACION IN FIDE_DONACION_TB.ID_DONACION%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  D.ID_DONACION,
                    D.IDENTIFICACION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS DONADOR,
                    D.ID_CAMPANIA,
                    C.NOMBRE AS CAMPANIA,
                    D.MONTO,
                    D.FECHA_DONACION,
                    D.MENSAJE,
                    D.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_DONACION_TB D
            JOIN FIDE_USUARIO_TB U ON D.IDENTIFICACION = U.IDENTIFICACION
            LEFT JOIN FIDE_CAMPANIA_TB C ON D.ID_CAMPANIA = C.ID_CAMPANIA
            JOIN FIDE_ESTADO_TB E ON D.ID_ESTADO = E.ID_ESTADO
            WHERE D.ID_DONACION = P_ID_DONACION;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_DONACION_POR_ID_FN;

    FUNCTION FIDE_OBTENER_PERRITOS_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  P.ID_PERRITO,
                    P.NOMBRE,
                    P.FECHA_INGRESO,
                    P.EDAD,
                    P.PESO,
                    P.ESTATURA,
                    P.ID_SEXO,
                    S.NOMBRE AS SEXO,
                    P.ID_RAZA,
                    R.NOMBRE AS RAZA,
                    P.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_PERRITO_TB P
            JOIN FIDE_SEXO_TB S ON P.ID_SEXO = S.ID_SEXO
            JOIN FIDE_RAZA_TB R ON P.ID_RAZA = R.ID_RAZA
            JOIN FIDE_ESTADO_TB E ON P.ID_ESTADO = E.ID_ESTADO
            ORDER BY P.ID_PERRITO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_PERRITOS_FN;

    FUNCTION FIDE_OBTENER_IMAGEN_PRODUCTO_POR_ID_FN(
        P_ID_IMAGEN IN FIDE_PRODUCTO_IMAGEN_TB.ID_IMAGEN%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  PI.ID_IMAGEN,
                    PI.ID_PRODUCTO,
                    P.NOMBRE AS PRODUCTO,
                    PI.IMAGE_URL,
                    PI.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_PRODUCTO_IMAGEN_TB PI
            JOIN FIDE_PRODUCTO_TB P ON PI.ID_PRODUCTO = P.ID_PRODUCTO
            JOIN FIDE_ESTADO_TB E ON PI.ID_ESTADO = E.ID_ESTADO
            WHERE PI.ID_IMAGEN = P_ID_IMAGEN;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_IMAGEN_PRODUCTO_POR_ID_FN;

    FUNCTION FIDE_OBTENER_IMAGEN_PERRO_POR_ID_FN(
        P_ID_IMAGEN IN FIDE_PERRITO_IMAGEN_TB.ID_IMAGEN%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  PI.ID_IMAGEN,
                    PI.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    PI.IMAGE_URL,
                    PI.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_PERRITO_IMAGEN_TB PI
            JOIN FIDE_PERRITO_TB P ON PI.ID_PERRITO = P.ID_PERRITO
            JOIN FIDE_ESTADO_TB E ON PI.ID_ESTADO = E.ID_ESTADO
            WHERE PI.ID_IMAGEN = P_ID_IMAGEN;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_IMAGEN_PERRO_POR_ID_FN;

    FUNCTION FIDE_OBTENER_EVENTOS_PERRITO_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  EP.ID_EVENTO,
                    EP.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    EP.ID_TIPO_EVENTO,
                    TE.NOMBRE AS TIPO_EVENTO,
                    EP.FECHA_EVENTO,
                    EP.DETALLE,
                    EP.TOTAL_GASTO,
                    EP.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_EVENTO_PERRITO_TB EP
            JOIN FIDE_PERRITO_TB P ON EP.ID_PERRITO = P.ID_PERRITO
            JOIN FIDE_TIPO_EVENTO_TB TE ON EP.ID_TIPO_EVENTO = TE.ID_TIPO_EVENTO
            JOIN FIDE_ESTADO_TB E ON EP.ID_ESTADO = E.ID_ESTADO
            ORDER BY EP.ID_EVENTO DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_EVENTOS_PERRITO_FN;

    FUNCTION FIDE_OBTENER_EVENTO_PERRITO_POR_ID_FN(
        P_ID_EVENTO IN FIDE_EVENTO_PERRITO_TB.ID_EVENTO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  EP.ID_EVENTO,
                    EP.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    EP.ID_TIPO_EVENTO,
                    TE.NOMBRE AS TIPO_EVENTO,
                    EP.FECHA_EVENTO,
                    EP.DETALLE,
                    EP.TOTAL_GASTO,
                    EP.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_EVENTO_PERRITO_TB EP
            JOIN FIDE_PERRITO_TB P ON EP.ID_PERRITO = P.ID_PERRITO
            JOIN FIDE_TIPO_EVENTO_TB TE ON EP.ID_TIPO_EVENTO = TE.ID_TIPO_EVENTO
            JOIN FIDE_ESTADO_TB E ON EP.ID_ESTADO = E.ID_ESTADO
            WHERE EP.ID_EVENTO = P_ID_EVENTO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_EVENTO_PERRITO_POR_ID_FN;

    FUNCTION FIDE_OBTENER_TODOS_DETALLES_EVENTO_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  DE.ID_DETALLE_EVENTO,
                    DE.ID_EVENTO,
                    EP.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    DE.COMPROBANTE_URL,
                    DE.DESCRIPCION,
                    DE.MONTO,
                    DE.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_DETALLE_EVENTO_TB DE
            JOIN FIDE_EVENTO_PERRITO_TB EP ON DE.ID_EVENTO = EP.ID_EVENTO
            JOIN FIDE_PERRITO_TB P ON EP.ID_PERRITO = P.ID_PERRITO
            JOIN FIDE_ESTADO_TB E ON DE.ID_ESTADO = E.ID_ESTADO
            ORDER BY DE.ID_DETALLE_EVENTO DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_TODOS_DETALLES_EVENTO_FN;

    FUNCTION FIDE_OBTENER_DETALLE_EVENTO_POR_ID_FN(
        P_ID_DETALLE_EVENTO IN FIDE_DETALLE_EVENTO_TB.ID_DETALLE_EVENTO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  DE.ID_DETALLE_EVENTO,
                    DE.ID_EVENTO,
                    DE.COMPROBANTE_URL,
                    DE.DESCRIPCION,
                    DE.MONTO,
                    DE.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_DETALLE_EVENTO_TB DE
            JOIN FIDE_ESTADO_TB E ON DE.ID_ESTADO = E.ID_ESTADO
            WHERE DE.ID_DETALLE_EVENTO = P_ID_DETALLE_EVENTO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_DETALLE_EVENTO_POR_ID_FN;

    FUNCTION FIDE_OBTENER_RESPUESTAS_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  R.ID_RESPUESTA,
                    R.ID_SOLICITUD,
                    R.ID_PREGUNTA,
                    P.PREGUNTA,
                    R.RESPUESTA,
                    R.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_RESPUESTA_TB R
            JOIN FIDE_PREGUNTA_TB P ON R.ID_PREGUNTA = P.ID_PREGUNTA
            JOIN FIDE_ESTADO_TB E ON R.ID_ESTADO = E.ID_ESTADO
            ORDER BY R.ID_RESPUESTA DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_RESPUESTAS_FN;

    FUNCTION FIDE_OBTENER_RESPUESTA_POR_ID_FN(
        P_ID_RESPUESTA IN FIDE_RESPUESTA_TB.ID_RESPUESTA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  R.ID_RESPUESTA,
                    R.ID_SOLICITUD,
                    R.ID_PREGUNTA,
                    P.PREGUNTA,
                    R.RESPUESTA,
                    R.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_RESPUESTA_TB R
            JOIN FIDE_PREGUNTA_TB P ON R.ID_PREGUNTA = P.ID_PREGUNTA
            JOIN FIDE_ESTADO_TB E ON R.ID_ESTADO = E.ID_ESTADO
            WHERE R.ID_RESPUESTA = P_ID_RESPUESTA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_RESPUESTA_POR_ID_FN;

    FUNCTION FIDE_OBTENER_CASA_CUNA_POR_ID_FN(
        P_ID_CASA_CUNA IN FIDE_CASA_CUNA_TB.ID_CASA_CUNA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  CC.ID_CASA_CUNA,
                    CC.NOMBRE,
                    CC.ID_DIRECCION,
                    CC.IDENTIFICACION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS ENCARGADO,
                    CC.ID_SOLICITUD,
                    CC.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CASA_CUNA_TB CC
            JOIN FIDE_USUARIO_TB U ON CC.IDENTIFICACION = U.IDENTIFICACION
            JOIN FIDE_ESTADO_TB E ON CC.ID_ESTADO = E.ID_ESTADO
            WHERE CC.ID_CASA_CUNA = P_ID_CASA_CUNA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CASA_CUNA_POR_ID_FN;

    FUNCTION FIDE_OBTENER_ADOPCION_POR_ID_FN(
        P_ID_ADOPCION IN FIDE_ADOPCION_TB.ID_ADOPCION%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  A.ID_ADOPCION,
                    A.IDENTIFICACION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS ADOPTANTE,
                    A.ID_SOLICITUD,
                    A.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    A.FECHA_ADOPCION,
                    A.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_ADOPCION_TB A
            JOIN FIDE_USUARIO_TB U ON A.IDENTIFICACION = U.IDENTIFICACION
            JOIN FIDE_PERRITO_TB P ON A.ID_PERRITO = P.ID_PERRITO
            JOIN FIDE_ESTADO_TB E ON A.ID_ESTADO = E.ID_ESTADO
            WHERE A.ID_ADOPCION = P_ID_ADOPCION;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_ADOPCION_POR_ID_FN;

    FUNCTION FIDE_OBTENER_SEGUIMIENTO_POR_ID_FN(
        P_ID_SEGUIMIENTO IN FIDE_SEGUIMIENTO_TB.ID_SEGUIMIENTO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  SG.ID_SEGUIMIENTO,
                    SG.ID_ADOPCION,
                    SG.ID_TIPO_SEGUIMIENTO,
                    TS.NOMBRE AS TIPO_SEGUIMIENTO,
                    SG.FECHA_INICIO,
                    SG.FECHA_FIN,
                    SG.COMENTARIOS,
                    SG.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_SEGUIMIENTO_TB SG
            JOIN FIDE_TIPO_SEGUIMIENTO_TB TS ON SG.ID_TIPO_SEGUIMIENTO = TS.ID_TIPO_SEGUIMIENTO
            JOIN FIDE_ESTADO_TB E ON SG.ID_ESTADO = E.ID_ESTADO
            WHERE SG.ID_SEGUIMIENTO = P_ID_SEGUIMIENTO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_SEGUIMIENTO_POR_ID_FN;

    FUNCTION FIDE_OBTENER_EVIDENCIAS_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  EV.ID_EVIDENCIA,
                    EV.ID_SEGUIMIENTO,
                    EV.IMAGEN_URL,
                    EV.COMENTARIOS,
                    EV.FECHA_EVIDENCIA,
                    EV.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_EVIDENCIA_TB EV
            JOIN FIDE_ESTADO_TB E ON EV.ID_ESTADO = E.ID_ESTADO
            ORDER BY EV.ID_EVIDENCIA DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_EVIDENCIAS_FN;

    FUNCTION FIDE_OBTENER_EVIDENCIA_POR_ID_FN(
        P_ID_EVIDENCIA IN FIDE_EVIDENCIA_TB.ID_EVIDENCIA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  EV.ID_EVIDENCIA,
                    EV.ID_SEGUIMIENTO,
                    EV.IMAGEN_URL,
                    EV.COMENTARIOS,
                    EV.FECHA_EVIDENCIA,
                    EV.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_EVIDENCIA_TB EV
            JOIN FIDE_ESTADO_TB E ON EV.ID_ESTADO = E.ID_ESTADO
            WHERE EV.ID_EVIDENCIA = P_ID_EVIDENCIA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_EVIDENCIA_POR_ID_FN;

    FUNCTION FIDE_OBTENER_CASAS_PERRITO_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  CP.ID_CASA_CUNA,
                    CC.NOMBRE AS CASA_CUNA,
                    CP.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    CP.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CASA_PERRITO_TB CP
            JOIN FIDE_CASA_CUNA_TB CC ON CP.ID_CASA_CUNA = CC.ID_CASA_CUNA
            JOIN FIDE_PERRITO_TB P ON CP.ID_PERRITO = P.ID_PERRITO
            JOIN FIDE_ESTADO_TB E ON CP.ID_ESTADO = E.ID_ESTADO
            ORDER BY CP.ID_CASA_CUNA, CP.ID_PERRITO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CASAS_PERRITO_FN;

    FUNCTION FIDE_OBTENER_CASA_PERRITO_POR_PK_FN(
        P_ID_CASA_CUNA IN FIDE_CASA_PERRITO_TB.ID_CASA_CUNA%TYPE,
        P_ID_PERRITO   IN FIDE_CASA_PERRITO_TB.ID_PERRITO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  CP.ID_CASA_CUNA,
                    CP.ID_PERRITO,
                    CP.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_CASA_PERRITO_TB CP
            JOIN FIDE_ESTADO_TB E ON CP.ID_ESTADO = E.ID_ESTADO
            WHERE CP.ID_CASA_CUNA = P_ID_CASA_CUNA
              AND CP.ID_PERRITO = P_ID_PERRITO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_CASA_PERRITO_POR_PK_FN;

    FUNCTION FIDE_OBTENER_VENTAS_FACTURA_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  VF.ID_VENTA,
                    VF.ID_FACTURA,
                    VF.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_VENTA_FACTURA_TB VF
            JOIN FIDE_ESTADO_TB E ON VF.ID_ESTADO = E.ID_ESTADO
            ORDER BY VF.ID_VENTA, VF.ID_FACTURA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_VENTAS_FACTURA_FN;

    FUNCTION FIDE_OBTENER_VENTA_FACTURA_POR_PK_FN(
        P_ID_VENTA   IN FIDE_VENTA_FACTURA_TB.ID_VENTA%TYPE,
        P_ID_FACTURA IN FIDE_VENTA_FACTURA_TB.ID_FACTURA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  VF.ID_VENTA,
                    VF.ID_FACTURA,
                    VF.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_VENTA_FACTURA_TB VF
            JOIN FIDE_ESTADO_TB E ON VF.ID_ESTADO = E.ID_ESTADO
            WHERE VF.ID_VENTA = P_ID_VENTA
              AND VF.ID_FACTURA = P_ID_FACTURA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_VENTA_FACTURA_POR_PK_FN;

    FUNCTION FIDE_OBTENER_DONACIONES_FACTURA_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  DF.ID_DONACION,
                    DF.ID_FACTURA,
                    DF.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_DONACION_FACTURA_TB DF
            JOIN FIDE_ESTADO_TB E ON DF.ID_ESTADO = E.ID_ESTADO
            ORDER BY DF.ID_DONACION, DF.ID_FACTURA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_DONACIONES_FACTURA_FN;

    FUNCTION FIDE_OBTENER_DONACION_FACTURA_POR_PK_FN(
        P_ID_DONACION IN FIDE_DONACION_FACTURA_TB.ID_DONACION%TYPE,
        P_ID_FACTURA  IN FIDE_DONACION_FACTURA_TB.ID_FACTURA%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  DF.ID_DONACION,
                    DF.ID_FACTURA,
                    DF.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_DONACION_FACTURA_TB DF
            JOIN FIDE_ESTADO_TB E ON DF.ID_ESTADO = E.ID_ESTADO
            WHERE DF.ID_DONACION = P_ID_DONACION
              AND DF.ID_FACTURA = P_ID_FACTURA;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_DONACION_FACTURA_POR_PK_FN;

    FUNCTION FIDE_OBTENER_PAGOS_PAYPAL_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  PP.ID_PAGO,
                    PP.ID_FACTURA,
                    PP.PAYPAL_ORDER_ID,
                    PP.PAYPAL_CAPTURE_ID,
                    PP.FECHA_PAGO,
                    PP.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_PAGO_PAYPAL_TB PP
            JOIN FIDE_ESTADO_TB E ON PP.ID_ESTADO = E.ID_ESTADO
            ORDER BY PP.ID_PAGO DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_PAGOS_PAYPAL_FN;

    FUNCTION FIDE_OBTENER_PAGO_PAYPAL_POR_ID_FN(
        P_ID_PAGO IN FIDE_PAGO_PAYPAL_TB.ID_PAGO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  PP.ID_PAGO,
                    PP.ID_FACTURA,
                    PP.PAYPAL_ORDER_ID,
                    PP.PAYPAL_CAPTURE_ID,
                    PP.FECHA_PAGO,
                    PP.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_PAGO_PAYPAL_TB PP
            JOIN FIDE_ESTADO_TB E ON PP.ID_ESTADO = E.ID_ESTADO
            WHERE PP.ID_PAGO = P_ID_PAGO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_PAGO_PAYPAL_POR_ID_FN;

    FUNCTION FIDE_OBTENER_INVENTARIO_POR_ID_FN(
        P_ID_INVENTARIO IN FIDE_INVENTARIO_TB.ID_INVENTARIO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  I.ID_INVENTARIO,
                    I.ID_PRODUCTO,
                    P.NOMBRE AS PRODUCTO,
                    I.CANTIDAD,
                    I.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_INVENTARIO_TB I
            JOIN FIDE_PRODUCTO_TB P ON I.ID_PRODUCTO = P.ID_PRODUCTO
            JOIN FIDE_ESTADO_TB E ON I.ID_ESTADO = E.ID_ESTADO
            WHERE I.ID_INVENTARIO = P_ID_INVENTARIO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_INVENTARIO_POR_ID_FN;

    FUNCTION FIDE_OBTENER_MOVIMIENTO_INVENTARIO_POR_ID_FN(
        P_ID_MOVIMIENTO IN FIDE_MOVIMIENTO_INVENTARIO_TB.ID_MOVIMIENTO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  MI.ID_MOVIMIENTO,
                    MI.ID_PRODUCTO,
                    P.NOMBRE AS PRODUCTO,
                    MI.ID_TIPO_MOVIMIENTO,
                    TM.NOMBRE AS TIPO_MOVIMIENTO,
                    MI.CANTIDAD,
                    MI.FECHA_MOVIMIENTO,
                    MI.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_MOVIMIENTO_INVENTARIO_TB MI
            JOIN FIDE_PRODUCTO_TB P ON MI.ID_PRODUCTO = P.ID_PRODUCTO
            JOIN FIDE_TIPO_MOVIMIENTO_TB TM ON MI.ID_TIPO_MOVIMIENTO = TM.ID_TIPO_MOVIMIENTO
            JOIN FIDE_ESTADO_TB E ON MI.ID_ESTADO = E.ID_ESTADO
            WHERE MI.ID_MOVIMIENTO = P_ID_MOVIMIENTO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_MOVIMIENTO_INVENTARIO_POR_ID_FN;

    FUNCTION FIDE_OBTENER_VENTAS_PRODUCTO_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  VP.ID_VENTA,
                    VP.ID_PRODUCTO,
                    P.NOMBRE AS PRODUCTO,
                    VP.ID_TIPO_MOVIMIENTO,
                    TM.NOMBRE AS TIPO_MOVIMIENTO,
                    VP.CANTIDAD,
                    VP.PRECIO_UNITARIO,
                    VP.TOTAL,
                    VP.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_VENTA_PRODUCTO_TB VP
            JOIN FIDE_PRODUCTO_TB P ON VP.ID_PRODUCTO = P.ID_PRODUCTO
            LEFT JOIN FIDE_TIPO_MOVIMIENTO_TB TM ON VP.ID_TIPO_MOVIMIENTO = TM.ID_TIPO_MOVIMIENTO
            JOIN FIDE_ESTADO_TB E ON VP.ID_ESTADO = E.ID_ESTADO
            ORDER BY VP.ID_VENTA DESC, VP.ID_PRODUCTO ASC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_VENTAS_PRODUCTO_FN;

    FUNCTION FIDE_OBTENER_VENTA_PRODUCTO_POR_PK_FN(
        P_ID_VENTA    IN FIDE_VENTA_PRODUCTO_TB.ID_VENTA%TYPE,
        P_ID_PRODUCTO IN FIDE_VENTA_PRODUCTO_TB.ID_PRODUCTO%TYPE
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  VP.ID_VENTA,
                    VP.ID_PRODUCTO,
                    VP.ID_TIPO_MOVIMIENTO,
                    VP.CANTIDAD,
                    VP.PRECIO_UNITARIO,
                    VP.TOTAL,
                    VP.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_VENTA_PRODUCTO_TB VP
            JOIN FIDE_ESTADO_TB E ON VP.ID_ESTADO = E.ID_ESTADO
            WHERE VP.ID_VENTA = P_ID_VENTA
              AND VP.ID_PRODUCTO = P_ID_PRODUCTO;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_OBTENER_VENTA_PRODUCTO_POR_PK_FN;

    FUNCTION FIDE_RESUMEN_ADMIN_DASHBOARD_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  NVL((
                        SELECT COUNT(*)
                        FROM FIDE_FACTURA_TB F
                        WHERE F.ID_ESTADO = 1
                    ), 0) AS FACTURAS_ACTIVAS,
                    NVL((
                        SELECT SUM(F.TOTAL)
                        FROM FIDE_FACTURA_TB F
                        WHERE F.ID_ESTADO = 1
                    ), 0) AS TOTAL_FACTURADO,
                    NVL((
                        SELECT COUNT(*)
                        FROM FIDE_VENTA_TB V
                        WHERE V.ID_ESTADO = 1
                    ), 0) AS VENTAS_ACTIVAS,
                    NVL((
                        SELECT SUM(V.TOTAL_VENTA)
                        FROM FIDE_VENTA_TB V
                        WHERE V.ID_ESTADO = 1
                    ), 0) AS TOTAL_VENTAS,
                    NVL((
                        SELECT COUNT(*)
                        FROM FIDE_DONACION_TB D
                        WHERE D.ID_ESTADO = 1
                    ), 0) AS DONACIONES_ACTIVAS,
                    NVL((
                        SELECT SUM(D.MONTO)
                        FROM FIDE_DONACION_TB D
                        WHERE D.ID_ESTADO = 1
                    ), 0) AS TOTAL_DONACIONES,
                    NVL((
                        SELECT COUNT(*)
                        FROM FIDE_ADOPCION_TB A
                        WHERE A.ID_ESTADO = 1
                    ), 0) AS ADOPCIONES_ACTIVAS,
                    NVL((
                        SELECT COUNT(*)
                        FROM FIDE_PERRITO_TB P
                        WHERE P.ID_ESTADO = 1
                    ), 0) AS PERRITOS_ACTIVOS,
                    NVL((
                        SELECT COUNT(*)
                        FROM FIDE_CAMPANIA_TB C
                        WHERE C.ID_ESTADO = 1
                          AND TRUNC(SYSDATE) >= TRUNC(NVL(C.FECHA_INICIO, SYSDATE))
                          AND TRUNC(SYSDATE) <= TRUNC(NVL(C.FECHA_FIN, SYSDATE))
                    ), 0) AS CAMPANIAS_VIGENTES,
                    NVL((
                        SELECT COUNT(*)
                        FROM FIDE_INVENTARIO_TB I
                        WHERE I.ID_ESTADO = 1
                          AND NVL(I.CANTIDAD, 0) <= 10
                    ), 0) AS PRODUCTOS_STOCK_BAJO,
                    NVL((
                        SELECT COUNT(*)
                        FROM FIDE_SEGUIMIENTO_TB S
                        WHERE S.ID_ESTADO = 1
                          AND TRUNC(S.FECHA_FIN) < TRUNC(SYSDATE)
                    ), 0) AS SEGUIMIENTOS_VENCIDOS,
                    NVL((
                        SELECT COUNT(*)
                        FROM FIDE_SEGUIMIENTO_TB S
                        WHERE S.ID_ESTADO = 1
                          AND TRUNC(S.FECHA_FIN) BETWEEN TRUNC(SYSDATE) AND TRUNC(SYSDATE) + 7
                    ), 0) AS SEGUIMIENTOS_PROXIMOS
            FROM DUAL;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_RESUMEN_ADMIN_DASHBOARD_FN;

    FUNCTION FIDE_REPORTE_FACTURAS_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  F.ID_FACTURA,
                    F.FECHA_FACTURA,
                    F.ID_MONEDA,
                    M.NOMBRE AS MONEDA,
                    M.SIMBOLO,
                    F.SUBTOTAL,
                    F.IMPUESTO,
                    F.TOTAL,
                    NVL(VF.CANTIDAD_VENTAS, 0) AS CANTIDAD_VENTAS,
                    NVL(DF.CANTIDAD_DONACIONES, 0) AS CANTIDAD_DONACIONES,
                    NVL(PP.CANTIDAD_PAGOS_PAYPAL, 0) AS CANTIDAD_PAGOS_PAYPAL,
                    F.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_FACTURA_TB F
            JOIN FIDE_MONEDA_TB M ON F.ID_MONEDA = M.ID_MONEDA
            JOIN FIDE_ESTADO_TB E ON F.ID_ESTADO = E.ID_ESTADO
            LEFT JOIN (
                SELECT  VF.ID_FACTURA,
                        COUNT(*) AS CANTIDAD_VENTAS
                FROM FIDE_VENTA_FACTURA_TB VF
                WHERE VF.ID_ESTADO = 1
                GROUP BY VF.ID_FACTURA
            ) VF ON F.ID_FACTURA = VF.ID_FACTURA
            LEFT JOIN (
                SELECT  DF.ID_FACTURA,
                        COUNT(*) AS CANTIDAD_DONACIONES
                FROM FIDE_DONACION_FACTURA_TB DF
                WHERE DF.ID_ESTADO = 1
                GROUP BY DF.ID_FACTURA
            ) DF ON F.ID_FACTURA = DF.ID_FACTURA
            LEFT JOIN (
                SELECT  PP.ID_FACTURA,
                        COUNT(*) AS CANTIDAD_PAGOS_PAYPAL
                FROM FIDE_PAGO_PAYPAL_TB PP
                WHERE PP.ID_ESTADO = 1
                GROUP BY PP.ID_FACTURA
            ) PP ON F.ID_FACTURA = PP.ID_FACTURA
            ORDER BY F.FECHA_FACTURA DESC, F.ID_FACTURA DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_REPORTE_FACTURAS_ADMIN_FN;

    FUNCTION FIDE_REPORTE_DONACIONES_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  D.ID_DONACION,
                    D.FECHA_DONACION,
                    D.IDENTIFICACION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS DONADOR,
                    D.ID_CAMPANIA,
                    C.NOMBRE AS CAMPANIA,
                    D.MONTO,
                    NVL(DF.CANTIDAD_FACTURAS, 0) AS CANTIDAD_FACTURAS,
                    D.MENSAJE,
                    D.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_DONACION_TB D
            JOIN FIDE_USUARIO_TB U ON D.IDENTIFICACION = U.IDENTIFICACION
            LEFT JOIN FIDE_CAMPANIA_TB C ON D.ID_CAMPANIA = C.ID_CAMPANIA
            JOIN FIDE_ESTADO_TB E ON D.ID_ESTADO = E.ID_ESTADO
            LEFT JOIN (
                SELECT  DF.ID_DONACION,
                        COUNT(*) AS CANTIDAD_FACTURAS
                FROM FIDE_DONACION_FACTURA_TB DF
                WHERE DF.ID_ESTADO = 1
                GROUP BY DF.ID_DONACION
            ) DF ON D.ID_DONACION = DF.ID_DONACION
            ORDER BY D.FECHA_DONACION DESC, D.ID_DONACION DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_REPORTE_DONACIONES_ADMIN_FN;

    FUNCTION FIDE_REPORTE_ADOPCIONES_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  A.ID_ADOPCION,
                    A.FECHA_ADOPCION,
                    A.IDENTIFICACION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS ADOPTANTE,
                    A.ID_SOLICITUD,
                    A.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    NVL(SG.TOTAL_SEGUIMIENTOS, 0) AS TOTAL_SEGUIMIENTOS,
                    NVL(SG.SEGUIMIENTOS_ACTIVOS, 0) AS SEGUIMIENTOS_ACTIVOS,
                    NVL(SG.SEGUIMIENTOS_VENCIDOS, 0) AS SEGUIMIENTOS_VENCIDOS,
                    A.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_ADOPCION_TB A
            JOIN FIDE_USUARIO_TB U ON A.IDENTIFICACION = U.IDENTIFICACION
            JOIN FIDE_PERRITO_TB P ON A.ID_PERRITO = P.ID_PERRITO
            JOIN FIDE_ESTADO_TB E ON A.ID_ESTADO = E.ID_ESTADO
            LEFT JOIN (
                SELECT  S.ID_ADOPCION,
                        COUNT(*) AS TOTAL_SEGUIMIENTOS,
                        SUM(CASE WHEN S.ID_ESTADO = 1 THEN 1 ELSE 0 END) AS SEGUIMIENTOS_ACTIVOS,
                        SUM(
                            CASE
                                WHEN S.ID_ESTADO = 1
                                 AND TRUNC(S.FECHA_FIN) < TRUNC(SYSDATE)
                                THEN 1
                                ELSE 0
                            END
                        ) AS SEGUIMIENTOS_VENCIDOS
                FROM FIDE_SEGUIMIENTO_TB S
                GROUP BY S.ID_ADOPCION
            ) SG ON A.ID_ADOPCION = SG.ID_ADOPCION
            ORDER BY A.FECHA_ADOPCION DESC, A.ID_ADOPCION DESC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_REPORTE_ADOPCIONES_ADMIN_FN;

    FUNCTION FIDE_REPORTE_INVENTARIO_BAJO_FN(
        P_STOCK_MINIMO IN NUMBER DEFAULT 10
    )
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  I.ID_INVENTARIO,
                    I.ID_PRODUCTO,
                    P.NOMBRE AS PRODUCTO,
                    C.NOMBRE AS CATEGORIA,
                    M.NOMBRE AS MARCA,
                    I.CANTIDAD,
                    P.PRECIO,
                    NVL(I.CANTIDAD, 0) * NVL(P.PRECIO, 0) AS VALOR_ESTIMADO,
                    I.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_INVENTARIO_TB I
            JOIN FIDE_PRODUCTO_TB P ON I.ID_PRODUCTO = P.ID_PRODUCTO
            JOIN FIDE_CATEGORIA_TB C ON P.ID_CATEGORIA = C.ID_CATEGORIA
            JOIN FIDE_MARCA_TB M ON P.ID_MARCA = M.ID_MARCA
            JOIN FIDE_ESTADO_TB E ON I.ID_ESTADO = E.ID_ESTADO
            WHERE I.ID_ESTADO = 1
              AND P.ID_ESTADO = 1
              AND NVL(I.CANTIDAD, 0) <= NVL(P_STOCK_MINIMO, 10)
            ORDER BY I.CANTIDAD ASC, P.NOMBRE ASC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_REPORTE_INVENTARIO_BAJO_FN;

    FUNCTION FIDE_ALERTAS_SEGUIMIENTO_ADMIN_FN
    RETURN SYS_REFCURSOR
    IS
        V_CURSOR_RESULTADO SYS_REFCURSOR;
    BEGIN
        OPEN V_CURSOR_RESULTADO FOR
            SELECT  S.ID_SEGUIMIENTO,
                    S.ID_ADOPCION,
                    A.IDENTIFICACION,
                    U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS ADOPTANTE,
                    A.ID_PERRITO,
                    P.NOMBRE AS NOMBRE_PERRITO,
                    S.ID_TIPO_SEGUIMIENTO,
                    TS.NOMBRE AS TIPO_SEGUIMIENTO,
                    S.FECHA_FIN,
                    NVL(EV.CANTIDAD_EVIDENCIAS, 0) AS CANTIDAD_EVIDENCIAS,
                    CASE
                        WHEN TRUNC(S.FECHA_FIN) < TRUNC(SYSDATE) THEN 'vencido'
                        WHEN TRUNC(S.FECHA_FIN) = TRUNC(SYSDATE) THEN 'vence_hoy'
                        ELSE 'proximo'
                    END AS PRIORIDAD,
                    TRUNC(S.FECHA_FIN) - TRUNC(SYSDATE) AS DIAS_RESTANTES,
                    S.ID_ESTADO,
                    E.NOMBRE_ESTADO AS ESTADO
            FROM FIDE_SEGUIMIENTO_TB S
            JOIN FIDE_ADOPCION_TB A ON S.ID_ADOPCION = A.ID_ADOPCION
            JOIN FIDE_USUARIO_TB U ON A.IDENTIFICACION = U.IDENTIFICACION
            JOIN FIDE_PERRITO_TB P ON A.ID_PERRITO = P.ID_PERRITO
            JOIN FIDE_TIPO_SEGUIMIENTO_TB TS ON S.ID_TIPO_SEGUIMIENTO = TS.ID_TIPO_SEGUIMIENTO
            JOIN FIDE_ESTADO_TB E ON S.ID_ESTADO = E.ID_ESTADO
            LEFT JOIN (
                SELECT  EV.ID_SEGUIMIENTO,
                        COUNT(*) AS CANTIDAD_EVIDENCIAS
                FROM FIDE_EVIDENCIA_TB EV
                WHERE EV.ID_ESTADO = 1
                GROUP BY EV.ID_SEGUIMIENTO
            ) EV ON S.ID_SEGUIMIENTO = EV.ID_SEGUIMIENTO
            WHERE S.ID_ESTADO = 1
              AND TRUNC(S.FECHA_FIN) <= TRUNC(SYSDATE) + 7
            ORDER BY CASE
                        WHEN TRUNC(S.FECHA_FIN) < TRUNC(SYSDATE) THEN 1
                        WHEN TRUNC(S.FECHA_FIN) = TRUNC(SYSDATE) THEN 2
                        ELSE 3
                     END,
                     S.FECHA_FIN ASC,
                     S.ID_SEGUIMIENTO ASC;

        RETURN V_CURSOR_RESULTADO;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No se encontraron datos con el ID indicado.');
        WHEN TOO_MANY_ROWS THEN
            RAISE_APPLICATION_ERROR(-20005, 'Se encontraron datos duplicados.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END FIDE_ALERTAS_SEGUIMIENTO_ADMIN_FN;

    /* PROCEDURE FIDE_ESTADO_TB INSERT */

    PROCEDURE FIDE_ESTADO_INSERT_SP(
        P_NOMBRE_ESTADO IN FIDE_ESTADO_TB.NOMBRE_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_ESTADO_TB (
            NOMBRE_ESTADO
        )
        VALUES (
            P_NOMBRE_ESTADO
        );

        COMMIT;
    
    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El ID ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_ESTADO_TB UPDATE */

    PROCEDURE FIDE_ESTADO_UPDATE_SP(
        P_ID_ESTADO IN FIDE_ESTADO_TB.ID_ESTADO%TYPE,
        P_NOMBRE_ESTADO IN FIDE_ESTADO_TB.NOMBRE_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN
        UPDATE FIDE_ESTADO_TB
        SET
            NOMBRE_ESTADO = P_NOMBRE_ESTADO
        WHERE ID_ESTADO = P_ID_ESTADO;
    
        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el estado con ese ID.');
        END IF;
    
        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_ESTADO_TB DELETE */

    PROCEDURE FIDE_ESTADO_DELETE_SP(
        P_ID_ESTADO IN FIDE_ESTADO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_DELETE NUMBER;
        E_ESTADO_EN_USO EXCEPTION;
        PRAGMA EXCEPTION_INIT(E_ESTADO_EN_USO, -2292);
    BEGIN
        DELETE FROM FIDE_ESTADO_TB
        WHERE ID_ESTADO = P_ID_ESTADO;

        V_HAY_DELETE := SQL%ROWCOUNT;

        IF V_HAY_DELETE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el estado con ese ID.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN E_ESTADO_EN_USO THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(
                -20005,
                'No se puede eliminar el estado porque está siendo utilizado por otros registros.'
            );
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TIPO_USUARIO_TB INSERT */

    PROCEDURE FIDE_TIPO_USUARIO_INSERT_SP(
        P_NOMBRE   IN FIDE_TIPO_USUARIO_TB.NOMBRE%TYPE,
        P_ID_ESTADO       IN FIDE_TIPO_USUARIO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_TIPO_USUARIO_TB (
            NOMBRE,
            ID_ESTADO
        )
        VALUES (
            P_NOMBRE,
            P_ID_ESTADO
        );

        COMMIT;
    
    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El ID ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TIPO_USUARIO_TB UPDATE */

    PROCEDURE FIDE_TIPO_USUARIO_UPDATE_SP(
        P_ID_TIPO_USUARIO IN FIDE_TIPO_USUARIO_TB.ID_TIPO_USUARIO%TYPE,
        P_NOMBRE          IN FIDE_TIPO_USUARIO_TB.NOMBRE%TYPE,
        P_ID_ESTADO       IN FIDE_TIPO_USUARIO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN
        UPDATE FIDE_TIPO_USUARIO_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_TIPO_USUARIO = P_ID_TIPO_USUARIO;
    
        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el tipo de usuario con ese ID.');
        END IF;
    
        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TIPO_USUARIO_TB DELETE LOGICO */

    PROCEDURE FIDE_TIPO_USUARIO_DELETE_SP(
        P_ID_TIPO_USUARIO IN FIDE_TIPO_USUARIO_TB.ID_TIPO_USUARIO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN
        UPDATE FIDE_TIPO_USUARIO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_TIPO_USUARIO = P_ID_TIPO_USUARIO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el tipo de usuario o ya está eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_USUARIO_TB INSERT */

    PROCEDURE FIDE_USUARIO_INSERT_SP(
        P_IDENTIFICACION     IN FIDE_USUARIO_TB.IDENTIFICACION%TYPE,
        P_NOMBRE             IN FIDE_USUARIO_TB.NOMBRE%TYPE,
        P_APELLIDO_PATERNO   IN FIDE_USUARIO_TB.APELLIDO_PATERNO%TYPE,
        P_APELLIDO_MATERNO   IN FIDE_USUARIO_TB.APELLIDO_MATERNO%TYPE,
        P_ID_DIRECCION       IN FIDE_USUARIO_TB.ID_DIRECCION%TYPE,
        P_ID_TIPO_USUARIO    IN FIDE_USUARIO_TB.ID_TIPO_USUARIO%TYPE,
        P_ID_ESTADO          IN FIDE_USUARIO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_USUARIO_TB(
            IDENTIFICACION,
            NOMBRE,
            APELLIDO_PATERNO,
            APELLIDO_MATERNO,
            ID_DIRECCION,
            ID_TIPO_USUARIO,
            ID_ESTADO
        )
        VALUES(
            P_IDENTIFICACION,
            P_NOMBRE,
            P_APELLIDO_PATERNO,
            P_APELLIDO_MATERNO,
            P_ID_DIRECCION,
            P_ID_TIPO_USUARIO,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La identificación ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_USUARIO_TB UPDATE */

    PROCEDURE FIDE_USUARIO_UPDATE_SP(
        P_IDENTIFICACION     IN FIDE_USUARIO_TB.IDENTIFICACION%TYPE,
        P_NOMBRE             IN FIDE_USUARIO_TB.NOMBRE%TYPE,
        P_APELLIDO_PATERNO   IN FIDE_USUARIO_TB.APELLIDO_PATERNO%TYPE,
        P_APELLIDO_MATERNO   IN FIDE_USUARIO_TB.APELLIDO_MATERNO%TYPE,
        P_ID_DIRECCION       IN FIDE_USUARIO_TB.ID_DIRECCION%TYPE,
        P_ID_TIPO_USUARIO    IN FIDE_USUARIO_TB.ID_TIPO_USUARIO%TYPE,
        P_ID_ESTADO          IN FIDE_USUARIO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_USUARIO_TB
        SET
            NOMBRE = P_NOMBRE,
            APELLIDO_PATERNO = P_APELLIDO_PATERNO,
            APELLIDO_MATERNO = P_APELLIDO_MATERNO,
            ID_DIRECCION = P_ID_DIRECCION,
            ID_TIPO_USUARIO = P_ID_TIPO_USUARIO,
            ID_ESTADO = P_ID_ESTADO
        WHERE IDENTIFICACION = P_IDENTIFICACION;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el usuario con esa identificación.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_USUARIO_TB DELETE LOGICO */

    PROCEDURE FIDE_USUARIO_DELETE_SP(
        P_IDENTIFICACION IN FIDE_USUARIO_TB.IDENTIFICACION%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_USUARIO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE IDENTIFICACION = P_IDENTIFICACION
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el usuario o ya está eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_CORREO_TB INSERT */

    PROCEDURE FIDE_CORREO_INSERT_SP(
        P_IDENTIFICACION IN FIDE_CORREO_TB.IDENTIFICACION%TYPE,
        P_CORREO         IN FIDE_CORREO_TB.CORREO%TYPE,
        P_ID_ESTADO      IN FIDE_CORREO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_CORREO_TB(
            IDENTIFICACION,
            CORREO,
            ID_ESTADO
        )
        VALUES(
            P_IDENTIFICACION,
            P_CORREO,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El correo ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_CORREO_TB UPDATE */

    PROCEDURE FIDE_CORREO_UPDATE_SP(
        P_IDENTIFICACION IN FIDE_CORREO_TB.IDENTIFICACION%TYPE,
        P_CORREO         IN FIDE_CORREO_TB.CORREO%TYPE,
        P_ID_ESTADO      IN FIDE_CORREO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_CORREO_TB
        SET ID_ESTADO = P_ID_ESTADO
        WHERE IDENTIFICACION = P_IDENTIFICACION
        AND CORREO = P_CORREO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el correo.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_CORREO_TB DELETE LOGICO */

    PROCEDURE FIDE_CORREO_DELETE_SP(
        P_IDENTIFICACION IN FIDE_CORREO_TB.IDENTIFICACION%TYPE,
        P_CORREO         IN FIDE_CORREO_TB.CORREO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_CORREO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE IDENTIFICACION = P_IDENTIFICACION
        AND CORREO = P_CORREO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el correo o ya está eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TELEFONO_TB INSERT */

    PROCEDURE FIDE_TELEFONO_INSERT_SP(
        P_IDENTIFICACION IN FIDE_TELEFONO_TB.IDENTIFICACION%TYPE,
        P_TELEFONO       IN FIDE_TELEFONO_TB.TELEFONO%TYPE,
        P_ID_ESTADO      IN FIDE_TELEFONO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_TELEFONO_TB(
            IDENTIFICACION,
            TELEFONO,
            ID_ESTADO
        )
        VALUES(
            P_IDENTIFICACION,
            P_TELEFONO,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El teléfono ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TELEFONO_TB UPDATE */

    PROCEDURE FIDE_TELEFONO_UPDATE_SP(
        P_IDENTIFICACION IN FIDE_TELEFONO_TB.IDENTIFICACION%TYPE,
        P_TELEFONO       IN FIDE_TELEFONO_TB.TELEFONO%TYPE,
        P_ID_ESTADO      IN FIDE_TELEFONO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_TELEFONO_TB
        SET ID_ESTADO = P_ID_ESTADO
        WHERE IDENTIFICACION = P_IDENTIFICACION
        AND TELEFONO = P_TELEFONO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el teléfono.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TELEFONO_TB DELETE LOGICO */

    PROCEDURE FIDE_TELEFONO_DELETE_SP(
        P_IDENTIFICACION IN FIDE_TELEFONO_TB.IDENTIFICACION%TYPE,
        P_TELEFONO       IN FIDE_TELEFONO_TB.TELEFONO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_TELEFONO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE IDENTIFICACION = P_IDENTIFICACION
        AND TELEFONO = P_TELEFONO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el teléfono o ya está eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_CUENTA_TB INSERT */

    PROCEDURE FIDE_CUENTA_INSERT_SP(
        P_IDENTIFICACION   IN FIDE_CUENTA_TB.IDENTIFICACION%TYPE,
        P_USUARIO          IN FIDE_CUENTA_TB.USUARIO%TYPE,
        P_PASSWORD_HASH    IN FIDE_CUENTA_TB.PASSWORD_HASH%TYPE,
        P_ID_ESTADO        IN FIDE_CUENTA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_CUENTA_TB(
            IDENTIFICACION,
            USUARIO,
            PASSWORD_HASH,
            ID_ESTADO
        )
        VALUES(
            P_IDENTIFICACION,
            P_USUARIO,
            P_PASSWORD_HASH,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La cuenta ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_CUENTA_TB UPDATE */

    PROCEDURE FIDE_CUENTA_UPDATE_SP(
        P_ID_CUENTA        IN FIDE_CUENTA_TB.ID_CUENTA%TYPE,
        P_IDENTIFICACION   IN FIDE_CUENTA_TB.IDENTIFICACION%TYPE,
        P_USUARIO          IN FIDE_CUENTA_TB.USUARIO%TYPE,
        P_PASSWORD_HASH    IN FIDE_CUENTA_TB.PASSWORD_HASH%TYPE,
        P_ID_ESTADO        IN FIDE_CUENTA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_CUENTA_TB
        SET
            IDENTIFICACION = P_IDENTIFICACION,
            USUARIO = P_USUARIO,
            PASSWORD_HASH = P_PASSWORD_HASH,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_CUENTA = P_ID_CUENTA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la cuenta con ese ID.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_CUENTA_TB DELETE LOGICO */

    PROCEDURE FIDE_CUENTA_DELETE_SP(
        P_ID_CUENTA IN FIDE_CUENTA_TB.ID_CUENTA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_CUENTA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_CUENTA = P_ID_CUENTA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la cuenta o ya está eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TIPO_OTP_TB INSERT */

    PROCEDURE FIDE_TIPO_OTP_INSERT_SP(
        P_NOMBRE      IN FIDE_TIPO_OTP_TB.NOMBRE%TYPE,
        P_ID_ESTADO   IN FIDE_TIPO_OTP_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_TIPO_OTP_TB(
            NOMBRE,
            ID_ESTADO
        )
        VALUES(
            P_NOMBRE,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El tipo OTP ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TIPO_OTP_TB UPDATE */

    PROCEDURE FIDE_TIPO_OTP_UPDATE_SP(
        P_ID_TIPO_OTP IN FIDE_TIPO_OTP_TB.ID_TIPO_OTP%TYPE,
        P_NOMBRE      IN FIDE_TIPO_OTP_TB.NOMBRE%TYPE,
        P_ID_ESTADO   IN FIDE_TIPO_OTP_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_TIPO_OTP_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_TIPO_OTP = P_ID_TIPO_OTP;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el tipo OTP.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TIPO_OTP_TB DELETE LOGICO */

    PROCEDURE FIDE_TIPO_OTP_DELETE_SP(
        P_ID_TIPO_OTP IN FIDE_TIPO_OTP_TB.ID_TIPO_OTP%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_TIPO_OTP_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_TIPO_OTP = P_ID_TIPO_OTP
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el tipo OTP o ya está eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_CODIGO_OTP_TB INSERT */

    PROCEDURE FIDE_CODIGO_OTP_INSERT_SP(
        P_ID_CUENTA         IN FIDE_CODIGO_OTP_TB.ID_CUENTA%TYPE,
        P_ID_TIPO_OTP       IN FIDE_CODIGO_OTP_TB.ID_TIPO_OTP%TYPE,
        P_CODIGO_HASH       IN FIDE_CODIGO_OTP_TB.CODIGO_HASH%TYPE,
        P_FECHA_EXPIRACION  IN FIDE_CODIGO_OTP_TB.FECHA_EXPIRACION%TYPE,
        P_FECHA_USO         IN FIDE_CODIGO_OTP_TB.FECHA_USO%TYPE,
        P_INTENTOS          IN FIDE_CODIGO_OTP_TB.INTENTOS%TYPE,
        P_FECHA_CREACION    IN FIDE_CODIGO_OTP_TB.FECHA_CREACION%TYPE,
        P_ID_ESTADO         IN FIDE_CODIGO_OTP_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_CODIGO_OTP_TB(
            ID_CUENTA,
            ID_TIPO_OTP,
            CODIGO_HASH,
            FECHA_EXPIRACION,
            FECHA_USO,
            INTENTOS,
            FECHA_CREACION,
            ID_ESTADO
        )
        VALUES(
            P_ID_CUENTA,
            P_ID_TIPO_OTP,
            P_CODIGO_HASH,
            P_FECHA_EXPIRACION,
            P_FECHA_USO,
            P_INTENTOS,
            P_FECHA_CREACION,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El código OTP ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_CODIGO_OTP_TB UPDATE */

    PROCEDURE FIDE_CODIGO_OTP_UPDATE_SP(
        P_ID_CODIGO_OTP     IN FIDE_CODIGO_OTP_TB.ID_CODIGO_OTP%TYPE,
        P_ID_CUENTA         IN FIDE_CODIGO_OTP_TB.ID_CUENTA%TYPE,
        P_ID_TIPO_OTP       IN FIDE_CODIGO_OTP_TB.ID_TIPO_OTP%TYPE,
        P_CODIGO_HASH       IN FIDE_CODIGO_OTP_TB.CODIGO_HASH%TYPE,
        P_FECHA_EXPIRACION  IN FIDE_CODIGO_OTP_TB.FECHA_EXPIRACION%TYPE,
        P_FECHA_USO         IN FIDE_CODIGO_OTP_TB.FECHA_USO%TYPE,
        P_INTENTOS          IN FIDE_CODIGO_OTP_TB.INTENTOS%TYPE,
        P_FECHA_CREACION    IN FIDE_CODIGO_OTP_TB.FECHA_CREACION%TYPE,
        P_ID_ESTADO         IN FIDE_CODIGO_OTP_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_CODIGO_OTP_TB
        SET
            ID_CUENTA = P_ID_CUENTA,
            ID_TIPO_OTP = P_ID_TIPO_OTP,
            CODIGO_HASH = P_CODIGO_HASH,
            FECHA_EXPIRACION = P_FECHA_EXPIRACION,
            FECHA_USO = P_FECHA_USO,
            INTENTOS = P_INTENTOS,
            FECHA_CREACION = P_FECHA_CREACION,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_CODIGO_OTP = P_ID_CODIGO_OTP;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el código OTP.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_CODIGO_OTP_TB DELETE LOGICO */

    PROCEDURE FIDE_CODIGO_OTP_DELETE_SP(
        P_ID_CODIGO_OTP IN FIDE_CODIGO_OTP_TB.ID_CODIGO_OTP%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_CODIGO_OTP_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_CODIGO_OTP = P_ID_CODIGO_OTP
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el OTP o ya está eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_REFRESH_TOKEN_TB INSERT */

    PROCEDURE FIDE_REFRESH_TOKEN_INSERT_SP(
        P_ID_CUENTA          IN FIDE_REFRESH_TOKEN_TB.ID_CUENTA%TYPE,
        P_TOKEN_HASH         IN FIDE_REFRESH_TOKEN_TB.TOKEN_HASH%TYPE,
        P_JTI                IN FIDE_REFRESH_TOKEN_TB.JTI%TYPE,
        P_IP_ADDRESS         IN FIDE_REFRESH_TOKEN_TB.IP_ADDRESS%TYPE,
        P_USER_AGENT         IN FIDE_REFRESH_TOKEN_TB.USER_AGENT%TYPE,
        P_FECHA_EXPIRACION   IN FIDE_REFRESH_TOKEN_TB.FECHA_EXPIRACION%TYPE,
        P_FECHA_REVOCACION   IN FIDE_REFRESH_TOKEN_TB.FECHA_REVOCACION%TYPE,
        P_ID_ESTADO          IN FIDE_REFRESH_TOKEN_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_REFRESH_TOKEN_TB(
            ID_CUENTA,
            TOKEN_HASH,
            JTI,
            IP_ADDRESS,
            USER_AGENT,
            FECHA_EXPIRACION,
            FECHA_REVOCACION,
            ID_ESTADO
        )
        VALUES(
            P_ID_CUENTA,
            P_TOKEN_HASH,
            P_JTI,
            P_IP_ADDRESS,
            P_USER_AGENT,
            P_FECHA_EXPIRACION,
            P_FECHA_REVOCACION,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El refresh token ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_REFRESH_TOKEN_TB UPDATE */

    PROCEDURE FIDE_REFRESH_TOKEN_UPDATE_SP(
        P_ID_REFRESH_TOKEN   IN FIDE_REFRESH_TOKEN_TB.ID_REFRESH_TOKEN%TYPE,
        P_ID_CUENTA          IN FIDE_REFRESH_TOKEN_TB.ID_CUENTA%TYPE,
        P_TOKEN_HASH         IN FIDE_REFRESH_TOKEN_TB.TOKEN_HASH%TYPE,
        P_JTI                IN FIDE_REFRESH_TOKEN_TB.JTI%TYPE,
        P_IP_ADDRESS         IN FIDE_REFRESH_TOKEN_TB.IP_ADDRESS%TYPE,
        P_USER_AGENT         IN FIDE_REFRESH_TOKEN_TB.USER_AGENT%TYPE,
        P_FECHA_EXPIRACION   IN FIDE_REFRESH_TOKEN_TB.FECHA_EXPIRACION%TYPE,
        P_FECHA_REVOCACION   IN FIDE_REFRESH_TOKEN_TB.FECHA_REVOCACION%TYPE,
        P_ID_ESTADO          IN FIDE_REFRESH_TOKEN_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_REFRESH_TOKEN_TB
        SET
            ID_CUENTA = P_ID_CUENTA,
            TOKEN_HASH = P_TOKEN_HASH,
            JTI = P_JTI,
            IP_ADDRESS = P_IP_ADDRESS,
            USER_AGENT = P_USER_AGENT,
            FECHA_EXPIRACION = P_FECHA_EXPIRACION,
            FECHA_REVOCACION = P_FECHA_REVOCACION,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_REFRESH_TOKEN = P_ID_REFRESH_TOKEN;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el refresh token.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_REFRESH_TOKEN_TB DELETE LOGICO */

    PROCEDURE FIDE_REFRESH_TOKEN_DELETE_SP(
        P_ID_REFRESH_TOKEN IN FIDE_REFRESH_TOKEN_TB.ID_REFRESH_TOKEN%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_REFRESH_TOKEN_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_REFRESH_TOKEN = P_ID_REFRESH_TOKEN
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el token o ya está eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_PAIS_TB INSERT */

    PROCEDURE FIDE_PAIS_INSERT_SP(
        P_NOMBRE     IN FIDE_PAIS_TB.NOMBRE%TYPE,
        P_ID_ESTADO  IN FIDE_PAIS_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_PAIS_TB(
            NOMBRE,
            ID_ESTADO
        )
        VALUES(
            P_NOMBRE,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El país ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_PAIS_TB UPDATE */

    PROCEDURE FIDE_PAIS_UPDATE_SP(
        P_ID_PAIS    IN FIDE_PAIS_TB.ID_PAIS%TYPE,
        P_NOMBRE     IN FIDE_PAIS_TB.NOMBRE%TYPE,
        P_ID_ESTADO  IN FIDE_PAIS_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_PAIS_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_PAIS = P_ID_PAIS;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el país.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_PAIS_TB DELETE LOGICO */

    PROCEDURE FIDE_PAIS_DELETE_SP(
        P_ID_PAIS IN FIDE_PAIS_TB.ID_PAIS%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_PAIS_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_PAIS = P_ID_PAIS
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el país o ya está eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_PROVINCIA_TB INSERT */

    PROCEDURE FIDE_PROVINCIA_INSERT_SP(
        P_NOMBRE       IN FIDE_PROVINCIA_TB.NOMBRE%TYPE,
        P_ID_PAIS      IN FIDE_PROVINCIA_TB.ID_PAIS%TYPE,
        P_ID_ESTADO    IN FIDE_PROVINCIA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_PROVINCIA_TB(
            NOMBRE,
            ID_PAIS,
            ID_ESTADO
        )
        VALUES(
            P_NOMBRE,
            P_ID_PAIS,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La provincia ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_PROVINCIA_TB UPDATE */

    PROCEDURE FIDE_PROVINCIA_UPDATE_SP(
        P_ID_PROVINCIA IN FIDE_PROVINCIA_TB.ID_PROVINCIA%TYPE,
        P_NOMBRE       IN FIDE_PROVINCIA_TB.NOMBRE%TYPE,
        P_ID_PAIS      IN FIDE_PROVINCIA_TB.ID_PAIS%TYPE,
        P_ID_ESTADO    IN FIDE_PROVINCIA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_PROVINCIA_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_PAIS = P_ID_PAIS,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_PROVINCIA = P_ID_PROVINCIA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la provincia.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_PROVINCIA_TB DELETE LOGICO */

    PROCEDURE FIDE_PROVINCIA_DELETE_SP(
        P_ID_PROVINCIA IN FIDE_PROVINCIA_TB.ID_PROVINCIA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_PROVINCIA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_PROVINCIA = P_ID_PROVINCIA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la provincia o ya está eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_CANTON_TB INSERT */

    PROCEDURE FIDE_CANTON_INSERT_SP(
        P_NOMBRE        IN FIDE_CANTON_TB.NOMBRE%TYPE,
        P_ID_PROVINCIA  IN FIDE_CANTON_TB.ID_PROVINCIA%TYPE,
        P_ID_ESTADO     IN FIDE_CANTON_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_CANTON_TB(
            NOMBRE,
            ID_PROVINCIA,
            ID_ESTADO
        )
        VALUES(
            P_NOMBRE,
            P_ID_PROVINCIA,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El cantón ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_CANTON_TB UPDATE */

    PROCEDURE FIDE_CANTON_UPDATE_SP(
        P_ID_CANTON     IN FIDE_CANTON_TB.ID_CANTON%TYPE,
        P_NOMBRE        IN FIDE_CANTON_TB.NOMBRE%TYPE,
        P_ID_PROVINCIA  IN FIDE_CANTON_TB.ID_PROVINCIA%TYPE,
        P_ID_ESTADO     IN FIDE_CANTON_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_CANTON_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_PROVINCIA = P_ID_PROVINCIA,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_CANTON = P_ID_CANTON;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el cantón.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_CANTON_TB DELETE LOGICO */

    PROCEDURE FIDE_CANTON_DELETE_SP(
        P_ID_CANTON IN FIDE_CANTON_TB.ID_CANTON%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_CANTON_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_CANTON = P_ID_CANTON
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el cantón o ya está eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_DISTRITO_TB INSERT */

    PROCEDURE FIDE_DISTRITO_INSERT_SP(
        P_NOMBRE       IN FIDE_DISTRITO_TB.NOMBRE%TYPE,
        P_ID_CANTON    IN FIDE_DISTRITO_TB.ID_CANTON%TYPE,
        P_ID_ESTADO    IN FIDE_DISTRITO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_DISTRITO_TB(
            NOMBRE,
            ID_CANTON,
            ID_ESTADO
        )
        VALUES(
            P_NOMBRE,
            P_ID_CANTON,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El distrito ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_DISTRITO_TB UPDATE */

    PROCEDURE FIDE_DISTRITO_UPDATE_SP(
        P_ID_DISTRITO  IN FIDE_DISTRITO_TB.ID_DISTRITO%TYPE,
        P_NOMBRE       IN FIDE_DISTRITO_TB.NOMBRE%TYPE,
        P_ID_CANTON    IN FIDE_DISTRITO_TB.ID_CANTON%TYPE,
        P_ID_ESTADO    IN FIDE_DISTRITO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_DISTRITO_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_CANTON = P_ID_CANTON,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_DISTRITO = P_ID_DISTRITO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el distrito.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_DISTRITO_TB DELETE LOGICO */

    PROCEDURE FIDE_DISTRITO_DELETE_SP(
        P_ID_DISTRITO IN FIDE_DISTRITO_TB.ID_DISTRITO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_DISTRITO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_DISTRITO = P_ID_DISTRITO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el distrito o ya está eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_DIRECCION_TB INSERT */

    PROCEDURE FIDE_DIRECCION_INSERT_SP(
        P_ID_DISTRITO  IN FIDE_DIRECCION_TB.ID_DISTRITO%TYPE,
        P_CALLE        IN FIDE_DIRECCION_TB.CALLE%TYPE,
        P_NUMERO       IN FIDE_DIRECCION_TB.NUMERO%TYPE,
        P_ID_ESTADO    IN FIDE_DIRECCION_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_DIRECCION_TB(
            ID_DISTRITO,
            CALLE,
            NUMERO,
            ID_ESTADO
        )
        VALUES(
            P_ID_DISTRITO,
            P_CALLE,
            P_NUMERO,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La dirección ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_DIRECCION_TB UPDATE */

    PROCEDURE FIDE_DIRECCION_UPDATE_SP(
        P_ID_DIRECCION IN FIDE_DIRECCION_TB.ID_DIRECCION%TYPE,
        P_ID_DISTRITO  IN FIDE_DIRECCION_TB.ID_DISTRITO%TYPE,
        P_CALLE        IN FIDE_DIRECCION_TB.CALLE%TYPE,
        P_NUMERO       IN FIDE_DIRECCION_TB.NUMERO%TYPE,
        P_ID_ESTADO    IN FIDE_DIRECCION_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_DIRECCION_TB
        SET
            ID_DISTRITO = P_ID_DISTRITO,
            CALLE = P_CALLE,
            NUMERO = P_NUMERO,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_DIRECCION = P_ID_DIRECCION;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la dirección.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_DIRECCION_TB DELETE LOGICO */

    PROCEDURE FIDE_DIRECCION_DELETE_SP(
        P_ID_DIRECCION IN FIDE_DIRECCION_TB.ID_DIRECCION%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_DIRECCION_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_DIRECCION = P_ID_DIRECCION
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la dirección o ya está eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_CATEGORIA_TB INSERT */

    PROCEDURE FIDE_CATEGORIA_INSERT_SP(
        P_NOMBRE       IN FIDE_CATEGORIA_TB.NOMBRE%TYPE,
        P_ID_ESTADO    IN FIDE_CATEGORIA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_CATEGORIA_TB(
            NOMBRE,
            ID_ESTADO
        )
        VALUES(
            P_NOMBRE,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La categoría ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_CATEGORIA_TB UPDATE */

    PROCEDURE FIDE_CATEGORIA_UPDATE_SP(
        P_ID_CATEGORIA IN FIDE_CATEGORIA_TB.ID_CATEGORIA%TYPE,
        P_NOMBRE       IN FIDE_CATEGORIA_TB.NOMBRE%TYPE,
        P_ID_ESTADO    IN FIDE_CATEGORIA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_CATEGORIA_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_CATEGORIA = P_ID_CATEGORIA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la categoría.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_CATEGORIA_TB DELETE LOGICO */

    PROCEDURE FIDE_CATEGORIA_DELETE_SP(
        P_ID_CATEGORIA IN FIDE_CATEGORIA_TB.ID_CATEGORIA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_CATEGORIA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_CATEGORIA = P_ID_CATEGORIA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la categoría o ya está eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_MARCA_TB INSERT */

    PROCEDURE FIDE_MARCA_INSERT_SP(
        P_NOMBRE       IN FIDE_MARCA_TB.NOMBRE%TYPE,
        P_ID_ESTADO    IN FIDE_MARCA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_MARCA_TB(
            NOMBRE,
            ID_ESTADO
        )
        VALUES(
            P_NOMBRE,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La marca ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_MARCA_TB UPDATE */

    PROCEDURE FIDE_MARCA_UPDATE_SP(
        P_ID_MARCA     IN FIDE_MARCA_TB.ID_MARCA%TYPE,
        P_NOMBRE       IN FIDE_MARCA_TB.NOMBRE%TYPE,
        P_ID_ESTADO    IN FIDE_MARCA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_MARCA_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_MARCA = P_ID_MARCA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la marca.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_MARCA_TB DELETE LOGICO */

    PROCEDURE FIDE_MARCA_DELETE_SP(
        P_ID_MARCA IN FIDE_MARCA_TB.ID_MARCA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_MARCA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_MARCA = P_ID_MARCA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la marca o ya está eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_PRODUCTO_TB INSERT */

    PROCEDURE FIDE_PRODUCTO_INSERT_SP(
        P_NOMBRE       IN FIDE_PRODUCTO_TB.NOMBRE%TYPE,
        P_DESCRIPCION  IN FIDE_PRODUCTO_TB.DESCRIPCION%TYPE,
        P_PRECIO       IN FIDE_PRODUCTO_TB.PRECIO%TYPE,
        P_ID_CATEGORIA IN FIDE_PRODUCTO_TB.ID_CATEGORIA%TYPE,
        P_ID_MARCA     IN FIDE_PRODUCTO_TB.ID_MARCA%TYPE,
        P_ID_ESTADO    IN FIDE_PRODUCTO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_PRODUCTO_TB(
            NOMBRE,
            DESCRIPCION,
            PRECIO,
            ID_CATEGORIA,
            ID_MARCA,
            ID_ESTADO
        )
        VALUES(
            P_NOMBRE,
            P_DESCRIPCION,
            P_PRECIO,
            P_ID_CATEGORIA,
            P_ID_MARCA,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El producto ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_PRODUCTO_TB UPDATE */

    PROCEDURE FIDE_PRODUCTO_UPDATE_SP(
        P_ID_PRODUCTO  IN FIDE_PRODUCTO_TB.ID_PRODUCTO%TYPE,
        P_NOMBRE       IN FIDE_PRODUCTO_TB.NOMBRE%TYPE,
        P_DESCRIPCION  IN FIDE_PRODUCTO_TB.DESCRIPCION%TYPE,
        P_PRECIO       IN FIDE_PRODUCTO_TB.PRECIO%TYPE,
        P_ID_CATEGORIA IN FIDE_PRODUCTO_TB.ID_CATEGORIA%TYPE,
        P_ID_MARCA     IN FIDE_PRODUCTO_TB.ID_MARCA%TYPE,
        P_ID_ESTADO    IN FIDE_PRODUCTO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_PRODUCTO_TB
        SET
            NOMBRE = P_NOMBRE,
            DESCRIPCION = P_DESCRIPCION,
            PRECIO = P_PRECIO,
            ID_CATEGORIA = P_ID_CATEGORIA,
            ID_MARCA = P_ID_MARCA,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_PRODUCTO = P_ID_PRODUCTO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el producto.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_PRODUCTO_TB DELETE LOGICO */

    PROCEDURE FIDE_PRODUCTO_DELETE_SP(
        P_ID_PRODUCTO IN FIDE_PRODUCTO_TB.ID_PRODUCTO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_PRODUCTO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_PRODUCTO = P_ID_PRODUCTO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el producto o ya está eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_PRODUCTO_IMAGEN_TB INSERT */

    PROCEDURE FIDE_PRODUCTO_IMAGEN_INSERT_SP(
        P_ID_PRODUCTO IN FIDE_PRODUCTO_IMAGEN_TB.ID_PRODUCTO%TYPE,
        P_IMAGE_URL   IN FIDE_PRODUCTO_IMAGEN_TB.IMAGE_URL%TYPE,
        P_ID_ESTADO   IN FIDE_PRODUCTO_IMAGEN_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_PRODUCTO_IMAGEN_TB(
            ID_PRODUCTO,
            IMAGE_URL,
            ID_ESTADO
        )
        VALUES(
            P_ID_PRODUCTO,
            P_IMAGE_URL,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La imagen del producto ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_PRODUCTO_IMAGEN_TB UPDATE */

    PROCEDURE FIDE_PRODUCTO_IMAGEN_UPDATE_SP(
        P_ID_IMAGEN    IN FIDE_PRODUCTO_IMAGEN_TB.ID_IMAGEN%TYPE,
        P_ID_PRODUCTO IN FIDE_PRODUCTO_IMAGEN_TB.ID_PRODUCTO%TYPE,
        P_IMAGE_URL   IN FIDE_PRODUCTO_IMAGEN_TB.IMAGE_URL%TYPE,
        P_ID_ESTADO   IN FIDE_PRODUCTO_IMAGEN_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_PRODUCTO_IMAGEN_TB
        SET
            ID_PRODUCTO = P_ID_PRODUCTO,
            IMAGE_URL = P_IMAGE_URL,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_IMAGEN = P_ID_IMAGEN;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la imagen del producto.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_PRODUCTO_IMAGEN_TB DELETE LOGICO */

    PROCEDURE FIDE_PRODUCTO_IMAGEN_DELETE_SP(
        P_ID_IMAGEN IN FIDE_PRODUCTO_IMAGEN_TB.ID_IMAGEN%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_PRODUCTO_IMAGEN_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_IMAGEN = P_ID_IMAGEN
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la imagen del producto o ya está eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    FUNCTION FIDE_CALCULAR_TOTAL_VENTA_FN(
        P_ID_VENTA IN FIDE_VENTA_TB.ID_VENTA%TYPE
    )
    RETURN NUMBER
    IS
        V_TOTAL NUMBER := 0;
    BEGIN
        SELECT NVL(SUM(TOTAL), 0)
        INTO V_TOTAL
        FROM FIDE_VENTA_PRODUCTO_TB
        WHERE ID_VENTA = P_ID_VENTA
          AND ID_ESTADO = 1;

        RETURN ROUND(V_TOTAL, 2);
    END FIDE_CALCULAR_TOTAL_VENTA_FN;

    FUNCTION FIDE_CONTAR_FACTURAS_ACTIVAS_VENTA_FN(
        P_ID_VENTA IN FIDE_VENTA_TB.ID_VENTA%TYPE
    )
    RETURN NUMBER
    IS
        V_TOTAL NUMBER := 0;
    BEGIN
        SELECT COUNT(*)
        INTO V_TOTAL
        FROM FIDE_VENTA_FACTURA_TB VF
        JOIN FIDE_FACTURA_TB F ON VF.ID_FACTURA = F.ID_FACTURA
        WHERE VF.ID_VENTA = P_ID_VENTA
          AND VF.ID_ESTADO = 1
          AND F.ID_ESTADO = 1;

        RETURN V_TOTAL;
    END FIDE_CONTAR_FACTURAS_ACTIVAS_VENTA_FN;

    FUNCTION FIDE_ALPHA_NUMERIC_SEQ_FN
    RETURN VARCHAR2 AS
        V_FECHA VARCHAR2(10);
        V_LETRA CHAR(1);
        V_VALOR VARCHAR2(30);
    BEGIN
        V_FECHA := TO_CHAR(SYSDATE, 'DDMMYYY');
        V_LETRA := CHR(65 + TRUNC(DBMS_RANDOM.VALUE(0, 26)));
        V_VALOR := V_FECHA || '-' || LPAD(FIDE_FACTURA_SEQ.NEXTVAL, 7, '0') || '-' || V_LETRA;

        RETURN V_VALOR;
    END FIDE_ALPHA_NUMERIC_SEQ_FN;

    PROCEDURE FIDE_RECALCULAR_TOTAL_VENTA_PR(
        P_ID_VENTA IN FIDE_VENTA_TB.ID_VENTA%TYPE
    )
    IS
        V_TOTAL_VENTA FIDE_VENTA_TB.TOTAL_VENTA%TYPE;
    BEGIN
        V_TOTAL_VENTA := FIDE_CALCULAR_TOTAL_VENTA_FN(P_ID_VENTA);

        UPDATE FIDE_VENTA_TB
        SET TOTAL_VENTA = V_TOTAL_VENTA
        WHERE ID_VENTA = P_ID_VENTA;
    END FIDE_RECALCULAR_TOTAL_VENTA_PR;

    PROCEDURE FIDE_RECALCULAR_FACTURA_POR_ID_SP(
        P_ID_FACTURA IN FIDE_FACTURA_TB.ID_FACTURA%TYPE
    )
    IS
        V_TASA_IMPUESTO FIDE_FACTURA_TB.TASA_IMPUESTO_APLICADA%TYPE;
        V_TOTAL_VENTAS NUMBER := 0;
        V_TOTAL_DONACIONES NUMBER := 0;
        V_SUBTOTAL FIDE_FACTURA_TB.SUBTOTAL%TYPE;
        V_IMPUESTO FIDE_FACTURA_TB.IMPUESTO%TYPE;
    BEGIN
        SELECT NVL(TASA_IMPUESTO_APLICADA, 0.13)
        INTO V_TASA_IMPUESTO
        FROM FIDE_FACTURA_TB
        WHERE ID_FACTURA = P_ID_FACTURA;

        SELECT NVL(SUM(V.TOTAL_VENTA), 0)
        INTO V_TOTAL_VENTAS
        FROM FIDE_VENTA_FACTURA_TB VF
        JOIN FIDE_VENTA_TB V ON VF.ID_VENTA = V.ID_VENTA
        WHERE VF.ID_FACTURA = P_ID_FACTURA
          AND VF.ID_ESTADO = 1
          AND V.ID_ESTADO = 1;

        SELECT NVL(SUM(D.MONTO), 0)
        INTO V_TOTAL_DONACIONES
        FROM FIDE_DONACION_FACTURA_TB DF
        JOIN FIDE_DONACION_TB D ON DF.ID_DONACION = D.ID_DONACION
        WHERE DF.ID_FACTURA = P_ID_FACTURA
          AND DF.ID_ESTADO = 1
          AND D.ID_ESTADO = 1;

        V_SUBTOTAL := ROUND(V_TOTAL_VENTAS + V_TOTAL_DONACIONES, 2);
        V_IMPUESTO := ROUND(V_SUBTOTAL * V_TASA_IMPUESTO, 2);

        UPDATE FIDE_FACTURA_TB
        SET SUBTOTAL = V_SUBTOTAL,
            IMPUESTO = V_IMPUESTO,
            TOTAL = ROUND(V_SUBTOTAL + V_IMPUESTO, 2)
        WHERE ID_FACTURA = P_ID_FACTURA;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la factura.');
    END FIDE_RECALCULAR_FACTURA_POR_ID_SP;

    /* PROCEDURE FIDE_VENTA_TB INSERT */

    PROCEDURE FIDE_VENTA_INSERT_SP(
        P_IDENTIFICACION  IN FIDE_VENTA_TB.IDENTIFICACION%TYPE,
        P_TOTAL_VENTA     IN FIDE_VENTA_TB.TOTAL_VENTA%TYPE,
        P_FECHA_VENTA     IN FIDE_VENTA_TB.FECHA_VENTA%TYPE,
        P_ID_ESTADO       IN FIDE_VENTA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_VENTA_TB(
            IDENTIFICACION,
            TOTAL_VENTA,
            FECHA_VENTA,
            ID_ESTADO
        )
        VALUES(
            P_IDENTIFICACION,
            0,
            P_FECHA_VENTA,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La venta ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_VENTA_TB UPDATE */

    PROCEDURE FIDE_VENTA_UPDATE_SP(
        P_ID_VENTA        IN FIDE_VENTA_TB.ID_VENTA%TYPE,
        P_IDENTIFICACION  IN FIDE_VENTA_TB.IDENTIFICACION%TYPE,
        P_TOTAL_VENTA     IN FIDE_VENTA_TB.TOTAL_VENTA%TYPE,
        P_FECHA_VENTA     IN FIDE_VENTA_TB.FECHA_VENTA%TYPE,
        P_ID_ESTADO       IN FIDE_VENTA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
        V_TOTAL_VENTA_CALCULADA FIDE_VENTA_TB.TOTAL_VENTA%TYPE;
    BEGIN
        V_TOTAL_VENTA_CALCULADA := FIDE_CALCULAR_TOTAL_VENTA_FN(P_ID_VENTA);

        UPDATE FIDE_VENTA_TB
        SET
            IDENTIFICACION = P_IDENTIFICACION,
            TOTAL_VENTA = V_TOTAL_VENTA_CALCULADA,
            FECHA_VENTA = P_FECHA_VENTA,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_VENTA = P_ID_VENTA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la venta.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_VENTA_TB DELETE LOGICO */

    PROCEDURE FIDE_VENTA_DELETE_SP(
        P_ID_VENTA IN FIDE_VENTA_TB.ID_VENTA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_VENTA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_VENTA = P_ID_VENTA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la venta o ya está eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_VENTA_PRODUCTO_TB INSERT */

    PROCEDURE FIDE_VENTA_PRODUCTO_INSERT_SP(
        P_ID_VENTA           IN FIDE_VENTA_PRODUCTO_TB.ID_VENTA%TYPE,
        P_ID_PRODUCTO        IN FIDE_VENTA_PRODUCTO_TB.ID_PRODUCTO%TYPE,
        P_ID_TIPO_MOVIMIENTO IN FIDE_VENTA_PRODUCTO_TB.ID_TIPO_MOVIMIENTO%TYPE,
        P_CANTIDAD           IN FIDE_VENTA_PRODUCTO_TB.CANTIDAD%TYPE,
        P_PRECIO_UNITARIO    IN FIDE_VENTA_PRODUCTO_TB.PRECIO_UNITARIO%TYPE,
        P_ID_ESTADO          IN FIDE_VENTA_PRODUCTO_TB.ID_ESTADO%TYPE
    )
    IS
        V_TOTAL_LINEA FIDE_VENTA_PRODUCTO_TB.TOTAL%TYPE;
    BEGIN
        IF P_CANTIDAD IS NULL OR P_CANTIDAD <= 0 OR P_CANTIDAD != TRUNC(P_CANTIDAD) THEN
            RAISE_APPLICATION_ERROR(-20006, 'La cantidad debe ser un entero positivo.');
        END IF;

        IF NVL(P_PRECIO_UNITARIO, -1) < 0 THEN
            RAISE_APPLICATION_ERROR(-20007, 'El precio unitario no puede ser negativo.');
        END IF;

        IF FIDE_CONTAR_FACTURAS_ACTIVAS_VENTA_FN(P_ID_VENTA) > 0 THEN
            RAISE_APPLICATION_ERROR(
                -20008,
                'No se puede modificar el detalle de una venta con facturas activas.'
            );
        END IF;

        V_TOTAL_LINEA := ROUND(P_CANTIDAD * P_PRECIO_UNITARIO, 2);

        INSERT INTO FIDE_VENTA_PRODUCTO_TB(
            ID_VENTA,
            ID_PRODUCTO,
            ID_TIPO_MOVIMIENTO,
            CANTIDAD,
            PRECIO_UNITARIO,
            TOTAL,
            ID_ESTADO
        )
        VALUES(
            P_ID_VENTA,
            P_ID_PRODUCTO,
            P_ID_TIPO_MOVIMIENTO,
            P_CANTIDAD,
            P_PRECIO_UNITARIO,
            V_TOTAL_LINEA,
            P_ID_ESTADO
        );

        FIDE_RECALCULAR_TOTAL_VENTA_PR(P_ID_VENTA);

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El detalle de venta ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_VENTA_PRODUCTO_TB UPDATE */

    PROCEDURE FIDE_VENTA_PRODUCTO_UPDATE_SP(
        P_ID_VENTA           IN FIDE_VENTA_PRODUCTO_TB.ID_VENTA%TYPE,
        P_ID_PRODUCTO        IN FIDE_VENTA_PRODUCTO_TB.ID_PRODUCTO%TYPE,
        P_ID_TIPO_MOVIMIENTO IN FIDE_VENTA_PRODUCTO_TB.ID_TIPO_MOVIMIENTO%TYPE,
        P_CANTIDAD           IN FIDE_VENTA_PRODUCTO_TB.CANTIDAD%TYPE,
        P_PRECIO_UNITARIO    IN FIDE_VENTA_PRODUCTO_TB.PRECIO_UNITARIO%TYPE,
        P_ID_ESTADO          IN FIDE_VENTA_PRODUCTO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
        V_TOTAL_LINEA FIDE_VENTA_PRODUCTO_TB.TOTAL%TYPE;
    BEGIN
        IF P_CANTIDAD IS NULL OR P_CANTIDAD <= 0 OR P_CANTIDAD != TRUNC(P_CANTIDAD) THEN
            RAISE_APPLICATION_ERROR(-20006, 'La cantidad debe ser un entero positivo.');
        END IF;

        IF NVL(P_PRECIO_UNITARIO, -1) < 0 THEN
            RAISE_APPLICATION_ERROR(-20007, 'El precio unitario no puede ser negativo.');
        END IF;

        IF FIDE_CONTAR_FACTURAS_ACTIVAS_VENTA_FN(P_ID_VENTA) > 0 THEN
            RAISE_APPLICATION_ERROR(
                -20008,
                'No se puede modificar el detalle de una venta con facturas activas.'
            );
        END IF;

        V_TOTAL_LINEA := ROUND(P_CANTIDAD * P_PRECIO_UNITARIO, 2);

        UPDATE FIDE_VENTA_PRODUCTO_TB
        SET
            ID_TIPO_MOVIMIENTO = P_ID_TIPO_MOVIMIENTO,
            CANTIDAD = P_CANTIDAD,
            PRECIO_UNITARIO = P_PRECIO_UNITARIO,
            TOTAL = V_TOTAL_LINEA,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_VENTA = P_ID_VENTA
        AND ID_PRODUCTO = P_ID_PRODUCTO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el detalle de venta.');
        END IF;

        FIDE_RECALCULAR_TOTAL_VENTA_PR(P_ID_VENTA);

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_VENTA_PRODUCTO_TB DELETE LOGICO */

    PROCEDURE FIDE_VENTA_PRODUCTO_DELETE_SP(
        P_ID_VENTA    IN FIDE_VENTA_PRODUCTO_TB.ID_VENTA%TYPE,
        P_ID_PRODUCTO IN FIDE_VENTA_PRODUCTO_TB.ID_PRODUCTO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN
        IF FIDE_CONTAR_FACTURAS_ACTIVAS_VENTA_FN(P_ID_VENTA) > 0 THEN
            RAISE_APPLICATION_ERROR(
                -20008,
                'No se puede modificar el detalle de una venta con facturas activas.'
            );
        END IF;

        UPDATE FIDE_VENTA_PRODUCTO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_VENTA = P_ID_VENTA
        AND ID_PRODUCTO = P_ID_PRODUCTO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el detalle de venta o ya está eliminado.');
        END IF;

        FIDE_RECALCULAR_TOTAL_VENTA_PR(P_ID_VENTA);

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_INVENTARIO_TB INSERT */

    PROCEDURE FIDE_INVENTARIO_INSERT_SP(
        P_ID_PRODUCTO   IN FIDE_INVENTARIO_TB.ID_PRODUCTO%TYPE,
        P_CANTIDAD      IN FIDE_INVENTARIO_TB.CANTIDAD%TYPE,
        P_ID_ESTADO     IN FIDE_INVENTARIO_TB.ID_ESTADO%TYPE
    )
    IS
        V_EXISTE_INVENTARIO NUMBER;
        V_ID_ESTADO_PRODUCTO FIDE_PRODUCTO_TB.ID_ESTADO%TYPE;
    BEGIN
        IF NVL(P_CANTIDAD, 0) < 0 THEN
            RAISE_APPLICATION_ERROR(-20006, 'La cantidad del inventario no puede ser negativa.');
        END IF;

        IF P_ID_ESTADO != 1 AND NVL(P_CANTIDAD, 0) > 0 THEN
            RAISE_APPLICATION_ERROR(-20007, 'Un inventario inactivo debe tener cantidad 0.');
        END IF;

        SELECT COUNT(*)
        INTO V_EXISTE_INVENTARIO
        FROM FIDE_INVENTARIO_TB
        WHERE ID_PRODUCTO = P_ID_PRODUCTO;

        IF V_EXISTE_INVENTARIO > 0 THEN
            RAISE_APPLICATION_ERROR(-20008, 'Ya existe un inventario asociado a ese producto.');
        END IF;

        SELECT ID_ESTADO
        INTO V_ID_ESTADO_PRODUCTO
        FROM FIDE_PRODUCTO_TB
        WHERE ID_PRODUCTO = P_ID_PRODUCTO;

        IF P_ID_ESTADO = 1 AND V_ID_ESTADO_PRODUCTO != 1 THEN
            RAISE_APPLICATION_ERROR(-20009, 'No se puede activar inventario para un producto inactivo.');
        END IF;

        INSERT INTO FIDE_INVENTARIO_TB(
            ID_PRODUCTO,
            CANTIDAD,
            ID_ESTADO
        )
        VALUES(
            P_ID_PRODUCTO,
            P_CANTIDAD,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El inventario ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_INVENTARIO_TB UPDATE */

    PROCEDURE FIDE_INVENTARIO_UPDATE_SP(
        P_ID_INVENTARIO IN FIDE_INVENTARIO_TB.ID_INVENTARIO%TYPE,
        P_ID_PRODUCTO   IN FIDE_INVENTARIO_TB.ID_PRODUCTO%TYPE,
        P_CANTIDAD      IN FIDE_INVENTARIO_TB.CANTIDAD%TYPE,
        P_ID_ESTADO     IN FIDE_INVENTARIO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
        V_ID_PRODUCTO_ACTUAL FIDE_INVENTARIO_TB.ID_PRODUCTO%TYPE;
        V_ID_ESTADO_PRODUCTO FIDE_PRODUCTO_TB.ID_ESTADO%TYPE;
    BEGIN
        IF NVL(P_CANTIDAD, 0) < 0 THEN
            RAISE_APPLICATION_ERROR(-20006, 'La cantidad del inventario no puede ser negativa.');
        END IF;

        IF P_ID_ESTADO != 1 AND NVL(P_CANTIDAD, 0) > 0 THEN
            RAISE_APPLICATION_ERROR(-20007, 'Un inventario inactivo debe tener cantidad 0.');
        END IF;

        SELECT ID_PRODUCTO
        INTO V_ID_PRODUCTO_ACTUAL
        FROM FIDE_INVENTARIO_TB
        WHERE ID_INVENTARIO = P_ID_INVENTARIO;

        IF V_ID_PRODUCTO_ACTUAL != P_ID_PRODUCTO THEN
            RAISE_APPLICATION_ERROR(-20008, 'No se puede cambiar el producto asociado al inventario.');
        END IF;

        SELECT ID_ESTADO
        INTO V_ID_ESTADO_PRODUCTO
        FROM FIDE_PRODUCTO_TB
        WHERE ID_PRODUCTO = P_ID_PRODUCTO;

        IF P_ID_ESTADO = 1 AND V_ID_ESTADO_PRODUCTO != 1 THEN
            RAISE_APPLICATION_ERROR(-20009, 'No se puede activar inventario para un producto inactivo.');
        END IF;

        UPDATE FIDE_INVENTARIO_TB
        SET
            ID_PRODUCTO = P_ID_PRODUCTO,
            CANTIDAD = P_CANTIDAD,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_INVENTARIO = P_ID_INVENTARIO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el inventario.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_INVENTARIO_TB DELETE LOGICO */

    PROCEDURE FIDE_INVENTARIO_DELETE_SP(
        P_ID_INVENTARIO IN FIDE_INVENTARIO_TB.ID_INVENTARIO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_INVENTARIO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_INVENTARIO = P_ID_INVENTARIO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el inventario o ya está eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TIPO_MOVIMIENTO_TB INSERT */

    PROCEDURE FIDE_TIPO_MOVIMIENTO_INSERT_SP(
        P_NOMBRE             IN FIDE_TIPO_MOVIMIENTO_TB.NOMBRE%TYPE,
        P_ID_ESTADO          IN FIDE_TIPO_MOVIMIENTO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_TIPO_MOVIMIENTO_TB(
            NOMBRE,
            ID_ESTADO
        )
        VALUES(
            P_NOMBRE,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El tipo de movimiento ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TIPO_MOVIMIENTO_TB UPDATE */

    PROCEDURE FIDE_TIPO_MOVIMIENTO_UPDATE_SP(
        P_ID_TIPO_MOVIMIENTO IN FIDE_TIPO_MOVIMIENTO_TB.ID_TIPO_MOVIMIENTO%TYPE,
        P_NOMBRE             IN FIDE_TIPO_MOVIMIENTO_TB.NOMBRE%TYPE,
        P_ID_ESTADO          IN FIDE_TIPO_MOVIMIENTO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_TIPO_MOVIMIENTO_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_TIPO_MOVIMIENTO = P_ID_TIPO_MOVIMIENTO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el tipo de movimiento.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TIPO_MOVIMIENTO_TB DELETE LOGICO */

    PROCEDURE FIDE_TIPO_MOVIMIENTO_DELETE_SP(
        P_ID_TIPO_MOVIMIENTO IN FIDE_TIPO_MOVIMIENTO_TB.ID_TIPO_MOVIMIENTO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_TIPO_MOVIMIENTO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_TIPO_MOVIMIENTO = P_ID_TIPO_MOVIMIENTO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el tipo de movimiento o ya está eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_MOVIMIENTO_INVENTARIO_TB INSERT */

    PROCEDURE FIDE_MOVIMIENTO_INVENTARIO_INSERT_SP(
        P_ID_PRODUCTO         IN FIDE_MOVIMIENTO_INVENTARIO_TB.ID_PRODUCTO%TYPE,
        P_ID_TIPO_MOVIMIENTO  IN FIDE_MOVIMIENTO_INVENTARIO_TB.ID_TIPO_MOVIMIENTO%TYPE,
        P_CANTIDAD            IN FIDE_MOVIMIENTO_INVENTARIO_TB.CANTIDAD%TYPE,
        P_FECHA_MOVIMIENTO    IN FIDE_MOVIMIENTO_INVENTARIO_TB.FECHA_MOVIMIENTO%TYPE,
        P_ID_ESTADO           IN FIDE_MOVIMIENTO_INVENTARIO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_MOVIMIENTO_INVENTARIO_TB(
            ID_PRODUCTO,
            ID_TIPO_MOVIMIENTO,
            CANTIDAD,
            FECHA_MOVIMIENTO,
            ID_ESTADO
        )
        VALUES(
            P_ID_PRODUCTO,
            P_ID_TIPO_MOVIMIENTO,
            P_CANTIDAD,
            P_FECHA_MOVIMIENTO,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El movimiento de inventario ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_MOVIMIENTO_INVENTARIO_TB UPDATE */

    PROCEDURE FIDE_MOVIMIENTO_INVENTARIO_UPDATE_SP(
        P_ID_MOVIMIENTO       IN FIDE_MOVIMIENTO_INVENTARIO_TB.ID_MOVIMIENTO%TYPE,
        P_ID_PRODUCTO         IN FIDE_MOVIMIENTO_INVENTARIO_TB.ID_PRODUCTO%TYPE,
        P_ID_TIPO_MOVIMIENTO  IN FIDE_MOVIMIENTO_INVENTARIO_TB.ID_TIPO_MOVIMIENTO%TYPE,
        P_CANTIDAD            IN FIDE_MOVIMIENTO_INVENTARIO_TB.CANTIDAD%TYPE,
        P_FECHA_MOVIMIENTO    IN FIDE_MOVIMIENTO_INVENTARIO_TB.FECHA_MOVIMIENTO%TYPE,
        P_ID_ESTADO           IN FIDE_MOVIMIENTO_INVENTARIO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_MOVIMIENTO_INVENTARIO_TB
        SET
            ID_PRODUCTO = P_ID_PRODUCTO,
            ID_TIPO_MOVIMIENTO = P_ID_TIPO_MOVIMIENTO,
            CANTIDAD = P_CANTIDAD,
            FECHA_MOVIMIENTO = P_FECHA_MOVIMIENTO,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_MOVIMIENTO = P_ID_MOVIMIENTO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el movimiento de inventario.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_MOVIMIENTO_INVENTARIO_TB DELETE LOGICO */

    PROCEDURE FIDE_MOVIMIENTO_INVENTARIO_DELETE_SP(
        P_ID_MOVIMIENTO IN FIDE_MOVIMIENTO_INVENTARIO_TB.ID_MOVIMIENTO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_MOVIMIENTO_INVENTARIO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_MOVIMIENTO = P_ID_MOVIMIENTO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el movimiento de inventario o ya está eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_MONEDA_TB INSERT */

    PROCEDURE FIDE_MONEDA_INSERT_SP(
        P_NOMBRE     IN FIDE_MONEDA_TB.NOMBRE%TYPE,
        P_SIMBOLO    IN FIDE_MONEDA_TB.SIMBOLO%TYPE,
        P_ID_ESTADO  IN FIDE_MONEDA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_MONEDA_TB(
            NOMBRE,
            SIMBOLO,
            ID_ESTADO
        )
        VALUES(
            P_NOMBRE,
            P_SIMBOLO,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La moneda ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_MONEDA_TB UPDATE */

    PROCEDURE FIDE_MONEDA_UPDATE_SP(
        P_ID_MONEDA  IN FIDE_MONEDA_TB.ID_MONEDA%TYPE,
        P_NOMBRE     IN FIDE_MONEDA_TB.NOMBRE%TYPE,
        P_SIMBOLO    IN FIDE_MONEDA_TB.SIMBOLO%TYPE,
        P_ID_ESTADO  IN FIDE_MONEDA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_MONEDA_TB
        SET
            NOMBRE = P_NOMBRE,
            SIMBOLO = P_SIMBOLO,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_MONEDA = P_ID_MONEDA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la moneda.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_MONEDA_TB DELETE LOGICO */

    PROCEDURE FIDE_MONEDA_DELETE_SP(
        P_ID_MONEDA IN FIDE_MONEDA_TB.ID_MONEDA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_MONEDA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_MONEDA = P_ID_MONEDA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la moneda o ya está eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_FACTURA_TB INSERT */

    PROCEDURE FIDE_FACTURA_INSERT_SP(
        P_ID_MONEDA              IN FIDE_FACTURA_TB.ID_MONEDA%TYPE,
        P_TASA_IMPUESTO_APLICADA IN FIDE_FACTURA_TB.TASA_IMPUESTO_APLICADA%TYPE,
        P_FECHA                  IN FIDE_FACTURA_TB.FECHA_FACTURA%TYPE,
        P_ID_ESTADO              IN FIDE_FACTURA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        IF NVL(P_TASA_IMPUESTO_APLICADA, -1) < 0 THEN
            RAISE_APPLICATION_ERROR(-20005, 'La tasa de impuesto no puede ser negativa.');
        END IF;

        INSERT INTO FIDE_FACTURA_TB(
            ID_MONEDA,
            TASA_IMPUESTO_APLICADA,
            IMPUESTO,
            SUBTOTAL,
            TOTAL,
            FECHA_FACTURA,
            ID_ESTADO
        )
        VALUES(
            P_ID_MONEDA,
            NVL(P_TASA_IMPUESTO_APLICADA, 0.13),
            0,
            0,
            0,
            P_FECHA,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La factura ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_FACTURA_TB UPDATE */

    PROCEDURE FIDE_FACTURA_UPDATE_SP(
        P_ID_FACTURA             IN FIDE_FACTURA_TB.ID_FACTURA%TYPE,
        P_ID_MONEDA              IN FIDE_FACTURA_TB.ID_MONEDA%TYPE,
        P_TASA_IMPUESTO_APLICADA IN FIDE_FACTURA_TB.TASA_IMPUESTO_APLICADA%TYPE,
        P_FECHA                  IN FIDE_FACTURA_TB.FECHA_FACTURA%TYPE,
        P_ID_ESTADO              IN FIDE_FACTURA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN
        IF NVL(P_TASA_IMPUESTO_APLICADA, -1) < 0 THEN
            RAISE_APPLICATION_ERROR(-20005, 'La tasa de impuesto no puede ser negativa.');
        END IF;

        UPDATE FIDE_FACTURA_TB
        SET
            ID_MONEDA = P_ID_MONEDA,
            TASA_IMPUESTO_APLICADA = NVL(P_TASA_IMPUESTO_APLICADA, 0.13),
            FECHA_FACTURA = P_FECHA,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_FACTURA = P_ID_FACTURA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la factura.');
        END IF;

        FIDE_RECALCULAR_FACTURA_POR_ID_SP(P_ID_FACTURA);

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_FACTURA_TB DELETE LOGICO */

    PROCEDURE FIDE_FACTURA_DELETE_SP(
        P_ID_FACTURA IN FIDE_FACTURA_TB.ID_FACTURA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_FACTURA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_FACTURA = P_ID_FACTURA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la factura o ya está eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_VENTA_FACTURA_TB INSERT */

    PROCEDURE FIDE_VENTA_FACTURA_INSERT_SP(
        P_ID_VENTA   IN FIDE_VENTA_FACTURA_TB.ID_VENTA%TYPE,
        P_ID_FACTURA IN FIDE_VENTA_FACTURA_TB.ID_FACTURA%TYPE,
        P_ID_ESTADO  IN FIDE_VENTA_FACTURA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_VENTA_FACTURA_TB(
            ID_VENTA,
            ID_FACTURA,
            ID_ESTADO
        )
        VALUES(
            P_ID_VENTA,
            P_ID_FACTURA,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La relación venta-factura ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_VENTA_FACTURA_TB UPDATE */

    PROCEDURE FIDE_VENTA_FACTURA_UPDATE_SP(
        P_ID_VENTA   IN FIDE_VENTA_FACTURA_TB.ID_VENTA%TYPE,
        P_ID_FACTURA IN FIDE_VENTA_FACTURA_TB.ID_FACTURA%TYPE,
        P_ID_ESTADO  IN FIDE_VENTA_FACTURA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_VENTA_FACTURA_TB
        SET
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_VENTA = P_ID_VENTA
        AND ID_FACTURA = P_ID_FACTURA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la relación venta-factura.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_VENTA_FACTURA_TB DELETE LOGICO */

    PROCEDURE FIDE_VENTA_FACTURA_DELETE_SP(
        P_ID_VENTA   IN FIDE_VENTA_FACTURA_TB.ID_VENTA%TYPE,
        P_ID_FACTURA IN FIDE_VENTA_FACTURA_TB.ID_FACTURA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_VENTA_FACTURA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_VENTA = P_ID_VENTA
        AND ID_FACTURA = P_ID_FACTURA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la relación o ya está eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_DONACION_FACTURA_TB INSERT */

    PROCEDURE FIDE_DONACION_FACTURA_INSERT_SP(
        P_ID_DONACION IN FIDE_DONACION_FACTURA_TB.ID_DONACION%TYPE,
        P_ID_FACTURA  IN FIDE_DONACION_FACTURA_TB.ID_FACTURA%TYPE,
        P_ID_ESTADO   IN FIDE_DONACION_FACTURA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_DONACION_FACTURA_TB(
            ID_DONACION,
            ID_FACTURA,
            ID_ESTADO
        )
        VALUES(
            P_ID_DONACION,
            P_ID_FACTURA,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La relación donación-factura ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_DONACION_FACTURA_TB UPDATE */

    PROCEDURE FIDE_DONACION_FACTURA_UPDATE_SP(
        P_ID_DONACION IN FIDE_DONACION_FACTURA_TB.ID_DONACION%TYPE,
        P_ID_FACTURA  IN FIDE_DONACION_FACTURA_TB.ID_FACTURA%TYPE,
        P_ID_ESTADO   IN FIDE_DONACION_FACTURA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_DONACION_FACTURA_TB
        SET
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_DONACION = P_ID_DONACION
        AND ID_FACTURA = P_ID_FACTURA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la relación donación-factura.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_DONACION_FACTURA_TB DELETE LOGICO */

    PROCEDURE FIDE_DONACION_FACTURA_DELETE_SP(
        P_ID_DONACION IN FIDE_DONACION_FACTURA_TB.ID_DONACION%TYPE,
        P_ID_FACTURA  IN FIDE_DONACION_FACTURA_TB.ID_FACTURA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_DONACION_FACTURA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_DONACION = P_ID_DONACION
        AND ID_FACTURA = P_ID_FACTURA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la relación o ya está eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_PAGO_PAYPAL_TB INSERT */

    PROCEDURE FIDE_PAGO_PAYPAL_INSERT_SP(
        P_ID_FACTURA        IN FIDE_PAGO_PAYPAL_TB.ID_FACTURA%TYPE,
        P_PAYPAL_ORDER_ID   IN FIDE_PAGO_PAYPAL_TB.PAYPAL_ORDER_ID%TYPE,
        P_PAYPAL_CAPTURE_ID IN FIDE_PAGO_PAYPAL_TB.PAYPAL_CAPTURE_ID%TYPE,
        P_FECHA_PAGO        IN FIDE_PAGO_PAYPAL_TB.FECHA_PAGO%TYPE,
        P_ID_ESTADO         IN FIDE_PAGO_PAYPAL_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_PAGO_PAYPAL_TB(
            ID_FACTURA,
            PAYPAL_ORDER_ID,
            PAYPAL_CAPTURE_ID,
            FECHA_PAGO,
            ID_ESTADO
        )
        VALUES(
            P_ID_FACTURA,
            P_PAYPAL_ORDER_ID,
            P_PAYPAL_CAPTURE_ID,
            P_FECHA_PAGO,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El pago ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_PAGO_PAYPAL_TB UPDATE */

    PROCEDURE FIDE_PAGO_PAYPAL_UPDATE_SP(
        P_ID_PAGO           IN FIDE_PAGO_PAYPAL_TB.ID_PAGO%TYPE,
        P_ID_FACTURA        IN FIDE_PAGO_PAYPAL_TB.ID_FACTURA%TYPE,
        P_PAYPAL_ORDER_ID   IN FIDE_PAGO_PAYPAL_TB.PAYPAL_ORDER_ID%TYPE,
        P_PAYPAL_CAPTURE_ID IN FIDE_PAGO_PAYPAL_TB.PAYPAL_CAPTURE_ID%TYPE,
        P_FECHA_PAGO        IN FIDE_PAGO_PAYPAL_TB.FECHA_PAGO%TYPE,
        P_ID_ESTADO         IN FIDE_PAGO_PAYPAL_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_PAGO_PAYPAL_TB
        SET
            ID_FACTURA = P_ID_FACTURA,
            PAYPAL_ORDER_ID = P_PAYPAL_ORDER_ID,
            PAYPAL_CAPTURE_ID = P_PAYPAL_CAPTURE_ID,
            FECHA_PAGO = P_FECHA_PAGO,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_PAGO = P_ID_PAGO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el pago.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_PAGO_PAYPAL_TB DELETE LOGICO */

    PROCEDURE FIDE_PAGO_PAYPAL_DELETE_SP(
        P_ID_PAGO IN FIDE_PAGO_PAYPAL_TB.ID_PAGO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_PAGO_PAYPAL_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_PAGO = P_ID_PAGO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el pago o ya está eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_RAZA_TB INSERT */

    PROCEDURE FIDE_RAZA_INSERT_SP(
        P_NOMBRE    IN FIDE_RAZA_TB.NOMBRE%TYPE,
        P_ID_ESTADO IN FIDE_RAZA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_RAZA_TB(
            NOMBRE,
            ID_ESTADO
        )
        VALUES(
            P_NOMBRE,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La raza ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_RAZA_TB UPDATE */

    PROCEDURE FIDE_RAZA_UPDATE_SP(
        P_ID_RAZA   IN FIDE_RAZA_TB.ID_RAZA%TYPE,
        P_NOMBRE    IN FIDE_RAZA_TB.NOMBRE%TYPE,
        P_ID_ESTADO IN FIDE_RAZA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN
        UPDATE FIDE_RAZA_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_RAZA = P_ID_RAZA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la raza.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_RAZA_TB DELETE LOGICO */

    PROCEDURE FIDE_RAZA_DELETE_SP(
        P_ID_RAZA IN FIDE_RAZA_TB.ID_RAZA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN
        UPDATE FIDE_RAZA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_RAZA = P_ID_RAZA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la raza o ya está eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_SEXO_TB INSERT */

    PROCEDURE FIDE_SEXO_INSERT_SP(
        P_NOMBRE    IN FIDE_SEXO_TB.NOMBRE%TYPE,
        P_ID_ESTADO IN FIDE_SEXO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_SEXO_TB(
            NOMBRE,
            ID_ESTADO
        )
        VALUES(
            P_NOMBRE,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El sexo ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_SEXO_TB UPDATE */

    PROCEDURE FIDE_SEXO_UPDATE_SP(
        P_ID_SEXO   IN FIDE_SEXO_TB.ID_SEXO%TYPE,
        P_NOMBRE    IN FIDE_SEXO_TB.NOMBRE%TYPE,
        P_ID_ESTADO IN FIDE_SEXO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN
        UPDATE FIDE_SEXO_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_SEXO = P_ID_SEXO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el sexo.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_SEXO_TB DELETE LOGICO */

    PROCEDURE FIDE_SEXO_DELETE_SP(
        P_ID_SEXO IN FIDE_SEXO_TB.ID_SEXO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN
        UPDATE FIDE_SEXO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_SEXO = P_ID_SEXO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el sexo o ya está eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_PERRITO_TB INSERT */

    PROCEDURE FIDE_PERRITO_INSERT_SP(
        P_NOMBRE       IN FIDE_PERRITO_TB.NOMBRE%TYPE,
        P_FECHA_INGRESO IN FIDE_PERRITO_TB.FECHA_INGRESO%TYPE,
        P_EDAD         IN FIDE_PERRITO_TB.EDAD%TYPE,
        P_PESO         IN FIDE_PERRITO_TB.PESO%TYPE,
        P_ESTATURA     IN FIDE_PERRITO_TB.ESTATURA%TYPE,
        P_ID_SEXO      IN FIDE_PERRITO_TB.ID_SEXO%TYPE,
        P_ID_RAZA      IN FIDE_PERRITO_TB.ID_RAZA%TYPE,
        P_ID_ESTADO    IN FIDE_PERRITO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_PERRITO_TB(
            NOMBRE,
            FECHA_INGRESO,
            EDAD,
            PESO,
            ESTATURA,
            ID_SEXO,
            ID_RAZA,
            ID_ESTADO
        )
        VALUES(
            P_NOMBRE,
            P_FECHA_INGRESO,
            P_EDAD,
            P_PESO,
            P_ESTATURA,
            P_ID_SEXO,
            P_ID_RAZA,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El perrito ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_PERRITO_TB UPDATE */

    PROCEDURE FIDE_PERRITO_UPDATE_SP(
        P_ID_PERRITO IN FIDE_PERRITO_TB.ID_PERRITO%TYPE,
        P_NOMBRE     IN FIDE_PERRITO_TB.NOMBRE%TYPE,
        P_EDAD       IN FIDE_PERRITO_TB.EDAD%TYPE,
        P_PESO       IN FIDE_PERRITO_TB.PESO%TYPE,
        P_ESTATURA   IN FIDE_PERRITO_TB.ESTATURA%TYPE,
        P_ID_SEXO    IN FIDE_PERRITO_TB.ID_SEXO%TYPE,
        P_ID_RAZA    IN FIDE_PERRITO_TB.ID_RAZA%TYPE,
        P_ID_ESTADO  IN FIDE_PERRITO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN
        UPDATE FIDE_PERRITO_TB
        SET
            NOMBRE = P_NOMBRE,
            EDAD = P_EDAD,
            PESO = P_PESO,
            ESTATURA = P_ESTATURA,
            ID_SEXO = P_ID_SEXO,
            ID_RAZA = P_ID_RAZA,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_PERRITO = P_ID_PERRITO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el perrito.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_PERRITO_TB DELETE LOGICO */

    PROCEDURE FIDE_PERRITO_DELETE_SP(
        P_ID_PERRITO IN FIDE_PERRITO_TB.ID_PERRITO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN
        UPDATE FIDE_PERRITO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_PERRITO = P_ID_PERRITO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el perrito o ya está eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_PERRITO_IMAGEN_TB INSERT */

    PROCEDURE FIDE_PERRITO_IMAGEN_INSERT_SP(
        P_ID_PERRITO  IN FIDE_PERRITO_IMAGEN_TB.ID_PERRITO%TYPE,
        P_IMAGE_URL   IN FIDE_PERRITO_IMAGEN_TB.IMAGE_URL%TYPE,
        P_ID_ESTADO   IN FIDE_PERRITO_IMAGEN_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_PERRITO_IMAGEN_TB(
            ID_PERRITO,
            IMAGE_URL,
            ID_ESTADO
        )
        VALUES(
            P_ID_PERRITO,
            P_IMAGE_URL,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La imagen del perrito ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_PERRITO_IMAGEN_TB UPDATE */

    PROCEDURE FIDE_PERRITO_IMAGEN_UPDATE_SP(
        P_ID_IMAGEN   IN FIDE_PERRITO_IMAGEN_TB.ID_IMAGEN%TYPE,
        P_ID_PERRITO  IN FIDE_PERRITO_IMAGEN_TB.ID_PERRITO%TYPE,
        P_IMAGE_URL   IN FIDE_PERRITO_IMAGEN_TB.IMAGE_URL%TYPE,
        P_ID_ESTADO   IN FIDE_PERRITO_IMAGEN_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_PERRITO_IMAGEN_TB
        SET
            ID_PERRITO = P_ID_PERRITO,
            IMAGE_URL = P_IMAGE_URL,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_IMAGEN = P_ID_IMAGEN;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la imagen del perrito.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_PERRITO_IMAGEN_TB DELETE LOGICO */

    PROCEDURE FIDE_PERRITO_IMAGEN_DELETE_SP(
        P_ID_IMAGEN IN FIDE_PERRITO_IMAGEN_TB.ID_IMAGEN%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_PERRITO_IMAGEN_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_IMAGEN = P_ID_IMAGEN
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la imagen o ya está eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TIPO_SOLICITUD_TB INSERT */

    PROCEDURE FIDE_TIPO_SOLICITUD_INSERT_SP(
        P_NOMBRE            IN FIDE_TIPO_SOLICITUD_TB.NOMBRE%TYPE,
        P_ID_ESTADO         IN FIDE_TIPO_SOLICITUD_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_TIPO_SOLICITUD_TB(
            NOMBRE,
            ID_ESTADO
        )
        VALUES(
            P_NOMBRE,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El tipo de solicitud ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TIPO_SOLICITUD_TB UPDATE */

    PROCEDURE FIDE_TIPO_SOLICITUD_UPDATE_SP(
        P_ID_TIPO_SOLICITUD IN FIDE_TIPO_SOLICITUD_TB.ID_TIPO_SOLICITUD%TYPE,
        P_NOMBRE            IN FIDE_TIPO_SOLICITUD_TB.NOMBRE%TYPE,
        P_ID_ESTADO         IN FIDE_TIPO_SOLICITUD_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_TIPO_SOLICITUD_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_TIPO_SOLICITUD = P_ID_TIPO_SOLICITUD;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el tipo de solicitud.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TIPO_SOLICITUD_TB DELETE LOGICO */

    PROCEDURE FIDE_TIPO_SOLICITUD_DELETE_SP(
        P_ID_TIPO_SOLICITUD IN FIDE_TIPO_SOLICITUD_TB.ID_TIPO_SOLICITUD%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_TIPO_SOLICITUD_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_TIPO_SOLICITUD = P_ID_TIPO_SOLICITUD
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el tipo de solicitud o ya está eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_SOLICITUD_TB INSERT */

    PROCEDURE FIDE_SOLICITUD_INSERT_SP(
        P_IDENTIFICACION    IN FIDE_SOLICITUD_TB.IDENTIFICACION%TYPE,
        P_ID_TIPO_SOLICITUD IN FIDE_SOLICITUD_TB.ID_TIPO_SOLICITUD%TYPE,
        P_ID_ESTADO         IN FIDE_SOLICITUD_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_SOLICITUD_TB(
            IDENTIFICACION,
            ID_TIPO_SOLICITUD,
            ID_ESTADO
        )
        VALUES(
            P_IDENTIFICACION,
            P_ID_TIPO_SOLICITUD,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La solicitud ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_SOLICITUD_TB UPDATE */

    PROCEDURE FIDE_SOLICITUD_UPDATE_SP(
        P_ID_SOLICITUD      IN FIDE_SOLICITUD_TB.ID_SOLICITUD%TYPE,
        P_IDENTIFICACION    IN FIDE_SOLICITUD_TB.IDENTIFICACION%TYPE,
        P_ID_TIPO_SOLICITUD IN FIDE_SOLICITUD_TB.ID_TIPO_SOLICITUD%TYPE,
        P_ID_ESTADO         IN FIDE_SOLICITUD_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_SOLICITUD_TB
        SET
            IDENTIFICACION = P_IDENTIFICACION,
            ID_TIPO_SOLICITUD = P_ID_TIPO_SOLICITUD,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_SOLICITUD = P_ID_SOLICITUD;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la solicitud.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_SOLICITUD_TB DELETE LOGICO */

    PROCEDURE FIDE_SOLICITUD_DELETE_SP(
        P_ID_SOLICITUD IN FIDE_SOLICITUD_TB.ID_SOLICITUD%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_SOLICITUD_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_SOLICITUD = P_ID_SOLICITUD
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la solicitud o ya está eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TIPO_SOLICITUD_PREGUNTA_TB INSERT */

    PROCEDURE FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(
        P_ID_TIPO_SOLICITUD IN FIDE_TIPO_SOLICITUD_PREGUNTA_TB.ID_TIPO_SOLICITUD%TYPE,
        P_ID_PREGUNTA       IN FIDE_TIPO_SOLICITUD_PREGUNTA_TB.ID_PREGUNTA%TYPE,
        P_ID_ESTADO         IN FIDE_TIPO_SOLICITUD_PREGUNTA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_TIPO_SOLICITUD_PREGUNTA_TB(
            ID_TIPO_SOLICITUD,
            ID_PREGUNTA,
            ID_ESTADO
        )
        VALUES(
            P_ID_TIPO_SOLICITUD,
            P_ID_PREGUNTA,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La relación tipo solicitud-pregunta ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TIPO_SOLICITUD_PREGUNTA_TB UPDATE */

    PROCEDURE FIDE_TIPO_SOLICITUD_PREGUNTA_UPDATE_SP(
        P_ID_TIPO_SOLICITUD IN FIDE_TIPO_SOLICITUD_PREGUNTA_TB.ID_TIPO_SOLICITUD%TYPE,
        P_ID_PREGUNTA       IN FIDE_TIPO_SOLICITUD_PREGUNTA_TB.ID_PREGUNTA%TYPE,
        P_ID_ESTADO         IN FIDE_TIPO_SOLICITUD_PREGUNTA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_TIPO_SOLICITUD_PREGUNTA_TB
        SET
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_TIPO_SOLICITUD = P_ID_TIPO_SOLICITUD
          AND ID_PREGUNTA = P_ID_PREGUNTA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la relación tipo solicitud-pregunta.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TIPO_SOLICITUD_PREGUNTA_TB DELETE LOGICO */

    PROCEDURE FIDE_TIPO_SOLICITUD_PREGUNTA_DELETE_SP(
        P_ID_TIPO_SOLICITUD IN FIDE_TIPO_SOLICITUD_PREGUNTA_TB.ID_TIPO_SOLICITUD%TYPE,
        P_ID_PREGUNTA       IN FIDE_TIPO_SOLICITUD_PREGUNTA_TB.ID_PREGUNTA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_TIPO_SOLICITUD_PREGUNTA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_TIPO_SOLICITUD = P_ID_TIPO_SOLICITUD
          AND ID_PREGUNTA = P_ID_PREGUNTA
          AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la relación o ya está eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TIPO_RESPUESTA_TB INSERT */

    PROCEDURE FIDE_TIPO_RESPUESTA_INSERT_SP(
        P_NOMBRE            IN FIDE_TIPO_RESPUESTA_TB.NOMBRE%TYPE,
        P_ID_ESTADO         IN FIDE_TIPO_RESPUESTA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_TIPO_RESPUESTA_TB(
            NOMBRE,
            ID_ESTADO
        )
        VALUES(
            P_NOMBRE,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El tipo de respuesta ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TIPO_RESPUESTA_TB UPDATE */

    PROCEDURE FIDE_TIPO_RESPUESTA_UPDATE_SP(
        P_ID_TIPO_RESPUESTA IN FIDE_TIPO_RESPUESTA_TB.ID_TIPO_RESPUESTA%TYPE,
        P_NOMBRE            IN FIDE_TIPO_RESPUESTA_TB.NOMBRE%TYPE,
        P_ID_ESTADO         IN FIDE_TIPO_RESPUESTA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_TIPO_RESPUESTA_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_TIPO_RESPUESTA = P_ID_TIPO_RESPUESTA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el tipo de respuesta.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TIPO_RESPUESTA_TB DELETE LOGICO */

    PROCEDURE FIDE_TIPO_RESPUESTA_DELETE_SP(
        P_ID_TIPO_RESPUESTA IN FIDE_TIPO_RESPUESTA_TB.ID_TIPO_RESPUESTA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_TIPO_RESPUESTA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_TIPO_RESPUESTA = P_ID_TIPO_RESPUESTA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe o ya está eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_PREGUNTA_TB INSERT */

    PROCEDURE FIDE_PREGUNTA_INSERT_SP(
        P_PREGUNTA          IN FIDE_PREGUNTA_TB.PREGUNTA%TYPE,
        P_ID_TIPO_RESPUESTA IN FIDE_PREGUNTA_TB.ID_TIPO_RESPUESTA%TYPE,
        P_ID_ESTADO         IN FIDE_PREGUNTA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_PREGUNTA_TB(
            PREGUNTA,
            ID_TIPO_RESPUESTA,
            ID_ESTADO
        )
        VALUES(
            P_PREGUNTA,
            P_ID_TIPO_RESPUESTA,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La pregunta ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_PREGUNTA_TB UPDATE */

    PROCEDURE FIDE_PREGUNTA_UPDATE_SP(
        P_ID_PREGUNTA       IN FIDE_PREGUNTA_TB.ID_PREGUNTA%TYPE,
        P_PREGUNTA          IN FIDE_PREGUNTA_TB.PREGUNTA%TYPE,
        P_ID_TIPO_RESPUESTA IN FIDE_PREGUNTA_TB.ID_TIPO_RESPUESTA%TYPE,
        P_ID_ESTADO         IN FIDE_PREGUNTA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
        V_RELACIONES_ACTIVAS NUMBER;
    BEGIN

        IF NVL(P_ID_ESTADO, 1) <> 1 THEN
            SELECT COUNT(*)
            INTO V_RELACIONES_ACTIVAS
            FROM FIDE_TIPO_SOLICITUD_PREGUNTA_TB SP
            JOIN FIDE_TIPO_SOLICITUD_TB TS ON SP.ID_TIPO_SOLICITUD = TS.ID_TIPO_SOLICITUD
            WHERE SP.ID_PREGUNTA = P_ID_PREGUNTA
              AND SP.ID_ESTADO = 1
              AND TS.ID_ESTADO = 1;

            IF V_RELACIONES_ACTIVAS > 0 THEN
                RAISE_APPLICATION_ERROR(
                    -20006,
                    'No se puede desactivar la pregunta porque sigue asignada a solicitudes activas.'
                );
            END IF;
        END IF;

        UPDATE FIDE_PREGUNTA_TB
        SET
            PREGUNTA = P_PREGUNTA,
            ID_TIPO_RESPUESTA = P_ID_TIPO_RESPUESTA,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_PREGUNTA = P_ID_PREGUNTA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la pregunta.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_PREGUNTA_TB DELETE LOGICO */

    PROCEDURE FIDE_PREGUNTA_DELETE_SP(
        P_ID_PREGUNTA IN FIDE_PREGUNTA_TB.ID_PREGUNTA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
        V_RELACIONES_ACTIVAS NUMBER;
    BEGIN

        SELECT COUNT(*)
        INTO V_RELACIONES_ACTIVAS
        FROM FIDE_TIPO_SOLICITUD_PREGUNTA_TB SP
        JOIN FIDE_TIPO_SOLICITUD_TB TS ON SP.ID_TIPO_SOLICITUD = TS.ID_TIPO_SOLICITUD
        WHERE SP.ID_PREGUNTA = P_ID_PREGUNTA
          AND SP.ID_ESTADO = 1
          AND TS.ID_ESTADO = 1;

        IF V_RELACIONES_ACTIVAS > 0 THEN
            RAISE_APPLICATION_ERROR(
                -20006,
                'No se puede eliminar la pregunta porque sigue asignada a solicitudes activas.'
            );
        END IF;

        UPDATE FIDE_PREGUNTA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_PREGUNTA = P_ID_PREGUNTA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe o ya está eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_RESPUESTA_TB INSERT */

    PROCEDURE FIDE_RESPUESTA_INSERT_SP(
        P_ID_SOLICITUD IN FIDE_RESPUESTA_TB.ID_SOLICITUD%TYPE,
        P_ID_PREGUNTA  IN FIDE_RESPUESTA_TB.ID_PREGUNTA%TYPE,
        P_RESPUESTA    IN FIDE_RESPUESTA_TB.RESPUESTA%TYPE,
        P_ID_ESTADO    IN FIDE_RESPUESTA_TB.ID_ESTADO%TYPE
    )
    IS
        V_RELACION_EXISTE NUMBER;
    BEGIN

        SELECT COUNT(*)
        INTO V_RELACION_EXISTE
        FROM FIDE_SOLICITUD_TB S
        JOIN FIDE_TIPO_SOLICITUD_PREGUNTA_TB TSP
          ON S.ID_TIPO_SOLICITUD = TSP.ID_TIPO_SOLICITUD
        WHERE S.ID_SOLICITUD = P_ID_SOLICITUD
          AND TSP.ID_PREGUNTA = P_ID_PREGUNTA
          AND TSP.ID_ESTADO = 1;

        IF V_RELACION_EXISTE = 0 THEN
            RAISE_APPLICATION_ERROR(
                -20006,
                'La pregunta no está asociada al tipo de solicitud indicado.'
            );
        END IF;

        INSERT INTO FIDE_RESPUESTA_TB(
            ID_SOLICITUD,
            ID_PREGUNTA,
            RESPUESTA,
            ID_ESTADO
        )
        VALUES(
            P_ID_SOLICITUD,
            P_ID_PREGUNTA,
            P_RESPUESTA,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La respuesta ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_RESPUESTA_TB UPDATE */

    PROCEDURE FIDE_RESPUESTA_UPDATE_SP(
        P_ID_RESPUESTA IN FIDE_RESPUESTA_TB.ID_RESPUESTA%TYPE,
        P_ID_SOLICITUD IN FIDE_RESPUESTA_TB.ID_SOLICITUD%TYPE,
        P_ID_PREGUNTA  IN FIDE_RESPUESTA_TB.ID_PREGUNTA%TYPE,
        P_RESPUESTA    IN FIDE_RESPUESTA_TB.RESPUESTA%TYPE,
        P_ID_ESTADO    IN FIDE_RESPUESTA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
        V_RELACION_EXISTE NUMBER;
    BEGIN

        SELECT COUNT(*)
        INTO V_RELACION_EXISTE
        FROM FIDE_SOLICITUD_TB S
        JOIN FIDE_TIPO_SOLICITUD_PREGUNTA_TB TSP
          ON S.ID_TIPO_SOLICITUD = TSP.ID_TIPO_SOLICITUD
        WHERE S.ID_SOLICITUD = P_ID_SOLICITUD
          AND TSP.ID_PREGUNTA = P_ID_PREGUNTA
          AND TSP.ID_ESTADO = 1;

        IF V_RELACION_EXISTE = 0 THEN
            RAISE_APPLICATION_ERROR(
                -20006,
                'La pregunta no está asociada al tipo de solicitud indicado.'
            );
        END IF;

        UPDATE FIDE_RESPUESTA_TB
        SET
            ID_SOLICITUD = P_ID_SOLICITUD,
            ID_PREGUNTA = P_ID_PREGUNTA,
            RESPUESTA = P_RESPUESTA,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_RESPUESTA = P_ID_RESPUESTA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la respuesta.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_RESPUESTA_TB DELETE LOGICO */

    PROCEDURE FIDE_RESPUESTA_DELETE_SP(
        P_ID_RESPUESTA IN FIDE_RESPUESTA_TB.ID_RESPUESTA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_RESPUESTA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_RESPUESTA = P_ID_RESPUESTA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe o ya está eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_CASA_CUNA_TB INSERT */

    PROCEDURE FIDE_CASA_CUNA_INSERT_SP(
        P_NOMBRE         IN FIDE_CASA_CUNA_TB.NOMBRE%TYPE,
        P_ID_DIRECCION   IN FIDE_CASA_CUNA_TB.ID_DIRECCION%TYPE,
        P_IDENTIFICACION IN FIDE_CASA_CUNA_TB.IDENTIFICACION%TYPE,
        P_ID_SOLICITUD   IN FIDE_CASA_CUNA_TB.ID_SOLICITUD%TYPE,
        P_ID_ESTADO      IN FIDE_CASA_CUNA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_CASA_CUNA_TB(
            NOMBRE,
            ID_DIRECCION,
            IDENTIFICACION,
            ID_SOLICITUD,
            ID_ESTADO
        )
        VALUES(
            P_NOMBRE,
            P_ID_DIRECCION,
            P_IDENTIFICACION,
            P_ID_SOLICITUD,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La casa cuna ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_CASA_CUNA_TB UPDATE */

    PROCEDURE FIDE_CASA_CUNA_UPDATE_SP(
        P_ID_CASA_CUNA   IN FIDE_CASA_CUNA_TB.ID_CASA_CUNA%TYPE,
        P_NOMBRE         IN FIDE_CASA_CUNA_TB.NOMBRE%TYPE,
        P_ID_DIRECCION   IN FIDE_CASA_CUNA_TB.ID_DIRECCION%TYPE,
        P_IDENTIFICACION IN FIDE_CASA_CUNA_TB.IDENTIFICACION%TYPE,
        P_ID_SOLICITUD   IN FIDE_CASA_CUNA_TB.ID_SOLICITUD%TYPE,
        P_ID_ESTADO      IN FIDE_CASA_CUNA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_CASA_CUNA_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_DIRECCION = P_ID_DIRECCION,
            IDENTIFICACION = P_IDENTIFICACION,
            ID_SOLICITUD = P_ID_SOLICITUD,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_CASA_CUNA = P_ID_CASA_CUNA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la casa cuna.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_CASA_CUNA_TB DELETE LOGICO */

    PROCEDURE FIDE_CASA_CUNA_DELETE_SP(
        P_ID_CASA_CUNA IN FIDE_CASA_CUNA_TB.ID_CASA_CUNA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_CASA_CUNA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_CASA_CUNA = P_ID_CASA_CUNA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la casa cuna o ya está eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_CASA_PERRITO_TB INSERT */

    PROCEDURE FIDE_CASA_PERRITO_INSERT_SP(
        P_ID_CASA_CUNA IN FIDE_CASA_PERRITO_TB.ID_CASA_CUNA%TYPE,
        P_ID_PERRITO   IN FIDE_CASA_PERRITO_TB.ID_PERRITO%TYPE,
        P_ID_ESTADO    IN FIDE_CASA_PERRITO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_CASA_PERRITO_TB(
            ID_CASA_CUNA,
            ID_PERRITO,
            ID_ESTADO
        )
        VALUES(
            P_ID_CASA_CUNA,
            P_ID_PERRITO,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La relación casa-perrito ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_CASA_PERRITO_TB UPDATE */

    PROCEDURE FIDE_CASA_PERRITO_UPDATE_SP(
        P_ID_CASA_CUNA IN FIDE_CASA_PERRITO_TB.ID_CASA_CUNA%TYPE,
        P_ID_PERRITO   IN FIDE_CASA_PERRITO_TB.ID_PERRITO%TYPE,
        P_ID_ESTADO    IN FIDE_CASA_PERRITO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_CASA_PERRITO_TB
        SET
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_CASA_CUNA = P_ID_CASA_CUNA
        AND ID_PERRITO = P_ID_PERRITO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la relación casa-perrito.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_CASA_PERRITO_TB DELETE LOGICO */

    PROCEDURE FIDE_CASA_PERRITO_DELETE_SP(
        P_ID_CASA_CUNA IN FIDE_CASA_PERRITO_TB.ID_CASA_CUNA%TYPE,
        P_ID_PERRITO   IN FIDE_CASA_PERRITO_TB.ID_PERRITO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_CASA_PERRITO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_CASA_CUNA = P_ID_CASA_CUNA
        AND ID_PERRITO = P_ID_PERRITO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la relación o ya está eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_ADOPCION_TB INSERT */

    PROCEDURE FIDE_ADOPCION_INSERT_SP(
        P_IDENTIFICACION  IN FIDE_ADOPCION_TB.IDENTIFICACION%TYPE,
        P_ID_PERRITO      IN FIDE_ADOPCION_TB.ID_PERRITO%TYPE,
        P_ID_SOLICITUD    IN FIDE_ADOPCION_TB.ID_SOLICITUD%TYPE,
        P_FECHA_ADOPCION  IN FIDE_ADOPCION_TB.FECHA_ADOPCION%TYPE,
        P_ID_ESTADO       IN FIDE_ADOPCION_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_ADOPCION_TB(
            IDENTIFICACION,
            ID_PERRITO,
            ID_SOLICITUD,
            FECHA_ADOPCION,
            ID_ESTADO
        )
        VALUES(
            P_IDENTIFICACION,
            P_ID_PERRITO,
            P_ID_SOLICITUD,
            P_FECHA_ADOPCION,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La adopción ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_ADOPCION_TB UPDATE */

    PROCEDURE FIDE_ADOPCION_UPDATE_SP(
        P_ID_ADOPCION     IN FIDE_ADOPCION_TB.ID_ADOPCION%TYPE,
        P_IDENTIFICACION  IN FIDE_ADOPCION_TB.IDENTIFICACION%TYPE,
        P_ID_PERRITO      IN FIDE_ADOPCION_TB.ID_PERRITO%TYPE,
        P_ID_SOLICITUD    IN FIDE_ADOPCION_TB.ID_SOLICITUD%TYPE,
        P_FECHA_ADOPCION  IN FIDE_ADOPCION_TB.FECHA_ADOPCION%TYPE,
        P_ID_ESTADO       IN FIDE_ADOPCION_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_ADOPCION_TB
        SET
            IDENTIFICACION = P_IDENTIFICACION,
            ID_PERRITO = P_ID_PERRITO,
            ID_SOLICITUD = P_ID_SOLICITUD,
            FECHA_ADOPCION = P_FECHA_ADOPCION,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_ADOPCION = P_ID_ADOPCION;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la adopción.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_ADOPCION_TB DELETE LOGICO */

    PROCEDURE FIDE_ADOPCION_DELETE_SP(
        P_ID_ADOPCION IN FIDE_ADOPCION_TB.ID_ADOPCION%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_ADOPCION_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_ADOPCION = P_ID_ADOPCION
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la adopción o ya está eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TIPO_SEGUIMIENTO INSERT */

    PROCEDURE FIDE_TIPO_SEGUIMIENTO_INSERT_SP(
        P_NOMBRE              IN FIDE_TIPO_SEGUIMIENTO_TB.NOMBRE%TYPE,
        P_ID_ESTADO           IN FIDE_TIPO_SEGUIMIENTO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_TIPO_SEGUIMIENTO_TB(
            NOMBRE,
            ID_ESTADO
        )
        VALUES(
            P_NOMBRE,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El tipo de seguimiento ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TIPO_SEGUIMIENTO UPDATE */

    PROCEDURE FIDE_TIPO_SEGUIMIENTO_UPDATE_SP(
        P_ID_TIPO_SEGUIMIENTO IN FIDE_TIPO_SEGUIMIENTO_TB.ID_TIPO_SEGUIMIENTO%TYPE,
        P_NOMBRE              IN FIDE_TIPO_SEGUIMIENTO_TB.NOMBRE%TYPE,
        P_ID_ESTADO           IN FIDE_TIPO_SEGUIMIENTO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_TIPO_SEGUIMIENTO_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_TIPO_SEGUIMIENTO = P_ID_TIPO_SEGUIMIENTO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el tipo de seguimiento.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TIPO_SEGUIMIENTO DELETE LOGICO */

    PROCEDURE FIDE_TIPO_SEGUIMIENTO_DELETE_SP(
        P_ID_TIPO_SEGUIMIENTO IN FIDE_TIPO_SEGUIMIENTO_TB.ID_TIPO_SEGUIMIENTO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_TIPO_SEGUIMIENTO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_TIPO_SEGUIMIENTO = P_ID_TIPO_SEGUIMIENTO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe o ya está eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_SEGUIMIENTO_TB INSERT */

    PROCEDURE FIDE_SEGUIMIENTO_INSERT_SP(
        P_ID_ADOPCION         IN FIDE_SEGUIMIENTO_TB.ID_ADOPCION%TYPE,
        P_ID_TIPO_SEGUIMIENTO IN FIDE_SEGUIMIENTO_TB.ID_TIPO_SEGUIMIENTO%TYPE,
        P_FECHA_INICIO        IN FIDE_SEGUIMIENTO_TB.FECHA_INICIO%TYPE,
        P_FECHA_FIN           IN FIDE_SEGUIMIENTO_TB.FECHA_FIN%TYPE,
        P_COMENTARIOS         IN FIDE_SEGUIMIENTO_TB.COMENTARIOS%TYPE,
        P_ID_ESTADO           IN FIDE_SEGUIMIENTO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_SEGUIMIENTO_TB(
            ID_ADOPCION,
            ID_TIPO_SEGUIMIENTO,
            FECHA_INICIO,
            FECHA_FIN,
            COMENTARIOS,
            ID_ESTADO
        )
        VALUES(
            P_ID_ADOPCION,
            P_ID_TIPO_SEGUIMIENTO,
            P_FECHA_INICIO,
            P_FECHA_FIN,
            P_COMENTARIOS,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El seguimiento ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_SEGUIMIENTO_TB UPDATE */

    PROCEDURE FIDE_SEGUIMIENTO_UPDATE_SP(
        P_ID_SEGUIMIENTO      IN FIDE_SEGUIMIENTO_TB.ID_SEGUIMIENTO%TYPE,
        P_ID_ADOPCION         IN FIDE_SEGUIMIENTO_TB.ID_ADOPCION%TYPE,
        P_ID_TIPO_SEGUIMIENTO IN FIDE_SEGUIMIENTO_TB.ID_TIPO_SEGUIMIENTO%TYPE,
        P_FECHA_INICIO        IN FIDE_SEGUIMIENTO_TB.FECHA_INICIO%TYPE,
        P_FECHA_FIN           IN FIDE_SEGUIMIENTO_TB.FECHA_FIN%TYPE,
        P_COMENTARIOS         IN FIDE_SEGUIMIENTO_TB.COMENTARIOS%TYPE,
        P_ID_ESTADO           IN FIDE_SEGUIMIENTO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_SEGUIMIENTO_TB
        SET
            ID_ADOPCION = P_ID_ADOPCION,
            ID_TIPO_SEGUIMIENTO = P_ID_TIPO_SEGUIMIENTO,
            FECHA_INICIO = P_FECHA_INICIO,
            FECHA_FIN = P_FECHA_FIN,
            COMENTARIOS = P_COMENTARIOS,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_SEGUIMIENTO = P_ID_SEGUIMIENTO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el seguimiento.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_SEGUIMIENTO_TB DELETE LOGICO */

    PROCEDURE FIDE_SEGUIMIENTO_DELETE_SP(
        P_ID_SEGUIMIENTO IN FIDE_SEGUIMIENTO_TB.ID_SEGUIMIENTO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_SEGUIMIENTO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_SEGUIMIENTO = P_ID_SEGUIMIENTO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe o ya está eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_EVIDENCIA_TB INSERT */

    PROCEDURE FIDE_EVIDENCIA_INSERT_SP(
        P_ID_SEGUIMIENTO IN FIDE_EVIDENCIA_TB.ID_SEGUIMIENTO%TYPE,
        P_IMAGEN_URL     IN FIDE_EVIDENCIA_TB.IMAGEN_URL%TYPE,
        P_COMENTARIOS    IN FIDE_EVIDENCIA_TB.COMENTARIOS%TYPE,
        P_FECHA          IN FIDE_EVIDENCIA_TB.FECHA_EVIDENCIA%TYPE,
        P_ID_ESTADO      IN FIDE_EVIDENCIA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_EVIDENCIA_TB(
            ID_SEGUIMIENTO,
            IMAGEN_URL,
            COMENTARIOS,
            FECHA_EVIDENCIA,
            ID_ESTADO
        )
        VALUES(
            P_ID_SEGUIMIENTO,
            P_IMAGEN_URL,
            P_COMENTARIOS,
            P_FECHA,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La evidencia ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_EVIDENCIA_TB UPDATE */

    PROCEDURE FIDE_EVIDENCIA_UPDATE_SP(
        P_ID_EVIDENCIA   IN FIDE_EVIDENCIA_TB.ID_EVIDENCIA%TYPE,
        P_ID_SEGUIMIENTO IN FIDE_EVIDENCIA_TB.ID_SEGUIMIENTO%TYPE,
        P_IMAGEN_URL     IN FIDE_EVIDENCIA_TB.IMAGEN_URL%TYPE,
        P_COMENTARIOS    IN FIDE_EVIDENCIA_TB.COMENTARIOS%TYPE,
        P_FECHA          IN FIDE_EVIDENCIA_TB.FECHA_EVIDENCIA%TYPE,
        P_ID_ESTADO      IN FIDE_EVIDENCIA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_EVIDENCIA_TB
        SET
            ID_SEGUIMIENTO = P_ID_SEGUIMIENTO,
            IMAGEN_URL = P_IMAGEN_URL,
            COMENTARIOS = P_COMENTARIOS,
            FECHA_EVIDENCIA = P_FECHA,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_EVIDENCIA = P_ID_EVIDENCIA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la evidencia.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_EVIDENCIA_TB DELETE LOGICO */

    PROCEDURE FIDE_EVIDENCIA_DELETE_SP(
        P_ID_EVIDENCIA IN FIDE_EVIDENCIA_TB.ID_EVIDENCIA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_EVIDENCIA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_EVIDENCIA = P_ID_EVIDENCIA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe o ya está eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_CAMPANIA_TB INSERT */

    PROCEDURE FIDE_CAMPANIA_INSERT_SP(
        P_NOMBRE        IN FIDE_CAMPANIA_TB.NOMBRE%TYPE,
        P_DESCRIPCION   IN FIDE_CAMPANIA_TB.DESCRIPCION%TYPE,
        P_IMAGE_URL     IN FIDE_CAMPANIA_TB.IMAGE_URL%TYPE,
        P_FECHA_INICIO  IN FIDE_CAMPANIA_TB.FECHA_INICIO%TYPE,
        P_FECHA_FIN     IN FIDE_CAMPANIA_TB.FECHA_FIN%TYPE,
        P_ID_ESTADO     IN FIDE_CAMPANIA_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        IF P_IMAGE_URL IS NULL OR TRIM(P_IMAGE_URL) IS NULL THEN
            RAISE_APPLICATION_ERROR(-20005, 'La imagen de la campaña es obligatoria.');
        END IF;

        INSERT INTO FIDE_CAMPANIA_TB(
            NOMBRE,
            DESCRIPCION,
            IMAGE_URL,
            FECHA_INICIO,
            FECHA_FIN,
            ID_ESTADO
        )
        VALUES(
            P_NOMBRE,
            P_DESCRIPCION,
            P_IMAGE_URL,
            P_FECHA_INICIO,
            P_FECHA_FIN,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La campaña ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20000 THEN
                RAISE;
            END IF;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_CAMPANIA_TB UPDATE */

    PROCEDURE FIDE_CAMPANIA_UPDATE_SP(
        P_ID_CAMPANIA   IN FIDE_CAMPANIA_TB.ID_CAMPANIA%TYPE,
        P_NOMBRE        IN FIDE_CAMPANIA_TB.NOMBRE%TYPE,
        P_DESCRIPCION   IN FIDE_CAMPANIA_TB.DESCRIPCION%TYPE,
        P_IMAGE_URL     IN FIDE_CAMPANIA_TB.IMAGE_URL%TYPE,
        P_FECHA_INICIO  IN FIDE_CAMPANIA_TB.FECHA_INICIO%TYPE,
        P_FECHA_FIN     IN FIDE_CAMPANIA_TB.FECHA_FIN%TYPE,
        P_ID_ESTADO     IN FIDE_CAMPANIA_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN
        IF P_IMAGE_URL IS NULL OR TRIM(P_IMAGE_URL) IS NULL THEN
            RAISE_APPLICATION_ERROR(-20005, 'La imagen de la campaña es obligatoria.');
        END IF;

        UPDATE FIDE_CAMPANIA_TB
        SET
            NOMBRE = P_NOMBRE,
            DESCRIPCION = P_DESCRIPCION,
            IMAGE_URL = P_IMAGE_URL,
            FECHA_INICIO = P_FECHA_INICIO,
            FECHA_FIN = P_FECHA_FIN,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_CAMPANIA = P_ID_CAMPANIA;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la campaña.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20000 THEN
                RAISE;
            END IF;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_CAMPANIA_TB DELETE LOGICO */

    PROCEDURE FIDE_CAMPANIA_DELETE_SP(
        P_ID_CAMPANIA IN FIDE_CAMPANIA_TB.ID_CAMPANIA%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_CAMPANIA_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_CAMPANIA = P_ID_CAMPANIA
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la campaña o ya está eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_DONACION_TB INSERT */

    PROCEDURE FIDE_DONACION_INSERT_SP(
        P_IDENTIFICACION   IN FIDE_DONACION_TB.IDENTIFICACION%TYPE,
        P_ID_CAMPANIA      IN FIDE_DONACION_TB.ID_CAMPANIA%TYPE,
        P_MONTO            IN FIDE_DONACION_TB.MONTO%TYPE,
        P_FECHA_DONACION   IN FIDE_DONACION_TB.FECHA_DONACION%TYPE,
        P_MENSAJE          IN FIDE_DONACION_TB.MENSAJE%TYPE,
        P_ID_ESTADO        IN FIDE_DONACION_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN

        INSERT INTO FIDE_DONACION_TB(
            IDENTIFICACION,
            ID_CAMPANIA,
            MONTO,
            FECHA_DONACION,
            MENSAJE,
            ID_ESTADO
        )
        VALUES(
            P_IDENTIFICACION,
            P_ID_CAMPANIA,
            P_MONTO,
            P_FECHA_DONACION,
            P_MENSAJE,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'La donación ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_DONACION_TB UPDATE */

    PROCEDURE FIDE_DONACION_UPDATE_SP(
        P_ID_DONACION      IN FIDE_DONACION_TB.ID_DONACION%TYPE,
        P_IDENTIFICACION   IN FIDE_DONACION_TB.IDENTIFICACION%TYPE,
        P_ID_CAMPANIA      IN FIDE_DONACION_TB.ID_CAMPANIA%TYPE,
        P_MONTO            IN FIDE_DONACION_TB.MONTO%TYPE,
        P_FECHA_DONACION   IN FIDE_DONACION_TB.FECHA_DONACION%TYPE,
        P_MENSAJE          IN FIDE_DONACION_TB.MENSAJE%TYPE,
        P_ID_ESTADO        IN FIDE_DONACION_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN

        UPDATE FIDE_DONACION_TB
        SET
            IDENTIFICACION = P_IDENTIFICACION,
            ID_CAMPANIA = P_ID_CAMPANIA,
            MONTO = P_MONTO,
            FECHA_DONACION = P_FECHA_DONACION,
            MENSAJE = P_MENSAJE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_DONACION = P_ID_DONACION;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la donación.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_DONACION_TB DELETE LOGICO */

    PROCEDURE FIDE_DONACION_DELETE_SP(
        P_ID_DONACION IN FIDE_DONACION_TB.ID_DONACION%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN

        UPDATE FIDE_DONACION_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_DONACION = P_ID_DONACION
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe la donación o ya está eliminada.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TIPO_EVENTO_TB INSERT */

    PROCEDURE FIDE_TIPO_EVENTO_INSERT_SP(
        P_NOMBRE         IN FIDE_TIPO_EVENTO_TB.NOMBRE%TYPE,
        P_ID_ESTADO      IN FIDE_TIPO_EVENTO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_TIPO_EVENTO_TB(
            NOMBRE,
            ID_ESTADO
        )
        VALUES(
            P_NOMBRE,
            P_ID_ESTADO
        );

        COMMIT;
    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El tipo de evento ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TIPO_EVENTO_TB UPDATE */

    PROCEDURE FIDE_TIPO_EVENTO_UPDATE_SP(
        P_ID_TIPO_EVENTO IN FIDE_TIPO_EVENTO_TB.ID_TIPO_EVENTO%TYPE,
        P_NOMBRE         IN FIDE_TIPO_EVENTO_TB.NOMBRE%TYPE,
        P_ID_ESTADO      IN FIDE_TIPO_EVENTO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN
        UPDATE FIDE_TIPO_EVENTO_TB
        SET
            NOMBRE = P_NOMBRE,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_TIPO_EVENTO = P_ID_TIPO_EVENTO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el tipo de evento.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_TIPO_EVENTO_TB DELETE LOGICO */

    PROCEDURE FIDE_TIPO_EVENTO_DELETE_SP(
        P_ID_TIPO_EVENTO IN FIDE_TIPO_EVENTO_TB.ID_TIPO_EVENTO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN
        UPDATE FIDE_TIPO_EVENTO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_TIPO_EVENTO = P_ID_TIPO_EVENTO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el tipo de evento o ya está eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_EVENTO_PERRITO_TB INSERT */

    PROCEDURE FIDE_EVENTO_PERRITO_INSERT_SP(
        P_ID_PERRITO     IN FIDE_EVENTO_PERRITO_TB.ID_PERRITO%TYPE,
        P_ID_TIPO_EVENTO IN FIDE_EVENTO_PERRITO_TB.ID_TIPO_EVENTO%TYPE,
        P_FECHA_EVENTO   IN FIDE_EVENTO_PERRITO_TB.FECHA_EVENTO%TYPE,
        P_DETALLE        IN FIDE_EVENTO_PERRITO_TB.DETALLE%TYPE,
        P_TOTAL_GASTO    IN FIDE_EVENTO_PERRITO_TB.TOTAL_GASTO%TYPE,
        P_ID_ESTADO      IN FIDE_EVENTO_PERRITO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_EVENTO_PERRITO_TB(
            ID_PERRITO,
            ID_TIPO_EVENTO,
            FECHA_EVENTO,
            DETALLE,
            TOTAL_GASTO,
            ID_ESTADO
        )
        VALUES(
            P_ID_PERRITO,
            P_ID_TIPO_EVENTO,
            P_FECHA_EVENTO,
            P_DETALLE,
            P_TOTAL_GASTO,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El evento ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_EVENTO_PERRITO_TB UPDATE */

    PROCEDURE FIDE_EVENTO_PERRITO_UPDATE_SP(
        P_ID_EVENTO      IN FIDE_EVENTO_PERRITO_TB.ID_EVENTO%TYPE,
        P_ID_PERRITO     IN FIDE_EVENTO_PERRITO_TB.ID_PERRITO%TYPE,
        P_ID_TIPO_EVENTO IN FIDE_EVENTO_PERRITO_TB.ID_TIPO_EVENTO%TYPE,
        P_FECHA_EVENTO   IN FIDE_EVENTO_PERRITO_TB.FECHA_EVENTO%TYPE,
        P_DETALLE        IN FIDE_EVENTO_PERRITO_TB.DETALLE%TYPE,
        P_TOTAL_GASTO    IN FIDE_EVENTO_PERRITO_TB.TOTAL_GASTO%TYPE,
        P_ID_ESTADO      IN FIDE_EVENTO_PERRITO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN
        UPDATE FIDE_EVENTO_PERRITO_TB
        SET
            ID_PERRITO = P_ID_PERRITO,
            ID_TIPO_EVENTO = P_ID_TIPO_EVENTO,
            FECHA_EVENTO = P_FECHA_EVENTO,
            DETALLE = P_DETALLE,
            TOTAL_GASTO = P_TOTAL_GASTO,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_EVENTO = P_ID_EVENTO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el evento.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_EVENTO_PERRITO_TB DELETE LOGICO */

    PROCEDURE FIDE_EVENTO_PERRITO_DELETE_SP(
        P_ID_EVENTO IN FIDE_EVENTO_PERRITO_TB.ID_EVENTO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN
        UPDATE FIDE_EVENTO_PERRITO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_EVENTO = P_ID_EVENTO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el evento o ya está eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_DETALLE_EVENTO_TB INSERT */

    PROCEDURE FIDE_DETALLE_EVENTO_INSERT_SP(
        P_ID_EVENTO         IN FIDE_DETALLE_EVENTO_TB.ID_EVENTO%TYPE,
        P_COMPROBANTE_URL   IN FIDE_DETALLE_EVENTO_TB.COMPROBANTE_URL%TYPE,
        P_DESCRIPCION       IN FIDE_DETALLE_EVENTO_TB.DESCRIPCION%TYPE,
        P_MONTO             IN FIDE_DETALLE_EVENTO_TB.MONTO%TYPE,
        P_ID_ESTADO         IN FIDE_DETALLE_EVENTO_TB.ID_ESTADO%TYPE
    )
    IS
    BEGIN
        INSERT INTO FIDE_DETALLE_EVENTO_TB(
            ID_EVENTO,
            COMPROBANTE_URL,
            DESCRIPCION,
            MONTO,
            ID_ESTADO
        )
        VALUES(
            P_ID_EVENTO,
            P_COMPROBANTE_URL,
            P_DESCRIPCION,
            P_MONTO,
            P_ID_ESTADO
        );

        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'El detalle del evento ya existe.');
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_DETALLE_EVENTO_TB UPDATE */

    PROCEDURE FIDE_DETALLE_EVENTO_UPDATE_SP(
        P_ID_DETALLE_EVENTO IN FIDE_DETALLE_EVENTO_TB.ID_DETALLE_EVENTO%TYPE,
        P_ID_EVENTO         IN FIDE_DETALLE_EVENTO_TB.ID_EVENTO%TYPE,
        P_COMPROBANTE_URL   IN FIDE_DETALLE_EVENTO_TB.COMPROBANTE_URL%TYPE,
        P_DESCRIPCION       IN FIDE_DETALLE_EVENTO_TB.DESCRIPCION%TYPE,
        P_MONTO             IN FIDE_DETALLE_EVENTO_TB.MONTO%TYPE,
        P_ID_ESTADO         IN FIDE_DETALLE_EVENTO_TB.ID_ESTADO%TYPE
    )
    IS
        V_HAY_UPDATE NUMBER;
    BEGIN
        UPDATE FIDE_DETALLE_EVENTO_TB
        SET
            ID_EVENTO = P_ID_EVENTO,
            COMPROBANTE_URL = P_COMPROBANTE_URL,
            DESCRIPCION = P_DESCRIPCION,
            MONTO = P_MONTO,
            ID_ESTADO = P_ID_ESTADO
        WHERE ID_DETALLE_EVENTO = P_ID_DETALLE_EVENTO;

        V_HAY_UPDATE := SQL%ROWCOUNT;

        IF V_HAY_UPDATE = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el detalle del evento.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

    /* PROCEDURE FIDE_DETALLE_EVENTO_TB DELETE LOGICO */

    PROCEDURE FIDE_DETALLE_EVENTO_DELETE_SP(
        P_ID_DETALLE_EVENTO IN FIDE_DETALLE_EVENTO_TB.ID_DETALLE_EVENTO%TYPE
    )
    IS
        V_ESTADO NUMBER := 2;
        V_FILAS NUMBER;
    BEGIN
        UPDATE FIDE_DETALLE_EVENTO_TB
        SET ID_ESTADO = V_ESTADO
        WHERE ID_DETALLE_EVENTO = P_ID_DETALLE_EVENTO
        AND ID_ESTADO != 0;

        V_FILAS := SQL%ROWCOUNT;

        IF V_FILAS = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'No existe el detalle o ya está eliminado.');
        END IF;

        COMMIT;

    EXCEPTION
        WHEN VALUE_ERROR THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Error en tipo o tamaño de dato.');
        WHEN INVALID_NUMBER THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20003, 'Número inválido.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Error inesperado: ' || SQLERRM);
    END;

END FIDE_KALO_PKG;
/
