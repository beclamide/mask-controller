var noble = require('@abandonware/noble');
const textEffects = require('./codes').textEffects;

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let connected = false;

noble.on('stateChange', async (state) => {
  console.log('state change', state);

  if (state === 'poweredOn') {
    console.log('scanning');
    await noble.startScanningAsync();
  }
});

noble.on('discover', async (peripheral) => {

  const { localName } = peripheral.advertisement;

  if (localName != 'MASK-02A711' || connected) return;

  noble.stopScanning();

  console.log('Found Mask', localName);
  
  peripheral.connect(err => {
    peripheral.discoverAllServicesAndCharacteristics(async (err, services, characteristics) => {
      console.log(services, characteristics);

      await waitUserInput(characteristics);
      rl.close();
    })
  });  

});

function waitUserInput(characteristics) {
  return new Promise(resolve => rl.question('Press a key', async (ans) => {
    console.log(ans);
    
    if (ans == 'x') resolve();

    await changeTextEffect(characteristics);
    // await changeFace(characteristics);

    await waitUserInput(characteristics);
  }))
}

async function changeTextEffect(characteristics) {
  const i = Math.floor(Math.random() * textEffects.length);

  await new Promise((resolve, reject) => {
    characteristics[0].write(Buffer.from(removeSpaces(textEffects[i]), 'hex'), true, err => {
      if (err) reject(err);
      resolve();
    });
  });
}

async function changeFace(characteristics) {
  lightValues.forEach(async (value) => {
      await new Promise((resolve, reject) => {
        characteristics[0].write(Buffer.from(removeSpaces(value), 'hex'), true, err => {
          if (err) reject(err);
          console.log(value)
          resolve();
        });
      });
    });

    await new Promise((resolve, reject) => {
      characteristics[0].write(Buffer.from(removeSpaces(finalLightValue), 'hex'), true, err => {
        if (err) reject(err);
        console.log(finalLightValue)
        resolve();
      });
    });


    otherValues.forEach(async (value) => {
      await new Promise((resolve, reject) => {
        characteristics[0].write(Buffer.from(removeSpaces(value), 'hex'), true, err => {
          if (err) reject(err);
          console.log(value)
          resolve();
        });
      });
    });

    await new Promise((resolve, reject) => {
      characteristics[0].write(Buffer.from(removeSpaces(finalOtherValue), 'hex'), true, err => {
        if (err) reject(err);
        console.log(finalOtherValue)
        resolve();
      });
    });
}

function removeSpaces(str) {
  return str.replace(/\s/g, '');
}

async function connect() {
  console.log('scanning');
  await noble.startScanningAsync();
}

async function disconnect() {
  if (connected) {
    await device.disconnectAsync();
    connected = false;
  }

  process.exit(0);
}

//catches ctrl+c event
process.on('SIGINT', disconnect.bind(null, {exit:true}));