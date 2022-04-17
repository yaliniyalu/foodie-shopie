/**
 * To Fix a bug in firebasex plugin
 * https://github.com/ionic-team/capacitor/issues/3376#issuecomment-704938840
 * */

const fs = require('fs')

const file = './node_modules/cordova-plugin-firebasex/src/android/build.gradle'

const data = fs.readFileSync(file)
const array = data.toString().split("\n");

array[10 - 1] = '//' + array[10 - 1] // line number 10 but array index starts from 0

for (let i = 20; i <= 36; i++) {
  array[i - 1] = '//' + array[i - 1]
}

fs.writeFileSync(file, array.join('\n'));
