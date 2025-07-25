#!/usr/bin/env node
import require$$0$7 from 'os';
import process$1 from 'process';
import cluster from 'cluster';
import require$$0$1 from 'node:events';
import require$$1 from 'node:child_process';
import require$$2 from 'node:path';
import require$$3 from 'node:fs';
import require$$4 from 'node:process';
import tty from 'node:tty';
import require$$0$8 from 'node:buffer';
import require$$1$1 from 'node:http';
import require$$0$4 from 'node:url';
import require$$0$5 from 'node:util';
import require$$2$1 from 'node:https';
import require$$0$3 from 'events';
import require$$4$1 from 'net';
import require$$0$2 from 'buffer';
import require$$2$2 from 'stream';
import require$$1$2 from 'node:net';
import require$$3$1 from 'node:stream';
import require$$0$6 from 'http';
import require$$1$3 from 'https';
import require$$1$4 from 'tty';
import require$$1$5 from 'util';
import require$$3$2 from 'dns';
import require$$5 from 'tls';
import require$$6 from 'url';

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function getAugmentedNamespace(n) {
  if (Object.prototype.hasOwnProperty.call(n, '__esModule')) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			var isInstance = false;
      try {
        isInstance = this instanceof a;
      } catch {}
			if (isInstance) {
        return Reflect.construct(f, arguments, this.constructor);
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var commander$1 = {};

var argument = {};

var error = {};

/**
 * CommanderError class
 */

var hasRequiredError;

function requireError () {
	if (hasRequiredError) return error;
	hasRequiredError = 1;
	class CommanderError extends Error {
	  /**
	   * Constructs the CommanderError class
	   * @param {number} exitCode suggested exit code which could be used with process.exit
	   * @param {string} code an id string representing the error
	   * @param {string} message human-readable description of the error
	   */
	  constructor(exitCode, code, message) {
	    super(message);
	    // properly capture stack trace in Node.js
	    Error.captureStackTrace(this, this.constructor);
	    this.name = this.constructor.name;
	    this.code = code;
	    this.exitCode = exitCode;
	    this.nestedError = undefined;
	  }
	}

	/**
	 * InvalidArgumentError class
	 */
	class InvalidArgumentError extends CommanderError {
	  /**
	   * Constructs the InvalidArgumentError class
	   * @param {string} [message] explanation of why argument is invalid
	   */
	  constructor(message) {
	    super(1, 'commander.invalidArgument', message);
	    // properly capture stack trace in Node.js
	    Error.captureStackTrace(this, this.constructor);
	    this.name = this.constructor.name;
	  }
	}

	error.CommanderError = CommanderError;
	error.InvalidArgumentError = InvalidArgumentError;
	return error;
}

var hasRequiredArgument;

function requireArgument () {
	if (hasRequiredArgument) return argument;
	hasRequiredArgument = 1;
	const { InvalidArgumentError } = requireError();

	class Argument {
	  /**
	   * Initialize a new command argument with the given name and description.
	   * The default is that the argument is required, and you can explicitly
	   * indicate this with <> around the name. Put [] around the name for an optional argument.
	   *
	   * @param {string} name
	   * @param {string} [description]
	   */

	  constructor(name, description) {
	    this.description = description || '';
	    this.variadic = false;
	    this.parseArg = undefined;
	    this.defaultValue = undefined;
	    this.defaultValueDescription = undefined;
	    this.argChoices = undefined;

	    switch (name[0]) {
	      case '<': // e.g. <required>
	        this.required = true;
	        this._name = name.slice(1, -1);
	        break;
	      case '[': // e.g. [optional]
	        this.required = false;
	        this._name = name.slice(1, -1);
	        break;
	      default:
	        this.required = true;
	        this._name = name;
	        break;
	    }

	    if (this._name.length > 3 && this._name.slice(-3) === '...') {
	      this.variadic = true;
	      this._name = this._name.slice(0, -3);
	    }
	  }

	  /**
	   * Return argument name.
	   *
	   * @return {string}
	   */

	  name() {
	    return this._name;
	  }

	  /**
	   * @package
	   */

	  _concatValue(value, previous) {
	    if (previous === this.defaultValue || !Array.isArray(previous)) {
	      return [value];
	    }

	    return previous.concat(value);
	  }

	  /**
	   * Set the default value, and optionally supply the description to be displayed in the help.
	   *
	   * @param {*} value
	   * @param {string} [description]
	   * @return {Argument}
	   */

	  default(value, description) {
	    this.defaultValue = value;
	    this.defaultValueDescription = description;
	    return this;
	  }

	  /**
	   * Set the custom handler for processing CLI command arguments into argument values.
	   *
	   * @param {Function} [fn]
	   * @return {Argument}
	   */

	  argParser(fn) {
	    this.parseArg = fn;
	    return this;
	  }

	  /**
	   * Only allow argument value to be one of choices.
	   *
	   * @param {string[]} values
	   * @return {Argument}
	   */

	  choices(values) {
	    this.argChoices = values.slice();
	    this.parseArg = (arg, previous) => {
	      if (!this.argChoices.includes(arg)) {
	        throw new InvalidArgumentError(
	          `Allowed choices are ${this.argChoices.join(', ')}.`,
	        );
	      }
	      if (this.variadic) {
	        return this._concatValue(arg, previous);
	      }
	      return arg;
	    };
	    return this;
	  }

	  /**
	   * Make argument required.
	   *
	   * @returns {Argument}
	   */
	  argRequired() {
	    this.required = true;
	    return this;
	  }

	  /**
	   * Make argument optional.
	   *
	   * @returns {Argument}
	   */
	  argOptional() {
	    this.required = false;
	    return this;
	  }
	}

	/**
	 * Takes an argument and returns its human readable equivalent for help usage.
	 *
	 * @param {Argument} arg
	 * @return {string}
	 * @private
	 */

	function humanReadableArgName(arg) {
	  const nameOutput = arg.name() + (arg.variadic === true ? '...' : '');

	  return arg.required ? '<' + nameOutput + '>' : '[' + nameOutput + ']';
	}

	argument.Argument = Argument;
	argument.humanReadableArgName = humanReadableArgName;
	return argument;
}

var command = {};

var help = {};

var hasRequiredHelp;

function requireHelp () {
	if (hasRequiredHelp) return help;
	hasRequiredHelp = 1;
	const { humanReadableArgName } = requireArgument();

	/**
	 * TypeScript import types for JSDoc, used by Visual Studio Code IntelliSense and `npm run typescript-checkJS`
	 * https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#import-types
	 * @typedef { import("./argument.js").Argument } Argument
	 * @typedef { import("./command.js").Command } Command
	 * @typedef { import("./option.js").Option } Option
	 */

	// Although this is a class, methods are static in style to allow override using subclass or just functions.
	class Help {
	  constructor() {
	    this.helpWidth = undefined;
	    this.minWidthToWrap = 40;
	    this.sortSubcommands = false;
	    this.sortOptions = false;
	    this.showGlobalOptions = false;
	  }

	  /**
	   * prepareContext is called by Commander after applying overrides from `Command.configureHelp()`
	   * and just before calling `formatHelp()`.
	   *
	   * Commander just uses the helpWidth and the rest is provided for optional use by more complex subclasses.
	   *
	   * @param {{ error?: boolean, helpWidth?: number, outputHasColors?: boolean }} contextOptions
	   */
	  prepareContext(contextOptions) {
	    this.helpWidth = this.helpWidth ?? contextOptions.helpWidth ?? 80;
	  }

	  /**
	   * Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one.
	   *
	   * @param {Command} cmd
	   * @returns {Command[]}
	   */

	  visibleCommands(cmd) {
	    const visibleCommands = cmd.commands.filter((cmd) => !cmd._hidden);
	    const helpCommand = cmd._getHelpCommand();
	    if (helpCommand && !helpCommand._hidden) {
	      visibleCommands.push(helpCommand);
	    }
	    if (this.sortSubcommands) {
	      visibleCommands.sort((a, b) => {
	        // @ts-ignore: because overloaded return type
	        return a.name().localeCompare(b.name());
	      });
	    }
	    return visibleCommands;
	  }

	  /**
	   * Compare options for sort.
	   *
	   * @param {Option} a
	   * @param {Option} b
	   * @returns {number}
	   */
	  compareOptions(a, b) {
	    const getSortKey = (option) => {
	      // WYSIWYG for order displayed in help. Short used for comparison if present. No special handling for negated.
	      return option.short
	        ? option.short.replace(/^-/, '')
	        : option.long.replace(/^--/, '');
	    };
	    return getSortKey(a).localeCompare(getSortKey(b));
	  }

	  /**
	   * Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one.
	   *
	   * @param {Command} cmd
	   * @returns {Option[]}
	   */

	  visibleOptions(cmd) {
	    const visibleOptions = cmd.options.filter((option) => !option.hidden);
	    // Built-in help option.
	    const helpOption = cmd._getHelpOption();
	    if (helpOption && !helpOption.hidden) {
	      // Automatically hide conflicting flags. Bit dubious but a historical behaviour that is convenient for single-command programs.
	      const removeShort = helpOption.short && cmd._findOption(helpOption.short);
	      const removeLong = helpOption.long && cmd._findOption(helpOption.long);
	      if (!removeShort && !removeLong) {
	        visibleOptions.push(helpOption); // no changes needed
	      } else if (helpOption.long && !removeLong) {
	        visibleOptions.push(
	          cmd.createOption(helpOption.long, helpOption.description),
	        );
	      } else if (helpOption.short && !removeShort) {
	        visibleOptions.push(
	          cmd.createOption(helpOption.short, helpOption.description),
	        );
	      }
	    }
	    if (this.sortOptions) {
	      visibleOptions.sort(this.compareOptions);
	    }
	    return visibleOptions;
	  }

	  /**
	   * Get an array of the visible global options. (Not including help.)
	   *
	   * @param {Command} cmd
	   * @returns {Option[]}
	   */

	  visibleGlobalOptions(cmd) {
	    if (!this.showGlobalOptions) return [];

	    const globalOptions = [];
	    for (
	      let ancestorCmd = cmd.parent;
	      ancestorCmd;
	      ancestorCmd = ancestorCmd.parent
	    ) {
	      const visibleOptions = ancestorCmd.options.filter(
	        (option) => !option.hidden,
	      );
	      globalOptions.push(...visibleOptions);
	    }
	    if (this.sortOptions) {
	      globalOptions.sort(this.compareOptions);
	    }
	    return globalOptions;
	  }

	  /**
	   * Get an array of the arguments if any have a description.
	   *
	   * @param {Command} cmd
	   * @returns {Argument[]}
	   */

	  visibleArguments(cmd) {
	    // Side effect! Apply the legacy descriptions before the arguments are displayed.
	    if (cmd._argsDescription) {
	      cmd.registeredArguments.forEach((argument) => {
	        argument.description =
	          argument.description || cmd._argsDescription[argument.name()] || '';
	      });
	    }

	    // If there are any arguments with a description then return all the arguments.
	    if (cmd.registeredArguments.find((argument) => argument.description)) {
	      return cmd.registeredArguments;
	    }
	    return [];
	  }

	  /**
	   * Get the command term to show in the list of subcommands.
	   *
	   * @param {Command} cmd
	   * @returns {string}
	   */

	  subcommandTerm(cmd) {
	    // Legacy. Ignores custom usage string, and nested commands.
	    const args = cmd.registeredArguments
	      .map((arg) => humanReadableArgName(arg))
	      .join(' ');
	    return (
	      cmd._name +
	      (cmd._aliases[0] ? '|' + cmd._aliases[0] : '') +
	      (cmd.options.length ? ' [options]' : '') + // simplistic check for non-help option
	      (args ? ' ' + args : '')
	    );
	  }

	  /**
	   * Get the option term to show in the list of options.
	   *
	   * @param {Option} option
	   * @returns {string}
	   */

	  optionTerm(option) {
	    return option.flags;
	  }

	  /**
	   * Get the argument term to show in the list of arguments.
	   *
	   * @param {Argument} argument
	   * @returns {string}
	   */

	  argumentTerm(argument) {
	    return argument.name();
	  }

	  /**
	   * Get the longest command term length.
	   *
	   * @param {Command} cmd
	   * @param {Help} helper
	   * @returns {number}
	   */

	  longestSubcommandTermLength(cmd, helper) {
	    return helper.visibleCommands(cmd).reduce((max, command) => {
	      return Math.max(
	        max,
	        this.displayWidth(
	          helper.styleSubcommandTerm(helper.subcommandTerm(command)),
	        ),
	      );
	    }, 0);
	  }

	  /**
	   * Get the longest option term length.
	   *
	   * @param {Command} cmd
	   * @param {Help} helper
	   * @returns {number}
	   */

	  longestOptionTermLength(cmd, helper) {
	    return helper.visibleOptions(cmd).reduce((max, option) => {
	      return Math.max(
	        max,
	        this.displayWidth(helper.styleOptionTerm(helper.optionTerm(option))),
	      );
	    }, 0);
	  }

	  /**
	   * Get the longest global option term length.
	   *
	   * @param {Command} cmd
	   * @param {Help} helper
	   * @returns {number}
	   */

	  longestGlobalOptionTermLength(cmd, helper) {
	    return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
	      return Math.max(
	        max,
	        this.displayWidth(helper.styleOptionTerm(helper.optionTerm(option))),
	      );
	    }, 0);
	  }

	  /**
	   * Get the longest argument term length.
	   *
	   * @param {Command} cmd
	   * @param {Help} helper
	   * @returns {number}
	   */

	  longestArgumentTermLength(cmd, helper) {
	    return helper.visibleArguments(cmd).reduce((max, argument) => {
	      return Math.max(
	        max,
	        this.displayWidth(
	          helper.styleArgumentTerm(helper.argumentTerm(argument)),
	        ),
	      );
	    }, 0);
	  }

	  /**
	   * Get the command usage to be displayed at the top of the built-in help.
	   *
	   * @param {Command} cmd
	   * @returns {string}
	   */

	  commandUsage(cmd) {
	    // Usage
	    let cmdName = cmd._name;
	    if (cmd._aliases[0]) {
	      cmdName = cmdName + '|' + cmd._aliases[0];
	    }
	    let ancestorCmdNames = '';
	    for (
	      let ancestorCmd = cmd.parent;
	      ancestorCmd;
	      ancestorCmd = ancestorCmd.parent
	    ) {
	      ancestorCmdNames = ancestorCmd.name() + ' ' + ancestorCmdNames;
	    }
	    return ancestorCmdNames + cmdName + ' ' + cmd.usage();
	  }

	  /**
	   * Get the description for the command.
	   *
	   * @param {Command} cmd
	   * @returns {string}
	   */

	  commandDescription(cmd) {
	    // @ts-ignore: because overloaded return type
	    return cmd.description();
	  }

	  /**
	   * Get the subcommand summary to show in the list of subcommands.
	   * (Fallback to description for backwards compatibility.)
	   *
	   * @param {Command} cmd
	   * @returns {string}
	   */

	  subcommandDescription(cmd) {
	    // @ts-ignore: because overloaded return type
	    return cmd.summary() || cmd.description();
	  }

	  /**
	   * Get the option description to show in the list of options.
	   *
	   * @param {Option} option
	   * @return {string}
	   */

	  optionDescription(option) {
	    const extraInfo = [];

	    if (option.argChoices) {
	      extraInfo.push(
	        // use stringify to match the display of the default value
	        `choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(', ')}`,
	      );
	    }
	    if (option.defaultValue !== undefined) {
	      // default for boolean and negated more for programmer than end user,
	      // but show true/false for boolean option as may be for hand-rolled env or config processing.
	      const showDefault =
	        option.required ||
	        option.optional ||
	        (option.isBoolean() && typeof option.defaultValue === 'boolean');
	      if (showDefault) {
	        extraInfo.push(
	          `default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`,
	        );
	      }
	    }
	    // preset for boolean and negated are more for programmer than end user
	    if (option.presetArg !== undefined && option.optional) {
	      extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
	    }
	    if (option.envVar !== undefined) {
	      extraInfo.push(`env: ${option.envVar}`);
	    }
	    if (extraInfo.length > 0) {
	      const extraDescription = `(${extraInfo.join(', ')})`;
	      if (option.description) {
	        return `${option.description} ${extraDescription}`;
	      }
	      return extraDescription;
	    }

	    return option.description;
	  }

	  /**
	   * Get the argument description to show in the list of arguments.
	   *
	   * @param {Argument} argument
	   * @return {string}
	   */

	  argumentDescription(argument) {
	    const extraInfo = [];
	    if (argument.argChoices) {
	      extraInfo.push(
	        // use stringify to match the display of the default value
	        `choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(', ')}`,
	      );
	    }
	    if (argument.defaultValue !== undefined) {
	      extraInfo.push(
	        `default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`,
	      );
	    }
	    if (extraInfo.length > 0) {
	      const extraDescription = `(${extraInfo.join(', ')})`;
	      if (argument.description) {
	        return `${argument.description} ${extraDescription}`;
	      }
	      return extraDescription;
	    }
	    return argument.description;
	  }

	  /**
	   * Format a list of items, given a heading and an array of formatted items.
	   *
	   * @param {string} heading
	   * @param {string[]} items
	   * @param {Help} helper
	   * @returns string[]
	   */
	  formatItemList(heading, items, helper) {
	    if (items.length === 0) return [];

	    return [helper.styleTitle(heading), ...items, ''];
	  }

	  /**
	   * Group items by their help group heading.
	   *
	   * @param {Command[] | Option[]} unsortedItems
	   * @param {Command[] | Option[]} visibleItems
	   * @param {Function} getGroup
	   * @returns {Map<string, Command[] | Option[]>}
	   */
	  groupItems(unsortedItems, visibleItems, getGroup) {
	    const result = new Map();
	    // Add groups in order of appearance in unsortedItems.
	    unsortedItems.forEach((item) => {
	      const group = getGroup(item);
	      if (!result.has(group)) result.set(group, []);
	    });
	    // Add items in order of appearance in visibleItems.
	    visibleItems.forEach((item) => {
	      const group = getGroup(item);
	      if (!result.has(group)) {
	        result.set(group, []);
	      }
	      result.get(group).push(item);
	    });
	    return result;
	  }

	  /**
	   * Generate the built-in help text.
	   *
	   * @param {Command} cmd
	   * @param {Help} helper
	   * @returns {string}
	   */

	  formatHelp(cmd, helper) {
	    const termWidth = helper.padWidth(cmd, helper);
	    const helpWidth = helper.helpWidth ?? 80; // in case prepareContext() was not called

	    function callFormatItem(term, description) {
	      return helper.formatItem(term, termWidth, description, helper);
	    }

	    // Usage
	    let output = [
	      `${helper.styleTitle('Usage:')} ${helper.styleUsage(helper.commandUsage(cmd))}`,
	      '',
	    ];

	    // Description
	    const commandDescription = helper.commandDescription(cmd);
	    if (commandDescription.length > 0) {
	      output = output.concat([
	        helper.boxWrap(
	          helper.styleCommandDescription(commandDescription),
	          helpWidth,
	        ),
	        '',
	      ]);
	    }

	    // Arguments
	    const argumentList = helper.visibleArguments(cmd).map((argument) => {
	      return callFormatItem(
	        helper.styleArgumentTerm(helper.argumentTerm(argument)),
	        helper.styleArgumentDescription(helper.argumentDescription(argument)),
	      );
	    });
	    output = output.concat(
	      this.formatItemList('Arguments:', argumentList, helper),
	    );

	    // Options
	    const optionGroups = this.groupItems(
	      cmd.options,
	      helper.visibleOptions(cmd),
	      (option) => option.helpGroupHeading ?? 'Options:',
	    );
	    optionGroups.forEach((options, group) => {
	      const optionList = options.map((option) => {
	        return callFormatItem(
	          helper.styleOptionTerm(helper.optionTerm(option)),
	          helper.styleOptionDescription(helper.optionDescription(option)),
	        );
	      });
	      output = output.concat(this.formatItemList(group, optionList, helper));
	    });

	    if (helper.showGlobalOptions) {
	      const globalOptionList = helper
	        .visibleGlobalOptions(cmd)
	        .map((option) => {
	          return callFormatItem(
	            helper.styleOptionTerm(helper.optionTerm(option)),
	            helper.styleOptionDescription(helper.optionDescription(option)),
	          );
	        });
	      output = output.concat(
	        this.formatItemList('Global Options:', globalOptionList, helper),
	      );
	    }

	    // Commands
	    const commandGroups = this.groupItems(
	      cmd.commands,
	      helper.visibleCommands(cmd),
	      (sub) => sub.helpGroup() || 'Commands:',
	    );
	    commandGroups.forEach((commands, group) => {
	      const commandList = commands.map((sub) => {
	        return callFormatItem(
	          helper.styleSubcommandTerm(helper.subcommandTerm(sub)),
	          helper.styleSubcommandDescription(helper.subcommandDescription(sub)),
	        );
	      });
	      output = output.concat(this.formatItemList(group, commandList, helper));
	    });

	    return output.join('\n');
	  }

	  /**
	   * Return display width of string, ignoring ANSI escape sequences. Used in padding and wrapping calculations.
	   *
	   * @param {string} str
	   * @returns {number}
	   */
	  displayWidth(str) {
	    return stripColor(str).length;
	  }

	  /**
	   * Style the title for displaying in the help. Called with 'Usage:', 'Options:', etc.
	   *
	   * @param {string} str
	   * @returns {string}
	   */
	  styleTitle(str) {
	    return str;
	  }

	  styleUsage(str) {
	    // Usage has lots of parts the user might like to color separately! Assume default usage string which is formed like:
	    //    command subcommand [options] [command] <foo> [bar]
	    return str
	      .split(' ')
	      .map((word) => {
	        if (word === '[options]') return this.styleOptionText(word);
	        if (word === '[command]') return this.styleSubcommandText(word);
	        if (word[0] === '[' || word[0] === '<')
	          return this.styleArgumentText(word);
	        return this.styleCommandText(word); // Restrict to initial words?
	      })
	      .join(' ');
	  }
	  styleCommandDescription(str) {
	    return this.styleDescriptionText(str);
	  }
	  styleOptionDescription(str) {
	    return this.styleDescriptionText(str);
	  }
	  styleSubcommandDescription(str) {
	    return this.styleDescriptionText(str);
	  }
	  styleArgumentDescription(str) {
	    return this.styleDescriptionText(str);
	  }
	  styleDescriptionText(str) {
	    return str;
	  }
	  styleOptionTerm(str) {
	    return this.styleOptionText(str);
	  }
	  styleSubcommandTerm(str) {
	    // This is very like usage with lots of parts! Assume default string which is formed like:
	    //    subcommand [options] <foo> [bar]
	    return str
	      .split(' ')
	      .map((word) => {
	        if (word === '[options]') return this.styleOptionText(word);
	        if (word[0] === '[' || word[0] === '<')
	          return this.styleArgumentText(word);
	        return this.styleSubcommandText(word); // Restrict to initial words?
	      })
	      .join(' ');
	  }
	  styleArgumentTerm(str) {
	    return this.styleArgumentText(str);
	  }
	  styleOptionText(str) {
	    return str;
	  }
	  styleArgumentText(str) {
	    return str;
	  }
	  styleSubcommandText(str) {
	    return str;
	  }
	  styleCommandText(str) {
	    return str;
	  }

	  /**
	   * Calculate the pad width from the maximum term length.
	   *
	   * @param {Command} cmd
	   * @param {Help} helper
	   * @returns {number}
	   */

	  padWidth(cmd, helper) {
	    return Math.max(
	      helper.longestOptionTermLength(cmd, helper),
	      helper.longestGlobalOptionTermLength(cmd, helper),
	      helper.longestSubcommandTermLength(cmd, helper),
	      helper.longestArgumentTermLength(cmd, helper),
	    );
	  }

	  /**
	   * Detect manually wrapped and indented strings by checking for line break followed by whitespace.
	   *
	   * @param {string} str
	   * @returns {boolean}
	   */
	  preformatted(str) {
	    return /\n[^\S\r\n]/.test(str);
	  }

	  /**
	   * Format the "item", which consists of a term and description. Pad the term and wrap the description, indenting the following lines.
	   *
	   * So "TTT", 5, "DDD DDDD DD DDD" might be formatted for this.helpWidth=17 like so:
	   *   TTT  DDD DDDD
	   *        DD DDD
	   *
	   * @param {string} term
	   * @param {number} termWidth
	   * @param {string} description
	   * @param {Help} helper
	   * @returns {string}
	   */
	  formatItem(term, termWidth, description, helper) {
	    const itemIndent = 2;
	    const itemIndentStr = ' '.repeat(itemIndent);
	    if (!description) return itemIndentStr + term;

	    // Pad the term out to a consistent width, so descriptions are aligned.
	    const paddedTerm = term.padEnd(
	      termWidth + term.length - helper.displayWidth(term),
	    );

	    // Format the description.
	    const spacerWidth = 2; // between term and description
	    const helpWidth = this.helpWidth ?? 80; // in case prepareContext() was not called
	    const remainingWidth = helpWidth - termWidth - spacerWidth - itemIndent;
	    let formattedDescription;
	    if (
	      remainingWidth < this.minWidthToWrap ||
	      helper.preformatted(description)
	    ) {
	      formattedDescription = description;
	    } else {
	      const wrappedDescription = helper.boxWrap(description, remainingWidth);
	      formattedDescription = wrappedDescription.replace(
	        /\n/g,
	        '\n' + ' '.repeat(termWidth + spacerWidth),
	      );
	    }

	    // Construct and overall indent.
	    return (
	      itemIndentStr +
	      paddedTerm +
	      ' '.repeat(spacerWidth) +
	      formattedDescription.replace(/\n/g, `\n${itemIndentStr}`)
	    );
	  }

	  /**
	   * Wrap a string at whitespace, preserving existing line breaks.
	   * Wrapping is skipped if the width is less than `minWidthToWrap`.
	   *
	   * @param {string} str
	   * @param {number} width
	   * @returns {string}
	   */
	  boxWrap(str, width) {
	    if (width < this.minWidthToWrap) return str;

	    const rawLines = str.split(/\r\n|\n/);
	    // split up text by whitespace
	    const chunkPattern = /[\s]*[^\s]+/g;
	    const wrappedLines = [];
	    rawLines.forEach((line) => {
	      const chunks = line.match(chunkPattern);
	      if (chunks === null) {
	        wrappedLines.push('');
	        return;
	      }

	      let sumChunks = [chunks.shift()];
	      let sumWidth = this.displayWidth(sumChunks[0]);
	      chunks.forEach((chunk) => {
	        const visibleWidth = this.displayWidth(chunk);
	        // Accumulate chunks while they fit into width.
	        if (sumWidth + visibleWidth <= width) {
	          sumChunks.push(chunk);
	          sumWidth += visibleWidth;
	          return;
	        }
	        wrappedLines.push(sumChunks.join(''));

	        const nextChunk = chunk.trimStart(); // trim space at line break
	        sumChunks = [nextChunk];
	        sumWidth = this.displayWidth(nextChunk);
	      });
	      wrappedLines.push(sumChunks.join(''));
	    });

	    return wrappedLines.join('\n');
	  }
	}

	/**
	 * Strip style ANSI escape sequences from the string. In particular, SGR (Select Graphic Rendition) codes.
	 *
	 * @param {string} str
	 * @returns {string}
	 * @package
	 */

	function stripColor(str) {
	  // eslint-disable-next-line no-control-regex
	  const sgrPattern = /\x1b\[\d*(;\d*)*m/g;
	  return str.replace(sgrPattern, '');
	}

	help.Help = Help;
	help.stripColor = stripColor;
	return help;
}

var option = {};

var hasRequiredOption;

function requireOption () {
	if (hasRequiredOption) return option;
	hasRequiredOption = 1;
	const { InvalidArgumentError } = requireError();

	class Option {
	  /**
	   * Initialize a new `Option` with the given `flags` and `description`.
	   *
	   * @param {string} flags
	   * @param {string} [description]
	   */

	  constructor(flags, description) {
	    this.flags = flags;
	    this.description = description || '';

	    this.required = flags.includes('<'); // A value must be supplied when the option is specified.
	    this.optional = flags.includes('['); // A value is optional when the option is specified.
	    // variadic test ignores <value,...> et al which might be used to describe custom splitting of single argument
	    this.variadic = /\w\.\.\.[>\]]$/.test(flags); // The option can take multiple values.
	    this.mandatory = false; // The option must have a value after parsing, which usually means it must be specified on command line.
	    const optionFlags = splitOptionFlags(flags);
	    this.short = optionFlags.shortFlag; // May be a short flag, undefined, or even a long flag (if option has two long flags).
	    this.long = optionFlags.longFlag;
	    this.negate = false;
	    if (this.long) {
	      this.negate = this.long.startsWith('--no-');
	    }
	    this.defaultValue = undefined;
	    this.defaultValueDescription = undefined;
	    this.presetArg = undefined;
	    this.envVar = undefined;
	    this.parseArg = undefined;
	    this.hidden = false;
	    this.argChoices = undefined;
	    this.conflictsWith = [];
	    this.implied = undefined;
	    this.helpGroupHeading = undefined; // soft initialised when option added to command
	  }

	  /**
	   * Set the default value, and optionally supply the description to be displayed in the help.
	   *
	   * @param {*} value
	   * @param {string} [description]
	   * @return {Option}
	   */

	  default(value, description) {
	    this.defaultValue = value;
	    this.defaultValueDescription = description;
	    return this;
	  }

	  /**
	   * Preset to use when option used without option-argument, especially optional but also boolean and negated.
	   * The custom processing (parseArg) is called.
	   *
	   * @example
	   * new Option('--color').default('GREYSCALE').preset('RGB');
	   * new Option('--donate [amount]').preset('20').argParser(parseFloat);
	   *
	   * @param {*} arg
	   * @return {Option}
	   */

	  preset(arg) {
	    this.presetArg = arg;
	    return this;
	  }

	  /**
	   * Add option name(s) that conflict with this option.
	   * An error will be displayed if conflicting options are found during parsing.
	   *
	   * @example
	   * new Option('--rgb').conflicts('cmyk');
	   * new Option('--js').conflicts(['ts', 'jsx']);
	   *
	   * @param {(string | string[])} names
	   * @return {Option}
	   */

	  conflicts(names) {
	    this.conflictsWith = this.conflictsWith.concat(names);
	    return this;
	  }

	  /**
	   * Specify implied option values for when this option is set and the implied options are not.
	   *
	   * The custom processing (parseArg) is not called on the implied values.
	   *
	   * @example
	   * program
	   *   .addOption(new Option('--log', 'write logging information to file'))
	   *   .addOption(new Option('--trace', 'log extra details').implies({ log: 'trace.txt' }));
	   *
	   * @param {object} impliedOptionValues
	   * @return {Option}
	   */
	  implies(impliedOptionValues) {
	    let newImplied = impliedOptionValues;
	    if (typeof impliedOptionValues === 'string') {
	      // string is not documented, but easy mistake and we can do what user probably intended.
	      newImplied = { [impliedOptionValues]: true };
	    }
	    this.implied = Object.assign(this.implied || {}, newImplied);
	    return this;
	  }

	  /**
	   * Set environment variable to check for option value.
	   *
	   * An environment variable is only used if when processed the current option value is
	   * undefined, or the source of the current value is 'default' or 'config' or 'env'.
	   *
	   * @param {string} name
	   * @return {Option}
	   */

	  env(name) {
	    this.envVar = name;
	    return this;
	  }

	  /**
	   * Set the custom handler for processing CLI option arguments into option values.
	   *
	   * @param {Function} [fn]
	   * @return {Option}
	   */

	  argParser(fn) {
	    this.parseArg = fn;
	    return this;
	  }

	  /**
	   * Whether the option is mandatory and must have a value after parsing.
	   *
	   * @param {boolean} [mandatory=true]
	   * @return {Option}
	   */

	  makeOptionMandatory(mandatory = true) {
	    this.mandatory = !!mandatory;
	    return this;
	  }

	  /**
	   * Hide option in help.
	   *
	   * @param {boolean} [hide=true]
	   * @return {Option}
	   */

	  hideHelp(hide = true) {
	    this.hidden = !!hide;
	    return this;
	  }

	  /**
	   * @package
	   */

	  _concatValue(value, previous) {
	    if (previous === this.defaultValue || !Array.isArray(previous)) {
	      return [value];
	    }

	    return previous.concat(value);
	  }

	  /**
	   * Only allow option value to be one of choices.
	   *
	   * @param {string[]} values
	   * @return {Option}
	   */

	  choices(values) {
	    this.argChoices = values.slice();
	    this.parseArg = (arg, previous) => {
	      if (!this.argChoices.includes(arg)) {
	        throw new InvalidArgumentError(
	          `Allowed choices are ${this.argChoices.join(', ')}.`,
	        );
	      }
	      if (this.variadic) {
	        return this._concatValue(arg, previous);
	      }
	      return arg;
	    };
	    return this;
	  }

	  /**
	   * Return option name.
	   *
	   * @return {string}
	   */

	  name() {
	    if (this.long) {
	      return this.long.replace(/^--/, '');
	    }
	    return this.short.replace(/^-/, '');
	  }

	  /**
	   * Return option name, in a camelcase format that can be used
	   * as an object attribute key.
	   *
	   * @return {string}
	   */

	  attributeName() {
	    if (this.negate) {
	      return camelcase(this.name().replace(/^no-/, ''));
	    }
	    return camelcase(this.name());
	  }

	  /**
	   * Set the help group heading.
	   *
	   * @param {string} heading
	   * @return {Option}
	   */
	  helpGroup(heading) {
	    this.helpGroupHeading = heading;
	    return this;
	  }

	  /**
	   * Check if `arg` matches the short or long flag.
	   *
	   * @param {string} arg
	   * @return {boolean}
	   * @package
	   */

	  is(arg) {
	    return this.short === arg || this.long === arg;
	  }

	  /**
	   * Return whether a boolean option.
	   *
	   * Options are one of boolean, negated, required argument, or optional argument.
	   *
	   * @return {boolean}
	   * @package
	   */

	  isBoolean() {
	    return !this.required && !this.optional && !this.negate;
	  }
	}

	/**
	 * This class is to make it easier to work with dual options, without changing the existing
	 * implementation. We support separate dual options for separate positive and negative options,
	 * like `--build` and `--no-build`, which share a single option value. This works nicely for some
	 * use cases, but is tricky for others where we want separate behaviours despite
	 * the single shared option value.
	 */
	class DualOptions {
	  /**
	   * @param {Option[]} options
	   */
	  constructor(options) {
	    this.positiveOptions = new Map();
	    this.negativeOptions = new Map();
	    this.dualOptions = new Set();
	    options.forEach((option) => {
	      if (option.negate) {
	        this.negativeOptions.set(option.attributeName(), option);
	      } else {
	        this.positiveOptions.set(option.attributeName(), option);
	      }
	    });
	    this.negativeOptions.forEach((value, key) => {
	      if (this.positiveOptions.has(key)) {
	        this.dualOptions.add(key);
	      }
	    });
	  }

	  /**
	   * Did the value come from the option, and not from possible matching dual option?
	   *
	   * @param {*} value
	   * @param {Option} option
	   * @returns {boolean}
	   */
	  valueFromOption(value, option) {
	    const optionKey = option.attributeName();
	    if (!this.dualOptions.has(optionKey)) return true;

	    // Use the value to deduce if (probably) came from the option.
	    const preset = this.negativeOptions.get(optionKey).presetArg;
	    const negativeValue = preset !== undefined ? preset : false;
	    return option.negate === (negativeValue === value);
	  }
	}

	/**
	 * Convert string from kebab-case to camelCase.
	 *
	 * @param {string} str
	 * @return {string}
	 * @private
	 */

	function camelcase(str) {
	  return str.split('-').reduce((str, word) => {
	    return str + word[0].toUpperCase() + word.slice(1);
	  });
	}

	/**
	 * Split the short and long flag out of something like '-m,--mixed <value>'
	 *
	 * @private
	 */

	function splitOptionFlags(flags) {
	  let shortFlag;
	  let longFlag;
	  // short flag, single dash and single character
	  const shortFlagExp = /^-[^-]$/;
	  // long flag, double dash and at least one character
	  const longFlagExp = /^--[^-]/;

	  const flagParts = flags.split(/[ |,]+/).concat('guard');
	  // Normal is short and/or long.
	  if (shortFlagExp.test(flagParts[0])) shortFlag = flagParts.shift();
	  if (longFlagExp.test(flagParts[0])) longFlag = flagParts.shift();
	  // Long then short. Rarely used but fine.
	  if (!shortFlag && shortFlagExp.test(flagParts[0]))
	    shortFlag = flagParts.shift();
	  // Allow two long flags, like '--ws, --workspace'
	  // This is the supported way to have a shortish option flag.
	  if (!shortFlag && longFlagExp.test(flagParts[0])) {
	    shortFlag = longFlag;
	    longFlag = flagParts.shift();
	  }

	  // Check for unprocessed flag. Fail noisily rather than silently ignore.
	  if (flagParts[0].startsWith('-')) {
	    const unsupportedFlag = flagParts[0];
	    const baseError = `option creation failed due to '${unsupportedFlag}' in option flags '${flags}'`;
	    if (/^-[^-][^-]/.test(unsupportedFlag))
	      throw new Error(
	        `${baseError}
- a short flag is a single dash and a single character
  - either use a single dash and a single character (for a short flag)
  - or use a double dash for a long option (and can have two, like '--ws, --workspace')`,
	      );
	    if (shortFlagExp.test(unsupportedFlag))
	      throw new Error(`${baseError}
- too many short flags`);
	    if (longFlagExp.test(unsupportedFlag))
	      throw new Error(`${baseError}
- too many long flags`);

	    throw new Error(`${baseError}
- unrecognised flag format`);
	  }
	  if (shortFlag === undefined && longFlag === undefined)
	    throw new Error(
	      `option creation failed due to no flags found in '${flags}'.`,
	    );

	  return { shortFlag, longFlag };
	}

	option.Option = Option;
	option.DualOptions = DualOptions;
	return option;
}

var suggestSimilar = {};

var hasRequiredSuggestSimilar;

function requireSuggestSimilar () {
	if (hasRequiredSuggestSimilar) return suggestSimilar;
	hasRequiredSuggestSimilar = 1;
	const maxDistance = 3;

	function editDistance(a, b) {
	  // https://en.wikipedia.org/wiki/Damerau–Levenshtein_distance
	  // Calculating optimal string alignment distance, no substring is edited more than once.
	  // (Simple implementation.)

	  // Quick early exit, return worst case.
	  if (Math.abs(a.length - b.length) > maxDistance)
	    return Math.max(a.length, b.length);

	  // distance between prefix substrings of a and b
	  const d = [];

	  // pure deletions turn a into empty string
	  for (let i = 0; i <= a.length; i++) {
	    d[i] = [i];
	  }
	  // pure insertions turn empty string into b
	  for (let j = 0; j <= b.length; j++) {
	    d[0][j] = j;
	  }

	  // fill matrix
	  for (let j = 1; j <= b.length; j++) {
	    for (let i = 1; i <= a.length; i++) {
	      let cost = 1;
	      if (a[i - 1] === b[j - 1]) {
	        cost = 0;
	      } else {
	        cost = 1;
	      }
	      d[i][j] = Math.min(
	        d[i - 1][j] + 1, // deletion
	        d[i][j - 1] + 1, // insertion
	        d[i - 1][j - 1] + cost, // substitution
	      );
	      // transposition
	      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
	        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
	      }
	    }
	  }

	  return d[a.length][b.length];
	}

	/**
	 * Find close matches, restricted to same number of edits.
	 *
	 * @param {string} word
	 * @param {string[]} candidates
	 * @returns {string}
	 */

	function suggestSimilar$1(word, candidates) {
	  if (!candidates || candidates.length === 0) return '';
	  // remove possible duplicates
	  candidates = Array.from(new Set(candidates));

	  const searchingOptions = word.startsWith('--');
	  if (searchingOptions) {
	    word = word.slice(2);
	    candidates = candidates.map((candidate) => candidate.slice(2));
	  }

	  let similar = [];
	  let bestDistance = maxDistance;
	  const minSimilarity = 0.4;
	  candidates.forEach((candidate) => {
	    if (candidate.length <= 1) return; // no one character guesses

	    const distance = editDistance(word, candidate);
	    const length = Math.max(word.length, candidate.length);
	    const similarity = (length - distance) / length;
	    if (similarity > minSimilarity) {
	      if (distance < bestDistance) {
	        // better edit distance, throw away previous worse matches
	        bestDistance = distance;
	        similar = [candidate];
	      } else if (distance === bestDistance) {
	        similar.push(candidate);
	      }
	    }
	  });

	  similar.sort((a, b) => a.localeCompare(b));
	  if (searchingOptions) {
	    similar = similar.map((candidate) => `--${candidate}`);
	  }

	  if (similar.length > 1) {
	    return `\n(Did you mean one of ${similar.join(', ')}?)`;
	  }
	  if (similar.length === 1) {
	    return `\n(Did you mean ${similar[0]}?)`;
	  }
	  return '';
	}

	suggestSimilar.suggestSimilar = suggestSimilar$1;
	return suggestSimilar;
}

var hasRequiredCommand;

function requireCommand () {
	if (hasRequiredCommand) return command;
	hasRequiredCommand = 1;
	const EventEmitter = require$$0$1.EventEmitter;
	const childProcess = require$$1;
	const path = require$$2;
	const fs = require$$3;
	const process = require$$4;

	const { Argument, humanReadableArgName } = requireArgument();
	const { CommanderError } = requireError();
	const { Help, stripColor } = requireHelp();
	const { Option, DualOptions } = requireOption();
	const { suggestSimilar } = requireSuggestSimilar();

	class Command extends EventEmitter {
	  /**
	   * Initialize a new `Command`.
	   *
	   * @param {string} [name]
	   */

	  constructor(name) {
	    super();
	    /** @type {Command[]} */
	    this.commands = [];
	    /** @type {Option[]} */
	    this.options = [];
	    this.parent = null;
	    this._allowUnknownOption = false;
	    this._allowExcessArguments = false;
	    /** @type {Argument[]} */
	    this.registeredArguments = [];
	    this._args = this.registeredArguments; // deprecated old name
	    /** @type {string[]} */
	    this.args = []; // cli args with options removed
	    this.rawArgs = [];
	    this.processedArgs = []; // like .args but after custom processing and collecting variadic
	    this._scriptPath = null;
	    this._name = name || '';
	    this._optionValues = {};
	    this._optionValueSources = {}; // default, env, cli etc
	    this._storeOptionsAsProperties = false;
	    this._actionHandler = null;
	    this._executableHandler = false;
	    this._executableFile = null; // custom name for executable
	    this._executableDir = null; // custom search directory for subcommands
	    this._defaultCommandName = null;
	    this._exitCallback = null;
	    this._aliases = [];
	    this._combineFlagAndOptionalValue = true;
	    this._description = '';
	    this._summary = '';
	    this._argsDescription = undefined; // legacy
	    this._enablePositionalOptions = false;
	    this._passThroughOptions = false;
	    this._lifeCycleHooks = {}; // a hash of arrays
	    /** @type {(boolean | string)} */
	    this._showHelpAfterError = false;
	    this._showSuggestionAfterError = true;
	    this._savedState = null; // used in save/restoreStateBeforeParse

	    // see configureOutput() for docs
	    this._outputConfiguration = {
	      writeOut: (str) => process.stdout.write(str),
	      writeErr: (str) => process.stderr.write(str),
	      outputError: (str, write) => write(str),
	      getOutHelpWidth: () =>
	        process.stdout.isTTY ? process.stdout.columns : undefined,
	      getErrHelpWidth: () =>
	        process.stderr.isTTY ? process.stderr.columns : undefined,
	      getOutHasColors: () =>
	        useColor() ?? (process.stdout.isTTY && process.stdout.hasColors?.()),
	      getErrHasColors: () =>
	        useColor() ?? (process.stderr.isTTY && process.stderr.hasColors?.()),
	      stripColor: (str) => stripColor(str),
	    };

	    this._hidden = false;
	    /** @type {(Option | null | undefined)} */
	    this._helpOption = undefined; // Lazy created on demand. May be null if help option is disabled.
	    this._addImplicitHelpCommand = undefined; // undecided whether true or false yet, not inherited
	    /** @type {Command} */
	    this._helpCommand = undefined; // lazy initialised, inherited
	    this._helpConfiguration = {};
	    /** @type {string | undefined} */
	    this._helpGroupHeading = undefined; // soft initialised when added to parent
	    /** @type {string | undefined} */
	    this._defaultCommandGroup = undefined;
	    /** @type {string | undefined} */
	    this._defaultOptionGroup = undefined;
	  }

	  /**
	   * Copy settings that are useful to have in common across root command and subcommands.
	   *
	   * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
	   *
	   * @param {Command} sourceCommand
	   * @return {Command} `this` command for chaining
	   */
	  copyInheritedSettings(sourceCommand) {
	    this._outputConfiguration = sourceCommand._outputConfiguration;
	    this._helpOption = sourceCommand._helpOption;
	    this._helpCommand = sourceCommand._helpCommand;
	    this._helpConfiguration = sourceCommand._helpConfiguration;
	    this._exitCallback = sourceCommand._exitCallback;
	    this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
	    this._combineFlagAndOptionalValue =
	      sourceCommand._combineFlagAndOptionalValue;
	    this._allowExcessArguments = sourceCommand._allowExcessArguments;
	    this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
	    this._showHelpAfterError = sourceCommand._showHelpAfterError;
	    this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;

	    return this;
	  }

	  /**
	   * @returns {Command[]}
	   * @private
	   */

	  _getCommandAndAncestors() {
	    const result = [];
	    // eslint-disable-next-line @typescript-eslint/no-this-alias
	    for (let command = this; command; command = command.parent) {
	      result.push(command);
	    }
	    return result;
	  }

	  /**
	   * Define a command.
	   *
	   * There are two styles of command: pay attention to where to put the description.
	   *
	   * @example
	   * // Command implemented using action handler (description is supplied separately to `.command`)
	   * program
	   *   .command('clone <source> [destination]')
	   *   .description('clone a repository into a newly created directory')
	   *   .action((source, destination) => {
	   *     console.log('clone command called');
	   *   });
	   *
	   * // Command implemented using separate executable file (description is second parameter to `.command`)
	   * program
	   *   .command('start <service>', 'start named service')
	   *   .command('stop [service]', 'stop named service, or all if no name supplied');
	   *
	   * @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
	   * @param {(object | string)} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
	   * @param {object} [execOpts] - configuration options (for executable)
	   * @return {Command} returns new command for action handler, or `this` for executable command
	   */

	  command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
	    let desc = actionOptsOrExecDesc;
	    let opts = execOpts;
	    if (typeof desc === 'object' && desc !== null) {
	      opts = desc;
	      desc = null;
	    }
	    opts = opts || {};
	    const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);

	    const cmd = this.createCommand(name);
	    if (desc) {
	      cmd.description(desc);
	      cmd._executableHandler = true;
	    }
	    if (opts.isDefault) this._defaultCommandName = cmd._name;
	    cmd._hidden = !!(opts.noHelp || opts.hidden); // noHelp is deprecated old name for hidden
	    cmd._executableFile = opts.executableFile || null; // Custom name for executable file, set missing to null to match constructor
	    if (args) cmd.arguments(args);
	    this._registerCommand(cmd);
	    cmd.parent = this;
	    cmd.copyInheritedSettings(this);

	    if (desc) return this;
	    return cmd;
	  }

	  /**
	   * Factory routine to create a new unattached command.
	   *
	   * See .command() for creating an attached subcommand, which uses this routine to
	   * create the command. You can override createCommand to customise subcommands.
	   *
	   * @param {string} [name]
	   * @return {Command} new command
	   */

	  createCommand(name) {
	    return new Command(name);
	  }

	  /**
	   * You can customise the help with a subclass of Help by overriding createHelp,
	   * or by overriding Help properties using configureHelp().
	   *
	   * @return {Help}
	   */

	  createHelp() {
	    return Object.assign(new Help(), this.configureHelp());
	  }

	  /**
	   * You can customise the help by overriding Help properties using configureHelp(),
	   * or with a subclass of Help by overriding createHelp().
	   *
	   * @param {object} [configuration] - configuration options
	   * @return {(Command | object)} `this` command for chaining, or stored configuration
	   */

	  configureHelp(configuration) {
	    if (configuration === undefined) return this._helpConfiguration;

	    this._helpConfiguration = configuration;
	    return this;
	  }

	  /**
	   * The default output goes to stdout and stderr. You can customise this for special
	   * applications. You can also customise the display of errors by overriding outputError.
	   *
	   * The configuration properties are all functions:
	   *
	   *     // change how output being written, defaults to stdout and stderr
	   *     writeOut(str)
	   *     writeErr(str)
	   *     // change how output being written for errors, defaults to writeErr
	   *     outputError(str, write) // used for displaying errors and not used for displaying help
	   *     // specify width for wrapping help
	   *     getOutHelpWidth()
	   *     getErrHelpWidth()
	   *     // color support, currently only used with Help
	   *     getOutHasColors()
	   *     getErrHasColors()
	   *     stripColor() // used to remove ANSI escape codes if output does not have colors
	   *
	   * @param {object} [configuration] - configuration options
	   * @return {(Command | object)} `this` command for chaining, or stored configuration
	   */

	  configureOutput(configuration) {
	    if (configuration === undefined) return this._outputConfiguration;

	    this._outputConfiguration = Object.assign(
	      {},
	      this._outputConfiguration,
	      configuration,
	    );
	    return this;
	  }

	  /**
	   * Display the help or a custom message after an error occurs.
	   *
	   * @param {(boolean|string)} [displayHelp]
	   * @return {Command} `this` command for chaining
	   */
	  showHelpAfterError(displayHelp = true) {
	    if (typeof displayHelp !== 'string') displayHelp = !!displayHelp;
	    this._showHelpAfterError = displayHelp;
	    return this;
	  }

	  /**
	   * Display suggestion of similar commands for unknown commands, or options for unknown options.
	   *
	   * @param {boolean} [displaySuggestion]
	   * @return {Command} `this` command for chaining
	   */
	  showSuggestionAfterError(displaySuggestion = true) {
	    this._showSuggestionAfterError = !!displaySuggestion;
	    return this;
	  }

	  /**
	   * Add a prepared subcommand.
	   *
	   * See .command() for creating an attached subcommand which inherits settings from its parent.
	   *
	   * @param {Command} cmd - new subcommand
	   * @param {object} [opts] - configuration options
	   * @return {Command} `this` command for chaining
	   */

	  addCommand(cmd, opts) {
	    if (!cmd._name) {
	      throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
	    }

	    opts = opts || {};
	    if (opts.isDefault) this._defaultCommandName = cmd._name;
	    if (opts.noHelp || opts.hidden) cmd._hidden = true; // modifying passed command due to existing implementation

	    this._registerCommand(cmd);
	    cmd.parent = this;
	    cmd._checkForBrokenPassThrough();

	    return this;
	  }

	  /**
	   * Factory routine to create a new unattached argument.
	   *
	   * See .argument() for creating an attached argument, which uses this routine to
	   * create the argument. You can override createArgument to return a custom argument.
	   *
	   * @param {string} name
	   * @param {string} [description]
	   * @return {Argument} new argument
	   */

	  createArgument(name, description) {
	    return new Argument(name, description);
	  }

	  /**
	   * Define argument syntax for command.
	   *
	   * The default is that the argument is required, and you can explicitly
	   * indicate this with <> around the name. Put [] around the name for an optional argument.
	   *
	   * @example
	   * program.argument('<input-file>');
	   * program.argument('[output-file]');
	   *
	   * @param {string} name
	   * @param {string} [description]
	   * @param {(Function|*)} [parseArg] - custom argument processing function or default value
	   * @param {*} [defaultValue]
	   * @return {Command} `this` command for chaining
	   */
	  argument(name, description, parseArg, defaultValue) {
	    const argument = this.createArgument(name, description);
	    if (typeof parseArg === 'function') {
	      argument.default(defaultValue).argParser(parseArg);
	    } else {
	      argument.default(parseArg);
	    }
	    this.addArgument(argument);
	    return this;
	  }

	  /**
	   * Define argument syntax for command, adding multiple at once (without descriptions).
	   *
	   * See also .argument().
	   *
	   * @example
	   * program.arguments('<cmd> [env]');
	   *
	   * @param {string} names
	   * @return {Command} `this` command for chaining
	   */

	  arguments(names) {
	    names
	      .trim()
	      .split(/ +/)
	      .forEach((detail) => {
	        this.argument(detail);
	      });
	    return this;
	  }

	  /**
	   * Define argument syntax for command, adding a prepared argument.
	   *
	   * @param {Argument} argument
	   * @return {Command} `this` command for chaining
	   */
	  addArgument(argument) {
	    const previousArgument = this.registeredArguments.slice(-1)[0];
	    if (previousArgument && previousArgument.variadic) {
	      throw new Error(
	        `only the last argument can be variadic '${previousArgument.name()}'`,
	      );
	    }
	    if (
	      argument.required &&
	      argument.defaultValue !== undefined &&
	      argument.parseArg === undefined
	    ) {
	      throw new Error(
	        `a default value for a required argument is never used: '${argument.name()}'`,
	      );
	    }
	    this.registeredArguments.push(argument);
	    return this;
	  }

	  /**
	   * Customise or override default help command. By default a help command is automatically added if your command has subcommands.
	   *
	   * @example
	   *    program.helpCommand('help [cmd]');
	   *    program.helpCommand('help [cmd]', 'show help');
	   *    program.helpCommand(false); // suppress default help command
	   *    program.helpCommand(true); // add help command even if no subcommands
	   *
	   * @param {string|boolean} enableOrNameAndArgs - enable with custom name and/or arguments, or boolean to override whether added
	   * @param {string} [description] - custom description
	   * @return {Command} `this` command for chaining
	   */

	  helpCommand(enableOrNameAndArgs, description) {
	    if (typeof enableOrNameAndArgs === 'boolean') {
	      this._addImplicitHelpCommand = enableOrNameAndArgs;
	      if (enableOrNameAndArgs && this._defaultCommandGroup) {
	        // make the command to store the group
	        this._initCommandGroup(this._getHelpCommand());
	      }
	      return this;
	    }

	    const nameAndArgs = enableOrNameAndArgs ?? 'help [command]';
	    const [, helpName, helpArgs] = nameAndArgs.match(/([^ ]+) *(.*)/);
	    const helpDescription = description ?? 'display help for command';

	    const helpCommand = this.createCommand(helpName);
	    helpCommand.helpOption(false);
	    if (helpArgs) helpCommand.arguments(helpArgs);
	    if (helpDescription) helpCommand.description(helpDescription);

	    this._addImplicitHelpCommand = true;
	    this._helpCommand = helpCommand;
	    // init group unless lazy create
	    if (enableOrNameAndArgs || description) this._initCommandGroup(helpCommand);

	    return this;
	  }

	  /**
	   * Add prepared custom help command.
	   *
	   * @param {(Command|string|boolean)} helpCommand - custom help command, or deprecated enableOrNameAndArgs as for `.helpCommand()`
	   * @param {string} [deprecatedDescription] - deprecated custom description used with custom name only
	   * @return {Command} `this` command for chaining
	   */
	  addHelpCommand(helpCommand, deprecatedDescription) {
	    // If not passed an object, call through to helpCommand for backwards compatibility,
	    // as addHelpCommand was originally used like helpCommand is now.
	    if (typeof helpCommand !== 'object') {
	      this.helpCommand(helpCommand, deprecatedDescription);
	      return this;
	    }

	    this._addImplicitHelpCommand = true;
	    this._helpCommand = helpCommand;
	    this._initCommandGroup(helpCommand);
	    return this;
	  }

	  /**
	   * Lazy create help command.
	   *
	   * @return {(Command|null)}
	   * @package
	   */
	  _getHelpCommand() {
	    const hasImplicitHelpCommand =
	      this._addImplicitHelpCommand ??
	      (this.commands.length &&
	        !this._actionHandler &&
	        !this._findCommand('help'));

	    if (hasImplicitHelpCommand) {
	      if (this._helpCommand === undefined) {
	        this.helpCommand(undefined, undefined); // use default name and description
	      }
	      return this._helpCommand;
	    }
	    return null;
	  }

	  /**
	   * Add hook for life cycle event.
	   *
	   * @param {string} event
	   * @param {Function} listener
	   * @return {Command} `this` command for chaining
	   */

	  hook(event, listener) {
	    const allowedValues = ['preSubcommand', 'preAction', 'postAction'];
	    if (!allowedValues.includes(event)) {
	      throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
	    }
	    if (this._lifeCycleHooks[event]) {
	      this._lifeCycleHooks[event].push(listener);
	    } else {
	      this._lifeCycleHooks[event] = [listener];
	    }
	    return this;
	  }

	  /**
	   * Register callback to use as replacement for calling process.exit.
	   *
	   * @param {Function} [fn] optional callback which will be passed a CommanderError, defaults to throwing
	   * @return {Command} `this` command for chaining
	   */

	  exitOverride(fn) {
	    if (fn) {
	      this._exitCallback = fn;
	    } else {
	      this._exitCallback = (err) => {
	        if (err.code !== 'commander.executeSubCommandAsync') {
	          throw err;
	        }
	      };
	    }
	    return this;
	  }

	  /**
	   * Call process.exit, and _exitCallback if defined.
	   *
	   * @param {number} exitCode exit code for using with process.exit
	   * @param {string} code an id string representing the error
	   * @param {string} message human-readable description of the error
	   * @return never
	   * @private
	   */

	  _exit(exitCode, code, message) {
	    if (this._exitCallback) {
	      this._exitCallback(new CommanderError(exitCode, code, message));
	      // Expecting this line is not reached.
	    }
	    process.exit(exitCode);
	  }

	  /**
	   * Register callback `fn` for the command.
	   *
	   * @example
	   * program
	   *   .command('serve')
	   *   .description('start service')
	   *   .action(function() {
	   *      // do work here
	   *   });
	   *
	   * @param {Function} fn
	   * @return {Command} `this` command for chaining
	   */

	  action(fn) {
	    const listener = (args) => {
	      // The .action callback takes an extra parameter which is the command or options.
	      const expectedArgsCount = this.registeredArguments.length;
	      const actionArgs = args.slice(0, expectedArgsCount);
	      if (this._storeOptionsAsProperties) {
	        actionArgs[expectedArgsCount] = this; // backwards compatible "options"
	      } else {
	        actionArgs[expectedArgsCount] = this.opts();
	      }
	      actionArgs.push(this);

	      return fn.apply(this, actionArgs);
	    };
	    this._actionHandler = listener;
	    return this;
	  }

	  /**
	   * Factory routine to create a new unattached option.
	   *
	   * See .option() for creating an attached option, which uses this routine to
	   * create the option. You can override createOption to return a custom option.
	   *
	   * @param {string} flags
	   * @param {string} [description]
	   * @return {Option} new option
	   */

	  createOption(flags, description) {
	    return new Option(flags, description);
	  }

	  /**
	   * Wrap parseArgs to catch 'commander.invalidArgument'.
	   *
	   * @param {(Option | Argument)} target
	   * @param {string} value
	   * @param {*} previous
	   * @param {string} invalidArgumentMessage
	   * @private
	   */

	  _callParseArg(target, value, previous, invalidArgumentMessage) {
	    try {
	      return target.parseArg(value, previous);
	    } catch (err) {
	      if (err.code === 'commander.invalidArgument') {
	        const message = `${invalidArgumentMessage} ${err.message}`;
	        this.error(message, { exitCode: err.exitCode, code: err.code });
	      }
	      throw err;
	    }
	  }

	  /**
	   * Check for option flag conflicts.
	   * Register option if no conflicts found, or throw on conflict.
	   *
	   * @param {Option} option
	   * @private
	   */

	  _registerOption(option) {
	    const matchingOption =
	      (option.short && this._findOption(option.short)) ||
	      (option.long && this._findOption(option.long));
	    if (matchingOption) {
	      const matchingFlag =
	        option.long && this._findOption(option.long)
	          ? option.long
	          : option.short;
	      throw new Error(`Cannot add option '${option.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${matchingFlag}'
-  already used by option '${matchingOption.flags}'`);
	    }

	    this._initOptionGroup(option);
	    this.options.push(option);
	  }

	  /**
	   * Check for command name and alias conflicts with existing commands.
	   * Register command if no conflicts found, or throw on conflict.
	   *
	   * @param {Command} command
	   * @private
	   */

	  _registerCommand(command) {
	    const knownBy = (cmd) => {
	      return [cmd.name()].concat(cmd.aliases());
	    };

	    const alreadyUsed = knownBy(command).find((name) =>
	      this._findCommand(name),
	    );
	    if (alreadyUsed) {
	      const existingCmd = knownBy(this._findCommand(alreadyUsed)).join('|');
	      const newCmd = knownBy(command).join('|');
	      throw new Error(
	        `cannot add command '${newCmd}' as already have command '${existingCmd}'`,
	      );
	    }

	    this._initCommandGroup(command);
	    this.commands.push(command);
	  }

	  /**
	   * Add an option.
	   *
	   * @param {Option} option
	   * @return {Command} `this` command for chaining
	   */
	  addOption(option) {
	    this._registerOption(option);

	    const oname = option.name();
	    const name = option.attributeName();

	    // store default value
	    if (option.negate) {
	      // --no-foo is special and defaults foo to true, unless a --foo option is already defined
	      const positiveLongFlag = option.long.replace(/^--no-/, '--');
	      if (!this._findOption(positiveLongFlag)) {
	        this.setOptionValueWithSource(
	          name,
	          option.defaultValue === undefined ? true : option.defaultValue,
	          'default',
	        );
	      }
	    } else if (option.defaultValue !== undefined) {
	      this.setOptionValueWithSource(name, option.defaultValue, 'default');
	    }

	    // handler for cli and env supplied values
	    const handleOptionValue = (val, invalidValueMessage, valueSource) => {
	      // val is null for optional option used without an optional-argument.
	      // val is undefined for boolean and negated option.
	      if (val == null && option.presetArg !== undefined) {
	        val = option.presetArg;
	      }

	      // custom processing
	      const oldValue = this.getOptionValue(name);
	      if (val !== null && option.parseArg) {
	        val = this._callParseArg(option, val, oldValue, invalidValueMessage);
	      } else if (val !== null && option.variadic) {
	        val = option._concatValue(val, oldValue);
	      }

	      // Fill-in appropriate missing values. Long winded but easy to follow.
	      if (val == null) {
	        if (option.negate) {
	          val = false;
	        } else if (option.isBoolean() || option.optional) {
	          val = true;
	        } else {
	          val = ''; // not normal, parseArg might have failed or be a mock function for testing
	        }
	      }
	      this.setOptionValueWithSource(name, val, valueSource);
	    };

	    this.on('option:' + oname, (val) => {
	      const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
	      handleOptionValue(val, invalidValueMessage, 'cli');
	    });

	    if (option.envVar) {
	      this.on('optionEnv:' + oname, (val) => {
	        const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
	        handleOptionValue(val, invalidValueMessage, 'env');
	      });
	    }

	    return this;
	  }

	  /**
	   * Internal implementation shared by .option() and .requiredOption()
	   *
	   * @return {Command} `this` command for chaining
	   * @private
	   */
	  _optionEx(config, flags, description, fn, defaultValue) {
	    if (typeof flags === 'object' && flags instanceof Option) {
	      throw new Error(
	        'To add an Option object use addOption() instead of option() or requiredOption()',
	      );
	    }
	    const option = this.createOption(flags, description);
	    option.makeOptionMandatory(!!config.mandatory);
	    if (typeof fn === 'function') {
	      option.default(defaultValue).argParser(fn);
	    } else if (fn instanceof RegExp) {
	      // deprecated
	      const regex = fn;
	      fn = (val, def) => {
	        const m = regex.exec(val);
	        return m ? m[0] : def;
	      };
	      option.default(defaultValue).argParser(fn);
	    } else {
	      option.default(fn);
	    }

	    return this.addOption(option);
	  }

	  /**
	   * Define option with `flags`, `description`, and optional argument parsing function or `defaultValue` or both.
	   *
	   * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space. A required
	   * option-argument is indicated by `<>` and an optional option-argument by `[]`.
	   *
	   * See the README for more details, and see also addOption() and requiredOption().
	   *
	   * @example
	   * program
	   *     .option('-p, --pepper', 'add pepper')
	   *     .option('--pt, --pizza-type <TYPE>', 'type of pizza') // required option-argument
	   *     .option('-c, --cheese [CHEESE]', 'add extra cheese', 'mozzarella') // optional option-argument with default
	   *     .option('-t, --tip <VALUE>', 'add tip to purchase cost', parseFloat) // custom parse function
	   *
	   * @param {string} flags
	   * @param {string} [description]
	   * @param {(Function|*)} [parseArg] - custom option processing function or default value
	   * @param {*} [defaultValue]
	   * @return {Command} `this` command for chaining
	   */

	  option(flags, description, parseArg, defaultValue) {
	    return this._optionEx({}, flags, description, parseArg, defaultValue);
	  }

	  /**
	   * Add a required option which must have a value after parsing. This usually means
	   * the option must be specified on the command line. (Otherwise the same as .option().)
	   *
	   * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
	   *
	   * @param {string} flags
	   * @param {string} [description]
	   * @param {(Function|*)} [parseArg] - custom option processing function or default value
	   * @param {*} [defaultValue]
	   * @return {Command} `this` command for chaining
	   */

	  requiredOption(flags, description, parseArg, defaultValue) {
	    return this._optionEx(
	      { mandatory: true },
	      flags,
	      description,
	      parseArg,
	      defaultValue,
	    );
	  }

	  /**
	   * Alter parsing of short flags with optional values.
	   *
	   * @example
	   * // for `.option('-f,--flag [value]'):
	   * program.combineFlagAndOptionalValue(true);  // `-f80` is treated like `--flag=80`, this is the default behaviour
	   * program.combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
	   *
	   * @param {boolean} [combine] - if `true` or omitted, an optional value can be specified directly after the flag.
	   * @return {Command} `this` command for chaining
	   */
	  combineFlagAndOptionalValue(combine = true) {
	    this._combineFlagAndOptionalValue = !!combine;
	    return this;
	  }

	  /**
	   * Allow unknown options on the command line.
	   *
	   * @param {boolean} [allowUnknown] - if `true` or omitted, no error will be thrown for unknown options.
	   * @return {Command} `this` command for chaining
	   */
	  allowUnknownOption(allowUnknown = true) {
	    this._allowUnknownOption = !!allowUnknown;
	    return this;
	  }

	  /**
	   * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
	   *
	   * @param {boolean} [allowExcess] - if `true` or omitted, no error will be thrown for excess arguments.
	   * @return {Command} `this` command for chaining
	   */
	  allowExcessArguments(allowExcess = true) {
	    this._allowExcessArguments = !!allowExcess;
	    return this;
	  }

	  /**
	   * Enable positional options. Positional means global options are specified before subcommands which lets
	   * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
	   * The default behaviour is non-positional and global options may appear anywhere on the command line.
	   *
	   * @param {boolean} [positional]
	   * @return {Command} `this` command for chaining
	   */
	  enablePositionalOptions(positional = true) {
	    this._enablePositionalOptions = !!positional;
	    return this;
	  }

	  /**
	   * Pass through options that come after command-arguments rather than treat them as command-options,
	   * so actual command-options come before command-arguments. Turning this on for a subcommand requires
	   * positional options to have been enabled on the program (parent commands).
	   * The default behaviour is non-positional and options may appear before or after command-arguments.
	   *
	   * @param {boolean} [passThrough] for unknown options.
	   * @return {Command} `this` command for chaining
	   */
	  passThroughOptions(passThrough = true) {
	    this._passThroughOptions = !!passThrough;
	    this._checkForBrokenPassThrough();
	    return this;
	  }

	  /**
	   * @private
	   */

	  _checkForBrokenPassThrough() {
	    if (
	      this.parent &&
	      this._passThroughOptions &&
	      !this.parent._enablePositionalOptions
	    ) {
	      throw new Error(
	        `passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`,
	      );
	    }
	  }

	  /**
	   * Whether to store option values as properties on command object,
	   * or store separately (specify false). In both cases the option values can be accessed using .opts().
	   *
	   * @param {boolean} [storeAsProperties=true]
	   * @return {Command} `this` command for chaining
	   */

	  storeOptionsAsProperties(storeAsProperties = true) {
	    if (this.options.length) {
	      throw new Error('call .storeOptionsAsProperties() before adding options');
	    }
	    if (Object.keys(this._optionValues).length) {
	      throw new Error(
	        'call .storeOptionsAsProperties() before setting option values',
	      );
	    }
	    this._storeOptionsAsProperties = !!storeAsProperties;
	    return this;
	  }

	  /**
	   * Retrieve option value.
	   *
	   * @param {string} key
	   * @return {object} value
	   */

	  getOptionValue(key) {
	    if (this._storeOptionsAsProperties) {
	      return this[key];
	    }
	    return this._optionValues[key];
	  }

	  /**
	   * Store option value.
	   *
	   * @param {string} key
	   * @param {object} value
	   * @return {Command} `this` command for chaining
	   */

	  setOptionValue(key, value) {
	    return this.setOptionValueWithSource(key, value, undefined);
	  }

	  /**
	   * Store option value and where the value came from.
	   *
	   * @param {string} key
	   * @param {object} value
	   * @param {string} source - expected values are default/config/env/cli/implied
	   * @return {Command} `this` command for chaining
	   */

	  setOptionValueWithSource(key, value, source) {
	    if (this._storeOptionsAsProperties) {
	      this[key] = value;
	    } else {
	      this._optionValues[key] = value;
	    }
	    this._optionValueSources[key] = source;
	    return this;
	  }

	  /**
	   * Get source of option value.
	   * Expected values are default | config | env | cli | implied
	   *
	   * @param {string} key
	   * @return {string}
	   */

	  getOptionValueSource(key) {
	    return this._optionValueSources[key];
	  }

	  /**
	   * Get source of option value. See also .optsWithGlobals().
	   * Expected values are default | config | env | cli | implied
	   *
	   * @param {string} key
	   * @return {string}
	   */

	  getOptionValueSourceWithGlobals(key) {
	    // global overwrites local, like optsWithGlobals
	    let source;
	    this._getCommandAndAncestors().forEach((cmd) => {
	      if (cmd.getOptionValueSource(key) !== undefined) {
	        source = cmd.getOptionValueSource(key);
	      }
	    });
	    return source;
	  }

	  /**
	   * Get user arguments from implied or explicit arguments.
	   * Side-effects: set _scriptPath if args included script. Used for default program name, and subcommand searches.
	   *
	   * @private
	   */

	  _prepareUserArgs(argv, parseOptions) {
	    if (argv !== undefined && !Array.isArray(argv)) {
	      throw new Error('first parameter to parse must be array or undefined');
	    }
	    parseOptions = parseOptions || {};

	    // auto-detect argument conventions if nothing supplied
	    if (argv === undefined && parseOptions.from === undefined) {
	      if (process.versions?.electron) {
	        parseOptions.from = 'electron';
	      }
	      // check node specific options for scenarios where user CLI args follow executable without scriptname
	      const execArgv = process.execArgv ?? [];
	      if (
	        execArgv.includes('-e') ||
	        execArgv.includes('--eval') ||
	        execArgv.includes('-p') ||
	        execArgv.includes('--print')
	      ) {
	        parseOptions.from = 'eval'; // internal usage, not documented
	      }
	    }

	    // default to using process.argv
	    if (argv === undefined) {
	      argv = process.argv;
	    }
	    this.rawArgs = argv.slice();

	    // extract the user args and scriptPath
	    let userArgs;
	    switch (parseOptions.from) {
	      case undefined:
	      case 'node':
	        this._scriptPath = argv[1];
	        userArgs = argv.slice(2);
	        break;
	      case 'electron':
	        // @ts-ignore: because defaultApp is an unknown property
	        if (process.defaultApp) {
	          this._scriptPath = argv[1];
	          userArgs = argv.slice(2);
	        } else {
	          userArgs = argv.slice(1);
	        }
	        break;
	      case 'user':
	        userArgs = argv.slice(0);
	        break;
	      case 'eval':
	        userArgs = argv.slice(1);
	        break;
	      default:
	        throw new Error(
	          `unexpected parse option { from: '${parseOptions.from}' }`,
	        );
	    }

	    // Find default name for program from arguments.
	    if (!this._name && this._scriptPath)
	      this.nameFromFilename(this._scriptPath);
	    this._name = this._name || 'program';

	    return userArgs;
	  }

	  /**
	   * Parse `argv`, setting options and invoking commands when defined.
	   *
	   * Use parseAsync instead of parse if any of your action handlers are async.
	   *
	   * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
	   *
	   * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
	   * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
	   * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
	   * - `'user'`: just user arguments
	   *
	   * @example
	   * program.parse(); // parse process.argv and auto-detect electron and special node flags
	   * program.parse(process.argv); // assume argv[0] is app and argv[1] is script
	   * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
	   *
	   * @param {string[]} [argv] - optional, defaults to process.argv
	   * @param {object} [parseOptions] - optionally specify style of options with from: node/user/electron
	   * @param {string} [parseOptions.from] - where the args are from: 'node', 'user', 'electron'
	   * @return {Command} `this` command for chaining
	   */

	  parse(argv, parseOptions) {
	    this._prepareForParse();
	    const userArgs = this._prepareUserArgs(argv, parseOptions);
	    this._parseCommand([], userArgs);

	    return this;
	  }

	  /**
	   * Parse `argv`, setting options and invoking commands when defined.
	   *
	   * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
	   *
	   * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
	   * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
	   * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
	   * - `'user'`: just user arguments
	   *
	   * @example
	   * await program.parseAsync(); // parse process.argv and auto-detect electron and special node flags
	   * await program.parseAsync(process.argv); // assume argv[0] is app and argv[1] is script
	   * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
	   *
	   * @param {string[]} [argv]
	   * @param {object} [parseOptions]
	   * @param {string} parseOptions.from - where the args are from: 'node', 'user', 'electron'
	   * @return {Promise}
	   */

	  async parseAsync(argv, parseOptions) {
	    this._prepareForParse();
	    const userArgs = this._prepareUserArgs(argv, parseOptions);
	    await this._parseCommand([], userArgs);

	    return this;
	  }

	  _prepareForParse() {
	    if (this._savedState === null) {
	      this.saveStateBeforeParse();
	    } else {
	      this.restoreStateBeforeParse();
	    }
	  }

	  /**
	   * Called the first time parse is called to save state and allow a restore before subsequent calls to parse.
	   * Not usually called directly, but available for subclasses to save their custom state.
	   *
	   * This is called in a lazy way. Only commands used in parsing chain will have state saved.
	   */
	  saveStateBeforeParse() {
	    this._savedState = {
	      // name is stable if supplied by author, but may be unspecified for root command and deduced during parsing
	      _name: this._name,
	      // option values before parse have default values (including false for negated options)
	      // shallow clones
	      _optionValues: { ...this._optionValues },
	      _optionValueSources: { ...this._optionValueSources },
	    };
	  }

	  /**
	   * Restore state before parse for calls after the first.
	   * Not usually called directly, but available for subclasses to save their custom state.
	   *
	   * This is called in a lazy way. Only commands used in parsing chain will have state restored.
	   */
	  restoreStateBeforeParse() {
	    if (this._storeOptionsAsProperties)
	      throw new Error(`Can not call parse again when storeOptionsAsProperties is true.
- either make a new Command for each call to parse, or stop storing options as properties`);

	    // clear state from _prepareUserArgs
	    this._name = this._savedState._name;
	    this._scriptPath = null;
	    this.rawArgs = [];
	    // clear state from setOptionValueWithSource
	    this._optionValues = { ...this._savedState._optionValues };
	    this._optionValueSources = { ...this._savedState._optionValueSources };
	    // clear state from _parseCommand
	    this.args = [];
	    // clear state from _processArguments
	    this.processedArgs = [];
	  }

	  /**
	   * Throw if expected executable is missing. Add lots of help for author.
	   *
	   * @param {string} executableFile
	   * @param {string} executableDir
	   * @param {string} subcommandName
	   */
	  _checkForMissingExecutable(executableFile, executableDir, subcommandName) {
	    if (fs.existsSync(executableFile)) return;

	    const executableDirMessage = executableDir
	      ? `searched for local subcommand relative to directory '${executableDir}'`
	      : 'no directory for search for local subcommand, use .executableDir() to supply a custom directory';
	    const executableMissing = `'${executableFile}' does not exist
 - if '${subcommandName}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
	    throw new Error(executableMissing);
	  }

	  /**
	   * Execute a sub-command executable.
	   *
	   * @private
	   */

	  _executeSubCommand(subcommand, args) {
	    args = args.slice();
	    let launchWithNode = false; // Use node for source targets so do not need to get permissions correct, and on Windows.
	    const sourceExt = ['.js', '.ts', '.tsx', '.mjs', '.cjs'];

	    function findFile(baseDir, baseName) {
	      // Look for specified file
	      const localBin = path.resolve(baseDir, baseName);
	      if (fs.existsSync(localBin)) return localBin;

	      // Stop looking if candidate already has an expected extension.
	      if (sourceExt.includes(path.extname(baseName))) return undefined;

	      // Try all the extensions.
	      const foundExt = sourceExt.find((ext) =>
	        fs.existsSync(`${localBin}${ext}`),
	      );
	      if (foundExt) return `${localBin}${foundExt}`;

	      return undefined;
	    }

	    // Not checking for help first. Unlikely to have mandatory and executable, and can't robustly test for help flags in external command.
	    this._checkForMissingMandatoryOptions();
	    this._checkForConflictingOptions();

	    // executableFile and executableDir might be full path, or just a name
	    let executableFile =
	      subcommand._executableFile || `${this._name}-${subcommand._name}`;
	    let executableDir = this._executableDir || '';
	    if (this._scriptPath) {
	      let resolvedScriptPath; // resolve possible symlink for installed npm binary
	      try {
	        resolvedScriptPath = fs.realpathSync(this._scriptPath);
	      } catch {
	        resolvedScriptPath = this._scriptPath;
	      }
	      executableDir = path.resolve(
	        path.dirname(resolvedScriptPath),
	        executableDir,
	      );
	    }

	    // Look for a local file in preference to a command in PATH.
	    if (executableDir) {
	      let localFile = findFile(executableDir, executableFile);

	      // Legacy search using prefix of script name instead of command name
	      if (!localFile && !subcommand._executableFile && this._scriptPath) {
	        const legacyName = path.basename(
	          this._scriptPath,
	          path.extname(this._scriptPath),
	        );
	        if (legacyName !== this._name) {
	          localFile = findFile(
	            executableDir,
	            `${legacyName}-${subcommand._name}`,
	          );
	        }
	      }
	      executableFile = localFile || executableFile;
	    }

	    launchWithNode = sourceExt.includes(path.extname(executableFile));

	    let proc;
	    if (process.platform !== 'win32') {
	      if (launchWithNode) {
	        args.unshift(executableFile);
	        // add executable arguments to spawn
	        args = incrementNodeInspectorPort(process.execArgv).concat(args);

	        proc = childProcess.spawn(process.argv[0], args, { stdio: 'inherit' });
	      } else {
	        proc = childProcess.spawn(executableFile, args, { stdio: 'inherit' });
	      }
	    } else {
	      this._checkForMissingExecutable(
	        executableFile,
	        executableDir,
	        subcommand._name,
	      );
	      args.unshift(executableFile);
	      // add executable arguments to spawn
	      args = incrementNodeInspectorPort(process.execArgv).concat(args);
	      proc = childProcess.spawn(process.execPath, args, { stdio: 'inherit' });
	    }

	    if (!proc.killed) {
	      // testing mainly to avoid leak warnings during unit tests with mocked spawn
	      const signals = ['SIGUSR1', 'SIGUSR2', 'SIGTERM', 'SIGINT', 'SIGHUP'];
	      signals.forEach((signal) => {
	        process.on(signal, () => {
	          if (proc.killed === false && proc.exitCode === null) {
	            // @ts-ignore because signals not typed to known strings
	            proc.kill(signal);
	          }
	        });
	      });
	    }

	    // By default terminate process when spawned process terminates.
	    const exitCallback = this._exitCallback;
	    proc.on('close', (code) => {
	      code = code ?? 1; // code is null if spawned process terminated due to a signal
	      if (!exitCallback) {
	        process.exit(code);
	      } else {
	        exitCallback(
	          new CommanderError(
	            code,
	            'commander.executeSubCommandAsync',
	            '(close)',
	          ),
	        );
	      }
	    });
	    proc.on('error', (err) => {
	      // @ts-ignore: because err.code is an unknown property
	      if (err.code === 'ENOENT') {
	        this._checkForMissingExecutable(
	          executableFile,
	          executableDir,
	          subcommand._name,
	        );
	        // @ts-ignore: because err.code is an unknown property
	      } else if (err.code === 'EACCES') {
	        throw new Error(`'${executableFile}' not executable`);
	      }
	      if (!exitCallback) {
	        process.exit(1);
	      } else {
	        const wrappedError = new CommanderError(
	          1,
	          'commander.executeSubCommandAsync',
	          '(error)',
	        );
	        wrappedError.nestedError = err;
	        exitCallback(wrappedError);
	      }
	    });

	    // Store the reference to the child process
	    this.runningCommand = proc;
	  }

	  /**
	   * @private
	   */

	  _dispatchSubcommand(commandName, operands, unknown) {
	    const subCommand = this._findCommand(commandName);
	    if (!subCommand) this.help({ error: true });

	    subCommand._prepareForParse();
	    let promiseChain;
	    promiseChain = this._chainOrCallSubCommandHook(
	      promiseChain,
	      subCommand,
	      'preSubcommand',
	    );
	    promiseChain = this._chainOrCall(promiseChain, () => {
	      if (subCommand._executableHandler) {
	        this._executeSubCommand(subCommand, operands.concat(unknown));
	      } else {
	        return subCommand._parseCommand(operands, unknown);
	      }
	    });
	    return promiseChain;
	  }

	  /**
	   * Invoke help directly if possible, or dispatch if necessary.
	   * e.g. help foo
	   *
	   * @private
	   */

	  _dispatchHelpCommand(subcommandName) {
	    if (!subcommandName) {
	      this.help();
	    }
	    const subCommand = this._findCommand(subcommandName);
	    if (subCommand && !subCommand._executableHandler) {
	      subCommand.help();
	    }

	    // Fallback to parsing the help flag to invoke the help.
	    return this._dispatchSubcommand(
	      subcommandName,
	      [],
	      [this._getHelpOption()?.long ?? this._getHelpOption()?.short ?? '--help'],
	    );
	  }

	  /**
	   * Check this.args against expected this.registeredArguments.
	   *
	   * @private
	   */

	  _checkNumberOfArguments() {
	    // too few
	    this.registeredArguments.forEach((arg, i) => {
	      if (arg.required && this.args[i] == null) {
	        this.missingArgument(arg.name());
	      }
	    });
	    // too many
	    if (
	      this.registeredArguments.length > 0 &&
	      this.registeredArguments[this.registeredArguments.length - 1].variadic
	    ) {
	      return;
	    }
	    if (this.args.length > this.registeredArguments.length) {
	      this._excessArguments(this.args);
	    }
	  }

	  /**
	   * Process this.args using this.registeredArguments and save as this.processedArgs!
	   *
	   * @private
	   */

	  _processArguments() {
	    const myParseArg = (argument, value, previous) => {
	      // Extra processing for nice error message on parsing failure.
	      let parsedValue = value;
	      if (value !== null && argument.parseArg) {
	        const invalidValueMessage = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'.`;
	        parsedValue = this._callParseArg(
	          argument,
	          value,
	          previous,
	          invalidValueMessage,
	        );
	      }
	      return parsedValue;
	    };

	    this._checkNumberOfArguments();

	    const processedArgs = [];
	    this.registeredArguments.forEach((declaredArg, index) => {
	      let value = declaredArg.defaultValue;
	      if (declaredArg.variadic) {
	        // Collect together remaining arguments for passing together as an array.
	        if (index < this.args.length) {
	          value = this.args.slice(index);
	          if (declaredArg.parseArg) {
	            value = value.reduce((processed, v) => {
	              return myParseArg(declaredArg, v, processed);
	            }, declaredArg.defaultValue);
	          }
	        } else if (value === undefined) {
	          value = [];
	        }
	      } else if (index < this.args.length) {
	        value = this.args[index];
	        if (declaredArg.parseArg) {
	          value = myParseArg(declaredArg, value, declaredArg.defaultValue);
	        }
	      }
	      processedArgs[index] = value;
	    });
	    this.processedArgs = processedArgs;
	  }

	  /**
	   * Once we have a promise we chain, but call synchronously until then.
	   *
	   * @param {(Promise|undefined)} promise
	   * @param {Function} fn
	   * @return {(Promise|undefined)}
	   * @private
	   */

	  _chainOrCall(promise, fn) {
	    // thenable
	    if (promise && promise.then && typeof promise.then === 'function') {
	      // already have a promise, chain callback
	      return promise.then(() => fn());
	    }
	    // callback might return a promise
	    return fn();
	  }

	  /**
	   *
	   * @param {(Promise|undefined)} promise
	   * @param {string} event
	   * @return {(Promise|undefined)}
	   * @private
	   */

	  _chainOrCallHooks(promise, event) {
	    let result = promise;
	    const hooks = [];
	    this._getCommandAndAncestors()
	      .reverse()
	      .filter((cmd) => cmd._lifeCycleHooks[event] !== undefined)
	      .forEach((hookedCommand) => {
	        hookedCommand._lifeCycleHooks[event].forEach((callback) => {
	          hooks.push({ hookedCommand, callback });
	        });
	      });
	    if (event === 'postAction') {
	      hooks.reverse();
	    }

	    hooks.forEach((hookDetail) => {
	      result = this._chainOrCall(result, () => {
	        return hookDetail.callback(hookDetail.hookedCommand, this);
	      });
	    });
	    return result;
	  }

	  /**
	   *
	   * @param {(Promise|undefined)} promise
	   * @param {Command} subCommand
	   * @param {string} event
	   * @return {(Promise|undefined)}
	   * @private
	   */

	  _chainOrCallSubCommandHook(promise, subCommand, event) {
	    let result = promise;
	    if (this._lifeCycleHooks[event] !== undefined) {
	      this._lifeCycleHooks[event].forEach((hook) => {
	        result = this._chainOrCall(result, () => {
	          return hook(this, subCommand);
	        });
	      });
	    }
	    return result;
	  }

	  /**
	   * Process arguments in context of this command.
	   * Returns action result, in case it is a promise.
	   *
	   * @private
	   */

	  _parseCommand(operands, unknown) {
	    const parsed = this.parseOptions(unknown);
	    this._parseOptionsEnv(); // after cli, so parseArg not called on both cli and env
	    this._parseOptionsImplied();
	    operands = operands.concat(parsed.operands);
	    unknown = parsed.unknown;
	    this.args = operands.concat(unknown);

	    if (operands && this._findCommand(operands[0])) {
	      return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
	    }
	    if (
	      this._getHelpCommand() &&
	      operands[0] === this._getHelpCommand().name()
	    ) {
	      return this._dispatchHelpCommand(operands[1]);
	    }
	    if (this._defaultCommandName) {
	      this._outputHelpIfRequested(unknown); // Run the help for default command from parent rather than passing to default command
	      return this._dispatchSubcommand(
	        this._defaultCommandName,
	        operands,
	        unknown,
	      );
	    }
	    if (
	      this.commands.length &&
	      this.args.length === 0 &&
	      !this._actionHandler &&
	      !this._defaultCommandName
	    ) {
	      // probably missing subcommand and no handler, user needs help (and exit)
	      this.help({ error: true });
	    }

	    this._outputHelpIfRequested(parsed.unknown);
	    this._checkForMissingMandatoryOptions();
	    this._checkForConflictingOptions();

	    // We do not always call this check to avoid masking a "better" error, like unknown command.
	    const checkForUnknownOptions = () => {
	      if (parsed.unknown.length > 0) {
	        this.unknownOption(parsed.unknown[0]);
	      }
	    };

	    const commandEvent = `command:${this.name()}`;
	    if (this._actionHandler) {
	      checkForUnknownOptions();
	      this._processArguments();

	      let promiseChain;
	      promiseChain = this._chainOrCallHooks(promiseChain, 'preAction');
	      promiseChain = this._chainOrCall(promiseChain, () =>
	        this._actionHandler(this.processedArgs),
	      );
	      if (this.parent) {
	        promiseChain = this._chainOrCall(promiseChain, () => {
	          this.parent.emit(commandEvent, operands, unknown); // legacy
	        });
	      }
	      promiseChain = this._chainOrCallHooks(promiseChain, 'postAction');
	      return promiseChain;
	    }
	    if (this.parent && this.parent.listenerCount(commandEvent)) {
	      checkForUnknownOptions();
	      this._processArguments();
	      this.parent.emit(commandEvent, operands, unknown); // legacy
	    } else if (operands.length) {
	      if (this._findCommand('*')) {
	        // legacy default command
	        return this._dispatchSubcommand('*', operands, unknown);
	      }
	      if (this.listenerCount('command:*')) {
	        // skip option check, emit event for possible misspelling suggestion
	        this.emit('command:*', operands, unknown);
	      } else if (this.commands.length) {
	        this.unknownCommand();
	      } else {
	        checkForUnknownOptions();
	        this._processArguments();
	      }
	    } else if (this.commands.length) {
	      checkForUnknownOptions();
	      // This command has subcommands and nothing hooked up at this level, so display help (and exit).
	      this.help({ error: true });
	    } else {
	      checkForUnknownOptions();
	      this._processArguments();
	      // fall through for caller to handle after calling .parse()
	    }
	  }

	  /**
	   * Find matching command.
	   *
	   * @private
	   * @return {Command | undefined}
	   */
	  _findCommand(name) {
	    if (!name) return undefined;
	    return this.commands.find(
	      (cmd) => cmd._name === name || cmd._aliases.includes(name),
	    );
	  }

	  /**
	   * Return an option matching `arg` if any.
	   *
	   * @param {string} arg
	   * @return {Option}
	   * @package
	   */

	  _findOption(arg) {
	    return this.options.find((option) => option.is(arg));
	  }

	  /**
	   * Display an error message if a mandatory option does not have a value.
	   * Called after checking for help flags in leaf subcommand.
	   *
	   * @private
	   */

	  _checkForMissingMandatoryOptions() {
	    // Walk up hierarchy so can call in subcommand after checking for displaying help.
	    this._getCommandAndAncestors().forEach((cmd) => {
	      cmd.options.forEach((anOption) => {
	        if (
	          anOption.mandatory &&
	          cmd.getOptionValue(anOption.attributeName()) === undefined
	        ) {
	          cmd.missingMandatoryOptionValue(anOption);
	        }
	      });
	    });
	  }

	  /**
	   * Display an error message if conflicting options are used together in this.
	   *
	   * @private
	   */
	  _checkForConflictingLocalOptions() {
	    const definedNonDefaultOptions = this.options.filter((option) => {
	      const optionKey = option.attributeName();
	      if (this.getOptionValue(optionKey) === undefined) {
	        return false;
	      }
	      return this.getOptionValueSource(optionKey) !== 'default';
	    });

	    const optionsWithConflicting = definedNonDefaultOptions.filter(
	      (option) => option.conflictsWith.length > 0,
	    );

	    optionsWithConflicting.forEach((option) => {
	      const conflictingAndDefined = definedNonDefaultOptions.find((defined) =>
	        option.conflictsWith.includes(defined.attributeName()),
	      );
	      if (conflictingAndDefined) {
	        this._conflictingOption(option, conflictingAndDefined);
	      }
	    });
	  }

	  /**
	   * Display an error message if conflicting options are used together.
	   * Called after checking for help flags in leaf subcommand.
	   *
	   * @private
	   */
	  _checkForConflictingOptions() {
	    // Walk up hierarchy so can call in subcommand after checking for displaying help.
	    this._getCommandAndAncestors().forEach((cmd) => {
	      cmd._checkForConflictingLocalOptions();
	    });
	  }

	  /**
	   * Parse options from `argv` removing known options,
	   * and return argv split into operands and unknown arguments.
	   *
	   * Side effects: modifies command by storing options. Does not reset state if called again.
	   *
	   * Examples:
	   *
	   *     argv => operands, unknown
	   *     --known kkk op => [op], []
	   *     op --known kkk => [op], []
	   *     sub --unknown uuu op => [sub], [--unknown uuu op]
	   *     sub -- --unknown uuu op => [sub --unknown uuu op], []
	   *
	   * @param {string[]} argv
	   * @return {{operands: string[], unknown: string[]}}
	   */

	  parseOptions(argv) {
	    const operands = []; // operands, not options or values
	    const unknown = []; // first unknown option and remaining unknown args
	    let dest = operands;
	    const args = argv.slice();

	    function maybeOption(arg) {
	      return arg.length > 1 && arg[0] === '-';
	    }

	    const negativeNumberArg = (arg) => {
	      // return false if not a negative number
	      if (!/^-\d*\.?\d+(e[+-]?\d+)?$/.test(arg)) return false;
	      // negative number is ok unless digit used as an option in command hierarchy
	      return !this._getCommandAndAncestors().some((cmd) =>
	        cmd.options
	          .map((opt) => opt.short)
	          .some((short) => /^-\d$/.test(short)),
	      );
	    };

	    // parse options
	    let activeVariadicOption = null;
	    while (args.length) {
	      const arg = args.shift();

	      // literal
	      if (arg === '--') {
	        if (dest === unknown) dest.push(arg);
	        dest.push(...args);
	        break;
	      }

	      if (
	        activeVariadicOption &&
	        (!maybeOption(arg) || negativeNumberArg(arg))
	      ) {
	        this.emit(`option:${activeVariadicOption.name()}`, arg);
	        continue;
	      }
	      activeVariadicOption = null;

	      if (maybeOption(arg)) {
	        const option = this._findOption(arg);
	        // recognised option, call listener to assign value with possible custom processing
	        if (option) {
	          if (option.required) {
	            const value = args.shift();
	            if (value === undefined) this.optionMissingArgument(option);
	            this.emit(`option:${option.name()}`, value);
	          } else if (option.optional) {
	            let value = null;
	            // historical behaviour is optional value is following arg unless an option
	            if (
	              args.length > 0 &&
	              (!maybeOption(args[0]) || negativeNumberArg(args[0]))
	            ) {
	              value = args.shift();
	            }
	            this.emit(`option:${option.name()}`, value);
	          } else {
	            // boolean flag
	            this.emit(`option:${option.name()}`);
	          }
	          activeVariadicOption = option.variadic ? option : null;
	          continue;
	        }
	      }

	      // Look for combo options following single dash, eat first one if known.
	      if (arg.length > 2 && arg[0] === '-' && arg[1] !== '-') {
	        const option = this._findOption(`-${arg[1]}`);
	        if (option) {
	          if (
	            option.required ||
	            (option.optional && this._combineFlagAndOptionalValue)
	          ) {
	            // option with value following in same argument
	            this.emit(`option:${option.name()}`, arg.slice(2));
	          } else {
	            // boolean option, emit and put back remainder of arg for further processing
	            this.emit(`option:${option.name()}`);
	            args.unshift(`-${arg.slice(2)}`);
	          }
	          continue;
	        }
	      }

	      // Look for known long flag with value, like --foo=bar
	      if (/^--[^=]+=/.test(arg)) {
	        const index = arg.indexOf('=');
	        const option = this._findOption(arg.slice(0, index));
	        if (option && (option.required || option.optional)) {
	          this.emit(`option:${option.name()}`, arg.slice(index + 1));
	          continue;
	        }
	      }

	      // Not a recognised option by this command.
	      // Might be a command-argument, or subcommand option, or unknown option, or help command or option.

	      // An unknown option means further arguments also classified as unknown so can be reprocessed by subcommands.
	      // A negative number in a leaf command is not an unknown option.
	      if (
	        dest === operands &&
	        maybeOption(arg) &&
	        !(this.commands.length === 0 && negativeNumberArg(arg))
	      ) {
	        dest = unknown;
	      }

	      // If using positionalOptions, stop processing our options at subcommand.
	      if (
	        (this._enablePositionalOptions || this._passThroughOptions) &&
	        operands.length === 0 &&
	        unknown.length === 0
	      ) {
	        if (this._findCommand(arg)) {
	          operands.push(arg);
	          if (args.length > 0) unknown.push(...args);
	          break;
	        } else if (
	          this._getHelpCommand() &&
	          arg === this._getHelpCommand().name()
	        ) {
	          operands.push(arg);
	          if (args.length > 0) operands.push(...args);
	          break;
	        } else if (this._defaultCommandName) {
	          unknown.push(arg);
	          if (args.length > 0) unknown.push(...args);
	          break;
	        }
	      }

	      // If using passThroughOptions, stop processing options at first command-argument.
	      if (this._passThroughOptions) {
	        dest.push(arg);
	        if (args.length > 0) dest.push(...args);
	        break;
	      }

	      // add arg
	      dest.push(arg);
	    }

	    return { operands, unknown };
	  }

	  /**
	   * Return an object containing local option values as key-value pairs.
	   *
	   * @return {object}
	   */
	  opts() {
	    if (this._storeOptionsAsProperties) {
	      // Preserve original behaviour so backwards compatible when still using properties
	      const result = {};
	      const len = this.options.length;

	      for (let i = 0; i < len; i++) {
	        const key = this.options[i].attributeName();
	        result[key] =
	          key === this._versionOptionName ? this._version : this[key];
	      }
	      return result;
	    }

	    return this._optionValues;
	  }

	  /**
	   * Return an object containing merged local and global option values as key-value pairs.
	   *
	   * @return {object}
	   */
	  optsWithGlobals() {
	    // globals overwrite locals
	    return this._getCommandAndAncestors().reduce(
	      (combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()),
	      {},
	    );
	  }

	  /**
	   * Display error message and exit (or call exitOverride).
	   *
	   * @param {string} message
	   * @param {object} [errorOptions]
	   * @param {string} [errorOptions.code] - an id string representing the error
	   * @param {number} [errorOptions.exitCode] - used with process.exit
	   */
	  error(message, errorOptions) {
	    // output handling
	    this._outputConfiguration.outputError(
	      `${message}\n`,
	      this._outputConfiguration.writeErr,
	    );
	    if (typeof this._showHelpAfterError === 'string') {
	      this._outputConfiguration.writeErr(`${this._showHelpAfterError}\n`);
	    } else if (this._showHelpAfterError) {
	      this._outputConfiguration.writeErr('\n');
	      this.outputHelp({ error: true });
	    }

	    // exit handling
	    const config = errorOptions || {};
	    const exitCode = config.exitCode || 1;
	    const code = config.code || 'commander.error';
	    this._exit(exitCode, code, message);
	  }

	  /**
	   * Apply any option related environment variables, if option does
	   * not have a value from cli or client code.
	   *
	   * @private
	   */
	  _parseOptionsEnv() {
	    this.options.forEach((option) => {
	      if (option.envVar && option.envVar in process.env) {
	        const optionKey = option.attributeName();
	        // Priority check. Do not overwrite cli or options from unknown source (client-code).
	        if (
	          this.getOptionValue(optionKey) === undefined ||
	          ['default', 'config', 'env'].includes(
	            this.getOptionValueSource(optionKey),
	          )
	        ) {
	          if (option.required || option.optional) {
	            // option can take a value
	            // keep very simple, optional always takes value
	            this.emit(`optionEnv:${option.name()}`, process.env[option.envVar]);
	          } else {
	            // boolean
	            // keep very simple, only care that envVar defined and not the value
	            this.emit(`optionEnv:${option.name()}`);
	          }
	        }
	      }
	    });
	  }

	  /**
	   * Apply any implied option values, if option is undefined or default value.
	   *
	   * @private
	   */
	  _parseOptionsImplied() {
	    const dualHelper = new DualOptions(this.options);
	    const hasCustomOptionValue = (optionKey) => {
	      return (
	        this.getOptionValue(optionKey) !== undefined &&
	        !['default', 'implied'].includes(this.getOptionValueSource(optionKey))
	      );
	    };
	    this.options
	      .filter(
	        (option) =>
	          option.implied !== undefined &&
	          hasCustomOptionValue(option.attributeName()) &&
	          dualHelper.valueFromOption(
	            this.getOptionValue(option.attributeName()),
	            option,
	          ),
	      )
	      .forEach((option) => {
	        Object.keys(option.implied)
	          .filter((impliedKey) => !hasCustomOptionValue(impliedKey))
	          .forEach((impliedKey) => {
	            this.setOptionValueWithSource(
	              impliedKey,
	              option.implied[impliedKey],
	              'implied',
	            );
	          });
	      });
	  }

	  /**
	   * Argument `name` is missing.
	   *
	   * @param {string} name
	   * @private
	   */

	  missingArgument(name) {
	    const message = `error: missing required argument '${name}'`;
	    this.error(message, { code: 'commander.missingArgument' });
	  }

	  /**
	   * `Option` is missing an argument.
	   *
	   * @param {Option} option
	   * @private
	   */

	  optionMissingArgument(option) {
	    const message = `error: option '${option.flags}' argument missing`;
	    this.error(message, { code: 'commander.optionMissingArgument' });
	  }

	  /**
	   * `Option` does not have a value, and is a mandatory option.
	   *
	   * @param {Option} option
	   * @private
	   */

	  missingMandatoryOptionValue(option) {
	    const message = `error: required option '${option.flags}' not specified`;
	    this.error(message, { code: 'commander.missingMandatoryOptionValue' });
	  }

	  /**
	   * `Option` conflicts with another option.
	   *
	   * @param {Option} option
	   * @param {Option} conflictingOption
	   * @private
	   */
	  _conflictingOption(option, conflictingOption) {
	    // The calling code does not know whether a negated option is the source of the
	    // value, so do some work to take an educated guess.
	    const findBestOptionFromValue = (option) => {
	      const optionKey = option.attributeName();
	      const optionValue = this.getOptionValue(optionKey);
	      const negativeOption = this.options.find(
	        (target) => target.negate && optionKey === target.attributeName(),
	      );
	      const positiveOption = this.options.find(
	        (target) => !target.negate && optionKey === target.attributeName(),
	      );
	      if (
	        negativeOption &&
	        ((negativeOption.presetArg === undefined && optionValue === false) ||
	          (negativeOption.presetArg !== undefined &&
	            optionValue === negativeOption.presetArg))
	      ) {
	        return negativeOption;
	      }
	      return positiveOption || option;
	    };

	    const getErrorMessage = (option) => {
	      const bestOption = findBestOptionFromValue(option);
	      const optionKey = bestOption.attributeName();
	      const source = this.getOptionValueSource(optionKey);
	      if (source === 'env') {
	        return `environment variable '${bestOption.envVar}'`;
	      }
	      return `option '${bestOption.flags}'`;
	    };

	    const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
	    this.error(message, { code: 'commander.conflictingOption' });
	  }

	  /**
	   * Unknown option `flag`.
	   *
	   * @param {string} flag
	   * @private
	   */

	  unknownOption(flag) {
	    if (this._allowUnknownOption) return;
	    let suggestion = '';

	    if (flag.startsWith('--') && this._showSuggestionAfterError) {
	      // Looping to pick up the global options too
	      let candidateFlags = [];
	      // eslint-disable-next-line @typescript-eslint/no-this-alias
	      let command = this;
	      do {
	        const moreFlags = command
	          .createHelp()
	          .visibleOptions(command)
	          .filter((option) => option.long)
	          .map((option) => option.long);
	        candidateFlags = candidateFlags.concat(moreFlags);
	        command = command.parent;
	      } while (command && !command._enablePositionalOptions);
	      suggestion = suggestSimilar(flag, candidateFlags);
	    }

	    const message = `error: unknown option '${flag}'${suggestion}`;
	    this.error(message, { code: 'commander.unknownOption' });
	  }

	  /**
	   * Excess arguments, more than expected.
	   *
	   * @param {string[]} receivedArgs
	   * @private
	   */

	  _excessArguments(receivedArgs) {
	    if (this._allowExcessArguments) return;

	    const expected = this.registeredArguments.length;
	    const s = expected === 1 ? '' : 's';
	    const forSubcommand = this.parent ? ` for '${this.name()}'` : '';
	    const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`;
	    this.error(message, { code: 'commander.excessArguments' });
	  }

	  /**
	   * Unknown command.
	   *
	   * @private
	   */

	  unknownCommand() {
	    const unknownName = this.args[0];
	    let suggestion = '';

	    if (this._showSuggestionAfterError) {
	      const candidateNames = [];
	      this.createHelp()
	        .visibleCommands(this)
	        .forEach((command) => {
	          candidateNames.push(command.name());
	          // just visible alias
	          if (command.alias()) candidateNames.push(command.alias());
	        });
	      suggestion = suggestSimilar(unknownName, candidateNames);
	    }

	    const message = `error: unknown command '${unknownName}'${suggestion}`;
	    this.error(message, { code: 'commander.unknownCommand' });
	  }

	  /**
	   * Get or set the program version.
	   *
	   * This method auto-registers the "-V, --version" option which will print the version number.
	   *
	   * You can optionally supply the flags and description to override the defaults.
	   *
	   * @param {string} [str]
	   * @param {string} [flags]
	   * @param {string} [description]
	   * @return {(this | string | undefined)} `this` command for chaining, or version string if no arguments
	   */

	  version(str, flags, description) {
	    if (str === undefined) return this._version;
	    this._version = str;
	    flags = flags || '-V, --version';
	    description = description || 'output the version number';
	    const versionOption = this.createOption(flags, description);
	    this._versionOptionName = versionOption.attributeName();
	    this._registerOption(versionOption);

	    this.on('option:' + versionOption.name(), () => {
	      this._outputConfiguration.writeOut(`${str}\n`);
	      this._exit(0, 'commander.version', str);
	    });
	    return this;
	  }

	  /**
	   * Set the description.
	   *
	   * @param {string} [str]
	   * @param {object} [argsDescription]
	   * @return {(string|Command)}
	   */
	  description(str, argsDescription) {
	    if (str === undefined && argsDescription === undefined)
	      return this._description;
	    this._description = str;
	    if (argsDescription) {
	      this._argsDescription = argsDescription;
	    }
	    return this;
	  }

	  /**
	   * Set the summary. Used when listed as subcommand of parent.
	   *
	   * @param {string} [str]
	   * @return {(string|Command)}
	   */
	  summary(str) {
	    if (str === undefined) return this._summary;
	    this._summary = str;
	    return this;
	  }

	  /**
	   * Set an alias for the command.
	   *
	   * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
	   *
	   * @param {string} [alias]
	   * @return {(string|Command)}
	   */

	  alias(alias) {
	    if (alias === undefined) return this._aliases[0]; // just return first, for backwards compatibility

	    /** @type {Command} */
	    // eslint-disable-next-line @typescript-eslint/no-this-alias
	    let command = this;
	    if (
	      this.commands.length !== 0 &&
	      this.commands[this.commands.length - 1]._executableHandler
	    ) {
	      // assume adding alias for last added executable subcommand, rather than this
	      command = this.commands[this.commands.length - 1];
	    }

	    if (alias === command._name)
	      throw new Error("Command alias can't be the same as its name");
	    const matchingCommand = this.parent?._findCommand(alias);
	    if (matchingCommand) {
	      // c.f. _registerCommand
	      const existingCmd = [matchingCommand.name()]
	        .concat(matchingCommand.aliases())
	        .join('|');
	      throw new Error(
	        `cannot add alias '${alias}' to command '${this.name()}' as already have command '${existingCmd}'`,
	      );
	    }

	    command._aliases.push(alias);
	    return this;
	  }

	  /**
	   * Set aliases for the command.
	   *
	   * Only the first alias is shown in the auto-generated help.
	   *
	   * @param {string[]} [aliases]
	   * @return {(string[]|Command)}
	   */

	  aliases(aliases) {
	    // Getter for the array of aliases is the main reason for having aliases() in addition to alias().
	    if (aliases === undefined) return this._aliases;

	    aliases.forEach((alias) => this.alias(alias));
	    return this;
	  }

	  /**
	   * Set / get the command usage `str`.
	   *
	   * @param {string} [str]
	   * @return {(string|Command)}
	   */

	  usage(str) {
	    if (str === undefined) {
	      if (this._usage) return this._usage;

	      const args = this.registeredArguments.map((arg) => {
	        return humanReadableArgName(arg);
	      });
	      return []
	        .concat(
	          this.options.length || this._helpOption !== null ? '[options]' : [],
	          this.commands.length ? '[command]' : [],
	          this.registeredArguments.length ? args : [],
	        )
	        .join(' ');
	    }

	    this._usage = str;
	    return this;
	  }

	  /**
	   * Get or set the name of the command.
	   *
	   * @param {string} [str]
	   * @return {(string|Command)}
	   */

	  name(str) {
	    if (str === undefined) return this._name;
	    this._name = str;
	    return this;
	  }

	  /**
	   * Set/get the help group heading for this subcommand in parent command's help.
	   *
	   * @param {string} [heading]
	   * @return {Command | string}
	   */

	  helpGroup(heading) {
	    if (heading === undefined) return this._helpGroupHeading ?? '';
	    this._helpGroupHeading = heading;
	    return this;
	  }

	  /**
	   * Set/get the default help group heading for subcommands added to this command.
	   * (This does not override a group set directly on the subcommand using .helpGroup().)
	   *
	   * @example
	   * program.commandsGroup('Development Commands:);
	   * program.command('watch')...
	   * program.command('lint')...
	   * ...
	   *
	   * @param {string} [heading]
	   * @returns {Command | string}
	   */
	  commandsGroup(heading) {
	    if (heading === undefined) return this._defaultCommandGroup ?? '';
	    this._defaultCommandGroup = heading;
	    return this;
	  }

	  /**
	   * Set/get the default help group heading for options added to this command.
	   * (This does not override a group set directly on the option using .helpGroup().)
	   *
	   * @example
	   * program
	   *   .optionsGroup('Development Options:')
	   *   .option('-d, --debug', 'output extra debugging')
	   *   .option('-p, --profile', 'output profiling information')
	   *
	   * @param {string} [heading]
	   * @returns {Command | string}
	   */
	  optionsGroup(heading) {
	    if (heading === undefined) return this._defaultOptionGroup ?? '';
	    this._defaultOptionGroup = heading;
	    return this;
	  }

	  /**
	   * @param {Option} option
	   * @private
	   */
	  _initOptionGroup(option) {
	    if (this._defaultOptionGroup && !option.helpGroupHeading)
	      option.helpGroup(this._defaultOptionGroup);
	  }

	  /**
	   * @param {Command} cmd
	   * @private
	   */
	  _initCommandGroup(cmd) {
	    if (this._defaultCommandGroup && !cmd.helpGroup())
	      cmd.helpGroup(this._defaultCommandGroup);
	  }

	  /**
	   * Set the name of the command from script filename, such as process.argv[1],
	   * or require.main.filename, or __filename.
	   *
	   * (Used internally and public although not documented in README.)
	   *
	   * @example
	   * program.nameFromFilename(require.main.filename);
	   *
	   * @param {string} filename
	   * @return {Command}
	   */

	  nameFromFilename(filename) {
	    this._name = path.basename(filename, path.extname(filename));

	    return this;
	  }

	  /**
	   * Get or set the directory for searching for executable subcommands of this command.
	   *
	   * @example
	   * program.executableDir(__dirname);
	   * // or
	   * program.executableDir('subcommands');
	   *
	   * @param {string} [path]
	   * @return {(string|null|Command)}
	   */

	  executableDir(path) {
	    if (path === undefined) return this._executableDir;
	    this._executableDir = path;
	    return this;
	  }

	  /**
	   * Return program help documentation.
	   *
	   * @param {{ error: boolean }} [contextOptions] - pass {error:true} to wrap for stderr instead of stdout
	   * @return {string}
	   */

	  helpInformation(contextOptions) {
	    const helper = this.createHelp();
	    const context = this._getOutputContext(contextOptions);
	    helper.prepareContext({
	      error: context.error,
	      helpWidth: context.helpWidth,
	      outputHasColors: context.hasColors,
	    });
	    const text = helper.formatHelp(this, helper);
	    if (context.hasColors) return text;
	    return this._outputConfiguration.stripColor(text);
	  }

	  /**
	   * @typedef HelpContext
	   * @type {object}
	   * @property {boolean} error
	   * @property {number} helpWidth
	   * @property {boolean} hasColors
	   * @property {function} write - includes stripColor if needed
	   *
	   * @returns {HelpContext}
	   * @private
	   */

	  _getOutputContext(contextOptions) {
	    contextOptions = contextOptions || {};
	    const error = !!contextOptions.error;
	    let baseWrite;
	    let hasColors;
	    let helpWidth;
	    if (error) {
	      baseWrite = (str) => this._outputConfiguration.writeErr(str);
	      hasColors = this._outputConfiguration.getErrHasColors();
	      helpWidth = this._outputConfiguration.getErrHelpWidth();
	    } else {
	      baseWrite = (str) => this._outputConfiguration.writeOut(str);
	      hasColors = this._outputConfiguration.getOutHasColors();
	      helpWidth = this._outputConfiguration.getOutHelpWidth();
	    }
	    const write = (str) => {
	      if (!hasColors) str = this._outputConfiguration.stripColor(str);
	      return baseWrite(str);
	    };
	    return { error, write, hasColors, helpWidth };
	  }

	  /**
	   * Output help information for this command.
	   *
	   * Outputs built-in help, and custom text added using `.addHelpText()`.
	   *
	   * @param {{ error: boolean } | Function} [contextOptions] - pass {error:true} to write to stderr instead of stdout
	   */

	  outputHelp(contextOptions) {
	    let deprecatedCallback;
	    if (typeof contextOptions === 'function') {
	      deprecatedCallback = contextOptions;
	      contextOptions = undefined;
	    }

	    const outputContext = this._getOutputContext(contextOptions);
	    /** @type {HelpTextEventContext} */
	    const eventContext = {
	      error: outputContext.error,
	      write: outputContext.write,
	      command: this,
	    };

	    this._getCommandAndAncestors()
	      .reverse()
	      .forEach((command) => command.emit('beforeAllHelp', eventContext));
	    this.emit('beforeHelp', eventContext);

	    let helpInformation = this.helpInformation({ error: outputContext.error });
	    if (deprecatedCallback) {
	      helpInformation = deprecatedCallback(helpInformation);
	      if (
	        typeof helpInformation !== 'string' &&
	        !Buffer.isBuffer(helpInformation)
	      ) {
	        throw new Error('outputHelp callback must return a string or a Buffer');
	      }
	    }
	    outputContext.write(helpInformation);

	    if (this._getHelpOption()?.long) {
	      this.emit(this._getHelpOption().long); // deprecated
	    }
	    this.emit('afterHelp', eventContext);
	    this._getCommandAndAncestors().forEach((command) =>
	      command.emit('afterAllHelp', eventContext),
	    );
	  }

	  /**
	   * You can pass in flags and a description to customise the built-in help option.
	   * Pass in false to disable the built-in help option.
	   *
	   * @example
	   * program.helpOption('-?, --help' 'show help'); // customise
	   * program.helpOption(false); // disable
	   *
	   * @param {(string | boolean)} flags
	   * @param {string} [description]
	   * @return {Command} `this` command for chaining
	   */

	  helpOption(flags, description) {
	    // Support enabling/disabling built-in help option.
	    if (typeof flags === 'boolean') {
	      if (flags) {
	        if (this._helpOption === null) this._helpOption = undefined; // reenable
	        if (this._defaultOptionGroup) {
	          // make the option to store the group
	          this._initOptionGroup(this._getHelpOption());
	        }
	      } else {
	        this._helpOption = null; // disable
	      }
	      return this;
	    }

	    // Customise flags and description.
	    this._helpOption = this.createOption(
	      flags ?? '-h, --help',
	      description ?? 'display help for command',
	    );
	    // init group unless lazy create
	    if (flags || description) this._initOptionGroup(this._helpOption);

	    return this;
	  }

	  /**
	   * Lazy create help option.
	   * Returns null if has been disabled with .helpOption(false).
	   *
	   * @returns {(Option | null)} the help option
	   * @package
	   */
	  _getHelpOption() {
	    // Lazy create help option on demand.
	    if (this._helpOption === undefined) {
	      this.helpOption(undefined, undefined);
	    }
	    return this._helpOption;
	  }

	  /**
	   * Supply your own option to use for the built-in help option.
	   * This is an alternative to using helpOption() to customise the flags and description etc.
	   *
	   * @param {Option} option
	   * @return {Command} `this` command for chaining
	   */
	  addHelpOption(option) {
	    this._helpOption = option;
	    this._initOptionGroup(option);
	    return this;
	  }

	  /**
	   * Output help information and exit.
	   *
	   * Outputs built-in help, and custom text added using `.addHelpText()`.
	   *
	   * @param {{ error: boolean }} [contextOptions] - pass {error:true} to write to stderr instead of stdout
	   */

	  help(contextOptions) {
	    this.outputHelp(contextOptions);
	    let exitCode = Number(process.exitCode ?? 0); // process.exitCode does allow a string or an integer, but we prefer just a number
	    if (
	      exitCode === 0 &&
	      contextOptions &&
	      typeof contextOptions !== 'function' &&
	      contextOptions.error
	    ) {
	      exitCode = 1;
	    }
	    // message: do not have all displayed text available so only passing placeholder.
	    this._exit(exitCode, 'commander.help', '(outputHelp)');
	  }

	  /**
	   * // Do a little typing to coordinate emit and listener for the help text events.
	   * @typedef HelpTextEventContext
	   * @type {object}
	   * @property {boolean} error
	   * @property {Command} command
	   * @property {function} write
	   */

	  /**
	   * Add additional text to be displayed with the built-in help.
	   *
	   * Position is 'before' or 'after' to affect just this command,
	   * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
	   *
	   * @param {string} position - before or after built-in help
	   * @param {(string | Function)} text - string to add, or a function returning a string
	   * @return {Command} `this` command for chaining
	   */

	  addHelpText(position, text) {
	    const allowedValues = ['beforeAll', 'before', 'after', 'afterAll'];
	    if (!allowedValues.includes(position)) {
	      throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
	    }

	    const helpEvent = `${position}Help`;
	    this.on(helpEvent, (/** @type {HelpTextEventContext} */ context) => {
	      let helpStr;
	      if (typeof text === 'function') {
	        helpStr = text({ error: context.error, command: context.command });
	      } else {
	        helpStr = text;
	      }
	      // Ignore falsy value when nothing to output.
	      if (helpStr) {
	        context.write(`${helpStr}\n`);
	      }
	    });
	    return this;
	  }

	  /**
	   * Output help information if help flags specified
	   *
	   * @param {Array} args - array of options to search for help flags
	   * @private
	   */

	  _outputHelpIfRequested(args) {
	    const helpOption = this._getHelpOption();
	    const helpRequested = helpOption && args.find((arg) => helpOption.is(arg));
	    if (helpRequested) {
	      this.outputHelp();
	      // (Do not have all displayed text available so only passing placeholder.)
	      this._exit(0, 'commander.helpDisplayed', '(outputHelp)');
	    }
	  }
	}

	/**
	 * Scan arguments and increment port number for inspect calls (to avoid conflicts when spawning new command).
	 *
	 * @param {string[]} args - array of arguments from node.execArgv
	 * @returns {string[]}
	 * @private
	 */

	function incrementNodeInspectorPort(args) {
	  // Testing for these options:
	  //  --inspect[=[host:]port]
	  //  --inspect-brk[=[host:]port]
	  //  --inspect-port=[host:]port
	  return args.map((arg) => {
	    if (!arg.startsWith('--inspect')) {
	      return arg;
	    }
	    let debugOption;
	    let debugHost = '127.0.0.1';
	    let debugPort = '9229';
	    let match;
	    if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
	      // e.g. --inspect
	      debugOption = match[1];
	    } else if (
	      (match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null
	    ) {
	      debugOption = match[1];
	      if (/^\d+$/.test(match[3])) {
	        // e.g. --inspect=1234
	        debugPort = match[3];
	      } else {
	        // e.g. --inspect=localhost
	        debugHost = match[3];
	      }
	    } else if (
	      (match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null
	    ) {
	      // e.g. --inspect=localhost:1234
	      debugOption = match[1];
	      debugHost = match[3];
	      debugPort = match[4];
	    }

	    if (debugOption && debugPort !== '0') {
	      return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
	    }
	    return arg;
	  });
	}

	/**
	 * @returns {boolean | undefined}
	 * @package
	 */
	function useColor() {
	  // Test for common conventions.
	  // NB: the observed behaviour is in combination with how author adds color! For example:
	  //   - we do not test NODE_DISABLE_COLORS, but util:styletext does
	  //   - we do test NO_COLOR, but Chalk does not
	  //
	  // References:
	  // https://no-color.org
	  // https://bixense.com/clicolors/
	  // https://github.com/nodejs/node/blob/0a00217a5f67ef4a22384cfc80eb6dd9a917fdc1/lib/internal/tty.js#L109
	  // https://github.com/chalk/supports-color/blob/c214314a14bcb174b12b3014b2b0a8de375029ae/index.js#L33
	  // (https://force-color.org recent web page from 2023, does not match major javascript implementations)

	  if (
	    process.env.NO_COLOR ||
	    process.env.FORCE_COLOR === '0' ||
	    process.env.FORCE_COLOR === 'false'
	  )
	    return false;
	  if (process.env.FORCE_COLOR || process.env.CLICOLOR_FORCE !== undefined)
	    return true;
	  return undefined;
	}

	command.Command = Command;
	command.useColor = useColor; // exporting for tests
	return command;
}

var hasRequiredCommander;

function requireCommander () {
	if (hasRequiredCommander) return commander$1;
	hasRequiredCommander = 1;
	const { Argument } = requireArgument();
	const { Command } = requireCommand();
	const { CommanderError, InvalidArgumentError } = requireError();
	const { Help } = requireHelp();
	const { Option } = requireOption();

	commander$1.program = new Command();

	commander$1.createCommand = (name) => new Command(name);
	commander$1.createOption = (flags, description) => new Option(flags, description);
	commander$1.createArgument = (name, description) => new Argument(name, description);

	/**
	 * Expose classes
	 */

	commander$1.Command = Command;
	commander$1.Option = Option;
	commander$1.Argument = Argument;
	commander$1.Help = Help;

	commander$1.CommanderError = CommanderError;
	commander$1.InvalidArgumentError = InvalidArgumentError;
	commander$1.InvalidOptionArgumentError = InvalidArgumentError; // Deprecated
	return commander$1;
}

var commanderExports = requireCommander();
var commander = /*@__PURE__*/getDefaultExportFromCjs(commanderExports);

// wrapper to provide named exports for ESM.
const {
  program,
  createCommand,
  createArgument,
  createOption,
  CommanderError,
  InvalidArgumentError,
  InvalidOptionArgumentError, // deprecated old name
  Command,
  Argument,
  Option,
  Help,
} = commander;

// eslint-disable-next-line no-warning-comments
// TODO: Use a better method when it's added to Node.js (https://github.com/nodejs/node/pull/40240)
// Lots of optionals here to support Deno.
const hasColors = tty?.WriteStream?.prototype?.hasColors?.() ?? false;

const format = (open, close) => {
	if (!hasColors) {
		return input => input;
	}

	const openCode = `\u001B[${open}m`;
	const closeCode = `\u001B[${close}m`;

	return input => {
		const string = input + ''; // eslint-disable-line no-implicit-coercion -- This is faster.
		let index = string.indexOf(closeCode);

		if (index === -1) {
			// Note: Intentionally not using string interpolation for performance reasons.
			return openCode + string + closeCode;
		}

		// Handle nested colors.

		// We could have done this, but it's too slow (as of Node.js 22).
		// return openCode + string.replaceAll(closeCode, openCode) + closeCode;

		let result = openCode;
		let lastIndex = 0;

		while (index !== -1) {
			result += string.slice(lastIndex, index) + openCode;
			lastIndex = index + closeCode.length;
			index = string.indexOf(closeCode, lastIndex);
		}

		result += string.slice(lastIndex) + closeCode;

		return result;
	};
};
const bold = format(1, 22);
const italic = format(3, 23);
const underline = format(4, 24);
const red = format(31, 39);
const green = format(32, 39);
const yellow = format(33, 39);
const cyan = format(36, 39);
const gray = format(90, 39);
const blueBright = format(94, 39);

function cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function pad(n) {
  return n < 10 ? "0" + n : n.toString();
}
function formatDate(date) {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
var severityValues = /* @__PURE__ */ ((severityValues2) => {
  severityValues2[severityValues2["debug"] = 1] = "debug";
  severityValues2[severityValues2["info"] = 2] = "info";
  severityValues2[severityValues2["warning"] = 3] = "warning";
  severityValues2[severityValues2["error"] = 4] = "error";
  severityValues2[severityValues2["special"] = 5] = "special";
  return severityValues2;
})(severityValues || {});
function severityToColor(severity, text) {
  switch (severity) {
    case "debug":
      return green(text);
    case "info":
      return blueBright(text);
    case "warning":
      return yellow(text);
    case "error":
      return red(text);
    case "special":
      return cyan(underline(text));
    default:
      console.log("Unknown severity " + severity);
      return italic(text);
  }
}
class Logger {
  logColors;
  logLevelInt;
  logSystem;
  logComponent;
  constructor(config, logSystem, logComponent) {
    this.logColors = typeof config?.logColors !== "undefined" ? config.logColors : true;
    this.logLevelInt = severityValues[config?.logLevel || "debug"];
    this.logSystem = logSystem;
    this.logComponent = logComponent;
  }
  log(severity, system, component, text, subcat) {
    if (severityValues[severity] < this.logLevelInt) {
      return;
    }
    let entryDesc = formatDate(/* @__PURE__ */ new Date()) + " [" + system + "]	";
    let logString = "";
    if (this.logColors) {
      entryDesc = severityToColor(severity, entryDesc);
      logString = entryDesc;
      if (component) {
        logString += italic("[" + component + "] ");
      }
      if (subcat) {
        logString += gray(bold("(" + subcat + ") "));
      }
      if (!component) {
        logString += text;
      } else {
        logString += gray(text);
      }
    } else {
      logString = entryDesc;
      if (component) {
        logString += "[" + component + "] ";
      }
      if (subcat) {
        logString += "(" + subcat + ") ";
      }
      logString += text;
    }
    console.log(logString);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleLog(logLevel, ...args) {
    const logSystem = this.logSystem;
    const logComponent = this.logComponent;
    if (!logSystem && args.length === 1) {
      return this.log(logLevel, cap(logLevel), logComponent, args[0]);
    }
    if (!logSystem && args.length === 2) {
      return this.log(logLevel, args[0], logComponent, args[1]);
    }
    if (logSystem && args.length === 1) {
      return this.log(logLevel, logSystem, logComponent, args[0]);
    }
    if (logSystem && args.length === 2) {
      return this.log(logLevel, logSystem, args[0], args[1]);
    }
    if (args.length === 3) {
      return this.log(logLevel, args[0], args[1], args[2]);
    }
    return this.log(logLevel, args[0], args[1], args[2], args[3]);
  }
  debug(...args) {
    this.handleLog("debug", ...args);
  }
  info(...args) {
    this.handleLog("info", ...args);
  }
  warning(...args) {
    this.handleLog("warning", ...args);
  }
  error(...args) {
    this.handleLog("error", ...args);
  }
  special(...args) {
    this.handleLog("special", ...args);
  }
}

const pkgJson = {
  "name": "proxyd",
  "description": "Reverse proxy to socks5 or http proxy",
  "version": "1.0.5"};

var dist$2 = {};

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */

var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
      function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
  return extendStatics(d, b);
};

function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() { this.constructor = d; }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
  __assign = Object.assign || function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
  };
  return __assign.apply(this, arguments);
};

function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
              t[p[i]] = s[p[i]];
      }
  return t;
}

function __decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
  return function (target, key) { decorator(target, key, paramIndex); }
}

function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
      var context = {};
      for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
      for (var p in contextIn.access) context.access[p] = contextIn.access[p];
      context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
      var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
      if (kind === "accessor") {
          if (result === void 0) continue;
          if (result === null || typeof result !== "object") throw new TypeError("Object expected");
          if (_ = accept(result.get)) descriptor.get = _;
          if (_ = accept(result.set)) descriptor.set = _;
          if (_ = accept(result.init)) initializers.unshift(_);
      }
      else if (_ = accept(result)) {
          if (kind === "field") initializers.unshift(_);
          else descriptor[key] = _;
      }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
}
function __runInitializers(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
      value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
}
function __propKey(x) {
  return typeof x === "symbol" ? x : "".concat(x);
}
function __setFunctionName(f, name, prefix) {
  if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
  return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
}
function __metadata(metadataKey, metadataValue) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
      function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
      function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

function __generator(thisArg, body) {
  var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
  return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
  function verb(n) { return function (v) { return step([n, v]); }; }
  function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (g && (g = 0, op[0] && (_ = 0)), _) try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];
          switch (op[0]) {
              case 0: case 1: t = op; break;
              case 4: _.label++; return { value: op[1], done: false };
              case 5: _.label++; y = op[1]; op = [0]; continue;
              case 7: op = _.ops.pop(); _.trys.pop(); continue;
              default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                  if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                  if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                  if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                  if (t[2]) _.ops.pop();
                  _.trys.pop(); continue;
          }
          op = body.call(thisArg, _);
      } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
      if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
}

var __createBinding = Object.create ? (function(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
  }
  Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

function __exportStar(m, o) {
  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}

function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
      next: function () {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
      }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  }
  catch (error) { e = { error: error }; }
  finally {
      try {
          if (r && !r.done && (m = i["return"])) m.call(i);
      }
      finally { if (e) throw e.error; }
  }
  return ar;
}

/** @deprecated */
function __spread() {
  for (var ar = [], i = 0; i < arguments.length; i++)
      ar = ar.concat(__read(arguments[i]));
  return ar;
}

/** @deprecated */
function __spreadArrays() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
  for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
          r[k] = a[j];
  return r;
}

function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
      }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}

function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
  function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
  function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
  function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
  function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
  function fulfill(value) { resume("next", value); }
  function reject(value) { resume("throw", value); }
  function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
  var i, p;
  return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
  function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
  function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
  function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
  if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
  return cooked;
}
var __setModuleDefault = Object.create ? (function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
  o["default"] = v;
};

var ownKeys = function(o) {
  ownKeys = Object.getOwnPropertyNames || function (o) {
    var ar = [];
    for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
    return ar;
  };
  return ownKeys(o);
};

function __importStar(mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
  __setModuleDefault(result, mod);
  return result;
}

function __importDefault(mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}

function __classPrivateFieldIn(state, receiver) {
  if (receiver === null || (typeof receiver !== "object" && typeof receiver !== "function")) throw new TypeError("Cannot use 'in' operator on non-object");
  return typeof state === "function" ? receiver === state : state.has(receiver);
}

function __addDisposableResource(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose, inner;
    if (async) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      dispose = value[Symbol.dispose];
      if (async) inner = dispose;
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
    env.stack.push({ value: value, dispose: dispose, async: async });
  }
  else if (async) {
    env.stack.push({ async: true });
  }
  return value;
}

var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

function __disposeResources(env) {
  function fail(e) {
    env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
    env.hasError = true;
  }
  var r, s = 0;
  function next() {
    while (r = env.stack.pop()) {
      try {
        if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
        if (r.dispose) {
          var result = r.dispose.call(r.value);
          if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
        }
        else s |= 1;
      }
      catch (e) {
        fail(e);
      }
    }
    if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
    if (env.hasError) throw env.error;
  }
  return next();
}

function __rewriteRelativeImportExtension(path, preserveJsx) {
  if (typeof path === "string" && /^\.\.?\//.test(path)) {
      return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function (m, tsx, d, ext, cm) {
          return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : (d + ext + "." + cm.toLowerCase() + "js");
      });
  }
  return path;
}

var tslib_es6 = {
  __extends,
  __assign,
  __rest,
  __decorate,
  __param,
  __esDecorate,
  __runInitializers,
  __propKey,
  __setFunctionName,
  __metadata,
  __awaiter,
  __generator,
  __createBinding,
  __exportStar,
  __values,
  __read,
  __spread,
  __spreadArrays,
  __spreadArray,
  __await,
  __asyncGenerator,
  __asyncDelegator,
  __asyncValues,
  __makeTemplateObject,
  __importStar,
  __importDefault,
  __classPrivateFieldGet,
  __classPrivateFieldSet,
  __classPrivateFieldIn,
  __addDisposableResource,
  __disposeResources,
  __rewriteRelativeImportExtension,
};

var tslib_es6$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	__addDisposableResource: __addDisposableResource,
	get __assign () { return __assign; },
	__asyncDelegator: __asyncDelegator,
	__asyncGenerator: __asyncGenerator,
	__asyncValues: __asyncValues,
	__await: __await,
	__awaiter: __awaiter,
	__classPrivateFieldGet: __classPrivateFieldGet,
	__classPrivateFieldIn: __classPrivateFieldIn,
	__classPrivateFieldSet: __classPrivateFieldSet,
	__createBinding: __createBinding,
	__decorate: __decorate,
	__disposeResources: __disposeResources,
	__esDecorate: __esDecorate,
	__exportStar: __exportStar,
	__extends: __extends,
	__generator: __generator,
	__importDefault: __importDefault,
	__importStar: __importStar,
	__makeTemplateObject: __makeTemplateObject,
	__metadata: __metadata,
	__param: __param,
	__propKey: __propKey,
	__read: __read,
	__rest: __rest,
	__rewriteRelativeImportExtension: __rewriteRelativeImportExtension,
	__runInitializers: __runInitializers,
	__setFunctionName: __setFunctionName,
	__spread: __spread,
	__spreadArray: __spreadArray,
	__spreadArrays: __spreadArrays,
	__values: __values,
	default: tslib_es6
});

var require$$0 = /*@__PURE__*/getAugmentedNamespace(tslib_es6$1);

var request_error = {};

var hasRequiredRequest_error;

function requireRequest_error () {
	if (hasRequiredRequest_error) return request_error;
	hasRequiredRequest_error = 1;
	Object.defineProperty(request_error, "__esModule", { value: true });
	request_error.RequestError = void 0;
	/**
	 * Represents custom request error. The message is emitted as HTTP response
	 * with a specific HTTP code and headers.
	 * If this error is thrown from the `prepareRequestFunction` function,
	 * the message and status code is sent to client.
	 * By default, the response will have Content-Type: text/plain
	 * and for the 407 status the Proxy-Authenticate header will be added.
	 */
	class RequestError extends Error {
	    constructor(message, statusCode, headers) {
	        super(message);
	        Object.defineProperty(this, "statusCode", {
	            enumerable: true,
	            configurable: true,
	            writable: true,
	            value: statusCode
	        });
	        Object.defineProperty(this, "headers", {
	            enumerable: true,
	            configurable: true,
	            writable: true,
	            value: headers
	        });
	        this.name = RequestError.name;
	        Error.captureStackTrace(this, RequestError);
	    }
	}
	request_error.RequestError = RequestError;
	
	return request_error;
}

var server = {};

var chain = {};

var statuses = {};

var hasRequiredStatuses;

function requireStatuses () {
	if (hasRequiredStatuses) return statuses;
	hasRequiredStatuses = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.socksErrorMessageToStatusCode = exports.errorCodeToStatusCode = exports.createCustomStatusHttpResponse = exports.badGatewayStatusCodes = void 0;
		const node_http_1 = require$$1$1;
		exports.badGatewayStatusCodes = {
		    /**
		     * Upstream has timed out.
		     */
		    TIMEOUT: 504,
		    /**
		     * Upstream responded with non-200 status code.
		     */
		    NON_200: 590,
		    /**
		     * Upstream respondend with status code different than 100-999.
		     */
		    STATUS_CODE_OUT_OF_RANGE: 592,
		    /**
		     * DNS lookup failed - EAI_NODATA or EAI_NONAME.
		     */
		    NOT_FOUND: 593,
		    /**
		     * Upstream refused connection.
		     */
		    CONNECTION_REFUSED: 594,
		    /**
		     * Connection reset due to loss of connection or timeout.
		     */
		    CONNECTION_RESET: 595,
		    /**
		     * Trying to write on a closed socket.
		     */
		    BROKEN_PIPE: 596,
		    /**
		     * Incorrect upstream credentials.
		     */
		    AUTH_FAILED: 597,
		    /**
		     * Generic upstream error.
		     */
		    GENERIC_ERROR: 599,
		};
		node_http_1.STATUS_CODES['590'] = 'Non Successful';
		node_http_1.STATUS_CODES['592'] = 'Status Code Out Of Range';
		node_http_1.STATUS_CODES['593'] = 'Not Found';
		node_http_1.STATUS_CODES['594'] = 'Connection Refused';
		node_http_1.STATUS_CODES['595'] = 'Connection Reset';
		node_http_1.STATUS_CODES['596'] = 'Broken Pipe';
		node_http_1.STATUS_CODES['597'] = 'Auth Failed';
		node_http_1.STATUS_CODES['599'] = 'Upstream Error';
		const createCustomStatusHttpResponse = (statusCode, statusMessage, message = '') => {
		    return [
		        `HTTP/1.1 ${statusCode} ${statusMessage || node_http_1.STATUS_CODES[statusCode] || 'Unknown Status Code'}`,
		        'Connection: close',
		        `Date: ${(new Date()).toUTCString()}`,
		        `Content-Length: ${Buffer.byteLength(message)}`,
		        ``,
		        message,
		    ].join('\r\n');
		};
		exports.createCustomStatusHttpResponse = createCustomStatusHttpResponse;
		// https://nodejs.org/api/errors.html#common-system-errors
		exports.errorCodeToStatusCode = {
		    ENOTFOUND: exports.badGatewayStatusCodes.NOT_FOUND,
		    ECONNREFUSED: exports.badGatewayStatusCodes.CONNECTION_REFUSED,
		    ECONNRESET: exports.badGatewayStatusCodes.CONNECTION_RESET,
		    EPIPE: exports.badGatewayStatusCodes.BROKEN_PIPE,
		    ETIMEDOUT: exports.badGatewayStatusCodes.TIMEOUT,
		};
		const socksErrorMessageToStatusCode = (socksErrorMessage) => {
		    switch (socksErrorMessage) {
		        case 'Proxy connection timed out':
		            return exports.badGatewayStatusCodes.TIMEOUT;
		        case 'Socks5 Authentication failed':
		            return exports.badGatewayStatusCodes.AUTH_FAILED;
		        default:
		            return exports.badGatewayStatusCodes.GENERIC_ERROR;
		    }
		};
		exports.socksErrorMessageToStatusCode = socksErrorMessageToStatusCode;
		
	} (statuses));
	return statuses;
}

var count_target_bytes = {};

var hasRequiredCount_target_bytes;

function requireCount_target_bytes () {
	if (hasRequiredCount_target_bytes) return count_target_bytes;
	hasRequiredCount_target_bytes = 1;
	Object.defineProperty(count_target_bytes, "__esModule", { value: true });
	count_target_bytes.getTargetStats = count_target_bytes.countTargetBytes = void 0;
	const targetBytesWritten = Symbol('targetBytesWritten');
	const targetBytesRead = Symbol('targetBytesRead');
	const targets = Symbol('targets');
	const calculateTargetStats = Symbol('calculateTargetStats');
	const countTargetBytes = (source, target, registerCloseHandler) => {
	    source[targetBytesWritten] = source[targetBytesWritten] || 0;
	    source[targetBytesRead] = source[targetBytesRead] || 0;
	    source[targets] = source[targets] || new Set();
	    source[targets].add(target);
	    const closeHandler = () => {
	        source[targetBytesWritten] += (target.bytesWritten - (target.previousBytesWritten || 0));
	        source[targetBytesRead] += (target.bytesRead - (target.previousBytesRead || 0));
	        source[targets].delete(target);
	    };
	    if (!registerCloseHandler) {
	        registerCloseHandler = (handler) => target.once('close', handler);
	    }
	    registerCloseHandler(closeHandler);
	    if (!source[calculateTargetStats]) {
	        source[calculateTargetStats] = () => {
	            let bytesWritten = source[targetBytesWritten];
	            let bytesRead = source[targetBytesRead];
	            for (const socket of source[targets]) {
	                bytesWritten += (socket.bytesWritten - (socket.previousBytesWritten || 0));
	                bytesRead += (socket.bytesRead - (socket.previousBytesRead || 0));
	            }
	            return {
	                bytesWritten,
	                bytesRead,
	            };
	        };
	    }
	};
	count_target_bytes.countTargetBytes = countTargetBytes;
	const getTargetStats = (socket) => {
	    if (socket[calculateTargetStats]) {
	        return socket[calculateTargetStats]();
	    }
	    return {
	        bytesWritten: null,
	        bytesRead: null,
	    };
	};
	count_target_bytes.getTargetStats = getTargetStats;
	
	return count_target_bytes;
}

var get_basic = {};

var decode_uri_component_safe = {};

var hasRequiredDecode_uri_component_safe;

function requireDecode_uri_component_safe () {
	if (hasRequiredDecode_uri_component_safe) return decode_uri_component_safe;
	hasRequiredDecode_uri_component_safe = 1;
	Object.defineProperty(decode_uri_component_safe, "__esModule", { value: true });
	decode_uri_component_safe.decodeURIComponentSafe = void 0;
	const decodeURIComponentSafe = (encodedURIComponent) => {
	    try {
	        return decodeURIComponent(encodedURIComponent);
	    }
	    catch {
	        return encodedURIComponent;
	    }
	};
	decode_uri_component_safe.decodeURIComponentSafe = decodeURIComponentSafe;
	
	return decode_uri_component_safe;
}

var hasRequiredGet_basic;

function requireGet_basic () {
	if (hasRequiredGet_basic) return get_basic;
	hasRequiredGet_basic = 1;
	Object.defineProperty(get_basic, "__esModule", { value: true });
	get_basic.getBasicAuthorizationHeader = void 0;
	const decode_uri_component_safe_1 = requireDecode_uri_component_safe();
	const getBasicAuthorizationHeader = (url) => {
	    const username = (0, decode_uri_component_safe_1.decodeURIComponentSafe)(url.username);
	    const password = (0, decode_uri_component_safe_1.decodeURIComponentSafe)(url.password);
	    const auth = `${username}:${password}`;
	    if (username.includes(':')) {
	        throw new Error('Username contains an invalid colon');
	    }
	    return `Basic ${Buffer.from(auth).toString('base64')}`;
	};
	get_basic.getBasicAuthorizationHeader = getBasicAuthorizationHeader;
	
	return get_basic;
}

var hasRequiredChain;

function requireChain () {
	if (hasRequiredChain) return chain;
	hasRequiredChain = 1;
	Object.defineProperty(chain, "__esModule", { value: true });
	chain.chain = void 0;
	const tslib_1 = require$$0;
	const node_http_1 = tslib_1.__importDefault(require$$1$1);
	const node_https_1 = tslib_1.__importDefault(require$$2$1);
	const statuses_1 = requireStatuses();
	const count_target_bytes_1 = requireCount_target_bytes();
	const get_basic_1 = requireGet_basic();
	/**
	 * Passes the traffic to upstream HTTP proxy server.
	 * Client -> Apify -> Upstream -> Web
	 * Client <- Apify <- Upstream <- Web
	 */
	const chain$1 = ({ request, sourceSocket, head, handlerOpts, server, isPlain, }) => {
	    if (head && head.length > 0) {
	        // HTTP/1.1 has no defined semantics when sending payload along with CONNECT and servers can reject the request.
	        // HTTP/2 only says that subsequent DATA frames must be transferred after HEADERS has been sent.
	        // HTTP/3 says that all DATA frames should be transferred (implies pre-HEADERS data).
	        //
	        // Let's go with the HTTP/3 behavior.
	        // There are also clients that send payload along with CONNECT to save milliseconds apparently.
	        // Beware of upstream proxy servers that send out valid CONNECT responses with diagnostic data such as IPs!
	        sourceSocket.unshift(head);
	    }
	    const { proxyChainId } = sourceSocket;
	    const { upstreamProxyUrlParsed: proxy, customTag } = handlerOpts;
	    const options = {
	        method: 'CONNECT',
	        path: request.url,
	        headers: {
	            host: request.url,
	        },
	        localAddress: handlerOpts.localAddress,
	        family: handlerOpts.ipFamily,
	        lookup: handlerOpts.dnsLookup,
	    };
	    if (proxy.username || proxy.password) {
	        options.headers['proxy-authorization'] = (0, get_basic_1.getBasicAuthorizationHeader)(proxy);
	    }
	    const client = proxy.protocol === 'https:'
	        ? node_https_1.default.request(proxy.origin, {
	            ...options,
	            rejectUnauthorized: !handlerOpts.ignoreUpstreamProxyCertificate,
	        })
	        : node_http_1.default.request(proxy.origin, options);
	    client.once('socket', (targetSocket) => {
	        // Socket can be re-used by multiple requests.
	        // That's why we need to track the previous stats.
	        targetSocket.previousBytesRead = targetSocket.bytesRead;
	        targetSocket.previousBytesWritten = targetSocket.bytesWritten;
	        (0, count_target_bytes_1.countTargetBytes)(sourceSocket, targetSocket);
	    });
	    client.on('connect', (response, targetSocket, clientHead) => {
	        if (sourceSocket.readyState !== 'open') {
	            // Sanity check, should never reach.
	            targetSocket.destroy();
	            return;
	        }
	        targetSocket.on('error', (error) => {
	            server.log(proxyChainId, `Chain Destination Socket Error: ${error.stack}`);
	            sourceSocket.destroy();
	        });
	        sourceSocket.on('error', (error) => {
	            server.log(proxyChainId, `Chain Source Socket Error: ${error.stack}`);
	            targetSocket.destroy();
	        });
	        if (response.statusCode !== 200) {
	            server.log(proxyChainId, `Failed to authenticate upstream proxy: ${response.statusCode}`);
	            if (isPlain) {
	                sourceSocket.end();
	            }
	            else {
	                const { statusCode } = response;
	                const status = statusCode === 401 || statusCode === 407
	                    ? statuses_1.badGatewayStatusCodes.AUTH_FAILED
	                    : statuses_1.badGatewayStatusCodes.NON_200;
	                sourceSocket.end((0, statuses_1.createCustomStatusHttpResponse)(status, `UPSTREAM${statusCode}`));
	            }
	            targetSocket.end();
	            server.emit('tunnelConnectFailed', {
	                proxyChainId,
	                response,
	                customTag,
	                socket: targetSocket,
	                head: clientHead,
	            });
	            return;
	        }
	        if (clientHead.length > 0) {
	            // See comment above
	            targetSocket.unshift(clientHead);
	        }
	        server.emit('tunnelConnectResponded', {
	            proxyChainId,
	            response,
	            customTag,
	            socket: targetSocket,
	            head: clientHead,
	        });
	        sourceSocket.write(isPlain ? '' : `HTTP/1.1 200 Connection Established\r\n\r\n`);
	        sourceSocket.pipe(targetSocket);
	        targetSocket.pipe(sourceSocket);
	        // Once target socket closes forcibly, the source socket gets paused.
	        // We need to enable flowing, otherwise the socket would remain open indefinitely.
	        // Nothing would consume the data, we just want to close the socket.
	        targetSocket.on('close', () => {
	            sourceSocket.resume();
	            if (sourceSocket.writable) {
	                sourceSocket.end();
	            }
	        });
	        // Same here.
	        sourceSocket.on('close', () => {
	            targetSocket.resume();
	            if (targetSocket.writable) {
	                targetSocket.end();
	            }
	        });
	    });
	    client.on('error', (error) => {
	        var _a, _b;
	        server.log(proxyChainId, `Failed to connect to upstream proxy: ${error.stack}`);
	        // The end socket may get connected after the client to proxy one gets disconnected.
	        if (sourceSocket.readyState === 'open') {
	            if (isPlain) {
	                sourceSocket.end();
	            }
	            else {
	                const statusCode = (_a = statuses_1.errorCodeToStatusCode[error.code]) !== null && _a !== void 0 ? _a : statuses_1.badGatewayStatusCodes.GENERIC_ERROR;
	                const response = (0, statuses_1.createCustomStatusHttpResponse)(statusCode, (_b = error.code) !== null && _b !== void 0 ? _b : 'Upstream Closed Early');
	                sourceSocket.end(response);
	            }
	        }
	    });
	    sourceSocket.on('error', () => {
	        client.destroy();
	    });
	    // In case the client ends the socket too early
	    sourceSocket.on('close', () => {
	        client.destroy();
	    });
	    client.end();
	};
	chain.chain = chain$1;
	
	return chain;
}

var chain_socks = {};

var build = {};

var socksclient = {};

var smartbuffer = {};

var utils = {};

var hasRequiredUtils;

function requireUtils () {
	if (hasRequiredUtils) return utils;
	hasRequiredUtils = 1;
	Object.defineProperty(utils, "__esModule", { value: true });
	const buffer_1 = require$$0$2;
	/**
	 * Error strings
	 */
	const ERRORS = {
	    INVALID_ENCODING: 'Invalid encoding provided. Please specify a valid encoding the internal Node.js Buffer supports.',
	    INVALID_SMARTBUFFER_SIZE: 'Invalid size provided. Size must be a valid integer greater than zero.',
	    INVALID_SMARTBUFFER_BUFFER: 'Invalid Buffer provided in SmartBufferOptions.',
	    INVALID_SMARTBUFFER_OBJECT: 'Invalid SmartBufferOptions object supplied to SmartBuffer constructor or factory methods.',
	    INVALID_OFFSET: 'An invalid offset value was provided.',
	    INVALID_OFFSET_NON_NUMBER: 'An invalid offset value was provided. A numeric value is required.',
	    INVALID_LENGTH: 'An invalid length value was provided.',
	    INVALID_LENGTH_NON_NUMBER: 'An invalid length value was provived. A numeric value is required.',
	    INVALID_TARGET_OFFSET: 'Target offset is beyond the bounds of the internal SmartBuffer data.',
	    INVALID_TARGET_LENGTH: 'Specified length value moves cursor beyong the bounds of the internal SmartBuffer data.',
	    INVALID_READ_BEYOND_BOUNDS: 'Attempted to read beyond the bounds of the managed data.',
	    INVALID_WRITE_BEYOND_BOUNDS: 'Attempted to write beyond the bounds of the managed data.'
	};
	utils.ERRORS = ERRORS;
	/**
	 * Checks if a given encoding is a valid Buffer encoding. (Throws an exception if check fails)
	 *
	 * @param { String } encoding The encoding string to check.
	 */
	function checkEncoding(encoding) {
	    if (!buffer_1.Buffer.isEncoding(encoding)) {
	        throw new Error(ERRORS.INVALID_ENCODING);
	    }
	}
	utils.checkEncoding = checkEncoding;
	/**
	 * Checks if a given number is a finite integer. (Throws an exception if check fails)
	 *
	 * @param { Number } value The number value to check.
	 */
	function isFiniteInteger(value) {
	    return typeof value === 'number' && isFinite(value) && isInteger(value);
	}
	utils.isFiniteInteger = isFiniteInteger;
	/**
	 * Checks if an offset/length value is valid. (Throws an exception if check fails)
	 *
	 * @param value The value to check.
	 * @param offset True if checking an offset, false if checking a length.
	 */
	function checkOffsetOrLengthValue(value, offset) {
	    if (typeof value === 'number') {
	        // Check for non finite/non integers
	        if (!isFiniteInteger(value) || value < 0) {
	            throw new Error(offset ? ERRORS.INVALID_OFFSET : ERRORS.INVALID_LENGTH);
	        }
	    }
	    else {
	        throw new Error(offset ? ERRORS.INVALID_OFFSET_NON_NUMBER : ERRORS.INVALID_LENGTH_NON_NUMBER);
	    }
	}
	/**
	 * Checks if a length value is valid. (Throws an exception if check fails)
	 *
	 * @param { Number } length The value to check.
	 */
	function checkLengthValue(length) {
	    checkOffsetOrLengthValue(length, false);
	}
	utils.checkLengthValue = checkLengthValue;
	/**
	 * Checks if a offset value is valid. (Throws an exception if check fails)
	 *
	 * @param { Number } offset The value to check.
	 */
	function checkOffsetValue(offset) {
	    checkOffsetOrLengthValue(offset, true);
	}
	utils.checkOffsetValue = checkOffsetValue;
	/**
	 * Checks if a target offset value is out of bounds. (Throws an exception if check fails)
	 *
	 * @param { Number } offset The offset value to check.
	 * @param { SmartBuffer } buff The SmartBuffer instance to check against.
	 */
	function checkTargetOffset(offset, buff) {
	    if (offset < 0 || offset > buff.length) {
	        throw new Error(ERRORS.INVALID_TARGET_OFFSET);
	    }
	}
	utils.checkTargetOffset = checkTargetOffset;
	/**
	 * Determines whether a given number is a integer.
	 * @param value The number to check.
	 */
	function isInteger(value) {
	    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
	}
	/**
	 * Throws if Node.js version is too low to support bigint
	 */
	function bigIntAndBufferInt64Check(bufferMethod) {
	    if (typeof BigInt === 'undefined') {
	        throw new Error('Platform does not support JS BigInt type.');
	    }
	    if (typeof buffer_1.Buffer.prototype[bufferMethod] === 'undefined') {
	        throw new Error(`Platform does not support Buffer.prototype.${bufferMethod}.`);
	    }
	}
	utils.bigIntAndBufferInt64Check = bigIntAndBufferInt64Check;
	
	return utils;
}

var hasRequiredSmartbuffer;

function requireSmartbuffer () {
	if (hasRequiredSmartbuffer) return smartbuffer;
	hasRequiredSmartbuffer = 1;
	Object.defineProperty(smartbuffer, "__esModule", { value: true });
	const utils_1 = requireUtils();
	// The default Buffer size if one is not provided.
	const DEFAULT_SMARTBUFFER_SIZE = 4096;
	// The default string encoding to use for reading/writing strings.
	const DEFAULT_SMARTBUFFER_ENCODING = 'utf8';
	class SmartBuffer {
	    /**
	     * Creates a new SmartBuffer instance.
	     *
	     * @param options { SmartBufferOptions } The SmartBufferOptions to apply to this instance.
	     */
	    constructor(options) {
	        this.length = 0;
	        this._encoding = DEFAULT_SMARTBUFFER_ENCODING;
	        this._writeOffset = 0;
	        this._readOffset = 0;
	        if (SmartBuffer.isSmartBufferOptions(options)) {
	            // Checks for encoding
	            if (options.encoding) {
	                utils_1.checkEncoding(options.encoding);
	                this._encoding = options.encoding;
	            }
	            // Checks for initial size length
	            if (options.size) {
	                if (utils_1.isFiniteInteger(options.size) && options.size > 0) {
	                    this._buff = Buffer.allocUnsafe(options.size);
	                }
	                else {
	                    throw new Error(utils_1.ERRORS.INVALID_SMARTBUFFER_SIZE);
	                }
	                // Check for initial Buffer
	            }
	            else if (options.buff) {
	                if (Buffer.isBuffer(options.buff)) {
	                    this._buff = options.buff;
	                    this.length = options.buff.length;
	                }
	                else {
	                    throw new Error(utils_1.ERRORS.INVALID_SMARTBUFFER_BUFFER);
	                }
	            }
	            else {
	                this._buff = Buffer.allocUnsafe(DEFAULT_SMARTBUFFER_SIZE);
	            }
	        }
	        else {
	            // If something was passed but it's not a SmartBufferOptions object
	            if (typeof options !== 'undefined') {
	                throw new Error(utils_1.ERRORS.INVALID_SMARTBUFFER_OBJECT);
	            }
	            // Otherwise default to sane options
	            this._buff = Buffer.allocUnsafe(DEFAULT_SMARTBUFFER_SIZE);
	        }
	    }
	    /**
	     * Creates a new SmartBuffer instance with the provided internal Buffer size and optional encoding.
	     *
	     * @param size { Number } The size of the internal Buffer.
	     * @param encoding { String } The BufferEncoding to use for strings.
	     *
	     * @return { SmartBuffer }
	     */
	    static fromSize(size, encoding) {
	        return new this({
	            size: size,
	            encoding: encoding
	        });
	    }
	    /**
	     * Creates a new SmartBuffer instance with the provided Buffer and optional encoding.
	     *
	     * @param buffer { Buffer } The Buffer to use as the internal Buffer value.
	     * @param encoding { String } The BufferEncoding to use for strings.
	     *
	     * @return { SmartBuffer }
	     */
	    static fromBuffer(buff, encoding) {
	        return new this({
	            buff: buff,
	            encoding: encoding
	        });
	    }
	    /**
	     * Creates a new SmartBuffer instance with the provided SmartBufferOptions options.
	     *
	     * @param options { SmartBufferOptions } The options to use when creating the SmartBuffer instance.
	     */
	    static fromOptions(options) {
	        return new this(options);
	    }
	    /**
	     * Type checking function that determines if an object is a SmartBufferOptions object.
	     */
	    static isSmartBufferOptions(options) {
	        const castOptions = options;
	        return (castOptions &&
	            (castOptions.encoding !== undefined || castOptions.size !== undefined || castOptions.buff !== undefined));
	    }
	    // Signed integers
	    /**
	     * Reads an Int8 value from the current read position or an optionally provided offset.
	     *
	     * @param offset { Number } The offset to read data from (optional)
	     * @return { Number }
	     */
	    readInt8(offset) {
	        return this._readNumberValue(Buffer.prototype.readInt8, 1, offset);
	    }
	    /**
	     * Reads an Int16BE value from the current read position or an optionally provided offset.
	     *
	     * @param offset { Number } The offset to read data from (optional)
	     * @return { Number }
	     */
	    readInt16BE(offset) {
	        return this._readNumberValue(Buffer.prototype.readInt16BE, 2, offset);
	    }
	    /**
	     * Reads an Int16LE value from the current read position or an optionally provided offset.
	     *
	     * @param offset { Number } The offset to read data from (optional)
	     * @return { Number }
	     */
	    readInt16LE(offset) {
	        return this._readNumberValue(Buffer.prototype.readInt16LE, 2, offset);
	    }
	    /**
	     * Reads an Int32BE value from the current read position or an optionally provided offset.
	     *
	     * @param offset { Number } The offset to read data from (optional)
	     * @return { Number }
	     */
	    readInt32BE(offset) {
	        return this._readNumberValue(Buffer.prototype.readInt32BE, 4, offset);
	    }
	    /**
	     * Reads an Int32LE value from the current read position or an optionally provided offset.
	     *
	     * @param offset { Number } The offset to read data from (optional)
	     * @return { Number }
	     */
	    readInt32LE(offset) {
	        return this._readNumberValue(Buffer.prototype.readInt32LE, 4, offset);
	    }
	    /**
	     * Reads a BigInt64BE value from the current read position or an optionally provided offset.
	     *
	     * @param offset { Number } The offset to read data from (optional)
	     * @return { BigInt }
	     */
	    readBigInt64BE(offset) {
	        utils_1.bigIntAndBufferInt64Check('readBigInt64BE');
	        return this._readNumberValue(Buffer.prototype.readBigInt64BE, 8, offset);
	    }
	    /**
	     * Reads a BigInt64LE value from the current read position or an optionally provided offset.
	     *
	     * @param offset { Number } The offset to read data from (optional)
	     * @return { BigInt }
	     */
	    readBigInt64LE(offset) {
	        utils_1.bigIntAndBufferInt64Check('readBigInt64LE');
	        return this._readNumberValue(Buffer.prototype.readBigInt64LE, 8, offset);
	    }
	    /**
	     * Writes an Int8 value to the current write position (or at optional offset).
	     *
	     * @param value { Number } The value to write.
	     * @param offset { Number } The offset to write the value at.
	     *
	     * @return this
	     */
	    writeInt8(value, offset) {
	        this._writeNumberValue(Buffer.prototype.writeInt8, 1, value, offset);
	        return this;
	    }
	    /**
	     * Inserts an Int8 value at the given offset value.
	     *
	     * @param value { Number } The value to insert.
	     * @param offset { Number } The offset to insert the value at.
	     *
	     * @return this
	     */
	    insertInt8(value, offset) {
	        return this._insertNumberValue(Buffer.prototype.writeInt8, 1, value, offset);
	    }
	    /**
	     * Writes an Int16BE value to the current write position (or at optional offset).
	     *
	     * @param value { Number } The value to write.
	     * @param offset { Number } The offset to write the value at.
	     *
	     * @return this
	     */
	    writeInt16BE(value, offset) {
	        return this._writeNumberValue(Buffer.prototype.writeInt16BE, 2, value, offset);
	    }
	    /**
	     * Inserts an Int16BE value at the given offset value.
	     *
	     * @param value { Number } The value to insert.
	     * @param offset { Number } The offset to insert the value at.
	     *
	     * @return this
	     */
	    insertInt16BE(value, offset) {
	        return this._insertNumberValue(Buffer.prototype.writeInt16BE, 2, value, offset);
	    }
	    /**
	     * Writes an Int16LE value to the current write position (or at optional offset).
	     *
	     * @param value { Number } The value to write.
	     * @param offset { Number } The offset to write the value at.
	     *
	     * @return this
	     */
	    writeInt16LE(value, offset) {
	        return this._writeNumberValue(Buffer.prototype.writeInt16LE, 2, value, offset);
	    }
	    /**
	     * Inserts an Int16LE value at the given offset value.
	     *
	     * @param value { Number } The value to insert.
	     * @param offset { Number } The offset to insert the value at.
	     *
	     * @return this
	     */
	    insertInt16LE(value, offset) {
	        return this._insertNumberValue(Buffer.prototype.writeInt16LE, 2, value, offset);
	    }
	    /**
	     * Writes an Int32BE value to the current write position (or at optional offset).
	     *
	     * @param value { Number } The value to write.
	     * @param offset { Number } The offset to write the value at.
	     *
	     * @return this
	     */
	    writeInt32BE(value, offset) {
	        return this._writeNumberValue(Buffer.prototype.writeInt32BE, 4, value, offset);
	    }
	    /**
	     * Inserts an Int32BE value at the given offset value.
	     *
	     * @param value { Number } The value to insert.
	     * @param offset { Number } The offset to insert the value at.
	     *
	     * @return this
	     */
	    insertInt32BE(value, offset) {
	        return this._insertNumberValue(Buffer.prototype.writeInt32BE, 4, value, offset);
	    }
	    /**
	     * Writes an Int32LE value to the current write position (or at optional offset).
	     *
	     * @param value { Number } The value to write.
	     * @param offset { Number } The offset to write the value at.
	     *
	     * @return this
	     */
	    writeInt32LE(value, offset) {
	        return this._writeNumberValue(Buffer.prototype.writeInt32LE, 4, value, offset);
	    }
	    /**
	     * Inserts an Int32LE value at the given offset value.
	     *
	     * @param value { Number } The value to insert.
	     * @param offset { Number } The offset to insert the value at.
	     *
	     * @return this
	     */
	    insertInt32LE(value, offset) {
	        return this._insertNumberValue(Buffer.prototype.writeInt32LE, 4, value, offset);
	    }
	    /**
	     * Writes a BigInt64BE value to the current write position (or at optional offset).
	     *
	     * @param value { BigInt } The value to write.
	     * @param offset { Number } The offset to write the value at.
	     *
	     * @return this
	     */
	    writeBigInt64BE(value, offset) {
	        utils_1.bigIntAndBufferInt64Check('writeBigInt64BE');
	        return this._writeNumberValue(Buffer.prototype.writeBigInt64BE, 8, value, offset);
	    }
	    /**
	     * Inserts a BigInt64BE value at the given offset value.
	     *
	     * @param value { BigInt } The value to insert.
	     * @param offset { Number } The offset to insert the value at.
	     *
	     * @return this
	     */
	    insertBigInt64BE(value, offset) {
	        utils_1.bigIntAndBufferInt64Check('writeBigInt64BE');
	        return this._insertNumberValue(Buffer.prototype.writeBigInt64BE, 8, value, offset);
	    }
	    /**
	     * Writes a BigInt64LE value to the current write position (or at optional offset).
	     *
	     * @param value { BigInt } The value to write.
	     * @param offset { Number } The offset to write the value at.
	     *
	     * @return this
	     */
	    writeBigInt64LE(value, offset) {
	        utils_1.bigIntAndBufferInt64Check('writeBigInt64LE');
	        return this._writeNumberValue(Buffer.prototype.writeBigInt64LE, 8, value, offset);
	    }
	    /**
	     * Inserts a Int64LE value at the given offset value.
	     *
	     * @param value { BigInt } The value to insert.
	     * @param offset { Number } The offset to insert the value at.
	     *
	     * @return this
	     */
	    insertBigInt64LE(value, offset) {
	        utils_1.bigIntAndBufferInt64Check('writeBigInt64LE');
	        return this._insertNumberValue(Buffer.prototype.writeBigInt64LE, 8, value, offset);
	    }
	    // Unsigned Integers
	    /**
	     * Reads an UInt8 value from the current read position or an optionally provided offset.
	     *
	     * @param offset { Number } The offset to read data from (optional)
	     * @return { Number }
	     */
	    readUInt8(offset) {
	        return this._readNumberValue(Buffer.prototype.readUInt8, 1, offset);
	    }
	    /**
	     * Reads an UInt16BE value from the current read position or an optionally provided offset.
	     *
	     * @param offset { Number } The offset to read data from (optional)
	     * @return { Number }
	     */
	    readUInt16BE(offset) {
	        return this._readNumberValue(Buffer.prototype.readUInt16BE, 2, offset);
	    }
	    /**
	     * Reads an UInt16LE value from the current read position or an optionally provided offset.
	     *
	     * @param offset { Number } The offset to read data from (optional)
	     * @return { Number }
	     */
	    readUInt16LE(offset) {
	        return this._readNumberValue(Buffer.prototype.readUInt16LE, 2, offset);
	    }
	    /**
	     * Reads an UInt32BE value from the current read position or an optionally provided offset.
	     *
	     * @param offset { Number } The offset to read data from (optional)
	     * @return { Number }
	     */
	    readUInt32BE(offset) {
	        return this._readNumberValue(Buffer.prototype.readUInt32BE, 4, offset);
	    }
	    /**
	     * Reads an UInt32LE value from the current read position or an optionally provided offset.
	     *
	     * @param offset { Number } The offset to read data from (optional)
	     * @return { Number }
	     */
	    readUInt32LE(offset) {
	        return this._readNumberValue(Buffer.prototype.readUInt32LE, 4, offset);
	    }
	    /**
	     * Reads a BigUInt64BE value from the current read position or an optionally provided offset.
	     *
	     * @param offset { Number } The offset to read data from (optional)
	     * @return { BigInt }
	     */
	    readBigUInt64BE(offset) {
	        utils_1.bigIntAndBufferInt64Check('readBigUInt64BE');
	        return this._readNumberValue(Buffer.prototype.readBigUInt64BE, 8, offset);
	    }
	    /**
	     * Reads a BigUInt64LE value from the current read position or an optionally provided offset.
	     *
	     * @param offset { Number } The offset to read data from (optional)
	     * @return { BigInt }
	     */
	    readBigUInt64LE(offset) {
	        utils_1.bigIntAndBufferInt64Check('readBigUInt64LE');
	        return this._readNumberValue(Buffer.prototype.readBigUInt64LE, 8, offset);
	    }
	    /**
	     * Writes an UInt8 value to the current write position (or at optional offset).
	     *
	     * @param value { Number } The value to write.
	     * @param offset { Number } The offset to write the value at.
	     *
	     * @return this
	     */
	    writeUInt8(value, offset) {
	        return this._writeNumberValue(Buffer.prototype.writeUInt8, 1, value, offset);
	    }
	    /**
	     * Inserts an UInt8 value at the given offset value.
	     *
	     * @param value { Number } The value to insert.
	     * @param offset { Number } The offset to insert the value at.
	     *
	     * @return this
	     */
	    insertUInt8(value, offset) {
	        return this._insertNumberValue(Buffer.prototype.writeUInt8, 1, value, offset);
	    }
	    /**
	     * Writes an UInt16BE value to the current write position (or at optional offset).
	     *
	     * @param value { Number } The value to write.
	     * @param offset { Number } The offset to write the value at.
	     *
	     * @return this
	     */
	    writeUInt16BE(value, offset) {
	        return this._writeNumberValue(Buffer.prototype.writeUInt16BE, 2, value, offset);
	    }
	    /**
	     * Inserts an UInt16BE value at the given offset value.
	     *
	     * @param value { Number } The value to insert.
	     * @param offset { Number } The offset to insert the value at.
	     *
	     * @return this
	     */
	    insertUInt16BE(value, offset) {
	        return this._insertNumberValue(Buffer.prototype.writeUInt16BE, 2, value, offset);
	    }
	    /**
	     * Writes an UInt16LE value to the current write position (or at optional offset).
	     *
	     * @param value { Number } The value to write.
	     * @param offset { Number } The offset to write the value at.
	     *
	     * @return this
	     */
	    writeUInt16LE(value, offset) {
	        return this._writeNumberValue(Buffer.prototype.writeUInt16LE, 2, value, offset);
	    }
	    /**
	     * Inserts an UInt16LE value at the given offset value.
	     *
	     * @param value { Number } The value to insert.
	     * @param offset { Number } The offset to insert the value at.
	     *
	     * @return this
	     */
	    insertUInt16LE(value, offset) {
	        return this._insertNumberValue(Buffer.prototype.writeUInt16LE, 2, value, offset);
	    }
	    /**
	     * Writes an UInt32BE value to the current write position (or at optional offset).
	     *
	     * @param value { Number } The value to write.
	     * @param offset { Number } The offset to write the value at.
	     *
	     * @return this
	     */
	    writeUInt32BE(value, offset) {
	        return this._writeNumberValue(Buffer.prototype.writeUInt32BE, 4, value, offset);
	    }
	    /**
	     * Inserts an UInt32BE value at the given offset value.
	     *
	     * @param value { Number } The value to insert.
	     * @param offset { Number } The offset to insert the value at.
	     *
	     * @return this
	     */
	    insertUInt32BE(value, offset) {
	        return this._insertNumberValue(Buffer.prototype.writeUInt32BE, 4, value, offset);
	    }
	    /**
	     * Writes an UInt32LE value to the current write position (or at optional offset).
	     *
	     * @param value { Number } The value to write.
	     * @param offset { Number } The offset to write the value at.
	     *
	     * @return this
	     */
	    writeUInt32LE(value, offset) {
	        return this._writeNumberValue(Buffer.prototype.writeUInt32LE, 4, value, offset);
	    }
	    /**
	     * Inserts an UInt32LE value at the given offset value.
	     *
	     * @param value { Number } The value to insert.
	     * @param offset { Number } The offset to insert the value at.
	     *
	     * @return this
	     */
	    insertUInt32LE(value, offset) {
	        return this._insertNumberValue(Buffer.prototype.writeUInt32LE, 4, value, offset);
	    }
	    /**
	     * Writes a BigUInt64BE value to the current write position (or at optional offset).
	     *
	     * @param value { Number } The value to write.
	     * @param offset { Number } The offset to write the value at.
	     *
	     * @return this
	     */
	    writeBigUInt64BE(value, offset) {
	        utils_1.bigIntAndBufferInt64Check('writeBigUInt64BE');
	        return this._writeNumberValue(Buffer.prototype.writeBigUInt64BE, 8, value, offset);
	    }
	    /**
	     * Inserts a BigUInt64BE value at the given offset value.
	     *
	     * @param value { Number } The value to insert.
	     * @param offset { Number } The offset to insert the value at.
	     *
	     * @return this
	     */
	    insertBigUInt64BE(value, offset) {
	        utils_1.bigIntAndBufferInt64Check('writeBigUInt64BE');
	        return this._insertNumberValue(Buffer.prototype.writeBigUInt64BE, 8, value, offset);
	    }
	    /**
	     * Writes a BigUInt64LE value to the current write position (or at optional offset).
	     *
	     * @param value { Number } The value to write.
	     * @param offset { Number } The offset to write the value at.
	     *
	     * @return this
	     */
	    writeBigUInt64LE(value, offset) {
	        utils_1.bigIntAndBufferInt64Check('writeBigUInt64LE');
	        return this._writeNumberValue(Buffer.prototype.writeBigUInt64LE, 8, value, offset);
	    }
	    /**
	     * Inserts a BigUInt64LE value at the given offset value.
	     *
	     * @param value { Number } The value to insert.
	     * @param offset { Number } The offset to insert the value at.
	     *
	     * @return this
	     */
	    insertBigUInt64LE(value, offset) {
	        utils_1.bigIntAndBufferInt64Check('writeBigUInt64LE');
	        return this._insertNumberValue(Buffer.prototype.writeBigUInt64LE, 8, value, offset);
	    }
	    // Floating Point
	    /**
	     * Reads an FloatBE value from the current read position or an optionally provided offset.
	     *
	     * @param offset { Number } The offset to read data from (optional)
	     * @return { Number }
	     */
	    readFloatBE(offset) {
	        return this._readNumberValue(Buffer.prototype.readFloatBE, 4, offset);
	    }
	    /**
	     * Reads an FloatLE value from the current read position or an optionally provided offset.
	     *
	     * @param offset { Number } The offset to read data from (optional)
	     * @return { Number }
	     */
	    readFloatLE(offset) {
	        return this._readNumberValue(Buffer.prototype.readFloatLE, 4, offset);
	    }
	    /**
	     * Writes a FloatBE value to the current write position (or at optional offset).
	     *
	     * @param value { Number } The value to write.
	     * @param offset { Number } The offset to write the value at.
	     *
	     * @return this
	     */
	    writeFloatBE(value, offset) {
	        return this._writeNumberValue(Buffer.prototype.writeFloatBE, 4, value, offset);
	    }
	    /**
	     * Inserts a FloatBE value at the given offset value.
	     *
	     * @param value { Number } The value to insert.
	     * @param offset { Number } The offset to insert the value at.
	     *
	     * @return this
	     */
	    insertFloatBE(value, offset) {
	        return this._insertNumberValue(Buffer.prototype.writeFloatBE, 4, value, offset);
	    }
	    /**
	     * Writes a FloatLE value to the current write position (or at optional offset).
	     *
	     * @param value { Number } The value to write.
	     * @param offset { Number } The offset to write the value at.
	     *
	     * @return this
	     */
	    writeFloatLE(value, offset) {
	        return this._writeNumberValue(Buffer.prototype.writeFloatLE, 4, value, offset);
	    }
	    /**
	     * Inserts a FloatLE value at the given offset value.
	     *
	     * @param value { Number } The value to insert.
	     * @param offset { Number } The offset to insert the value at.
	     *
	     * @return this
	     */
	    insertFloatLE(value, offset) {
	        return this._insertNumberValue(Buffer.prototype.writeFloatLE, 4, value, offset);
	    }
	    // Double Floating Point
	    /**
	     * Reads an DoublEBE value from the current read position or an optionally provided offset.
	     *
	     * @param offset { Number } The offset to read data from (optional)
	     * @return { Number }
	     */
	    readDoubleBE(offset) {
	        return this._readNumberValue(Buffer.prototype.readDoubleBE, 8, offset);
	    }
	    /**
	     * Reads an DoubleLE value from the current read position or an optionally provided offset.
	     *
	     * @param offset { Number } The offset to read data from (optional)
	     * @return { Number }
	     */
	    readDoubleLE(offset) {
	        return this._readNumberValue(Buffer.prototype.readDoubleLE, 8, offset);
	    }
	    /**
	     * Writes a DoubleBE value to the current write position (or at optional offset).
	     *
	     * @param value { Number } The value to write.
	     * @param offset { Number } The offset to write the value at.
	     *
	     * @return this
	     */
	    writeDoubleBE(value, offset) {
	        return this._writeNumberValue(Buffer.prototype.writeDoubleBE, 8, value, offset);
	    }
	    /**
	     * Inserts a DoubleBE value at the given offset value.
	     *
	     * @param value { Number } The value to insert.
	     * @param offset { Number } The offset to insert the value at.
	     *
	     * @return this
	     */
	    insertDoubleBE(value, offset) {
	        return this._insertNumberValue(Buffer.prototype.writeDoubleBE, 8, value, offset);
	    }
	    /**
	     * Writes a DoubleLE value to the current write position (or at optional offset).
	     *
	     * @param value { Number } The value to write.
	     * @param offset { Number } The offset to write the value at.
	     *
	     * @return this
	     */
	    writeDoubleLE(value, offset) {
	        return this._writeNumberValue(Buffer.prototype.writeDoubleLE, 8, value, offset);
	    }
	    /**
	     * Inserts a DoubleLE value at the given offset value.
	     *
	     * @param value { Number } The value to insert.
	     * @param offset { Number } The offset to insert the value at.
	     *
	     * @return this
	     */
	    insertDoubleLE(value, offset) {
	        return this._insertNumberValue(Buffer.prototype.writeDoubleLE, 8, value, offset);
	    }
	    // Strings
	    /**
	     * Reads a String from the current read position.
	     *
	     * @param arg1 { Number | String } The number of bytes to read as a String, or the BufferEncoding to use for
	     *             the string (Defaults to instance level encoding).
	     * @param encoding { String } The BufferEncoding to use for the string (Defaults to instance level encoding).
	     *
	     * @return { String }
	     */
	    readString(arg1, encoding) {
	        let lengthVal;
	        // Length provided
	        if (typeof arg1 === 'number') {
	            utils_1.checkLengthValue(arg1);
	            lengthVal = Math.min(arg1, this.length - this._readOffset);
	        }
	        else {
	            encoding = arg1;
	            lengthVal = this.length - this._readOffset;
	        }
	        // Check encoding
	        if (typeof encoding !== 'undefined') {
	            utils_1.checkEncoding(encoding);
	        }
	        const value = this._buff.slice(this._readOffset, this._readOffset + lengthVal).toString(encoding || this._encoding);
	        this._readOffset += lengthVal;
	        return value;
	    }
	    /**
	     * Inserts a String
	     *
	     * @param value { String } The String value to insert.
	     * @param offset { Number } The offset to insert the string at.
	     * @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
	     *
	     * @return this
	     */
	    insertString(value, offset, encoding) {
	        utils_1.checkOffsetValue(offset);
	        return this._handleString(value, true, offset, encoding);
	    }
	    /**
	     * Writes a String
	     *
	     * @param value { String } The String value to write.
	     * @param arg2 { Number | String } The offset to write the string at, or the BufferEncoding to use.
	     * @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
	     *
	     * @return this
	     */
	    writeString(value, arg2, encoding) {
	        return this._handleString(value, false, arg2, encoding);
	    }
	    /**
	     * Reads a null-terminated String from the current read position.
	     *
	     * @param encoding { String } The BufferEncoding to use for the string (Defaults to instance level encoding).
	     *
	     * @return { String }
	     */
	    readStringNT(encoding) {
	        if (typeof encoding !== 'undefined') {
	            utils_1.checkEncoding(encoding);
	        }
	        // Set null character position to the end SmartBuffer instance.
	        let nullPos = this.length;
	        // Find next null character (if one is not found, default from above is used)
	        for (let i = this._readOffset; i < this.length; i++) {
	            if (this._buff[i] === 0x00) {
	                nullPos = i;
	                break;
	            }
	        }
	        // Read string value
	        const value = this._buff.slice(this._readOffset, nullPos);
	        // Increment internal Buffer read offset
	        this._readOffset = nullPos + 1;
	        return value.toString(encoding || this._encoding);
	    }
	    /**
	     * Inserts a null-terminated String.
	     *
	     * @param value { String } The String value to write.
	     * @param arg2 { Number | String } The offset to write the string to, or the BufferEncoding to use.
	     * @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
	     *
	     * @return this
	     */
	    insertStringNT(value, offset, encoding) {
	        utils_1.checkOffsetValue(offset);
	        // Write Values
	        this.insertString(value, offset, encoding);
	        this.insertUInt8(0x00, offset + value.length);
	        return this;
	    }
	    /**
	     * Writes a null-terminated String.
	     *
	     * @param value { String } The String value to write.
	     * @param arg2 { Number | String } The offset to write the string to, or the BufferEncoding to use.
	     * @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
	     *
	     * @return this
	     */
	    writeStringNT(value, arg2, encoding) {
	        // Write Values
	        this.writeString(value, arg2, encoding);
	        this.writeUInt8(0x00, typeof arg2 === 'number' ? arg2 + value.length : this.writeOffset);
	        return this;
	    }
	    // Buffers
	    /**
	     * Reads a Buffer from the internal read position.
	     *
	     * @param length { Number } The length of data to read as a Buffer.
	     *
	     * @return { Buffer }
	     */
	    readBuffer(length) {
	        if (typeof length !== 'undefined') {
	            utils_1.checkLengthValue(length);
	        }
	        const lengthVal = typeof length === 'number' ? length : this.length;
	        const endPoint = Math.min(this.length, this._readOffset + lengthVal);
	        // Read buffer value
	        const value = this._buff.slice(this._readOffset, endPoint);
	        // Increment internal Buffer read offset
	        this._readOffset = endPoint;
	        return value;
	    }
	    /**
	     * Writes a Buffer to the current write position.
	     *
	     * @param value { Buffer } The Buffer to write.
	     * @param offset { Number } The offset to write the Buffer to.
	     *
	     * @return this
	     */
	    insertBuffer(value, offset) {
	        utils_1.checkOffsetValue(offset);
	        return this._handleBuffer(value, true, offset);
	    }
	    /**
	     * Writes a Buffer to the current write position.
	     *
	     * @param value { Buffer } The Buffer to write.
	     * @param offset { Number } The offset to write the Buffer to.
	     *
	     * @return this
	     */
	    writeBuffer(value, offset) {
	        return this._handleBuffer(value, false, offset);
	    }
	    /**
	     * Reads a null-terminated Buffer from the current read poisiton.
	     *
	     * @return { Buffer }
	     */
	    readBufferNT() {
	        // Set null character position to the end SmartBuffer instance.
	        let nullPos = this.length;
	        // Find next null character (if one is not found, default from above is used)
	        for (let i = this._readOffset; i < this.length; i++) {
	            if (this._buff[i] === 0x00) {
	                nullPos = i;
	                break;
	            }
	        }
	        // Read value
	        const value = this._buff.slice(this._readOffset, nullPos);
	        // Increment internal Buffer read offset
	        this._readOffset = nullPos + 1;
	        return value;
	    }
	    /**
	     * Inserts a null-terminated Buffer.
	     *
	     * @param value { Buffer } The Buffer to write.
	     * @param offset { Number } The offset to write the Buffer to.
	     *
	     * @return this
	     */
	    insertBufferNT(value, offset) {
	        utils_1.checkOffsetValue(offset);
	        // Write Values
	        this.insertBuffer(value, offset);
	        this.insertUInt8(0x00, offset + value.length);
	        return this;
	    }
	    /**
	     * Writes a null-terminated Buffer.
	     *
	     * @param value { Buffer } The Buffer to write.
	     * @param offset { Number } The offset to write the Buffer to.
	     *
	     * @return this
	     */
	    writeBufferNT(value, offset) {
	        // Checks for valid numberic value;
	        if (typeof offset !== 'undefined') {
	            utils_1.checkOffsetValue(offset);
	        }
	        // Write Values
	        this.writeBuffer(value, offset);
	        this.writeUInt8(0x00, typeof offset === 'number' ? offset + value.length : this._writeOffset);
	        return this;
	    }
	    /**
	     * Clears the SmartBuffer instance to its original empty state.
	     */
	    clear() {
	        this._writeOffset = 0;
	        this._readOffset = 0;
	        this.length = 0;
	        return this;
	    }
	    /**
	     * Gets the remaining data left to be read from the SmartBuffer instance.
	     *
	     * @return { Number }
	     */
	    remaining() {
	        return this.length - this._readOffset;
	    }
	    /**
	     * Gets the current read offset value of the SmartBuffer instance.
	     *
	     * @return { Number }
	     */
	    get readOffset() {
	        return this._readOffset;
	    }
	    /**
	     * Sets the read offset value of the SmartBuffer instance.
	     *
	     * @param offset { Number } - The offset value to set.
	     */
	    set readOffset(offset) {
	        utils_1.checkOffsetValue(offset);
	        // Check for bounds.
	        utils_1.checkTargetOffset(offset, this);
	        this._readOffset = offset;
	    }
	    /**
	     * Gets the current write offset value of the SmartBuffer instance.
	     *
	     * @return { Number }
	     */
	    get writeOffset() {
	        return this._writeOffset;
	    }
	    /**
	     * Sets the write offset value of the SmartBuffer instance.
	     *
	     * @param offset { Number } - The offset value to set.
	     */
	    set writeOffset(offset) {
	        utils_1.checkOffsetValue(offset);
	        // Check for bounds.
	        utils_1.checkTargetOffset(offset, this);
	        this._writeOffset = offset;
	    }
	    /**
	     * Gets the currently set string encoding of the SmartBuffer instance.
	     *
	     * @return { BufferEncoding } The string Buffer encoding currently set.
	     */
	    get encoding() {
	        return this._encoding;
	    }
	    /**
	     * Sets the string encoding of the SmartBuffer instance.
	     *
	     * @param encoding { BufferEncoding } The string Buffer encoding to set.
	     */
	    set encoding(encoding) {
	        utils_1.checkEncoding(encoding);
	        this._encoding = encoding;
	    }
	    /**
	     * Gets the underlying internal Buffer. (This includes unmanaged data in the Buffer)
	     *
	     * @return { Buffer } The Buffer value.
	     */
	    get internalBuffer() {
	        return this._buff;
	    }
	    /**
	     * Gets the value of the internal managed Buffer (Includes managed data only)
	     *
	     * @param { Buffer }
	     */
	    toBuffer() {
	        return this._buff.slice(0, this.length);
	    }
	    /**
	     * Gets the String value of the internal managed Buffer
	     *
	     * @param encoding { String } The BufferEncoding to display the Buffer as (defaults to instance level encoding).
	     */
	    toString(encoding) {
	        const encodingVal = typeof encoding === 'string' ? encoding : this._encoding;
	        // Check for invalid encoding.
	        utils_1.checkEncoding(encodingVal);
	        return this._buff.toString(encodingVal, 0, this.length);
	    }
	    /**
	     * Destroys the SmartBuffer instance.
	     */
	    destroy() {
	        this.clear();
	        return this;
	    }
	    /**
	     * Handles inserting and writing strings.
	     *
	     * @param value { String } The String value to insert.
	     * @param isInsert { Boolean } True if inserting a string, false if writing.
	     * @param arg2 { Number | String } The offset to insert the string at, or the BufferEncoding to use.
	     * @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
	     */
	    _handleString(value, isInsert, arg3, encoding) {
	        let offsetVal = this._writeOffset;
	        let encodingVal = this._encoding;
	        // Check for offset
	        if (typeof arg3 === 'number') {
	            offsetVal = arg3;
	            // Check for encoding
	        }
	        else if (typeof arg3 === 'string') {
	            utils_1.checkEncoding(arg3);
	            encodingVal = arg3;
	        }
	        // Check for encoding (third param)
	        if (typeof encoding === 'string') {
	            utils_1.checkEncoding(encoding);
	            encodingVal = encoding;
	        }
	        // Calculate bytelength of string.
	        const byteLength = Buffer.byteLength(value, encodingVal);
	        // Ensure there is enough internal Buffer capacity.
	        if (isInsert) {
	            this.ensureInsertable(byteLength, offsetVal);
	        }
	        else {
	            this._ensureWriteable(byteLength, offsetVal);
	        }
	        // Write value
	        this._buff.write(value, offsetVal, byteLength, encodingVal);
	        // Increment internal Buffer write offset;
	        if (isInsert) {
	            this._writeOffset += byteLength;
	        }
	        else {
	            // If an offset was given, check to see if we wrote beyond the current writeOffset.
	            if (typeof arg3 === 'number') {
	                this._writeOffset = Math.max(this._writeOffset, offsetVal + byteLength);
	            }
	            else {
	                // If no offset was given, we wrote to the end of the SmartBuffer so increment writeOffset.
	                this._writeOffset += byteLength;
	            }
	        }
	        return this;
	    }
	    /**
	     * Handles writing or insert of a Buffer.
	     *
	     * @param value { Buffer } The Buffer to write.
	     * @param offset { Number } The offset to write the Buffer to.
	     */
	    _handleBuffer(value, isInsert, offset) {
	        const offsetVal = typeof offset === 'number' ? offset : this._writeOffset;
	        // Ensure there is enough internal Buffer capacity.
	        if (isInsert) {
	            this.ensureInsertable(value.length, offsetVal);
	        }
	        else {
	            this._ensureWriteable(value.length, offsetVal);
	        }
	        // Write buffer value
	        value.copy(this._buff, offsetVal);
	        // Increment internal Buffer write offset;
	        if (isInsert) {
	            this._writeOffset += value.length;
	        }
	        else {
	            // If an offset was given, check to see if we wrote beyond the current writeOffset.
	            if (typeof offset === 'number') {
	                this._writeOffset = Math.max(this._writeOffset, offsetVal + value.length);
	            }
	            else {
	                // If no offset was given, we wrote to the end of the SmartBuffer so increment writeOffset.
	                this._writeOffset += value.length;
	            }
	        }
	        return this;
	    }
	    /**
	     * Ensures that the internal Buffer is large enough to read data.
	     *
	     * @param length { Number } The length of the data that needs to be read.
	     * @param offset { Number } The offset of the data that needs to be read.
	     */
	    ensureReadable(length, offset) {
	        // Offset value defaults to managed read offset.
	        let offsetVal = this._readOffset;
	        // If an offset was provided, use it.
	        if (typeof offset !== 'undefined') {
	            // Checks for valid numberic value;
	            utils_1.checkOffsetValue(offset);
	            // Overide with custom offset.
	            offsetVal = offset;
	        }
	        // Checks if offset is below zero, or the offset+length offset is beyond the total length of the managed data.
	        if (offsetVal < 0 || offsetVal + length > this.length) {
	            throw new Error(utils_1.ERRORS.INVALID_READ_BEYOND_BOUNDS);
	        }
	    }
	    /**
	     * Ensures that the internal Buffer is large enough to insert data.
	     *
	     * @param dataLength { Number } The length of the data that needs to be written.
	     * @param offset { Number } The offset of the data to be written.
	     */
	    ensureInsertable(dataLength, offset) {
	        // Checks for valid numberic value;
	        utils_1.checkOffsetValue(offset);
	        // Ensure there is enough internal Buffer capacity.
	        this._ensureCapacity(this.length + dataLength);
	        // If an offset was provided and its not the very end of the buffer, copy data into appropriate location in regards to the offset.
	        if (offset < this.length) {
	            this._buff.copy(this._buff, offset + dataLength, offset, this._buff.length);
	        }
	        // Adjust tracked smart buffer length
	        if (offset + dataLength > this.length) {
	            this.length = offset + dataLength;
	        }
	        else {
	            this.length += dataLength;
	        }
	    }
	    /**
	     * Ensures that the internal Buffer is large enough to write data.
	     *
	     * @param dataLength { Number } The length of the data that needs to be written.
	     * @param offset { Number } The offset of the data to be written (defaults to writeOffset).
	     */
	    _ensureWriteable(dataLength, offset) {
	        const offsetVal = typeof offset === 'number' ? offset : this._writeOffset;
	        // Ensure enough capacity to write data.
	        this._ensureCapacity(offsetVal + dataLength);
	        // Adjust SmartBuffer length (if offset + length is larger than managed length, adjust length)
	        if (offsetVal + dataLength > this.length) {
	            this.length = offsetVal + dataLength;
	        }
	    }
	    /**
	     * Ensures that the internal Buffer is large enough to write at least the given amount of data.
	     *
	     * @param minLength { Number } The minimum length of the data needs to be written.
	     */
	    _ensureCapacity(minLength) {
	        const oldLength = this._buff.length;
	        if (minLength > oldLength) {
	            let data = this._buff;
	            let newLength = (oldLength * 3) / 2 + 1;
	            if (newLength < minLength) {
	                newLength = minLength;
	            }
	            this._buff = Buffer.allocUnsafe(newLength);
	            data.copy(this._buff, 0, 0, oldLength);
	        }
	    }
	    /**
	     * Reads a numeric number value using the provided function.
	     *
	     * @typeparam T { number | bigint } The type of the value to be read
	     *
	     * @param func { Function(offset: number) => number } The function to read data on the internal Buffer with.
	     * @param byteSize { Number } The number of bytes read.
	     * @param offset { Number } The offset to read from (optional). When this is not provided, the managed readOffset is used instead.
	     *
	     * @returns { T } the number value
	     */
	    _readNumberValue(func, byteSize, offset) {
	        this.ensureReadable(byteSize, offset);
	        // Call Buffer.readXXXX();
	        const value = func.call(this._buff, typeof offset === 'number' ? offset : this._readOffset);
	        // Adjust internal read offset if an optional read offset was not provided.
	        if (typeof offset === 'undefined') {
	            this._readOffset += byteSize;
	        }
	        return value;
	    }
	    /**
	     * Inserts a numeric number value based on the given offset and value.
	     *
	     * @typeparam T { number | bigint } The type of the value to be written
	     *
	     * @param func { Function(offset: T, offset?) => number} The function to write data on the internal Buffer with.
	     * @param byteSize { Number } The number of bytes written.
	     * @param value { T } The number value to write.
	     * @param offset { Number } the offset to write the number at (REQUIRED).
	     *
	     * @returns SmartBuffer this buffer
	     */
	    _insertNumberValue(func, byteSize, value, offset) {
	        // Check for invalid offset values.
	        utils_1.checkOffsetValue(offset);
	        // Ensure there is enough internal Buffer capacity. (raw offset is passed)
	        this.ensureInsertable(byteSize, offset);
	        // Call buffer.writeXXXX();
	        func.call(this._buff, value, offset);
	        // Adjusts internally managed write offset.
	        this._writeOffset += byteSize;
	        return this;
	    }
	    /**
	     * Writes a numeric number value based on the given offset and value.
	     *
	     * @typeparam T { number | bigint } The type of the value to be written
	     *
	     * @param func { Function(offset: T, offset?) => number} The function to write data on the internal Buffer with.
	     * @param byteSize { Number } The number of bytes written.
	     * @param value { T } The number value to write.
	     * @param offset { Number } the offset to write the number at (REQUIRED).
	     *
	     * @returns SmartBuffer this buffer
	     */
	    _writeNumberValue(func, byteSize, value, offset) {
	        // If an offset was provided, validate it.
	        if (typeof offset === 'number') {
	            // Check if we're writing beyond the bounds of the managed data.
	            if (offset < 0) {
	                throw new Error(utils_1.ERRORS.INVALID_WRITE_BEYOND_BOUNDS);
	            }
	            utils_1.checkOffsetValue(offset);
	        }
	        // Default to writeOffset if no offset value was given.
	        const offsetVal = typeof offset === 'number' ? offset : this._writeOffset;
	        // Ensure there is enough internal Buffer capacity. (raw offset is passed)
	        this._ensureWriteable(byteSize, offsetVal);
	        func.call(this._buff, value, offsetVal);
	        // If an offset was given, check to see if we wrote beyond the current writeOffset.
	        if (typeof offset === 'number') {
	            this._writeOffset = Math.max(this._writeOffset, offsetVal + byteSize);
	        }
	        else {
	            // If no numeric offset was given, we wrote to the end of the SmartBuffer so increment writeOffset.
	            this._writeOffset += byteSize;
	        }
	        return this;
	    }
	}
	smartbuffer.SmartBuffer = SmartBuffer;
	
	return smartbuffer;
}

var constants$2 = {};

var hasRequiredConstants$2;

function requireConstants$2 () {
	if (hasRequiredConstants$2) return constants$2;
	hasRequiredConstants$2 = 1;
	Object.defineProperty(constants$2, "__esModule", { value: true });
	constants$2.SOCKS5_NO_ACCEPTABLE_AUTH = constants$2.SOCKS5_CUSTOM_AUTH_END = constants$2.SOCKS5_CUSTOM_AUTH_START = constants$2.SOCKS_INCOMING_PACKET_SIZES = constants$2.SocksClientState = constants$2.Socks5Response = constants$2.Socks5HostType = constants$2.Socks5Auth = constants$2.Socks4Response = constants$2.SocksCommand = constants$2.ERRORS = constants$2.DEFAULT_TIMEOUT = void 0;
	const DEFAULT_TIMEOUT = 30000;
	constants$2.DEFAULT_TIMEOUT = DEFAULT_TIMEOUT;
	// prettier-ignore
	const ERRORS = {
	    InvalidSocksCommand: 'An invalid SOCKS command was provided. Valid options are connect, bind, and associate.',
	    InvalidSocksCommandForOperation: 'An invalid SOCKS command was provided. Only a subset of commands are supported for this operation.',
	    InvalidSocksCommandChain: 'An invalid SOCKS command was provided. Chaining currently only supports the connect command.',
	    InvalidSocksClientOptionsDestination: 'An invalid destination host was provided.',
	    InvalidSocksClientOptionsExistingSocket: 'An invalid existing socket was provided. This should be an instance of stream.Duplex.',
	    InvalidSocksClientOptionsProxy: 'Invalid SOCKS proxy details were provided.',
	    InvalidSocksClientOptionsTimeout: 'An invalid timeout value was provided. Please enter a value above 0 (in ms).',
	    InvalidSocksClientOptionsProxiesLength: 'At least two socks proxies must be provided for chaining.',
	    InvalidSocksClientOptionsCustomAuthRange: 'Custom auth must be a value between 0x80 and 0xFE.',
	    InvalidSocksClientOptionsCustomAuthOptions: 'When a custom_auth_method is provided, custom_auth_request_handler, custom_auth_response_size, and custom_auth_response_handler must also be provided and valid.',
	    NegotiationError: 'Negotiation error',
	    SocketClosed: 'Socket closed',
	    ProxyConnectionTimedOut: 'Proxy connection timed out',
	    InternalError: 'SocksClient internal error (this should not happen)',
	    InvalidSocks4HandshakeResponse: 'Received invalid Socks4 handshake response',
	    Socks4ProxyRejectedConnection: 'Socks4 Proxy rejected connection',
	    InvalidSocks4IncomingConnectionResponse: 'Socks4 invalid incoming connection response',
	    Socks4ProxyRejectedIncomingBoundConnection: 'Socks4 Proxy rejected incoming bound connection',
	    InvalidSocks5InitialHandshakeResponse: 'Received invalid Socks5 initial handshake response',
	    InvalidSocks5IntiailHandshakeSocksVersion: 'Received invalid Socks5 initial handshake (invalid socks version)',
	    InvalidSocks5InitialHandshakeNoAcceptedAuthType: 'Received invalid Socks5 initial handshake (no accepted authentication type)',
	    InvalidSocks5InitialHandshakeUnknownAuthType: 'Received invalid Socks5 initial handshake (unknown authentication type)',
	    Socks5AuthenticationFailed: 'Socks5 Authentication failed',
	    InvalidSocks5FinalHandshake: 'Received invalid Socks5 final handshake response',
	    InvalidSocks5FinalHandshakeRejected: 'Socks5 proxy rejected connection',
	    InvalidSocks5IncomingConnectionResponse: 'Received invalid Socks5 incoming connection response',
	    Socks5ProxyRejectedIncomingBoundConnection: 'Socks5 Proxy rejected incoming bound connection',
	};
	constants$2.ERRORS = ERRORS;
	const SOCKS_INCOMING_PACKET_SIZES = {
	    Socks5InitialHandshakeResponse: 2,
	    Socks5UserPassAuthenticationResponse: 2,
	    // Command response + incoming connection (bind)
	    Socks5ResponseHeader: 5, // We need at least 5 to read the hostname length, then we wait for the address+port information.
	    Socks5ResponseIPv4: 10, // 4 header + 4 ip + 2 port
	    Socks5ResponseIPv6: 22, // 4 header + 16 ip + 2 port
	    Socks5ResponseHostname: (hostNameLength) => hostNameLength + 7, // 4 header + 1 host length + host + 2 port
	    // Command response + incoming connection (bind)
	    Socks4Response: 8, // 2 header + 2 port + 4 ip
	};
	constants$2.SOCKS_INCOMING_PACKET_SIZES = SOCKS_INCOMING_PACKET_SIZES;
	var SocksCommand;
	(function (SocksCommand) {
	    SocksCommand[SocksCommand["connect"] = 1] = "connect";
	    SocksCommand[SocksCommand["bind"] = 2] = "bind";
	    SocksCommand[SocksCommand["associate"] = 3] = "associate";
	})(SocksCommand || (constants$2.SocksCommand = SocksCommand = {}));
	var Socks4Response;
	(function (Socks4Response) {
	    Socks4Response[Socks4Response["Granted"] = 90] = "Granted";
	    Socks4Response[Socks4Response["Failed"] = 91] = "Failed";
	    Socks4Response[Socks4Response["Rejected"] = 92] = "Rejected";
	    Socks4Response[Socks4Response["RejectedIdent"] = 93] = "RejectedIdent";
	})(Socks4Response || (constants$2.Socks4Response = Socks4Response = {}));
	var Socks5Auth;
	(function (Socks5Auth) {
	    Socks5Auth[Socks5Auth["NoAuth"] = 0] = "NoAuth";
	    Socks5Auth[Socks5Auth["GSSApi"] = 1] = "GSSApi";
	    Socks5Auth[Socks5Auth["UserPass"] = 2] = "UserPass";
	})(Socks5Auth || (constants$2.Socks5Auth = Socks5Auth = {}));
	const SOCKS5_CUSTOM_AUTH_START = 0x80;
	constants$2.SOCKS5_CUSTOM_AUTH_START = SOCKS5_CUSTOM_AUTH_START;
	const SOCKS5_CUSTOM_AUTH_END = 0xfe;
	constants$2.SOCKS5_CUSTOM_AUTH_END = SOCKS5_CUSTOM_AUTH_END;
	const SOCKS5_NO_ACCEPTABLE_AUTH = 0xff;
	constants$2.SOCKS5_NO_ACCEPTABLE_AUTH = SOCKS5_NO_ACCEPTABLE_AUTH;
	var Socks5Response;
	(function (Socks5Response) {
	    Socks5Response[Socks5Response["Granted"] = 0] = "Granted";
	    Socks5Response[Socks5Response["Failure"] = 1] = "Failure";
	    Socks5Response[Socks5Response["NotAllowed"] = 2] = "NotAllowed";
	    Socks5Response[Socks5Response["NetworkUnreachable"] = 3] = "NetworkUnreachable";
	    Socks5Response[Socks5Response["HostUnreachable"] = 4] = "HostUnreachable";
	    Socks5Response[Socks5Response["ConnectionRefused"] = 5] = "ConnectionRefused";
	    Socks5Response[Socks5Response["TTLExpired"] = 6] = "TTLExpired";
	    Socks5Response[Socks5Response["CommandNotSupported"] = 7] = "CommandNotSupported";
	    Socks5Response[Socks5Response["AddressNotSupported"] = 8] = "AddressNotSupported";
	})(Socks5Response || (constants$2.Socks5Response = Socks5Response = {}));
	var Socks5HostType;
	(function (Socks5HostType) {
	    Socks5HostType[Socks5HostType["IPv4"] = 1] = "IPv4";
	    Socks5HostType[Socks5HostType["Hostname"] = 3] = "Hostname";
	    Socks5HostType[Socks5HostType["IPv6"] = 4] = "IPv6";
	})(Socks5HostType || (constants$2.Socks5HostType = Socks5HostType = {}));
	var SocksClientState;
	(function (SocksClientState) {
	    SocksClientState[SocksClientState["Created"] = 0] = "Created";
	    SocksClientState[SocksClientState["Connecting"] = 1] = "Connecting";
	    SocksClientState[SocksClientState["Connected"] = 2] = "Connected";
	    SocksClientState[SocksClientState["SentInitialHandshake"] = 3] = "SentInitialHandshake";
	    SocksClientState[SocksClientState["ReceivedInitialHandshakeResponse"] = 4] = "ReceivedInitialHandshakeResponse";
	    SocksClientState[SocksClientState["SentAuthentication"] = 5] = "SentAuthentication";
	    SocksClientState[SocksClientState["ReceivedAuthenticationResponse"] = 6] = "ReceivedAuthenticationResponse";
	    SocksClientState[SocksClientState["SentFinalHandshake"] = 7] = "SentFinalHandshake";
	    SocksClientState[SocksClientState["ReceivedFinalResponse"] = 8] = "ReceivedFinalResponse";
	    SocksClientState[SocksClientState["BoundWaitingForConnection"] = 9] = "BoundWaitingForConnection";
	    SocksClientState[SocksClientState["Established"] = 10] = "Established";
	    SocksClientState[SocksClientState["Disconnected"] = 11] = "Disconnected";
	    SocksClientState[SocksClientState["Error"] = 99] = "Error";
	})(SocksClientState || (constants$2.SocksClientState = SocksClientState = {}));
	
	return constants$2;
}

var helpers$2 = {};

var util = {};

var hasRequiredUtil;

function requireUtil () {
	if (hasRequiredUtil) return util;
	hasRequiredUtil = 1;
	Object.defineProperty(util, "__esModule", { value: true });
	util.shuffleArray = util.SocksClientError = void 0;
	/**
	 * Error wrapper for SocksClient
	 */
	class SocksClientError extends Error {
	    constructor(message, options) {
	        super(message);
	        this.options = options;
	    }
	}
	util.SocksClientError = SocksClientError;
	/**
	 * Shuffles a given array.
	 * @param array The array to shuffle.
	 */
	function shuffleArray(array) {
	    for (let i = array.length - 1; i > 0; i--) {
	        const j = Math.floor(Math.random() * (i + 1));
	        [array[i], array[j]] = [array[j], array[i]];
	    }
	}
	util.shuffleArray = shuffleArray;
	
	return util;
}

var ipAddress = {};

var ipv4 = {};

var common$1 = {};

var hasRequiredCommon$1;

function requireCommon$1 () {
	if (hasRequiredCommon$1) return common$1;
	hasRequiredCommon$1 = 1;
	Object.defineProperty(common$1, "__esModule", { value: true });
	common$1.isCorrect = common$1.isInSubnet = void 0;
	function isInSubnet(address) {
	    if (this.subnetMask < address.subnetMask) {
	        return false;
	    }
	    if (this.mask(address.subnetMask) === address.mask()) {
	        return true;
	    }
	    return false;
	}
	common$1.isInSubnet = isInSubnet;
	function isCorrect(defaultBits) {
	    return function () {
	        if (this.addressMinusSuffix !== this.correctForm()) {
	            return false;
	        }
	        if (this.subnetMask === defaultBits && !this.parsedSubnet) {
	            return true;
	        }
	        return this.parsedSubnet === String(this.subnetMask);
	    };
	}
	common$1.isCorrect = isCorrect;
	
	return common$1;
}

var constants$1 = {};

var hasRequiredConstants$1;

function requireConstants$1 () {
	if (hasRequiredConstants$1) return constants$1;
	hasRequiredConstants$1 = 1;
	Object.defineProperty(constants$1, "__esModule", { value: true });
	constants$1.RE_SUBNET_STRING = constants$1.RE_ADDRESS = constants$1.GROUPS = constants$1.BITS = void 0;
	constants$1.BITS = 32;
	constants$1.GROUPS = 4;
	constants$1.RE_ADDRESS = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/g;
	constants$1.RE_SUBNET_STRING = /\/\d{1,2}$/;
	
	return constants$1;
}

var addressError = {};

var hasRequiredAddressError;

function requireAddressError () {
	if (hasRequiredAddressError) return addressError;
	hasRequiredAddressError = 1;
	Object.defineProperty(addressError, "__esModule", { value: true });
	addressError.AddressError = void 0;
	class AddressError extends Error {
	    constructor(message, parseMessage) {
	        super(message);
	        this.name = 'AddressError';
	        if (parseMessage !== null) {
	            this.parseMessage = parseMessage;
	        }
	    }
	}
	addressError.AddressError = AddressError;
	
	return addressError;
}

var jsbn$1 = {exports: {}};

var jsbn = jsbn$1.exports;

var hasRequiredJsbn;

function requireJsbn () {
	if (hasRequiredJsbn) return jsbn$1.exports;
	hasRequiredJsbn = 1;
	(function (module, exports) {
		(function(){

		    // Copyright (c) 2005  Tom Wu
		    // All Rights Reserved.
		    // See "LICENSE" for details.

		    // Basic JavaScript BN library - subset useful for RSA encryption.

		    // Bits per digit
		    var dbits;

		    // JavaScript engine analysis
		    var canary = 0xdeadbeefcafe;
		    var j_lm = ((canary&0xffffff)==0xefcafe);

		    // (public) Constructor
		    function BigInteger(a,b,c) {
		      if(a != null)
		        if("number" == typeof a) this.fromNumber(a,b,c);
		        else if(b == null && "string" != typeof a) this.fromString(a,256);
		        else this.fromString(a,b);
		    }

		    // return new, unset BigInteger
		    function nbi() { return new BigInteger(null); }

		    // am: Compute w_j += (x*this_i), propagate carries,
		    // c is initial carry, returns final carry.
		    // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
		    // We need to select the fastest one that works in this environment.

		    // am1: use a single mult and divide to get the high bits,
		    // max digit bits should be 26 because
		    // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
		    function am1(i,x,w,j,c,n) {
		      while(--n >= 0) {
		        var v = x*this[i++]+w[j]+c;
		        c = Math.floor(v/0x4000000);
		        w[j++] = v&0x3ffffff;
		      }
		      return c;
		    }
		    // am2 avoids a big mult-and-extract completely.
		    // Max digit bits should be <= 30 because we do bitwise ops
		    // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
		    function am2(i,x,w,j,c,n) {
		      var xl = x&0x7fff, xh = x>>15;
		      while(--n >= 0) {
		        var l = this[i]&0x7fff;
		        var h = this[i++]>>15;
		        var m = xh*l+h*xl;
		        l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
		        c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
		        w[j++] = l&0x3fffffff;
		      }
		      return c;
		    }
		    // Alternately, set max digit bits to 28 since some
		    // browsers slow down when dealing with 32-bit numbers.
		    function am3(i,x,w,j,c,n) {
		      var xl = x&0x3fff, xh = x>>14;
		      while(--n >= 0) {
		        var l = this[i]&0x3fff;
		        var h = this[i++]>>14;
		        var m = xh*l+h*xl;
		        l = xl*l+((m&0x3fff)<<14)+w[j]+c;
		        c = (l>>28)+(m>>14)+xh*h;
		        w[j++] = l&0xfffffff;
		      }
		      return c;
		    }
		    var inBrowser = typeof navigator !== "undefined";
		    if(inBrowser && j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
		      BigInteger.prototype.am = am2;
		      dbits = 30;
		    }
		    else if(inBrowser && j_lm && (navigator.appName != "Netscape")) {
		      BigInteger.prototype.am = am1;
		      dbits = 26;
		    }
		    else { // Mozilla/Netscape seems to prefer am3
		      BigInteger.prototype.am = am3;
		      dbits = 28;
		    }

		    BigInteger.prototype.DB = dbits;
		    BigInteger.prototype.DM = ((1<<dbits)-1);
		    BigInteger.prototype.DV = (1<<dbits);

		    var BI_FP = 52;
		    BigInteger.prototype.FV = Math.pow(2,BI_FP);
		    BigInteger.prototype.F1 = BI_FP-dbits;
		    BigInteger.prototype.F2 = 2*dbits-BI_FP;

		    // Digit conversions
		    var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
		    var BI_RC = new Array();
		    var rr,vv;
		    rr = "0".charCodeAt(0);
		    for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
		    rr = "a".charCodeAt(0);
		    for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
		    rr = "A".charCodeAt(0);
		    for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

		    function int2char(n) { return BI_RM.charAt(n); }
		    function intAt(s,i) {
		      var c = BI_RC[s.charCodeAt(i)];
		      return (c==null)?-1:c;
		    }

		    // (protected) copy this to r
		    function bnpCopyTo(r) {
		      for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
		      r.t = this.t;
		      r.s = this.s;
		    }

		    // (protected) set from integer value x, -DV <= x < DV
		    function bnpFromInt(x) {
		      this.t = 1;
		      this.s = (x<0)?-1:0;
		      if(x > 0) this[0] = x;
		      else if(x < -1) this[0] = x+this.DV;
		      else this.t = 0;
		    }

		    // return bigint initialized to value
		    function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

		    // (protected) set from string and radix
		    function bnpFromString(s,b) {
		      var k;
		      if(b == 16) k = 4;
		      else if(b == 8) k = 3;
		      else if(b == 256) k = 8; // byte array
		      else if(b == 2) k = 1;
		      else if(b == 32) k = 5;
		      else if(b == 4) k = 2;
		      else { this.fromRadix(s,b); return; }
		      this.t = 0;
		      this.s = 0;
		      var i = s.length, mi = false, sh = 0;
		      while(--i >= 0) {
		        var x = (k==8)?s[i]&0xff:intAt(s,i);
		        if(x < 0) {
		          if(s.charAt(i) == "-") mi = true;
		          continue;
		        }
		        mi = false;
		        if(sh == 0)
		          this[this.t++] = x;
		        else if(sh+k > this.DB) {
		          this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
		          this[this.t++] = (x>>(this.DB-sh));
		        }
		        else
		          this[this.t-1] |= x<<sh;
		        sh += k;
		        if(sh >= this.DB) sh -= this.DB;
		      }
		      if(k == 8 && (s[0]&0x80) != 0) {
		        this.s = -1;
		        if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
		      }
		      this.clamp();
		      if(mi) BigInteger.ZERO.subTo(this,this);
		    }

		    // (protected) clamp off excess high words
		    function bnpClamp() {
		      var c = this.s&this.DM;
		      while(this.t > 0 && this[this.t-1] == c) --this.t;
		    }

		    // (public) return string representation in given radix
		    function bnToString(b) {
		      if(this.s < 0) return "-"+this.negate().toString(b);
		      var k;
		      if(b == 16) k = 4;
		      else if(b == 8) k = 3;
		      else if(b == 2) k = 1;
		      else if(b == 32) k = 5;
		      else if(b == 4) k = 2;
		      else return this.toRadix(b);
		      var km = (1<<k)-1, d, m = false, r = "", i = this.t;
		      var p = this.DB-(i*this.DB)%k;
		      if(i-- > 0) {
		        if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
		        while(i >= 0) {
		          if(p < k) {
		            d = (this[i]&((1<<p)-1))<<(k-p);
		            d |= this[--i]>>(p+=this.DB-k);
		          }
		          else {
		            d = (this[i]>>(p-=k))&km;
		            if(p <= 0) { p += this.DB; --i; }
		          }
		          if(d > 0) m = true;
		          if(m) r += int2char(d);
		        }
		      }
		      return m?r:"0";
		    }

		    // (public) -this
		    function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

		    // (public) |this|
		    function bnAbs() { return (this.s<0)?this.negate():this; }

		    // (public) return + if this > a, - if this < a, 0 if equal
		    function bnCompareTo(a) {
		      var r = this.s-a.s;
		      if(r != 0) return r;
		      var i = this.t;
		      r = i-a.t;
		      if(r != 0) return (this.s<0)?-r:r;
		      while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
		      return 0;
		    }

		    // returns bit length of the integer x
		    function nbits(x) {
		      var r = 1, t;
		      if((t=x>>>16) != 0) { x = t; r += 16; }
		      if((t=x>>8) != 0) { x = t; r += 8; }
		      if((t=x>>4) != 0) { x = t; r += 4; }
		      if((t=x>>2) != 0) { x = t; r += 2; }
		      if((t=x>>1) != 0) { x = t; r += 1; }
		      return r;
		    }

		    // (public) return the number of bits in "this"
		    function bnBitLength() {
		      if(this.t <= 0) return 0;
		      return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
		    }

		    // (protected) r = this << n*DB
		    function bnpDLShiftTo(n,r) {
		      var i;
		      for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
		      for(i = n-1; i >= 0; --i) r[i] = 0;
		      r.t = this.t+n;
		      r.s = this.s;
		    }

		    // (protected) r = this >> n*DB
		    function bnpDRShiftTo(n,r) {
		      for(var i = n; i < this.t; ++i) r[i-n] = this[i];
		      r.t = Math.max(this.t-n,0);
		      r.s = this.s;
		    }

		    // (protected) r = this << n
		    function bnpLShiftTo(n,r) {
		      var bs = n%this.DB;
		      var cbs = this.DB-bs;
		      var bm = (1<<cbs)-1;
		      var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
		      for(i = this.t-1; i >= 0; --i) {
		        r[i+ds+1] = (this[i]>>cbs)|c;
		        c = (this[i]&bm)<<bs;
		      }
		      for(i = ds-1; i >= 0; --i) r[i] = 0;
		      r[ds] = c;
		      r.t = this.t+ds+1;
		      r.s = this.s;
		      r.clamp();
		    }

		    // (protected) r = this >> n
		    function bnpRShiftTo(n,r) {
		      r.s = this.s;
		      var ds = Math.floor(n/this.DB);
		      if(ds >= this.t) { r.t = 0; return; }
		      var bs = n%this.DB;
		      var cbs = this.DB-bs;
		      var bm = (1<<bs)-1;
		      r[0] = this[ds]>>bs;
		      for(var i = ds+1; i < this.t; ++i) {
		        r[i-ds-1] |= (this[i]&bm)<<cbs;
		        r[i-ds] = this[i]>>bs;
		      }
		      if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
		      r.t = this.t-ds;
		      r.clamp();
		    }

		    // (protected) r = this - a
		    function bnpSubTo(a,r) {
		      var i = 0, c = 0, m = Math.min(a.t,this.t);
		      while(i < m) {
		        c += this[i]-a[i];
		        r[i++] = c&this.DM;
		        c >>= this.DB;
		      }
		      if(a.t < this.t) {
		        c -= a.s;
		        while(i < this.t) {
		          c += this[i];
		          r[i++] = c&this.DM;
		          c >>= this.DB;
		        }
		        c += this.s;
		      }
		      else {
		        c += this.s;
		        while(i < a.t) {
		          c -= a[i];
		          r[i++] = c&this.DM;
		          c >>= this.DB;
		        }
		        c -= a.s;
		      }
		      r.s = (c<0)?-1:0;
		      if(c < -1) r[i++] = this.DV+c;
		      else if(c > 0) r[i++] = c;
		      r.t = i;
		      r.clamp();
		    }

		    // (protected) r = this * a, r != this,a (HAC 14.12)
		    // "this" should be the larger one if appropriate.
		    function bnpMultiplyTo(a,r) {
		      var x = this.abs(), y = a.abs();
		      var i = x.t;
		      r.t = i+y.t;
		      while(--i >= 0) r[i] = 0;
		      for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
		      r.s = 0;
		      r.clamp();
		      if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
		    }

		    // (protected) r = this^2, r != this (HAC 14.16)
		    function bnpSquareTo(r) {
		      var x = this.abs();
		      var i = r.t = 2*x.t;
		      while(--i >= 0) r[i] = 0;
		      for(i = 0; i < x.t-1; ++i) {
		        var c = x.am(i,x[i],r,2*i,0,1);
		        if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
		          r[i+x.t] -= x.DV;
		          r[i+x.t+1] = 1;
		        }
		      }
		      if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
		      r.s = 0;
		      r.clamp();
		    }

		    // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
		    // r != q, this != m.  q or r may be null.
		    function bnpDivRemTo(m,q,r) {
		      var pm = m.abs();
		      if(pm.t <= 0) return;
		      var pt = this.abs();
		      if(pt.t < pm.t) {
		        if(q != null) q.fromInt(0);
		        if(r != null) this.copyTo(r);
		        return;
		      }
		      if(r == null) r = nbi();
		      var y = nbi(), ts = this.s, ms = m.s;
		      var nsh = this.DB-nbits(pm[pm.t-1]);   // normalize modulus
		      if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
		      else { pm.copyTo(y); pt.copyTo(r); }
		      var ys = y.t;
		      var y0 = y[ys-1];
		      if(y0 == 0) return;
		      var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
		      var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
		      var i = r.t, j = i-ys, t = (q==null)?nbi():q;
		      y.dlShiftTo(j,t);
		      if(r.compareTo(t) >= 0) {
		        r[r.t++] = 1;
		        r.subTo(t,r);
		      }
		      BigInteger.ONE.dlShiftTo(ys,t);
		      t.subTo(y,y);  // "negative" y so we can replace sub with am later
		      while(y.t < ys) y[y.t++] = 0;
		      while(--j >= 0) {
		        // Estimate quotient digit
		        var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
		        if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {   // Try it out
		          y.dlShiftTo(j,t);
		          r.subTo(t,r);
		          while(r[i] < --qd) r.subTo(t,r);
		        }
		      }
		      if(q != null) {
		        r.drShiftTo(ys,q);
		        if(ts != ms) BigInteger.ZERO.subTo(q,q);
		      }
		      r.t = ys;
		      r.clamp();
		      if(nsh > 0) r.rShiftTo(nsh,r); // Denormalize remainder
		      if(ts < 0) BigInteger.ZERO.subTo(r,r);
		    }

		    // (public) this mod a
		    function bnMod(a) {
		      var r = nbi();
		      this.abs().divRemTo(a,null,r);
		      if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
		      return r;
		    }

		    // Modular reduction using "classic" algorithm
		    function Classic(m) { this.m = m; }
		    function cConvert(x) {
		      if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
		      else return x;
		    }
		    function cRevert(x) { return x; }
		    function cReduce(x) { x.divRemTo(this.m,null,x); }
		    function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
		    function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

		    Classic.prototype.convert = cConvert;
		    Classic.prototype.revert = cRevert;
		    Classic.prototype.reduce = cReduce;
		    Classic.prototype.mulTo = cMulTo;
		    Classic.prototype.sqrTo = cSqrTo;

		    // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
		    // justification:
		    //         xy == 1 (mod m)
		    //         xy =  1+km
		    //   xy(2-xy) = (1+km)(1-km)
		    // x[y(2-xy)] = 1-k^2m^2
		    // x[y(2-xy)] == 1 (mod m^2)
		    // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
		    // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
		    // JS multiply "overflows" differently from C/C++, so care is needed here.
		    function bnpInvDigit() {
		      if(this.t < 1) return 0;
		      var x = this[0];
		      if((x&1) == 0) return 0;
		      var y = x&3;       // y == 1/x mod 2^2
		      y = (y*(2-(x&0xf)*y))&0xf; // y == 1/x mod 2^4
		      y = (y*(2-(x&0xff)*y))&0xff;   // y == 1/x mod 2^8
		      y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;    // y == 1/x mod 2^16
		      // last step - calculate inverse mod DV directly;
		      // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
		      y = (y*(2-x*y%this.DV))%this.DV;       // y == 1/x mod 2^dbits
		      // we really want the negative inverse, and -DV < y < DV
		      return (y>0)?this.DV-y:-y;
		    }

		    // Montgomery reduction
		    function Montgomery(m) {
		      this.m = m;
		      this.mp = m.invDigit();
		      this.mpl = this.mp&0x7fff;
		      this.mph = this.mp>>15;
		      this.um = (1<<(m.DB-15))-1;
		      this.mt2 = 2*m.t;
		    }

		    // xR mod m
		    function montConvert(x) {
		      var r = nbi();
		      x.abs().dlShiftTo(this.m.t,r);
		      r.divRemTo(this.m,null,r);
		      if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
		      return r;
		    }

		    // x/R mod m
		    function montRevert(x) {
		      var r = nbi();
		      x.copyTo(r);
		      this.reduce(r);
		      return r;
		    }

		    // x = x/R mod m (HAC 14.32)
		    function montReduce(x) {
		      while(x.t <= this.mt2) // pad x so am has enough room later
		        x[x.t++] = 0;
		      for(var i = 0; i < this.m.t; ++i) {
		        // faster way of calculating u0 = x[i]*mp mod DV
		        var j = x[i]&0x7fff;
		        var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
		        // use am to combine the multiply-shift-add into one call
		        j = i+this.m.t;
		        x[j] += this.m.am(0,u0,x,i,0,this.m.t);
		        // propagate carry
		        while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
		      }
		      x.clamp();
		      x.drShiftTo(this.m.t,x);
		      if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
		    }

		    // r = "x^2/R mod m"; x != r
		    function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

		    // r = "xy/R mod m"; x,y != r
		    function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

		    Montgomery.prototype.convert = montConvert;
		    Montgomery.prototype.revert = montRevert;
		    Montgomery.prototype.reduce = montReduce;
		    Montgomery.prototype.mulTo = montMulTo;
		    Montgomery.prototype.sqrTo = montSqrTo;

		    // (protected) true iff this is even
		    function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

		    // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
		    function bnpExp(e,z) {
		      if(e > 0xffffffff || e < 1) return BigInteger.ONE;
		      var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
		      g.copyTo(r);
		      while(--i >= 0) {
		        z.sqrTo(r,r2);
		        if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
		        else { var t = r; r = r2; r2 = t; }
		      }
		      return z.revert(r);
		    }

		    // (public) this^e % m, 0 <= e < 2^32
		    function bnModPowInt(e,m) {
		      var z;
		      if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
		      return this.exp(e,z);
		    }

		    // protected
		    BigInteger.prototype.copyTo = bnpCopyTo;
		    BigInteger.prototype.fromInt = bnpFromInt;
		    BigInteger.prototype.fromString = bnpFromString;
		    BigInteger.prototype.clamp = bnpClamp;
		    BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
		    BigInteger.prototype.drShiftTo = bnpDRShiftTo;
		    BigInteger.prototype.lShiftTo = bnpLShiftTo;
		    BigInteger.prototype.rShiftTo = bnpRShiftTo;
		    BigInteger.prototype.subTo = bnpSubTo;
		    BigInteger.prototype.multiplyTo = bnpMultiplyTo;
		    BigInteger.prototype.squareTo = bnpSquareTo;
		    BigInteger.prototype.divRemTo = bnpDivRemTo;
		    BigInteger.prototype.invDigit = bnpInvDigit;
		    BigInteger.prototype.isEven = bnpIsEven;
		    BigInteger.prototype.exp = bnpExp;

		    // public
		    BigInteger.prototype.toString = bnToString;
		    BigInteger.prototype.negate = bnNegate;
		    BigInteger.prototype.abs = bnAbs;
		    BigInteger.prototype.compareTo = bnCompareTo;
		    BigInteger.prototype.bitLength = bnBitLength;
		    BigInteger.prototype.mod = bnMod;
		    BigInteger.prototype.modPowInt = bnModPowInt;

		    // "constants"
		    BigInteger.ZERO = nbv(0);
		    BigInteger.ONE = nbv(1);

		    // Copyright (c) 2005-2009  Tom Wu
		    // All Rights Reserved.
		    // See "LICENSE" for details.

		    // Extended JavaScript BN functions, required for RSA private ops.

		    // Version 1.1: new BigInteger("0", 10) returns "proper" zero
		    // Version 1.2: square() API, isProbablePrime fix

		    // (public)
		    function bnClone() { var r = nbi(); this.copyTo(r); return r; }

		    // (public) return value as integer
		    function bnIntValue() {
		      if(this.s < 0) {
		        if(this.t == 1) return this[0]-this.DV;
		        else if(this.t == 0) return -1;
		      }
		      else if(this.t == 1) return this[0];
		      else if(this.t == 0) return 0;
		      // assumes 16 < DB < 32
		      return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
		    }

		    // (public) return value as byte
		    function bnByteValue() { return (this.t==0)?this.s:(this[0]<<24)>>24; }

		    // (public) return value as short (assumes DB>=16)
		    function bnShortValue() { return (this.t==0)?this.s:(this[0]<<16)>>16; }

		    // (protected) return x s.t. r^x < DV
		    function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

		    // (public) 0 if this == 0, 1 if this > 0
		    function bnSigNum() {
		      if(this.s < 0) return -1;
		      else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
		      else return 1;
		    }

		    // (protected) convert to radix string
		    function bnpToRadix(b) {
		      if(b == null) b = 10;
		      if(this.signum() == 0 || b < 2 || b > 36) return "0";
		      var cs = this.chunkSize(b);
		      var a = Math.pow(b,cs);
		      var d = nbv(a), y = nbi(), z = nbi(), r = "";
		      this.divRemTo(d,y,z);
		      while(y.signum() > 0) {
		        r = (a+z.intValue()).toString(b).substr(1) + r;
		        y.divRemTo(d,y,z);
		      }
		      return z.intValue().toString(b) + r;
		    }

		    // (protected) convert from radix string
		    function bnpFromRadix(s,b) {
		      this.fromInt(0);
		      if(b == null) b = 10;
		      var cs = this.chunkSize(b);
		      var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
		      for(var i = 0; i < s.length; ++i) {
		        var x = intAt(s,i);
		        if(x < 0) {
		          if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
		          continue;
		        }
		        w = b*w+x;
		        if(++j >= cs) {
		          this.dMultiply(d);
		          this.dAddOffset(w,0);
		          j = 0;
		          w = 0;
		        }
		      }
		      if(j > 0) {
		        this.dMultiply(Math.pow(b,j));
		        this.dAddOffset(w,0);
		      }
		      if(mi) BigInteger.ZERO.subTo(this,this);
		    }

		    // (protected) alternate constructor
		    function bnpFromNumber(a,b,c) {
		      if("number" == typeof b) {
		        // new BigInteger(int,int,RNG)
		        if(a < 2) this.fromInt(1);
		        else {
		          this.fromNumber(a,c);
		          if(!this.testBit(a-1))    // force MSB set
		            this.bitwiseTo(BigInteger.ONE.shiftLeft(a-1),op_or,this);
		          if(this.isEven()) this.dAddOffset(1,0); // force odd
		          while(!this.isProbablePrime(b)) {
		            this.dAddOffset(2,0);
		            if(this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a-1),this);
		          }
		        }
		      }
		      else {
		        // new BigInteger(int,RNG)
		        var x = new Array(), t = a&7;
		        x.length = (a>>3)+1;
		        b.nextBytes(x);
		        if(t > 0) x[0] &= ((1<<t)-1); else x[0] = 0;
		        this.fromString(x,256);
		      }
		    }

		    // (public) convert to bigendian byte array
		    function bnToByteArray() {
		      var i = this.t, r = new Array();
		      r[0] = this.s;
		      var p = this.DB-(i*this.DB)%8, d, k = 0;
		      if(i-- > 0) {
		        if(p < this.DB && (d = this[i]>>p) != (this.s&this.DM)>>p)
		          r[k++] = d|(this.s<<(this.DB-p));
		        while(i >= 0) {
		          if(p < 8) {
		            d = (this[i]&((1<<p)-1))<<(8-p);
		            d |= this[--i]>>(p+=this.DB-8);
		          }
		          else {
		            d = (this[i]>>(p-=8))&0xff;
		            if(p <= 0) { p += this.DB; --i; }
		          }
		          if((d&0x80) != 0) d |= -256;
		          if(k == 0 && (this.s&0x80) != (d&0x80)) ++k;
		          if(k > 0 || d != this.s) r[k++] = d;
		        }
		      }
		      return r;
		    }

		    function bnEquals(a) { return(this.compareTo(a)==0); }
		    function bnMin(a) { return (this.compareTo(a)<0)?this:a; }
		    function bnMax(a) { return (this.compareTo(a)>0)?this:a; }

		    // (protected) r = this op a (bitwise)
		    function bnpBitwiseTo(a,op,r) {
		      var i, f, m = Math.min(a.t,this.t);
		      for(i = 0; i < m; ++i) r[i] = op(this[i],a[i]);
		      if(a.t < this.t) {
		        f = a.s&this.DM;
		        for(i = m; i < this.t; ++i) r[i] = op(this[i],f);
		        r.t = this.t;
		      }
		      else {
		        f = this.s&this.DM;
		        for(i = m; i < a.t; ++i) r[i] = op(f,a[i]);
		        r.t = a.t;
		      }
		      r.s = op(this.s,a.s);
		      r.clamp();
		    }

		    // (public) this & a
		    function op_and(x,y) { return x&y; }
		    function bnAnd(a) { var r = nbi(); this.bitwiseTo(a,op_and,r); return r; }

		    // (public) this | a
		    function op_or(x,y) { return x|y; }
		    function bnOr(a) { var r = nbi(); this.bitwiseTo(a,op_or,r); return r; }

		    // (public) this ^ a
		    function op_xor(x,y) { return x^y; }
		    function bnXor(a) { var r = nbi(); this.bitwiseTo(a,op_xor,r); return r; }

		    // (public) this & ~a
		    function op_andnot(x,y) { return x&~y; }
		    function bnAndNot(a) { var r = nbi(); this.bitwiseTo(a,op_andnot,r); return r; }

		    // (public) ~this
		    function bnNot() {
		      var r = nbi();
		      for(var i = 0; i < this.t; ++i) r[i] = this.DM&~this[i];
		      r.t = this.t;
		      r.s = ~this.s;
		      return r;
		    }

		    // (public) this << n
		    function bnShiftLeft(n) {
		      var r = nbi();
		      if(n < 0) this.rShiftTo(-n,r); else this.lShiftTo(n,r);
		      return r;
		    }

		    // (public) this >> n
		    function bnShiftRight(n) {
		      var r = nbi();
		      if(n < 0) this.lShiftTo(-n,r); else this.rShiftTo(n,r);
		      return r;
		    }

		    // return index of lowest 1-bit in x, x < 2^31
		    function lbit(x) {
		      if(x == 0) return -1;
		      var r = 0;
		      if((x&0xffff) == 0) { x >>= 16; r += 16; }
		      if((x&0xff) == 0) { x >>= 8; r += 8; }
		      if((x&0xf) == 0) { x >>= 4; r += 4; }
		      if((x&3) == 0) { x >>= 2; r += 2; }
		      if((x&1) == 0) ++r;
		      return r;
		    }

		    // (public) returns index of lowest 1-bit (or -1 if none)
		    function bnGetLowestSetBit() {
		      for(var i = 0; i < this.t; ++i)
		        if(this[i] != 0) return i*this.DB+lbit(this[i]);
		      if(this.s < 0) return this.t*this.DB;
		      return -1;
		    }

		    // return number of 1 bits in x
		    function cbit(x) {
		      var r = 0;
		      while(x != 0) { x &= x-1; ++r; }
		      return r;
		    }

		    // (public) return number of set bits
		    function bnBitCount() {
		      var r = 0, x = this.s&this.DM;
		      for(var i = 0; i < this.t; ++i) r += cbit(this[i]^x);
		      return r;
		    }

		    // (public) true iff nth bit is set
		    function bnTestBit(n) {
		      var j = Math.floor(n/this.DB);
		      if(j >= this.t) return(this.s!=0);
		      return((this[j]&(1<<(n%this.DB)))!=0);
		    }

		    // (protected) this op (1<<n)
		    function bnpChangeBit(n,op) {
		      var r = BigInteger.ONE.shiftLeft(n);
		      this.bitwiseTo(r,op,r);
		      return r;
		    }

		    // (public) this | (1<<n)
		    function bnSetBit(n) { return this.changeBit(n,op_or); }

		    // (public) this & ~(1<<n)
		    function bnClearBit(n) { return this.changeBit(n,op_andnot); }

		    // (public) this ^ (1<<n)
		    function bnFlipBit(n) { return this.changeBit(n,op_xor); }

		    // (protected) r = this + a
		    function bnpAddTo(a,r) {
		      var i = 0, c = 0, m = Math.min(a.t,this.t);
		      while(i < m) {
		        c += this[i]+a[i];
		        r[i++] = c&this.DM;
		        c >>= this.DB;
		      }
		      if(a.t < this.t) {
		        c += a.s;
		        while(i < this.t) {
		          c += this[i];
		          r[i++] = c&this.DM;
		          c >>= this.DB;
		        }
		        c += this.s;
		      }
		      else {
		        c += this.s;
		        while(i < a.t) {
		          c += a[i];
		          r[i++] = c&this.DM;
		          c >>= this.DB;
		        }
		        c += a.s;
		      }
		      r.s = (c<0)?-1:0;
		      if(c > 0) r[i++] = c;
		      else if(c < -1) r[i++] = this.DV+c;
		      r.t = i;
		      r.clamp();
		    }

		    // (public) this + a
		    function bnAdd(a) { var r = nbi(); this.addTo(a,r); return r; }

		    // (public) this - a
		    function bnSubtract(a) { var r = nbi(); this.subTo(a,r); return r; }

		    // (public) this * a
		    function bnMultiply(a) { var r = nbi(); this.multiplyTo(a,r); return r; }

		    // (public) this^2
		    function bnSquare() { var r = nbi(); this.squareTo(r); return r; }

		    // (public) this / a
		    function bnDivide(a) { var r = nbi(); this.divRemTo(a,r,null); return r; }

		    // (public) this % a
		    function bnRemainder(a) { var r = nbi(); this.divRemTo(a,null,r); return r; }

		    // (public) [this/a,this%a]
		    function bnDivideAndRemainder(a) {
		      var q = nbi(), r = nbi();
		      this.divRemTo(a,q,r);
		      return new Array(q,r);
		    }

		    // (protected) this *= n, this >= 0, 1 < n < DV
		    function bnpDMultiply(n) {
		      this[this.t] = this.am(0,n-1,this,0,0,this.t);
		      ++this.t;
		      this.clamp();
		    }

		    // (protected) this += n << w words, this >= 0
		    function bnpDAddOffset(n,w) {
		      if(n == 0) return;
		      while(this.t <= w) this[this.t++] = 0;
		      this[w] += n;
		      while(this[w] >= this.DV) {
		        this[w] -= this.DV;
		        if(++w >= this.t) this[this.t++] = 0;
		        ++this[w];
		      }
		    }

		    // A "null" reducer
		    function NullExp() {}
		    function nNop(x) { return x; }
		    function nMulTo(x,y,r) { x.multiplyTo(y,r); }
		    function nSqrTo(x,r) { x.squareTo(r); }

		    NullExp.prototype.convert = nNop;
		    NullExp.prototype.revert = nNop;
		    NullExp.prototype.mulTo = nMulTo;
		    NullExp.prototype.sqrTo = nSqrTo;

		    // (public) this^e
		    function bnPow(e) { return this.exp(e,new NullExp()); }

		    // (protected) r = lower n words of "this * a", a.t <= n
		    // "this" should be the larger one if appropriate.
		    function bnpMultiplyLowerTo(a,n,r) {
		      var i = Math.min(this.t+a.t,n);
		      r.s = 0; // assumes a,this >= 0
		      r.t = i;
		      while(i > 0) r[--i] = 0;
		      var j;
		      for(j = r.t-this.t; i < j; ++i) r[i+this.t] = this.am(0,a[i],r,i,0,this.t);
		      for(j = Math.min(a.t,n); i < j; ++i) this.am(0,a[i],r,i,0,n-i);
		      r.clamp();
		    }

		    // (protected) r = "this * a" without lower n words, n > 0
		    // "this" should be the larger one if appropriate.
		    function bnpMultiplyUpperTo(a,n,r) {
		      --n;
		      var i = r.t = this.t+a.t-n;
		      r.s = 0; // assumes a,this >= 0
		      while(--i >= 0) r[i] = 0;
		      for(i = Math.max(n-this.t,0); i < a.t; ++i)
		        r[this.t+i-n] = this.am(n-i,a[i],r,0,0,this.t+i-n);
		      r.clamp();
		      r.drShiftTo(1,r);
		    }

		    // Barrett modular reduction
		    function Barrett(m) {
		      // setup Barrett
		      this.r2 = nbi();
		      this.q3 = nbi();
		      BigInteger.ONE.dlShiftTo(2*m.t,this.r2);
		      this.mu = this.r2.divide(m);
		      this.m = m;
		    }

		    function barrettConvert(x) {
		      if(x.s < 0 || x.t > 2*this.m.t) return x.mod(this.m);
		      else if(x.compareTo(this.m) < 0) return x;
		      else { var r = nbi(); x.copyTo(r); this.reduce(r); return r; }
		    }

		    function barrettRevert(x) { return x; }

		    // x = x mod m (HAC 14.42)
		    function barrettReduce(x) {
		      x.drShiftTo(this.m.t-1,this.r2);
		      if(x.t > this.m.t+1) { x.t = this.m.t+1; x.clamp(); }
		      this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);
		      this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);
		      while(x.compareTo(this.r2) < 0) x.dAddOffset(1,this.m.t+1);
		      x.subTo(this.r2,x);
		      while(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
		    }

		    // r = x^2 mod m; x != r
		    function barrettSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

		    // r = x*y mod m; x,y != r
		    function barrettMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

		    Barrett.prototype.convert = barrettConvert;
		    Barrett.prototype.revert = barrettRevert;
		    Barrett.prototype.reduce = barrettReduce;
		    Barrett.prototype.mulTo = barrettMulTo;
		    Barrett.prototype.sqrTo = barrettSqrTo;

		    // (public) this^e % m (HAC 14.85)
		    function bnModPow(e,m) {
		      var i = e.bitLength(), k, r = nbv(1), z;
		      if(i <= 0) return r;
		      else if(i < 18) k = 1;
		      else if(i < 48) k = 3;
		      else if(i < 144) k = 4;
		      else if(i < 768) k = 5;
		      else k = 6;
		      if(i < 8)
		        z = new Classic(m);
		      else if(m.isEven())
		        z = new Barrett(m);
		      else
		        z = new Montgomery(m);

		      // precomputation
		      var g = new Array(), n = 3, k1 = k-1, km = (1<<k)-1;
		      g[1] = z.convert(this);
		      if(k > 1) {
		        var g2 = nbi();
		        z.sqrTo(g[1],g2);
		        while(n <= km) {
		          g[n] = nbi();
		          z.mulTo(g2,g[n-2],g[n]);
		          n += 2;
		        }
		      }

		      var j = e.t-1, w, is1 = true, r2 = nbi(), t;
		      i = nbits(e[j])-1;
		      while(j >= 0) {
		        if(i >= k1) w = (e[j]>>(i-k1))&km;
		        else {
		          w = (e[j]&((1<<(i+1))-1))<<(k1-i);
		          if(j > 0) w |= e[j-1]>>(this.DB+i-k1);
		        }

		        n = k;
		        while((w&1) == 0) { w >>= 1; --n; }
		        if((i -= n) < 0) { i += this.DB; --j; }
		        if(is1) {    // ret == 1, don't bother squaring or multiplying it
		          g[w].copyTo(r);
		          is1 = false;
		        }
		        else {
		          while(n > 1) { z.sqrTo(r,r2); z.sqrTo(r2,r); n -= 2; }
		          if(n > 0) z.sqrTo(r,r2); else { t = r; r = r2; r2 = t; }
		          z.mulTo(r2,g[w],r);
		        }

		        while(j >= 0 && (e[j]&(1<<i)) == 0) {
		          z.sqrTo(r,r2); t = r; r = r2; r2 = t;
		          if(--i < 0) { i = this.DB-1; --j; }
		        }
		      }
		      return z.revert(r);
		    }

		    // (public) gcd(this,a) (HAC 14.54)
		    function bnGCD(a) {
		      var x = (this.s<0)?this.negate():this.clone();
		      var y = (a.s<0)?a.negate():a.clone();
		      if(x.compareTo(y) < 0) { var t = x; x = y; y = t; }
		      var i = x.getLowestSetBit(), g = y.getLowestSetBit();
		      if(g < 0) return x;
		      if(i < g) g = i;
		      if(g > 0) {
		        x.rShiftTo(g,x);
		        y.rShiftTo(g,y);
		      }
		      while(x.signum() > 0) {
		        if((i = x.getLowestSetBit()) > 0) x.rShiftTo(i,x);
		        if((i = y.getLowestSetBit()) > 0) y.rShiftTo(i,y);
		        if(x.compareTo(y) >= 0) {
		          x.subTo(y,x);
		          x.rShiftTo(1,x);
		        }
		        else {
		          y.subTo(x,y);
		          y.rShiftTo(1,y);
		        }
		      }
		      if(g > 0) y.lShiftTo(g,y);
		      return y;
		    }

		    // (protected) this % n, n < 2^26
		    function bnpModInt(n) {
		      if(n <= 0) return 0;
		      var d = this.DV%n, r = (this.s<0)?n-1:0;
		      if(this.t > 0)
		        if(d == 0) r = this[0]%n;
		        else for(var i = this.t-1; i >= 0; --i) r = (d*r+this[i])%n;
		      return r;
		    }

		    // (public) 1/this % m (HAC 14.61)
		    function bnModInverse(m) {
		      var ac = m.isEven();
		      if((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO;
		      var u = m.clone(), v = this.clone();
		      var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
		      while(u.signum() != 0) {
		        while(u.isEven()) {
		          u.rShiftTo(1,u);
		          if(ac) {
		            if(!a.isEven() || !b.isEven()) { a.addTo(this,a); b.subTo(m,b); }
		            a.rShiftTo(1,a);
		          }
		          else if(!b.isEven()) b.subTo(m,b);
		          b.rShiftTo(1,b);
		        }
		        while(v.isEven()) {
		          v.rShiftTo(1,v);
		          if(ac) {
		            if(!c.isEven() || !d.isEven()) { c.addTo(this,c); d.subTo(m,d); }
		            c.rShiftTo(1,c);
		          }
		          else if(!d.isEven()) d.subTo(m,d);
		          d.rShiftTo(1,d);
		        }
		        if(u.compareTo(v) >= 0) {
		          u.subTo(v,u);
		          if(ac) a.subTo(c,a);
		          b.subTo(d,b);
		        }
		        else {
		          v.subTo(u,v);
		          if(ac) c.subTo(a,c);
		          d.subTo(b,d);
		        }
		      }
		      if(v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
		      if(d.compareTo(m) >= 0) return d.subtract(m);
		      if(d.signum() < 0) d.addTo(m,d); else return d;
		      if(d.signum() < 0) return d.add(m); else return d;
		    }

		    var lowprimes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997];
		    var lplim = (1<<26)/lowprimes[lowprimes.length-1];

		    // (public) test primality with certainty >= 1-.5^t
		    function bnIsProbablePrime(t) {
		      var i, x = this.abs();
		      if(x.t == 1 && x[0] <= lowprimes[lowprimes.length-1]) {
		        for(i = 0; i < lowprimes.length; ++i)
		          if(x[0] == lowprimes[i]) return true;
		        return false;
		      }
		      if(x.isEven()) return false;
		      i = 1;
		      while(i < lowprimes.length) {
		        var m = lowprimes[i], j = i+1;
		        while(j < lowprimes.length && m < lplim) m *= lowprimes[j++];
		        m = x.modInt(m);
		        while(i < j) if(m%lowprimes[i++] == 0) return false;
		      }
		      return x.millerRabin(t);
		    }

		    // (protected) true if probably prime (HAC 4.24, Miller-Rabin)
		    function bnpMillerRabin(t) {
		      var n1 = this.subtract(BigInteger.ONE);
		      var k = n1.getLowestSetBit();
		      if(k <= 0) return false;
		      var r = n1.shiftRight(k);
		      t = (t+1)>>1;
		      if(t > lowprimes.length) t = lowprimes.length;
		      var a = nbi();
		      for(var i = 0; i < t; ++i) {
		        //Pick bases at random, instead of starting at 2
		        a.fromInt(lowprimes[Math.floor(Math.random()*lowprimes.length)]);
		        var y = a.modPow(r,this);
		        if(y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
		          var j = 1;
		          while(j++ < k && y.compareTo(n1) != 0) {
		            y = y.modPowInt(2,this);
		            if(y.compareTo(BigInteger.ONE) == 0) return false;
		          }
		          if(y.compareTo(n1) != 0) return false;
		        }
		      }
		      return true;
		    }

		    // protected
		    BigInteger.prototype.chunkSize = bnpChunkSize;
		    BigInteger.prototype.toRadix = bnpToRadix;
		    BigInteger.prototype.fromRadix = bnpFromRadix;
		    BigInteger.prototype.fromNumber = bnpFromNumber;
		    BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
		    BigInteger.prototype.changeBit = bnpChangeBit;
		    BigInteger.prototype.addTo = bnpAddTo;
		    BigInteger.prototype.dMultiply = bnpDMultiply;
		    BigInteger.prototype.dAddOffset = bnpDAddOffset;
		    BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
		    BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
		    BigInteger.prototype.modInt = bnpModInt;
		    BigInteger.prototype.millerRabin = bnpMillerRabin;

		    // public
		    BigInteger.prototype.clone = bnClone;
		    BigInteger.prototype.intValue = bnIntValue;
		    BigInteger.prototype.byteValue = bnByteValue;
		    BigInteger.prototype.shortValue = bnShortValue;
		    BigInteger.prototype.signum = bnSigNum;
		    BigInteger.prototype.toByteArray = bnToByteArray;
		    BigInteger.prototype.equals = bnEquals;
		    BigInteger.prototype.min = bnMin;
		    BigInteger.prototype.max = bnMax;
		    BigInteger.prototype.and = bnAnd;
		    BigInteger.prototype.or = bnOr;
		    BigInteger.prototype.xor = bnXor;
		    BigInteger.prototype.andNot = bnAndNot;
		    BigInteger.prototype.not = bnNot;
		    BigInteger.prototype.shiftLeft = bnShiftLeft;
		    BigInteger.prototype.shiftRight = bnShiftRight;
		    BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
		    BigInteger.prototype.bitCount = bnBitCount;
		    BigInteger.prototype.testBit = bnTestBit;
		    BigInteger.prototype.setBit = bnSetBit;
		    BigInteger.prototype.clearBit = bnClearBit;
		    BigInteger.prototype.flipBit = bnFlipBit;
		    BigInteger.prototype.add = bnAdd;
		    BigInteger.prototype.subtract = bnSubtract;
		    BigInteger.prototype.multiply = bnMultiply;
		    BigInteger.prototype.divide = bnDivide;
		    BigInteger.prototype.remainder = bnRemainder;
		    BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
		    BigInteger.prototype.modPow = bnModPow;
		    BigInteger.prototype.modInverse = bnModInverse;
		    BigInteger.prototype.pow = bnPow;
		    BigInteger.prototype.gcd = bnGCD;
		    BigInteger.prototype.isProbablePrime = bnIsProbablePrime;

		    // JSBN-specific extension
		    BigInteger.prototype.square = bnSquare;

		    // Expose the Barrett function
		    BigInteger.prototype.Barrett = Barrett;

		    // BigInteger interfaces not implemented in jsbn:

		    // BigInteger(int signum, byte[] magnitude)
		    // double doubleValue()
		    // float floatValue()
		    // int hashCode()
		    // long longValue()
		    // static BigInteger valueOf(long val)

		    // Random number generator - requires a PRNG backend, e.g. prng4.js

		    // For best results, put code like
		    // <body onClick='rng_seed_time();' onKeyPress='rng_seed_time();'>
		    // in your main HTML document.

		    var rng_state;
		    var rng_pool;
		    var rng_pptr;

		    // Mix in a 32-bit integer into the pool
		    function rng_seed_int(x) {
		      rng_pool[rng_pptr++] ^= x & 255;
		      rng_pool[rng_pptr++] ^= (x >> 8) & 255;
		      rng_pool[rng_pptr++] ^= (x >> 16) & 255;
		      rng_pool[rng_pptr++] ^= (x >> 24) & 255;
		      if(rng_pptr >= rng_psize) rng_pptr -= rng_psize;
		    }

		    // Mix in the current time (w/milliseconds) into the pool
		    function rng_seed_time() {
		      rng_seed_int(new Date().getTime());
		    }

		    // Initialize the pool with junk if needed.
		    if(rng_pool == null) {
		      rng_pool = new Array();
		      rng_pptr = 0;
		      var t;
		      if(typeof window !== "undefined" && window.crypto) {
		        if (window.crypto.getRandomValues) {
		          // Use webcrypto if available
		          var ua = new Uint8Array(32);
		          window.crypto.getRandomValues(ua);
		          for(t = 0; t < 32; ++t)
		            rng_pool[rng_pptr++] = ua[t];
		        }
		        else if(navigator.appName == "Netscape" && navigator.appVersion < "5") {
		          // Extract entropy (256 bits) from NS4 RNG if available
		          var z = window.crypto.random(32);
		          for(t = 0; t < z.length; ++t)
		            rng_pool[rng_pptr++] = z.charCodeAt(t) & 255;
		        }
		      }
		      while(rng_pptr < rng_psize) {  // extract some randomness from Math.random()
		        t = Math.floor(65536 * Math.random());
		        rng_pool[rng_pptr++] = t >>> 8;
		        rng_pool[rng_pptr++] = t & 255;
		      }
		      rng_pptr = 0;
		      rng_seed_time();
		      //rng_seed_int(window.screenX);
		      //rng_seed_int(window.screenY);
		    }

		    function rng_get_byte() {
		      if(rng_state == null) {
		        rng_seed_time();
		        rng_state = prng_newstate();
		        rng_state.init(rng_pool);
		        for(rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr)
		          rng_pool[rng_pptr] = 0;
		        rng_pptr = 0;
		        //rng_pool = null;
		      }
		      // TODO: allow reseeding after first request
		      return rng_state.next();
		    }

		    function rng_get_bytes(ba) {
		      var i;
		      for(i = 0; i < ba.length; ++i) ba[i] = rng_get_byte();
		    }

		    function SecureRandom() {}

		    SecureRandom.prototype.nextBytes = rng_get_bytes;

		    // prng4.js - uses Arcfour as a PRNG

		    function Arcfour() {
		      this.i = 0;
		      this.j = 0;
		      this.S = new Array();
		    }

		    // Initialize arcfour context from key, an array of ints, each from [0..255]
		    function ARC4init(key) {
		      var i, j, t;
		      for(i = 0; i < 256; ++i)
		        this.S[i] = i;
		      j = 0;
		      for(i = 0; i < 256; ++i) {
		        j = (j + this.S[i] + key[i % key.length]) & 255;
		        t = this.S[i];
		        this.S[i] = this.S[j];
		        this.S[j] = t;
		      }
		      this.i = 0;
		      this.j = 0;
		    }

		    function ARC4next() {
		      var t;
		      this.i = (this.i + 1) & 255;
		      this.j = (this.j + this.S[this.i]) & 255;
		      t = this.S[this.i];
		      this.S[this.i] = this.S[this.j];
		      this.S[this.j] = t;
		      return this.S[(t + this.S[this.i]) & 255];
		    }

		    Arcfour.prototype.init = ARC4init;
		    Arcfour.prototype.next = ARC4next;

		    // Plug in your RNG constructor here
		    function prng_newstate() {
		      return new Arcfour();
		    }

		    // Pool size must be a multiple of 4 and greater than 32.
		    // An array of bytes the size of the pool will be passed to init()
		    var rng_psize = 256;

		    {
		        module.exports = {
		            default: BigInteger,
		            BigInteger: BigInteger,
		            SecureRandom: SecureRandom,
		        };
		    }

		}).call(jsbn); 
	} (jsbn$1));
	return jsbn$1.exports;
}

var sprintf = {};

/* global window, exports, define */

var hasRequiredSprintf;

function requireSprintf () {
	if (hasRequiredSprintf) return sprintf;
	hasRequiredSprintf = 1;
	(function (exports) {
		!function() {

		    var re = {
		        not_type: /[^T]/,
		        not_primitive: /[^v]/,
		        number: /[diefg]/,
		        numeric_arg: /[bcdiefguxX]/,
		        json: /[j]/,
		        text: /^[^\x25]+/,
		        modulo: /^\x25{2}/,
		        placeholder: /^\x25(?:([1-9]\d*)\$|\(([^)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijostTuvxX])/,
		        key: /^([a-z_][a-z_\d]*)/i,
		        key_access: /^\.([a-z_][a-z_\d]*)/i,
		        index_access: /^\[(\d+)\]/,
		        sign: /^[+-]/
		    };

		    function sprintf(key) {
		        // `arguments` is not an array, but should be fine for this call
		        return sprintf_format(sprintf_parse(key), arguments)
		    }

		    function vsprintf(fmt, argv) {
		        return sprintf.apply(null, [fmt].concat(argv || []))
		    }

		    function sprintf_format(parse_tree, argv) {
		        var cursor = 1, tree_length = parse_tree.length, arg, output = '', i, k, ph, pad, pad_character, pad_length, is_positive, sign;
		        for (i = 0; i < tree_length; i++) {
		            if (typeof parse_tree[i] === 'string') {
		                output += parse_tree[i];
		            }
		            else if (typeof parse_tree[i] === 'object') {
		                ph = parse_tree[i]; // convenience purposes only
		                if (ph.keys) { // keyword argument
		                    arg = argv[cursor];
		                    for (k = 0; k < ph.keys.length; k++) {
		                        if (arg == undefined) {
		                            throw new Error(sprintf('[sprintf] Cannot access property "%s" of undefined value "%s"', ph.keys[k], ph.keys[k-1]))
		                        }
		                        arg = arg[ph.keys[k]];
		                    }
		                }
		                else if (ph.param_no) { // positional argument (explicit)
		                    arg = argv[ph.param_no];
		                }
		                else { // positional argument (implicit)
		                    arg = argv[cursor++];
		                }

		                if (re.not_type.test(ph.type) && re.not_primitive.test(ph.type) && arg instanceof Function) {
		                    arg = arg();
		                }

		                if (re.numeric_arg.test(ph.type) && (typeof arg !== 'number' && isNaN(arg))) {
		                    throw new TypeError(sprintf('[sprintf] expecting number but found %T', arg))
		                }

		                if (re.number.test(ph.type)) {
		                    is_positive = arg >= 0;
		                }

		                switch (ph.type) {
		                    case 'b':
		                        arg = parseInt(arg, 10).toString(2);
		                        break
		                    case 'c':
		                        arg = String.fromCharCode(parseInt(arg, 10));
		                        break
		                    case 'd':
		                    case 'i':
		                        arg = parseInt(arg, 10);
		                        break
		                    case 'j':
		                        arg = JSON.stringify(arg, null, ph.width ? parseInt(ph.width) : 0);
		                        break
		                    case 'e':
		                        arg = ph.precision ? parseFloat(arg).toExponential(ph.precision) : parseFloat(arg).toExponential();
		                        break
		                    case 'f':
		                        arg = ph.precision ? parseFloat(arg).toFixed(ph.precision) : parseFloat(arg);
		                        break
		                    case 'g':
		                        arg = ph.precision ? String(Number(arg.toPrecision(ph.precision))) : parseFloat(arg);
		                        break
		                    case 'o':
		                        arg = (parseInt(arg, 10) >>> 0).toString(8);
		                        break
		                    case 's':
		                        arg = String(arg);
		                        arg = (ph.precision ? arg.substring(0, ph.precision) : arg);
		                        break
		                    case 't':
		                        arg = String(!!arg);
		                        arg = (ph.precision ? arg.substring(0, ph.precision) : arg);
		                        break
		                    case 'T':
		                        arg = Object.prototype.toString.call(arg).slice(8, -1).toLowerCase();
		                        arg = (ph.precision ? arg.substring(0, ph.precision) : arg);
		                        break
		                    case 'u':
		                        arg = parseInt(arg, 10) >>> 0;
		                        break
		                    case 'v':
		                        arg = arg.valueOf();
		                        arg = (ph.precision ? arg.substring(0, ph.precision) : arg);
		                        break
		                    case 'x':
		                        arg = (parseInt(arg, 10) >>> 0).toString(16);
		                        break
		                    case 'X':
		                        arg = (parseInt(arg, 10) >>> 0).toString(16).toUpperCase();
		                        break
		                }
		                if (re.json.test(ph.type)) {
		                    output += arg;
		                }
		                else {
		                    if (re.number.test(ph.type) && (!is_positive || ph.sign)) {
		                        sign = is_positive ? '+' : '-';
		                        arg = arg.toString().replace(re.sign, '');
		                    }
		                    else {
		                        sign = '';
		                    }
		                    pad_character = ph.pad_char ? ph.pad_char === '0' ? '0' : ph.pad_char.charAt(1) : ' ';
		                    pad_length = ph.width - (sign + arg).length;
		                    pad = ph.width ? (pad_length > 0 ? pad_character.repeat(pad_length) : '') : '';
		                    output += ph.align ? sign + arg + pad : (pad_character === '0' ? sign + pad + arg : pad + sign + arg);
		                }
		            }
		        }
		        return output
		    }

		    var sprintf_cache = Object.create(null);

		    function sprintf_parse(fmt) {
		        if (sprintf_cache[fmt]) {
		            return sprintf_cache[fmt]
		        }

		        var _fmt = fmt, match, parse_tree = [], arg_names = 0;
		        while (_fmt) {
		            if ((match = re.text.exec(_fmt)) !== null) {
		                parse_tree.push(match[0]);
		            }
		            else if ((match = re.modulo.exec(_fmt)) !== null) {
		                parse_tree.push('%');
		            }
		            else if ((match = re.placeholder.exec(_fmt)) !== null) {
		                if (match[2]) {
		                    arg_names |= 1;
		                    var field_list = [], replacement_field = match[2], field_match = [];
		                    if ((field_match = re.key.exec(replacement_field)) !== null) {
		                        field_list.push(field_match[1]);
		                        while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
		                            if ((field_match = re.key_access.exec(replacement_field)) !== null) {
		                                field_list.push(field_match[1]);
		                            }
		                            else if ((field_match = re.index_access.exec(replacement_field)) !== null) {
		                                field_list.push(field_match[1]);
		                            }
		                            else {
		                                throw new SyntaxError('[sprintf] failed to parse named argument key')
		                            }
		                        }
		                    }
		                    else {
		                        throw new SyntaxError('[sprintf] failed to parse named argument key')
		                    }
		                    match[2] = field_list;
		                }
		                else {
		                    arg_names |= 2;
		                }
		                if (arg_names === 3) {
		                    throw new Error('[sprintf] mixing positional and named placeholders is not (yet) supported')
		                }

		                parse_tree.push(
		                    {
		                        placeholder: match[0],
		                        param_no:    match[1],
		                        keys:        match[2],
		                        sign:        match[3],
		                        pad_char:    match[4],
		                        align:       match[5],
		                        width:       match[6],
		                        precision:   match[7],
		                        type:        match[8]
		                    }
		                );
		            }
		            else {
		                throw new SyntaxError('[sprintf] unexpected placeholder')
		            }
		            _fmt = _fmt.substring(match[0].length);
		        }
		        return sprintf_cache[fmt] = parse_tree
		    }

		    /**
		     * export to either browser or node.js
		     */
		    /* eslint-disable quote-props */
		    {
		        exports['sprintf'] = sprintf;
		        exports['vsprintf'] = vsprintf;
		    }
		    if (typeof window !== 'undefined') {
		        window['sprintf'] = sprintf;
		        window['vsprintf'] = vsprintf;
		    }
		    /* eslint-enable quote-props */
		}(); // eslint-disable-line 
	} (sprintf));
	return sprintf;
}

var hasRequiredIpv4;

function requireIpv4 () {
	if (hasRequiredIpv4) return ipv4;
	hasRequiredIpv4 = 1;
	/* eslint-disable no-param-reassign */
	var __createBinding = (ipv4 && ipv4.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (ipv4 && ipv4.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (ipv4 && ipv4.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(ipv4, "__esModule", { value: true });
	ipv4.Address4 = void 0;
	const common = __importStar(requireCommon$1());
	const constants = __importStar(requireConstants$1());
	const address_error_1 = requireAddressError();
	const jsbn_1 = requireJsbn();
	const sprintf_js_1 = requireSprintf();
	/**
	 * Represents an IPv4 address
	 * @class Address4
	 * @param {string} address - An IPv4 address string
	 */
	class Address4 {
	    constructor(address) {
	        this.groups = constants.GROUPS;
	        this.parsedAddress = [];
	        this.parsedSubnet = '';
	        this.subnet = '/32';
	        this.subnetMask = 32;
	        this.v4 = true;
	        /**
	         * Returns true if the address is correct, false otherwise
	         * @memberof Address4
	         * @instance
	         * @returns {Boolean}
	         */
	        this.isCorrect = common.isCorrect(constants.BITS);
	        /**
	         * Returns true if the given address is in the subnet of the current address
	         * @memberof Address4
	         * @instance
	         * @returns {boolean}
	         */
	        this.isInSubnet = common.isInSubnet;
	        this.address = address;
	        const subnet = constants.RE_SUBNET_STRING.exec(address);
	        if (subnet) {
	            this.parsedSubnet = subnet[0].replace('/', '');
	            this.subnetMask = parseInt(this.parsedSubnet, 10);
	            this.subnet = `/${this.subnetMask}`;
	            if (this.subnetMask < 0 || this.subnetMask > constants.BITS) {
	                throw new address_error_1.AddressError('Invalid subnet mask.');
	            }
	            address = address.replace(constants.RE_SUBNET_STRING, '');
	        }
	        this.addressMinusSuffix = address;
	        this.parsedAddress = this.parse(address);
	    }
	    static isValid(address) {
	        try {
	            // eslint-disable-next-line no-new
	            new Address4(address);
	            return true;
	        }
	        catch (e) {
	            return false;
	        }
	    }
	    /*
	     * Parses a v4 address
	     */
	    parse(address) {
	        const groups = address.split('.');
	        if (!address.match(constants.RE_ADDRESS)) {
	            throw new address_error_1.AddressError('Invalid IPv4 address.');
	        }
	        return groups;
	    }
	    /**
	     * Returns the correct form of an address
	     * @memberof Address4
	     * @instance
	     * @returns {String}
	     */
	    correctForm() {
	        return this.parsedAddress.map((part) => parseInt(part, 10)).join('.');
	    }
	    /**
	     * Converts a hex string to an IPv4 address object
	     * @memberof Address4
	     * @static
	     * @param {string} hex - a hex string to convert
	     * @returns {Address4}
	     */
	    static fromHex(hex) {
	        const padded = hex.replace(/:/g, '').padStart(8, '0');
	        const groups = [];
	        let i;
	        for (i = 0; i < 8; i += 2) {
	            const h = padded.slice(i, i + 2);
	            groups.push(parseInt(h, 16));
	        }
	        return new Address4(groups.join('.'));
	    }
	    /**
	     * Converts an integer into a IPv4 address object
	     * @memberof Address4
	     * @static
	     * @param {integer} integer - a number to convert
	     * @returns {Address4}
	     */
	    static fromInteger(integer) {
	        return Address4.fromHex(integer.toString(16));
	    }
	    /**
	     * Return an address from in-addr.arpa form
	     * @memberof Address4
	     * @static
	     * @param {string} arpaFormAddress - an 'in-addr.arpa' form ipv4 address
	     * @returns {Adress4}
	     * @example
	     * var address = Address4.fromArpa(42.2.0.192.in-addr.arpa.)
	     * address.correctForm(); // '192.0.2.42'
	     */
	    static fromArpa(arpaFormAddress) {
	        // remove ending ".in-addr.arpa." or just "."
	        const leader = arpaFormAddress.replace(/(\.in-addr\.arpa)?\.$/, '');
	        const address = leader.split('.').reverse().join('.');
	        return new Address4(address);
	    }
	    /**
	     * Converts an IPv4 address object to a hex string
	     * @memberof Address4
	     * @instance
	     * @returns {String}
	     */
	    toHex() {
	        return this.parsedAddress.map((part) => (0, sprintf_js_1.sprintf)('%02x', parseInt(part, 10))).join(':');
	    }
	    /**
	     * Converts an IPv4 address object to an array of bytes
	     * @memberof Address4
	     * @instance
	     * @returns {Array}
	     */
	    toArray() {
	        return this.parsedAddress.map((part) => parseInt(part, 10));
	    }
	    /**
	     * Converts an IPv4 address object to an IPv6 address group
	     * @memberof Address4
	     * @instance
	     * @returns {String}
	     */
	    toGroup6() {
	        const output = [];
	        let i;
	        for (i = 0; i < constants.GROUPS; i += 2) {
	            const hex = (0, sprintf_js_1.sprintf)('%02x%02x', parseInt(this.parsedAddress[i], 10), parseInt(this.parsedAddress[i + 1], 10));
	            output.push((0, sprintf_js_1.sprintf)('%x', parseInt(hex, 16)));
	        }
	        return output.join(':');
	    }
	    /**
	     * Returns the address as a BigInteger
	     * @memberof Address4
	     * @instance
	     * @returns {BigInteger}
	     */
	    bigInteger() {
	        return new jsbn_1.BigInteger(this.parsedAddress.map((n) => (0, sprintf_js_1.sprintf)('%02x', parseInt(n, 10))).join(''), 16);
	    }
	    /**
	     * Helper function getting start address.
	     * @memberof Address4
	     * @instance
	     * @returns {BigInteger}
	     */
	    _startAddress() {
	        return new jsbn_1.BigInteger(this.mask() + '0'.repeat(constants.BITS - this.subnetMask), 2);
	    }
	    /**
	     * The first address in the range given by this address' subnet.
	     * Often referred to as the Network Address.
	     * @memberof Address4
	     * @instance
	     * @returns {Address4}
	     */
	    startAddress() {
	        return Address4.fromBigInteger(this._startAddress());
	    }
	    /**
	     * The first host address in the range given by this address's subnet ie
	     * the first address after the Network Address
	     * @memberof Address4
	     * @instance
	     * @returns {Address4}
	     */
	    startAddressExclusive() {
	        const adjust = new jsbn_1.BigInteger('1');
	        return Address4.fromBigInteger(this._startAddress().add(adjust));
	    }
	    /**
	     * Helper function getting end address.
	     * @memberof Address4
	     * @instance
	     * @returns {BigInteger}
	     */
	    _endAddress() {
	        return new jsbn_1.BigInteger(this.mask() + '1'.repeat(constants.BITS - this.subnetMask), 2);
	    }
	    /**
	     * The last address in the range given by this address' subnet
	     * Often referred to as the Broadcast
	     * @memberof Address4
	     * @instance
	     * @returns {Address4}
	     */
	    endAddress() {
	        return Address4.fromBigInteger(this._endAddress());
	    }
	    /**
	     * The last host address in the range given by this address's subnet ie
	     * the last address prior to the Broadcast Address
	     * @memberof Address4
	     * @instance
	     * @returns {Address4}
	     */
	    endAddressExclusive() {
	        const adjust = new jsbn_1.BigInteger('1');
	        return Address4.fromBigInteger(this._endAddress().subtract(adjust));
	    }
	    /**
	     * Converts a BigInteger to a v4 address object
	     * @memberof Address4
	     * @static
	     * @param {BigInteger} bigInteger - a BigInteger to convert
	     * @returns {Address4}
	     */
	    static fromBigInteger(bigInteger) {
	        return Address4.fromInteger(parseInt(bigInteger.toString(), 10));
	    }
	    /**
	     * Returns the first n bits of the address, defaulting to the
	     * subnet mask
	     * @memberof Address4
	     * @instance
	     * @returns {String}
	     */
	    mask(mask) {
	        if (mask === undefined) {
	            mask = this.subnetMask;
	        }
	        return this.getBitsBase2(0, mask);
	    }
	    /**
	     * Returns the bits in the given range as a base-2 string
	     * @memberof Address4
	     * @instance
	     * @returns {string}
	     */
	    getBitsBase2(start, end) {
	        return this.binaryZeroPad().slice(start, end);
	    }
	    /**
	     * Return the reversed ip6.arpa form of the address
	     * @memberof Address4
	     * @param {Object} options
	     * @param {boolean} options.omitSuffix - omit the "in-addr.arpa" suffix
	     * @instance
	     * @returns {String}
	     */
	    reverseForm(options) {
	        if (!options) {
	            options = {};
	        }
	        const reversed = this.correctForm().split('.').reverse().join('.');
	        if (options.omitSuffix) {
	            return reversed;
	        }
	        return (0, sprintf_js_1.sprintf)('%s.in-addr.arpa.', reversed);
	    }
	    /**
	     * Returns true if the given address is a multicast address
	     * @memberof Address4
	     * @instance
	     * @returns {boolean}
	     */
	    isMulticast() {
	        return this.isInSubnet(new Address4('224.0.0.0/4'));
	    }
	    /**
	     * Returns a zero-padded base-2 string representation of the address
	     * @memberof Address4
	     * @instance
	     * @returns {string}
	     */
	    binaryZeroPad() {
	        return this.bigInteger().toString(2).padStart(constants.BITS, '0');
	    }
	    /**
	     * Groups an IPv4 address for inclusion at the end of an IPv6 address
	     * @returns {String}
	     */
	    groupForV6() {
	        const segments = this.parsedAddress;
	        return this.address.replace(constants.RE_ADDRESS, (0, sprintf_js_1.sprintf)('<span class="hover-group group-v4 group-6">%s</span>.<span class="hover-group group-v4 group-7">%s</span>', segments.slice(0, 2).join('.'), segments.slice(2, 4).join('.')));
	    }
	}
	ipv4.Address4 = Address4;
	
	return ipv4;
}

var ipv6 = {};

var constants = {};

var hasRequiredConstants;

function requireConstants () {
	if (hasRequiredConstants) return constants;
	hasRequiredConstants = 1;
	Object.defineProperty(constants, "__esModule", { value: true });
	constants.RE_URL_WITH_PORT = constants.RE_URL = constants.RE_ZONE_STRING = constants.RE_SUBNET_STRING = constants.RE_BAD_ADDRESS = constants.RE_BAD_CHARACTERS = constants.TYPES = constants.SCOPES = constants.GROUPS = constants.BITS = void 0;
	constants.BITS = 128;
	constants.GROUPS = 8;
	/**
	 * Represents IPv6 address scopes
	 * @memberof Address6
	 * @static
	 */
	constants.SCOPES = {
	    0: 'Reserved',
	    1: 'Interface local',
	    2: 'Link local',
	    4: 'Admin local',
	    5: 'Site local',
	    8: 'Organization local',
	    14: 'Global',
	    15: 'Reserved',
	};
	/**
	 * Represents IPv6 address types
	 * @memberof Address6
	 * @static
	 */
	constants.TYPES = {
	    'ff01::1/128': 'Multicast (All nodes on this interface)',
	    'ff01::2/128': 'Multicast (All routers on this interface)',
	    'ff02::1/128': 'Multicast (All nodes on this link)',
	    'ff02::2/128': 'Multicast (All routers on this link)',
	    'ff05::2/128': 'Multicast (All routers in this site)',
	    'ff02::5/128': 'Multicast (OSPFv3 AllSPF routers)',
	    'ff02::6/128': 'Multicast (OSPFv3 AllDR routers)',
	    'ff02::9/128': 'Multicast (RIP routers)',
	    'ff02::a/128': 'Multicast (EIGRP routers)',
	    'ff02::d/128': 'Multicast (PIM routers)',
	    'ff02::16/128': 'Multicast (MLDv2 reports)',
	    'ff01::fb/128': 'Multicast (mDNSv6)',
	    'ff02::fb/128': 'Multicast (mDNSv6)',
	    'ff05::fb/128': 'Multicast (mDNSv6)',
	    'ff02::1:2/128': 'Multicast (All DHCP servers and relay agents on this link)',
	    'ff05::1:2/128': 'Multicast (All DHCP servers and relay agents in this site)',
	    'ff02::1:3/128': 'Multicast (All DHCP servers on this link)',
	    'ff05::1:3/128': 'Multicast (All DHCP servers in this site)',
	    '::/128': 'Unspecified',
	    '::1/128': 'Loopback',
	    'ff00::/8': 'Multicast',
	    'fe80::/10': 'Link-local unicast',
	};
	/**
	 * A regular expression that matches bad characters in an IPv6 address
	 * @memberof Address6
	 * @static
	 */
	constants.RE_BAD_CHARACTERS = /([^0-9a-f:/%])/gi;
	/**
	 * A regular expression that matches an incorrect IPv6 address
	 * @memberof Address6
	 * @static
	 */
	constants.RE_BAD_ADDRESS = /([0-9a-f]{5,}|:{3,}|[^:]:$|^:[^:]|\/$)/gi;
	/**
	 * A regular expression that matches an IPv6 subnet
	 * @memberof Address6
	 * @static
	 */
	constants.RE_SUBNET_STRING = /\/\d{1,3}(?=%|$)/;
	/**
	 * A regular expression that matches an IPv6 zone
	 * @memberof Address6
	 * @static
	 */
	constants.RE_ZONE_STRING = /%.*$/;
	constants.RE_URL = new RegExp(/^\[{0,1}([0-9a-f:]+)\]{0,1}/);
	constants.RE_URL_WITH_PORT = new RegExp(/\[([0-9a-f:]+)\]:([0-9]{1,5})/);
	
	return constants;
}

var helpers$1 = {};

var hasRequiredHelpers$2;

function requireHelpers$2 () {
	if (hasRequiredHelpers$2) return helpers$1;
	hasRequiredHelpers$2 = 1;
	Object.defineProperty(helpers$1, "__esModule", { value: true });
	helpers$1.simpleGroup = helpers$1.spanLeadingZeroes = helpers$1.spanAll = helpers$1.spanAllZeroes = void 0;
	const sprintf_js_1 = requireSprintf();
	/**
	 * @returns {String} the string with all zeroes contained in a <span>
	 */
	function spanAllZeroes(s) {
	    return s.replace(/(0+)/g, '<span class="zero">$1</span>');
	}
	helpers$1.spanAllZeroes = spanAllZeroes;
	/**
	 * @returns {String} the string with each character contained in a <span>
	 */
	function spanAll(s, offset = 0) {
	    const letters = s.split('');
	    return letters
	        .map((n, i) => (0, sprintf_js_1.sprintf)('<span class="digit value-%s position-%d">%s</span>', n, i + offset, spanAllZeroes(n)) // XXX Use #base-2 .value-0 instead?
	    )
	        .join('');
	}
	helpers$1.spanAll = spanAll;
	function spanLeadingZeroesSimple(group) {
	    return group.replace(/^(0+)/, '<span class="zero">$1</span>');
	}
	/**
	 * @returns {String} the string with leading zeroes contained in a <span>
	 */
	function spanLeadingZeroes(address) {
	    const groups = address.split(':');
	    return groups.map((g) => spanLeadingZeroesSimple(g)).join(':');
	}
	helpers$1.spanLeadingZeroes = spanLeadingZeroes;
	/**
	 * Groups an address
	 * @returns {String} a grouped address
	 */
	function simpleGroup(addressString, offset = 0) {
	    const groups = addressString.split(':');
	    return groups.map((g, i) => {
	        if (/group-v4/.test(g)) {
	            return g;
	        }
	        return (0, sprintf_js_1.sprintf)('<span class="hover-group group-%d">%s</span>', i + offset, spanLeadingZeroesSimple(g));
	    });
	}
	helpers$1.simpleGroup = simpleGroup;
	
	return helpers$1;
}

var regularExpressions = {};

var hasRequiredRegularExpressions;

function requireRegularExpressions () {
	if (hasRequiredRegularExpressions) return regularExpressions;
	hasRequiredRegularExpressions = 1;
	var __createBinding = (regularExpressions && regularExpressions.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (regularExpressions && regularExpressions.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (regularExpressions && regularExpressions.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(regularExpressions, "__esModule", { value: true });
	regularExpressions.possibleElisions = regularExpressions.simpleRegularExpression = regularExpressions.ADDRESS_BOUNDARY = regularExpressions.padGroup = regularExpressions.groupPossibilities = void 0;
	const v6 = __importStar(requireConstants());
	const sprintf_js_1 = requireSprintf();
	function groupPossibilities(possibilities) {
	    return (0, sprintf_js_1.sprintf)('(%s)', possibilities.join('|'));
	}
	regularExpressions.groupPossibilities = groupPossibilities;
	function padGroup(group) {
	    if (group.length < 4) {
	        return (0, sprintf_js_1.sprintf)('0{0,%d}%s', 4 - group.length, group);
	    }
	    return group;
	}
	regularExpressions.padGroup = padGroup;
	regularExpressions.ADDRESS_BOUNDARY = '[^A-Fa-f0-9:]';
	function simpleRegularExpression(groups) {
	    const zeroIndexes = [];
	    groups.forEach((group, i) => {
	        const groupInteger = parseInt(group, 16);
	        if (groupInteger === 0) {
	            zeroIndexes.push(i);
	        }
	    });
	    // You can technically elide a single 0, this creates the regular expressions
	    // to match that eventuality
	    const possibilities = zeroIndexes.map((zeroIndex) => groups
	        .map((group, i) => {
	        if (i === zeroIndex) {
	            const elision = i === 0 || i === v6.GROUPS - 1 ? ':' : '';
	            return groupPossibilities([padGroup(group), elision]);
	        }
	        return padGroup(group);
	    })
	        .join(':'));
	    // The simplest case
	    possibilities.push(groups.map(padGroup).join(':'));
	    return groupPossibilities(possibilities);
	}
	regularExpressions.simpleRegularExpression = simpleRegularExpression;
	function possibleElisions(elidedGroups, moreLeft, moreRight) {
	    const left = moreLeft ? '' : ':';
	    const right = moreRight ? '' : ':';
	    const possibilities = [];
	    // 1. elision of everything (::)
	    if (!moreLeft && !moreRight) {
	        possibilities.push('::');
	    }
	    // 2. complete elision of the middle
	    if (moreLeft && moreRight) {
	        possibilities.push('');
	    }
	    if ((moreRight && !moreLeft) || (!moreRight && moreLeft)) {
	        // 3. complete elision of one side
	        possibilities.push(':');
	    }
	    // 4. elision from the left side
	    possibilities.push((0, sprintf_js_1.sprintf)('%s(:0{1,4}){1,%d}', left, elidedGroups - 1));
	    // 5. elision from the right side
	    possibilities.push((0, sprintf_js_1.sprintf)('(0{1,4}:){1,%d}%s', elidedGroups - 1, right));
	    // 6. no elision
	    possibilities.push((0, sprintf_js_1.sprintf)('(0{1,4}:){%d}0{1,4}', elidedGroups - 1));
	    // 7. elision (including sloppy elision) from the middle
	    for (let groups = 1; groups < elidedGroups - 1; groups++) {
	        for (let position = 1; position < elidedGroups - groups; position++) {
	            possibilities.push((0, sprintf_js_1.sprintf)('(0{1,4}:){%d}:(0{1,4}:){%d}0{1,4}', position, elidedGroups - position - groups - 1));
	        }
	    }
	    return groupPossibilities(possibilities);
	}
	regularExpressions.possibleElisions = possibleElisions;
	
	return regularExpressions;
}

var hasRequiredIpv6;

function requireIpv6 () {
	if (hasRequiredIpv6) return ipv6;
	hasRequiredIpv6 = 1;
	/* eslint-disable prefer-destructuring */
	/* eslint-disable no-param-reassign */
	var __createBinding = (ipv6 && ipv6.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (ipv6 && ipv6.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (ipv6 && ipv6.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(ipv6, "__esModule", { value: true });
	ipv6.Address6 = void 0;
	const common = __importStar(requireCommon$1());
	const constants4 = __importStar(requireConstants$1());
	const constants6 = __importStar(requireConstants());
	const helpers = __importStar(requireHelpers$2());
	const ipv4_1 = requireIpv4();
	const regular_expressions_1 = requireRegularExpressions();
	const address_error_1 = requireAddressError();
	const jsbn_1 = requireJsbn();
	const sprintf_js_1 = requireSprintf();
	function assert(condition) {
	    if (!condition) {
	        throw new Error('Assertion failed.');
	    }
	}
	function addCommas(number) {
	    const r = /(\d+)(\d{3})/;
	    while (r.test(number)) {
	        number = number.replace(r, '$1,$2');
	    }
	    return number;
	}
	function spanLeadingZeroes4(n) {
	    n = n.replace(/^(0{1,})([1-9]+)$/, '<span class="parse-error">$1</span>$2');
	    n = n.replace(/^(0{1,})(0)$/, '<span class="parse-error">$1</span>$2');
	    return n;
	}
	/*
	 * A helper function to compact an array
	 */
	function compact(address, slice) {
	    const s1 = [];
	    const s2 = [];
	    let i;
	    for (i = 0; i < address.length; i++) {
	        if (i < slice[0]) {
	            s1.push(address[i]);
	        }
	        else if (i > slice[1]) {
	            s2.push(address[i]);
	        }
	    }
	    return s1.concat(['compact']).concat(s2);
	}
	function paddedHex(octet) {
	    return (0, sprintf_js_1.sprintf)('%04x', parseInt(octet, 16));
	}
	function unsignByte(b) {
	    // eslint-disable-next-line no-bitwise
	    return b & 0xff;
	}
	/**
	 * Represents an IPv6 address
	 * @class Address6
	 * @param {string} address - An IPv6 address string
	 * @param {number} [groups=8] - How many octets to parse
	 * @example
	 * var address = new Address6('2001::/32');
	 */
	class Address6 {
	    constructor(address, optionalGroups) {
	        this.addressMinusSuffix = '';
	        this.parsedSubnet = '';
	        this.subnet = '/128';
	        this.subnetMask = 128;
	        this.v4 = false;
	        this.zone = '';
	        // #region Attributes
	        /**
	         * Returns true if the given address is in the subnet of the current address
	         * @memberof Address6
	         * @instance
	         * @returns {boolean}
	         */
	        this.isInSubnet = common.isInSubnet;
	        /**
	         * Returns true if the address is correct, false otherwise
	         * @memberof Address6
	         * @instance
	         * @returns {boolean}
	         */
	        this.isCorrect = common.isCorrect(constants6.BITS);
	        if (optionalGroups === undefined) {
	            this.groups = constants6.GROUPS;
	        }
	        else {
	            this.groups = optionalGroups;
	        }
	        this.address = address;
	        const subnet = constants6.RE_SUBNET_STRING.exec(address);
	        if (subnet) {
	            this.parsedSubnet = subnet[0].replace('/', '');
	            this.subnetMask = parseInt(this.parsedSubnet, 10);
	            this.subnet = `/${this.subnetMask}`;
	            if (Number.isNaN(this.subnetMask) ||
	                this.subnetMask < 0 ||
	                this.subnetMask > constants6.BITS) {
	                throw new address_error_1.AddressError('Invalid subnet mask.');
	            }
	            address = address.replace(constants6.RE_SUBNET_STRING, '');
	        }
	        else if (/\//.test(address)) {
	            throw new address_error_1.AddressError('Invalid subnet mask.');
	        }
	        const zone = constants6.RE_ZONE_STRING.exec(address);
	        if (zone) {
	            this.zone = zone[0];
	            address = address.replace(constants6.RE_ZONE_STRING, '');
	        }
	        this.addressMinusSuffix = address;
	        this.parsedAddress = this.parse(this.addressMinusSuffix);
	    }
	    static isValid(address) {
	        try {
	            // eslint-disable-next-line no-new
	            new Address6(address);
	            return true;
	        }
	        catch (e) {
	            return false;
	        }
	    }
	    /**
	     * Convert a BigInteger to a v6 address object
	     * @memberof Address6
	     * @static
	     * @param {BigInteger} bigInteger - a BigInteger to convert
	     * @returns {Address6}
	     * @example
	     * var bigInteger = new BigInteger('1000000000000');
	     * var address = Address6.fromBigInteger(bigInteger);
	     * address.correctForm(); // '::e8:d4a5:1000'
	     */
	    static fromBigInteger(bigInteger) {
	        const hex = bigInteger.toString(16).padStart(32, '0');
	        const groups = [];
	        let i;
	        for (i = 0; i < constants6.GROUPS; i++) {
	            groups.push(hex.slice(i * 4, (i + 1) * 4));
	        }
	        return new Address6(groups.join(':'));
	    }
	    /**
	     * Convert a URL (with optional port number) to an address object
	     * @memberof Address6
	     * @static
	     * @param {string} url - a URL with optional port number
	     * @example
	     * var addressAndPort = Address6.fromURL('http://[ffff::]:8080/foo/');
	     * addressAndPort.address.correctForm(); // 'ffff::'
	     * addressAndPort.port; // 8080
	     */
	    static fromURL(url) {
	        let host;
	        let port = null;
	        let result;
	        // If we have brackets parse them and find a port
	        if (url.indexOf('[') !== -1 && url.indexOf(']:') !== -1) {
	            result = constants6.RE_URL_WITH_PORT.exec(url);
	            if (result === null) {
	                return {
	                    error: 'failed to parse address with port',
	                    address: null,
	                    port: null,
	                };
	            }
	            host = result[1];
	            port = result[2];
	            // If there's a URL extract the address
	        }
	        else if (url.indexOf('/') !== -1) {
	            // Remove the protocol prefix
	            url = url.replace(/^[a-z0-9]+:\/\//, '');
	            // Parse the address
	            result = constants6.RE_URL.exec(url);
	            if (result === null) {
	                return {
	                    error: 'failed to parse address from URL',
	                    address: null,
	                    port: null,
	                };
	            }
	            host = result[1];
	            // Otherwise just assign the URL to the host and let the library parse it
	        }
	        else {
	            host = url;
	        }
	        // If there's a port convert it to an integer
	        if (port) {
	            port = parseInt(port, 10);
	            // squelch out of range ports
	            if (port < 0 || port > 65536) {
	                port = null;
	            }
	        }
	        else {
	            // Standardize `undefined` to `null`
	            port = null;
	        }
	        return {
	            address: new Address6(host),
	            port,
	        };
	    }
	    /**
	     * Create an IPv6-mapped address given an IPv4 address
	     * @memberof Address6
	     * @static
	     * @param {string} address - An IPv4 address string
	     * @returns {Address6}
	     * @example
	     * var address = Address6.fromAddress4('192.168.0.1');
	     * address.correctForm(); // '::ffff:c0a8:1'
	     * address.to4in6(); // '::ffff:192.168.0.1'
	     */
	    static fromAddress4(address) {
	        const address4 = new ipv4_1.Address4(address);
	        const mask6 = constants6.BITS - (constants4.BITS - address4.subnetMask);
	        return new Address6(`::ffff:${address4.correctForm()}/${mask6}`);
	    }
	    /**
	     * Return an address from ip6.arpa form
	     * @memberof Address6
	     * @static
	     * @param {string} arpaFormAddress - an 'ip6.arpa' form address
	     * @returns {Adress6}
	     * @example
	     * var address = Address6.fromArpa(e.f.f.f.3.c.2.6.f.f.f.e.6.6.8.e.1.0.6.7.9.4.e.c.0.0.0.0.1.0.0.2.ip6.arpa.)
	     * address.correctForm(); // '2001:0:ce49:7601:e866:efff:62c3:fffe'
	     */
	    static fromArpa(arpaFormAddress) {
	        // remove ending ".ip6.arpa." or just "."
	        let address = arpaFormAddress.replace(/(\.ip6\.arpa)?\.$/, '');
	        const semicolonAmount = 7;
	        // correct ip6.arpa form with ending removed will be 63 characters
	        if (address.length !== 63) {
	            throw new address_error_1.AddressError("Invalid 'ip6.arpa' form.");
	        }
	        const parts = address.split('.').reverse();
	        for (let i = semicolonAmount; i > 0; i--) {
	            const insertIndex = i * 4;
	            parts.splice(insertIndex, 0, ':');
	        }
	        address = parts.join('');
	        return new Address6(address);
	    }
	    /**
	     * Return the Microsoft UNC transcription of the address
	     * @memberof Address6
	     * @instance
	     * @returns {String} the Microsoft UNC transcription of the address
	     */
	    microsoftTranscription() {
	        return (0, sprintf_js_1.sprintf)('%s.ipv6-literal.net', this.correctForm().replace(/:/g, '-'));
	    }
	    /**
	     * Return the first n bits of the address, defaulting to the subnet mask
	     * @memberof Address6
	     * @instance
	     * @param {number} [mask=subnet] - the number of bits to mask
	     * @returns {String} the first n bits of the address as a string
	     */
	    mask(mask = this.subnetMask) {
	        return this.getBitsBase2(0, mask);
	    }
	    /**
	     * Return the number of possible subnets of a given size in the address
	     * @memberof Address6
	     * @instance
	     * @param {number} [size=128] - the subnet size
	     * @returns {String}
	     */
	    // TODO: probably useful to have a numeric version of this too
	    possibleSubnets(subnetSize = 128) {
	        const availableBits = constants6.BITS - this.subnetMask;
	        const subnetBits = Math.abs(subnetSize - constants6.BITS);
	        const subnetPowers = availableBits - subnetBits;
	        if (subnetPowers < 0) {
	            return '0';
	        }
	        return addCommas(new jsbn_1.BigInteger('2', 10).pow(subnetPowers).toString(10));
	    }
	    /**
	     * Helper function getting start address.
	     * @memberof Address6
	     * @instance
	     * @returns {BigInteger}
	     */
	    _startAddress() {
	        return new jsbn_1.BigInteger(this.mask() + '0'.repeat(constants6.BITS - this.subnetMask), 2);
	    }
	    /**
	     * The first address in the range given by this address' subnet
	     * Often referred to as the Network Address.
	     * @memberof Address6
	     * @instance
	     * @returns {Address6}
	     */
	    startAddress() {
	        return Address6.fromBigInteger(this._startAddress());
	    }
	    /**
	     * The first host address in the range given by this address's subnet ie
	     * the first address after the Network Address
	     * @memberof Address6
	     * @instance
	     * @returns {Address6}
	     */
	    startAddressExclusive() {
	        const adjust = new jsbn_1.BigInteger('1');
	        return Address6.fromBigInteger(this._startAddress().add(adjust));
	    }
	    /**
	     * Helper function getting end address.
	     * @memberof Address6
	     * @instance
	     * @returns {BigInteger}
	     */
	    _endAddress() {
	        return new jsbn_1.BigInteger(this.mask() + '1'.repeat(constants6.BITS - this.subnetMask), 2);
	    }
	    /**
	     * The last address in the range given by this address' subnet
	     * Often referred to as the Broadcast
	     * @memberof Address6
	     * @instance
	     * @returns {Address6}
	     */
	    endAddress() {
	        return Address6.fromBigInteger(this._endAddress());
	    }
	    /**
	     * The last host address in the range given by this address's subnet ie
	     * the last address prior to the Broadcast Address
	     * @memberof Address6
	     * @instance
	     * @returns {Address6}
	     */
	    endAddressExclusive() {
	        const adjust = new jsbn_1.BigInteger('1');
	        return Address6.fromBigInteger(this._endAddress().subtract(adjust));
	    }
	    /**
	     * Return the scope of the address
	     * @memberof Address6
	     * @instance
	     * @returns {String}
	     */
	    getScope() {
	        let scope = constants6.SCOPES[this.getBits(12, 16).intValue()];
	        if (this.getType() === 'Global unicast' && scope !== 'Link local') {
	            scope = 'Global';
	        }
	        return scope || 'Unknown';
	    }
	    /**
	     * Return the type of the address
	     * @memberof Address6
	     * @instance
	     * @returns {String}
	     */
	    getType() {
	        for (const subnet of Object.keys(constants6.TYPES)) {
	            if (this.isInSubnet(new Address6(subnet))) {
	                return constants6.TYPES[subnet];
	            }
	        }
	        return 'Global unicast';
	    }
	    /**
	     * Return the bits in the given range as a BigInteger
	     * @memberof Address6
	     * @instance
	     * @returns {BigInteger}
	     */
	    getBits(start, end) {
	        return new jsbn_1.BigInteger(this.getBitsBase2(start, end), 2);
	    }
	    /**
	     * Return the bits in the given range as a base-2 string
	     * @memberof Address6
	     * @instance
	     * @returns {String}
	     */
	    getBitsBase2(start, end) {
	        return this.binaryZeroPad().slice(start, end);
	    }
	    /**
	     * Return the bits in the given range as a base-16 string
	     * @memberof Address6
	     * @instance
	     * @returns {String}
	     */
	    getBitsBase16(start, end) {
	        const length = end - start;
	        if (length % 4 !== 0) {
	            throw new Error('Length of bits to retrieve must be divisible by four');
	        }
	        return this.getBits(start, end)
	            .toString(16)
	            .padStart(length / 4, '0');
	    }
	    /**
	     * Return the bits that are set past the subnet mask length
	     * @memberof Address6
	     * @instance
	     * @returns {String}
	     */
	    getBitsPastSubnet() {
	        return this.getBitsBase2(this.subnetMask, constants6.BITS);
	    }
	    /**
	     * Return the reversed ip6.arpa form of the address
	     * @memberof Address6
	     * @param {Object} options
	     * @param {boolean} options.omitSuffix - omit the "ip6.arpa" suffix
	     * @instance
	     * @returns {String}
	     */
	    reverseForm(options) {
	        if (!options) {
	            options = {};
	        }
	        const characters = Math.floor(this.subnetMask / 4);
	        const reversed = this.canonicalForm()
	            .replace(/:/g, '')
	            .split('')
	            .slice(0, characters)
	            .reverse()
	            .join('.');
	        if (characters > 0) {
	            if (options.omitSuffix) {
	                return reversed;
	            }
	            return (0, sprintf_js_1.sprintf)('%s.ip6.arpa.', reversed);
	        }
	        if (options.omitSuffix) {
	            return '';
	        }
	        return 'ip6.arpa.';
	    }
	    /**
	     * Return the correct form of the address
	     * @memberof Address6
	     * @instance
	     * @returns {String}
	     */
	    correctForm() {
	        let i;
	        let groups = [];
	        let zeroCounter = 0;
	        const zeroes = [];
	        for (i = 0; i < this.parsedAddress.length; i++) {
	            const value = parseInt(this.parsedAddress[i], 16);
	            if (value === 0) {
	                zeroCounter++;
	            }
	            if (value !== 0 && zeroCounter > 0) {
	                if (zeroCounter > 1) {
	                    zeroes.push([i - zeroCounter, i - 1]);
	                }
	                zeroCounter = 0;
	            }
	        }
	        // Do we end with a string of zeroes?
	        if (zeroCounter > 1) {
	            zeroes.push([this.parsedAddress.length - zeroCounter, this.parsedAddress.length - 1]);
	        }
	        const zeroLengths = zeroes.map((n) => n[1] - n[0] + 1);
	        if (zeroes.length > 0) {
	            const index = zeroLengths.indexOf(Math.max(...zeroLengths));
	            groups = compact(this.parsedAddress, zeroes[index]);
	        }
	        else {
	            groups = this.parsedAddress;
	        }
	        for (i = 0; i < groups.length; i++) {
	            if (groups[i] !== 'compact') {
	                groups[i] = parseInt(groups[i], 16).toString(16);
	            }
	        }
	        let correct = groups.join(':');
	        correct = correct.replace(/^compact$/, '::');
	        correct = correct.replace(/^compact|compact$/, ':');
	        correct = correct.replace(/compact/, '');
	        return correct;
	    }
	    /**
	     * Return a zero-padded base-2 string representation of the address
	     * @memberof Address6
	     * @instance
	     * @returns {String}
	     * @example
	     * var address = new Address6('2001:4860:4001:803::1011');
	     * address.binaryZeroPad();
	     * // '0010000000000001010010000110000001000000000000010000100000000011
	     * //  0000000000000000000000000000000000000000000000000001000000010001'
	     */
	    binaryZeroPad() {
	        return this.bigInteger().toString(2).padStart(constants6.BITS, '0');
	    }
	    // TODO: Improve the semantics of this helper function
	    parse4in6(address) {
	        const groups = address.split(':');
	        const lastGroup = groups.slice(-1)[0];
	        const address4 = lastGroup.match(constants4.RE_ADDRESS);
	        if (address4) {
	            this.parsedAddress4 = address4[0];
	            this.address4 = new ipv4_1.Address4(this.parsedAddress4);
	            for (let i = 0; i < this.address4.groups; i++) {
	                if (/^0[0-9]+/.test(this.address4.parsedAddress[i])) {
	                    throw new address_error_1.AddressError("IPv4 addresses can't have leading zeroes.", address.replace(constants4.RE_ADDRESS, this.address4.parsedAddress.map(spanLeadingZeroes4).join('.')));
	                }
	            }
	            this.v4 = true;
	            groups[groups.length - 1] = this.address4.toGroup6();
	            address = groups.join(':');
	        }
	        return address;
	    }
	    // TODO: Make private?
	    parse(address) {
	        address = this.parse4in6(address);
	        const badCharacters = address.match(constants6.RE_BAD_CHARACTERS);
	        if (badCharacters) {
	            throw new address_error_1.AddressError((0, sprintf_js_1.sprintf)('Bad character%s detected in address: %s', badCharacters.length > 1 ? 's' : '', badCharacters.join('')), address.replace(constants6.RE_BAD_CHARACTERS, '<span class="parse-error">$1</span>'));
	        }
	        const badAddress = address.match(constants6.RE_BAD_ADDRESS);
	        if (badAddress) {
	            throw new address_error_1.AddressError((0, sprintf_js_1.sprintf)('Address failed regex: %s', badAddress.join('')), address.replace(constants6.RE_BAD_ADDRESS, '<span class="parse-error">$1</span>'));
	        }
	        let groups = [];
	        const halves = address.split('::');
	        if (halves.length === 2) {
	            let first = halves[0].split(':');
	            let last = halves[1].split(':');
	            if (first.length === 1 && first[0] === '') {
	                first = [];
	            }
	            if (last.length === 1 && last[0] === '') {
	                last = [];
	            }
	            const remaining = this.groups - (first.length + last.length);
	            if (!remaining) {
	                throw new address_error_1.AddressError('Error parsing groups');
	            }
	            this.elidedGroups = remaining;
	            this.elisionBegin = first.length;
	            this.elisionEnd = first.length + this.elidedGroups;
	            groups = groups.concat(first);
	            for (let i = 0; i < remaining; i++) {
	                groups.push('0');
	            }
	            groups = groups.concat(last);
	        }
	        else if (halves.length === 1) {
	            groups = address.split(':');
	            this.elidedGroups = 0;
	        }
	        else {
	            throw new address_error_1.AddressError('Too many :: groups found');
	        }
	        groups = groups.map((group) => (0, sprintf_js_1.sprintf)('%x', parseInt(group, 16)));
	        if (groups.length !== this.groups) {
	            throw new address_error_1.AddressError('Incorrect number of groups found');
	        }
	        return groups;
	    }
	    /**
	     * Return the canonical form of the address
	     * @memberof Address6
	     * @instance
	     * @returns {String}
	     */
	    canonicalForm() {
	        return this.parsedAddress.map(paddedHex).join(':');
	    }
	    /**
	     * Return the decimal form of the address
	     * @memberof Address6
	     * @instance
	     * @returns {String}
	     */
	    decimal() {
	        return this.parsedAddress.map((n) => (0, sprintf_js_1.sprintf)('%05d', parseInt(n, 16))).join(':');
	    }
	    /**
	     * Return the address as a BigInteger
	     * @memberof Address6
	     * @instance
	     * @returns {BigInteger}
	     */
	    bigInteger() {
	        return new jsbn_1.BigInteger(this.parsedAddress.map(paddedHex).join(''), 16);
	    }
	    /**
	     * Return the last two groups of this address as an IPv4 address string
	     * @memberof Address6
	     * @instance
	     * @returns {Address4}
	     * @example
	     * var address = new Address6('2001:4860:4001::1825:bf11');
	     * address.to4().correctForm(); // '24.37.191.17'
	     */
	    to4() {
	        const binary = this.binaryZeroPad().split('');
	        return ipv4_1.Address4.fromHex(new jsbn_1.BigInteger(binary.slice(96, 128).join(''), 2).toString(16));
	    }
	    /**
	     * Return the v4-in-v6 form of the address
	     * @memberof Address6
	     * @instance
	     * @returns {String}
	     */
	    to4in6() {
	        const address4 = this.to4();
	        const address6 = new Address6(this.parsedAddress.slice(0, 6).join(':'), 6);
	        const correct = address6.correctForm();
	        let infix = '';
	        if (!/:$/.test(correct)) {
	            infix = ':';
	        }
	        return correct + infix + address4.address;
	    }
	    /**
	     * Return an object containing the Teredo properties of the address
	     * @memberof Address6
	     * @instance
	     * @returns {Object}
	     */
	    inspectTeredo() {
	        /*
	        - Bits 0 to 31 are set to the Teredo prefix (normally 2001:0000::/32).
	        - Bits 32 to 63 embed the primary IPv4 address of the Teredo server that
	          is used.
	        - Bits 64 to 79 can be used to define some flags. Currently only the
	          higher order bit is used; it is set to 1 if the Teredo client is
	          located behind a cone NAT, 0 otherwise. For Microsoft's Windows Vista
	          and Windows Server 2008 implementations, more bits are used. In those
	          implementations, the format for these 16 bits is "CRAAAAUG AAAAAAAA",
	          where "C" remains the "Cone" flag. The "R" bit is reserved for future
	          use. The "U" bit is for the Universal/Local flag (set to 0). The "G" bit
	          is Individual/Group flag (set to 0). The A bits are set to a 12-bit
	          randomly generated number chosen by the Teredo client to introduce
	          additional protection for the Teredo node against IPv6-based scanning
	          attacks.
	        - Bits 80 to 95 contains the obfuscated UDP port number. This is the
	          port number that is mapped by the NAT to the Teredo client with all
	          bits inverted.
	        - Bits 96 to 127 contains the obfuscated IPv4 address. This is the
	          public IPv4 address of the NAT with all bits inverted.
	        */
	        const prefix = this.getBitsBase16(0, 32);
	        const udpPort = this.getBits(80, 96).xor(new jsbn_1.BigInteger('ffff', 16)).toString();
	        const server4 = ipv4_1.Address4.fromHex(this.getBitsBase16(32, 64));
	        const client4 = ipv4_1.Address4.fromHex(this.getBits(96, 128).xor(new jsbn_1.BigInteger('ffffffff', 16)).toString(16));
	        const flags = this.getBits(64, 80);
	        const flagsBase2 = this.getBitsBase2(64, 80);
	        const coneNat = flags.testBit(15);
	        const reserved = flags.testBit(14);
	        const groupIndividual = flags.testBit(8);
	        const universalLocal = flags.testBit(9);
	        const nonce = new jsbn_1.BigInteger(flagsBase2.slice(2, 6) + flagsBase2.slice(8, 16), 2).toString(10);
	        return {
	            prefix: (0, sprintf_js_1.sprintf)('%s:%s', prefix.slice(0, 4), prefix.slice(4, 8)),
	            server4: server4.address,
	            client4: client4.address,
	            flags: flagsBase2,
	            coneNat,
	            microsoft: {
	                reserved,
	                universalLocal,
	                groupIndividual,
	                nonce,
	            },
	            udpPort,
	        };
	    }
	    /**
	     * Return an object containing the 6to4 properties of the address
	     * @memberof Address6
	     * @instance
	     * @returns {Object}
	     */
	    inspect6to4() {
	        /*
	        - Bits 0 to 15 are set to the 6to4 prefix (2002::/16).
	        - Bits 16 to 48 embed the IPv4 address of the 6to4 gateway that is used.
	        */
	        const prefix = this.getBitsBase16(0, 16);
	        const gateway = ipv4_1.Address4.fromHex(this.getBitsBase16(16, 48));
	        return {
	            prefix: (0, sprintf_js_1.sprintf)('%s', prefix.slice(0, 4)),
	            gateway: gateway.address,
	        };
	    }
	    /**
	     * Return a v6 6to4 address from a v6 v4inv6 address
	     * @memberof Address6
	     * @instance
	     * @returns {Address6}
	     */
	    to6to4() {
	        if (!this.is4()) {
	            return null;
	        }
	        const addr6to4 = [
	            '2002',
	            this.getBitsBase16(96, 112),
	            this.getBitsBase16(112, 128),
	            '',
	            '/16',
	        ].join(':');
	        return new Address6(addr6to4);
	    }
	    /**
	     * Return a byte array
	     * @memberof Address6
	     * @instance
	     * @returns {Array}
	     */
	    toByteArray() {
	        const byteArray = this.bigInteger().toByteArray();
	        // work around issue where `toByteArray` returns a leading 0 element
	        if (byteArray.length === 17 && byteArray[0] === 0) {
	            return byteArray.slice(1);
	        }
	        return byteArray;
	    }
	    /**
	     * Return an unsigned byte array
	     * @memberof Address6
	     * @instance
	     * @returns {Array}
	     */
	    toUnsignedByteArray() {
	        return this.toByteArray().map(unsignByte);
	    }
	    /**
	     * Convert a byte array to an Address6 object
	     * @memberof Address6
	     * @static
	     * @returns {Address6}
	     */
	    static fromByteArray(bytes) {
	        return this.fromUnsignedByteArray(bytes.map(unsignByte));
	    }
	    /**
	     * Convert an unsigned byte array to an Address6 object
	     * @memberof Address6
	     * @static
	     * @returns {Address6}
	     */
	    static fromUnsignedByteArray(bytes) {
	        const BYTE_MAX = new jsbn_1.BigInteger('256', 10);
	        let result = new jsbn_1.BigInteger('0', 10);
	        let multiplier = new jsbn_1.BigInteger('1', 10);
	        for (let i = bytes.length - 1; i >= 0; i--) {
	            result = result.add(multiplier.multiply(new jsbn_1.BigInteger(bytes[i].toString(10), 10)));
	            multiplier = multiplier.multiply(BYTE_MAX);
	        }
	        return Address6.fromBigInteger(result);
	    }
	    /**
	     * Returns true if the address is in the canonical form, false otherwise
	     * @memberof Address6
	     * @instance
	     * @returns {boolean}
	     */
	    isCanonical() {
	        return this.addressMinusSuffix === this.canonicalForm();
	    }
	    /**
	     * Returns true if the address is a link local address, false otherwise
	     * @memberof Address6
	     * @instance
	     * @returns {boolean}
	     */
	    isLinkLocal() {
	        // Zeroes are required, i.e. we can't check isInSubnet with 'fe80::/10'
	        if (this.getBitsBase2(0, 64) ===
	            '1111111010000000000000000000000000000000000000000000000000000000') {
	            return true;
	        }
	        return false;
	    }
	    /**
	     * Returns true if the address is a multicast address, false otherwise
	     * @memberof Address6
	     * @instance
	     * @returns {boolean}
	     */
	    isMulticast() {
	        return this.getType() === 'Multicast';
	    }
	    /**
	     * Returns true if the address is a v4-in-v6 address, false otherwise
	     * @memberof Address6
	     * @instance
	     * @returns {boolean}
	     */
	    is4() {
	        return this.v4;
	    }
	    /**
	     * Returns true if the address is a Teredo address, false otherwise
	     * @memberof Address6
	     * @instance
	     * @returns {boolean}
	     */
	    isTeredo() {
	        return this.isInSubnet(new Address6('2001::/32'));
	    }
	    /**
	     * Returns true if the address is a 6to4 address, false otherwise
	     * @memberof Address6
	     * @instance
	     * @returns {boolean}
	     */
	    is6to4() {
	        return this.isInSubnet(new Address6('2002::/16'));
	    }
	    /**
	     * Returns true if the address is a loopback address, false otherwise
	     * @memberof Address6
	     * @instance
	     * @returns {boolean}
	     */
	    isLoopback() {
	        return this.getType() === 'Loopback';
	    }
	    // #endregion
	    // #region HTML
	    /**
	     * @returns {String} the address in link form with a default port of 80
	     */
	    href(optionalPort) {
	        if (optionalPort === undefined) {
	            optionalPort = '';
	        }
	        else {
	            optionalPort = (0, sprintf_js_1.sprintf)(':%s', optionalPort);
	        }
	        return (0, sprintf_js_1.sprintf)('http://[%s]%s/', this.correctForm(), optionalPort);
	    }
	    /**
	     * @returns {String} a link suitable for conveying the address via a URL hash
	     */
	    link(options) {
	        if (!options) {
	            options = {};
	        }
	        if (options.className === undefined) {
	            options.className = '';
	        }
	        if (options.prefix === undefined) {
	            options.prefix = '/#address=';
	        }
	        if (options.v4 === undefined) {
	            options.v4 = false;
	        }
	        let formFunction = this.correctForm;
	        if (options.v4) {
	            formFunction = this.to4in6;
	        }
	        if (options.className) {
	            return (0, sprintf_js_1.sprintf)('<a href="%1$s%2$s" class="%3$s">%2$s</a>', options.prefix, formFunction.call(this), options.className);
	        }
	        return (0, sprintf_js_1.sprintf)('<a href="%1$s%2$s">%2$s</a>', options.prefix, formFunction.call(this));
	    }
	    /**
	     * Groups an address
	     * @returns {String}
	     */
	    group() {
	        if (this.elidedGroups === 0) {
	            // The simple case
	            return helpers.simpleGroup(this.address).join(':');
	        }
	        assert(typeof this.elidedGroups === 'number');
	        assert(typeof this.elisionBegin === 'number');
	        // The elided case
	        const output = [];
	        const [left, right] = this.address.split('::');
	        if (left.length) {
	            output.push(...helpers.simpleGroup(left));
	        }
	        else {
	            output.push('');
	        }
	        const classes = ['hover-group'];
	        for (let i = this.elisionBegin; i < this.elisionBegin + this.elidedGroups; i++) {
	            classes.push((0, sprintf_js_1.sprintf)('group-%d', i));
	        }
	        output.push((0, sprintf_js_1.sprintf)('<span class="%s"></span>', classes.join(' ')));
	        if (right.length) {
	            output.push(...helpers.simpleGroup(right, this.elisionEnd));
	        }
	        else {
	            output.push('');
	        }
	        if (this.is4()) {
	            assert(this.address4 instanceof ipv4_1.Address4);
	            output.pop();
	            output.push(this.address4.groupForV6());
	        }
	        return output.join(':');
	    }
	    // #endregion
	    // #region Regular expressions
	    /**
	     * Generate a regular expression string that can be used to find or validate
	     * all variations of this address
	     * @memberof Address6
	     * @instance
	     * @param {boolean} substringSearch
	     * @returns {string}
	     */
	    regularExpressionString(substringSearch = false) {
	        let output = [];
	        // TODO: revisit why this is necessary
	        const address6 = new Address6(this.correctForm());
	        if (address6.elidedGroups === 0) {
	            // The simple case
	            output.push((0, regular_expressions_1.simpleRegularExpression)(address6.parsedAddress));
	        }
	        else if (address6.elidedGroups === constants6.GROUPS) {
	            // A completely elided address
	            output.push((0, regular_expressions_1.possibleElisions)(constants6.GROUPS));
	        }
	        else {
	            // A partially elided address
	            const halves = address6.address.split('::');
	            if (halves[0].length) {
	                output.push((0, regular_expressions_1.simpleRegularExpression)(halves[0].split(':')));
	            }
	            assert(typeof address6.elidedGroups === 'number');
	            output.push((0, regular_expressions_1.possibleElisions)(address6.elidedGroups, halves[0].length !== 0, halves[1].length !== 0));
	            if (halves[1].length) {
	                output.push((0, regular_expressions_1.simpleRegularExpression)(halves[1].split(':')));
	            }
	            output = [output.join(':')];
	        }
	        if (!substringSearch) {
	            output = [
	                '(?=^|',
	                regular_expressions_1.ADDRESS_BOUNDARY,
	                '|[^\\w\\:])(',
	                ...output,
	                ')(?=[^\\w\\:]|',
	                regular_expressions_1.ADDRESS_BOUNDARY,
	                '|$)',
	            ];
	        }
	        return output.join('');
	    }
	    /**
	     * Generate a regular expression that can be used to find or validate all
	     * variations of this address.
	     * @memberof Address6
	     * @instance
	     * @param {boolean} substringSearch
	     * @returns {RegExp}
	     */
	    regularExpression(substringSearch = false) {
	        return new RegExp(this.regularExpressionString(substringSearch), 'i');
	    }
	}
	ipv6.Address6 = Address6;
	
	return ipv6;
}

var hasRequiredIpAddress;

function requireIpAddress () {
	if (hasRequiredIpAddress) return ipAddress;
	hasRequiredIpAddress = 1;
	(function (exports) {
		var __createBinding = (ipAddress && ipAddress.__createBinding) || (Object.create ? (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    var desc = Object.getOwnPropertyDescriptor(m, k);
		    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
		      desc = { enumerable: true, get: function() { return m[k]; } };
		    }
		    Object.defineProperty(o, k2, desc);
		}) : (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    o[k2] = m[k];
		}));
		var __setModuleDefault = (ipAddress && ipAddress.__setModuleDefault) || (Object.create ? (function(o, v) {
		    Object.defineProperty(o, "default", { enumerable: true, value: v });
		}) : function(o, v) {
		    o["default"] = v;
		});
		var __importStar = (ipAddress && ipAddress.__importStar) || function (mod) {
		    if (mod && mod.__esModule) return mod;
		    var result = {};
		    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
		    __setModuleDefault(result, mod);
		    return result;
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.v6 = exports.AddressError = exports.Address6 = exports.Address4 = void 0;
		const ipv4_1 = requireIpv4();
		Object.defineProperty(exports, "Address4", { enumerable: true, get: function () { return ipv4_1.Address4; } });
		const ipv6_1 = requireIpv6();
		Object.defineProperty(exports, "Address6", { enumerable: true, get: function () { return ipv6_1.Address6; } });
		const address_error_1 = requireAddressError();
		Object.defineProperty(exports, "AddressError", { enumerable: true, get: function () { return address_error_1.AddressError; } });
		const helpers = __importStar(requireHelpers$2());
		exports.v6 = { helpers };
		
	} (ipAddress));
	return ipAddress;
}

var hasRequiredHelpers$1;

function requireHelpers$1 () {
	if (hasRequiredHelpers$1) return helpers$2;
	hasRequiredHelpers$1 = 1;
	Object.defineProperty(helpers$2, "__esModule", { value: true });
	helpers$2.ipToBuffer = helpers$2.int32ToIpv4 = helpers$2.ipv4ToInt32 = helpers$2.validateSocksClientChainOptions = helpers$2.validateSocksClientOptions = void 0;
	const util_1 = requireUtil();
	const constants_1 = requireConstants$2();
	const stream = require$$2$2;
	const ip_address_1 = requireIpAddress();
	const net = require$$4$1;
	/**
	 * Validates the provided SocksClientOptions
	 * @param options { SocksClientOptions }
	 * @param acceptedCommands { string[] } A list of accepted SocksProxy commands.
	 */
	function validateSocksClientOptions(options, acceptedCommands = ['connect', 'bind', 'associate']) {
	    // Check SOCKs command option.
	    if (!constants_1.SocksCommand[options.command]) {
	        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksCommand, options);
	    }
	    // Check SocksCommand for acceptable command.
	    if (acceptedCommands.indexOf(options.command) === -1) {
	        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksCommandForOperation, options);
	    }
	    // Check destination
	    if (!isValidSocksRemoteHost(options.destination)) {
	        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsDestination, options);
	    }
	    // Check SOCKS proxy to use
	    if (!isValidSocksProxy(options.proxy)) {
	        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsProxy, options);
	    }
	    // Validate custom auth (if set)
	    validateCustomProxyAuth(options.proxy, options);
	    // Check timeout
	    if (options.timeout && !isValidTimeoutValue(options.timeout)) {
	        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsTimeout, options);
	    }
	    // Check existing_socket (if provided)
	    if (options.existing_socket &&
	        !(options.existing_socket instanceof stream.Duplex)) {
	        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsExistingSocket, options);
	    }
	}
	helpers$2.validateSocksClientOptions = validateSocksClientOptions;
	/**
	 * Validates the SocksClientChainOptions
	 * @param options { SocksClientChainOptions }
	 */
	function validateSocksClientChainOptions(options) {
	    // Only connect is supported when chaining.
	    if (options.command !== 'connect') {
	        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksCommandChain, options);
	    }
	    // Check destination
	    if (!isValidSocksRemoteHost(options.destination)) {
	        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsDestination, options);
	    }
	    // Validate proxies (length)
	    if (!(options.proxies &&
	        Array.isArray(options.proxies) &&
	        options.proxies.length >= 2)) {
	        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsProxiesLength, options);
	    }
	    // Validate proxies
	    options.proxies.forEach((proxy) => {
	        if (!isValidSocksProxy(proxy)) {
	            throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsProxy, options);
	        }
	        // Validate custom auth (if set)
	        validateCustomProxyAuth(proxy, options);
	    });
	    // Check timeout
	    if (options.timeout && !isValidTimeoutValue(options.timeout)) {
	        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsTimeout, options);
	    }
	}
	helpers$2.validateSocksClientChainOptions = validateSocksClientChainOptions;
	function validateCustomProxyAuth(proxy, options) {
	    if (proxy.custom_auth_method !== undefined) {
	        // Invalid auth method range
	        if (proxy.custom_auth_method < constants_1.SOCKS5_CUSTOM_AUTH_START ||
	            proxy.custom_auth_method > constants_1.SOCKS5_CUSTOM_AUTH_END) {
	            throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsCustomAuthRange, options);
	        }
	        // Missing custom_auth_request_handler
	        if (proxy.custom_auth_request_handler === undefined ||
	            typeof proxy.custom_auth_request_handler !== 'function') {
	            throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsCustomAuthOptions, options);
	        }
	        // Missing custom_auth_response_size
	        if (proxy.custom_auth_response_size === undefined) {
	            throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsCustomAuthOptions, options);
	        }
	        // Missing/invalid custom_auth_response_handler
	        if (proxy.custom_auth_response_handler === undefined ||
	            typeof proxy.custom_auth_response_handler !== 'function') {
	            throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsCustomAuthOptions, options);
	        }
	    }
	}
	/**
	 * Validates a SocksRemoteHost
	 * @param remoteHost { SocksRemoteHost }
	 */
	function isValidSocksRemoteHost(remoteHost) {
	    return (remoteHost &&
	        typeof remoteHost.host === 'string' &&
	        Buffer.byteLength(remoteHost.host) < 256 &&
	        typeof remoteHost.port === 'number' &&
	        remoteHost.port >= 0 &&
	        remoteHost.port <= 65535);
	}
	/**
	 * Validates a SocksProxy
	 * @param proxy { SocksProxy }
	 */
	function isValidSocksProxy(proxy) {
	    return (proxy &&
	        (typeof proxy.host === 'string' || typeof proxy.ipaddress === 'string') &&
	        typeof proxy.port === 'number' &&
	        proxy.port >= 0 &&
	        proxy.port <= 65535 &&
	        (proxy.type === 4 || proxy.type === 5));
	}
	/**
	 * Validates a timeout value.
	 * @param value { Number }
	 */
	function isValidTimeoutValue(value) {
	    return typeof value === 'number' && value > 0;
	}
	function ipv4ToInt32(ip) {
	    const address = new ip_address_1.Address4(ip);
	    // Convert the IPv4 address parts to an integer
	    return address.toArray().reduce((acc, part) => (acc << 8) + part, 0) >>> 0;
	}
	helpers$2.ipv4ToInt32 = ipv4ToInt32;
	function int32ToIpv4(int32) {
	    // Extract each byte (octet) from the 32-bit integer
	    const octet1 = (int32 >>> 24) & 0xff;
	    const octet2 = (int32 >>> 16) & 0xff;
	    const octet3 = (int32 >>> 8) & 0xff;
	    const octet4 = int32 & 0xff;
	    // Combine the octets into a string in IPv4 format
	    return [octet1, octet2, octet3, octet4].join('.');
	}
	helpers$2.int32ToIpv4 = int32ToIpv4;
	function ipToBuffer(ip) {
	    if (net.isIPv4(ip)) {
	        // Handle IPv4 addresses
	        const address = new ip_address_1.Address4(ip);
	        return Buffer.from(address.toArray());
	    }
	    else if (net.isIPv6(ip)) {
	        // Handle IPv6 addresses
	        const address = new ip_address_1.Address6(ip);
	        return Buffer.from(address
	            .canonicalForm()
	            .split(':')
	            .map((segment) => segment.padStart(4, '0'))
	            .join(''), 'hex');
	    }
	    else {
	        throw new Error('Invalid IP address format');
	    }
	}
	helpers$2.ipToBuffer = ipToBuffer;
	
	return helpers$2;
}

var receivebuffer = {};

var hasRequiredReceivebuffer;

function requireReceivebuffer () {
	if (hasRequiredReceivebuffer) return receivebuffer;
	hasRequiredReceivebuffer = 1;
	Object.defineProperty(receivebuffer, "__esModule", { value: true });
	receivebuffer.ReceiveBuffer = void 0;
	class ReceiveBuffer {
	    constructor(size = 4096) {
	        this.buffer = Buffer.allocUnsafe(size);
	        this.offset = 0;
	        this.originalSize = size;
	    }
	    get length() {
	        return this.offset;
	    }
	    append(data) {
	        if (!Buffer.isBuffer(data)) {
	            throw new Error('Attempted to append a non-buffer instance to ReceiveBuffer.');
	        }
	        if (this.offset + data.length >= this.buffer.length) {
	            const tmp = this.buffer;
	            this.buffer = Buffer.allocUnsafe(Math.max(this.buffer.length + this.originalSize, this.buffer.length + data.length));
	            tmp.copy(this.buffer);
	        }
	        data.copy(this.buffer, this.offset);
	        return (this.offset += data.length);
	    }
	    peek(length) {
	        if (length > this.offset) {
	            throw new Error('Attempted to read beyond the bounds of the managed internal data.');
	        }
	        return this.buffer.slice(0, length);
	    }
	    get(length) {
	        if (length > this.offset) {
	            throw new Error('Attempted to read beyond the bounds of the managed internal data.');
	        }
	        const value = Buffer.allocUnsafe(length);
	        this.buffer.slice(0, length).copy(value);
	        this.buffer.copyWithin(0, length, length + this.offset - length);
	        this.offset -= length;
	        return value;
	    }
	}
	receivebuffer.ReceiveBuffer = ReceiveBuffer;
	
	return receivebuffer;
}

var hasRequiredSocksclient;

function requireSocksclient () {
	if (hasRequiredSocksclient) return socksclient;
	hasRequiredSocksclient = 1;
	(function (exports) {
		var __awaiter = (socksclient && socksclient.__awaiter) || function (thisArg, _arguments, P, generator) {
		    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
		    return new (P || (P = Promise))(function (resolve, reject) {
		        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
		        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
		        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
		        step((generator = generator.apply(thisArg, _arguments || [])).next());
		    });
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.SocksClientError = exports.SocksClient = void 0;
		const events_1 = require$$0$3;
		const net = require$$4$1;
		const smart_buffer_1 = requireSmartbuffer();
		const constants_1 = requireConstants$2();
		const helpers_1 = requireHelpers$1();
		const receivebuffer_1 = requireReceivebuffer();
		const util_1 = requireUtil();
		Object.defineProperty(exports, "SocksClientError", { enumerable: true, get: function () { return util_1.SocksClientError; } });
		const ip_address_1 = requireIpAddress();
		class SocksClient extends events_1.EventEmitter {
		    constructor(options) {
		        super();
		        this.options = Object.assign({}, options);
		        // Validate SocksClientOptions
		        (0, helpers_1.validateSocksClientOptions)(options);
		        // Default state
		        this.setState(constants_1.SocksClientState.Created);
		    }
		    /**
		     * Creates a new SOCKS connection.
		     *
		     * Note: Supports callbacks and promises. Only supports the connect command.
		     * @param options { SocksClientOptions } Options.
		     * @param callback { Function } An optional callback function.
		     * @returns { Promise }
		     */
		    static createConnection(options, callback) {
		        return new Promise((resolve, reject) => {
		            // Validate SocksClientOptions
		            try {
		                (0, helpers_1.validateSocksClientOptions)(options, ['connect']);
		            }
		            catch (err) {
		                if (typeof callback === 'function') {
		                    callback(err);
		                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
		                    return resolve(err); // Resolves pending promise (prevents memory leaks).
		                }
		                else {
		                    return reject(err);
		                }
		            }
		            const client = new SocksClient(options);
		            client.connect(options.existing_socket);
		            client.once('established', (info) => {
		                client.removeAllListeners();
		                if (typeof callback === 'function') {
		                    callback(null, info);
		                    resolve(info); // Resolves pending promise (prevents memory leaks).
		                }
		                else {
		                    resolve(info);
		                }
		            });
		            // Error occurred, failed to establish connection.
		            client.once('error', (err) => {
		                client.removeAllListeners();
		                if (typeof callback === 'function') {
		                    callback(err);
		                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
		                    resolve(err); // Resolves pending promise (prevents memory leaks).
		                }
		                else {
		                    reject(err);
		                }
		            });
		        });
		    }
		    /**
		     * Creates a new SOCKS connection chain to a destination host through 2 or more SOCKS proxies.
		     *
		     * Note: Supports callbacks and promises. Only supports the connect method.
		     * Note: Implemented via createConnection() factory function.
		     * @param options { SocksClientChainOptions } Options
		     * @param callback { Function } An optional callback function.
		     * @returns { Promise }
		     */
		    static createConnectionChain(options, callback) {
		        // eslint-disable-next-line no-async-promise-executor
		        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
		            // Validate SocksClientChainOptions
		            try {
		                (0, helpers_1.validateSocksClientChainOptions)(options);
		            }
		            catch (err) {
		                if (typeof callback === 'function') {
		                    callback(err);
		                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
		                    return resolve(err); // Resolves pending promise (prevents memory leaks).
		                }
		                else {
		                    return reject(err);
		                }
		            }
		            // Shuffle proxies
		            if (options.randomizeChain) {
		                (0, util_1.shuffleArray)(options.proxies);
		            }
		            try {
		                let sock;
		                for (let i = 0; i < options.proxies.length; i++) {
		                    const nextProxy = options.proxies[i];
		                    // If we've reached the last proxy in the chain, the destination is the actual destination, otherwise it's the next proxy.
		                    const nextDestination = i === options.proxies.length - 1
		                        ? options.destination
		                        : {
		                            host: options.proxies[i + 1].host ||
		                                options.proxies[i + 1].ipaddress,
		                            port: options.proxies[i + 1].port,
		                        };
		                    // Creates the next connection in the chain.
		                    const result = yield SocksClient.createConnection({
		                        command: 'connect',
		                        proxy: nextProxy,
		                        destination: nextDestination,
		                        existing_socket: sock,
		                    });
		                    // If sock is undefined, assign it here.
		                    sock = sock || result.socket;
		                }
		                if (typeof callback === 'function') {
		                    callback(null, { socket: sock });
		                    resolve({ socket: sock }); // Resolves pending promise (prevents memory leaks).
		                }
		                else {
		                    resolve({ socket: sock });
		                }
		            }
		            catch (err) {
		                if (typeof callback === 'function') {
		                    callback(err);
		                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
		                    resolve(err); // Resolves pending promise (prevents memory leaks).
		                }
		                else {
		                    reject(err);
		                }
		            }
		        }));
		    }
		    /**
		     * Creates a SOCKS UDP Frame.
		     * @param options
		     */
		    static createUDPFrame(options) {
		        const buff = new smart_buffer_1.SmartBuffer();
		        buff.writeUInt16BE(0);
		        buff.writeUInt8(options.frameNumber || 0);
		        // IPv4/IPv6/Hostname
		        if (net.isIPv4(options.remoteHost.host)) {
		            buff.writeUInt8(constants_1.Socks5HostType.IPv4);
		            buff.writeUInt32BE((0, helpers_1.ipv4ToInt32)(options.remoteHost.host));
		        }
		        else if (net.isIPv6(options.remoteHost.host)) {
		            buff.writeUInt8(constants_1.Socks5HostType.IPv6);
		            buff.writeBuffer((0, helpers_1.ipToBuffer)(options.remoteHost.host));
		        }
		        else {
		            buff.writeUInt8(constants_1.Socks5HostType.Hostname);
		            buff.writeUInt8(Buffer.byteLength(options.remoteHost.host));
		            buff.writeString(options.remoteHost.host);
		        }
		        // Port
		        buff.writeUInt16BE(options.remoteHost.port);
		        // Data
		        buff.writeBuffer(options.data);
		        return buff.toBuffer();
		    }
		    /**
		     * Parses a SOCKS UDP frame.
		     * @param data
		     */
		    static parseUDPFrame(data) {
		        const buff = smart_buffer_1.SmartBuffer.fromBuffer(data);
		        buff.readOffset = 2;
		        const frameNumber = buff.readUInt8();
		        const hostType = buff.readUInt8();
		        let remoteHost;
		        if (hostType === constants_1.Socks5HostType.IPv4) {
		            remoteHost = (0, helpers_1.int32ToIpv4)(buff.readUInt32BE());
		        }
		        else if (hostType === constants_1.Socks5HostType.IPv6) {
		            remoteHost = ip_address_1.Address6.fromByteArray(Array.from(buff.readBuffer(16))).canonicalForm();
		        }
		        else {
		            remoteHost = buff.readString(buff.readUInt8());
		        }
		        const remotePort = buff.readUInt16BE();
		        return {
		            frameNumber,
		            remoteHost: {
		                host: remoteHost,
		                port: remotePort,
		            },
		            data: buff.readBuffer(),
		        };
		    }
		    /**
		     * Internal state setter. If the SocksClient is in an error state, it cannot be changed to a non error state.
		     */
		    setState(newState) {
		        if (this.state !== constants_1.SocksClientState.Error) {
		            this.state = newState;
		        }
		    }
		    /**
		     * Starts the connection establishment to the proxy and destination.
		     * @param existingSocket Connected socket to use instead of creating a new one (internal use).
		     */
		    connect(existingSocket) {
		        this.onDataReceived = (data) => this.onDataReceivedHandler(data);
		        this.onClose = () => this.onCloseHandler();
		        this.onError = (err) => this.onErrorHandler(err);
		        this.onConnect = () => this.onConnectHandler();
		        // Start timeout timer (defaults to 30 seconds)
		        const timer = setTimeout(() => this.onEstablishedTimeout(), this.options.timeout || constants_1.DEFAULT_TIMEOUT);
		        // check whether unref is available as it differs from browser to NodeJS (#33)
		        if (timer.unref && typeof timer.unref === 'function') {
		            timer.unref();
		        }
		        // If an existing socket is provided, use it to negotiate SOCKS handshake. Otherwise create a new Socket.
		        if (existingSocket) {
		            this.socket = existingSocket;
		        }
		        else {
		            this.socket = new net.Socket();
		        }
		        // Attach Socket error handlers.
		        this.socket.once('close', this.onClose);
		        this.socket.once('error', this.onError);
		        this.socket.once('connect', this.onConnect);
		        this.socket.on('data', this.onDataReceived);
		        this.setState(constants_1.SocksClientState.Connecting);
		        this.receiveBuffer = new receivebuffer_1.ReceiveBuffer();
		        if (existingSocket) {
		            this.socket.emit('connect');
		        }
		        else {
		            this.socket.connect(this.getSocketOptions());
		            if (this.options.set_tcp_nodelay !== undefined &&
		                this.options.set_tcp_nodelay !== null) {
		                this.socket.setNoDelay(!!this.options.set_tcp_nodelay);
		            }
		        }
		        // Listen for established event so we can re-emit any excess data received during handshakes.
		        this.prependOnceListener('established', (info) => {
		            setImmediate(() => {
		                if (this.receiveBuffer.length > 0) {
		                    const excessData = this.receiveBuffer.get(this.receiveBuffer.length);
		                    info.socket.emit('data', excessData);
		                }
		                info.socket.resume();
		            });
		        });
		    }
		    // Socket options (defaults host/port to options.proxy.host/options.proxy.port)
		    getSocketOptions() {
		        return Object.assign(Object.assign({}, this.options.socket_options), { host: this.options.proxy.host || this.options.proxy.ipaddress, port: this.options.proxy.port });
		    }
		    /**
		     * Handles internal Socks timeout callback.
		     * Note: If the Socks client is not BoundWaitingForConnection or Established, the connection will be closed.
		     */
		    onEstablishedTimeout() {
		        if (this.state !== constants_1.SocksClientState.Established &&
		            this.state !== constants_1.SocksClientState.BoundWaitingForConnection) {
		            this.closeSocket(constants_1.ERRORS.ProxyConnectionTimedOut);
		        }
		    }
		    /**
		     * Handles Socket connect event.
		     */
		    onConnectHandler() {
		        this.setState(constants_1.SocksClientState.Connected);
		        // Send initial handshake.
		        if (this.options.proxy.type === 4) {
		            this.sendSocks4InitialHandshake();
		        }
		        else {
		            this.sendSocks5InitialHandshake();
		        }
		        this.setState(constants_1.SocksClientState.SentInitialHandshake);
		    }
		    /**
		     * Handles Socket data event.
		     * @param data
		     */
		    onDataReceivedHandler(data) {
		        /*
		          All received data is appended to a ReceiveBuffer.
		          This makes sure that all the data we need is received before we attempt to process it.
		        */
		        this.receiveBuffer.append(data);
		        // Process data that we have.
		        this.processData();
		    }
		    /**
		     * Handles processing of the data we have received.
		     */
		    processData() {
		        // If we have enough data to process the next step in the SOCKS handshake, proceed.
		        while (this.state !== constants_1.SocksClientState.Established &&
		            this.state !== constants_1.SocksClientState.Error &&
		            this.receiveBuffer.length >= this.nextRequiredPacketBufferSize) {
		            // Sent initial handshake, waiting for response.
		            if (this.state === constants_1.SocksClientState.SentInitialHandshake) {
		                if (this.options.proxy.type === 4) {
		                    // Socks v4 only has one handshake response.
		                    this.handleSocks4FinalHandshakeResponse();
		                }
		                else {
		                    // Socks v5 has two handshakes, handle initial one here.
		                    this.handleInitialSocks5HandshakeResponse();
		                }
		                // Sent auth request for Socks v5, waiting for response.
		            }
		            else if (this.state === constants_1.SocksClientState.SentAuthentication) {
		                this.handleInitialSocks5AuthenticationHandshakeResponse();
		                // Sent final Socks v5 handshake, waiting for final response.
		            }
		            else if (this.state === constants_1.SocksClientState.SentFinalHandshake) {
		                this.handleSocks5FinalHandshakeResponse();
		                // Socks BIND established. Waiting for remote connection via proxy.
		            }
		            else if (this.state === constants_1.SocksClientState.BoundWaitingForConnection) {
		                if (this.options.proxy.type === 4) {
		                    this.handleSocks4IncomingConnectionResponse();
		                }
		                else {
		                    this.handleSocks5IncomingConnectionResponse();
		                }
		            }
		            else {
		                this.closeSocket(constants_1.ERRORS.InternalError);
		                break;
		            }
		        }
		    }
		    /**
		     * Handles Socket close event.
		     * @param had_error
		     */
		    onCloseHandler() {
		        this.closeSocket(constants_1.ERRORS.SocketClosed);
		    }
		    /**
		     * Handles Socket error event.
		     * @param err
		     */
		    onErrorHandler(err) {
		        this.closeSocket(err.message);
		    }
		    /**
		     * Removes internal event listeners on the underlying Socket.
		     */
		    removeInternalSocketHandlers() {
		        // Pauses data flow of the socket (this is internally resumed after 'established' is emitted)
		        this.socket.pause();
		        this.socket.removeListener('data', this.onDataReceived);
		        this.socket.removeListener('close', this.onClose);
		        this.socket.removeListener('error', this.onError);
		        this.socket.removeListener('connect', this.onConnect);
		    }
		    /**
		     * Closes and destroys the underlying Socket. Emits an error event.
		     * @param err { String } An error string to include in error event.
		     */
		    closeSocket(err) {
		        // Make sure only one 'error' event is fired for the lifetime of this SocksClient instance.
		        if (this.state !== constants_1.SocksClientState.Error) {
		            // Set internal state to Error.
		            this.setState(constants_1.SocksClientState.Error);
		            // Destroy Socket
		            this.socket.destroy();
		            // Remove internal listeners
		            this.removeInternalSocketHandlers();
		            // Fire 'error' event.
		            this.emit('error', new util_1.SocksClientError(err, this.options));
		        }
		    }
		    /**
		     * Sends initial Socks v4 handshake request.
		     */
		    sendSocks4InitialHandshake() {
		        const userId = this.options.proxy.userId || '';
		        const buff = new smart_buffer_1.SmartBuffer();
		        buff.writeUInt8(0x04);
		        buff.writeUInt8(constants_1.SocksCommand[this.options.command]);
		        buff.writeUInt16BE(this.options.destination.port);
		        // Socks 4 (IPv4)
		        if (net.isIPv4(this.options.destination.host)) {
		            buff.writeBuffer((0, helpers_1.ipToBuffer)(this.options.destination.host));
		            buff.writeStringNT(userId);
		            // Socks 4a (hostname)
		        }
		        else {
		            buff.writeUInt8(0x00);
		            buff.writeUInt8(0x00);
		            buff.writeUInt8(0x00);
		            buff.writeUInt8(0x01);
		            buff.writeStringNT(userId);
		            buff.writeStringNT(this.options.destination.host);
		        }
		        this.nextRequiredPacketBufferSize =
		            constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks4Response;
		        this.socket.write(buff.toBuffer());
		    }
		    /**
		     * Handles Socks v4 handshake response.
		     * @param data
		     */
		    handleSocks4FinalHandshakeResponse() {
		        const data = this.receiveBuffer.get(8);
		        if (data[1] !== constants_1.Socks4Response.Granted) {
		            this.closeSocket(`${constants_1.ERRORS.Socks4ProxyRejectedConnection} - (${constants_1.Socks4Response[data[1]]})`);
		        }
		        else {
		            // Bind response
		            if (constants_1.SocksCommand[this.options.command] === constants_1.SocksCommand.bind) {
		                const buff = smart_buffer_1.SmartBuffer.fromBuffer(data);
		                buff.readOffset = 2;
		                const remoteHost = {
		                    port: buff.readUInt16BE(),
		                    host: (0, helpers_1.int32ToIpv4)(buff.readUInt32BE()),
		                };
		                // If host is 0.0.0.0, set to proxy host.
		                if (remoteHost.host === '0.0.0.0') {
		                    remoteHost.host = this.options.proxy.ipaddress;
		                }
		                this.setState(constants_1.SocksClientState.BoundWaitingForConnection);
		                this.emit('bound', { remoteHost, socket: this.socket });
		                // Connect response
		            }
		            else {
		                this.setState(constants_1.SocksClientState.Established);
		                this.removeInternalSocketHandlers();
		                this.emit('established', { socket: this.socket });
		            }
		        }
		    }
		    /**
		     * Handles Socks v4 incoming connection request (BIND)
		     * @param data
		     */
		    handleSocks4IncomingConnectionResponse() {
		        const data = this.receiveBuffer.get(8);
		        if (data[1] !== constants_1.Socks4Response.Granted) {
		            this.closeSocket(`${constants_1.ERRORS.Socks4ProxyRejectedIncomingBoundConnection} - (${constants_1.Socks4Response[data[1]]})`);
		        }
		        else {
		            const buff = smart_buffer_1.SmartBuffer.fromBuffer(data);
		            buff.readOffset = 2;
		            const remoteHost = {
		                port: buff.readUInt16BE(),
		                host: (0, helpers_1.int32ToIpv4)(buff.readUInt32BE()),
		            };
		            this.setState(constants_1.SocksClientState.Established);
		            this.removeInternalSocketHandlers();
		            this.emit('established', { remoteHost, socket: this.socket });
		        }
		    }
		    /**
		     * Sends initial Socks v5 handshake request.
		     */
		    sendSocks5InitialHandshake() {
		        const buff = new smart_buffer_1.SmartBuffer();
		        // By default we always support no auth.
		        const supportedAuthMethods = [constants_1.Socks5Auth.NoAuth];
		        // We should only tell the proxy we support user/pass auth if auth info is actually provided.
		        // Note: As of Tor v0.3.5.7+, if user/pass auth is an option from the client, by default it will always take priority.
		        if (this.options.proxy.userId || this.options.proxy.password) {
		            supportedAuthMethods.push(constants_1.Socks5Auth.UserPass);
		        }
		        // Custom auth method?
		        if (this.options.proxy.custom_auth_method !== undefined) {
		            supportedAuthMethods.push(this.options.proxy.custom_auth_method);
		        }
		        // Build handshake packet
		        buff.writeUInt8(0x05);
		        buff.writeUInt8(supportedAuthMethods.length);
		        for (const authMethod of supportedAuthMethods) {
		            buff.writeUInt8(authMethod);
		        }
		        this.nextRequiredPacketBufferSize =
		            constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5InitialHandshakeResponse;
		        this.socket.write(buff.toBuffer());
		        this.setState(constants_1.SocksClientState.SentInitialHandshake);
		    }
		    /**
		     * Handles initial Socks v5 handshake response.
		     * @param data
		     */
		    handleInitialSocks5HandshakeResponse() {
		        const data = this.receiveBuffer.get(2);
		        if (data[0] !== 0x05) {
		            this.closeSocket(constants_1.ERRORS.InvalidSocks5IntiailHandshakeSocksVersion);
		        }
		        else if (data[1] === constants_1.SOCKS5_NO_ACCEPTABLE_AUTH) {
		            this.closeSocket(constants_1.ERRORS.InvalidSocks5InitialHandshakeNoAcceptedAuthType);
		        }
		        else {
		            // If selected Socks v5 auth method is no auth, send final handshake request.
		            if (data[1] === constants_1.Socks5Auth.NoAuth) {
		                this.socks5ChosenAuthType = constants_1.Socks5Auth.NoAuth;
		                this.sendSocks5CommandRequest();
		                // If selected Socks v5 auth method is user/password, send auth handshake.
		            }
		            else if (data[1] === constants_1.Socks5Auth.UserPass) {
		                this.socks5ChosenAuthType = constants_1.Socks5Auth.UserPass;
		                this.sendSocks5UserPassAuthentication();
		                // If selected Socks v5 auth method is the custom_auth_method, send custom handshake.
		            }
		            else if (data[1] === this.options.proxy.custom_auth_method) {
		                this.socks5ChosenAuthType = this.options.proxy.custom_auth_method;
		                this.sendSocks5CustomAuthentication();
		            }
		            else {
		                this.closeSocket(constants_1.ERRORS.InvalidSocks5InitialHandshakeUnknownAuthType);
		            }
		        }
		    }
		    /**
		     * Sends Socks v5 user & password auth handshake.
		     *
		     * Note: No auth and user/pass are currently supported.
		     */
		    sendSocks5UserPassAuthentication() {
		        const userId = this.options.proxy.userId || '';
		        const password = this.options.proxy.password || '';
		        const buff = new smart_buffer_1.SmartBuffer();
		        buff.writeUInt8(0x01);
		        buff.writeUInt8(Buffer.byteLength(userId));
		        buff.writeString(userId);
		        buff.writeUInt8(Buffer.byteLength(password));
		        buff.writeString(password);
		        this.nextRequiredPacketBufferSize =
		            constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5UserPassAuthenticationResponse;
		        this.socket.write(buff.toBuffer());
		        this.setState(constants_1.SocksClientState.SentAuthentication);
		    }
		    sendSocks5CustomAuthentication() {
		        return __awaiter(this, void 0, void 0, function* () {
		            this.nextRequiredPacketBufferSize =
		                this.options.proxy.custom_auth_response_size;
		            this.socket.write(yield this.options.proxy.custom_auth_request_handler());
		            this.setState(constants_1.SocksClientState.SentAuthentication);
		        });
		    }
		    handleSocks5CustomAuthHandshakeResponse(data) {
		        return __awaiter(this, void 0, void 0, function* () {
		            return yield this.options.proxy.custom_auth_response_handler(data);
		        });
		    }
		    handleSocks5AuthenticationNoAuthHandshakeResponse(data) {
		        return __awaiter(this, void 0, void 0, function* () {
		            return data[1] === 0x00;
		        });
		    }
		    handleSocks5AuthenticationUserPassHandshakeResponse(data) {
		        return __awaiter(this, void 0, void 0, function* () {
		            return data[1] === 0x00;
		        });
		    }
		    /**
		     * Handles Socks v5 auth handshake response.
		     * @param data
		     */
		    handleInitialSocks5AuthenticationHandshakeResponse() {
		        return __awaiter(this, void 0, void 0, function* () {
		            this.setState(constants_1.SocksClientState.ReceivedAuthenticationResponse);
		            let authResult = false;
		            if (this.socks5ChosenAuthType === constants_1.Socks5Auth.NoAuth) {
		                authResult = yield this.handleSocks5AuthenticationNoAuthHandshakeResponse(this.receiveBuffer.get(2));
		            }
		            else if (this.socks5ChosenAuthType === constants_1.Socks5Auth.UserPass) {
		                authResult =
		                    yield this.handleSocks5AuthenticationUserPassHandshakeResponse(this.receiveBuffer.get(2));
		            }
		            else if (this.socks5ChosenAuthType === this.options.proxy.custom_auth_method) {
		                authResult = yield this.handleSocks5CustomAuthHandshakeResponse(this.receiveBuffer.get(this.options.proxy.custom_auth_response_size));
		            }
		            if (!authResult) {
		                this.closeSocket(constants_1.ERRORS.Socks5AuthenticationFailed);
		            }
		            else {
		                this.sendSocks5CommandRequest();
		            }
		        });
		    }
		    /**
		     * Sends Socks v5 final handshake request.
		     */
		    sendSocks5CommandRequest() {
		        const buff = new smart_buffer_1.SmartBuffer();
		        buff.writeUInt8(0x05);
		        buff.writeUInt8(constants_1.SocksCommand[this.options.command]);
		        buff.writeUInt8(0x00);
		        // ipv4, ipv6, domain?
		        if (net.isIPv4(this.options.destination.host)) {
		            buff.writeUInt8(constants_1.Socks5HostType.IPv4);
		            buff.writeBuffer((0, helpers_1.ipToBuffer)(this.options.destination.host));
		        }
		        else if (net.isIPv6(this.options.destination.host)) {
		            buff.writeUInt8(constants_1.Socks5HostType.IPv6);
		            buff.writeBuffer((0, helpers_1.ipToBuffer)(this.options.destination.host));
		        }
		        else {
		            buff.writeUInt8(constants_1.Socks5HostType.Hostname);
		            buff.writeUInt8(this.options.destination.host.length);
		            buff.writeString(this.options.destination.host);
		        }
		        buff.writeUInt16BE(this.options.destination.port);
		        this.nextRequiredPacketBufferSize =
		            constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseHeader;
		        this.socket.write(buff.toBuffer());
		        this.setState(constants_1.SocksClientState.SentFinalHandshake);
		    }
		    /**
		     * Handles Socks v5 final handshake response.
		     * @param data
		     */
		    handleSocks5FinalHandshakeResponse() {
		        // Peek at available data (we need at least 5 bytes to get the hostname length)
		        const header = this.receiveBuffer.peek(5);
		        if (header[0] !== 0x05 || header[1] !== constants_1.Socks5Response.Granted) {
		            this.closeSocket(`${constants_1.ERRORS.InvalidSocks5FinalHandshakeRejected} - ${constants_1.Socks5Response[header[1]]}`);
		        }
		        else {
		            // Read address type
		            const addressType = header[3];
		            let remoteHost;
		            let buff;
		            // IPv4
		            if (addressType === constants_1.Socks5HostType.IPv4) {
		                // Check if data is available.
		                const dataNeeded = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseIPv4;
		                if (this.receiveBuffer.length < dataNeeded) {
		                    this.nextRequiredPacketBufferSize = dataNeeded;
		                    return;
		                }
		                buff = smart_buffer_1.SmartBuffer.fromBuffer(this.receiveBuffer.get(dataNeeded).slice(4));
		                remoteHost = {
		                    host: (0, helpers_1.int32ToIpv4)(buff.readUInt32BE()),
		                    port: buff.readUInt16BE(),
		                };
		                // If given host is 0.0.0.0, assume remote proxy ip instead.
		                if (remoteHost.host === '0.0.0.0') {
		                    remoteHost.host = this.options.proxy.ipaddress;
		                }
		                // Hostname
		            }
		            else if (addressType === constants_1.Socks5HostType.Hostname) {
		                const hostLength = header[4];
		                const dataNeeded = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseHostname(hostLength); // header + host length + host + port
		                // Check if data is available.
		                if (this.receiveBuffer.length < dataNeeded) {
		                    this.nextRequiredPacketBufferSize = dataNeeded;
		                    return;
		                }
		                buff = smart_buffer_1.SmartBuffer.fromBuffer(this.receiveBuffer.get(dataNeeded).slice(5));
		                remoteHost = {
		                    host: buff.readString(hostLength),
		                    port: buff.readUInt16BE(),
		                };
		                // IPv6
		            }
		            else if (addressType === constants_1.Socks5HostType.IPv6) {
		                // Check if data is available.
		                const dataNeeded = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseIPv6;
		                if (this.receiveBuffer.length < dataNeeded) {
		                    this.nextRequiredPacketBufferSize = dataNeeded;
		                    return;
		                }
		                buff = smart_buffer_1.SmartBuffer.fromBuffer(this.receiveBuffer.get(dataNeeded).slice(4));
		                remoteHost = {
		                    host: ip_address_1.Address6.fromByteArray(Array.from(buff.readBuffer(16))).canonicalForm(),
		                    port: buff.readUInt16BE(),
		                };
		            }
		            // We have everything we need
		            this.setState(constants_1.SocksClientState.ReceivedFinalResponse);
		            // If using CONNECT, the client is now in the established state.
		            if (constants_1.SocksCommand[this.options.command] === constants_1.SocksCommand.connect) {
		                this.setState(constants_1.SocksClientState.Established);
		                this.removeInternalSocketHandlers();
		                this.emit('established', { remoteHost, socket: this.socket });
		            }
		            else if (constants_1.SocksCommand[this.options.command] === constants_1.SocksCommand.bind) {
		                /* If using BIND, the Socks client is now in BoundWaitingForConnection state.
		                   This means that the remote proxy server is waiting for a remote connection to the bound port. */
		                this.setState(constants_1.SocksClientState.BoundWaitingForConnection);
		                this.nextRequiredPacketBufferSize =
		                    constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseHeader;
		                this.emit('bound', { remoteHost, socket: this.socket });
		                /*
		                  If using Associate, the Socks client is now Established. And the proxy server is now accepting UDP packets at the
		                  given bound port. This initial Socks TCP connection must remain open for the UDP relay to continue to work.
		                */
		            }
		            else if (constants_1.SocksCommand[this.options.command] === constants_1.SocksCommand.associate) {
		                this.setState(constants_1.SocksClientState.Established);
		                this.removeInternalSocketHandlers();
		                this.emit('established', {
		                    remoteHost,
		                    socket: this.socket,
		                });
		            }
		        }
		    }
		    /**
		     * Handles Socks v5 incoming connection request (BIND).
		     */
		    handleSocks5IncomingConnectionResponse() {
		        // Peek at available data (we need at least 5 bytes to get the hostname length)
		        const header = this.receiveBuffer.peek(5);
		        if (header[0] !== 0x05 || header[1] !== constants_1.Socks5Response.Granted) {
		            this.closeSocket(`${constants_1.ERRORS.Socks5ProxyRejectedIncomingBoundConnection} - ${constants_1.Socks5Response[header[1]]}`);
		        }
		        else {
		            // Read address type
		            const addressType = header[3];
		            let remoteHost;
		            let buff;
		            // IPv4
		            if (addressType === constants_1.Socks5HostType.IPv4) {
		                // Check if data is available.
		                const dataNeeded = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseIPv4;
		                if (this.receiveBuffer.length < dataNeeded) {
		                    this.nextRequiredPacketBufferSize = dataNeeded;
		                    return;
		                }
		                buff = smart_buffer_1.SmartBuffer.fromBuffer(this.receiveBuffer.get(dataNeeded).slice(4));
		                remoteHost = {
		                    host: (0, helpers_1.int32ToIpv4)(buff.readUInt32BE()),
		                    port: buff.readUInt16BE(),
		                };
		                // If given host is 0.0.0.0, assume remote proxy ip instead.
		                if (remoteHost.host === '0.0.0.0') {
		                    remoteHost.host = this.options.proxy.ipaddress;
		                }
		                // Hostname
		            }
		            else if (addressType === constants_1.Socks5HostType.Hostname) {
		                const hostLength = header[4];
		                const dataNeeded = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseHostname(hostLength); // header + host length + port
		                // Check if data is available.
		                if (this.receiveBuffer.length < dataNeeded) {
		                    this.nextRequiredPacketBufferSize = dataNeeded;
		                    return;
		                }
		                buff = smart_buffer_1.SmartBuffer.fromBuffer(this.receiveBuffer.get(dataNeeded).slice(5));
		                remoteHost = {
		                    host: buff.readString(hostLength),
		                    port: buff.readUInt16BE(),
		                };
		                // IPv6
		            }
		            else if (addressType === constants_1.Socks5HostType.IPv6) {
		                // Check if data is available.
		                const dataNeeded = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseIPv6;
		                if (this.receiveBuffer.length < dataNeeded) {
		                    this.nextRequiredPacketBufferSize = dataNeeded;
		                    return;
		                }
		                buff = smart_buffer_1.SmartBuffer.fromBuffer(this.receiveBuffer.get(dataNeeded).slice(4));
		                remoteHost = {
		                    host: ip_address_1.Address6.fromByteArray(Array.from(buff.readBuffer(16))).canonicalForm(),
		                    port: buff.readUInt16BE(),
		                };
		            }
		            this.setState(constants_1.SocksClientState.Established);
		            this.removeInternalSocketHandlers();
		            this.emit('established', { remoteHost, socket: this.socket });
		        }
		    }
		    get socksClientOptions() {
		        return Object.assign({}, this.options);
		    }
		}
		exports.SocksClient = SocksClient;
		
	} (socksclient));
	return socksclient;
}

var hasRequiredBuild;

function requireBuild () {
	if (hasRequiredBuild) return build;
	hasRequiredBuild = 1;
	(function (exports) {
		var __createBinding = (build && build.__createBinding) || (Object.create ? (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    var desc = Object.getOwnPropertyDescriptor(m, k);
		    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
		      desc = { enumerable: true, get: function() { return m[k]; } };
		    }
		    Object.defineProperty(o, k2, desc);
		}) : (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    o[k2] = m[k];
		}));
		var __exportStar = (build && build.__exportStar) || function(m, exports) {
		    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		__exportStar(requireSocksclient(), exports);
		
	} (build));
	return build;
}

var hasRequiredChain_socks;

function requireChain_socks () {
	if (hasRequiredChain_socks) return chain_socks;
	hasRequiredChain_socks = 1;
	Object.defineProperty(chain_socks, "__esModule", { value: true });
	chain_socks.chainSocks = void 0;
	const node_url_1 = require$$0$4;
	const socks_1 = requireBuild();
	const statuses_1 = requireStatuses();
	const count_target_bytes_1 = requireCount_target_bytes();
	const socksProtocolToVersionNumber = (protocol) => {
	    switch (protocol) {
	        case 'socks4:':
	        case 'socks4a:':
	            return 4;
	        default:
	            return 5;
	    }
	};
	/**
	 * Client -> Apify (CONNECT) -> Upstream (SOCKS) -> Web
	 * Client <- Apify (CONNECT) <- Upstream (SOCKS) <- Web
	 */
	const chainSocks = async ({ request, sourceSocket, head, server, handlerOpts, }) => {
	    const { proxyChainId } = sourceSocket;
	    const { hostname, port, username, password } = handlerOpts.upstreamProxyUrlParsed;
	    const proxy = {
	        host: hostname,
	        port: Number(port),
	        type: socksProtocolToVersionNumber(handlerOpts.upstreamProxyUrlParsed.protocol),
	        userId: decodeURIComponent(username),
	        password: decodeURIComponent(password),
	    };
	    if (head && head.length > 0) {
	        // HTTP/1.1 has no defined semantics when sending payload along with CONNECT and servers can reject the request.
	        // HTTP/2 only says that subsequent DATA frames must be transferred after HEADERS has been sent.
	        // HTTP/3 says that all DATA frames should be transferred (implies pre-HEADERS data).
	        //
	        // Let's go with the HTTP/3 behavior.
	        // There are also clients that send payload along with CONNECT to save milliseconds apparently.
	        // Beware of upstream proxy servers that send out valid CONNECT responses with diagnostic data such as IPs!
	        sourceSocket.unshift(head);
	    }
	    const url = new node_url_1.URL(`connect://${request.url}`);
	    const destination = {
	        port: Number(url.port),
	        host: url.hostname,
	    };
	    let targetSocket;
	    try {
	        const client = await socks_1.SocksClient.createConnection({
	            proxy,
	            command: 'connect',
	            destination,
	        });
	        targetSocket = client.socket;
	        sourceSocket.write(`HTTP/1.1 200 Connection Established\r\n\r\n`);
	    }
	    catch (error) {
	        const socksError = error;
	        server.log(proxyChainId, `Failed to connect to upstream SOCKS proxy ${socksError.stack}`);
	        sourceSocket.end((0, statuses_1.createCustomStatusHttpResponse)((0, statuses_1.socksErrorMessageToStatusCode)(socksError.message), socksError.message));
	        return;
	    }
	    (0, count_target_bytes_1.countTargetBytes)(sourceSocket, targetSocket);
	    sourceSocket.pipe(targetSocket);
	    targetSocket.pipe(sourceSocket);
	    // Once target socket closes forcibly, the source socket gets paused.
	    // We need to enable flowing, otherwise the socket would remain open indefinitely.
	    // Nothing would consume the data, we just want to close the socket.
	    targetSocket.on('close', () => {
	        sourceSocket.resume();
	        if (sourceSocket.writable) {
	            sourceSocket.end();
	        }
	    });
	    // Same here.
	    sourceSocket.on('close', () => {
	        targetSocket.resume();
	        if (targetSocket.writable) {
	            targetSocket.end();
	        }
	    });
	    targetSocket.on('error', (error) => {
	        server.log(proxyChainId, `Chain SOCKS Destination Socket Error: ${error.stack}`);
	        sourceSocket.destroy();
	    });
	    sourceSocket.on('error', (error) => {
	        server.log(proxyChainId, `Chain SOCKS Source Socket Error: ${error.stack}`);
	        targetSocket.destroy();
	    });
	};
	chain_socks.chainSocks = chainSocks;
	
	return chain_socks;
}

var custom_connect = {};

var hasRequiredCustom_connect;

function requireCustom_connect () {
	if (hasRequiredCustom_connect) return custom_connect;
	hasRequiredCustom_connect = 1;
	Object.defineProperty(custom_connect, "__esModule", { value: true });
	custom_connect.customConnect = void 0;
	const node_util_1 = require$$0$5;
	const customConnect = async (socket, server) => {
	    // `countTargetBytes(socket, socket)` is incorrect here since `socket` is not a target.
	    // We would have to create a new stream and pipe traffic through that,
	    // however this would also increase CPU usage.
	    // Also, counting bytes here is not correct since we don't know how the response is generated
	    // (whether any additional sockets are used).
	    const asyncWrite = (0, node_util_1.promisify)(socket.write).bind(socket);
	    await asyncWrite('HTTP/1.1 200 Connection Established\r\n\r\n');
	    server.emit('connection', socket);
	    return new Promise((resolve) => {
	        if (socket.destroyed) {
	            resolve();
	            return;
	        }
	        socket.once('close', () => {
	            resolve();
	        });
	    });
	};
	custom_connect.customConnect = customConnect;
	
	return custom_connect;
}

var custom_response = {};

var hasRequiredCustom_response;

function requireCustom_response () {
	if (hasRequiredCustom_response) return custom_response;
	hasRequiredCustom_response = 1;
	Object.defineProperty(custom_response, "__esModule", { value: true });
	custom_response.handleCustomResponse = void 0;
	const handleCustomResponse = async (_request, response, handlerOpts) => {
	    const { customResponseFunction } = handlerOpts;
	    if (!customResponseFunction) {
	        throw new Error('The "customResponseFunction" option is required');
	    }
	    const customResponse = await customResponseFunction();
	    if (typeof customResponse !== 'object' || customResponse === null) {
	        throw new Error('The user-provided "customResponseFunction" must return an object.');
	    }
	    response.statusCode = customResponse.statusCode || 200;
	    if (customResponse.headers) {
	        for (const [key, value] of Object.entries(customResponse.headers)) {
	            response.setHeader(key, value);
	        }
	    }
	    response.end(customResponse.body, customResponse.encoding);
	};
	custom_response.handleCustomResponse = handleCustomResponse;
	
	return custom_response;
}

var direct = {};

var hasRequiredDirect;

function requireDirect () {
	if (hasRequiredDirect) return direct;
	hasRequiredDirect = 1;
	Object.defineProperty(direct, "__esModule", { value: true });
	direct.direct = void 0;
	const tslib_1 = require$$0;
	const node_net_1 = tslib_1.__importDefault(require$$1$2);
	const node_url_1 = require$$0$4;
	const count_target_bytes_1 = requireCount_target_bytes();
	/**
	 * Directly connects to the target.
	 * Client -> Apify (CONNECT) -> Web
	 * Client <- Apify (CONNECT) <- Web
	 */
	const direct$1 = ({ request, sourceSocket, head, server, handlerOpts, }) => {
	    const url = new node_url_1.URL(`connect://${request.url}`);
	    if (!url.hostname) {
	        throw new Error('Missing CONNECT hostname');
	    }
	    if (!url.port) {
	        throw new Error('Missing CONNECT port');
	    }
	    if (head.length > 0) {
	        // See comment in chain.ts
	        sourceSocket.unshift(head);
	    }
	    const options = {
	        port: Number(url.port),
	        host: url.hostname,
	        localAddress: handlerOpts.localAddress,
	        family: handlerOpts.ipFamily,
	        lookup: handlerOpts.dnsLookup,
	    };
	    if (options.host[0] === '[') {
	        options.host = options.host.slice(1, -1);
	    }
	    const targetSocket = node_net_1.default.createConnection(options, () => {
	        try {
	            sourceSocket.write(`HTTP/1.1 200 Connection Established\r\n\r\n`);
	        }
	        catch (error) {
	            sourceSocket.destroy(error);
	        }
	    });
	    (0, count_target_bytes_1.countTargetBytes)(sourceSocket, targetSocket);
	    sourceSocket.pipe(targetSocket);
	    targetSocket.pipe(sourceSocket);
	    // Once target socket closes forcibly, the source socket gets paused.
	    // We need to enable flowing, otherwise the socket would remain open indefinitely.
	    // Nothing would consume the data, we just want to close the socket.
	    targetSocket.on('close', () => {
	        sourceSocket.resume();
	        if (sourceSocket.writable) {
	            sourceSocket.end();
	        }
	    });
	    // Same here.
	    sourceSocket.on('close', () => {
	        targetSocket.resume();
	        if (targetSocket.writable) {
	            targetSocket.end();
	        }
	    });
	    const { proxyChainId } = sourceSocket;
	    targetSocket.on('error', (error) => {
	        server.log(proxyChainId, `Direct Destination Socket Error: ${error.stack}`);
	        sourceSocket.destroy();
	    });
	    sourceSocket.on('error', (error) => {
	        server.log(proxyChainId, `Direct Source Socket Error: ${error.stack}`);
	        targetSocket.destroy();
	    });
	};
	direct.direct = direct$1;
	
	return direct;
}

var forward = {};

var valid_headers_only = {};

var is_hop_by_hop_header = {};

var hasRequiredIs_hop_by_hop_header;

function requireIs_hop_by_hop_header () {
	if (hasRequiredIs_hop_by_hop_header) return is_hop_by_hop_header;
	hasRequiredIs_hop_by_hop_header = 1;
	Object.defineProperty(is_hop_by_hop_header, "__esModule", { value: true });
	is_hop_by_hop_header.isHopByHopHeader = void 0;
	// As per HTTP specification, hop-by-hop headers should be consumed but the proxy, and not forwarded
	const hopByHopHeaders = [
	    'connection',
	    'keep-alive',
	    'proxy-authenticate',
	    'proxy-authorization',
	    'te',
	    'trailer',
	    'transfer-encoding',
	    'upgrade',
	];
	const isHopByHopHeader = (header) => hopByHopHeaders.includes(header.toLowerCase());
	is_hop_by_hop_header.isHopByHopHeader = isHopByHopHeader;
	
	return is_hop_by_hop_header;
}

var hasRequiredValid_headers_only;

function requireValid_headers_only () {
	if (hasRequiredValid_headers_only) return valid_headers_only;
	hasRequiredValid_headers_only = 1;
	Object.defineProperty(valid_headers_only, "__esModule", { value: true });
	valid_headers_only.validHeadersOnly = void 0;
	const node_http_1 = require$$1$1;
	const is_hop_by_hop_header_1 = requireIs_hop_by_hop_header();
	/**
	 * @see https://nodejs.org/api/http.html#http_message_rawheaders
	 */
	const validHeadersOnly = (rawHeaders) => {
	    const result = [];
	    let containsHost = false;
	    for (let i = 0; i < rawHeaders.length; i += 2) {
	        const name = rawHeaders[i];
	        const value = rawHeaders[i + 1];
	        try {
	            (0, node_http_1.validateHeaderName)(name);
	            (0, node_http_1.validateHeaderValue)(name, value);
	        }
	        catch {
	            continue;
	        }
	        if ((0, is_hop_by_hop_header_1.isHopByHopHeader)(name)) {
	            continue;
	        }
	        if (name.toLowerCase() === 'host') {
	            if (containsHost) {
	                continue;
	            }
	            containsHost = true;
	        }
	        result.push(name, value);
	    }
	    return result;
	};
	valid_headers_only.validHeadersOnly = validHeadersOnly;
	
	return valid_headers_only;
}

var hasRequiredForward;

function requireForward () {
	if (hasRequiredForward) return forward;
	hasRequiredForward = 1;
	Object.defineProperty(forward, "__esModule", { value: true });
	forward.forward = void 0;
	const tslib_1 = require$$0;
	const node_http_1 = tslib_1.__importDefault(require$$1$1);
	const node_https_1 = tslib_1.__importDefault(require$$2$1);
	const node_stream_1 = tslib_1.__importDefault(require$$3$1);
	const node_util_1 = tslib_1.__importDefault(require$$0$5);
	const statuses_1 = requireStatuses();
	const count_target_bytes_1 = requireCount_target_bytes();
	const get_basic_1 = requireGet_basic();
	const valid_headers_only_1 = requireValid_headers_only();
	const pipeline = node_util_1.default.promisify(node_stream_1.default.pipeline);
	/**
	 * The request is read from the client and is resent.
	 * This is similar to Direct / Chain, however it uses the CONNECT protocol instead.
	 * Forward uses standard HTTP methods.
	 *
	 * ```
	 * Client -> Apify (HTTP) -> Web
	 * Client <- Apify (HTTP) <- Web
	 * ```
	 *
	 * or
	 *
	 * ```
	 * Client -> Apify (HTTP) -> Upstream (HTTP) -> Web
	 * Client <- Apify (HTTP) <- Upstream (HTTP) <- Web
	 * ```
	 */
	const forward$1 = async (request, response, handlerOpts) => new Promise(async (resolve, reject) => {
	    const proxy = handlerOpts.upstreamProxyUrlParsed;
	    const origin = proxy ? proxy.origin : request.url;
	    const options = {
	        method: request.method,
	        headers: (0, valid_headers_only_1.validHeadersOnly)(request.rawHeaders),
	        insecureHTTPParser: true,
	        localAddress: handlerOpts.localAddress,
	        family: handlerOpts.ipFamily,
	        lookup: handlerOpts.dnsLookup,
	    };
	    // In case of proxy the path needs to be an absolute URL
	    if (proxy) {
	        options.path = request.url;
	        try {
	            if (proxy.username || proxy.password) {
	                options.headers.push('proxy-authorization', (0, get_basic_1.getBasicAuthorizationHeader)(proxy));
	            }
	        }
	        catch (error) {
	            reject(error);
	            return;
	        }
	    }
	    const requestCallback = async (clientResponse) => {
	        try {
	            // This is necessary to prevent Node.js throwing an error
	            let statusCode = clientResponse.statusCode;
	            if (statusCode < 100 || statusCode > 999) {
	                statusCode = statuses_1.badGatewayStatusCodes.STATUS_CODE_OUT_OF_RANGE;
	            }
	            // 407 is handled separately
	            if (clientResponse.statusCode === 407) {
	                reject(new Error('407 Proxy Authentication Required'));
	                return;
	            }
	            response.writeHead(statusCode, clientResponse.statusMessage, (0, valid_headers_only_1.validHeadersOnly)(clientResponse.rawHeaders));
	            // `pipeline` automatically handles all the events and data
	            await pipeline(clientResponse, response);
	            resolve();
	        }
	        catch {
	            // Client error, pipeline already destroys the streams, ignore.
	            resolve();
	        }
	    };
	    // We have to force cast `options` because @types/node doesn't support an array.
	    const client = origin.startsWith('https:')
	        ? node_https_1.default.request(origin, {
	            ...options,
	            rejectUnauthorized: handlerOpts.upstreamProxyUrlParsed ? !handlerOpts.ignoreUpstreamProxyCertificate : undefined,
	        }, requestCallback)
	        : node_http_1.default.request(origin, options, requestCallback);
	    client.once('socket', (socket) => {
	        // Socket can be re-used by multiple requests.
	        // That's why we need to track the previous stats.
	        socket.previousBytesRead = socket.bytesRead;
	        socket.previousBytesWritten = socket.bytesWritten;
	        (0, count_target_bytes_1.countTargetBytes)(request.socket, socket, (handler) => response.once('close', handler));
	    });
	    // Can't use pipeline here as it automatically destroys the streams
	    request.pipe(client);
	    client.on('error', (error) => {
	        var _a;
	        if (response.headersSent) {
	            return;
	        }
	        const statusCode = (_a = statuses_1.errorCodeToStatusCode[error.code]) !== null && _a !== void 0 ? _a : statuses_1.badGatewayStatusCodes.GENERIC_ERROR;
	        response.statusCode = !proxy && error.code === 'ENOTFOUND' ? 404 : statusCode;
	        response.setHeader('content-type', 'text/plain; charset=utf-8');
	        response.end(node_http_1.default.STATUS_CODES[response.statusCode]);
	        resolve();
	    });
	});
	forward.forward = forward$1;
	
	return forward;
}

var forward_socks = {};

var dist$1 = {};

var dist = {};

var helpers = {};

var hasRequiredHelpers;

function requireHelpers () {
	if (hasRequiredHelpers) return helpers;
	hasRequiredHelpers = 1;
	var __createBinding = (helpers && helpers.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (helpers && helpers.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (helpers && helpers.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(helpers, "__esModule", { value: true });
	helpers.req = helpers.json = helpers.toBuffer = void 0;
	const http = __importStar(require$$0$6);
	const https = __importStar(require$$1$3);
	async function toBuffer(stream) {
	    let length = 0;
	    const chunks = [];
	    for await (const chunk of stream) {
	        length += chunk.length;
	        chunks.push(chunk);
	    }
	    return Buffer.concat(chunks, length);
	}
	helpers.toBuffer = toBuffer;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async function json(stream) {
	    const buf = await toBuffer(stream);
	    const str = buf.toString('utf8');
	    try {
	        return JSON.parse(str);
	    }
	    catch (_err) {
	        const err = _err;
	        err.message += ` (input: ${str})`;
	        throw err;
	    }
	}
	helpers.json = json;
	function req(url, opts = {}) {
	    const href = typeof url === 'string' ? url : url.href;
	    const req = (href.startsWith('https:') ? https : http).request(url, opts);
	    const promise = new Promise((resolve, reject) => {
	        req
	            .once('response', resolve)
	            .once('error', reject)
	            .end();
	    });
	    req.then = promise.then.bind(promise);
	    return req;
	}
	helpers.req = req;
	
	return helpers;
}

var hasRequiredDist$2;

function requireDist$2 () {
	if (hasRequiredDist$2) return dist;
	hasRequiredDist$2 = 1;
	(function (exports) {
		var __createBinding = (dist && dist.__createBinding) || (Object.create ? (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    var desc = Object.getOwnPropertyDescriptor(m, k);
		    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
		      desc = { enumerable: true, get: function() { return m[k]; } };
		    }
		    Object.defineProperty(o, k2, desc);
		}) : (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    o[k2] = m[k];
		}));
		var __setModuleDefault = (dist && dist.__setModuleDefault) || (Object.create ? (function(o, v) {
		    Object.defineProperty(o, "default", { enumerable: true, value: v });
		}) : function(o, v) {
		    o["default"] = v;
		});
		var __importStar = (dist && dist.__importStar) || function (mod) {
		    if (mod && mod.__esModule) return mod;
		    var result = {};
		    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
		    __setModuleDefault(result, mod);
		    return result;
		};
		var __exportStar = (dist && dist.__exportStar) || function(m, exports) {
		    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.Agent = void 0;
		const net = __importStar(require$$4$1);
		const http = __importStar(require$$0$6);
		const https_1 = require$$1$3;
		__exportStar(requireHelpers(), exports);
		const INTERNAL = Symbol('AgentBaseInternalState');
		class Agent extends http.Agent {
		    constructor(opts) {
		        super(opts);
		        this[INTERNAL] = {};
		    }
		    /**
		     * Determine whether this is an `http` or `https` request.
		     */
		    isSecureEndpoint(options) {
		        if (options) {
		            // First check the `secureEndpoint` property explicitly, since this
		            // means that a parent `Agent` is "passing through" to this instance.
		            // eslint-disable-next-line @typescript-eslint/no-explicit-any
		            if (typeof options.secureEndpoint === 'boolean') {
		                return options.secureEndpoint;
		            }
		            // If no explicit `secure` endpoint, check if `protocol` property is
		            // set. This will usually be the case since using a full string URL
		            // or `URL` instance should be the most common usage.
		            if (typeof options.protocol === 'string') {
		                return options.protocol === 'https:';
		            }
		        }
		        // Finally, if no `protocol` property was set, then fall back to
		        // checking the stack trace of the current call stack, and try to
		        // detect the "https" module.
		        const { stack } = new Error();
		        if (typeof stack !== 'string')
		            return false;
		        return stack
		            .split('\n')
		            .some((l) => l.indexOf('(https.js:') !== -1 ||
		            l.indexOf('node:https:') !== -1);
		    }
		    // In order to support async signatures in `connect()` and Node's native
		    // connection pooling in `http.Agent`, the array of sockets for each origin
		    // has to be updated synchronously. This is so the length of the array is
		    // accurate when `addRequest()` is next called. We achieve this by creating a
		    // fake socket and adding it to `sockets[origin]` and incrementing
		    // `totalSocketCount`.
		    incrementSockets(name) {
		        // If `maxSockets` and `maxTotalSockets` are both Infinity then there is no
		        // need to create a fake socket because Node.js native connection pooling
		        // will never be invoked.
		        if (this.maxSockets === Infinity && this.maxTotalSockets === Infinity) {
		            return null;
		        }
		        // All instances of `sockets` are expected TypeScript errors. The
		        // alternative is to add it as a private property of this class but that
		        // will break TypeScript subclassing.
		        if (!this.sockets[name]) {
		            // @ts-expect-error `sockets` is readonly in `@types/node`
		            this.sockets[name] = [];
		        }
		        const fakeSocket = new net.Socket({ writable: false });
		        this.sockets[name].push(fakeSocket);
		        // @ts-expect-error `totalSocketCount` isn't defined in `@types/node`
		        this.totalSocketCount++;
		        return fakeSocket;
		    }
		    decrementSockets(name, socket) {
		        if (!this.sockets[name] || socket === null) {
		            return;
		        }
		        const sockets = this.sockets[name];
		        const index = sockets.indexOf(socket);
		        if (index !== -1) {
		            sockets.splice(index, 1);
		            // @ts-expect-error  `totalSocketCount` isn't defined in `@types/node`
		            this.totalSocketCount--;
		            if (sockets.length === 0) {
		                // @ts-expect-error `sockets` is readonly in `@types/node`
		                delete this.sockets[name];
		            }
		        }
		    }
		    // In order to properly update the socket pool, we need to call `getName()` on
		    // the core `https.Agent` if it is a secureEndpoint.
		    getName(options) {
		        const secureEndpoint = this.isSecureEndpoint(options);
		        if (secureEndpoint) {
		            // @ts-expect-error `getName()` isn't defined in `@types/node`
		            return https_1.Agent.prototype.getName.call(this, options);
		        }
		        // @ts-expect-error `getName()` isn't defined in `@types/node`
		        return super.getName(options);
		    }
		    createSocket(req, options, cb) {
		        const connectOpts = {
		            ...options,
		            secureEndpoint: this.isSecureEndpoint(options),
		        };
		        const name = this.getName(connectOpts);
		        const fakeSocket = this.incrementSockets(name);
		        Promise.resolve()
		            .then(() => this.connect(req, connectOpts))
		            .then((socket) => {
		            this.decrementSockets(name, fakeSocket);
		            if (socket instanceof http.Agent) {
		                try {
		                    // @ts-expect-error `addRequest()` isn't defined in `@types/node`
		                    return socket.addRequest(req, connectOpts);
		                }
		                catch (err) {
		                    return cb(err);
		                }
		            }
		            this[INTERNAL].currentSocket = socket;
		            // @ts-expect-error `createSocket()` isn't defined in `@types/node`
		            super.createSocket(req, options, cb);
		        }, (err) => {
		            this.decrementSockets(name, fakeSocket);
		            cb(err);
		        });
		    }
		    createConnection() {
		        const socket = this[INTERNAL].currentSocket;
		        this[INTERNAL].currentSocket = undefined;
		        if (!socket) {
		            throw new Error('No socket was returned in the `connect()` function');
		        }
		        return socket;
		    }
		    get defaultPort() {
		        return (this[INTERNAL].defaultPort ??
		            (this.protocol === 'https:' ? 443 : 80));
		    }
		    set defaultPort(v) {
		        if (this[INTERNAL]) {
		            this[INTERNAL].defaultPort = v;
		        }
		    }
		    get protocol() {
		        return (this[INTERNAL].protocol ??
		            (this.isSecureEndpoint() ? 'https:' : 'http:'));
		    }
		    set protocol(v) {
		        if (this[INTERNAL]) {
		            this[INTERNAL].protocol = v;
		        }
		    }
		}
		exports.Agent = Agent;
		
	} (dist));
	return dist;
}

var src = {exports: {}};

var browser = {exports: {}};

/**
 * Helpers.
 */

var ms;
var hasRequiredMs;

function requireMs () {
	if (hasRequiredMs) return ms;
	hasRequiredMs = 1;
	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var w = d * 7;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

	ms = function (val, options) {
	  options = options || {};
	  var type = typeof val;
	  if (type === 'string' && val.length > 0) {
	    return parse(val);
	  } else if (type === 'number' && isFinite(val)) {
	    return options.long ? fmtLong(val) : fmtShort(val);
	  }
	  throw new Error(
	    'val is not a non-empty string or a valid number. val=' +
	      JSON.stringify(val)
	  );
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = String(str);
	  if (str.length > 100) {
	    return;
	  }
	  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
	    str
	  );
	  if (!match) {
	    return;
	  }
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'weeks':
	    case 'week':
	    case 'w':
	      return n * w;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	    default:
	      return undefined;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtShort(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return Math.round(ms / d) + 'd';
	  }
	  if (msAbs >= h) {
	    return Math.round(ms / h) + 'h';
	  }
	  if (msAbs >= m) {
	    return Math.round(ms / m) + 'm';
	  }
	  if (msAbs >= s) {
	    return Math.round(ms / s) + 's';
	  }
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtLong(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return plural(ms, msAbs, d, 'day');
	  }
	  if (msAbs >= h) {
	    return plural(ms, msAbs, h, 'hour');
	  }
	  if (msAbs >= m) {
	    return plural(ms, msAbs, m, 'minute');
	  }
	  if (msAbs >= s) {
	    return plural(ms, msAbs, s, 'second');
	  }
	  return ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, msAbs, n, name) {
	  var isPlural = msAbs >= n * 1.5;
	  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
	}
	return ms;
}

var common;
var hasRequiredCommon;

function requireCommon () {
	if (hasRequiredCommon) return common;
	hasRequiredCommon = 1;
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 */

	function setup(env) {
		createDebug.debug = createDebug;
		createDebug.default = createDebug;
		createDebug.coerce = coerce;
		createDebug.disable = disable;
		createDebug.enable = enable;
		createDebug.enabled = enabled;
		createDebug.humanize = requireMs();
		createDebug.destroy = destroy;

		Object.keys(env).forEach(key => {
			createDebug[key] = env[key];
		});

		/**
		* The currently active debug mode names, and names to skip.
		*/

		createDebug.names = [];
		createDebug.skips = [];

		/**
		* Map of special "%n" handling functions, for the debug "format" argument.
		*
		* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
		*/
		createDebug.formatters = {};

		/**
		* Selects a color for a debug namespace
		* @param {String} namespace The namespace string for the debug instance to be colored
		* @return {Number|String} An ANSI color code for the given namespace
		* @api private
		*/
		function selectColor(namespace) {
			let hash = 0;

			for (let i = 0; i < namespace.length; i++) {
				hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
				hash |= 0; // Convert to 32bit integer
			}

			return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
		}
		createDebug.selectColor = selectColor;

		/**
		* Create a debugger with the given `namespace`.
		*
		* @param {String} namespace
		* @return {Function}
		* @api public
		*/
		function createDebug(namespace) {
			let prevTime;
			let enableOverride = null;
			let namespacesCache;
			let enabledCache;

			function debug(...args) {
				// Disabled?
				if (!debug.enabled) {
					return;
				}

				const self = debug;

				// Set `diff` timestamp
				const curr = Number(new Date());
				const ms = curr - (prevTime || curr);
				self.diff = ms;
				self.prev = prevTime;
				self.curr = curr;
				prevTime = curr;

				args[0] = createDebug.coerce(args[0]);

				if (typeof args[0] !== 'string') {
					// Anything else let's inspect with %O
					args.unshift('%O');
				}

				// Apply any `formatters` transformations
				let index = 0;
				args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
					// If we encounter an escaped % then don't increase the array index
					if (match === '%%') {
						return '%';
					}
					index++;
					const formatter = createDebug.formatters[format];
					if (typeof formatter === 'function') {
						const val = args[index];
						match = formatter.call(self, val);

						// Now we need to remove `args[index]` since it's inlined in the `format`
						args.splice(index, 1);
						index--;
					}
					return match;
				});

				// Apply env-specific formatting (colors, etc.)
				createDebug.formatArgs.call(self, args);

				const logFn = self.log || createDebug.log;
				logFn.apply(self, args);
			}

			debug.namespace = namespace;
			debug.useColors = createDebug.useColors();
			debug.color = createDebug.selectColor(namespace);
			debug.extend = extend;
			debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

			Object.defineProperty(debug, 'enabled', {
				enumerable: true,
				configurable: false,
				get: () => {
					if (enableOverride !== null) {
						return enableOverride;
					}
					if (namespacesCache !== createDebug.namespaces) {
						namespacesCache = createDebug.namespaces;
						enabledCache = createDebug.enabled(namespace);
					}

					return enabledCache;
				},
				set: v => {
					enableOverride = v;
				}
			});

			// Env-specific initialization logic for debug instances
			if (typeof createDebug.init === 'function') {
				createDebug.init(debug);
			}

			return debug;
		}

		function extend(namespace, delimiter) {
			const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
			newDebug.log = this.log;
			return newDebug;
		}

		/**
		* Enables a debug mode by namespaces. This can include modes
		* separated by a colon and wildcards.
		*
		* @param {String} namespaces
		* @api public
		*/
		function enable(namespaces) {
			createDebug.save(namespaces);
			createDebug.namespaces = namespaces;

			createDebug.names = [];
			createDebug.skips = [];

			const split = (typeof namespaces === 'string' ? namespaces : '')
				.trim()
				.replace(/\s+/g, ',')
				.split(',')
				.filter(Boolean);

			for (const ns of split) {
				if (ns[0] === '-') {
					createDebug.skips.push(ns.slice(1));
				} else {
					createDebug.names.push(ns);
				}
			}
		}

		/**
		 * Checks if the given string matches a namespace template, honoring
		 * asterisks as wildcards.
		 *
		 * @param {String} search
		 * @param {String} template
		 * @return {Boolean}
		 */
		function matchesTemplate(search, template) {
			let searchIndex = 0;
			let templateIndex = 0;
			let starIndex = -1;
			let matchIndex = 0;

			while (searchIndex < search.length) {
				if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === '*')) {
					// Match character or proceed with wildcard
					if (template[templateIndex] === '*') {
						starIndex = templateIndex;
						matchIndex = searchIndex;
						templateIndex++; // Skip the '*'
					} else {
						searchIndex++;
						templateIndex++;
					}
				} else if (starIndex !== -1) { // eslint-disable-line no-negated-condition
					// Backtrack to the last '*' and try to match more characters
					templateIndex = starIndex + 1;
					matchIndex++;
					searchIndex = matchIndex;
				} else {
					return false; // No match
				}
			}

			// Handle trailing '*' in template
			while (templateIndex < template.length && template[templateIndex] === '*') {
				templateIndex++;
			}

			return templateIndex === template.length;
		}

		/**
		* Disable debug output.
		*
		* @return {String} namespaces
		* @api public
		*/
		function disable() {
			const namespaces = [
				...createDebug.names,
				...createDebug.skips.map(namespace => '-' + namespace)
			].join(',');
			createDebug.enable('');
			return namespaces;
		}

		/**
		* Returns true if the given mode name is enabled, false otherwise.
		*
		* @param {String} name
		* @return {Boolean}
		* @api public
		*/
		function enabled(name) {
			for (const skip of createDebug.skips) {
				if (matchesTemplate(name, skip)) {
					return false;
				}
			}

			for (const ns of createDebug.names) {
				if (matchesTemplate(name, ns)) {
					return true;
				}
			}

			return false;
		}

		/**
		* Coerce `val`.
		*
		* @param {Mixed} val
		* @return {Mixed}
		* @api private
		*/
		function coerce(val) {
			if (val instanceof Error) {
				return val.stack || val.message;
			}
			return val;
		}

		/**
		* XXX DO NOT USE. This is a temporary stub function.
		* XXX It WILL be removed in the next major release.
		*/
		function destroy() {
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}

		createDebug.enable(createDebug.load());

		return createDebug;
	}

	common = setup;
	return common;
}

/* eslint-env browser */

var hasRequiredBrowser;

function requireBrowser () {
	if (hasRequiredBrowser) return browser.exports;
	hasRequiredBrowser = 1;
	(function (module, exports) {
		/**
		 * This is the web browser implementation of `debug()`.
		 */

		exports.formatArgs = formatArgs;
		exports.save = save;
		exports.load = load;
		exports.useColors = useColors;
		exports.storage = localstorage();
		exports.destroy = (() => {
			let warned = false;

			return () => {
				if (!warned) {
					warned = true;
					console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
				}
			};
		})();

		/**
		 * Colors.
		 */

		exports.colors = [
			'#0000CC',
			'#0000FF',
			'#0033CC',
			'#0033FF',
			'#0066CC',
			'#0066FF',
			'#0099CC',
			'#0099FF',
			'#00CC00',
			'#00CC33',
			'#00CC66',
			'#00CC99',
			'#00CCCC',
			'#00CCFF',
			'#3300CC',
			'#3300FF',
			'#3333CC',
			'#3333FF',
			'#3366CC',
			'#3366FF',
			'#3399CC',
			'#3399FF',
			'#33CC00',
			'#33CC33',
			'#33CC66',
			'#33CC99',
			'#33CCCC',
			'#33CCFF',
			'#6600CC',
			'#6600FF',
			'#6633CC',
			'#6633FF',
			'#66CC00',
			'#66CC33',
			'#9900CC',
			'#9900FF',
			'#9933CC',
			'#9933FF',
			'#99CC00',
			'#99CC33',
			'#CC0000',
			'#CC0033',
			'#CC0066',
			'#CC0099',
			'#CC00CC',
			'#CC00FF',
			'#CC3300',
			'#CC3333',
			'#CC3366',
			'#CC3399',
			'#CC33CC',
			'#CC33FF',
			'#CC6600',
			'#CC6633',
			'#CC9900',
			'#CC9933',
			'#CCCC00',
			'#CCCC33',
			'#FF0000',
			'#FF0033',
			'#FF0066',
			'#FF0099',
			'#FF00CC',
			'#FF00FF',
			'#FF3300',
			'#FF3333',
			'#FF3366',
			'#FF3399',
			'#FF33CC',
			'#FF33FF',
			'#FF6600',
			'#FF6633',
			'#FF9900',
			'#FF9933',
			'#FFCC00',
			'#FFCC33'
		];

		/**
		 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
		 * and the Firebug extension (any Firefox version) are known
		 * to support "%c" CSS customizations.
		 *
		 * TODO: add a `localStorage` variable to explicitly enable/disable colors
		 */

		// eslint-disable-next-line complexity
		function useColors() {
			// NB: In an Electron preload script, document will be defined but not fully
			// initialized. Since we know we're in Chrome, we'll just detect this case
			// explicitly
			if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
				return true;
			}

			// Internet Explorer and Edge do not support colors.
			if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
				return false;
			}

			let m;

			// Is webkit? http://stackoverflow.com/a/16459606/376773
			// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
			// eslint-disable-next-line no-return-assign
			return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
				// Is firebug? http://stackoverflow.com/a/398120/376773
				(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
				// Is firefox >= v31?
				// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
				(typeof navigator !== 'undefined' && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31) ||
				// Double check webkit in userAgent just in case we are in a worker
				(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
		}

		/**
		 * Colorize log arguments if enabled.
		 *
		 * @api public
		 */

		function formatArgs(args) {
			args[0] = (this.useColors ? '%c' : '') +
				this.namespace +
				(this.useColors ? ' %c' : ' ') +
				args[0] +
				(this.useColors ? '%c ' : ' ') +
				'+' + module.exports.humanize(this.diff);

			if (!this.useColors) {
				return;
			}

			const c = 'color: ' + this.color;
			args.splice(1, 0, c, 'color: inherit');

			// The final "%c" is somewhat tricky, because there could be other
			// arguments passed either before or after the %c, so we need to
			// figure out the correct index to insert the CSS into
			let index = 0;
			let lastC = 0;
			args[0].replace(/%[a-zA-Z%]/g, match => {
				if (match === '%%') {
					return;
				}
				index++;
				if (match === '%c') {
					// We only are interested in the *last* %c
					// (the user may have provided their own)
					lastC = index;
				}
			});

			args.splice(lastC, 0, c);
		}

		/**
		 * Invokes `console.debug()` when available.
		 * No-op when `console.debug` is not a "function".
		 * If `console.debug` is not available, falls back
		 * to `console.log`.
		 *
		 * @api public
		 */
		exports.log = console.debug || console.log || (() => {});

		/**
		 * Save `namespaces`.
		 *
		 * @param {String} namespaces
		 * @api private
		 */
		function save(namespaces) {
			try {
				if (namespaces) {
					exports.storage.setItem('debug', namespaces);
				} else {
					exports.storage.removeItem('debug');
				}
			} catch (error) {
				// Swallow
				// XXX (@Qix-) should we be logging these?
			}
		}

		/**
		 * Load `namespaces`.
		 *
		 * @return {String} returns the previously persisted debug modes
		 * @api private
		 */
		function load() {
			let r;
			try {
				r = exports.storage.getItem('debug') || exports.storage.getItem('DEBUG') ;
			} catch (error) {
				// Swallow
				// XXX (@Qix-) should we be logging these?
			}

			// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
			if (!r && typeof process !== 'undefined' && 'env' in process) {
				r = process.env.DEBUG;
			}

			return r;
		}

		/**
		 * Localstorage attempts to return the localstorage.
		 *
		 * This is necessary because safari throws
		 * when a user disables cookies/localstorage
		 * and you attempt to access it.
		 *
		 * @return {LocalStorage}
		 * @api private
		 */

		function localstorage() {
			try {
				// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
				// The Browser also has localStorage in the global context.
				return localStorage;
			} catch (error) {
				// Swallow
				// XXX (@Qix-) should we be logging these?
			}
		}

		module.exports = requireCommon()(exports);

		const {formatters} = module.exports;

		/**
		 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
		 */

		formatters.j = function (v) {
			try {
				return JSON.stringify(v);
			} catch (error) {
				return '[UnexpectedJSONParseError]: ' + error.message;
			}
		}; 
	} (browser, browser.exports));
	return browser.exports;
}

var node = {exports: {}};

var hasFlag;
var hasRequiredHasFlag;

function requireHasFlag () {
	if (hasRequiredHasFlag) return hasFlag;
	hasRequiredHasFlag = 1;

	hasFlag = (flag, argv = process.argv) => {
		const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
		const position = argv.indexOf(prefix + flag);
		const terminatorPosition = argv.indexOf('--');
		return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
	};
	return hasFlag;
}

var supportsColor_1;
var hasRequiredSupportsColor;

function requireSupportsColor () {
	if (hasRequiredSupportsColor) return supportsColor_1;
	hasRequiredSupportsColor = 1;
	const os = require$$0$7;
	const tty = require$$1$4;
	const hasFlag = requireHasFlag();

	const {env} = process;

	let forceColor;
	if (hasFlag('no-color') ||
		hasFlag('no-colors') ||
		hasFlag('color=false') ||
		hasFlag('color=never')) {
		forceColor = 0;
	} else if (hasFlag('color') ||
		hasFlag('colors') ||
		hasFlag('color=true') ||
		hasFlag('color=always')) {
		forceColor = 1;
	}

	if ('FORCE_COLOR' in env) {
		if (env.FORCE_COLOR === 'true') {
			forceColor = 1;
		} else if (env.FORCE_COLOR === 'false') {
			forceColor = 0;
		} else {
			forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
		}
	}

	function translateLevel(level) {
		if (level === 0) {
			return false;
		}

		return {
			level,
			hasBasic: true,
			has256: level >= 2,
			has16m: level >= 3
		};
	}

	function supportsColor(haveStream, streamIsTTY) {
		if (forceColor === 0) {
			return 0;
		}

		if (hasFlag('color=16m') ||
			hasFlag('color=full') ||
			hasFlag('color=truecolor')) {
			return 3;
		}

		if (hasFlag('color=256')) {
			return 2;
		}

		if (haveStream && !streamIsTTY && forceColor === undefined) {
			return 0;
		}

		const min = forceColor || 0;

		if (env.TERM === 'dumb') {
			return min;
		}

		if (process.platform === 'win32') {
			// Windows 10 build 10586 is the first Windows release that supports 256 colors.
			// Windows 10 build 14931 is the first release that supports 16m/TrueColor.
			const osRelease = os.release().split('.');
			if (
				Number(osRelease[0]) >= 10 &&
				Number(osRelease[2]) >= 10586
			) {
				return Number(osRelease[2]) >= 14931 ? 3 : 2;
			}

			return 1;
		}

		if ('CI' in env) {
			if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI', 'GITHUB_ACTIONS', 'BUILDKITE'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
				return 1;
			}

			return min;
		}

		if ('TEAMCITY_VERSION' in env) {
			return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
		}

		if (env.COLORTERM === 'truecolor') {
			return 3;
		}

		if ('TERM_PROGRAM' in env) {
			const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

			switch (env.TERM_PROGRAM) {
				case 'iTerm.app':
					return version >= 3 ? 3 : 2;
				case 'Apple_Terminal':
					return 2;
				// No default
			}
		}

		if (/-256(color)?$/i.test(env.TERM)) {
			return 2;
		}

		if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
			return 1;
		}

		if ('COLORTERM' in env) {
			return 1;
		}

		return min;
	}

	function getSupportLevel(stream) {
		const level = supportsColor(stream, stream && stream.isTTY);
		return translateLevel(level);
	}

	supportsColor_1 = {
		supportsColor: getSupportLevel,
		stdout: translateLevel(supportsColor(true, tty.isatty(1))),
		stderr: translateLevel(supportsColor(true, tty.isatty(2)))
	};
	return supportsColor_1;
}

/**
 * Module dependencies.
 */

var hasRequiredNode;

function requireNode () {
	if (hasRequiredNode) return node.exports;
	hasRequiredNode = 1;
	(function (module, exports) {
		const tty = require$$1$4;
		const util = require$$1$5;

		/**
		 * This is the Node.js implementation of `debug()`.
		 */

		exports.init = init;
		exports.log = log;
		exports.formatArgs = formatArgs;
		exports.save = save;
		exports.load = load;
		exports.useColors = useColors;
		exports.destroy = util.deprecate(
			() => {},
			'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.'
		);

		/**
		 * Colors.
		 */

		exports.colors = [6, 2, 3, 4, 5, 1];

		try {
			// Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
			// eslint-disable-next-line import/no-extraneous-dependencies
			const supportsColor = requireSupportsColor();

			if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
				exports.colors = [
					20,
					21,
					26,
					27,
					32,
					33,
					38,
					39,
					40,
					41,
					42,
					43,
					44,
					45,
					56,
					57,
					62,
					63,
					68,
					69,
					74,
					75,
					76,
					77,
					78,
					79,
					80,
					81,
					92,
					93,
					98,
					99,
					112,
					113,
					128,
					129,
					134,
					135,
					148,
					149,
					160,
					161,
					162,
					163,
					164,
					165,
					166,
					167,
					168,
					169,
					170,
					171,
					172,
					173,
					178,
					179,
					184,
					185,
					196,
					197,
					198,
					199,
					200,
					201,
					202,
					203,
					204,
					205,
					206,
					207,
					208,
					209,
					214,
					215,
					220,
					221
				];
			}
		} catch (error) {
			// Swallow - we only care if `supports-color` is available; it doesn't have to be.
		}

		/**
		 * Build up the default `inspectOpts` object from the environment variables.
		 *
		 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
		 */

		exports.inspectOpts = Object.keys(process.env).filter(key => {
			return /^debug_/i.test(key);
		}).reduce((obj, key) => {
			// Camel-case
			const prop = key
				.substring(6)
				.toLowerCase()
				.replace(/_([a-z])/g, (_, k) => {
					return k.toUpperCase();
				});

			// Coerce string value into JS value
			let val = process.env[key];
			if (/^(yes|on|true|enabled)$/i.test(val)) {
				val = true;
			} else if (/^(no|off|false|disabled)$/i.test(val)) {
				val = false;
			} else if (val === 'null') {
				val = null;
			} else {
				val = Number(val);
			}

			obj[prop] = val;
			return obj;
		}, {});

		/**
		 * Is stdout a TTY? Colored output is enabled when `true`.
		 */

		function useColors() {
			return 'colors' in exports.inspectOpts ?
				Boolean(exports.inspectOpts.colors) :
				tty.isatty(process.stderr.fd);
		}

		/**
		 * Adds ANSI color escape codes if enabled.
		 *
		 * @api public
		 */

		function formatArgs(args) {
			const {namespace: name, useColors} = this;

			if (useColors) {
				const c = this.color;
				const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
				const prefix = `  ${colorCode};1m${name} \u001B[0m`;

				args[0] = prefix + args[0].split('\n').join('\n' + prefix);
				args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
			} else {
				args[0] = getDate() + name + ' ' + args[0];
			}
		}

		function getDate() {
			if (exports.inspectOpts.hideDate) {
				return '';
			}
			return new Date().toISOString() + ' ';
		}

		/**
		 * Invokes `util.formatWithOptions()` with the specified arguments and writes to stderr.
		 */

		function log(...args) {
			return process.stderr.write(util.formatWithOptions(exports.inspectOpts, ...args) + '\n');
		}

		/**
		 * Save `namespaces`.
		 *
		 * @param {String} namespaces
		 * @api private
		 */
		function save(namespaces) {
			if (namespaces) {
				process.env.DEBUG = namespaces;
			} else {
				// If you set a process.env field to null or undefined, it gets cast to the
				// string 'null' or 'undefined'. Just delete instead.
				delete process.env.DEBUG;
			}
		}

		/**
		 * Load `namespaces`.
		 *
		 * @return {String} returns the previously persisted debug modes
		 * @api private
		 */

		function load() {
			return process.env.DEBUG;
		}

		/**
		 * Init logic for `debug` instances.
		 *
		 * Create a new `inspectOpts` object in case `useColors` is set
		 * differently for a particular `debug` instance.
		 */

		function init(debug) {
			debug.inspectOpts = {};

			const keys = Object.keys(exports.inspectOpts);
			for (let i = 0; i < keys.length; i++) {
				debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
			}
		}

		module.exports = requireCommon()(exports);

		const {formatters} = module.exports;

		/**
		 * Map %o to `util.inspect()`, all on a single line.
		 */

		formatters.o = function (v) {
			this.inspectOpts.colors = this.useColors;
			return util.inspect(v, this.inspectOpts)
				.split('\n')
				.map(str => str.trim())
				.join(' ');
		};

		/**
		 * Map %O to `util.inspect()`, allowing multiple lines if needed.
		 */

		formatters.O = function (v) {
			this.inspectOpts.colors = this.useColors;
			return util.inspect(v, this.inspectOpts);
		}; 
	} (node, node.exports));
	return node.exports;
}

/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */

var hasRequiredSrc;

function requireSrc () {
	if (hasRequiredSrc) return src.exports;
	hasRequiredSrc = 1;
	if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
		src.exports = requireBrowser();
	} else {
		src.exports = requireNode();
	}
	return src.exports;
}

var hasRequiredDist$1;

function requireDist$1 () {
	if (hasRequiredDist$1) return dist$1;
	hasRequiredDist$1 = 1;
	var __createBinding = (dist$1 && dist$1.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (dist$1 && dist$1.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (dist$1 && dist$1.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	var __importDefault = (dist$1 && dist$1.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(dist$1, "__esModule", { value: true });
	dist$1.SocksProxyAgent = void 0;
	const socks_1 = requireBuild();
	const agent_base_1 = requireDist$2();
	const debug_1 = __importDefault(requireSrc());
	const dns = __importStar(require$$3$2);
	const net = __importStar(require$$4$1);
	const tls = __importStar(require$$5);
	const url_1 = require$$6;
	const debug = (0, debug_1.default)('socks-proxy-agent');
	const setServernameFromNonIpHost = (options) => {
	    if (options.servername === undefined &&
	        options.host &&
	        !net.isIP(options.host)) {
	        return {
	            ...options,
	            servername: options.host,
	        };
	    }
	    return options;
	};
	function parseSocksURL(url) {
	    let lookup = false;
	    let type = 5;
	    const host = url.hostname;
	    // From RFC 1928, Section 3: https://tools.ietf.org/html/rfc1928#section-3
	    // "The SOCKS service is conventionally located on TCP port 1080"
	    const port = parseInt(url.port, 10) || 1080;
	    // figure out if we want socks v4 or v5, based on the "protocol" used.
	    // Defaults to 5.
	    switch (url.protocol.replace(':', '')) {
	        case 'socks4':
	            lookup = true;
	            type = 4;
	            break;
	        // pass through
	        case 'socks4a':
	            type = 4;
	            break;
	        case 'socks5':
	            lookup = true;
	            type = 5;
	            break;
	        // pass through
	        case 'socks': // no version specified, default to 5h
	            type = 5;
	            break;
	        case 'socks5h':
	            type = 5;
	            break;
	        default:
	            throw new TypeError(`A "socks" protocol must be specified! Got: ${String(url.protocol)}`);
	    }
	    const proxy = {
	        host,
	        port,
	        type,
	    };
	    if (url.username) {
	        Object.defineProperty(proxy, 'userId', {
	            value: decodeURIComponent(url.username),
	            enumerable: false,
	        });
	    }
	    if (url.password != null) {
	        Object.defineProperty(proxy, 'password', {
	            value: decodeURIComponent(url.password),
	            enumerable: false,
	        });
	    }
	    return { lookup, proxy };
	}
	class SocksProxyAgent extends agent_base_1.Agent {
	    constructor(uri, opts) {
	        super(opts);
	        const url = typeof uri === 'string' ? new url_1.URL(uri) : uri;
	        const { proxy, lookup } = parseSocksURL(url);
	        this.shouldLookup = lookup;
	        this.proxy = proxy;
	        this.timeout = opts?.timeout ?? null;
	        this.socketOptions = opts?.socketOptions ?? null;
	    }
	    /**
	     * Initiates a SOCKS connection to the specified SOCKS proxy server,
	     * which in turn connects to the specified remote host and port.
	     */
	    async connect(req, opts) {
	        const { shouldLookup, proxy, timeout } = this;
	        if (!opts.host) {
	            throw new Error('No `host` defined!');
	        }
	        let { host } = opts;
	        const { port, lookup: lookupFn = dns.lookup } = opts;
	        if (shouldLookup) {
	            // Client-side DNS resolution for "4" and "5" socks proxy versions.
	            host = await new Promise((resolve, reject) => {
	                // Use the request's custom lookup, if one was configured:
	                lookupFn(host, {}, (err, res) => {
	                    if (err) {
	                        reject(err);
	                    }
	                    else {
	                        resolve(res);
	                    }
	                });
	            });
	        }
	        const socksOpts = {
	            proxy,
	            destination: {
	                host,
	                port: typeof port === 'number' ? port : parseInt(port, 10),
	            },
	            command: 'connect',
	            timeout: timeout ?? undefined,
	            // @ts-expect-error the type supplied by socks for socket_options is wider
	            // than necessary since socks will always override the host and port
	            socket_options: this.socketOptions ?? undefined,
	        };
	        const cleanup = (tlsSocket) => {
	            req.destroy();
	            socket.destroy();
	            if (tlsSocket)
	                tlsSocket.destroy();
	        };
	        debug('Creating socks proxy connection: %o', socksOpts);
	        const { socket } = await socks_1.SocksClient.createConnection(socksOpts);
	        debug('Successfully created socks proxy connection');
	        if (timeout !== null) {
	            socket.setTimeout(timeout);
	            socket.on('timeout', () => cleanup());
	        }
	        if (opts.secureEndpoint) {
	            // The proxy is connecting to a TLS server, so upgrade
	            // this socket connection to a TLS connection.
	            debug('Upgrading socket connection to TLS');
	            const tlsSocket = tls.connect({
	                ...omit(setServernameFromNonIpHost(opts), 'host', 'path', 'port'),
	                socket,
	            });
	            tlsSocket.once('error', (error) => {
	                debug('Socket TLS error', error.message);
	                cleanup(tlsSocket);
	            });
	            return tlsSocket;
	        }
	        return socket;
	    }
	}
	SocksProxyAgent.protocols = [
	    'socks',
	    'socks4',
	    'socks4a',
	    'socks5',
	    'socks5h',
	];
	dist$1.SocksProxyAgent = SocksProxyAgent;
	function omit(obj, ...keys) {
	    const ret = {};
	    let key;
	    for (key in obj) {
	        if (!keys.includes(key)) {
	            ret[key] = obj[key];
	        }
	    }
	    return ret;
	}
	
	return dist$1;
}

var hasRequiredForward_socks;

function requireForward_socks () {
	if (hasRequiredForward_socks) return forward_socks;
	hasRequiredForward_socks = 1;
	Object.defineProperty(forward_socks, "__esModule", { value: true });
	forward_socks.forwardSocks = void 0;
	const tslib_1 = require$$0;
	const node_http_1 = tslib_1.__importDefault(require$$1$1);
	const node_stream_1 = tslib_1.__importDefault(require$$3$1);
	const node_util_1 = tslib_1.__importDefault(require$$0$5);
	const socks_proxy_agent_1 = requireDist$1();
	const statuses_1 = requireStatuses();
	const count_target_bytes_1 = requireCount_target_bytes();
	const valid_headers_only_1 = requireValid_headers_only();
	const pipeline = node_util_1.default.promisify(node_stream_1.default.pipeline);
	/**
	 * ```
	 * Client -> Apify (HTTP) -> Upstream (SOCKS) -> Web
	 * Client <- Apify (HTTP) <- Upstream (SOCKS) <- Web
	 * ```
	 */
	const forwardSocks = async (request, response, handlerOpts) => new Promise(async (resolve, reject) => {
	    const agent = new socks_proxy_agent_1.SocksProxyAgent(handlerOpts.upstreamProxyUrlParsed);
	    const options = {
	        method: request.method,
	        headers: (0, valid_headers_only_1.validHeadersOnly)(request.rawHeaders),
	        insecureHTTPParser: true,
	        localAddress: handlerOpts.localAddress,
	        agent,
	    };
	    // Only handling "http" here - since everything else is handeled by tunnelSocks.
	    // We have to force cast `options` because @types/node doesn't support an array.
	    const client = node_http_1.default.request(request.url, options, async (clientResponse) => {
	        try {
	            // This is necessary to prevent Node.js throwing an error
	            let statusCode = clientResponse.statusCode;
	            if (statusCode < 100 || statusCode > 999) {
	                statusCode = statuses_1.badGatewayStatusCodes.STATUS_CODE_OUT_OF_RANGE;
	            }
	            // 407 is handled separately
	            if (clientResponse.statusCode === 407) {
	                reject(new Error('407 Proxy Authentication Required'));
	                return;
	            }
	            response.writeHead(statusCode, clientResponse.statusMessage, (0, valid_headers_only_1.validHeadersOnly)(clientResponse.rawHeaders));
	            // `pipeline` automatically handles all the events and data
	            await pipeline(clientResponse, response);
	            resolve();
	        }
	        catch {
	            // Client error, pipeline already destroys the streams, ignore.
	            resolve();
	        }
	    });
	    client.once('socket', (socket) => {
	        (0, count_target_bytes_1.countTargetBytes)(request.socket, socket);
	    });
	    // Can't use pipeline here as it automatically destroys the streams
	    request.pipe(client);
	    client.on('error', (error) => {
	        var _a;
	        if (response.headersSent) {
	            return;
	        }
	        const statusCode = (_a = statuses_1.errorCodeToStatusCode[error.code]) !== null && _a !== void 0 ? _a : statuses_1.badGatewayStatusCodes.GENERIC_ERROR;
	        response.statusCode = statusCode;
	        response.setHeader('content-type', 'text/plain; charset=utf-8');
	        response.end(node_http_1.default.STATUS_CODES[response.statusCode]);
	        resolve();
	    });
	});
	forward_socks.forwardSocks = forwardSocks;
	
	return forward_socks;
}

var nodeify = {};

var hasRequiredNodeify;

function requireNodeify () {
	if (hasRequiredNodeify) return nodeify;
	hasRequiredNodeify = 1;
	Object.defineProperty(nodeify, "__esModule", { value: true });
	nodeify.nodeify = void 0;
	// Replacement for Bluebird's Promise.nodeify()
	const nodeify$1 = async (promise, callback) => {
	    if (typeof callback !== 'function')
	        return promise;
	    promise.then((result) => callback(null, result), callback).catch((error) => {
	        // Need to .catch because it doesn't crash the process on Node.js 14
	        process.nextTick(() => {
	            throw error;
	        });
	    });
	    return promise;
	};
	nodeify.nodeify = nodeify$1;
	
	return nodeify;
}

var normalize_url_port = {};

var hasRequiredNormalize_url_port;

function requireNormalize_url_port () {
	if (hasRequiredNormalize_url_port) return normalize_url_port;
	hasRequiredNormalize_url_port = 1;
	Object.defineProperty(normalize_url_port, "__esModule", { value: true });
	normalize_url_port.normalizeUrlPort = void 0;
	// https://url.spec.whatwg.org/#default-port
	const mapping = {
	    'ftp:': 21,
	    'http:': 80,
	    'https:': 443,
	    'ws:': 80,
	    'wss:': 443,
	};
	const normalizeUrlPort = (url) => {
	    if (url.port) {
	        return Number(url.port);
	    }
	    if (url.protocol in mapping) {
	        return mapping[url.protocol];
	    }
	    throw new Error(`Unexpected protocol: ${url.protocol}`);
	};
	normalize_url_port.normalizeUrlPort = normalizeUrlPort;
	
	return normalize_url_port;
}

var parse_authorization_header = {};

var hasRequiredParse_authorization_header;

function requireParse_authorization_header () {
	if (hasRequiredParse_authorization_header) return parse_authorization_header;
	hasRequiredParse_authorization_header = 1;
	Object.defineProperty(parse_authorization_header, "__esModule", { value: true });
	parse_authorization_header.parseAuthorizationHeader = void 0;
	const node_buffer_1 = require$$0$8;
	const splitAt = (string, index) => {
	    return [
	        index === -1 ? '' : string.substring(0, index),
	        index === -1 ? '' : string.substring(index + 1),
	    ];
	};
	const parseAuthorizationHeader = (header) => {
	    if (header) {
	        header = header.trim();
	    }
	    if (!header) {
	        return null;
	    }
	    const [type, data] = splitAt(header, header.indexOf(' '));
	    // https://datatracker.ietf.org/doc/html/rfc7617#page-3
	    // Note that both scheme and parameter names are matched case-
	    // insensitively.
	    if (type.toLowerCase() !== 'basic') {
	        return { type, data };
	    }
	    const auth = node_buffer_1.Buffer.from(data, 'base64').toString();
	    // https://datatracker.ietf.org/doc/html/rfc7617#page-5
	    // To receive authorization, the client
	    //
	    // 1.  obtains the user-id and password from the user,
	    //
	    // 2.  constructs the user-pass by concatenating the user-id, a single
	    //     colon (":") character, and the password,
	    //
	    // 3.  encodes the user-pass into an octet sequence (see below for a
	    //     discussion of character encoding schemes),
	    //
	    // 4.  and obtains the basic-credentials by encoding this octet sequence
	    //     using Base64 ([RFC4648], Section 4) into a sequence of US-ASCII
	    //     characters ([RFC0020]).
	    // Note:
	    // If there's a colon : missing, we imply that the user-pass string is just a username.
	    // This is a non-spec behavior. At Apify there are clients that rely on this.
	    // If you want this behavior changed, please open an issue.
	    const [username, password] = auth.includes(':') ? splitAt(auth, auth.indexOf(':')) : [auth, ''];
	    return {
	        type,
	        data,
	        username,
	        password,
	    };
	};
	parse_authorization_header.parseAuthorizationHeader = parseAuthorizationHeader;
	
	return parse_authorization_header;
}

var redact_url = {};

var hasRequiredRedact_url;

function requireRedact_url () {
	if (hasRequiredRedact_url) return redact_url;
	hasRequiredRedact_url = 1;
	Object.defineProperty(redact_url, "__esModule", { value: true });
	redact_url.redactUrl = void 0;
	const node_url_1 = require$$0$4;
	const redactUrl = (url, passwordReplacement = '<redacted>') => {
	    if (typeof url !== 'object') {
	        url = new node_url_1.URL(url);
	    }
	    if (url.password) {
	        return url.href.replace(`:${url.password}`, `:${passwordReplacement}`);
	    }
	    return url.href;
	};
	redact_url.redactUrl = redactUrl;
	
	return redact_url;
}

var hasRequiredServer;

function requireServer () {
	if (hasRequiredServer) return server;
	hasRequiredServer = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.Server = exports.SOCKS_PROTOCOLS = void 0;
		const tslib_1 = require$$0;
		/* eslint-disable no-use-before-define */
		const node_buffer_1 = require$$0$8;
		const node_events_1 = require$$0$1;
		const node_http_1 = tslib_1.__importDefault(require$$1$1);
		const node_url_1 = require$$0$4;
		const node_util_1 = tslib_1.__importDefault(require$$0$5);
		const chain_1 = requireChain();
		const chain_socks_1 = requireChain_socks();
		const custom_connect_1 = requireCustom_connect();
		const custom_response_1 = requireCustom_response();
		const direct_1 = requireDirect();
		const forward_1 = requireForward();
		const forward_socks_1 = requireForward_socks();
		const request_error_1 = requireRequest_error();
		const statuses_1 = requireStatuses();
		const count_target_bytes_1 = requireCount_target_bytes();
		const nodeify_1 = requireNodeify();
		const normalize_url_port_1 = requireNormalize_url_port();
		const parse_authorization_header_1 = requireParse_authorization_header();
		const redact_url_1 = requireRedact_url();
		exports.SOCKS_PROTOCOLS = ['socks:', 'socks4:', 'socks4a:', 'socks5:', 'socks5h:'];
		// TODO:
		// - Implement this requirement from rfc7230
		//   "A proxy MUST forward unrecognized header fields unless the field-name
		//    is listed in the Connection header field (Section 6.1) or the proxy
		//    is specifically configured to block, or otherwise transform, such
		//    fields.  Other recipients SHOULD ignore unrecognized header fields.
		//    These requirements allow HTTP's functionality to be enhanced without
		//    requiring prior update of deployed intermediaries."
		const DEFAULT_AUTH_REALM = 'ProxyChain';
		const DEFAULT_PROXY_SERVER_PORT = 8000;
		/**
		 * Represents the proxy server.
		 * It emits the 'requestFailed' event on unexpected request errors, with the following parameter `{ error, request }`.
		 * It emits the 'connectionClosed' event when connection to proxy server is closed, with parameter `{ connectionId, stats }`.
		 */
		class Server extends node_events_1.EventEmitter {
		    /**
		     * Initializes a new instance of Server class.
		     * @param options
		     * @param [options.port] Port where the server will listen. By default 8000.
		     * @param [options.prepareRequestFunction] Custom function to authenticate proxy requests,
		     * provide URL to upstream proxy or potentially provide a function that generates a custom response to HTTP requests.
		     * It accepts a single parameter which is an object:
		     * ```
		     * {
		     *   connectionId: symbol,
		     *   request: http.IncomingMessage,
		     *   username: string,
		     *   password: string,
		     *   hostname: string,
		     *   port: number,
		     *   isHttp: boolean,
		     * }
		     * ```
		     * and returns an object (or promise resolving to the object) with following form:
		     * ```
		     * {
		     *   requestAuthentication: boolean,
		     *   upstreamProxyUrl: string,
		     *   customResponseFunction: Function,
		     * }
		     * ```
		     * If `upstreamProxyUrl` is a falsy value, no upstream proxy is used.
		     * If `prepareRequestFunction` is not set, the proxy server will not require any authentication
		     * and will not use any upstream proxy.
		     * If `customResponseFunction` is set, it will be called to generate a custom response to the HTTP request.
		     * It should not be used together with `upstreamProxyUrl`.
		     * @param [options.authRealm] Realm used in the Proxy-Authenticate header and also in the 'Server' HTTP header. By default it's `ProxyChain`.
		     * @param [options.verbose] If true, the server will output logs
		     */
		    constructor(options = {}) {
		        super();
		        Object.defineProperty(this, "port", {
		            enumerable: true,
		            configurable: true,
		            writable: true,
		            value: void 0
		        });
		        Object.defineProperty(this, "host", {
		            enumerable: true,
		            configurable: true,
		            writable: true,
		            value: void 0
		        });
		        Object.defineProperty(this, "prepareRequestFunction", {
		            enumerable: true,
		            configurable: true,
		            writable: true,
		            value: void 0
		        });
		        Object.defineProperty(this, "authRealm", {
		            enumerable: true,
		            configurable: true,
		            writable: true,
		            value: void 0
		        });
		        Object.defineProperty(this, "verbose", {
		            enumerable: true,
		            configurable: true,
		            writable: true,
		            value: void 0
		        });
		        Object.defineProperty(this, "server", {
		            enumerable: true,
		            configurable: true,
		            writable: true,
		            value: void 0
		        });
		        Object.defineProperty(this, "lastHandlerId", {
		            enumerable: true,
		            configurable: true,
		            writable: true,
		            value: void 0
		        });
		        Object.defineProperty(this, "stats", {
		            enumerable: true,
		            configurable: true,
		            writable: true,
		            value: void 0
		        });
		        Object.defineProperty(this, "connections", {
		            enumerable: true,
		            configurable: true,
		            writable: true,
		            value: void 0
		        });
		        if (options.port === undefined || options.port === null) {
		            this.port = DEFAULT_PROXY_SERVER_PORT;
		        }
		        else {
		            this.port = options.port;
		        }
		        this.host = options.host;
		        this.prepareRequestFunction = options.prepareRequestFunction;
		        this.authRealm = options.authRealm || DEFAULT_AUTH_REALM;
		        this.verbose = !!options.verbose;
		        this.server = node_http_1.default.createServer();
		        this.server.on('clientError', this.onClientError.bind(this));
		        this.server.on('request', this.onRequest.bind(this));
		        this.server.on('connect', this.onConnect.bind(this));
		        this.server.on('connection', this.onConnection.bind(this));
		        this.lastHandlerId = 0;
		        this.stats = {
		            httpRequestCount: 0,
		            connectRequestCount: 0,
		        };
		        this.connections = new Map();
		    }
		    log(connectionId, str) {
		        if (this.verbose) {
		            const logPrefix = connectionId != null ? `${String(connectionId)} | ` : '';
		            // eslint-disable-next-line no-console
		            console.log(`ProxyServer[${this.port}]: ${logPrefix}${str}`);
		        }
		    }
		    onClientError(err, socket) {
		        this.log(socket.proxyChainId, `onClientError: ${err}`);
		        // https://nodejs.org/api/http.html#http_event_clienterror
		        if (err.code === 'ECONNRESET' || !socket.writable) {
		            return;
		        }
		        this.sendSocketResponse(socket, 400, {}, 'Invalid request');
		    }
		    /**
		     * Assigns a unique ID to the socket and keeps the register up to date.
		     * Needed for abrupt close of the server.
		     */
		    registerConnection(socket) {
		        const unique = this.lastHandlerId++;
		        socket.proxyChainId = unique;
		        this.connections.set(unique, socket);
		        socket.on('close', () => {
		            this.emit('connectionClosed', {
		                connectionId: unique,
		                stats: this.getConnectionStats(unique),
		            });
		            this.connections.delete(unique);
		        });
		        // We have to manually destroy the socket if it timeouts.
		        // This will prevent connections from leaking and close them properly.
		        socket.on('timeout', () => {
		            socket.destroy();
		        });
		    }
		    /**
		     * Handles incoming sockets, useful for error handling
		     */
		    onConnection(socket) {
		        // https://github.com/nodejs/node/issues/23858
		        if (!socket.remoteAddress) {
		            socket.destroy();
		            return;
		        }
		        this.registerConnection(socket);
		        // We need to consume socket errors, because the handlers are attached asynchronously.
		        // See https://github.com/apify/proxy-chain/issues/53
		        socket.on('error', (err) => {
		            // Handle errors only if there's no other handler
		            if (this.listenerCount('error') === 1) {
		                this.log(socket.proxyChainId, `Source socket emitted error: ${err.stack || err}`);
		            }
		        });
		    }
		    /**
		     * Converts known errors to be instance of RequestError.
		     */
		    normalizeHandlerError(error) {
		        if (error.message === 'Username contains an invalid colon') {
		            return new request_error_1.RequestError('Invalid colon in username in upstream proxy credentials', statuses_1.badGatewayStatusCodes.AUTH_FAILED);
		        }
		        if (error.message === '407 Proxy Authentication Required') {
		            return new request_error_1.RequestError('Invalid upstream proxy credentials', statuses_1.badGatewayStatusCodes.AUTH_FAILED);
		        }
		        return error;
		    }
		    /**
		     * Handles normal HTTP request by forwarding it to target host or the upstream proxy.
		     */
		    async onRequest(request, response) {
		        try {
		            const handlerOpts = await this.prepareRequestHandling(request);
		            handlerOpts.srcResponse = response;
		            const { proxyChainId } = request.socket;
		            if (handlerOpts.customResponseFunction) {
		                this.log(proxyChainId, 'Using handleCustomResponse()');
		                await (0, custom_response_1.handleCustomResponse)(request, response, handlerOpts);
		                return;
		            }
		            if (handlerOpts.upstreamProxyUrlParsed && exports.SOCKS_PROTOCOLS.includes(handlerOpts.upstreamProxyUrlParsed.protocol)) {
		                this.log(proxyChainId, 'Using forwardSocks()');
		                await (0, forward_socks_1.forwardSocks)(request, response, handlerOpts);
		                return;
		            }
		            this.log(proxyChainId, 'Using forward()');
		            await (0, forward_1.forward)(request, response, handlerOpts);
		        }
		        catch (error) {
		            this.failRequest(request, this.normalizeHandlerError(error));
		        }
		    }
		    /**
		     * Handles HTTP CONNECT request by setting up a tunnel either to target host or to the upstream proxy.
		     * @param request
		     * @param socket
		     * @param head The first packet of the tunneling stream (may be empty)
		     */
		    async onConnect(request, socket, head) {
		        try {
		            const handlerOpts = await this.prepareRequestHandling(request);
		            handlerOpts.srcHead = head;
		            const data = { request, sourceSocket: socket, head, handlerOpts: handlerOpts, server: this, isPlain: false };
		            if (handlerOpts.customConnectServer) {
		                socket.unshift(head); // See chain.ts for why we do this
		                await (0, custom_connect_1.customConnect)(socket, handlerOpts.customConnectServer);
		                return;
		            }
		            if (handlerOpts.upstreamProxyUrlParsed) {
		                if (exports.SOCKS_PROTOCOLS.includes(handlerOpts.upstreamProxyUrlParsed.protocol)) {
		                    this.log(socket.proxyChainId, `Using chainSocks() => ${request.url}`);
		                    await (0, chain_socks_1.chainSocks)(data);
		                    return;
		                }
		                this.log(socket.proxyChainId, `Using chain() => ${request.url}`);
		                (0, chain_1.chain)(data);
		                return;
		            }
		            this.log(socket.proxyChainId, `Using direct() => ${request.url}`);
		            (0, direct_1.direct)(data);
		        }
		        catch (error) {
		            this.failRequest(request, this.normalizeHandlerError(error));
		        }
		    }
		    /**
		     * Prepares handler options from a request.
		     * @see {prepareRequestHandling}
		     */
		    getHandlerOpts(request) {
		        const handlerOpts = {
		            server: this,
		            id: request.socket.proxyChainId,
		            srcRequest: request,
		            srcHead: null,
		            trgParsed: null,
		            upstreamProxyUrlParsed: null,
		            ignoreUpstreamProxyCertificate: false,
		            isHttp: false,
		            srcResponse: null,
		            customResponseFunction: null,
		            customConnectServer: null,
		        };
		        this.log(request.socket.proxyChainId, `!!! Handling ${request.method} ${request.url} HTTP/${request.httpVersion}`);
		        if (request.method === 'CONNECT') {
		            // CONNECT server.example.com:80 HTTP/1.1
		            try {
		                handlerOpts.trgParsed = new node_url_1.URL(`connect://${request.url}`);
		            }
		            catch {
		                throw new request_error_1.RequestError(`Target "${request.url}" could not be parsed`, 400);
		            }
		            if (!handlerOpts.trgParsed.hostname || !handlerOpts.trgParsed.port) {
		                throw new request_error_1.RequestError(`Target "${request.url}" could not be parsed`, 400);
		            }
		            this.stats.connectRequestCount++;
		        }
		        else {
		            // The request should look like:
		            //   GET http://server.example.com:80/some-path HTTP/1.1
		            // Note that RFC 7230 says:
		            // "When making a request to a proxy, other than a CONNECT or server-wide
		            //  OPTIONS request (as detailed below), a client MUST send the target
		            //  URI in absolute-form as the request-target"
		            let parsed;
		            try {
		                parsed = new node_url_1.URL(request.url);
		            }
		            catch {
		                // If URL is invalid, throw HTTP 400 error
		                throw new request_error_1.RequestError(`Target "${request.url}" could not be parsed`, 400);
		            }
		            // Only HTTP is supported, other protocols such as HTTP or FTP must use the CONNECT method
		            if (parsed.protocol !== 'http:') {
		                throw new request_error_1.RequestError(`Only HTTP protocol is supported (was ${parsed.protocol})`, 400);
		            }
		            handlerOpts.trgParsed = parsed;
		            handlerOpts.isHttp = true;
		            this.stats.httpRequestCount++;
		        }
		        return handlerOpts;
		    }
		    /**
		     * Calls `this.prepareRequestFunction` with normalized options.
		     * @param request
		     * @param handlerOpts
		     */
		    async callPrepareRequestFunction(request, handlerOpts) {
		        if (this.prepareRequestFunction) {
		            const funcOpts = {
		                connectionId: request.socket.proxyChainId,
		                request,
		                username: '',
		                password: '',
		                hostname: handlerOpts.trgParsed.hostname,
		                port: (0, normalize_url_port_1.normalizeUrlPort)(handlerOpts.trgParsed),
		                isHttp: handlerOpts.isHttp,
		            };
		            // Authenticate the request using a user function (if provided)
		            const proxyAuth = request.headers['proxy-authorization'];
		            if (proxyAuth) {
		                const auth = (0, parse_authorization_header_1.parseAuthorizationHeader)(proxyAuth);
		                if (!auth) {
		                    throw new request_error_1.RequestError('Invalid "Proxy-Authorization" header', 400);
		                }
		                // https://datatracker.ietf.org/doc/html/rfc7617#page-3
		                // Note that both scheme and parameter names are matched case-
		                // insensitively.
		                if (auth.type.toLowerCase() !== 'basic') {
		                    throw new request_error_1.RequestError('The "Proxy-Authorization" header must have the "Basic" type.', 400);
		                }
		                funcOpts.username = auth.username;
		                funcOpts.password = auth.password;
		            }
		            const result = await this.prepareRequestFunction(funcOpts);
		            return result !== null && result !== void 0 ? result : {};
		        }
		        return {};
		    }
		    /**
		     * Authenticates a new request and determines upstream proxy URL using the user function.
		     * Returns a promise resolving to an object that can be used to run a handler.
		     * @param request
		     */
		    async prepareRequestHandling(request) {
		        const handlerOpts = this.getHandlerOpts(request);
		        const funcResult = await this.callPrepareRequestFunction(request, handlerOpts);
		        handlerOpts.localAddress = funcResult.localAddress;
		        handlerOpts.ipFamily = funcResult.ipFamily;
		        handlerOpts.dnsLookup = funcResult.dnsLookup;
		        handlerOpts.customConnectServer = funcResult.customConnectServer;
		        handlerOpts.customTag = funcResult.customTag;
		        // If not authenticated, request client to authenticate
		        if (funcResult.requestAuthentication) {
		            throw new request_error_1.RequestError(funcResult.failMsg || 'Proxy credentials required.', 407);
		        }
		        if (funcResult.upstreamProxyUrl) {
		            try {
		                handlerOpts.upstreamProxyUrlParsed = new node_url_1.URL(funcResult.upstreamProxyUrl);
		            }
		            catch (error) {
		                throw new Error(`Invalid "upstreamProxyUrl" provided: ${error} (was "${funcResult.upstreamProxyUrl}"`);
		            }
		            if (!['http:', 'https:', ...exports.SOCKS_PROTOCOLS].includes(handlerOpts.upstreamProxyUrlParsed.protocol)) {
		                throw new Error(`Invalid "upstreamProxyUrl" provided: URL must have one of the following protocols: "http", "https", ${exports.SOCKS_PROTOCOLS.map((p) => `"${p.replace(':', '')}"`).join(', ')} (was "${funcResult.upstreamProxyUrl}")`);
		            }
		        }
		        if (funcResult.ignoreUpstreamProxyCertificate !== undefined) {
		            handlerOpts.ignoreUpstreamProxyCertificate = funcResult.ignoreUpstreamProxyCertificate;
		        }
		        const { proxyChainId } = request.socket;
		        if (funcResult.customResponseFunction) {
		            this.log(proxyChainId, 'Using custom response function');
		            handlerOpts.customResponseFunction = funcResult.customResponseFunction;
		            if (!handlerOpts.isHttp) {
		                throw new Error('The "customResponseFunction" option can only be used for HTTP requests.');
		            }
		            if (typeof (handlerOpts.customResponseFunction) !== 'function') {
		                throw new Error('The "customResponseFunction" option must be a function.');
		            }
		        }
		        if (handlerOpts.upstreamProxyUrlParsed) {
		            this.log(proxyChainId, `Using upstream proxy ${(0, redact_url_1.redactUrl)(handlerOpts.upstreamProxyUrlParsed)}`);
		        }
		        return handlerOpts;
		    }
		    /**
		     * Sends a HTTP error response to the client.
		     * @param request
		     * @param error
		     */
		    failRequest(request, error) {
		        const { proxyChainId } = request.socket;
		        if (error.name === 'RequestError') {
		            const typedError = error;
		            this.log(proxyChainId, `Request failed (status ${typedError.statusCode}): ${error.message}`);
		            this.sendSocketResponse(request.socket, typedError.statusCode, typedError.headers, error.message);
		        }
		        else {
		            this.log(proxyChainId, `Request failed with error: ${error.stack || error}`);
		            this.sendSocketResponse(request.socket, 500, {}, 'Internal error in proxy server');
		            this.emit('requestFailed', { error, request });
		        }
		        this.log(proxyChainId, 'Closing because request failed with error');
		    }
		    /**
		     * Sends a simple HTTP response to the client and forcibly closes the connection.
		     * This invalidates the ServerResponse instance (if present).
		     * We don't know the state of the response anyway.
		     * Writing directly to the socket seems to be the easiest solution.
		     * @param socket
		     * @param statusCode
		     * @param headers
		     * @param message
		     */
		    sendSocketResponse(socket, statusCode = 500, caseSensitiveHeaders = {}, message = '') {
		        try {
		            const headers = Object.fromEntries(Object.entries(caseSensitiveHeaders).map(([name, value]) => [name.toLowerCase(), value]));
		            headers.connection = 'close';
		            headers.date = (new Date()).toUTCString();
		            headers['content-length'] = String(node_buffer_1.Buffer.byteLength(message));
		            headers.server = headers.server || this.authRealm;
		            headers['content-type'] = headers['content-type'] || 'text/plain; charset=utf-8';
		            if (statusCode === 407 && !headers['proxy-authenticate']) {
		                headers['proxy-authenticate'] = `Basic realm="${this.authRealm}"`;
		            }
		            let msg = `HTTP/1.1 ${statusCode} ${node_http_1.default.STATUS_CODES[statusCode] || 'Unknown Status Code'}\r\n`;
		            for (const [key, value] of Object.entries(headers)) {
		                msg += `${key}: ${value}\r\n`;
		            }
		            msg += `\r\n${message}`;
		            // Unfortunately it's not possible to send RST in Node.js yet.
		            // See https://github.com/nodejs/node/issues/27428
		            socket.setTimeout(1000, () => {
		                socket.destroy();
		            });
		            // This sends FIN, meaning we still can receive data.
		            socket.end(msg);
		        }
		        catch (err) {
		            this.log(socket.proxyChainId, `Unhandled error in sendResponse(), will be ignored: ${err.stack || err}`);
		        }
		    }
		    /**
		     * Starts listening at a port specified in the constructor.
		     */
		    async listen(callback) {
		        const promise = new Promise((resolve, reject) => {
		            // Unfortunately server.listen() is not a normal function that fails on error,
		            // so we need this trickery
		            const onError = (error) => {
		                this.log(null, `Listen failed: ${error}`);
		                removeListeners();
		                reject(error);
		            };
		            const onListening = () => {
		                this.port = this.server.address().port;
		                this.log(null, 'Listening...');
		                removeListeners();
		                resolve();
		            };
		            const removeListeners = () => {
		                this.server.removeListener('error', onError);
		                this.server.removeListener('listening', onListening);
		            };
		            this.server.on('error', onError);
		            this.server.on('listening', onListening);
		            this.server.listen(this.port, this.host);
		        });
		        return (0, nodeify_1.nodeify)(promise, callback);
		    }
		    /**
		     * Gets array of IDs of all active connections.
		     */
		    getConnectionIds() {
		        return [...this.connections.keys()];
		    }
		    /**
		     * Gets data transfer statistics of a specific proxy connection.
		     */
		    getConnectionStats(connectionId) {
		        const socket = this.connections.get(connectionId);
		        if (!socket)
		            return undefined;
		        const targetStats = (0, count_target_bytes_1.getTargetStats)(socket);
		        const result = {
		            srcTxBytes: socket.bytesWritten,
		            srcRxBytes: socket.bytesRead,
		            trgTxBytes: targetStats.bytesWritten,
		            trgRxBytes: targetStats.bytesRead,
		        };
		        return result;
		    }
		    /**
		     * Forcibly close a specific pending proxy connection.
		     */
		    closeConnection(connectionId) {
		        this.log(null, 'Closing pending socket');
		        const socket = this.connections.get(connectionId);
		        if (!socket)
		            return;
		        socket.destroy();
		        this.log(null, `Destroyed pending socket`);
		    }
		    /**
		     * Forcibly closes pending proxy connections.
		     */
		    closeConnections() {
		        this.log(null, 'Closing pending sockets');
		        for (const socket of this.connections.values()) {
		            socket.destroy();
		        }
		        this.log(null, `Destroyed ${this.connections.size} pending sockets`);
		    }
		    /**
		     * Closes the proxy server.
		     * @param closeConnections If true, pending proxy connections are forcibly closed.
		     */
		    async close(closeConnections, callback) {
		        if (typeof closeConnections === 'function') {
		            callback = closeConnections;
		            closeConnections = false;
		        }
		        if (closeConnections) {
		            this.closeConnections();
		        }
		        if (this.server) {
		            const { server } = this;
		            // @ts-expect-error Let's make sure we can't access the server anymore.
		            this.server = null;
		            const promise = node_util_1.default.promisify(server.close).bind(server)();
		            return (0, nodeify_1.nodeify)(promise, callback);
		        }
		        return (0, nodeify_1.nodeify)(Promise.resolve(), callback);
		    }
		}
		exports.Server = Server;
		
	} (server));
	return server;
}

var anonymize_proxy = {};

var hasRequiredAnonymize_proxy;

function requireAnonymize_proxy () {
	if (hasRequiredAnonymize_proxy) return anonymize_proxy;
	hasRequiredAnonymize_proxy = 1;
	Object.defineProperty(anonymize_proxy, "__esModule", { value: true });
	anonymize_proxy.listenConnectAnonymizedProxy = anonymize_proxy.closeAnonymizedProxy = anonymize_proxy.anonymizeProxy = void 0;
	const node_url_1 = require$$0$4;
	const server_1 = requireServer();
	const nodeify_1 = requireNodeify();
	// Dictionary, key is value returned from anonymizeProxy(), value is Server instance.
	const anonymizedProxyUrlToServer = {};
	/**
	 * Parses and validates a HTTP proxy URL. If the proxy requires authentication,
	 * or if it is an HTTPS proxy and `ignoreProxyCertificate` is `true`, then the function
	 * starts an open local proxy server that forwards to the upstream proxy.
	 */
	const anonymizeProxy = async (options, callback) => {
	    let proxyUrl;
	    let port = 0;
	    let ignoreProxyCertificate = false;
	    if (typeof options === 'string') {
	        proxyUrl = options;
	    }
	    else {
	        proxyUrl = options.url;
	        port = options.port;
	        if (port < 0 || port > 65535) {
	            throw new Error('Invalid "port" option: only values equals or between 0-65535 are valid');
	        }
	        if (options.ignoreProxyCertificate !== undefined) {
	            ignoreProxyCertificate = options.ignoreProxyCertificate;
	        }
	    }
	    const parsedProxyUrl = new node_url_1.URL(proxyUrl);
	    if (!['http:', 'https:', ...server_1.SOCKS_PROTOCOLS].includes(parsedProxyUrl.protocol)) {
	        throw new Error(`Invalid "proxyUrl" provided: URL must have one of the following protocols: "http", "https", ${server_1.SOCKS_PROTOCOLS.map((p) => `"${p.replace(':', '')}"`).join(', ')} (was "${parsedProxyUrl}")`);
	    }
	    // If upstream proxy requires no password or if there is no need to ignore HTTPS proxy cert errors, return it directly
	    if (!parsedProxyUrl.username && !parsedProxyUrl.password && (!ignoreProxyCertificate || parsedProxyUrl.protocol !== 'https:')) {
	        return (0, nodeify_1.nodeify)(Promise.resolve(proxyUrl), callback);
	    }
	    let server;
	    const startServer = async () => {
	        return Promise.resolve().then(async () => {
	            server = new server_1.Server({
	                // verbose: true,
	                port,
	                host: '127.0.0.1',
	                prepareRequestFunction: () => {
	                    return {
	                        requestAuthentication: false,
	                        upstreamProxyUrl: proxyUrl,
	                        ignoreUpstreamProxyCertificate: ignoreProxyCertificate,
	                    };
	                },
	            });
	            return server.listen();
	        });
	    };
	    const promise = startServer().then(() => {
	        const url = `http://127.0.0.1:${server.port}`;
	        anonymizedProxyUrlToServer[url] = server;
	        return url;
	    });
	    return (0, nodeify_1.nodeify)(promise, callback);
	};
	anonymize_proxy.anonymizeProxy = anonymizeProxy;
	/**
	 * Closes anonymous proxy previously started by `anonymizeProxy()`.
	 * If proxy was not found or was already closed, the function has no effect
	 * and its result if `false`. Otherwise the result is `true`.
	 * @param closeConnections If true, pending proxy connections are forcibly closed.
	 */
	const closeAnonymizedProxy = async (anonymizedProxyUrl, closeConnections, callback) => {
	    if (typeof anonymizedProxyUrl !== 'string') {
	        throw new Error('The "anonymizedProxyUrl" parameter must be a string');
	    }
	    const server = anonymizedProxyUrlToServer[anonymizedProxyUrl];
	    if (!server) {
	        return (0, nodeify_1.nodeify)(Promise.resolve(false), callback);
	    }
	    delete anonymizedProxyUrlToServer[anonymizedProxyUrl];
	    const promise = server.close(closeConnections).then(() => {
	        return true;
	    });
	    return (0, nodeify_1.nodeify)(promise, callback);
	};
	anonymize_proxy.closeAnonymizedProxy = closeAnonymizedProxy;
	/**
	 * Add a callback on 'tunnelConnectResponded' Event in order to get headers from CONNECT tunnel to proxy
	 * Useful for some proxies that are using headers to send information like ProxyMesh
	 * @returns `true` if the callback is successfully configured, otherwise `false` (e.g. when an
	 * invalid proxy URL is given).
	 */
	const listenConnectAnonymizedProxy = (anonymizedProxyUrl, tunnelConnectRespondedCallback) => {
	    const server = anonymizedProxyUrlToServer[anonymizedProxyUrl];
	    if (!server) {
	        return false;
	    }
	    server.on('tunnelConnectResponded', ({ response, socket, head }) => {
	        tunnelConnectRespondedCallback({ response, socket, head });
	    });
	    return true;
	};
	anonymize_proxy.listenConnectAnonymizedProxy = listenConnectAnonymizedProxy;
	
	return anonymize_proxy;
}

var tcp_tunnel_tools = {};

var hasRequiredTcp_tunnel_tools;

function requireTcp_tunnel_tools () {
	if (hasRequiredTcp_tunnel_tools) return tcp_tunnel_tools;
	hasRequiredTcp_tunnel_tools = 1;
	Object.defineProperty(tcp_tunnel_tools, "__esModule", { value: true });
	tcp_tunnel_tools.closeTunnel = tcp_tunnel_tools.createTunnel = void 0;
	const tslib_1 = require$$0;
	const node_net_1 = tslib_1.__importDefault(require$$1$2);
	const node_url_1 = require$$0$4;
	const chain_1 = requireChain();
	const nodeify_1 = requireNodeify();
	const runningServers = {};
	const getAddress = (server) => {
	    const { address: host, port, family } = server.address();
	    if (family === 'IPv6') {
	        return `[${host}]:${port}`;
	    }
	    return `${host}:${port}`;
	};
	async function createTunnel(proxyUrl, targetHost, options, callback) {
	    const parsedProxyUrl = new node_url_1.URL(proxyUrl);
	    if (!['http:', 'https:'].includes(parsedProxyUrl.protocol)) {
	        throw new Error(`The proxy URL must have the "http" or "https" protocol (was "${proxyUrl}")`);
	    }
	    const url = new node_url_1.URL(`connect://${targetHost || ''}`);
	    if (!url.hostname) {
	        throw new Error('Missing target hostname');
	    }
	    if (!url.port) {
	        throw new Error('Missing target port');
	    }
	    const verbose = options && options.verbose;
	    const server = node_net_1.default.createServer();
	    const log = (...args) => {
	        if (verbose)
	            console.log(...args);
	    };
	    server.log = log;
	    server.on('connection', (sourceSocket) => {
	        var _a;
	        const remoteAddress = `${sourceSocket.remoteAddress}:${sourceSocket.remotePort}`;
	        const { connections } = runningServers[getAddress(server)];
	        log(`new client connection from ${remoteAddress}`);
	        sourceSocket.on('close', (hadError) => {
	            connections.delete(sourceSocket);
	            log(`connection from ${remoteAddress} closed, hadError=${hadError}`);
	        });
	        connections.add(sourceSocket);
	        (0, chain_1.chain)({
	            request: { url: targetHost },
	            sourceSocket,
	            handlerOpts: {
	                upstreamProxyUrlParsed: parsedProxyUrl,
	                ignoreUpstreamProxyCertificate: (_a = options === null || options === void 0 ? void 0 : options.ignoreProxyCertificate) !== null && _a !== void 0 ? _a : false,
	            },
	            server: server,
	            isPlain: true,
	        });
	    });
	    const promise = new Promise((resolve, reject) => {
	        server.once('error', reject);
	        // Let the system pick a random listening port
	        server.listen(0, () => {
	            const address = getAddress(server);
	            server.off('error', reject);
	            runningServers[address] = { server, connections: new Set() };
	            log('server listening to ', address);
	            resolve(address);
	        });
	    });
	    return (0, nodeify_1.nodeify)(promise, callback);
	}
	tcp_tunnel_tools.createTunnel = createTunnel;
	async function closeTunnel(serverPath, closeConnections, callback) {
	    const { hostname, port } = new node_url_1.URL(`tcp://${serverPath}`);
	    if (!hostname)
	        throw new Error('serverPath must contain hostname');
	    if (!port)
	        throw new Error('serverPath must contain port');
	    const promise = new Promise((resolve) => {
	        if (!runningServers[serverPath]) {
	            resolve(false);
	            return;
	        }
	        if (!closeConnections) {
	            resolve(true);
	            return;
	        }
	        for (const connection of runningServers[serverPath].connections) {
	            connection.destroy();
	        }
	        resolve(true);
	    })
	        .then(async (serverExists) => new Promise((resolve) => {
	        if (!serverExists) {
	            resolve(false);
	            return;
	        }
	        runningServers[serverPath].server.close(() => {
	            delete runningServers[serverPath];
	            resolve(true);
	        });
	    }));
	    return (0, nodeify_1.nodeify)(promise, callback);
	}
	tcp_tunnel_tools.closeTunnel = closeTunnel;
	
	return tcp_tunnel_tools;
}

var hasRequiredDist;

function requireDist () {
	if (hasRequiredDist) return dist$2;
	hasRequiredDist = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", { value: true });
		const tslib_1 = require$$0;
		tslib_1.__exportStar(requireRequest_error(), exports);
		tslib_1.__exportStar(requireServer(), exports);
		tslib_1.__exportStar(requireRedact_url(), exports);
		tslib_1.__exportStar(requireAnonymize_proxy(), exports);
		tslib_1.__exportStar(requireTcp_tunnel_tools(), exports);
		
	} (dist$2));
	return dist$2;
}

var distExports = requireDist();

class ProxyServer extends distExports.Server {
  logger;
  whitelistedOrigin;
  constructor(options) {
    super({
      port: options.port,
      host: options.host,
      prepareRequestFunction: options.prepareRequestFunction
    });
    this.logger = options.logger;
    this.whitelistedOrigin = new Set(
      (options.whitelistedClients || "").split(",").filter((i) => i).map((i) => i.replaceAll(" ", ""))
    );
  }
  log(connectionId, str) {
    if (str.includes("Listening")) {
      return;
    }
    const logPrefix = connectionId ? `${String(connectionId)} | ` : "";
    this.logger.debug(`${logPrefix}${str}`);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async prepareRequestHandling(request) {
    if (this.whitelistedOrigin.size) {
      const remoteAddress = request.socket.remoteAddress;
      if (!this.whitelistedOrigin.has(remoteAddress)) {
        const error = `${remoteAddress} is not on ip whitelist!`;
        throw new distExports.RequestError(error, 400);
      }
    }
    return super.prepareRequestHandling(request);
  }
}
class Proxy {
  config;
  logger;
  logSystem;
  logComponent;
  server;
  constructor(config, forkId = 0) {
    this.config = config;
    this.logSystem = "Proxy";
    this.logComponent = `Thread ${forkId}`;
    this.logger = new Logger(config, this.logSystem, this.logComponent);
    this.server = new ProxyServer({
      port: config.port,
      host: config.host,
      logger: this.logger,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      prepareRequestFunction: (options) => {
        return {
          upstreamProxyUrl: config.upstreamProxy
        };
      }
    });
    this.server.listen(() => {
      this.logger.debug(`Listening on http://${config.host}:${config.port}`);
    });
  }
}

if (cluster.isWorker) {
  const config = JSON.parse(process$1.env.config);
  const forkId = Number(process$1.env.forkId);
  switch (process$1.env.workerType) {
    case "proxy":
      new Proxy(config, forkId);
      break;
  }
}
function createProxyWorker(config, logger, forkId) {
  const worker = cluster.fork({
    workerType: "proxy",
    forkId,
    config: JSON.stringify(config)
  });
  worker.on("exit", (code) => {
    logger.debug("Main", "Spawner", `Proxy worker ${forkId} exit with ${code}, spawning replacement...`);
    setTimeout(() => {
      createProxyWorker(config, logger, forkId);
    }, 2e3);
  });
}
function start() {
  const { name, version, description } = pkgJson;
  const program = new Command();
  program.name(name).version(version).description(description);
  program.option("-h, --host <HOST>", "Local Proxy HTTP HOST to listen to").option("-p, --port <PORT>", "Local Proxy HTTP PORT to listen to").option(
    "-w, --workers <WORKERS>",
    "Number of threads to spawn the proxy (Default to max cores available)"
  ).option("-l, --log-level <LOG_LEVEL>", "Level of logs to display, defaults to debug").option("-c, --log-colors <LOG_COLORS>", "Enable colors for logging, defauls to true").option(
    "-u, --upstream-proxy <UPSTREAM_PROXY>",
    "Upstream proxy, should start with socks5:// or http://"
  ).action((options) => {
    if (!options.upstreamProxy) {
      const error = `Invalid upstream proxy ${options.upstreamProxy}`;
      throw new Error(error);
    }
    const config = {
      host: options.host || "0.0.0.0",
      port: Number(options.port) || 3128,
      workers: Number(options.workers) || require$$0$7.cpus().length,
      logLevel: options.logLevel || "debug",
      logColors: options.logColors !== "false",
      upstreamProxy: options.upstreamProxy
    };
    const logger = new Logger(config);
    let i = 0;
    while (i < config.workers) {
      createProxyWorker(config, logger, i);
      i++;
    }
    logger.debug(
      "Main",
      "Spawner",
      `Spawned ${i} proxy workers: (local: http://${config.host}:${config.port}, upstream: ${config.upstreamProxy})`
    );
  });
  program.parse();
}
if (cluster.isPrimary) {
  start();
}
