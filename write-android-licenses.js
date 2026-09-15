/**
 * write-android-licenses.js - Generates pre-accepted Google Android SDK licenses
 */

const fs = require('fs');
const path = require('path');

function setupLicenses(targetDir) {
  const licDir = path.join(targetDir, 'licenses');
  if (!fs.existsSync(licDir)) fs.mkdirSync(licDir, { recursive: true });

  const licenses = {
    'android-sdk-license': [
      '89336d0b9c77372466a3ee02770c2d32e90e0016',
      '24333f8a63b6825ea9c5514f83c2829b004d1fee',
      'd56f5187479451eabf01fb78af6dfcb131a6481e',
      'c79364a01930f31814eed5da41e44d30566f1637'
    ].join('\n'),
    'android-sdk-preview-license': '84831b9409646a918e30573bab4c9c91346d8abd\n',
    'android-googletv-license': '601085b94cd77f0b54ff8640695709915000ce0d\n',
    'google-gdk-license': '33b6a2b64922184158204e4548a2809b0234372d\n',
    'mips-android-sysimage-license': 'e9acab5b5fbb560a72cfaecce2346087313a61aa\n'
  };

  for (const [file, content] of Object.entries(licenses)) {
    fs.writeFileSync(path.join(licDir, file), content, 'utf8');
  }

  console.log(`Android SDK licenses pre-accepted in ${licDir}`);
}

const rootSdk = path.join(__dirname, 'android-sdk');
const userSdk = path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk');

setupLicenses(rootSdk);
if (fs.existsSync(userSdk)) setupLicenses(userSdk);
