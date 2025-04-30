#!/usr/bin/env node

import {
    copyFileSync,
    existsSync,
    lstatSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    rmSync,
    writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { isCancel, select, text, log } from '@clack/prompts';
import { kebabCase } from 'es-toolkit';
import { execSync } from 'node:child_process';

const engines = ['deno', 'node', 'bun'] as const;
type Engine = (typeof engines)[number];

const args = parseArgs({
    options: {
        help: {
            type: 'boolean',
        },
        name: {
            type: 'string',
        },
        engine: {
            type: 'string',
        },
        target: {
            type: 'string',
        },
        force: {
            type: 'boolean',
        },
        git: {
            type: 'boolean',
            default: true,
        },
    },
});

async function ensureEngine(engine?: string): Promise<Engine> {
    if (engines.includes(engine as Engine)) {
        return engine as Engine;
    }

    const selection = await select({
        message: 'Pick a runtime engine:',
        options: [
            {
                label: 'Node',
                value: 'node',
            },
            {
                label: 'Deno',
                value: 'deno',
            },
            {
                label: 'Bun',
                value: 'bun',
            },
        ],
    });

    if (!selection || isCancel(selection)) {
        process.exit(1);
    }

    return selection as Engine;
}
async function ensureName(name?: string): Promise<string> {
    if (name && name.trim().length > 0) {
        return name;
    }

    const enteredName = await text({
        message: 'Enter a project name:',
        placeholder: 'my project',
    });

    if (!enteredName || typeof enteredName !== 'string') {
        process.exit(1);
    }

    return enteredName;
}

async function ensureTargetDir(name: string, target?: string): Promise<string> {
    if (target) return target;

    const defaultName = `./${kebabCase(name)}`;

    const response = await text({
        message: 'Where should the template be copied?',
        placeholder: defaultName,
        defaultValue: defaultName,
    });

    if (!response || isCancel(response)) {
        process.exit(1);
    }

    return response as string;
}

function isDirEmpty(path: string): boolean {
    return !existsSync(path) || readdirSync(path).length === 0;
}

function copyRecursive(srcDir: string, destDir: string) {
    if (!existsSync(destDir)) {
        mkdirSync(destDir, {
            recursive: true,
        });
    }

    for (const item of readdirSync(srcDir)) {
        const src = join(srcDir, item);
        const dest = join(destDir, item);

        if (lstatSync(src).isDirectory()) {
            copyRecursive(src, dest);
        } else {
            copyFileSync(src, dest);
        }
    }
}

async function handleTargetDirectory(targetPath: string) {
    if (args.values.force) {
        rmSync(targetPath, {
            recursive: true,
            force: true,
        });
        return;
    }

    if (!existsSync(targetPath)) {
        return;
    }

    if (isDirEmpty(targetPath)) {
        return;
    }

    const action = await select({
        message: `Target directory "${targetPath}" is not empty. How should we proceed?`,
        options: [
            {
                label: 'Cancel',
                value: 'cancel',
            },
            {
                label: 'Overwrite',
                value: 'overwrite',
            },
        ],
    });

    if (!action || isCancel(action) || action === 'cancel') {
        console.log('✖ Operation cancelled');
        process.exit(1);
    }

    if (action === 'overwrite') {
        rmSync(targetPath, {
            recursive: true,
            force: true,
        });
    }
}

async function updateProjectName(path: string, name: string) {
    if (!existsSync(join(path, 'package.json'))) {
        console.log('nope');
    } else {
        const packageJson = JSON.parse(
            readFileSync(join(path, 'package.json'), 'utf-8'),
        );

        packageJson.name = name;

        writeFileSync(
            join(path, 'package.json'),
            JSON.stringify(packageJson, null, 2),
        );
    }
}

async function main() {
    const name = await ensureName(args.values.name);
    const engine = await ensureEngine(args.values.engine);
    const targetDir = await ensureTargetDir(name, args.values.target);
    const templatePath = resolve(import.meta.dirname, '../templates', engine);
    const targetPath = resolve(process.cwd(), targetDir);

    if (!existsSync(templatePath)) {
        console.error(`Template for "${engine}" not found.`);
        process.exit(1);
    }

    await handleTargetDirectory(targetPath);

    copyRecursive(templatePath, targetPath);
    updateProjectName(targetPath, name);

    if (args.values.git) {
        execSync('git init');
    }

    log.success(`✅ Template "${engine}" copied to "${targetPath}"`);
}

main();
