const watson = require('watson-developer-cloud');
const path = require('path');
const enquirer = new require('enquirer')();

const config = require('./config');

enquirer.register('list', require('prompt-list'));

module.exports = class WorkspaceContentReplace {
  static async init() {
    const question = [
      {
        type: 'list',
        name: 'env',
        message: 'Pick a workspace to overwrite',
        choices: [
          {name: 'local_test', value: 'local TEST (default)'},
          {name: 'local', value: 'local'},
          {name: 'dev', value: 'dev'}
        ],
        default: 'local_test'
      },
      {
        message: 'Enter the input JSON path',
        name: 'inputPath'
      }
    ];
    const { env, inputPath } = await enquirer.ask(question);
    const confirmation = {
      type: 'list',
      name: 'confirmed',
      message: `*** WARNING *** \nTHIS WILL REPLACE THE ENTIRE **${env}** WORKSPACE WITH DATA FROM ${inputPath}! \nAre you sure?`,
      choices: [
        {name: false, value: 'No, cancel! (default)'},
        {name: true, value: 'Yes, I\'m sure.'}
      ],
      default: false
    };
    const { confirmed } = await enquirer.ask(confirmation);
    if (confirmed) {
      try {
        const { credentials, workspace_id } = config[env];
        const payload = await formatInput({ inputPath, workspace_id, env });
        const result = await updateWorkspace({ payload, credentials, workspace_id });
        return console.log('Watson API response: ', result);
      } catch (err) {
        console.error(err);
      }
    } else {
      console.log('canceled')
      return false;
    }
  }
}

const formatInput = ({ inputPath, workspace_id, env }) => {
  const input = require(path.resolve(process.cwd(), inputPath));
  const dialog_nodes = input.dialog_nodes.map((node) => {
    return Object.assign({}, node, {node_type: node.type})
  })
  return Object.assign({}, input, {
    dialog_nodes,
    workspace_id,
    name: `Pearl Assist ${env}`,
    description: `imported ${new Date()}`
  })
}

const updateWorkspace = async ({ payload, credentials }) => {
  const assistant = new watson.AssistantV1(credentials);
  return new Promise((resolve, reject) => {
    if (!assistant) {
      reject(new Error('Error creating Watson Assistant instance'));
    }
    assistant.updateWorkspace(payload, (err, assistantResponse) => {
      if (err) {
        console.error('error:', err.message);
        reject(new Error('Error sending message to Watson Assistant'));
      } else {
        resolve(assistantResponse);
      }
    });
  })
}
