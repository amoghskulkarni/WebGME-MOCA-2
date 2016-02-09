/* Generated file based on ejs templates */
define([], function() {
    return {
    "moca.components.generated.py.ejs": "#!/usr/bin/python\r\nfrom openmdao.api import Component\r\nimport sys\r\n\r\n<%\r\n// Generate the code for all the components\r\nfor (var i = 0; i < comps.length; i++) {\r\n%>\r\nclass <%= comps[i].name %>(Component):\r\n    def __init__(self):\r\n        super(<%= comps[i].name %>, self).__init__()\r\n<%\r\n    // Generate \"add_param\" statements\r\n    for (var j = 0; j < comps[i].parameters.length; j++) {\r\n        valueString = comps[i].parameters[j].value;\r\n        if (valueString.indexOf('.') === -1)\r\n            valueString += '.0';\r\n%>\r\n        self.add_param('<%= comps[i].parameters[j].name %>', val=<%= comps[i].parameters[j].value %>)\r\n<%\r\n    }\r\n%>\r\n<%\r\n    // Generate \"add_output\" and \"add_state\" statements\r\n    for (var j = 0; j < comps[i].unknowns.length; j++) {\r\n        var unknown_type;\r\n        if (comps[i].unknowns[j].type == 'Output') {\r\n            unknown_type = 'output';\r\n        } else {\r\n            unknown_type = 'state';\r\n        }\r\n        valueString = comps[i].unknowns[j].value;\r\n        if (valueString.indexOf('.') === -1)\r\n            valueString += '.0';\r\n%>\r\n        self.add_<%= unknown_type %>('<%= comps[i].unknowns[j].name %>', val=<%= comps[i].unknowns[j].value %>)\r\n<%\r\n    }\r\n%>\r\n<%\r\n    // Generate statement configuring force_fd\r\n    if (comps[i].force_fd === true) {\r\n%>\r\n        self.fd_options['force_fd'] = True\r\n<%\r\n    }\r\n%>\r\n    def solve_nonlinear(self, params, unknowns, resids):\r\n        # This is a dummy implementation of the method solve_nonlinear()\r\n        # This method should be implemented by the user as per the application\r\n\r\n        # Assigning shorthand(s) to the parameter(s)\r\n<%\r\n    // Generate statements for dummy implementation of the method\r\n    for (var j = 0; j < comps[i].parameters.length; j++) {\r\n%>\r\n        <%= comps[i].parameters[j].name %> = params['<%= comps[i].parameters[j].name %>']\r\n<%\r\n    }\r\n%>\r\n\r\n        # Assign value(s) to the unknown(s)\r\n<%\r\n    var dummyStatement = '';\r\n    for (var j = 0; j < comps[i].parameters.length; j++) {\r\n        dummyStatement += comps[i].parameters[j].name;\r\n        if (j != comps[i].parameters.length - 1)\r\n            dummyStatement += ' + ';\r\n    }\r\n    for (var j = 0; j < comps[i].unknowns.length; j++) {\r\n%>\r\n        unknowns['<%= comps[i].unknowns[j].name %>'] = <%= dummyStatement %>\r\n<%\r\n    }\r\n%>\r\n<%\r\n    // If the component is implicit, generate code for apply_nonlinear()\r\n    if (comps[i].type === 'Implicit') {\r\n%>\r\n    def apply_nonlinear(self, params, unknowns, resids):\r\n        print \"Provide the values of the residuals in apply_nonlinear() for <%= comps[i].name %>\"\r\n<%\r\n    }\r\n%>\r\n<%\r\n    // If the force_fd is set to false, generate code for linearize()\r\n    if (comps[i].force_fd === false) {\r\n%>\r\n    def linearize(self, params, unknowns, resids):\r\n        print \"Provide the Jacobian matrix in linearize() for <%= comps[i].name %>\"\r\n        # If you don't want to provide the Jacobian, set \"ForceFD\" option to True\r\n        # in MOCA model (the default setting)\r\n<%\r\n    }\r\n%>\r\n<%\r\n}\r\n%>\r\n",
    "moca.generated.bat.ejs": "echo off\r\npython <%= name %>.py\r\npause\r\n",
    "moca.groups.generated.py.ejs": "#!/usr/bin/python\r\n\r\nfrom openmdao.api import Group\r\nimport components\r\nimport sys\r\n\r\n<%\r\n// Generate the code for all the groups\r\nfor (var i = 0; i < groups.length; i++) {\r\n%>\r\nclass <%= groups[i].name %>(Group):\r\n    def __init__(self):\r\n        super(<%= groups[i].name %>, self).__init__()\r\n<%\r\n    // Generate the code for add() statements for components -\r\n    // add instances of components\r\n    for (var j = 0; j < groups[i].compInstances.length; j++) {\r\n        promotesString = '';\r\n        for (var k = 0; k < groups[i].compInstances[j].promotes.length; k++) {\r\n            promotesString += \"'\" + groups[i].compInstances[j].promotes[k] + \"'\";\r\n            if (k != groups[i].compInstances[j].promotes.length - 1)\r\n                promotesString += ', ';\r\n        }\r\n%>\r\n        self.add('<%= groups[i].compInstances[j].name %>', components.<%= groups[i].compInstances[j].base %>(), promotes=[<%- promotesString %>])\r\n<%\r\n    }\r\n%>\r\n<%\r\n    // Generate the code for add() statements for groups -\r\n    // add instances of groups\r\n    for (var j = 0; j < groups[i].groupInstances.length; j++) {\r\n        var promotesString = '';\r\n        for (var k = 0; k < groups[i].groupInstances[j].promotes.length; k++) {\r\n            promotesString += \"'\" + groups[i].groupInstances[j].promotes[k] + \"'\";\r\n            if (k != groups[i].groupInstances[j].promotes.length - 1)\r\n                promotesString += ', ';\r\n        }\r\n%>\r\n        self.add('<%= groups[i].groupInstances[j].name %>', <%= groups[i].groupInstances[j].base %>(), promotes=[<%- promotesString %>])\r\n<%\r\n    }\r\n%>\r\n<%\r\n    // Generate the code for connect() statements for connections between ports\r\n    for (var j = 0; j < groups[i].connections.length; j++) {\r\n%>\r\n        self.connect('<%= groups[i].connections[j].srcParent %>.<%= groups[i].connections[j].src %>', '<%= groups[i].connections[j].dstParent %>.<%= groups[i].connections[j].dst %>')\r\n<%\r\n    }\r\n%>\r\n<%\r\n}\r\n%>\r\n",
    "moca.problems.generated.py.ejs": "#!/usr/bin/python\r\n\r\nfrom openmdao.api import IndepVarComp, Group, Problem, ScipyOptimizer\r\nimport components\r\nimport groups\r\n\r\nclass RootGroup(Group):\r\n    def __init__(self):\r\n        super(RootGroup, self).__init__()\r\n<%\r\n// add() statements for design variables\r\nfor (var i = 0; i < desvars.length; i++) {\r\n%>\r\n        self.add('<%= desvars[i].name %>', IndepVarComp('<%= desvars[i].connection[0].dst %>', 0.0))\r\n<%\r\n}\r\n%>\r\n<%\r\n// Generate the code for add() statements for components -\r\n// add instances of components\r\nfor (var j = 0; j < compInstances.length; j++) {\r\n    promotesString = '';\r\n    for (var k = 0; k < compInstances[j].promotes.length; k++) {\r\n        promotesString += \"'\" + compInstances[j].promotes[k] + \"'\";\r\n        if (k != compInstances[j].promotes.length - 1)\r\n            promotesString += ', ';\r\n    }\r\n%>\r\n        self.add('<%= compInstances[j].name %>', components.<%= compInstances[j].base %>(), promotes=[<%- promotesString %>])\r\n<%\r\n}\r\n%>\r\n<%\r\n// Generate the code for add() statements for groups -\r\n// add instances of groups\r\nfor (var j = 0; j < groupInstances.length; j++) {\r\n    var promotesString = '';\r\n    for (var k = 0; k < groupInstances[j].promotes.length; k++) {\r\n        promotesString += \"'\" + groupInstances[j].promotes[k] + \"'\";\r\n        if (k != groupInstances[j].promotes.length - 1)\r\n            promotesString += ', ';\r\n    }\r\n%>\r\n        self.add('<%= groupInstances[j].name %>', groups.<%= groupInstances[j].base %>(), promotes=[<%- promotesString %>])\r\n<%\r\n}\r\n%>\r\n<%\r\n// Generate the code for connect() statements for connections between ports\r\nfor (var j = 0; j < connections.length; j++) {\r\n%>\r\n        self.connect('<%= connections[j].srcParent %>.<%= connections[j].src %>', '<%= connections[j].dstParent %>.<%= connections[j].dst %>')\r\n<%\r\n}\r\n%>\r\n<%\r\n// Generate the code for connect() statements for connections\r\n// between IndepVarComps' ports and ports\r\nfor (var j = 0; j < desvars.length; j++) {\r\n%>\r\n        self.connect('<%= desvars[j].name %>.<%= desvars[j].connection[0].dst %>', '<%= desvars[j].connection[0].dstParent %>.<%= desvars[j].connection[0].dst %>')\r\n<%\r\n}\r\n%>\r\n\r\n\r\nclass <%= name %>(Problem):\r\n    def __init__(self):\r\n        super(<%= name %>, self).__init__()\r\n        self.root = RootGroup()\r\n<%\r\n// Driver settings\r\nif (driver === 'ScipyOptimizer') {\r\n%>\r\n        driver = ScipyOptimizer()\r\n        driver.options['optimizer'] = 'SLSQP'\r\n<%\r\n} else {\r\n// TODO: How to record a specific output, so that we can make use of records in MOCA?\r\n%>\r\n        # driver = FullFactorialDriver(<%= doeSamples %>)\r\n        # driver.options\r\n        # rec = DumpRecorder\r\n<%\r\n}\r\n%>\r\n<%\r\n// add_desvar() statements for design variables\r\nfor (var i = 0; i < desvars.length; i++) {\r\n%>\r\n        driver.add_desvar('<%= desvars[i].name %>.<%= desvars[i].connection[0].dst %>', lower=<%= desvars[i].lower %>, upper=<%= desvars[i].upper %>)\r\n<%\r\n}\r\n%>\r\n<%\r\n// add_objective() statements for objectives\r\nfor (var i = 0; i < objectives.length; i++) {\r\n%>\r\n        driver.add_objective('<%= objectives[i].connection[0].srcParent %>.<%= objectives[i].connection[0].src %>')\r\n<%\r\n}\r\n%>\r\n<%\r\n// TODO: Constraints\r\n%>\r\n        self.driver = driver\r\n        self.setup()\r\n\r\n\r\nif __name__ == \"__main__\":\r\n\r\n    top = <%= name %>()\r\n\r\n    print \"Running the MOCA problem <%= name %>\"\r\n\r\n    top.run()\r\n\r\n    print \"Result:\"\r\n    print \"------\"\r\n<%\r\noptimalString = \"\"\r\nfor (var i = 0; i < objectives.length; i++) {\r\n    optimalString += objectives[i].connection[0].srcParent + \".\" + objectives[i].connection[0].src\r\n    if (i != objectives.length - 1)\r\n        optimalString += \", \"\r\n}\r\noptimalString = \"'\" + optimalString + \"'\"\r\n%>\r\n    print \"For optimal \" + <%- optimalString %>\r\n<%\r\nfor (var i = 0; i < desvars.length; i++) {\r\n%>\r\n    print(\"<%= desvars[i].connection[0].dstParent %>.<%= desvars[i].connection[0].dst %> = %f\" % (top['<%= desvars[i].connection[0].dstParent %>.<%= desvars[i].connection[0].dst %>']))\r\n<%\r\n}\r\n%>\r\n"
}});