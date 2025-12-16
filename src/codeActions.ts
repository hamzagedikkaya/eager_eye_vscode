import * as vscode from 'vscode';
import { EagerEyeDiagnostics } from './diagnostics';

export class EagerEyeCodeActionProvider implements vscode.CodeActionProvider {
  private diagnostics: EagerEyeDiagnostics;

  constructor(diagnostics: EagerEyeDiagnostics) {
    this.diagnostics = diagnostics;
  }

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];

    for (const diagnostic of context.diagnostics) {
      if (diagnostic.source !== 'EagerEye') continue;

      // Pluck to Select fix
      if (diagnostic.code === 'pluck_to_array') {
        const fix = this.createPluckToSelectFix(document, diagnostic);
        if (fix) actions.push(fix);
      }

      // Disable line action
      actions.push(this.createDisableLineAction(document, diagnostic));

      // Disable file action
      actions.push(this.createDisableFileAction(document, diagnostic));
    }

    return actions;
  }

  private createPluckToSelectFix(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction | null {
    const line = document.lineAt(diagnostic.range.start.line);
    const text = line.text;

    // Only fix inline pluck patterns (single line)
    if (!text.includes('.pluck(') || !text.includes('.where(')) return null;

    const action = new vscode.CodeAction(
      'Replace .pluck with .select (subquery)',
      vscode.CodeActionKind.QuickFix
    );

    action.edit = new vscode.WorkspaceEdit();
    action.edit.replace(
      document.uri,
      line.range,
      text.replace(/\.pluck\(/, '.select(')
    );

    action.isPreferred = true;
    action.diagnostics = [diagnostic];

    return action;
  }

  private createDisableLineAction(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(
      `Disable EagerEye for this line`,
      vscode.CodeActionKind.QuickFix
    );

    const line = document.lineAt(diagnostic.range.start.line);
    const detectorName = this.snakeCase(diagnostic.code as string);

    action.edit = new vscode.WorkspaceEdit();
    action.edit.insert(
      document.uri,
      new vscode.Position(diagnostic.range.start.line, line.text.length),
      `  # eager_eye:disable ${detectorName}`
    );

    action.diagnostics = [diagnostic];

    return action;
  }

  private createDisableFileAction(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(
      `Disable EagerEye for this file`,
      vscode.CodeActionKind.QuickFix
    );

    const detectorName = this.snakeCase(diagnostic.code as string);

    action.edit = new vscode.WorkspaceEdit();
    action.edit.insert(
      document.uri,
      new vscode.Position(0, 0),
      `# eager_eye:disable-file ${detectorName}\n`
    );

    action.diagnostics = [diagnostic];

    return action;
  }

  private snakeCase(str: string): string {
    // Detector codes are already in snake_case, return as-is
    return str;
  }
}