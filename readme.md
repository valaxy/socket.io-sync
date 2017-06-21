[![devDependencies Status](https://david-dm.org/valaxy/socket.io-sync/dev-status.svg?style=flat-square)](https://david-dm.org/valaxy/socket.io-sync?type=dev)

**socket.io-sync** is a tool collection which help you push files to any places you may want them be by network and socket.io

## Server
First of all, you should put **siosync-server** to where all **siosync-push** and **siosync-pull** can access.
At the server where **siosync-server** placed in, run:

```bash
npm install --g siosync-server
```

Create a config file **siosync.js**

```js
module.exports = {
	host: '127.0.0.1',
	port: 12345 // any port you can use
}
```

Run it and keep it always running:

```bash
siosync-server
```

Check `siosync-server --help` for more detail


## Pull
Secondly, put **siosync-pull** to where you want files to be received.
To be precise, **siosync-pull** is the end that pull files from **siosync-server** which actually from **siosync-push**:

```bash
npm install -g siosync-pull
```

And create a config file **siosync.js**:

```js
module.exports = {
    socketHost   : '127.0.0.1',   // server host
    socketPort   : 12345,         // server port
    socketPath   : '/socket.io',  // optional, default is 「/socket.io」
    room         : 'abc',         // any string but must match siosync-push
    workplacePath: '/home/user/mywork/' // put files to where
    chmod        : 0o777,         // optional, chmod of file/dir, default is 777
}
```

Run it:

```bash
siosync-pull
```

Check `siosync-pull --help` for more detail

## Push
Thirdly, put **siosync-push** to where you want files to be sent to other places:

```bash
npm install -g siosync-push
```

Create a config file **siosync.js**:

```js
module.exports = {
    socketHost: '127.0.0.1',  // server host
    socketPort: 12345,        // server port
    socketPath: '/socket.io', // optional, default is 「/socket.io」
    room: 'abc',              // any string but must match siosync-pull
    paths: ['push/'],         // files/dirs to push, chokidar glob patterns
    workplacePath: '/home/project' // optional, workplace dir, default is cwd
    ignored: []                    // optional
}
```

Run it:

```bash
siosync-push
siosync-push --watch
siosync-push --watch --ignoreInitial
```

Check `siosync-push --help` for more detail
