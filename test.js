

    var Class       = require('ee-class')
        , log       = require('ee-log')
        , async     = require('ee-async')
        , ORM       = require('ee-orm')
        , project   = require('ee-project')
        , Extension = require('./');

    var orm = new ORM(project.config.db);

    orm.use(new Extension());

    orm.on('load', function(err) {
        log('orm loaded');
        var   db = orm.ee_orm_timestamps_test
            , start;
   

        var done = function(err, data){
            if (err) log(err);
            if (data && data.dir) data.dir();
        }

        db.event({id:1}, ['*']).findOne(function(err, evt) {
            if (err) done(err);
            else {
                evt.delete(function(err) {
                    assert.notEqual(evt.created, null);
                    assert.notEqual(evt.updated, null);
                    assert.notEqual(evt.deleted, null);
                    done();
                });                 
            }
        });

       // db.event({id:1}, ['*']).includeSoftDeleted().findOne(done);
   
    });