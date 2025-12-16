import * as vscode from 'vscode';
import { execSync } from 'child_process';
import * as path from 'path';

interface EagerEyeIssue {
  detector: string;
  file_path: string;
  line_number: number;
  message: string;
  severity: 'warning' | 'error';
  suggestion?: string;
}

interface EagerEyeResult {
  summary: {
    total_issues: number;
    warnings: number;
    errors: number;
  };
  issues: EagerEyeIssue[];
}

export class EagerEyeDiagnostics {
  public collection: vscode.DiagnosticCollection;
  private issueCache: Map<string, EagerEyeIssue[]> = new Map();

  constructor() {
    this.collection = vscode.languages.createDiagnosticCollection('eager_eye');
  }

  async analyze(document: vscode.TextDocument): Promise<EagerEyeIssue[]> {
    const config = vscode.workspace.getConfiguration('eagerEye');
    const gemPath = config.get<string>('gemPath') || 'eager_eye';
    const excludePatterns = config.get<string[]>('excludePatterns') || [];

    // Check exclude patterns
    const relativePath = vscode.workspace.asRelativePath(document.uri);
    for (const pattern of excludePatterns) {
      if (this.matchesPattern(relativePath, pattern)) {
        this.collection.delete(document.uri);
        return [];
      }
    }

    try {
      const result = this.runEagerEye(gemPath, document.uri.fsPath);
      const issues = result.issues.filter(
        (i) => i.file_path === document.uri.fsPath
      );

      this.issueCache.set(document.uri.fsPath, issues);
      this.updateDiagnostics(document, issues);

      return issues;
    } catch (error) {
      console.error('EagerEye error:', error);
      return [];
    }
  }

  getIssuesForFile(filePath: string): EagerEyeIssue[] {
    return this.issueCache.get(filePath) || [];
  }

  clear() {
    this.collection.clear();
    this.issueCache.clear();
  }

  private runEagerEye(gemPath: string, filePath: string): EagerEyeResult {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const cwd = workspaceFolder || path.dirname(filePath);

    const output = execSync(`${gemPath} "${filePath}" --format json --no-fail`, {
      cwd,
      encoding: 'utf-8',
      timeout: 30000,
    });

    return JSON.parse(output);
  }

  private updateDiagnostics(
    document: vscode.TextDocument,
    issues: EagerEyeIssue[]
  ) {
    const diagnostics: vscode.Diagnostic[] = issues.map((issue) => {
      const line = document.lineAt(issue.line_number - 1);
      const range = new vscode.Range(
        issue.line_number - 1,
        line.firstNonWhitespaceCharacterIndex,
        issue.line_number - 1,
        line.text.length
      );

      const diagnostic = new vscode.Diagnostic(
        range,
        `[${issue.detector}] ${issue.message}`,
        issue.severity === 'error'
          ? vscode.DiagnosticSeverity.Error
          : vscode.DiagnosticSeverity.Warning
      );

      diagnostic.source = 'EagerEye';
      diagnostic.code = issue.detector;

      if (issue.suggestion) {
        diagnostic.message += `\n\n${issue.suggestion}`;
      }

      return diagnostic;
    });

    this.collection.set(document.uri, diagnostics);
  }

  private matchesPattern(filePath: string, pattern: string): boolean {
    // Simple glob matching
    const regex = new RegExp(
      pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*')
    );
    return regex.test(filePath);
  }
}