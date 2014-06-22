!function(){

	var   Class 		= require('ee-class')
		, log 			= require('ee-log')
        , ORMExtension  = require('ee-orm-extension')
        , ORM           = require('ee-orm');



	module.exports = new Class({
        inherits: ORMExtension


		, init: function(options) {
            if (options) {
                this.created = options.created;
                this.updated = options.updated;
                this.deleted = options.deleted;
            }
		}


        /*
         * checks if this extension should be applied to the 
         * current model
         */
        , useOnModel: function(definition) {
            return definition.hasColumn(this.created) || definition.hasColumn(this.updated) || definition.hasColumn(this.deleted);
        }



        /*
         * event listener for the model beforeUpdate event, will
         * called by all models which this extension is applied to
         */
        , onBeforeUpdate: function(model, transaction, callback) {
            if (this.updated) model[this.updated] = new Date();
            callback();
        }

        /*
         * event listener for the model beforeInsert event, will
         * called by all models which this extension is applied to
         */
        , onBeforeInsert: function(model, transaction, callback) {
            if (this.updated) model[this.updated] = new Date();
            if (this.created) model[this.created] = new Date();
            callback();
        }

        /*
         * event listener for the model beforeDelete event, will
         * called by all models which this extension is applied to
         */
        , onBeforeDelete: function(model, transaction, callback) {
            var values;

            if (this.deleted && !mode._hardDelete) {
                model[this.deleted] = new Date();

                // we're soft deleting, but not saving the rest of the model
                values = {};
                values[this.deleted] = model[this.deleted];
                this.orm[model.getDatabaseName()][model.getEnityName()](model.getPrimaryKeyFilter()).update(values, function(err) {
                    if (err) callback(err);
                    else {
                        // we're interrupting the delete function
                        callback(null, true);
                    }
                }, transaction):
            }
            else callback();
        }


        /*
         * event listener for the resources beforePrepare event, will
         * called by all resources which this extension is applied to
         */
        , onBeforePrepare: function(resource, definition) {
            var name = resource.getAliasName();

            // check if we need to apply the not deleted filter
            if (resource.isRootResource() && this.deleted && !resource._dontFilterSoftDeleted) {
                // aply soft dleete filter
                if (!resource.query.filter[name]) resource.query.filter[name] = {};
                resource.query.filter[name][this.deleted] = null;
            }
        }



        /*
         * event listener for the resources beforeSelect event, will
         * called by all resources which this extension is applied to
         */
        , onBeforePrepareSubqueries: function(resource, definition) {
            var name = resource.getAliasName();

            // check if we need to apply the not deleted filter
            if (this.deleted && !resource.isRootResource() && !resource.getRootResoure()._dontFilterSoftDeleted) {
                // aply soft dleete filter
                if (!resource.query.filter[name]) resource.query.filter[name] = {};
                resource.query.filter[name][this.deleted] = null;
            }
        }


    
        /*
         * will cause all queries to include soft deleted
         * records in the result set
         * runs in the context of the querybuilder
         */
        , includeSoftDeleted: function() {
            this.getRootResource()._dontFilterSoftDeleted = true;
        }


        /*
         * instructs this extnesion to not to appl ysoft delete
         * runs in the context of the model
         */
        , hardDelete: function() {
            Class.define(this, '_hardDelete', Class(true).Writable());
            this.delete.apply(this, Array.protoype.slice.call(arguments));
        }


        /*
         * checks if this extension should be used on the current model
         * methods and properties may be installed on the models prototype
         */
        , applyModelMethods: function(definition, classDefinition) {
            if (definition.hasColumn(this.deleted) {
                
                // add this method to the model
                classDefinition.hardDelete = this.hardDelete;
            }
        }


        /*
         * checks if this extension should be used on the current querybuilder
         * methods and properties may be installed on the models prototype
         */
        , applyQueryBuilderMethods: function(definition, classDefinition) {
            if (definition.hasColumn(this.deleted) {
                
                // add this model to the querybuilder prototype
                classDefinition.includeSoftDeleted = this.includeSoftDeleted;
            }
        }
	});
}();
