import { access, readFile } from 'node:fs/promises';
import process from 'node:process';
import path from 'node:path';
import { URL, fileURLToPath } from 'node:url';
import ts from 'typescript';

const repo = fileURLToPath(new URL('../', import.meta.url));
const stages = new Set([
  'audio', 'sync', 'gameplay', 'receive', 'packet', 'localization',
  'ui-layout', 'ui-state', 'worldmap', 'final',
]);
const stringKinds = new Map([
  [ts.SyntaxKind.StringLiteral, 'string'],
  [ts.SyntaxKind.NoSubstitutionTemplateLiteral, 'string'],
  [ts.SyntaxKind.TemplateHead, 'template-head'],
  [ts.SyntaxKind.TemplateMiddle, 'template-middle'],
  [ts.SyntaxKind.TemplateTail, 'template-tail'],
]);
const retiredTransforms = [
  { module: './lastro-network-receive-recovery.mjs', imported: 'patchRuntimeNetworkFramingRecovery', local: 'patchRuntimeNetworkFramingRecovery', callOwner: 'patchV2Runtime' },
  { module: './lastro-network-receive-recovery.mjs', imported: 'patchRuntimeNetworkCloseDrain', local: 'patchRuntimeNetworkCloseDrain', callOwner: 'patchV2Runtime' },
  { module: './lastro-localization.mjs', imported: 'JOB_NAME_OVERRIDES', local: 'JOB_NAME_OVERRIDES', callOwner: 'patchV2Runtime' },
  { module: './lastro-localization.mjs', imported: 'MESSAGE_FALLBACKS', local: 'MESSAGE_FALLBACKS', callOwner: 'patchV2Runtime' },
  { module: './lastro-localization.mjs', imported: 'RUNTIME_TEXT_REPLACEMENTS', local: 'RUNTIME_TEXT_REPLACEMENTS', callOwner: 'patchV2Runtime' },
  { module: './lastro-localization.mjs', imported: 'patchRuntimeMapLocalization', local: 'patchRuntimeMapLocalization', callOwner: 'patchV2Runtime' },
  { module: './lastro-localization.mjs', imported: 'patchRuntimeStatusTooltips', local: 'patchRuntimeStatusTooltips', callOwner: 'patchV2Runtime' },
  { module: './lastro-localization.mjs', imported: 'assertRuntimeLocalizationMount', local: 'assertRuntimeLocalizationMount', callOwner: 'patchV2Runtime' },
  { module: './lastro-skill-localization.mjs', imported: 'SKILL_DESCRIPTION_OVERRIDES', local: 'SKILL_DESCRIPTION_OVERRIDES', callOwner: 'patchV2Runtime' },
  { module: './lastro-skill-localization.mjs', imported: 'SKILL_NAME_OVERRIDES', local: 'SKILL_NAME_OVERRIDES', callOwner: 'patchV2Runtime' },
  { module: './lastro-npc-dialog-buttons.mjs', imported: 'patchRuntimeNpcDialogButtons', local: 'patchRuntimeNpcDialogButtons', callOwner: 'patchV2Runtime' },
  { module: './lastro-vending-movement.mjs', imported: 'patchRuntimeVendingMovement', local: 'patchRuntimeVendingMovement', callOwner: 'patchV2Runtime' },
  { module: './lastro-shop-titles.mjs', imported: 'patchRuntimeShopTitles', local: 'patchRuntimeShopTitles', callOwner: 'patchV2Runtime' },
  { module: './lastro-monster-hover-hp.mjs', imported: 'patchRuntimeMonsterHoverHp', local: 'patchRuntimeMonsterHoverHp', callOwner: 'patchV2Runtime' },
  { module: './lastro-frame-timing.mjs', imported: 'patchRuntimeFrameTiming', local: 'patchRuntimeFrameTiming', callOwner: 'patchV2Runtime' },
  { module: './lastro-audio-timing.mjs', imported: 'patchRuntimeAudioTiming', local: 'patchRuntimeAudioTiming', callOwner: 'patchV2Runtime' },
  { module: './lastro-entity-sync.mjs', imported: 'patchRuntimeEntitySync', local: 'patchRuntimeEntitySync', callOwner: 'patchV2Runtime' },
  { module: './lastro-equipment-animation.mjs', imported: 'patchRuntimeEquipmentAnimation', local: 'patchRuntimeEquipmentAnimation', callOwner: 'patchV2Runtime' },
  { module: './lastro-equipment-cart.mjs', imported: 'patchRuntimeEquipmentCart', local: 'patchRuntimeEquipmentCart', callOwner: 'patchV2Runtime' },
  { module: './lastro-manual-skill.mjs', imported: 'patchRuntimeManualSkill', local: 'patchRuntimeManualSkill', callOwner: 'patchV2Runtime' },
  { module: './lastro-skill-cooldown.mjs', imported: 'patchRuntimeSkillCooldown', local: 'patchRuntimeSkillCooldown', callOwner: 'patchV2Runtime' },
  { module: './lastro-weapon-view-fallback.mjs', imported: 'patchRuntimeWeaponViewFallback', local: 'patchRuntimeWeaponViewFallback', callOwner: 'patchV2Runtime' },
  { module: './lastro-movement-input.mjs', imported: 'patchRuntimeMovementInput', local: 'patchRuntimeMovementInput', callOwner: 'patchV2Runtime' },
  { module: './lastro-movement-sync.mjs', imported: 'patchRuntimeMovementSync', local: 'patchRuntimeMovementSync', callOwner: 'patchV2Runtime' },
  { module: './lastro-mail.mjs', imported: 'patchRuntimeMail', local: 'patchRuntimeMail', callOwner: 'patchV2Runtime' },
  { module: './lastro-ui-text.mjs', imported: 'patchRuntimeUiText', local: 'patchRuntimeUiText', callOwner: 'patchV2Runtime' },
  { module: './lastro-ui-messages.mjs', imported: 'patchRuntimeUiMessages', local: 'patchRuntimeUiMessages', callOwner: 'patchV2Runtime' },
  { module: './lastro-ui-layout.mjs', imported: 'patchRuntimeUiLayout', local: 'patchScopedUiLayout', callOwner: 'patchV2Runtime' },
  { module: './lastro-ui-state.mjs', imported: 'patchRuntimeUiState', local: 'patchRuntimeUiState', callOwner: 'patchV2Runtime' },
  { module: './lastro-store-scroll.mjs', imported: 'patchRuntimeStoreScroll', local: 'patchRuntimeStoreScroll', callOwner: 'patchV2Runtime' },
  { module: './lastro-storage-count.mjs', imported: 'patchRuntimeStorageCount', local: 'patchRuntimeStorageCount', callOwner: 'patchV2Runtime' },
  { module: './lastro-ui-input.mjs', imported: 'patchRuntimeUiInput', local: 'patchRuntimeUiInput', callOwner: 'patchV2Runtime' },
  { module: './lastro-emoticons.mjs', imported: 'patchRuntimeEmoticons', local: 'patchRuntimeEmoticons', callOwner: 'patchV2Runtime' },
  { module: './lastro-item-drag.mjs', imported: 'patchRuntimeItemDrag', local: 'patchRuntimeItemDrag', callOwner: 'patchV2Runtime' },
  { module: './lastro-item-name.mjs', imported: 'patchRuntimeItemName', local: 'patchRuntimeItemName', callOwner: 'patchV2Runtime' },
  { module: './lastro-party-state.mjs', imported: 'patchRuntimePartyState', local: 'patchRuntimePartyState', callOwner: 'patchV2Runtime' },
  { module: './lastro-typography.mjs', imported: 'patchRuntimeTypography', local: 'patchRuntimeTypography', callOwner: 'patchV2Runtime' },
  { module: './lastro-dialog-typography.mjs', imported: 'patchRuntimeDialogTypography', local: 'patchRuntimeDialogTypography', callOwner: 'patchV2Runtime' },
  { module: './lastro-navigation-ui.mjs', imported: 'patchRuntimeNavigationUi', local: 'patchRuntimeNavigationUi', callOwner: 'patchV2Runtime' },
  { module: './lastro-basic-info.mjs', imported: 'patchRuntimeBasicInfoLayout', local: 'patchRuntimeBasicInfoLayout', callOwner: 'patchV2Runtime' },
];

