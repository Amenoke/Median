//
//  MEDIAN CORE (FIXED VERSION)
//  2025
//      ~ Amenoke
//


class MedianCore {
    constructor() {


        //////////////////////////////////////////////////
        // [INITIAL CONFIGURATION]
        //////////////////////////////////////////////////
        // Config initialization via the internal system.
        // This module enables the initialization of default configuration settings
        //////////////////////////////////////////////////
        // [compiler]
        // Selecting a compiler for terminal operations.
        // args: DI, FL, DC, null
        // DI - direct interpretation
        // FL - flexible compilation
        // DC - direct compilation
        // null - ~
        //////////////////////////////////////////////////
        // [optimizationlevel] ~
        // args: int32
        //////////////////////////////////////////////////
        // [strictMode] ~
        // args: bool
        //////////////////////////////////////////////////
        // [debugSymbols] ~
        // args: bool
        //////////////////////////////////////////////////


        this.config = {
            compiler: null,
            compilerOptions: {
                optimizationLevel: 1,
                strictMode: false,
                debugSymbols: true
            },


            //////////////////////////////////////////////////
            // [memoryLimitMB] ~
            // args: int32{pows of 2}
            //////////////////////////////////////////////////
            // [timeoutMs] ~
            // args: int32
            //////////////////////////////////////////////////
            // [maxOutputLines] ~
            // args: int32
            //////////////////////////////////////////////////
            // [historySize] ~
            // args: int32
            //////////////////////////////////////////////////
            // [theme] ~
            // args: 'dark'
            //////////////////////////////////////////////////
            // [autoScroll] ~
            // args: bool
            //////////////////////////////////////////////////


            bash: {
                memoryLimitMB: 512,
                timeoutMs: 10000,
                maxOutputLines: 1000,
                historySize: 50,
                theme: 'dark',
                autoScroll: true
            },


            //////////////////////////////////////////////////
            // [key] ~
            // args: '1.0.0'
            //////////////////////////////////////////////////


            configuration: {
                key: '1.0.0'
            }
        };


        //////////////////////////////////////////////////
        // [COMPILERS REGISTRY]
        //////////////////////////////////////////////////
        // [name]
        //////////////////////////////////////////////////
        // [description]
        //////////////////////////////////////////////////


        this.compilers = {
            'null': {
                name: 'Null Compiler',
                description: '',
                options: {}
            },


            // [Direct Interpreter]
            // MAIN DEVS: @Amenoke
            // [jit]
            // A compilation technology in which code is converted into machine instructions not in advance // (as in AOT compilation), but during program execution.
            // args: bool
            //////////////////////////////////////////////////
            // => [packages]
            // 'directint'
            // The fundamental package required for DI mode operation. Provides basic interpreter
            // functionality.
            //////////////////////////////////////////////////
            // 'directint-sys'
            // Enables system commands beyond basic compiler control. Required for most ~ commands.
            //////////////////////////////////////////////////
            // 'directint-api'
            // Provides standard API functions and prevents automatic Unicode conversion of text.
            //////////////////////////////////////////////////
            // 'di-ext'
            // Adds configuration capabilities through the ~config command.
            //////////////////////////////////////////////////
            // 'directint-actu'
            // Provides system information through the ~i command and enhances error reporting.
            //////////////////////////////////////////////////


            'DI': {
                name: 'Direct Interpreter',
                description: '@Amenoke developing',
                options: {
                    strictMode: true,
                    jit: false,
                    packages: {
                        available: ['directint', 'directint-sys', 'directint-api', 'di-ext', 'direct-actu'],
                        installed: ['directint', 'directint-sys', 'directint-api'],
                        active: ['directint', 'directint-sys', 'directint-api', 'di-ext']
                    }
                }
            },


            // [Flexible Compiler]
            // MAIN DEVS: @Amenoke
            // [release]
            // args: '1.0.0'
            //////////////////////////////////////////////////
            // [path]
            // Specifies the kernel path to the compiler logs.
            // args: <Type>[path]
            //////////////////////////////////////////////////
            // [target]
            // Specifies the kernel path to the compiler configuration logs.
            // args: <Type>[path]
            //////////////////////////////////////////////////
            // [branches]
            // Parameter responsible for using the default structure of connected branches
            // args: bool
            //////////////////////////////////////////////////
            // [optimizationLevel] ~
            // args: int32
            //////////////////////////////////////////////////
            // [inlineFunctions] ~
            // args: bool
            //////////////////////////////////////////////////
            // => [packages]
            // 'fl-var'
            // Essential package for FL mode that enables variable processing and basic functionality.
            //////////////////////////////////////////////////
            // 'fl-rec'
            // Provides comprehensive error logging capabilities for the Flexible Compiler mode. This package is dedicated solely to error tracking and does not provide any other
            // functionality.
            //////////////////////////////////////////////////
            // 'fl-gitbranch'
            // Enables branch processing with the => operator for conditional execution flows.
            //////////////////////////////////////////////////


            'FL': {
                name: 'Flexible Compiler',
                description: '@Amenoke developing',
                options: {
                    release: '1.0.0',
                    path: '/var/log/fc',
                    target: null,
                    branches: false,
                    optimizationLevel: 2,
                    inlineFunctions: true,
                    packages: {
                        available: ['fl-var', 'fl-rec', 'fl-gitbranch'],
                        installed: ['fl-var'],
                        active: ['fl-var']
                    }
                }
            },


            // [Direct Compiler]
            // MAIN DEVS: @Amenoke
            // [fastBuild] ~
            // args: bool
            //////////////////////////////////////////////////
            // [debugSymbols] ~
            // args: bool
            //////////////////////////////////////////////////


            'DC': {
                name: 'Direct Compiler',
                description: '',
                options: {
                    fastBuild: true,
                    debugSymbols: false
                }
            }
        };


        //////////////////////////////////////////////////
        // [SYSTEM STATE]
        //////////////////////////////////////////////////


        this.memoryUsage = 0;
        this.compilationCache = {};
        this.lastError = null;
        this.errorLogs = [];
        this.lastCommand = null;
        this.systemCommands = ['COMPIL', 'CONF', 'MEM', 'RES', 'DIPKG', 'INFO', 'FLPKG', 'LOGS'];
    }


