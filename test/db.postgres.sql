

DROP SCHEMA IF EXISTS related_timestamps_test CASCADE;
CREATE SCHEMA related_timestamps_test;

CREATE TABLE related_timestamps_test.event (
      id                serial NOT NULL
    , name              varchar(100)
    , created           timestamp without time zone
    , updated           timestamp without time zone
    , deleted           timestamp without time zone
    , CONSTRAINT "pk_event" PRIMARY KEY (id)
);


CREATE TABLE related_timestamps_test."eventInstance" (
      id                serial NOT NULL
    , id_event          integer NOT NULL
    , startdate         timestamp without time zone
    , enddate           timestamp without time zone
    , created           timestamp without time zone
    , updated           timestamp without time zone
    , deleted           timestamp without time zone
    , CONSTRAINT "pk_eventInstance" PRIMARY KEY (id)
    , CONSTRAINT "fk_eventInstance" FOREIGN KEY (id_event) REFERENCES "related_timestamps_test"."event"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
