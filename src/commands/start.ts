import inquirer from 'inquirer';
import { spawn } from 'child_process';
import { SessionManager } from '../lib/session-manager.js';
import { i18n } from '../lib/i18n.js';
import { logger } from '../utils/logger.js';
import chalk from 'chalk';

export async function startCommand(args: string[] = []) {
  const sessionManager = SessionManager.getInstance();
  const currentSession = sessionManager.getCurrentSessionName();
  const sessions = sessionManager.listSessions();

  console.log(chalk.cyan(`Current Session: ${currentSession}`));

  // If args has a session name, use it directly? 
  // Maybe `chelper start <session_name>`
  let targetSession = args[0];

  if (!targetSession) {
    const choices: any[] = sessions.map(s => s.name);
    choices.push(new inquirer.Separator());
    choices.push({ name: '+ Create New Session', value: '__new__' });
    
    // Add delete option? Maybe later.

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'session',
        message: 'Select a session to start:',
        choices: choices,
        default: currentSession
      }
    ]);

    if (answer.session === '__new__') {
      const newSessionAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Enter new session name:',
          validate: (input) => {
            if (!input) return 'Name cannot be empty';
            if (sessions.find(s => s.name === input)) return 'Session already exists';
            // valid filename check?
            if (/[<>:"/\\|?*]/.test(input)) return 'Invalid characters in name';
            return true;
          }
        }
      ]);
      targetSession = newSessionAnswer.name;
      await sessionManager.createSession(targetSession);
    } else {
      targetSession = answer.session;
    }
  }

  // Save current session state before switching (if we were in a session)
  // Actually, we should always save the *current* state to the *previous* session name
  // But wait, `currentSession` is what we are currently in.
  // So we save `~/.claude` to `sessions/<currentSession>`.
  
  console.log(chalk.blue(`Saving session '${currentSession}'...`));
  sessionManager.saveCurrentSession(currentSession);

  // Restore target session
  console.log(chalk.blue(`Restoring session '${targetSession}'...`));
  sessionManager.restoreSession(targetSession);

  console.log(chalk.green(`Starting Claude Code in session '${targetSession}'...`));
  
  // Run claude
  // We need to find the executable. Assuming 'claude' is in PATH.
  // On Windows it might be 'claude.cmd' or 'claude.exe'.
  const cmd = process.platform === 'win32' ? 'claude.cmd' : 'claude';
  
  try {
    const child = spawn(cmd, [], {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      console.log(chalk.blue(`Claude Code exited with code ${code}. Saving session '${targetSession}'...`));
      sessionManager.saveCurrentSession(targetSession);
      console.log(chalk.green('Session saved.'));
    });
    
    // Wait for child to exit?
    // Since we are async, we need to wait promise.
    await new Promise((resolve) => {
        child.on('exit', resolve);
        child.on('error', (err) => {
            console.error(chalk.red(`Failed to start claude: ${err.message}`));
            resolve(null);
        });
    });

  } catch (error) {
    logger.logError('startCommand', error);
    console.error(chalk.red('Error running Claude Code. Make sure it is installed and in your PATH.'));
  }
}
