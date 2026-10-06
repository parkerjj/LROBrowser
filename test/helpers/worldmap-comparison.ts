import ts from 'typescript';
import { extractVendorRegion, getRuntimeSourceFile } from './vendor-runtime';

/** Derive a compact comparison contract from the actual prepared runtime. */
export function buildWorldMapComparisonPair(runtime: string) {
  const file = getRuntimeSourceFile(runtime);
  const declarations = new Map<string, ts.VariableDeclaration>();
  const functions = new Map<string, ts.FunctionDeclaration>();
  function visit(node: ts.Node) {
    if (ts.isVariableDeclaration(node)) declarations.set(node.name.getText(file), node);
    if (ts.isFunctionDeclaration(node) && node.name) functions.set(node.name.text, node);
    ts.forEachChild(node, visit);
  }
  visit(file);
  const resolver = functions.get('resolveLastroMapResourceName')!.getText(file);
  const diagnostic = functions.get('describeLastroMapLoadFailure')!.getText(file);
  const completion = functions.get('onMapComplete')!.getText(file);
  const initializer = declarations.get('init_WorldMap')!.initializer as ts.CallExpression;
  const body = (initializer.arguments[0] as ts.ArrowFunction).body as ts.Block;
  const statements = body.statements;
  if (statements.length !== 22) throw new Error('Expected actual product WorldMap statements');
  const installer = (statements[19] as ts.ExpressionStatement).expression as ts.CallExpression;
  const deps = installer.arguments[1] as ts.ObjectLiteralExpression;
  const assignment = (statements[17] as ts.ExpressionStatement).expression as ts.CallExpression;
  const actions = assignment.arguments[1] as ts.ObjectLiteralExpression;
  const oldDeps = '{' + [...deps.properties.slice(0, 7), ...actions.properties].map(node => node.getText(file)).join(',') + ',}';
  const oldInstaller = runtime.slice(installer.getStart(file), deps.getStart(file)) + oldDeps + runtime.slice(deps.end, installer.end) + ';';
  const oldBody = '{' + [...statements.slice(0, 12), statements[14]!, statements[15]!, statements[12]!, statements[16]!, statements[18]!].map(node => node.getText(file)).join('\n')
    + '\n' + oldInstaller + '\n' + statements[20]!.getText(file) + '\n' + statements[21]!.getText(file) + '}';
  const region = extractVendorRegion('src/UI/Components/WorldMap/WorldMap.js', runtime);
  const oldRegion = region.replace(body.getText(file), oldBody);
  const loaders = ['lastroNpcMapPreflight', 'lastroAchievementMapPreflight', 'lastroRoutePreflight'].map(name => {
    const call = declarations.get(name)!.initializer as ts.CallExpression;
    const props = call.arguments[0] as ts.ObjectLiteralExpression;
    const loadFile = props.properties.find(node => node.name?.getText(file) === 'loadFile') as ts.PropertyAssignment;
    return `const ${name} = { loadFile: ${loadFile.initializer.getText(file)} };`;
  }).join('\n');
  const imports = file.statements.filter(ts.isImportDeclaration).slice(0, 3).map(node => node.getText(file)).join('\n');
  const inline = (source: string) => source.replaceAll('resolveLastroMapResourceName(filename, DB.mapalias)', `(${resolver})(filename, DB.mapalias)`);
  return {
    before: [imports, diagnostic, inline(oldRegion), inline(loaders), completion].join('\n'),
    after: [imports, region, loaders, resolver, diagnostic, completion].join('\n'),
  };
}

export function mutateNpcResolverLoader(source: string, insertion: string, suffix = '') {
  const file = ts.createSourceFile('loader.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  let loader: ts.ArrowFunction | undefined;
  function visit(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(file) === 'lastroNpcMapPreflight') {
      const props = node.initializer as ts.ObjectLiteralExpression;
      loader = (props.properties.find(prop => prop.name?.getText(file) === 'loadFile') as ts.PropertyAssignment).initializer as ts.ArrowFunction;
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  let statement: ts.VariableStatement | undefined;
  function findResolved(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(file) === 'resolvedFilename') statement = node.parent.parent as ts.VariableStatement;
    ts.forEachChild(node, findResolved);
  }
  findResolved(loader!);
  const position = statement!.getStart(file);
  return source.slice(0, position) + insertion + '\n' + source.slice(position, statement!.end) + suffix + source.slice(statement!.end);
}