function parseSource(source, fileName) {
  return ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
}

function diagnosticsFor(fileName, file) {
  return file.parseDiagnostics.map(diagnostic => {
    const position = file.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ');
    return `${fileName}:${position.line + 1}:${position.character + 1}: ${message}`;
  });
}

function visit(node, callback) {
  callback(node);
  ts.forEachChild(node, child => visit(child, callback));
}

function importedBindings(declaration) {
  const clause = declaration.importClause;
  if (!clause) return [];
  const result = [];
  if (clause.name) result.push({ imported: 'default', local: clause.name.text });
  if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
    result.push({ imported: '*', local: clause.namedBindings.name.text });
  } else if (clause.namedBindings) {
    for (const element of clause.namedBindings.elements) {
      result.push({ imported: element.propertyName?.text ?? element.name.text, local: element.name.text });
    }
  }
  return result;
}

function topLevelDefinitions(file) {
  const definitions = new Map();
  const add = (name, kind) => definitions.set(name, [...(definitions.get(name) ?? []), kind]);
  for (const statement of file.statements) {
    if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) && statement.name) {
      add(statement.name.text, ts.isFunctionDeclaration(statement) ? 'function' : 'class');
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) add(declaration.name.text, 'variable');
      }
    } else if (ts.isExpressionStatement(statement)
      && ts.isBinaryExpression(statement.expression)
      && statement.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken
      && ts.isIdentifier(statement.expression.left)) {
      add(statement.expression.left.text, 'assignment');
    } else if (ts.isExportDeclaration(statement) && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) {
        add(element.name.text, 'export');
      }
    }
  }
  return definitions;
}

