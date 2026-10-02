const fs = require('fs');

let file = fs.readFileSync('backend/models/Campaign.js', 'utf8');

file = file.replace(
`  status: {
    type: String,
    enum: ['draft', 'analyzing', 'generating', 'review', 'transforming', 'completed', 'failed'],
    default: 'draft'
  },`,
`  status: {
    type: String,
    enum: ['draft', 'analyzing', 'generating', 'review', 'transforming', 'completed', 'failed'],
    default: 'draft'
  },
  errorMessage: {
    type: String
  },`
);

fs.writeFileSync('backend/models/Campaign.js', file);
console.log('Added errorMessage to Campaign model');
