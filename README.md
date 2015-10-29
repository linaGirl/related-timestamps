# related-timestamps

[![npm](https://img.shields.io/npm/dm/related-timestamps.svg?style=flat-square)](https://www.npmjs.com/package/related-timestamps)
[![Travis](https://img.shields.io/travis/eventEmitter/related-timestamps.svg?style=flat-square)](https://travis-ci.org/eventEmitter/related-timestamps)
[![node](https://img.shields.io/node/v/related-timestamps.svg?style=flat-square)](https://nodejs.org/)


Timestamps / soft-delete extension for the [Related ORM](https://www.npmjs.com/package/related). This extension sets automatically timestamps when creating, updating and deleting records. 
You may select which timestamps to set and what the names of the columns are.

The extension is only applied to models that have the timestamp columns.

## API

To add the extension to the orm you have to initialize the extension first.
    
    var   Related       = require('related')
        , ORMTimestamps = require('related-timestamps');


    var orm = new Related(dbConfig);

    // you may set the names of the columns here, default is created, updated, deleted
    var timestamps = new ORMTimestamps({
          created: 'createdAt'
        , updated: 'modiefiedAt'
        , deleted: 'deletedAt'
    });

    // add the extension to the orm
    orm.use(timestamps);

    orm.load().then((related) => {
        log('the orm is ready and has now built in timestamp support');
    });


### includeSoftDeleted method

if you have defined the deleted timestamp and a model has a coulmn with that name 
this method will be added to the querybuilder. It lets you query the database for 
soft deleted records.

    orm.myDatabase.event(['*']).includeSoftDeleted().limit(100).find(cb);



### hardDelete method

if you have defined the deleted timestamp and a model has a coulmn with that name 
this method will be added to the model instance. It lets you hard delete the record.
    
    // soft delete, record marked as deleted
    model.delete(cb);

    // hard delete, record atucally deleted
    model.hardDelete(cb);