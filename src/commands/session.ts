import { Command } from 'commander';
import { SessionManager } from '../lib/session-manager.js';
import { logger } from '../utils/logger.js';
import { i18n } from '../lib/i18n.js';
import chalk from 'chalk';

export function registerSessionCommands(program: Command) {
  const sessionCmd = program
    .command('session')
    .description(i18n.t('commands.session'));

  sessionCmd
    .command('list')
    .description(i18n.t('session.list_usage'))
    .action(() => {
      const sessionManager = SessionManager.getInstance();
      const sessions = sessionManager.listSessions();
      const current = sessionManager.getCurrentSessionName();

      console.log(chalk.bold(`\n${i18n.t('session.available_sessions')}`));
      sessions.forEach(s => {
        const prefix = s.name === current ? chalk.green('* ') : '  ';
        const name = s.name === current ? chalk.green(s.name) : s.name;
        console.log(`${prefix}${name}`);
      });
      console.log('');
    });

  sessionCmd
    .command('rename')
    .description(i18n.t('session.rename_usage'))
    .argument('<oldName>', 'Current session name')
    .argument('<newName>', 'New session name')
    .action((oldName, newName) => {
      try {
        const sessionManager = SessionManager.getInstance();
        sessionManager.renameSession(oldName, newName);
        const msg = i18n.t('session.renamed_success', { oldName, newName });
        console.log(chalk.green(`✔ ${msg}`));
        logger.info(msg);
      } catch (error: any) {
        const msg = i18n.t('session.rename_failed', { error: error.message });
        console.error(chalk.red(`✖ ${msg}`));
        logger.error(msg);
        process.exit(1);
      }
    });
}
