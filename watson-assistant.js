var AssistantV1 = require('watson-developer-cloud/assistant/v1');
var bot_data = require('./workspace.json');
require('dotenv').config()
var _ = require('lodash');
var {sendToDiscovery} = require('./watson-discovery');
var sendEntities = require('./sendEntities'); 
var sendBoth = require('./sendBoth');

var assistant = new AssistantV1({
    username: process.env.ASSISTANT_USERNAME,
    password: process.env.ASSISTANT_PASSWORD,
    version: '2018-07-10',
    url: process.env.ASSISTANT_URL
});

const CART = [];
let listArray = [];
let listObj = {};

function sendToAssistant (payload) {
  return new Promise((resolve, reject) => assistant.message(payload, function(err, res){
        if (err) {
            console.log('error: ', err);
            reject(err);
        } else {
          if (!res.output) {
            res.output = {};
          } else if (res.intents[0] === undefined) {
            resolve(res);
          } else if (res.intents[0].intent === 'discovery' || res.output.text == '') {
      
            responseText = sendToDiscovery(payload.input.text);
           
            responseText.then(function(responseText) {
              _.forEach(responseText, function (item, index) {
                listArray[index] = index + 1 + ") " + item.item + " " + item.price;
              })
              res.output.text[1] = listArray.join("\n");
              res.context.discovery_result = responseText;
              listObj = responseText;
                  resolve(res);
            });
          } else if (res.intents[0].intent === 'listItems') {
            if (CART.length === "0") {
              res.output.text[0] = "Your cart is empty"
              resolve(res);
            } else {
              res.output.text[0] = CART.join("\n");
              resolve(res);
            }
          } else if (res.intents[0].intent === 'AddToCart' && (res.entities[0].entity === 'sys-number')){
            let sysNumber = res.entities[0].value;
            let obj = listObj.find(o => o.itemNum === parseInt(sysNumber));
            let formattedObj = obj.item + ": " + obj.price;
            CART.push(formattedObj);
            res.output.text[0] = "Your item is added to your cart. Your cart is: " + CART.join("\n");
            resolve(res);
          } else if (res.intents[0].intent === 'RemoveItem' && (res.entities[0].entity === 'sys-number')) {
              let itemNum = parseInt(res.entities[0].value) - 1;
              if (itemNum < 0 || itemNum > CART.length - 1) {
                res.output.text[0] = "That item is not in your cart"
                resolve(res);
              } else {
                CART.splice(itemNum, 1);
                res.output.text[0] = "Okay. Item #" + (itemNum + 1) + " was removed from your cart."
                resolve(res);
              }
          } else if (res.intents[0].intent === 'Checkout') {
            res.output.text[0] = "Okay. Your purchase is complete. Here is what you bought: " + CART.join("\n");
            CART.splice(0, CART.length);
            resolve(res);
          } else {
            resolve(res);
          }
        }
    }));
}


// Code for adding a workspace and below that adding a dialog node
// var workspace = {
//     name: 'Online shopping chatbot',
//     description: 'Workspace for online shopping assistant bot.',
//     intents: bot_data.intents,
//     entities: bot_data.entities,
//     dialog_nodes: bot_data.dialog_nodes
// };

// assistant.createWorkspace(workspace, function(err, res) {
//     if (err) {
//         console.log(err);
//     } else {
//         workspace_id = res.workspace_id;
//         console.log("Created workspace: " + workspace_id);
//     }
// });

// var params = {
//     workspace_id: 'f6f399b9-2298-4895-8a67-5e738722265b',
//     dialog_node: 'shop',
//     conditions:'#Shop',
//     output: {
//       text: 'What do you want to shop for?'
//     },
//     title: 'Shopping'
// };
  
// assistant.createDialogNode(params, function(err, response) {
//     if (err) {
//         console.error(err);
//     } else {
//         console.log(JSON.stringify(response, null, 2));
//     }
// });

module.exports = sendToAssistant;