function topLevelTemplateDefinitions(file) {
  const definitions = new Map();
  const add = (name, kind) => definitions.set(name, [...(definitions.get(name) ?? []), kind]);
  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      const initializer = declaration.initializer;
      if (!initializer || !ts.isTemplateExpression(initializer)) continue;
      const generated = parseSource(initializer.head.text, 'patcher-prefix.js');
      for (const [name, kinds] of topLevelDefinitions(generated)) {
        for (const kind of kinds) add(name, `template-${kind}`);
      }
    }
  }
  return definitions;
}

function callsInOwner(file, ownerName, localName) {
  const owners = file.statements.filter(statement =>
    ts.isFunctionDeclaration(statement) && statement.name?.text === ownerName);
  if (owners.length !== 1) return { count: 0, ownerCount: owners.length };
  let count = 0;
  visit(owners[0], node => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === localName) count++;
  });
  return { count, ownerCount: owners.length };
}

function containsMigrationToolReference(file) {
  let found;
  visit(file, node => {
    if (found || !ts.isStringLiteralLike(node)) return;
    if (node.text.includes('migrate-runtime-core') || node.text.includes('check-runtime-consolidation')) {
      found = node.text;
    }
  });
  return found;
}

/** Audit permanent bundle ownership and retired build-time transform boundaries. */
export function auditCoreOwnership({ vendorSource, patcherSource, prepareSource, retiredTransforms, retiredHostExports }) {
  const diagnostics = [];
  const vendor = parseSource(vendorSource, 'vendor/v2/Online.js');
  const patcher = parseSource(patcherSource, 'scripts/patch-v2-runtime.mjs');
  const prepare = parseSource(prepareSource, 'scripts/prepare-runtime.mjs');
  diagnostics.push(...diagnosticsFor('vendor/v2/Online.js', vendor));
  diagnostics.push(...diagnosticsFor('scripts/patch-v2-runtime.mjs', patcher));
  diagnostics.push(...diagnosticsFor('scripts/prepare-runtime.mjs', prepare));

  const vendorDefinitions = topLevelDefinitions(vendor);
  const patcherDefinitions = topLevelDefinitions(patcher);
  const generatedDefinitions = topLevelTemplateDefinitions(patcher);
  for (const name of retiredHostExports) {
    const permanentCount = vendorDefinitions.get(name)?.length ?? 0;
    if (permanentCount !== 1) {
      diagnostics.push(`permanent definition ${name}: expected exactly one top-level vendor definition; found ${permanentCount}`);
    }
    const hostCount = (patcherDefinitions.get(name)?.length ?? 0) + (generatedDefinitions.get(name)?.length ?? 0);
    if (hostCount > 0) {
      diagnostics.push(`retired host export ${name}: found ${hostCount} top-level patcher definition(s)`);
    }
  }

  for (const retired of retiredTransforms) {
    const expectedModule = retired.module;
    const namedImports = [];
    const namespaceImports = [];
    let sideEffectImport = false;
    for (const statement of patcher.statements) {
      if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)
        && statement.moduleSpecifier.text === expectedModule) {
        const bindings = importedBindings(statement);
        if (bindings.length === 0) sideEffectImport = true;
        namespaceImports.push(...bindings.filter(binding => binding.imported === '*'));
        namedImports.push(...bindings.filter(binding => binding.imported === retired.imported));
      }
    }
    if (sideEffectImport) diagnostics.push(`retired side-effect import ${expectedModule} remains`);
    for (const binding of namespaceImports) {
      diagnostics.push(`retired namespace import ${expectedModule}#${retired.imported} through ${binding.local} remains`);
    }
    visit(patcher, node => {
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword
        && node.arguments.length >= 1 && ts.isStringLiteralLike(node.arguments[0])
        && node.arguments[0].text === expectedModule) {
        diagnostics.push(`retired dynamic import ${expectedModule} remains`);
      }
    });
    for (const binding of namedImports) {
      diagnostics.push(`retired import ${expectedModule}#${retired.imported} as ${binding.local} remains`);
      if (binding.local !== retired.local) {
        diagnostics.push(`retired import binding changed: expected local ${retired.local}, found ${binding.local}`);
      }
    }

    const aliases = new Set([retired.local, ...namedImports.map(binding => binding.local)]);
    for (const alias of aliases) {
      const calls = callsInOwner(patcher, retired.callOwner, alias);
      if (calls.ownerCount !== 1) {
        diagnostics.push(`retired call owner ${retired.callOwner}: expected exactly one top-level function; found ${calls.ownerCount}`);
      } else if (calls.count > 0) {
        diagnostics.push(`retired call ${alias} in ${retired.callOwner}: found ${calls.count}`);
      }
    }
  }

  const forbiddenPrepareReference = containsMigrationToolReference(prepare);
  if (forbiddenPrepareReference) {
    diagnostics.push(`prepare references migration tooling: ${forbiddenPrepareReference}`);
  }
  return diagnostics;
}

