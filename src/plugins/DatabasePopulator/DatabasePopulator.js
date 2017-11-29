/*globals define*/
/*jshint node:true, browser:true*/

/**
 * Generated by PluginGenerator 2.16.0 from webgme on Wed Nov 22 2017 00:37:08 GMT-0600 (Central Standard Time).
 * A plugin that inherits from the PluginBase. To see source code documentation about available
 * properties and methods visit %host%/docs/source/PluginBase.html.
 */

define([
    'plugin/PluginConfig',
    'text!./metadata.json',
    'plugin/PluginBase',
    'q'
], function (
    PluginConfig,
    pluginMetadata,
    PluginBase,
    Q) {
    'use strict';

    pluginMetadata = JSON.parse(pluginMetadata);

    /**
     * Initializes a new instance of DatabasePopulator.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin DatabasePopulator.
     * @constructor
     */
    var DatabasePopulator = function () {
        // Call base class' constructor.
        PluginBase.call(this);
        this.pluginMetadata = pluginMetadata;
    };

    /**
     * Metadata associated with the plugin. Contains id, name, version, description, icon, configStructue etc.
     * This is also available at the instance at this.pluginMetadata.
     * @type {object}
     */
    DatabasePopulator.metadata = pluginMetadata;

    // Prototypical inheritance from PluginBase.
    DatabasePopulator.prototype = Object.create(PluginBase.prototype);
    DatabasePopulator.prototype.constructor = DatabasePopulator;

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(string, plugin.PluginResult)} callback - the result callback
     */
    DatabasePopulator.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this,
            nodeObject;
        nodeObject = this.activeNode;

        self.getDataModel(nodeObject)
            .then(function(dataModel) {
                // Parse the datamodel for csv content
                var papaparse = require('papaparse');
                if (dataModel.databases.length === 1) {
                    var papaConfig = {
                        header: true
                    };
                    var csvData = papaparse.parse(dataModel.databases[0].csv, papaConfig),
                        datapoints = [];

                    // if the CSV file contains three columns ('measurement' and 'value' and 'timestamp'),
                    // then log the data into the mtconnect database
                    // else, raise the error
                    if (csvData.meta.fields.indexOf('measurement') === -1) {
                        throw new Error('"measurement" column is missing in the CSV input')
                    } else if (csvData.meta.fields.indexOf('value') === -1) {
                        throw new Error('"value" column is missing in the CSV input')
                    } else if (csvData.meta.fields.indexOf('timestamp') === -1) {
                        throw new Error('"timestamp" column is missing in the CSV input')
                    } else {
                        var Influx = require('influx');
                        const influx = new Influx.InfluxDB({
                            host: dataModel.databases[0].dbHost,
                            database: dataModel.databases[0].dbName
                        });
                        for (var i = 0; i < csvData.data.length; i++) {
                            var tags = {};
                            for (var j = 0; j < csvData.meta.fields.length; j++) {
                                var fieldName = csvData.meta.fields[j];
                                if (!(fieldName === 'measurement' || fieldName === 'value' || fieldName === 'timestamp')) {
                                    tags[fieldName] = csvData.data[i][fieldName];
                                }
                            }
                            datapoints.push({
                                measurement: csvData.data[i]['measurement'],
                                tags: tags,
                                fields: {value: csvData.data[i]['value']},
                                timestamp: Date.parse(csvData.data[i]['timestamp']) * 1000000
                            });
                        }
                        return influx.writePoints(datapoints)
                    }
                } else {
                    // TODO: Use workers in case of multiple database elements
                }
            })
            .then(function () {
                self.result.setSuccess(true);
                callback(null, self.result);
            })
            .catch(function (err) {
                // Result success is false at invocation.
                callback(err, self.result);
            });

    };

    /**
     * The method which parses the database library or a database depending upon where the plugin is invoked from.
     * After parsing, the method generates an in-memory object for the same which is used to populate the
     * databases in question.
     * @param rootNode - The node (or the modeling element) where the plugin is invoked from
     * @returns The object for the node to be parsed
     */
    DatabasePopulator.prototype.getDataModel = function(rootNode) {
        var self = this,
            metaType = self.core.getAttribute(self.getMetaType(rootNode), 'name'),
            dataModel = {
                databases: []
            },
            databasePromises = [];

        if (metaType === 'DatabaseLibrary') {
            return self.core.loadChildren(rootNode)
                .then(function (children) {
                    for (var i = 0; i < children.length; i++) {
                        if (self.core.getAttribute(self.getMetaType(children[i]) , 'name') === 'Database') {
                            databasePromises.push(self.getDatabaseData(children[i]));
                        }
                    }

                    return Q.all(databasePromises);
                })
                .then(function (databasesData) {
                    dataModel.databases = databasesData;
                    return dataModel;
                })
        } else if (metaType === 'Database') {
            var listToAssign = [];
            listToAssign.push(self.getDatabaseData(rootNode));
            dataModel.databases = listToAssign;
            return Promise.resolve(dataModel);
        }
    };

    /**
     * The method to parse a database modeling element
     * @param databaseNode
     * @returns {{name: (GmeCommon.OutAttr | string | *), mtcAgentURL: (GmeCommon.OutAttr | string | *), csv: (GmeCommon.OutAttr | string | *), dbName: (GmeCommon.OutAttr | string | *), dbHost: (GmeCommon.OutAttr | string | *), dbPortNo: (GmeCommon.OutAttr | string | *)}}
     *  - The object containing the data for the node to be parsed
     */
    DatabasePopulator.prototype.getDatabaseData = function(databaseNode) {
        return {
            name: this.core.getAttribute(databaseNode, 'name'),
            mtcAgentURL: this.core.getAttribute(databaseNode, 'MTConnectAgentURL'),
            csv: this.core.getAttribute(databaseNode, 'CSVFile'),
            dbName: this.core.getAttribute(databaseNode, 'DBName'),
            dbHost: this.core.getAttribute(databaseNode, 'Host'),
            dbPortNo: this.core.getAttribute(databaseNode, 'Port')
        };
    };

    return DatabasePopulator;
});
