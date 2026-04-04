BEGIN
    DBMS_SCHEDULER.DROP_JOB(
        job_name => 'FIDE_DESACTIVAR_CAMPANIAS_VENCIDAS_JOB',
        force => TRUE
    );
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -27475 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    DBMS_SCHEDULER.DROP_JOB(
        job_name => 'FIDE_DESACTIVAR_SEGUIMIENTOS_VENCIDOS_JOB',
        force => TRUE
    );
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -27475 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    KALO.FIDE_KALO_PKG.FIDE_DESACTIVAR_SEGUIMIENTOS_VENCIDOS_SP;
END;
/

BEGIN
    DBMS_SCHEDULER.CREATE_JOB(
        job_name => 'FIDE_DESACTIVAR_SEGUIMIENTOS_VENCIDOS_JOB',
        job_type => 'STORED_PROCEDURE',
        job_action => 'KALO.FIDE_KALO_PKG.FIDE_DESACTIVAR_SEGUIMIENTOS_VENCIDOS_SP',
        start_date => SYSTIMESTAMP,
        repeat_interval => 'FREQ=MINUTELY;INTERVAL=5',
        enabled => FALSE,
        auto_drop => FALSE,
        comments => 'Desactiva seguimientos activos cuya fecha de fin ya vencio.'
    );

    DBMS_SCHEDULER.ENABLE(
        name => 'FIDE_DESACTIVAR_SEGUIMIENTOS_VENCIDOS_JOB'
    );
END;
/

BEGIN
    KALO.FIDE_KALO_PKG.FIDE_DESACTIVAR_CAMPANIAS_VENCIDAS_SP;
END;
/

BEGIN
    DBMS_SCHEDULER.CREATE_JOB(
        job_name => 'FIDE_DESACTIVAR_CAMPANIAS_VENCIDAS_JOB',
        job_type => 'STORED_PROCEDURE',
        job_action => 'KALO.FIDE_KALO_PKG.FIDE_DESACTIVAR_CAMPANIAS_VENCIDAS_SP',
        start_date => SYSTIMESTAMP,
        repeat_interval => 'FREQ=DAILY;BYHOUR=0;BYMINUTE=5;BYSECOND=0',
        enabled => FALSE,
        auto_drop => FALSE,
        comments => 'Desactiva campañas activas cuya fecha de fin ya vencio.'
    );

    DBMS_SCHEDULER.ENABLE(
        name => 'FIDE_DESACTIVAR_CAMPANIAS_VENCIDAS_JOB'
    );
END;
/