function statementOwner(statement, file, index) {
  if (ts.isFunctionDeclaration(statement)) return `function:${statement.name?.text ?? `<anonymous-${index}>`}`;
  if (ts.isClassDeclaration(statement)) return `class:${statement.name?.text ?? `<anonymous-${index}>`}`;
  if (ts.isVariableStatement(statement)) {
    const names = statement.declarationList.declarations.map(declaration => declaration.name.getText(file));
    return `variable:${names.join(',') || index}`;
  }
  if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
    return `import:${statement.moduleSpecifier.text}`;
  }
  if (ts.isExpressionStatement(statement)) {
    const expression = statement.expression;
    if (ts.isBinaryExpression(expression) && expression.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      return `assignment:${expression.left.getText(file)}`;
    }
    if (ts.isCallExpression(expression)) return `call:${expression.expression.getText(file)}`;
  }
  if (ts.isExportDeclaration(statement)) return 'export-declaration';
  return `statement:${ts.SyntaxKind[statement.kind]}:${index}`;
}

function tokenizeStatement(statement, file, owner) {
  const text = statement.getText(file);
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.Standard, text);
  const tokens = [];
  for (let kind = scanner.scan(); kind !== ts.SyntaxKind.EndOfFileToken; kind = scanner.scan()) {
    const value = stringKinds.has(kind) ? scanner.getTokenValue() ?? '' : scanner.getTokenText();
    tokens.push({ kind: stringKinds.get(kind) ?? ts.SyntaxKind[kind] ?? String(kind), value, owner });
  }
  return tokens;
}

