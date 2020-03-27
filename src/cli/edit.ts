import { spawn } from 'child_process';
import chokidar from 'chokidar';
import { buildArguments } from './runJest';
import { createServer, AddressInfo } from 'net';
import { loadConfig } from '../config';

const server = createServer((socket) => {
  socket.on('data', (data) => {
    console.log(data.toString());
  });

  socket.write('SERVER: Hello! This is server speaking.<br>');
  socket.end('SERVER: Closing connection now.<br>');
}).on('error', (err) => {
  console.error(err);
});

const startTest = (address: any) => {
  const config = loadConfig();

  const args = buildArguments({
    args: [],
    // browsers,
    config: config.config,
    repl: true,
    rootDir: config.rootDir,
    testTimeout: config.testTimeout,
  });

  const child = spawn(
    'npx',
    [
      'qawolf',
      'test',
      ...args,
      '/Users/jon/dev/qawolf/test/.qawolf/edit.test.js',
    ],
    {
      env: {
        EDIT_PORT: `${address.port}`,
        //   // ...env,
        //   // override env with process.env
        //   // ex. for unit tests we want QAW_BROWSER to override cli one
        ...process.env,
      },
      stdio: 'inherit',
    },
  );

  child.on('error', function (error) {
    console.log('child process error with', error);
  });

  child.on('exit', function (code, signal) {
    console.log(
      'child process exited with ' + `code ${code} and signal ${signal}`,
    );
  });

  return child;
};

(async () => {
  await new Promise((resolve) => server.listen(0, () => resolve()));

  const address = server.address() as AddressInfo;
  console.log('address', address, 'port', address.port);

  const watcher = chokidar.watch(__filename, {
    atomic: 0,
    persistent: true,
  });

  watcher.on('change', () => {
    console.log('START TEST', Date.now());

    startTest(address);

    // resolve();
  });
})();