    //////////////////////////////////////////////////
    // [CORE METHODS]
    //////////////////////////////////////////////////


    processCommand(input) {
        this.lastCommand = input.trim();
        try {
            this.checkMemory();
            this.lastError = null;
            const lines = input.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
            if (lines.length === 0) return '';
            const hasBranches = lines.some(line => line.includes('~'));
            if (hasBranches) {
                if (this.config.compiler !== 'FL' ||
                    !this.compilers.FL.options.packages.active.includes('fl-gitbranch')) {
                    throw new Error('Branch structures require FL compiler with fl-gitbranch package');
                    }
                    return this.processBranchedCommands(lines);
            }
            return this.processSingleCommand(lines[0]);
        } catch (e) {
            this.logError(e);
            throw e;
        }
    }
    processBranchedCommands(lines) {
        const results = [];
        let currentBranch = [];
        for (const line of lines) {
            if (line.includes('~')) {
                if (currentBranch.length > 0) {
                    try {
                        results.push(this.processBranch(currentBranch));
                    } catch (e) {
                        results.push(`[Branch Error]: ${e.message}`);
                    }
                    currentBranch = [];
                }
                const [left, right] = line.split('~').map(s => s.trim());
                if (left) currentBranch.push(left);
                if (right) currentBranch.push(right);
            } else if (currentBranch.length > 0) {
                currentBranch.push(line);
            } else {
                try {
                    results.push(this.processSingleCommand(line));
                } catch (e) {
                    results.push(`[Error]: ${e.message}`);
                }
            }
        }
        if (currentBranch.length > 0) {
            try {
                results.push(this.processBranch(currentBranch));
            } catch (e) {
                results.push(`[Branch Error]: ${e.message}`);
            }
        }
        return results.join('\n---\n');
    }
    processBranch(commands) {
        const results = [];
        let hasError = false;
        for (const cmd of commands) {
            try {
                if (hasError) {
                    results.push(`[Skipped]: ${cmd}`);
                    continue;
                }
                const result = this.processSingleCommand(cmd);
                results.push(result);
            } catch (e) {
                hasError = true;
                results.push(`[Error]: ${e.message}`);
            }
        }
        return results.join('\n> ');
    }
    processSingleCommand(command) {
        if (this.isSystemCommand(command)) {
            return this.processSystemCommand(command);
        }
        if (this.config.compiler === null) {
            throw new Error('No compiler set (use COMPIL)');
        }
        return this.processCodeCommand(command);
    }
    isSystemCommand(command) {
        return this.systemCommands.some(cmd => command.startsWith(cmd));
    }
    processSystemCommand(command) {
        try {
            const parts = command.split(' ');
            const cmd = parts[0];
            const args = parts.slice(1);
            if (this.config.compiler === 'DI') {
                const diOpts = this.compilers.DI.options;
                if (!diOpts.packages.active.includes('directint-sys') && cmd !== 'COMPIL') {
                    throw new Error('DI in restricted mode (only compiler changes allowed)');
                }
            }
            switch (cmd) {
                case 'COMPIL': return this.handleCompilerCommand(args);
                case 'CONF': return this.handleConfigCommand(args);
                case 'MEM': return this.handleMemoryCommand();
                case 'RES': return this.handleResetCommand();
                case 'DIPKG': return this.handleDIPackageCommand(args);
                case 'FLPKG': return this.handleFLPackageCommand(args);
                case 'INFO': return this.handleInfoCommand();
                case 'LOGS':
                    if (this.config.compiler !== 'FL' ||
                        !this.compilers.FL.options.packages.active.includes('fl-rec')) {
                        throw new Error('Logs require FL compiler with fl-rec package');
                        }
                        return this.handleLogsCommand(args);
                default: throw new Error(`Unknown system command: ${cmd}`);
            }
        } catch (e) {
            this.logError(e);
            throw e;
        }
    }
    processCodeCommand(code) {
        this.memoryUsage += code.length * 100;
        switch (this.config.compiler) {
            case 'DI': return this.processWithDirectInterpreter(code);
            case 'FL': return this.processWithFlexCompiler(code);
            case 'DC': return this.processWithDirectCompiler(code);
            default: throw new Error('Unsupported compiler');
        }
    }


