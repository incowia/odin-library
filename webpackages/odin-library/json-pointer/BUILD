LAST BUILD: 0.6.0
URL: https://github.com/manuelstofer/json-pointer

BUILD STEPS:

npm install -g browserify
npm install -g uglify-js
git clone -b master https://github.com/manuelstofer/json-pointer.git
cd json-pointer
npm install
browserify index.js -s json-pointer -o bundle.js
uglifyjs bundle.js -c -m -o json-pointer.min.js