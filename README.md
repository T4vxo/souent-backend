# SE-app backend

## Prerequisites
nodejs & npm 

`git clone` in desired directory
`npm install`

## Structure

####  Cards
Upon creating a new enterprise it is assigned a number of BMC cards. Members may not add or delete BMC cards.

####  Members
Any contributor (member) may add or delete a member of their enterprise. It is not possible to update an existing member so instead one should instead delete the member and add a new one with correct information. Members may delete themselves from their enterprise.


###  Architecture
`index.ts` is the entry file for the backend app. All request handlers are in that file, e.g. a GET request with the path `/api/enterprises` to be handled by the file `/get/enterprises.ts` is declared as ``app.get(`${basePath}/enterprises`, require('./get/enterprises').default);``

For handling file upload requests, refer to the `multer` dependecy.