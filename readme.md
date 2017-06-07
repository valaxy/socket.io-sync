[![devDependencies Status](https://david-dm.org/valaxy/socket.io-sync/dev-status.svg?style=flat-square)](https://david-dm.org/valaxy/socket.io-sync?type=dev)

## Server
First of all, you should put **siosync-server** to where all **siosync-push** and **siosync-pull** can access

At the server where **siosync-server** put

```bash
npm install --global siosync-server
```

Create a config file **siosync.js**

```js
module.exports = {
	host: '127.0.0.1',
	port: 12345 // any port you can use
}
```

Run it!

```bash
siosync-server
```

Check `siosync-server --help` for more detail


## Pull
**siosync-pull** is the end that pull file changes from **siosync-server** which actually from **siosync-push**

```bash
npm install --global siosync-pull
```

Create a config file **siosync.js**

```js
module.exports = {
    socketHost   : '127.0.0.1',  
    socketPort   : 12345,
    socketPath   : '/socket.io',  // optional
    room         : 'abc',         // a random string that must match siosync-push
    workplacePath: '/home/user/mywork/'
}
```

## Push
**siosync-push** is the end that push file changes to **siosync-server**

```bash
npm install --global siosync-push
```

Create a config file **siosync.js**


```js
module.exports = {
    socketHost: '127.0.0.1',
    socketPort: 12345,
    socketPath   : '/socket.io', // optional
    room      : 'abc',           // a random string that must match siosync-pull
    paths     : ['push/'],       // chokidar glob files to push
    ignored   : []               // optional
}
```
