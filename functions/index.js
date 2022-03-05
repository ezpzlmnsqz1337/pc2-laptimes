// const functions = require('firebase-functions');
// // The Firebase Admin SDK to access Firestore.
// const admin = require('firebase-admin');
// admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

// exports.makeUppercase = functions.firestore
//     .document('/times/{timeId}')
//     .onCreate((snap, context) => {
//     // Grab the current value of what was written to Firestore.
//       const timeId = snap.data().uid;


//       // Access the parameter `{documentId}` with `context.params`
//       functions.logger.log('Uppercasing', context.params.timeId, timeId);

//       // You must return a Promise when performing asynchronous tasks inside
//       // a Functions such as writing to Firestore.
//       // Setting an 'uppercase' field in Firestore document returns a Promise.
//       return admin.firestore().collection('messages')
//           .add({timeId: timeId});
//       // snap.ref.set({uppercase}, {merge: true});
//     });
