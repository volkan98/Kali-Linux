import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialTerminalState,
  executeTerminalCommand,
  evaluateTerminalObjectives,
} from './terminalEngine';
import {
  createInitialWindowsLabState,
  updateSharePermission,
} from './windowsLabEngine';

test('terminal VFS navigation, mkdir, echo redirection, and chmod persist state', () => {
  let state = createInitialTerminalState();

  let res = executeTerminalCommand(state, 'pwd');
  assert.equal(res.output, '/home/student');
  state = res.nextState;

  res = executeTerminalCommand(state, 'mkdir audit_lab');
  assert.equal(res.output, '');
  state = res.nextState;

  res = executeTerminalCommand(state, 'cd audit_lab');
  state = res.nextState;
  assert.equal(state.cwd, '/home/student/audit_lab');

  res = executeTerminalCommand(state, 'echo "Verifica SMB ok" > report.txt');
  state = res.nextState;

  res = executeTerminalCommand(state, 'cat report.txt');
  assert.equal(res.output, 'Verifica SMB ok');
  state = res.nextState;

  res = executeTerminalCommand(state, 'cd ..');
  state = res.nextState;
  res = executeTerminalCommand(state, 'chmod 600 chiave_lab.pem');
  state = res.nextState;
  res = executeTerminalCommand(state, 'ls -l chiave_lab.pem');
  assert.match(res.output, /^-rw-------/);

  res = executeTerminalCommand(state, 'grep Failed /var/log/auth.log');
  assert.match(res.output, /198\.51\.100\.44/);
  state = res.nextState;

  res = executeTerminalCommand(state, 'nmap 10.10.20.15');
  assert.match(res.output, /445\/tcp\s+open/);
  state = res.nextState;

  const objectives = evaluateTerminalObjectives(state);
  assert.equal(objectives.every((o) => o.passed), true);
});

test('terminal smbclient reflects live WindowsLabState permission edits', () => {
  const term = createInitialTerminalState();
  let win = createInitialWindowsLabState();

  const before = executeTerminalCommand(term, 'smbclient //10.10.20.15/Backup_IT -U guest_user', win);
  assert.match(before.output, /Connesso a \/\/10\.10\.20\.15\/Backup_IT/);

  win = updateSharePermission(win, 'Backup_IT', 'share', 'Everyone', 'NONE');
  win = updateSharePermission(win, 'Backup_IT', 'ntfs', 'Everyone', 'NONE');

  const after = executeTerminalCommand(term, 'smbclient //10.10.20.15/Backup_IT -U guest_user', win);
  assert.match(after.output, /NT_STATUS_ACCESS_DENIED/);
});