function keyedStatements(file) {
  const occurrences = new Map();
  return file.statements.map((statement, index) => {
    const baseOwner = statementOwner(statement, file, index);
    const occurrence = (occurrences.get(baseOwner) ?? 0) + 1;
    occurrences.set(baseOwner, occurrence);
    const owner = occurrence === 1 ? baseOwner : `${baseOwner}#${occurrence}`;
    return { owner, tokens: tokenizeStatement(statement, file, owner) };
  });
}

function displayToken(token) {
  if (!token) return '<end>';
  if (token.kind === 'string' || token.kind.startsWith('template-')) {
    const value = token.value.length > 120 ? `${token.value.slice(0, 120)}… (${token.value.length} chars)` : token.value;
    return `${token.kind} ${JSON.stringify(value)}`;
  }
  return `${token.kind} ${JSON.stringify(token.value)}`;
}

function compareOwnerTokens(before, after, owner) {
  let prefix = 0;
  while (prefix < before.length && prefix < after.length
    && before[prefix].kind === after[prefix].kind && before[prefix].value === after[prefix].value) prefix++;
  if (prefix === before.length && prefix === after.length) return null;

  let suffix = 0;
  while (suffix < before.length - prefix && suffix < after.length - prefix
    && before[before.length - 1 - suffix].kind === after[after.length - 1 - suffix].kind
    && before[before.length - 1 - suffix].value === after[after.length - 1 - suffix].value) suffix++;
  const changedBefore = before.slice(prefix, before.length - suffix);
  const changedAfter = after.slice(prefix, after.length - suffix);
  const isSingleLiteral = changedBefore.length === 1 && changedAfter.length === 1
    && (changedBefore[0].kind === 'string' || changedBefore[0].kind.startsWith('template-'))
    && (changedAfter[0].kind === 'string' || changedAfter[0].kind.startsWith('template-'));
  const beforeText = changedBefore.slice(0, 8).map(displayToken).join(', ');
  const afterText = changedAfter.slice(0, 8).map(displayToken).join(', ');
  const beforeTail = changedBefore.length > 8 ? `, … (${changedBefore.length} tokens)` : '';
  const afterTail = changedAfter.length > 8 ? `, … (${changedAfter.length} tokens)` : '';
  return {
    owner,
    kind: isSingleLiteral ? 'literal' : 'token-range',
    detail: `token range ${prefix}: before [${beforeText}${beforeTail}], after [${afterText}${afterTail}]`,
  };
}

/** Compare runtime sources without region-wide allowances; strings use decoded values. */
export function compareRuntimeSources(before, after, options) {
  if (!options || !stages.has(options.stage)) {
    throw new Error(`Unknown runtime comparison stage: ${options?.stage ?? '<missing>'}`);
  }
  const beforeFile = parseSource(before, 'before.js');
  const afterFile = parseSource(after, 'after.js');
  const differences = [
    ...diagnosticsFor('before.js', beforeFile).map(detail => ({ owner: 'source:before', kind: 'parse', detail })),
    ...diagnosticsFor('after.js', afterFile).map(detail => ({ owner: 'source:after', kind: 'parse', detail })),
  ];
  if (differences.length) return { equal: false, differences };

  const beforeStatements = keyedStatements(beforeFile);
  const afterStatements = keyedStatements(afterFile);
  const beforeByOwner = new Map(beforeStatements.map(statement => [statement.owner, statement]));
  const afterByOwner = new Map(afterStatements.map(statement => [statement.owner, statement]));
  const common = new Set([...beforeByOwner.keys()].filter(owner => afterByOwner.has(owner)));
  const beforeOrder = beforeStatements.map(statement => statement.owner).filter(owner => common.has(owner));
  const afterOrder = afterStatements.map(statement => statement.owner).filter(owner => common.has(owner));
  if (beforeOrder.some((owner, index) => owner !== afterOrder[index])) {
    differences.push({
      owner: 'source-file order',
      kind: 'owner-order',
      detail: `common top-level owners moved: before [${beforeOrder.join(', ')}], after [${afterOrder.join(', ')}]`,
    });
  }

  for (const statement of beforeStatements) {
    if (!afterByOwner.has(statement.owner)) {
      differences.push({ owner: statement.owner, kind: 'removed-owner', detail: 'top-level AST owner is absent after the change' });
      continue;
    }
    const afterStatement = afterByOwner.get(statement.owner);
    const difference = compareOwnerTokens(statement.tokens, afterStatement.tokens, statement.owner);
    if (difference) differences.push(difference);
  }
  for (const statement of afterStatements) {
    if (!beforeByOwner.has(statement.owner)) {
      differences.push({ owner: statement.owner, kind: 'added-owner', detail: 'new top-level AST owner was added' });
    }
  }
  return { equal: differences.length === 0, differences };
}

