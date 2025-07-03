//
//  MEDIAN CORE
//  2025
//      ~ Amenoke
//


class MedianCore {


//
//
// [STANDARD CONFIGURATION]
//
//


    constructor() {
        this.config = {
            compiler: null,
            compilerOptions: {
                optimizationLevel: 1,
                strictMode: false,
                debugSymbols: true
            },
            terminal: {
                memoryLimitMB: 512,
                timeoutMs: 10000,
                maxOutputLines: 1000,
                historySize: 50,
                theme: 'dark',
                autoScroll: true
            },
        };


//
//
// [COMPILERS CONFIGURATION]
//
//


        this.compilers = {
            'DI': {
                name: 'Direct Interpreter',
                description: 'Executes code directly without compilation',
                options: {
                    strictMode: true,
                    jit: false
                }
            },
            'FlComp': {
                name: 'Flexible Compiler',
                description: 'Balanced compilation with optimizations',
                options: {
                    optimizationLevel: 2,
                    inlineFunctions: true
                }
            },
            'DirComp': {
                name: 'Direct Compiler',
                description: 'Fast compilation with minimal optimizations',
                options: {
                    fastBuild: true,
                    debugSymbols: false
                }
            }
        };


//
//
// [SYSTEM CONFIGURATION]
//
//
//


        this.memoryUsage = 0;
        this.compilationCache = {};
        this.lastError = null;
    }


//
//
// [SETTINGS]
//
//
//


    processCommand(command) {
        try {


// [MEMORY]


            this.checkMemory();


// [ERROR]


            this.lastError = null;


// [TYPES]


            if (command.startsWith('~')) {
                return this.processSystemCommand(command);
            }


// [COMPILER]


            if (!this.config.compiler) {
                throw new Error('Host.exception => Compiler $');
            }


// [COMMAND]


            return this.processCodeCommand(command);
        } catch (e) {
            this.lastError = e.message;
            throw e;
        }
    }


// [SYSTEM]


    processSystemCommand(command) {
        const parts = command.split(' ');
        const cmd = parts[0];
        const args = parts.slice(1);
        switch (cmd) {
            case '~compil':
                return this.handleCompilerCommand(args);
            case '~config':
                return this.handleConfigCommand(args);
            case '~memory':
                return this.handleMemoryCommand();
            case '~reset':
                return this.handleResetCommand();
            default:
                throw new Error(`System.exception => ${cmd}`);
        }
    }


// [HANDLES]


    handleCompilerCommand(args) {
        if (args.length === 0) {
            return this.listAvailableCompilers();
        }
        const compiler = args[0].toUpperCase();
        if (!this.compilers[compiler]) {
            throw new Error(`Compiler.exception => ${compiler}`);
        }


// [COMPILERS INSTALLING]


        this.config.compiler = compiler;
        this.config.compilerOptions = {
            ...this.compilers[compiler].options
        };
        return `${this.compilers[compiler].name} $$ merged (\n${this.compilers[compiler].description})`;
    }


// [CONFIGURATION COMMANDS]

    handleConfigCommand(args) {
        if (args.length === 0) {
            return this.getConfigString();
        }
        if (args[0] === 'set' && args.length >= 3) {
            const path = args[1].split('.');
            const value = args.slice(2).join(' ');
            return this.setConfigValue(path, value);
        }
        throw new Error('Configuration $$ exception');
    }


// [MEMORY COMMANDS]


    handleMemoryCommand() {
        const usedMB = (this.memoryUsage / (1024 * 1024)).toFixed(2);
        const limitMB = this.config.terminal.memoryLimitMB;
        const percent = (this.memoryUsage / (limitMB * 1024 * 1024) * 100).toFixed(1);
        return `Memory usage: ${usedMB} MB / ${limitMB} MB (${percent}%)`;
    }


// [SYSTEM STATE]


    handleResetCommand() {
        this.memoryUsage = 0;
        this.compilationCache = {};
        return 'System state reset';
    }


//
//
// [COMMAND BLOCK]
//
//
//


    processCodeCommand(command) {
        this.memoryUsage += command.length * 100;
        switch (this.config.compiler) {
            case 'DI':
                return this.processWithDirectInterpreter(command);
            case 'FlComp':
                return this.processWithFlexibleCompiler(command);
            case 'DirComp':
                return this.processWithDirectCompiler(command);
            default:
                throw new Error('Compiler.exception ~');
        }
    }


// [METHODS]


    processWithDirectInterpreter(code) {
        return `${code}`;
    }
    processWithFlexibleCompiler(code) {
        return `${code}`;
    }

    processWithDirectCompiler(code) {
        return `${code}`;
    }


// [SUBMETHODS]


    listAvailableCompilers() {
        let result = 'Available compilers:\n';
        for (const [key, comp] of Object.entries(this.compilers)) {
            result += `  ${key}: ${comp.name}\n    ${comp.description}\n`;
        }
        return result.trim();
    }
    setConfigValue(path, value) {
        let current = this.config;
        for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) {
                current[path[i]] = {};
            }
            current = current[path[i]];
        }


// [TYPE CONVERT]


        let finalValue;
        if (value === 'true') finalValue = true;
        else if (value === 'false') finalValue = false;
        else if (!isNaN(value) && value.trim() !== '') finalValue = Number(value);
        else finalValue = value;

        current[path[path.length - 1]] = finalValue;
        return `Config updated: ${path.join('.')} = ${finalValue}`;
    }
    checkMemory() {
        if (this.memoryUsage > this.config.terminal.memoryLimitMB * 1024 * 1024) {
            throw new Error(`Memory limit exceeded (${this.config.terminal.memoryLimitMB}MB)`);
        }
    }


// [CONFIGURATION METHODS]


    getConfigString() {
        return `${JSON.stringify({
            compiler: this.config.compiler,
            compilerOptions: this.config.compilerOptions,
            terminal: this.config.terminal,
            libraries: this.config.libraries
        }, null, 2)}`;
    }
    loadConfig(config) {
        try {
            const parsed = JSON.parse(config.replace(/\/\/.*$/gm, '').trim());
            this.config = {
                ...this.config,
                ...parsed,
                terminal: {
                    ...this.config.terminal,
                    ...(parsed.terminal || {})
                },
                compilerOptions: {
                    ...this.config.compilerOptions,
                    ...(parsed.compilerOptions || {})
                }
            };
            return true;
        } catch (e) {
            throw new Error('Invalid config format');
        }
    }
    resetMemoryUsage() {
        this.memoryUsage = 0;
    }
    getLastError() {
        return this.lastError;
    }
}