    //////////////////////////////////////////////////
    // [LOGGING SYSTEM]
    //////////////////////////////////////////////////


    logError(error) {
        const existingError = this.errorLogs.find(log =>
        log.message === error.message &&
        log.command === this.lastCommand
        );
        if (!existingError) {
            const currentCompiler = this.config.compiler;
            const compilerOptions = currentCompiler ? this.compilers[currentCompiler]?.options : {};
            const errorEntry = {
                timestamp: new Date().toISOString(),
                message: error.message,
                stack: error.stack,
                compiler: currentCompiler,
                memoryUsage: this.memoryUsage,
                path: compilerOptions?.path || null,
                target: compilerOptions?.target || null,
                command: this.lastCommand,
                type: this.determineErrorType(error)
            };
            this.errorLogs.push(errorEntry);
        }
    }
    determineErrorType(error) {
        if (error.message.includes('Memory limit')) return 'MEMORY';
        if (error.message.includes('compiler')) return 'COMPILER';
        if (error.message.includes('package')) return 'PACKAGE';
        if (error.message.includes('config')) return 'CONFIG';
        if (this.lastCommand.match(/^(COMPIL|CONF|MEM|RES|DIPKG|INFO|FLPKG|LOGS)/)) return 'SYSTEM';
        return 'RUNTIME';
    }
    handleLogsCommand(args) {
        try {
            if (args.length === 0) {
                return this.showAllLogs();
            }
            const filterType = args[0].toLowerCase();
            const filterValue = args.slice(1).join(' ');
            if (!filterValue) return "Please specify filter value";
            switch (filterType) {
                case 'compiler': return this.filterLogs('compiler', filterValue);
                case 'path': return this.filterLogs('path', filterValue);
                case 'target': return this.filterLogs('target', filterValue);
                case 'command': return this.filterLogs('command', filterValue);
                case 'type': return this.filterLogs('type', filterValue);
                default: throw new Error("Invalid filter. Use: compiler/path/target/command/type");
            }
        } catch (e) {
            this.logError(e);
            throw e;
        }
    }
    showAllLogs() {
        if (this.errorLogs.length === 0) return "No logs available";
        return this.errorLogs.map((log, idx) =>
        `[LOG ${idx+1}] ${log.timestamp}\n` +
        `Type: ${log.type || 'ERROR'}\n` +
        `Compiler: ${log.compiler || 'none'}\n` +
        `Path: ${log.path || 'none'}\n` +
        `Target: ${log.target || 'none'}\n` +
        `Command: ${log.command || 'none'}\n` +
        `Error: ${log.message}\n` +
        `Memory: ${(log.memoryUsage / (1024 * 1024)).toFixed(2)}MB\n` +
        `---------------------------------`
        ).join('\n');
    }
    filterLogs(field, value) {
        const filtered = this.errorLogs.filter(log =>
        log[field] && String(log[field]).toLowerCase().includes(value.toLowerCase())
        );
        if (filtered.length === 0) return `No logs found for ${field}="${value}"`;
        return filtered.map((log, idx) =>
        `[${field.toUpperCase()} LOG ${idx+1}]\n` +
        `Timestamp: ${log.timestamp}\n` +
        `Type: ${log.type}\n` +
        `Compiler: ${log.compiler}\n` +
        `Error: ${log.message}\n` +
        `Command: ${log.command}\n` +
        (log.path ? `Path: ${log.path}\n` : '') +
        (log.target ? `Target: ${log.target}\n` : '')
        ).join('\n\n');
    }


