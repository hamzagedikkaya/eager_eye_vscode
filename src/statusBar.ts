import * as vscode from 'vscode';

export class EagerEyeStatusBar {
  public item: vscode.StatusBarItem;

  constructor() {
    this.item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.item.command = 'eagerEye.analyze';
    this.item.tooltip = 'EagerEye: Click to analyze current file';
    this.update(0);
    this.item.show();
  }

  update(issueCount: number) {
    if (issueCount === 0) {
      this.item.text = '$(eye) EagerEye: OK';
      this.item.backgroundColor = undefined;
    } else {
      this.item.text = `$(eye) EagerEye: ${issueCount} issue(s)`;
      this.item.backgroundColor = new vscode.ThemeColor(
        'statusBarItem.warningBackground'
      );
    }
  }
}