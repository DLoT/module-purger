[![License](https://img.shields.io/badge/License-BSD%203--Clause-green.svg)]()

# Module Purger

This package is meant to be used to slim down a node application significantly.

## 🛠 How It Works (Under the Hood)

Module-purger will start your application while intercepting each required (CJS) or imported (ESM) file.
Then only these files are copied over to new folder ready to be deployed.

## 📦 Installation

```bash
npm install module-purger
```

## 📋 Requirements

**Node.js** `>=18.19.0 or >=20.6.0`

> **Note:** Node.js v16 and older are no longer supported due to their lack of ESM loader capabilities.
>
> CJS should work though.

## 💻 Usage

### CLI

You can use the included cli to purge your node modules

```shell
# Show help
purge-node-modules --help

# ESM example
purge-node-modules --isEsm --targetPath target/folder --rootPath ${PWD} -entrypoint ${PWD}/some/folder/index.mjs

# CJS example
purge-node-modules --targetPath target/folder --rootPath ${PWD} --entrypoint ${PWD}/folder/entrypoint/index.cjs
```

### Within node

You also can run the purger within node

```javascript
import purge from 'module-purger';

const options = {
  rootPath:   path.join(dirname),
  entrypoint: 'entrypoint',
  targetPath: path.join(dirname, 'entrypoint.js'),
  isEsm:      true,
};

await purge(options);
```

## 🤝 Contributing

1. Fork it
2. Create your feature branch (`git checkout -b feature/cool-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/cool-feature`)
5. Create a new Pull Request

## License

BSD 3-Clause. Please see [License File](LICENSE) for more information.
