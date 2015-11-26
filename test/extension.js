(function() {
    'use strict';

    
    process.env.debug_sql = true;

    var   Class         = require('ee-class')
        , log           = require('ee-log')
        , assert        = require('assert')
        , fs            = require('fs')
        , QueryContext  = require('related-query-context')
        , ORM           = require('related');



    var   TimeStamps = require('../')
        , sqlStatments
        , extension
        , orm
        , db;


    // sql for test db
    sqlStatments = fs.readFileSync(__dirname+'/db.postgres.sql').toString().split(';').map(function(input){
        return input.trim().replace(/\n/gi, ' ').replace(/\s{2,}/g, ' ')
    }).filter(function(item){
        return item.length;
    });



    describe('Travis', function(){
        it('should have set up the test db', function(done){
            var config;

            try {
                config = require('../config.js').db
            } catch(e) {
                config = [{
                      type: 'postgres'
                    , schema: 'related_timestamps_test'
                    , database  : 'test'
                    , hosts: [{}]
                }];
            }

            this.timeout(5000);
            orm = new ORM(config);
            done();
        });

        it('should be able to drop & create the testing schema ('+sqlStatments.length+' raw SQL queries)', function(done){
            orm.getDatabase('related_timestamps_test').getConnection('write').then((connection) => {
                return new Promise((resolve, reject) => {
                    let exec = (index) => {
                        if (sqlStatments[index]) {
                            connection.query(new QueryContext({sql:sqlStatments[index]})).then(() => {
                                exec(index + 1);
                            }).catch(reject);
                        }
                        else resolve();
                    }

                    exec(0);
                });
            }).then(() => {
                done();
            }).catch(done);
        });
    });


    var expect = function(val, cb){
        return function(err, result){
            try {
                assert.equal(JSON.stringify(result), val);
            } catch (err) {
                return cb(err);
            }
            cb();
        }
    };


    describe('The TimeStamps Extension', function() {
        var oldDate;

        it('should not crash when instatiated', function() {
            db = orm.related_timestamps_test;
            extension = new TimeStamps();
        });


        it('should not crash when injected into the orm', function(done) {
            orm.use(extension);
            orm.load(done);
        });


        it('should set correct timestamps when inserting a new record', function(done) {
            db = orm.related_timestamps_test;
            new db.event().save(function(err, evt) {
                if (err) done(err);
                else {
                    assert.notEqual(evt.created, null);
                    assert.notEqual(evt.updated, null);
                    assert.equal(evt.deleted, null);
                    oldDate = evt.updated;
                    done();
                }
            });
        });


        it('should set correct timestamps when updating a record', function(done) {
            // wait, we nede a new timestamp
            setTimeout(function() {
                db.event({id:1}, ['*']).findOne(function(err, evt) {
                    if (err) done(err);
                    else {
                        evt.name = 'func with timestamps? no, that ain\'t fun!';
                        evt.save(function(err){
                            assert.notEqual(evt.created, null);
                            assert.notEqual(evt.updated, null);
                            assert.notEqual(evt.updated.toUTCString(), oldDate.toUTCString());
                            assert.equal(evt.deleted, null);
                            done();

                        });                 
                    }
                });
            }, 1500);
        });


        it('should set correct timestamps when deleting a record', function(done) {
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
        });


        it('should not return soft deleted records when not requested', function(done) {
            db.event({id:1}, ['*']).findOne(function(err, evt) {
                if (err) done(err);
                else {
                    assert.equal(evt, undefined);
                    done();
                }
            });
        });


        it('should return soft deleted records when requested', function(done) {
            db.event({id:1}, ['*']).includeSoftDeleted().findOne(function(err, evt) {
                if (err) done(err);
                else {
                    assert.equal(evt.id, 1);
                    done();
                }
            });
        });


        it('should hard delete records when requested', function(done) {
            db.event({id:1}, ['*']).includeSoftDeleted().findOne(function(err, evt) {
                if (err) done(err);
                else {
                    evt.hardDelete(function(err) {
                        if (err) done(err);
                        else {
                            db.event({id:1}, ['*']).findOne(function(err, evt) {
                                if (err) done(err);
                                else {
                                    assert.equal(evt, undefined);
                                    done();
                                }
                            });
                        }           
                    });                 
                }
            });
        });

        it('should not load softdeleted references', function(done) {
            new db.event({
                  name: 'so what'
                , eventInstance: [new db.eventInstance({startdate: new Date(), deleted: new Date()})]
            }).save(function(err, evt) {
                if (err) done(err);
                else {
                    db.event(['*'], {id:evt.id}).fetchEventInstance(['*']).findOne(function(err, event) {
                        if (err) done(err);
                        else {
                            assert.equal(event.eventInstance.length, 0);
                            done();
                        }
                    });
                }
            });
        })


        it ('should work when using bulk deletes', function(done) {
            new db.event({name: 'bulk delete 1'}).save().then(function() {
                return new db.event({name: 'bulk delete 2'}).save()
            }).then(function() {
                return new db.event({name: 'bulk delete 3'}).save()
            }).then(function() {
                return db.event('id').find();
            }).then(function(records) {
                if (JSON.stringify(records) !== '[{"id":2},{"id":3},{"id":4},{"id":5}]') return Promise.reject(new Error('Expected «[{"id":2},{"id":3},{"id":4},{"id":5}]», got «'+JSON.stringify(records)+'»!'))
                else return db.event({
                    id: ORM.gt(3)
                }).delete();
            }).then(function() {
                return db.event('id').find();
            }).then(function(emptyList) {
                if (JSON.stringify(emptyList) !== '[{"id":2},{"id":3}]') return Promise.reject(new Error('Expected «[{"id":2},{"id":3}]», got «'+JSON.stringify(emptyList)+'»!'))
                else return db.event('id').includeSoftDeleted().find();
            }).then(function(list) {
                if (JSON.stringify(list) !== '[{"id":2},{"id":3},{"id":4},{"id":5}]') return Promise.reject(new Error('Expected «[{"id":2},{"id":3},{"id":4},{"id":5}]», got «'+JSON.stringify(list)+'»!'))
                done();
            }).catch(done);
        })
    });
})();
