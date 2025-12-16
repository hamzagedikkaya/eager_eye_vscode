import * as vscode from 'vscode';
import { EagerEyeDiagnostics } from './diagnostics';
import { EagerEyeCodeActionProvider } from './codeActions';
import { EagerEyeStatusBar } from './statusBar';

let diagnostics: EagerEyeDiagnostics;
let statusBar: EagerEyeStatusBar;

export function activate(context: vscode.ExtensionContext) {
  console.log('EagerEye extension activated');

  diagnostics = new EagerEyeDiagnostics();
  statusBar = new EagerEyeStatusBar();

  // Register diagnostics collection
  context.subscriptions.push(diagnostics.collection);
  context.subscriptions.push(statusBar.item);

  // Register code action provider
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { language: 'ruby' },
      new EagerEyeCodeActionProvider(diagnostics),
      { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    )
  );

  // Analyze on save
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((document) => {
      if (document.languageId === 'ruby') {
        const config = vscode.workspace.getConfiguration('eagerEye');
        if (config.get('enable') && config.get('analyzeOnSave')) {
          analyzeDocument(document);
        }
      }
    })
  );

  // Analyze on open
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor && editor.document.languageId === 'ruby') {
        const config = vscode.workspace.getConfiguration('eagerEye');
        if (config.get('enable')) {
          analyzeDocument(editor.document);
        }
      }
    })
  );

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('eagerEye.analyze', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor && editor.document.languageId === 'ruby') {
        analyzeDocument(editor.document);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('eagerEye.analyzeWorkspace', async () => {
      await analyzeWorkspace();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('eagerEye.clearDiagnostics', () => {
      diagnostics.clear();
      statusBar.update(0);
    })
  );

  // Analyze current file if open
  if (vscode.window.activeTextEditor?.document.languageId === 'ruby') {
    analyzeDocument(vscode.window.activeTextEditor.document);
  }
}

async function analyzeDocument(document: vscode.TextDocument) {
  const issues = await diagnostics.analyze(document);
  statusBar.update(issues.length);
}

async function analyzeWorkspace() {
  const files = await vscode.workspace.findFiles('**/*.rb', '**/vendor/**');
  let totalIssues = 0;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'EagerEye: Analyzing workspace...',
      cancellable: true,
    },
    async (progress, token) => {
      for (let i = 0; i < files.length; i++) {
        if (token.isCancellationRequested) break;

        const document = await vscode.workspace.openTextDocument(files[i]);
        const issues = await diagnostics.analyze(document);
        totalIssues += issues.length;

        progress.report({
          increment: (100 / files.length),
          message: `${i + 1}/${files.length} files`,
        });
      }
    }
  );

  statusBar.update(totalIssues);
  vscode.window.showInformationMessage(
    `EagerEye: Found ${totalIssues} issue(s) in ${files.length} files`
  );
}

export function deactivate() {
  diagnostics?.clear();
}