function parseArguments(args) {
  const values = new Map();
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    if (flag === '--check-final') {
      if (values.has(flag)) throw new Error('Duplicate --check-final');
      values.set(flag, true);
      continue;
    }
    if (!['--baseline', '--candidate', '--stage'].includes(flag)) throw new Error(`Unknown or unsupported flag: ${flag}`);
    const value = args[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}`);
    if (values.has(flag)) throw new Error(`Duplicate ${flag}`);
    values.set(flag, value);
    index++;
  }
  return values;
}

async function cli(args) {
  const values = parseArguments(args);
  if (values.has('--check-final')) {
    if (values.size !== 1) throw new Error('--check-final cannot be combined with comparison flags');
    const [vendorSource, patcherSource, prepareSource] = await Promise.all([
      readFile(path.join(repo, 'vendor/v2/Online.js'), 'utf8'),
      readFile(path.join(repo, 'scripts/patch-v2-runtime.mjs'), 'utf8'),
      readFile(path.join(repo, 'scripts/prepare-runtime.mjs'), 'utf8'),
    ]);
    const diagnostics = auditCoreOwnership({
      vendorSource, patcherSource, prepareSource, retiredTransforms, retiredHostExports: [],
    });
    for (const module of new Set(retiredTransforms.map(transform => transform.module))) {
      const modulePath = path.resolve(repo, 'scripts', module);
      const scriptsRoot = `${path.resolve(repo, 'scripts')}${path.sep}`;
      if (!modulePath.startsWith(scriptsRoot)) throw new Error(`Retired module escaped scripts/: ${module}`);
      try {
        await access(modulePath);
        diagnostics.push(`retired module remains: ${path.relative(repo, modulePath)}`);
      } catch (error) {
        if (error?.code !== 'ENOENT') throw error;
      }
    }
    process.stdout.write(`${JSON.stringify({ ok: diagnostics.length === 0, retiredTransforms: retiredTransforms.length, diagnostics }, null, 2)}\n`);
    if (diagnostics.length) process.exitCode = 1;
    return;
  }

  const baselinePath = values.get('--baseline');
  const candidatePath = values.get('--candidate');
  const stage = values.get('--stage');
  if (values.size !== 3 || typeof baselinePath !== 'string' || typeof candidatePath !== 'string' || typeof stage !== 'string') {
    throw new Error('Usage: --baseline <absolute-file> --candidate <absolute-file> --stage <stage> | --check-final');
  }
  if (!path.isAbsolute(baselinePath) || !path.isAbsolute(candidatePath)) {
    throw new Error('--baseline and --candidate must be absolute paths');
  }
  const [before, after] = await Promise.all([
    readFile(baselinePath, 'utf8'),
    readFile(candidatePath, 'utf8'),
  ]);
  const comparison = compareRuntimeSources(before, after, { stage });
  process.stdout.write(`${JSON.stringify({ stage, ...comparison }, null, 2)}\n`);
  if (!comparison.equal) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  cli(process.argv.slice(2)).catch(error => {
    process.stderr.write(`${error?.message ?? error}\n`);
    process.exitCode = 1;
  });
}