    //////////////////////////////////////////////////
    // [COMPILATION METHODS]
    //////////////////////////////////////////////////


    processWithDirectInterpreter(code) {
        const options = this.compilers.DI.options;
        if (!options.packages.active.includes('directint')) {
            throw new Error('DI package not active');
        }
        let result = '';
        if (options.packages.active.includes('direct-actu')) {
            result += this.getPackageInfoWindow();
        }
        return result + (options.packages.active.includes('directint-api')
        ? code
        : this.convertToUnicodeNames(code));
    }
    processWithFlexCompiler(code) {
        const options = this.compilers.FL.options;
        if (!options.packages.active.includes('fl-var')) {
            throw new Error('fl-var package required');
        }
        let result = code;
        if (options.optimizationLevel > 0 && options.inlineFunctions) {
            result = result.replace(/function\s+(\w+)\(\)\s*\{([^}]+)\}/g, '/* inlined $1 */ $2');
    }
    return result;
}
processWithDirectCompiler(code) {
    return code;
}


//////////////////////////////////////////////////
// [CONFIGURATION METHODS]
//////////////////////////////////////////////////


handleCompilerCommand(args) {
    try {
        if (args.length === 0) {
            let result = 'Available compilers:\n';
            for (const [key, comp] of Object.entries(this.compilers)) {
                result += `  ${key}: ${comp.name}\n    ${comp.description}\n`;
            }
            return result;
        }
        const compiler = args[0].toUpperCase();
        if (compiler === '0') {
            this.config.compiler = null;
            return 'Compiler set to null';
        }
        if (!this.compilers[compiler]) {
            throw new Error(`Unknown compiler: ${compiler}`);
        }
        this.config.compiler = compiler;
        this.config.compilerOptions = {...this.compilers[compiler].options};
        return `${this.compilers[compiler].name} activated`;
    } catch (e) {
        this.logError(e);
        throw e;
    }
}
handleConfigCommand(args) {
    try {
        if (args.length === 0) {
            return this.getConfigString();
        }
        if (args[0] === 'SET' && args.length >= 3) {
            const path = args[1].split('.');
            const value = args.slice(2).join(' ');
            return this.setConfigValue(path, value);
        }
        throw new Error('Invalid config command. Usage: CONF [SET <path> <value>]');
    } catch (e) {
        this.logError(e);
        throw e;
    }
}
getConfigString() {
    return JSON.stringify({
        compiler: this.config.compiler,
        compilerOptions: this.config.compilerOptions,
        bash: this.config.bash,
        configuration: this.config.configuration
    }, null, 2);
}
setConfigValue(path, value) {
    try {
        let current = this.config;
        for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) {
                current[path[i]] = {};
            }
            current = current[path[i]];
        }
        let finalValue;
        if (value === 'true') finalValue = true;
        else if (value === 'false') finalValue = false;
        else if (!isNaN(value)) finalValue = Number(value);
        else finalValue = value;
        current[path[path.length - 1]] = finalValue;
        return `Set config: ${path.join('.')} = ${finalValue}`;
    } catch (e) {
        this.logError(e);
        throw new Error(`Failed to set config: ${e.message}`);
    }
}


