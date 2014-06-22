

DROP SCHEMA IF EXISTS ee_orm_timestamps_test CASCADE;
CREATE SCHEMA ee_orm_timestamps_test;

CREATE TABLE ee_orm_timestamps_test.event (
      id                serial NOT NULL
    , name              varchar(100)
    , created           timestamp without time zone
    , updated           timestamp without time zone
    , deleted           timestamp without time zone
    , CONSTRAINT "pk_event" PRIMARY KEY (id)
);
