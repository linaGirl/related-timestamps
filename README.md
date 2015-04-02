# related-timestamps

Timestamps / soft-delete extension for the ee-orm package. This extension sets automatically timestamps when creating, updating and deleting records. You may select which timestamps to set and what their name is. The orm model & queryBuilder will get two new methods which let you control how the orm should handle soft deletes on a per transaction basis.

The extension is only applied to models that have actually the timestamp columns.

## installation

    npm install related-timestamps

## build status

[![Build Status](https://travis-ci.org/eventEmitter/related-timestamps.png?branch=master)](https://travis-ci.org/eventEmitter/related-timestamps)


## usage

To add the extension to the orm you have to initialize the extension first.
    
    var   orm           = require('ee-orm')
        , ORMTimestamps = require('related-timestamps');


    var orm = new ORM(dbConfig);

    // you may set the names of the columns here, default is created, updated, deleted
    var timestamps = new ORMTimestamps({
          created: 'createdAt'
        , updated: 'modiefiedAt'
        , deleted: 'deletedAt'
    });

    // add the extension to the orm
    orm.use(timestamps);

    orm.on('load', readyCallback);


### includeSoftDeleted method

if you have defined the deleted timestamp and a model has a coulmn with that name this method will be added to the querybuilder. It lets you query the database for soft deleted records.

    orm.myDatabase.event(['*']).includeSoftDeleted().limit(100).find(cb);



### hardDelete method

if you have defined the deleted timestamp and a model has a coulmn with that name this method will be added to the model instance. It lets you hard delete the record.
    
    // soft delete, record marked as deleted
    model.delete(cb);

    // hard delete, record atucally deleted
    model.hardDelete(cb);