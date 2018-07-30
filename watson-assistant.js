var AssistantV1 = require('watson-developer-cloud/assistant/v1');
var bot_data = require('./workspace.json')

var assistant = new AssistantV1({
    username: process.env.ASSISTANT_USERNAME,
    password: process.env.ASSISTANT_PASSWORD,
    version: '2018-07-10',
    url: process.env.ASSISTANT_URL
});

var workspace = {
    name: 'Online shopping chatbot',
    description: 'Workspace for online shopping assistant bot.',
    intents: bot_data.intents,
    entities: bot_data.entities,
    dialog_nodes: bot_data.dialog_nodes
};

assistant.createWorkspace(workspace, function(err, res) {
    if (err) {
        console.log(err);
    } else {
        workspace_id = res.workspace_id;
        console.log("Created workspace: " + workspace_id);
    }
});