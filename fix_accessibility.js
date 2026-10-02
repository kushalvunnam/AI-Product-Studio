const fs = require('fs');

// Layout.jsx
let layout = fs.readFileSync('frontend/src/components/Layout.jsx', 'utf8');
layout = layout.replace(
  '<Navbar setMobileMenuOpen={setMobileMenuOpen} />',
  '<Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />'
);
fs.writeFileSync('frontend/src/components/Layout.jsx', layout);

// Navbar.jsx
let navbar = fs.readFileSync('frontend/src/components/Navbar.jsx', 'utf8');
navbar = navbar.replace(
  'const Navbar = ({ setMobileMenuOpen }) => {',
  'const Navbar = ({ mobileMenuOpen, setMobileMenuOpen }) => {'
);
navbar = navbar.replace(
  'aria-expanded="false"',
  'aria-expanded={mobileMenuOpen}'
);
navbar = navbar.replace(
  'aria-label="Open navigation"',
  'aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}'
);
navbar = navbar.replace(
  'onClick={() => setMobileMenuOpen(true)}',
  'onClick={() => setMobileMenuOpen(!mobileMenuOpen)}'
);
fs.writeFileSync('frontend/src/components/Navbar.jsx', navbar);

// Sidebar.jsx
let sidebar = fs.readFileSync('frontend/src/components/Sidebar.jsx', 'utf8');
sidebar = sidebar.replace(
  'aria-label="Close navigation"',
  'aria-label="Close navigation" aria-expanded={mobileMenuOpen}'
);
fs.writeFileSync('frontend/src/components/Sidebar.jsx', sidebar);

console.log('Fixed accessibility.');
