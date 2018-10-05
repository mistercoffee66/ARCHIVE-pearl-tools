const enquirer = new require('enquirer')();

enquirer.register('list', require('prompt-list'));

const tools = {
  EntitiesImportPrep: require('./EntitiesImportPrep'),
  TermsAndSynonymsExport: require('./TermsAndSynonymsExport'),
  WorkspaceContentReplace: require('./WorkspaceContentReplace')
}

const init = () => {
  const questions = [
    {
      type: 'list',
      name: 'tool',
      message: 'Pick a tool to run',
      choices: [
        {name: 'EntitiesImportPrep', value: 'Chatbot: Format CMS JSON to import Entities into a workspace (default)'},
        {name: 'TermsAndSynonymsExport', value: 'Chatbot: Export CMS terms and synonyms as alpha-sorted .csv'},
        {name: 'WorkspaceContentReplace', value: 'Chatbot: Replace the entire contents of an Assistant workspace'}
      ],
      default: 'EntitiesImportPrep'
    }
  ];

  return enquirer.ask(questions)
}

init()
  .then((answers) => {
    tools[answers.tool].init()
})