//////////////////////////////////////////////////
// [PACKAGE MANAGEMENT]
//////////////////////////////////////////////////


handleDIPackageCommand(args) {
    try {
        if (this.config.compiler !== 'DI') {
            throw new Error('DI packages require DI compiler');
        }
        if (args.length === 0) {
            return this.listDIPackages();
        }
        const [cmd, pkg] = args;
        switch (cmd) {
            case 'INST': return this.installDIPackage(pkg);
            case 'UNINST': return this.uninstallDIPackage(pkg);
            case 'ACT': return this.activateDIPackage(pkg);
            case 'DEACT': return this.deactivateDIPackage(pkg);
            case 'LIST': return this.listDIPackages();
            case 'AV': return this.listAvailableDIPackages();
            default: throw new Error(`Unknown DI package command: ${cmd}`);
        }
    } catch (e) {
        this.logError(e);
        throw e;
    }
}
listDIPackages() {
    const pkgs = this.compilers.DI.options.packages;
    return `DI Packages:
    Available: ${pkgs.available.join(', ')}
    Installed: ${pkgs.installed.join(', ')}
    Active: ${pkgs.active.join(', ')}`;
}
installDIPackage(pkg) {
    const pkgs = this.compilers.DI.options.packages;
    if (!pkgs.available.includes(pkg)) {
        throw new Error(`Package not available: ${pkg}`);
    }
    if (pkgs.installed.includes(pkg)) {
        return `Package already installed: ${pkg}`;
    }
    pkgs.installed.push(pkg);
    return `Installed: ${pkg}`;
}
uninstallDIPackage(pkg) {
    const pkgs = this.compilers.DI.options.packages;
    if (!pkgs.installed.includes(pkg)) {
        return `Package not installed: ${pkg}`;
    }
    pkgs.installed = pkgs.installed.filter(x => x !== pkg);
    pkgs.active = pkgs.active.filter(x => x !== pkg);
    return `Uninstalled: ${pkg}`;
}
activateDIPackage(pkg) {
    const pkgs = this.compilers.DI.options.packages;
    if (!pkgs.installed.includes(pkg)) {
        throw new Error(`Package not installed: ${pkg}`);
    }
    if (pkgs.active.includes(pkg)) {
        return `Package already active: ${pkg}`;
    }
    pkgs.active.push(pkg);
    return `Activated: ${pkg}`;
}
deactivateDIPackage(pkg) {
    const pkgs = this.compilers.DI.options.packages;
    if (!pkgs.active.includes(pkg)) {
        return `Package not active: ${pkg}`;
    }
    pkgs.active = pkgs.active.filter(x => x !== pkg);
    return `Deactivated: ${pkg}`;
}
listAvailableDIPackages() {
    return `Available DI packages:\n${this.compilers.DI.options.packages.available.join('\n')}`;
}
handleFLPackageCommand(args) {
    try {
        if (this.config.compiler !== 'FL') {
            throw new Error('FL packages require FL compiler');
        }
        if (args.length === 0) {
            return this.listFLPackages();
        }
        const [cmd, pkg] = args;
        let result = '';
        switch (cmd) {
            case 'INST':
                result = this.installFLPackage(pkg);
                if (pkg === 'fl-gitbranch') {
                    this.compilers.FL.options.branches = true;
                    if (!this.compilers.FL.options.packages.active.includes('fl-gitbranch')) {
                        this.compilers.FL.options.packages.active.push('fl-gitbranch');
                    }
                }
                return result;
            case 'UNINST':
                result = this.uninstallFLPackage(pkg);
                if (pkg === 'fl-gitbranch') {
                    this.compilers.FL.options.branches = false;
                }
                return result;
            case 'ACT':
                result = this.activateFLPackage(pkg);
                if (pkg === 'fl-gitbranch') {
                    this.compilers.FL.options.branches = true;
                }
                return result;
            case 'DEACT':
                result = this.deactivateFLPackage(pkg);
                if (pkg === 'fl-gitbranch') {
                    this.compilers.FL.options.branches = false;
                }
                return result;
            case 'LIST': return this.listFLPackages();
            case 'AV': return this.listAvailableFLPackages();
            default: throw new Error(`Unknown FL package command: ${cmd}`);
        }
    } catch (e) {
        this.logError(e);
        throw e;
    }
}
listFLPackages() {
    const pkgs = this.compilers.FL.options.packages;
    return `FL Packages:
    Available: ${pkgs.available.join(', ')}
    Installed: ${pkgs.installed.join(', ')}
    Active: ${pkgs.active.join(', ')}`;
}
installFLPackage(pkg) {
    const pkgs = this.compilers.FL.options.packages;
    if (!pkgs.available.includes(pkg)) {
        throw new Error(`Package not available: ${pkg}`);
    }
    if (pkgs.installed.includes(pkg)) {
        return `Package already installed: ${pkg}`;
    }
    pkgs.installed.push(pkg);
    return `Installed: ${pkg}`;
}
uninstallFLPackage(pkg) {
    const pkgs = this.compilers.FL.options.packages;
    if (!pkgs.installed.includes(pkg)) {
        return `Package not installed: ${pkg}`;
    }
    pkgs.installed = pkgs.installed.filter(x => x !== pkg);
    pkgs.active = pkgs.active.filter(x => x !== pkg);
    return `Uninstalled: ${pkg}`;
}
activateFLPackage(pkg) {
    const pkgs = this.compilers.FL.options.packages;
    if (!pkgs.installed.includes(pkg)) {
        throw new Error(`Package not installed: ${pkg}`);
    }
    if (pkgs.active.includes(pkg)) {
        return `Package already active: ${pkg}`;
    }
    pkgs.active.push(pkg);
    return `Activated: ${pkg}`;
}
deactivateFLPackage(pkg) {
    const pkgs = this.compilers.FL.options.packages;
    if (!pkgs.active.includes(pkg)) {
        return `Package not active: ${pkg}`;
    }
    pkgs.active = pkgs.active.filter(x => x !== pkg);
    return `Deactivated: ${pkg}`;
}
listAvailableFLPackages() {
    return `Available FL packages:\n${this.compilers.FL.options.packages.available.join('\n')}`;
}


