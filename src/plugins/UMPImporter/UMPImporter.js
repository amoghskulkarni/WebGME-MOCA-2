/*globals define*/
/*jshint node:true, browser:true*/

/**
 * Generated by PluginGenerator 2.16.0 from webgme on Thu Apr 26 2018 21:11:23 GMT-0500 (Central Daylight Time).
 * A plugin that inherits from the PluginBase. To see source code documentation about available
 * properties and methods visit %host%/docs/source/PluginBase.html.
 */

define([
    'plugin/PluginConfig',
    'plugin/PluginMessage',
    'text!./metadata.json',
    'plugin/PluginBase',
    'q',
    '../UMPImporter/Library/equation_parser',
    '../UMPImporter/Library/xml-js'
], function (
    PluginConfig,
    pluginMessage,
    pluginMetadata,
    PluginBase,
    Q) {
    'use strict';

    pluginMetadata = JSON.parse(pluginMetadata);

    /**
     * Initializes a new instance of UMPImporter.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin UMPImporter.
     * @constructor
     */
    var UMPImporter = function () {
        // Call base class' constructor.
        PluginBase.call(this);
        this.pluginMetadata = pluginMetadata;
        this.equationParser = window.mathParser;
        this.xmlParser = window.xml2json;
    };

    /**
     * Metadata associated with the plugin. Contains id, name, version, description, icon, configStructue etc.
     * This is also available at the instance at this.pluginMetadata.
     * @type {object}
     */
    UMPImporter.metadata = pluginMetadata;

    // Prototypical inheritance from PluginBase.
    UMPImporter.prototype = Object.create(PluginBase.prototype);
    UMPImporter.prototype.constructor = UMPImporter;

    UMPImporter.prototype.parseMathMLEquation = function(mathmlnode) {
        var mathmlEquationString = "";

        if (mathmlnode.name === 'math' || mathmlnode.name === 'mrow' || mathmlnode.name === 'msqrt') {
            for (var i = 0; i < mathmlnode.elements.length; i++) {
                var mathmlEquationElementObj = mathmlnode.elements[i.toString()];
                if (mathmlEquationElementObj.name === 'mi') {
                    if (mathmlEquationElementObj.elements !== undefined && mathmlEquationElementObj.elements.length > 0) {
                        var identifierChar = mathmlEquationElementObj.elements['0'].text;
                        if (identifierChar === 'π') {
                            identifierChar = 'pi';
                        }
                        mathmlEquationString += identifierChar;
                    }
                } else if (mathmlEquationElementObj.name === 'mo') {
                    if (mathmlEquationElementObj.elements !== undefined && mathmlEquationElementObj.elements.length > 0) {
                        var operatorChar = mathmlEquationElementObj.elements['0'].text;
                        if (operatorChar === '×') {
                            operatorChar = '*'
                        }
                        mathmlEquationString += operatorChar;
                    }
                } else if (mathmlEquationElementObj.name === 'mn') {
                    if (mathmlEquationElementObj.elements !== undefined && mathmlEquationElementObj.elements.length > 0) {
                        mathmlEquationString += mathmlEquationElementObj.elements['0'].text;
                        if (i < mathmlnode.elements.length - 1) {
                            var nextMathmlEquationElementObj = mathmlnode.elements[(i+1).toString()];
                            if (nextMathmlEquationElementObj.name !== 'mo') {
                                mathmlEquationString += '*';
                            }
                        }
                    }
                } else if (mathmlEquationElementObj.name === 'msub') {
                    // Process the stem first
                    var stem = this.parseMathMLEquation(mathmlEquationElementObj.elements['0']);

                    // Then the subscript
                    var subscript = this.parseMathMLEquation(mathmlEquationElementObj.elements['1']);

                    mathmlEquationString += (stem + '_' + subscript);
                } else if (mathmlEquationElementObj.name === 'mfrac') {
                    // Process the numerator first
                    var numerator = this.parseMathMLEquation(mathmlEquationElementObj.elements['0']);

                    // Then the denominator
                    var denominator = this.parseMathMLEquation(mathmlEquationElementObj.elements['1']);

                    mathmlEquationString += '(' + numerator + ')' + '/' + '(' + denominator + ')';
                } else if (mathmlEquationElementObj.name === 'msqrt') {
                    // Process the internal term first
                    var internal_term = this.parseMathMLEquation(mathmlEquationElementObj);

                    mathmlEquationString += 'sqrt(' + internal_term + ')';
                }
            }
        } else if (mathmlnode.name === 'mi') {
            if (mathmlnode.elements !== undefined && mathmlnode.elements.length > 0) {
                identifierChar = mathmlnode.elements['0'].text;
                if (identifierChar === 'π') {
                    identifierChar = 'pi';
                }
                mathmlEquationString += identifierChar;
            }
        } else if (mathmlnode.name === 'mo') {
            if (mathmlnode.elements !== undefined && mathmlnode.elements.length > 0) {
                operatorChar = mathmlnode.elements['0'].text;
                if (operatorChar === '×') {
                    operatorChar = '*'
                }
                mathmlEquationString += operatorChar;
            }
        } else if (mathmlnode.name === 'mn') {
            if (mathmlnode.elements !== undefined && mathmlnode.elements.length > 0) {
                mathmlEquationString += mathmlnode.elements['0'].text;
            }
        } else if (mathmlnode.name === 'msub') {
            // Process the stem first
            stem = this.parseMathMLEquation(mathmlnode.elements['0']);

            // Then the subscript
            subscript = this.parseMathMLEquation(mathmlnode.elements['1']);

            mathmlEquationString += (stem + '_' + subscript);
        } else if (mathmlnode.name === 'mfrac') {
            // Process the numerator first
            numerator = this.parseMathMLEquation(mathmlnode.elements['0']);

            // Then the denominator
            denominator = this.parseMathMLEquation(mathmlnode.elements['1']);

            mathmlEquationString += '(' + numerator + ')' + '/' + '(' + denominator + ')';
        }

        return mathmlEquationString;
    };

    UMPImporter.prototype.flattenTree = function (tree) {
        var ret = [];
        for (var i = 0; i < tree.length; i++) {
            if (tree[i] instanceof Array) {
                var r = this.flattenTree(tree[i]);
                for (var j = 0; j < r.length; j++) {
                    ret.push(r[j]);
                }
            } else {
                ret.push(tree[i]);
            }
        }
        return ret;
    };

    UMPImporter.prototype.parseUMPSpec = function(jsonObj) {
        var UMP = {
            name: '',
            interfaces: {
                inputs: [],
                outputs: []
            },
            routes: [],
            MOCAComponents: []
        };

        var umpObj = jsonObj.elements["0"];

        // Extract the name
        UMP.name = umpObj.attributes["name"];

        // Populate the interfaces
        for (var e = 0; e < umpObj.elements.length; e++) {
            if (umpObj.elements[e.toString()].name === 'ProductProcessInformation') {
                var ppiObj = umpObj.elements[e.toString()];

                // Find the control parameters (inputs)
                for (var p = 0; p < ppiObj.elements.length; p++) {
                    if (ppiObj.elements[p.toString()].name === 'ControlParameter') {
                        var controlParameter = {
                                'name': "",
                                'symbol': ""
                            },
                            controlParameterObj = ppiObj.elements[p.toString()];

                        for (var c = 0; c < controlParameterObj.elements.length; c++) {
                            if (controlParameterObj.elements[c.toString()].name === 'Name') {
                                controlParameter['name'] = controlParameterObj.elements[c.toString()].elements['0'].text;
                            }
                            if (controlParameterObj.elements[c.toString()].name === 'Symbol') {
                                controlParameter['symbol'] = this.parseMathMLEquation(controlParameterObj.elements[c.toString()].elements['0']);
                            }
                        }

                        UMP.interfaces.inputs.push(controlParameter);
                    }
                }

                // Find the metric of interests (outputs)
                for (p = 0; p < ppiObj.elements.length; p++) {
                    if (ppiObj.elements[p.toString()].name === 'MetricOfInterest') {
                        var moi = {
                                'name': "",
                                'symbol': ""
                            },
                            moiObj = ppiObj.elements[p.toString()];

                        for (c = 0; c < moiObj.elements.length; c++) {
                            if (moiObj.elements[c.toString()].name === 'Name') {
                                moi['name'] = moiObj.elements[c.toString()].elements['0'].text;
                            }
                            if (moiObj.elements[c.toString()].name === 'Symbol') {
                                moi['symbol'] = this.parseMathMLEquation(moiObj.elements[c.toString()].elements['0'])
                            }
                        }

                        UMP.interfaces.outputs.push(moi)
                    }
                }
            }
        }

        // Populate the MOCAComponents
        for (e = 0; e < umpObj.elements.length; e++) {
            if (umpObj.elements[e.toString()].name === 'Transformation') {
                var transformationObj = umpObj.elements[e.toString()];
                for (var t = 0; t < transformationObj.elements.length; t++) {
                    if (transformationObj.elements[t.toString()].name === 'Equation') {
                        var equationObj = transformationObj.elements[t.toString()],
                            equationName = equationObj.attributes.name;

                        console.log(equationName);

                        var mathmlEquationObj = equationObj.elements["0"].elements["0"],
                            mathmlEquationString = this.parseMathMLEquation(mathmlEquationObj),
                            parsedEquationTree = [];

                        console.log(mathmlEquationString);

                        try {
                            parsedEquationTree = this.equationParser.parse(mathmlEquationString);
                        } catch (e) {
                            if (e === this.equationParser.SyntaxError) {
                                console.log('Parser error!');
                                continue;
                            }
                        }

                        if (parsedEquationTree.length !== 0) {
                            // Flatten out the tree
                            var flattenedParsedEquationTree = this.flattenTree(parsedEquationTree['inputs']),
                                MOCAComponent = {
                                    'name': equationObj.attributes.name,
                                    'interfaces': {
                                        'output': parsedEquationTree['output'],
                                        'inputs': []
                                    },
                                    'outputFunction': mathmlEquationString
                                };
                            MOCAComponent.interfaces.inputs = flattenedParsedEquationTree
                                .filter(function (value) {
                                    return (value !== null) && (value !== 'pi');
                                });

                            MOCAComponent.interfaces.inputs = MOCAComponent.interfaces.inputs
                                .filter(function (value, index, self) {
                                    return self.indexOf(value) === index;
                                });

                            UMP.MOCAComponents.push(MOCAComponent);
                            console.log(MOCAComponent);
                        } else {
                            console.log('WARNING: Couldn\'t parse the mathematical equation for: ' + equationObj.attributes.name)
                        }
                    }
                }
            }
        }

        return UMP;
    };

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(string, plugin.PluginResult)} callback - the result callback
     */
    UMPImporter.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this,
            MOCAComponents = [];

        // Using the logger.
        // self.logger.debug('This is a debug message.');
        // self.logger.info('This is an info message.');
        // self.logger.warn('This is a warning message.');
        // self.logger.error('This is an error message.');

        // Using the coreAPI to make changes.
        var componentLibraryNode = self.activeNode;

        var xmlFile = self.core.getAttribute(componentLibraryNode, 'UMPSpec');

        var jsonString = this.xmlParser(xmlFile, {compact: false, spaces: 4});
        var jsonObj = JSON.parse(jsonString);
        self.logger.info('UMPSpec converted into JSON');

        var umpObj = self.parseUMPSpec(jsonObj);

        for (var i = 0; i < umpObj.MOCAComponents.length; i++) {
            umpObj.MOCAComponents[i].name = umpObj.MOCAComponents[i].name.replace(/ /g, '_');

            var componentObject = self.core.createNode({
                'parent': componentLibraryNode,
                'base': self.META['Component']
            });
            self.core.setAttribute(componentObject, 'OutputFunction', umpObj.MOCAComponents[i].outputFunction);
            self.core.setAttribute(componentObject, 'name', umpObj.MOCAComponents[i].name);
            self.core.setRegistry(componentObject, 'position', {x: 70 + (i * 150), y: 70});

            // Create the output port
            var outputPortObject = self.core.createNode({
                'parent': componentObject,
                'base': self.META['Unknown']
            });
            self.core.setAttribute(outputPortObject, 'name', umpObj.MOCAComponents[i].interfaces.output);
            self.core.setRegistry(outputPortObject, 'position', {x: 700, y: 70});

            // Create input ports
            for (var j = 0; j < umpObj.MOCAComponents[i].interfaces.inputs.length; j++) {
                var inputPortObject = self.core.createNode({
                    'parent': componentObject,
                    'base': self.META['Parameter']
                });
                self.core.setAttribute(inputPortObject, 'name', umpObj.MOCAComponents[i].interfaces.inputs[j]);
                self.core.setRegistry(inputPortObject, 'position', {x: 70, y: 70 + (j * 100)});
            }

            var messageObj = new pluginMessage();
            messageObj.message = 'Created "' + umpObj.MOCAComponents[i].name + '" MOCA Component.';
            self.result.addMessage(messageObj);
        }

        var ROOTNode = self.core.getParent(componentLibraryNode);

        self.core.loadChildren(ROOTNode, function (err, children) {
            if (err) {
                callback(err, self.result);
            } else {
                // We have an array of the children and can get information from them
                var i;
                for (i = 0; i < children.length; i++) {
                    var child = children[i];
                    if (self.core.getAttribute(child, 'name') === 'GroupLibrary') {
                        // Create a Group with the name of the process
                        self.logger.info('Got the GroupLibrary child');
                    }
                }
            }
        });

        // This will save the changes. If you don't want to save;
        // exclude self.save and call callback directly from this scope.
        self.save('UMPImporter updated model.')
            .then(function () {
                self.result.setSuccess(true);
                callback(null, self.result);
            })
            .catch(function (err) {
                // Result success is false at invocation.
                callback(err, self.result);
            });
        };

    return UMPImporter;
});
