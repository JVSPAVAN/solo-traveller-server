const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const TripSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  destination: {
    type: String,
    required: true,
  },
  start_date: {
    type: Date,
  },
  end_date: {
    type: Date,
  },
  notes: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Encryption Hook: Before Save
TripSchema.pre('save', function(next) {
  if (this.isModified('destination') && this.destination) {
    this.destination = encrypt(this.destination);
  }
  if (this.isModified('notes') && this.notes) {
    this.notes = encrypt(this.notes);
  }
  next();
});

// Decryption Helper
// Mongoose doesn't have a direct "afterFind" for all queries easily.
// A common pattern is to define a method or helper, or use `post` hooks on `find`, `findOne`.
TripSchema.post(['find', 'findOne'], function(docs) {
  if (!docs) return;

  const decryptDoc = (doc) => {
    // If it's a plain object (lean), handle it, otherwise use direct property access
    if (doc.destination && doc.destination.includes(':')) {
      doc.destination = decrypt(doc.destination);
    }
    if (doc.notes && doc.notes.includes(':')) {
      doc.notes = decrypt(doc.notes);
    }
  };

  if (Array.isArray(docs)) {
    docs.forEach(decryptDoc);
  } else {
    decryptDoc(docs);
  }
});

TripSchema.post('save', function(doc) {
  if (doc.destination && doc.destination.includes(':')) {
    doc.destination = decrypt(doc.destination);
  }
  if (doc.notes && doc.notes.includes(':')) {
    doc.notes = decrypt(doc.notes);
  }
});

module.exports = mongoose.model('Trip', TripSchema);