//////////////////////////////////////////////////
// [UTILITY METHODS]
//////////////////////////////////////////////////


checkMemory() {
    if (this.memoryUsage > this.config.bash.memoryLimitMB * 1024 * 1024) {
        throw new Error(`Memory limit exceeded (${this.config.bash.memoryLimitMB}MB)`);
    }
}
handleMemoryCommand() {
    const usedMB = (this.memoryUsage / (1024 * 1024)).toFixed(2);
    const limitMB = this.config.bash.memoryLimitMB;
    const percent = (this.memoryUsage / (limitMB * 1024 * 1024) * 100).toFixed(1);
    return `Memory: ${usedMB}MB / ${limitMB}MB (${percent}%)`;
}
handleResetCommand() {
    this.memoryUsage = 0;
    this.compilationCache = {};
    this.errorLogs = [];
    this.lastCommand = null;
    this.lastError = null;
    return 'System reset complete';
}
handleInfoCommand() {
    try {
        if (this.config.compiler !== 'DI' ||
            !this.compilers.DI.options.packages.active.includes('direct-actu')) {
            throw new Error('Info requires DI compiler with direct-actu package');
            }
            return this.getPackageInfoWindow();
    } catch (e) {
        this.logError(e);
        throw e;
    }
}
getPackageInfoWindow() {
    const diOpts = this.compilers.DI.options;
    return `=== DI PACKAGE INFO ===
    Active packages: ${diOpts.packages.active.join(', ')}
    Memory usage: ${(this.memoryUsage / (1024 * 1024)).toFixed(2)}MB
    Last error: ${this.lastError || 'none'}`;
}
convertToUnicodeNames(text) {
    return Array.from(text)
    .map(c => `U+${c.codePointAt(0).toString(16).toUpperCase()}`)
    .join(' ');
}
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MedianCore;
}
